<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\OrganizationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Exception\ApiErrorException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/billing')]
class BillingController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private OrganizationRepository $organizationRepository,
        private string $stripeSecretKey,
        private string $frontendUrl
    ) {
        Stripe::setApiKey($this->stripeSecretKey);
    }

    #[Route('/connect/create', name: 'billing_connect_create', methods: ['POST'])]
    public function createConnectAccount(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $organization = $user->getOrganization();

        // Check if account already exists
        if ($organization->getStripeAccountId()) {
            return $this->json(['message' => 'Stripe účet již existuje'], 400);
        }

        try {
            // Create Stripe Express account
            $account = Account::create([
                'type' => 'express',
                'country' => 'CZ',
                'business_type' => 'individual',
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
                'metadata' => [
                    'organization_id' => $organization->getId(),
                    'organization_name' => $organization->getName()
                ]
            ]);

            // Update organization with account ID
            $organization->setStripeAccountId($account->id);
            $this->entityManager->flush();

            // Create account link for onboarding
            $accountLink = AccountLink::create([
                'account' => $account->id,
                'return_url' => $this->frontendUrl . '/app/billing/connect/success',
                'refresh_url' => $this->frontendUrl . '/app/billing/connect/refresh',
                'type' => 'account_onboarding',
            ]);

            return $this->json(['url' => $accountLink->url]);
        } catch (ApiErrorException $e) {
            return $this->json(['message' => 'Chyba při vytváření Stripe účtu: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Chyba při vytváření Stripe účtu'], 500);
        }
    }

    #[Route('/connect/webhook', name: 'billing_connect_webhook', methods: ['POST'])]
    public function connectWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->headers->get('stripe-signature');
        $webhookSecret = $_ENV['STRIPE_WEBHOOK_SECRET_CONNECT'] ?? null;

        if (!$webhookSecret) {
            return $this->json(['message' => 'Webhook secret not configured'], 400);
        }

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Webhook signature verification failed'], 400);
        }

        if ($event->type === 'account.updated') {
            $account = $event->data->object;
            
            // Find organization by stripe account ID
            $organization = $this->organizationRepository->findByStripeAccountId($account->id);
            if (!$organization) {
                return $this->json(['received' => true]);
            }

            // Determine onboarding status
            $status = 'pending';
            if ($account->charges_enabled && $account->payouts_enabled) {
                $status = 'active';
            } elseif (empty($account->requirements->currently_due)) {
                $status = 'restricted';
            }

            // Update status
            $organization->setStripeOnboardingStatus($status);
            $this->entityManager->flush();
        }

        return $this->json(['received' => true]);
    }

    #[Route('/status', name: 'billing_status', methods: ['GET'])]
    public function status(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $organization = $user->getOrganization();

        return $this->json([
            'plan' => $organization->getPlan(),
            'subscriptionStatus' => $organization->getSubscriptionStatus(),
            'subscriptionCurrentPeriodEnd' => $organization->getSubscriptionCurrentPeriodEnd()?->format('c'),
            'stripeAccountId' => $organization->getStripeAccountId(),
            'stripeOnboardingStatus' => $organization->getStripeOnboardingStatus(),
            'canAcceptPayments' => $organization->getStripeOnboardingStatus() === 'active'
        ]);
    }
}
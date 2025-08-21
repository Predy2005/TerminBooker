<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/org')]
class OrganizationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('', name: 'org_get', methods: ['GET'])]
    public function get(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $organization = $user->getOrganization();

        return $this->json([
            'id' => $organization->getId(),
            'name' => $organization->getName(),
            'slug' => $organization->getSlug(),
            'timezone' => $organization->getTimezone(),
            'language' => $organization->getLanguage(),
            'plan' => $organization->getPlan(),
            'subscriptionStatus' => $organization->getSubscriptionStatus(),
            'subscriptionCurrentPeriodEnd' => $organization->getSubscriptionCurrentPeriodEnd()?->format('c'),
            'stripeCustomerId' => $organization->getStripeCustomerId(),
            'stripeSubscriptionId' => $organization->getStripeSubscriptionId(),
            'stripeAccountId' => $organization->getStripeAccountId(),
            'stripeOnboardingStatus' => $organization->getStripeOnboardingStatus(),
            'createdAt' => $organization->getCreatedAt()->format('c'),
            'updatedAt' => $organization->getUpdatedAt()->format('c')
        ]);
    }

    #[Route('', name: 'org_update', methods: ['PATCH'])]
    public function update(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['message' => 'Invalid JSON'], 400);
        }

        $organization = $user->getOrganization();

        // Update allowed fields
        if (isset($data['name'])) {
            $organization->setName($data['name']);
        }
        
        if (isset($data['slug'])) {
            // TODO: Check if slug is unique
            $organization->setSlug($data['slug']);
        }
        
        if (isset($data['timezone'])) {
            $organization->setTimezone($data['timezone']);
        }
        
        if (isset($data['language'])) {
            $organization->setLanguage($data['language']);
        }

        try {
            $this->entityManager->flush();

            return $this->json([
                'id' => $organization->getId(),
                'name' => $organization->getName(),
                'slug' => $organization->getSlug(),
                'timezone' => $organization->getTimezone(),
                'language' => $organization->getLanguage(),
                'plan' => $organization->getPlan(),
                'subscriptionStatus' => $organization->getSubscriptionStatus(),
                'subscriptionCurrentPeriodEnd' => $organization->getSubscriptionCurrentPeriodEnd()?->format('c'),
                'stripeCustomerId' => $organization->getStripeCustomerId(),
                'stripeSubscriptionId' => $organization->getStripeSubscriptionId(),
                'stripeAccountId' => $organization->getStripeAccountId(),
                'stripeOnboardingStatus' => $organization->getStripeOnboardingStatus(),
                'createdAt' => $organization->getCreatedAt()->format('c'),
                'updatedAt' => $organization->getUpdatedAt()->format('c')
            ]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Chyba při aktualizaci organizace'], 500);
        }
    }
}
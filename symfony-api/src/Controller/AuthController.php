<?php

namespace App\Controller;

use App\Entity\Organization;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
        private JWTTokenManagerInterface $jwtManager,
        private UserRepository $userRepository
    ) {}

    #[Route('/register', name: 'auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['name'], $data['slug'], $data['email'], $data['password'])) {
            return $this->json(['message' => 'Chybí povinné údaje'], 400);
        }

        // Check if user already exists
        if ($this->userRepository->findByEmail($data['email'])) {
            return $this->json(['message' => 'Uživatel s tímto e-mailem již existuje'], 400);
        }

        // Create organization
        $organization = new Organization();
        $organization->setName($data['name']);
        $organization->setSlug($data['slug']);

        // Validate organization
        $errors = $this->validator->validate($organization);
        if (count($errors) > 0) {
            return $this->json(['message' => 'Chybné údaje organizace'], 400);
        }

        // Create user
        $user = new User();
        $user->setEmail($data['email']);
        $user->setPasswordHash($this->passwordHasher->hashPassword($user, $data['password']));
        $user->setOrganization($organization);

        // Validate user
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            return $this->json(['message' => 'Chybné údaje uživatele'], 400);
        }

        try {
            $this->entityManager->persist($organization);
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            $token = $this->jwtManager->create($user);

            return $this->json([
                'message' => 'Registrace byla úspěšná',
                'token' => $token,
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'organizationId' => $organization->getId()
                ]
            ], 201);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Chyba při registraci'], 500);
        }
    }

    #[Route('/login', name: 'auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email'], $data['password'])) {
            return $this->json(['message' => 'Chybí e-mail nebo heslo'], 400);
        }

        $user = $this->userRepository->findByEmail($data['email']);
        if (!$user || !$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['message' => 'Neplatné přihlašovací údaje'], 401);
        }

        $token = $this->jwtManager->create($user);

        return $this->json([
            'message' => 'Přihlášení bylo úspěšné',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'organizationId' => $user->getOrganization()->getId()
            ]
        ]);
    }

    #[Route('/me', name: 'auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'organizationId' => $user->getOrganization()->getId(),
            'organization' => [
                'id' => $user->getOrganization()->getId(),
                'name' => $user->getOrganization()->getName(),
                'slug' => $user->getOrganization()->getSlug(),
                'plan' => $user->getOrganization()->getPlan(),
                'stripeOnboardingStatus' => $user->getOrganization()->getStripeOnboardingStatus(),
                'stripeAccountId' => $user->getOrganization()->getStripeAccountId()
            ]
        ]);
    }
}
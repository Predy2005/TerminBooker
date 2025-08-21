<?php

namespace App\Controller;

use App\Entity\Service;
use App\Entity\User;
use App\Repository\ServiceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/services')]
class ServiceController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ServiceRepository $serviceRepository,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'services_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $services = $this->serviceRepository->findByOrganization($user->getOrganization());

        return $this->json(array_map(function(Service $service) {
            return [
                'id' => $service->getId(),
                'name' => $service->getName(),
                'durationMin' => $service->getDurationMin(),
                'priceCzk' => $service->getPriceCzk(),
                'requirePayment' => $service->getRequirePayment(),
                'isActive' => $service->getIsActive(),
                'createdAt' => $service->getCreatedAt()->format('c')
            ];
        }, $services));
    }

    #[Route('', name: 'services_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data || !isset($data['name'], $data['durationMin'])) {
            return $this->json(['message' => 'Chybí povinné údaje'], 400);
        }

        $service = new Service();
        $service->setOrganization($user->getOrganization());
        $service->setName($data['name']);
        $service->setDurationMin($data['durationMin']);
        
        if (isset($data['priceCzk'])) {
            $service->setPriceCzk($data['priceCzk']);
        }
        
        if (isset($data['requirePayment'])) {
            $service->setRequirePayment($data['requirePayment']);
        }
        
        if (isset($data['isActive'])) {
            $service->setIsActive($data['isActive']);
        }

        // Validate
        $errors = $this->validator->validate($service);
        if (count($errors) > 0) {
            return $this->json(['message' => 'Chybné údaje služby'], 400);
        }

        try {
            $this->entityManager->persist($service);
            $this->entityManager->flush();

            return $this->json([
                'id' => $service->getId(),
                'name' => $service->getName(),
                'durationMin' => $service->getDurationMin(),
                'priceCzk' => $service->getPriceCzk(),
                'requirePayment' => $service->getRequirePayment(),
                'isActive' => $service->getIsActive(),
                'createdAt' => $service->getCreatedAt()->format('c')
            ], 201);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Chyba při vytváření služby'], 500);
        }
    }

    #[Route('/{id}', name: 'services_update', methods: ['PATCH'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $service = $this->serviceRepository->find($id);
        if (!$service || $service->getOrganization() !== $user->getOrganization()) {
            return $this->json(['message' => 'Služba nebyla nalezena'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['message' => 'Invalid JSON'], 400);
        }

        // Update allowed fields
        if (isset($data['name'])) {
            $service->setName($data['name']);
        }
        
        if (isset($data['durationMin'])) {
            $service->setDurationMin($data['durationMin']);
        }
        
        if (isset($data['priceCzk'])) {
            $service->setPriceCzk($data['priceCzk']);
        }
        
        if (isset($data['requirePayment'])) {
            $service->setRequirePayment($data['requirePayment']);
        }
        
        if (isset($data['isActive'])) {
            $service->setIsActive($data['isActive']);
        }

        // Validate
        $errors = $this->validator->validate($service);
        if (count($errors) > 0) {
            return $this->json(['message' => 'Chybné údaje služby'], 400);
        }

        try {
            $this->entityManager->flush();

            return $this->json([
                'id' => $service->getId(),
                'name' => $service->getName(),
                'durationMin' => $service->getDurationMin(),
                'priceCzk' => $service->getPriceCzk(),
                'requirePayment' => $service->getRequirePayment(),
                'isActive' => $service->getIsActive(),
                'createdAt' => $service->getCreatedAt()->format('c')
            ]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Chyba při aktualizaci služby'], 500);
        }
    }

    #[Route('/{id}', name: 'services_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $service = $this->serviceRepository->find($id);
        if (!$service || $service->getOrganization() !== $user->getOrganization()) {
            return $this->json(['message' => 'Služba nebyla nalezena'], 404);
        }

        try {
            $this->entityManager->remove($service);
            $this->entityManager->flush();

            return $this->json(['message' => 'Služba byla smazána']);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Chyba při mazání služby'], 500);
        }
    }
}
<?php

namespace App\Repository;

use App\Entity\Service;
use App\Entity\Organization;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Service>
 */
class ServiceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Service::class);
    }

    /**
     * @return Service[]
     */
    public function findByOrganization(Organization $organization): array
    {
        return $this->findBy(['organization' => $organization], ['name' => 'ASC']);
    }

    /**
     * @return Service[]
     */
    public function findActiveByOrganization(Organization $organization): array
    {
        return $this->findBy([
            'organization' => $organization,
            'isActive' => true
        ], ['name' => 'ASC']);
    }
}
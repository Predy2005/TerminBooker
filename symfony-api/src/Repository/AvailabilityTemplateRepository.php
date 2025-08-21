<?php

namespace App\Repository;

use App\Entity\AvailabilityTemplate;
use App\Entity\Organization;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AvailabilityTemplate>
 */
class AvailabilityTemplateRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AvailabilityTemplate::class);
    }

    /**
     * @return AvailabilityTemplate[]
     */
    public function findByOrganization(Organization $organization): array
    {
        return $this->findBy(['organization' => $organization], ['weekday' => 'ASC', 'startMinutes' => 'ASC']);
    }

    /**
     * @return AvailabilityTemplate[]
     */
    public function findByOrganizationAndWeekday(Organization $organization, int $weekday): array
    {
        return $this->findBy([
            'organization' => $organization,
            'weekday' => $weekday
        ], ['startMinutes' => 'ASC']);
    }
}
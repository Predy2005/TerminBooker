<?php

namespace App\Repository;

use App\Entity\Organization;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Organization>
 */
class OrganizationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Organization::class);
    }

    public function findBySlug(string $slug): ?Organization
    {
        return $this->findOneBy(['slug' => $slug]);
    }

    public function findByStripeCustomerId(string $stripeCustomerId): ?Organization
    {
        return $this->findOneBy(['stripeCustomerId' => $stripeCustomerId]);
    }

    public function findByStripeAccountId(string $stripeAccountId): ?Organization
    {
        return $this->findOneBy(['stripeAccountId' => $stripeAccountId]);
    }
}
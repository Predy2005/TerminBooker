<?php

namespace App\Repository;

use App\Entity\Blackout;
use App\Entity\Organization;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Blackout>
 */
class BlackoutRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Blackout::class);
    }

    /**
     * @return Blackout[]
     */
    public function findByOrganization(Organization $organization): array
    {
        return $this->findBy(['organization' => $organization], ['startsAt' => 'ASC']);
    }

    /**
     * @return Blackout[]
     */
    public function findOverlapping(Organization $organization, \DateTimeInterface $startsAt, \DateTimeInterface $endsAt): array
    {
        return $this->createQueryBuilder('b')
            ->where('b.organization = :organization')
            ->andWhere('b.startsAt < :endsAt AND b.endsAt > :startsAt')
            ->setParameter('organization', $organization)
            ->setParameter('startsAt', $startsAt)
            ->setParameter('endsAt', $endsAt)
            ->orderBy('b.startsAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
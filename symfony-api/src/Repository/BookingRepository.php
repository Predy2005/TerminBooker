<?php

namespace App\Repository;

use App\Entity\Booking;
use App\Entity\Organization;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Booking>
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    /**
     * @return Booking[]
     */
    public function findByOrganization(Organization $organization): array
    {
        return $this->findBy(['organization' => $organization], ['startsAt' => 'DESC']);
    }

    /**
     * @return Booking[]
     */
    public function findConflicting(Organization $organization, \DateTimeInterface $startsAt, \DateTimeInterface $endsAt, ?string $excludeBookingId = null): array
    {
        $qb = $this->createQueryBuilder('b')
            ->where('b.organization = :organization')
            ->andWhere('b.status != :cancelled')
            ->andWhere(
                '(b.startsAt < :endsAt AND b.endsAt > :startsAt)'
            )
            ->setParameter('organization', $organization)
            ->setParameter('startsAt', $startsAt)
            ->setParameter('endsAt', $endsAt)
            ->setParameter('cancelled', Booking::STATUS_CANCELLED);

        if ($excludeBookingId) {
            $qb->andWhere('b.id != :excludeId')
               ->setParameter('excludeId', $excludeBookingId);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @return Booking[]
     */
    public function findUpcoming(Organization $organization, int $limit = 10): array
    {
        return $this->createQueryBuilder('b')
            ->where('b.organization = :organization')
            ->andWhere('b.startsAt > :now')
            ->andWhere('b.status != :cancelled')
            ->orderBy('b.startsAt', 'ASC')
            ->setMaxResults($limit)
            ->setParameter('organization', $organization)
            ->setParameter('now', new \DateTime())
            ->setParameter('cancelled', Booking::STATUS_CANCELLED)
            ->getQuery()
            ->getResult();
    }
}
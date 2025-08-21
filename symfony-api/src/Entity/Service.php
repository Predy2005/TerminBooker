<?php

namespace App\Entity;

use App\Repository\ServiceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ServiceRepository::class)]
#[ORM\Table(name: 'services')]
class Service
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\ManyToOne(inversedBy: 'services')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'integer')]
    private int $durationMin;

    #[ORM\Column(type: 'integer', nullable: true)]
    private ?int $priceCzk = null;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'ORG_DEFAULT'])]
    private string $requirePayment = 'ORG_DEFAULT'; // ORG_DEFAULT | OFF | OPTIONAL | REQUIRED

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

    #[ORM\Column(type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private \DateTimeInterface $createdAt;

    #[ORM\OneToMany(mappedBy: 'service', targetEntity: Booking::class)]
    private Collection $bookings;

    public function __construct()
    {
        $this->id = Uuid::v4()->toRfc4122();
        $this->createdAt = new \DateTime();
        $this->bookings = new ArrayCollection();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getOrganization(): ?Organization
    {
        return $this->organization;
    }

    public function setOrganization(?Organization $organization): static
    {
        $this->organization = $organization;
        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getDurationMin(): int
    {
        return $this->durationMin;
    }

    public function setDurationMin(int $durationMin): static
    {
        $this->durationMin = $durationMin;
        return $this;
    }

    public function getPriceCzk(): ?int
    {
        return $this->priceCzk;
    }

    public function setPriceCzk(?int $priceCzk): static
    {
        $this->priceCzk = $priceCzk;
        return $this;
    }

    public function getRequirePayment(): string
    {
        return $this->requirePayment;
    }

    public function setRequirePayment(string $requirePayment): static
    {
        $this->requirePayment = $requirePayment;
        return $this;
    }

    public function getIsActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    public function addBooking(Booking $booking): static
    {
        if (!$this->bookings->contains($booking)) {
            $this->bookings->add($booking);
            $booking->setService($this);
        }

        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            if ($booking->getService() === $this) {
                $booking->setService(null);
            }
        }

        return $this;
    }
}
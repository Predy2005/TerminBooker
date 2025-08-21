<?php

namespace App\Entity;

use App\Repository\BookingRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ORM\Table(name: 'bookings')]
class Booking
{
    public const STATUS_PENDING = 'PENDING';
    public const STATUS_CONFIRMED = 'CONFIRMED';
    public const STATUS_CANCELLED = 'CANCELLED';

    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    #[ORM\ManyToOne(inversedBy: 'bookings')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'RESTRICT')]
    private Service $service;

    #[ORM\Column(type: 'string', length: 255)]
    private string $customerName;

    #[ORM\Column(type: 'string', length: 255)]
    private string $customerEmail;

    #[ORM\Column(type: 'string', length: 50, nullable: true)]
    private ?string $customerPhone = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $note = null;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $startsAt;

    #[ORM\Column(type: 'datetime')]
    private \DateTimeInterface $endsAt;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'PENDING'])]
    private string $status = self::STATUS_PENDING;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'UNPAID'])]
    private string $paymentStatus = 'UNPAID'; // UNPAID | PENDING | PAID | FAILED | REFUNDED

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $paymentProvider = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $paymentExternalId = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $holdExpiresAt = null;

    #[ORM\Column(type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private \DateTimeInterface $updatedAt;

    public function __construct()
    {
        $this->id = Uuid::v4()->toRfc4122();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
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

    public function getService(): ?Service
    {
        return $this->service;
    }

    public function setService(?Service $service): static
    {
        $this->service = $service;
        return $this;
    }

    public function getCustomerName(): string
    {
        return $this->customerName;
    }

    public function setCustomerName(string $customerName): static
    {
        $this->customerName = $customerName;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getCustomerEmail(): string
    {
        return $this->customerEmail;
    }

    public function setCustomerEmail(string $customerEmail): static
    {
        $this->customerEmail = $customerEmail;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getCustomerPhone(): ?string
    {
        return $this->customerPhone;
    }

    public function setCustomerPhone(?string $customerPhone): static
    {
        $this->customerPhone = $customerPhone;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getNote(): ?string
    {
        return $this->note;
    }

    public function setNote(?string $note): static
    {
        $this->note = $note;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getStartsAt(): \DateTimeInterface
    {
        return $this->startsAt;
    }

    public function setStartsAt(\DateTimeInterface $startsAt): static
    {
        $this->startsAt = $startsAt;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getEndsAt(): \DateTimeInterface
    {
        return $this->endsAt;
    }

    public function setEndsAt(\DateTimeInterface $endsAt): static
    {
        $this->endsAt = $endsAt;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getPaymentStatus(): string
    {
        return $this->paymentStatus;
    }

    public function setPaymentStatus(string $paymentStatus): static
    {
        $this->paymentStatus = $paymentStatus;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getPaymentProvider(): ?string
    {
        return $this->paymentProvider;
    }

    public function setPaymentProvider(?string $paymentProvider): static
    {
        $this->paymentProvider = $paymentProvider;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getPaymentExternalId(): ?string
    {
        return $this->paymentExternalId;
    }

    public function setPaymentExternalId(?string $paymentExternalId): static
    {
        $this->paymentExternalId = $paymentExternalId;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getHoldExpiresAt(): ?\DateTimeInterface
    {
        return $this->holdExpiresAt;
    }

    public function setHoldExpiresAt(?\DateTimeInterface $holdExpiresAt): static
    {
        $this->holdExpiresAt = $holdExpiresAt;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }
}
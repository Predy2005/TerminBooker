<?php

namespace App\Entity;

use App\Repository\AvailabilityTemplateRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: AvailabilityTemplateRepository::class)]
#[ORM\Table(name: 'availability_templates')]
class AvailabilityTemplate
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\ManyToOne(inversedBy: 'availabilityTemplates')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    #[ORM\Column(type: 'integer')]
    private int $weekday; // 0-6 (Sunday-Saturday)

    #[ORM\Column(type: 'integer')]
    private int $startMinutes;

    #[ORM\Column(type: 'integer')]
    private int $endMinutes;

    #[ORM\Column(type: 'integer')]
    private int $slotStepMin;

    #[ORM\Column(type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->id = Uuid::v4()->toRfc4122();
        $this->createdAt = new \DateTime();
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

    public function getWeekday(): int
    {
        return $this->weekday;
    }

    public function setWeekday(int $weekday): static
    {
        $this->weekday = $weekday;
        return $this;
    }

    public function getStartMinutes(): int
    {
        return $this->startMinutes;
    }

    public function setStartMinutes(int $startMinutes): static
    {
        $this->startMinutes = $startMinutes;
        return $this;
    }

    public function getEndMinutes(): int
    {
        return $this->endMinutes;
    }

    public function setEndMinutes(int $endMinutes): static
    {
        $this->endMinutes = $endMinutes;
        return $this;
    }

    public function getSlotStepMin(): int
    {
        return $this->slotStepMin;
    }

    public function setSlotStepMin(int $slotStepMin): static
    {
        $this->slotStepMin = $slotStepMin;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }
}
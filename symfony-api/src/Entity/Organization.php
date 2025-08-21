<?php

namespace App\Entity;

use App\Repository\OrganizationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: OrganizationRepository::class)]
#[ORM\Table(name: 'organizations')]
class Organization
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    private string $slug;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'Europe/Prague'])]
    private string $timezone = 'Europe/Prague';

    #[ORM\Column(type: 'string', length: 10, options: ['default' => 'cs-CZ'])]
    private string $language = 'cs-CZ';

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'FREE'])]
    private string $plan = 'FREE';

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'inactive'])]
    private string $subscriptionStatus = 'inactive';

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $subscriptionCurrentPeriodEnd = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $stripeCustomerId = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $stripeSubscriptionId = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $stripeAccountId = null;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'pending'])]
    private string $stripeOnboardingStatus = 'pending';

    #[ORM\Column(type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'datetime', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private \DateTimeInterface $updatedAt;

    #[ORM\OneToMany(mappedBy: 'organization', targetEntity: User::class, orphanRemoval: true)]
    private Collection $users;

    #[ORM\OneToMany(mappedBy: 'organization', targetEntity: Service::class, orphanRemoval: true)]
    private Collection $services;

    #[ORM\OneToMany(mappedBy: 'organization', targetEntity: AvailabilityTemplate::class, orphanRemoval: true)]
    private Collection $availabilityTemplates;

    #[ORM\OneToMany(mappedBy: 'organization', targetEntity: Blackout::class, orphanRemoval: true)]
    private Collection $blackouts;

    #[ORM\OneToMany(mappedBy: 'organization', targetEntity: Booking::class, orphanRemoval: true)]
    private Collection $bookings;

    public function __construct()
    {
        $this->id = Uuid::v4()->toRfc4122();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->users = new ArrayCollection();
        $this->services = new ArrayCollection();
        $this->availabilityTemplates = new ArrayCollection();
        $this->blackouts = new ArrayCollection();
        $this->bookings = new ArrayCollection();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getTimezone(): string
    {
        return $this->timezone;
    }

    public function setTimezone(string $timezone): static
    {
        $this->timezone = $timezone;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getLanguage(): string
    {
        return $this->language;
    }

    public function setLanguage(string $language): static
    {
        $this->language = $language;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getPlan(): string
    {
        return $this->plan;
    }

    public function setPlan(string $plan): static
    {
        $this->plan = $plan;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getSubscriptionStatus(): string
    {
        return $this->subscriptionStatus;
    }

    public function setSubscriptionStatus(string $subscriptionStatus): static
    {
        $this->subscriptionStatus = $subscriptionStatus;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getSubscriptionCurrentPeriodEnd(): ?\DateTimeInterface
    {
        return $this->subscriptionCurrentPeriodEnd;
    }

    public function setSubscriptionCurrentPeriodEnd(?\DateTimeInterface $subscriptionCurrentPeriodEnd): static
    {
        $this->subscriptionCurrentPeriodEnd = $subscriptionCurrentPeriodEnd;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getStripeCustomerId(): ?string
    {
        return $this->stripeCustomerId;
    }

    public function setStripeCustomerId(?string $stripeCustomerId): static
    {
        $this->stripeCustomerId = $stripeCustomerId;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getStripeSubscriptionId(): ?string
    {
        return $this->stripeSubscriptionId;
    }

    public function setStripeSubscriptionId(?string $stripeSubscriptionId): static
    {
        $this->stripeSubscriptionId = $stripeSubscriptionId;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getStripeAccountId(): ?string
    {
        return $this->stripeAccountId;
    }

    public function setStripeAccountId(?string $stripeAccountId): static
    {
        $this->stripeAccountId = $stripeAccountId;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getStripeOnboardingStatus(): string
    {
        return $this->stripeOnboardingStatus;
    }

    public function setStripeOnboardingStatus(string $stripeOnboardingStatus): static
    {
        $this->stripeOnboardingStatus = $stripeOnboardingStatus;
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

    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): static
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->setOrganization($this);
        }

        return $this;
    }

    public function removeUser(User $user): static
    {
        if ($this->users->removeElement($user)) {
            if ($user->getOrganization() === $this) {
                $user->setOrganization(null);
            }
        }

        return $this;
    }

    public function getServices(): Collection
    {
        return $this->services;
    }

    public function addService(Service $service): static
    {
        if (!$this->services->contains($service)) {
            $this->services->add($service);
            $service->setOrganization($this);
        }

        return $this;
    }

    public function removeService(Service $service): static
    {
        if ($this->services->removeElement($service)) {
            if ($service->getOrganization() === $this) {
                $service->setOrganization(null);
            }
        }

        return $this;
    }

    public function getAvailabilityTemplates(): Collection
    {
        return $this->availabilityTemplates;
    }

    public function addAvailabilityTemplate(AvailabilityTemplate $availabilityTemplate): static
    {
        if (!$this->availabilityTemplates->contains($availabilityTemplate)) {
            $this->availabilityTemplates->add($availabilityTemplate);
            $availabilityTemplate->setOrganization($this);
        }

        return $this;
    }

    public function removeAvailabilityTemplate(AvailabilityTemplate $availabilityTemplate): static
    {
        if ($this->availabilityTemplates->removeElement($availabilityTemplate)) {
            if ($availabilityTemplate->getOrganization() === $this) {
                $availabilityTemplate->setOrganization(null);
            }
        }

        return $this;
    }

    public function getBlackouts(): Collection
    {
        return $this->blackouts;
    }

    public function addBlackout(Blackout $blackout): static
    {
        if (!$this->blackouts->contains($blackout)) {
            $this->blackouts->add($blackout);
            $blackout->setOrganization($this);
        }

        return $this;
    }

    public function removeBlackout(Blackout $blackout): static
    {
        if ($this->blackouts->removeElement($blackout)) {
            if ($blackout->getOrganization() === $this) {
                $blackout->setOrganization(null);
            }
        }

        return $this;
    }

    public function getBookings(): Collection
    {
        return $this->bookings;
    }

    public function addBooking(Booking $booking): static
    {
        if (!$this->bookings->contains($booking)) {
            $this->bookings->add($booking);
            $booking->setOrganization($this);
        }

        return $this;
    }

    public function removeBooking(Booking $booking): static
    {
        if ($this->bookings->removeElement($booking)) {
            if ($booking->getOrganization() === $this) {
                $booking->setOrganization(null);
            }
        }

        return $this;
    }
}
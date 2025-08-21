<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Bookli.cz initial database schema migration
 */
final class Version20250821000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create initial database schema for Bookli.cz - organizations, users, services, availability, blackouts, bookings';
    }

    public function up(Schema $schema): void
    {
        // Create organizations table
        $this->addSql('CREATE TABLE organizations (
            id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            timezone VARCHAR(50) NOT NULL DEFAULT \'Europe/Prague\',
            language VARCHAR(10) NOT NULL DEFAULT \'cs-CZ\',
            plan VARCHAR(50) NOT NULL DEFAULT \'FREE\',
            subscription_status VARCHAR(50) NOT NULL DEFAULT \'inactive\',
            subscription_current_period_end TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            stripe_customer_id VARCHAR(255) DEFAULT NULL,
            stripe_subscription_id VARCHAR(255) DEFAULT NULL,
            stripe_account_id VARCHAR(255) DEFAULT NULL,
            stripe_onboarding_status VARCHAR(50) NOT NULL DEFAULT \'pending\',
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_427C1C7F989D9B62 ON organizations (slug)');

        // Create users table
        $this->addSql('CREATE TABLE users (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            email VARCHAR(180) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT \'ADMIN\',
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1483A5E9E7927C74 ON users (email)');
        $this->addSql('CREATE INDEX IDX_1483A5E932C8A3DE ON users (organization_id)');
        $this->addSql('ALTER TABLE users ADD CONSTRAINT FK_1483A5E932C8A3DE FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        // Create services table
        $this->addSql('CREATE TABLE services (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            duration_min INTEGER NOT NULL,
            price_czk INTEGER DEFAULT NULL,
            require_payment VARCHAR(50) NOT NULL DEFAULT \'ORG_DEFAULT\',
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id),
            CONSTRAINT duration_check CHECK (duration_min BETWEEN 5 AND 480)
        )');
        $this->addSql('CREATE INDEX IDX_7DD8F3E532C8A3DE ON services (organization_id)');
        $this->addSql('ALTER TABLE services ADD CONSTRAINT FK_7DD8F3E532C8A3DE FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        // Create availability_templates table
        $this->addSql('CREATE TABLE availability_templates (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            weekday INTEGER NOT NULL,
            start_minutes INTEGER NOT NULL,
            end_minutes INTEGER NOT NULL,
            slot_step_min INTEGER NOT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id),
            CONSTRAINT weekday_check CHECK (weekday BETWEEN 0 AND 6)
        )');
        $this->addSql('CREATE INDEX IDX_A8F8F0E032C8A3DE ON availability_templates (organization_id)');
        $this->addSql('ALTER TABLE availability_templates ADD CONSTRAINT FK_A8F8F0E032C8A3DE FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        // Create blackouts table
        $this->addSql('CREATE TABLE blackouts (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            starts_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            ends_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            reason TEXT DEFAULT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_8B5A0F0D32C8A3DE ON blackouts (organization_id)');
        $this->addSql('ALTER TABLE blackouts ADD CONSTRAINT FK_8B5A0F0D32C8A3DE FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');

        // Create bookings table
        $this->addSql('CREATE TABLE bookings (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            service_id VARCHAR(36) NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(50) DEFAULT NULL,
            note TEXT DEFAULT NULL,
            starts_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            ends_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT \'PENDING\',
            payment_status VARCHAR(50) NOT NULL DEFAULT \'UNPAID\',
            payment_provider VARCHAR(255) DEFAULT NULL,
            payment_external_id VARCHAR(255) DEFAULT NULL,
            hold_expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_7A853C3532C8A3DE ON bookings (organization_id)');
        $this->addSql('CREATE INDEX IDX_7A853C35ED5CA9E6 ON bookings (service_id)');
        $this->addSql('ALTER TABLE bookings ADD CONSTRAINT FK_7A853C3532C8A3DE FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE bookings ADD CONSTRAINT FK_7A853C35ED5CA9E6 FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE RESTRICT NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE bookings DROP CONSTRAINT FK_7A853C3532C8A3DE');
        $this->addSql('ALTER TABLE bookings DROP CONSTRAINT FK_7A853C35ED5CA9E6');
        $this->addSql('ALTER TABLE blackouts DROP CONSTRAINT FK_8B5A0F0D32C8A3DE');
        $this->addSql('ALTER TABLE availability_templates DROP CONSTRAINT FK_A8F8F0E032C8A3DE');
        $this->addSql('ALTER TABLE services DROP CONSTRAINT FK_7DD8F3E532C8A3DE');
        $this->addSql('ALTER TABLE users DROP CONSTRAINT FK_1483A5E932C8A3DE');
        $this->addSql('DROP TABLE bookings');
        $this->addSql('DROP TABLE blackouts');
        $this->addSql('DROP TABLE availability_templates');
        $this->addSql('DROP TABLE services');
        $this->addSql('DROP TABLE users');
        $this->addSql('DROP TABLE organizations');
    }
}
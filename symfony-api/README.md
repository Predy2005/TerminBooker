# Bookli.cz Symfony API

Toto je REST API pro Bookli.cz rezervační systém postavený na Symfony 6.2.

## Instalace

1. Nainstalujte závislosti:
```bash
composer install
```

2. Nakonfigurujte databázi v `.env`:
```env
DATABASE_URL="postgresql://username:password@127.0.0.1:5432/bookli_db?serverVersion=13&charset=utf8"
```

3. Nakonfigurujte Stripe:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_...
```

4. Vytvořte databázi a spusťte migrace:
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

5. Spusťte development server:
```bash
symfony server:start
```

## API Endpointy

### Autentizace
- `POST /api/auth/register` - Registrace nové organizace a administrátora
- `POST /api/auth/login` - Přihlášení uživatele
- `GET /api/auth/me` - Informace o aktuálním uživateli

### Organizace
- `GET /api/org` - Detail organizace
- `PATCH /api/org` - Aktualizace organizace

### Služby
- `GET /api/services` - Seznam služeb
- `POST /api/services` - Vytvoření služby
- `PATCH /api/services/{id}` - Aktualizace služby
- `DELETE /api/services/{id}` - Smazání služby

### Stripe Connect
- `POST /api/billing/connect/create` - Vytvoření Stripe Express účtu
- `POST /api/billing/connect/webhook` - Webhook pro Stripe Connect události
- `GET /api/billing/status` - Status plateb a předplatného

## Autentizace

API používá JWT tokeny. Po přihlášení obdržíte token, který musíte posílat v Authorization header:

```
Authorization: Bearer <token>
```

## Databázová struktura

- **organizations** - Organizace/firmy
- **users** - Administrátoři organizací
- **services** - Nabízené služby
- **availability_templates** - Šablony dostupnosti
- **blackouts** - Nedostupné termíny
- **bookings** - Rezervace zákazníků

## Stripe Connect Integrace

API podporuje Stripe Connect Express účty pro příjem plateb:

1. Organizace vytvoří Stripe Express účet
2. Projde onboarding procesem
3. Může přijímat platby od zákazníků
4. Webhooky automaticky aktualizují status účtu

## CORS

CORS je nakonfigurován pro frontend aplikaci. Pro produkční nasazení upravte `CORS_ALLOW_ORIGIN` v `.env`.
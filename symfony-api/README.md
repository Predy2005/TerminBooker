# Bookli Symfony REST API

Alternativní backend implementace pro Bookli rezervační systém s podporou Stripe Connect.

## Instalace

1. Nainstalujte závislosti:
```bash
cd symfony-api
composer install
```

2. Nastavte proměnné prostředí v `.env`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bookli?serverVersion=15"

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_...

# JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=bookli2025

# Frontend URL
FRONTEND_URL=http://localhost:5000

# CORS
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

3. Vygenerujte JWT klíče:
```bash
mkdir -p config/jwt
openssl genrsa -out config/jwt/private.pem -aes256 -passout pass:bookli2025 2048
openssl rsa -pubout -in config/jwt/private.pem -passin pass:bookli2025 -out config/jwt/public.pem
```

4. Spusťte migrace:
```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

5. Spusťte server:
```bash
php bin/console server:run 0.0.0.0:8000
```

## API Endpointy

### Autentizace
- `POST /api/auth/login` - Přihlášení
- `POST /api/auth/register` - Registrace

### Organizace
- `GET /api/org` - Získání dat organizace
- `PUT /api/org` - Aktualizace organizace

### Služby
- `GET /api/services` - Seznam služeb
- `POST /api/services` - Vytvoření služby
- `PUT /api/services/{id}` - Aktualizace služby
- `DELETE /api/services/{id}` - Smazání služby

### Stripe Connect Billing
- `POST /api/billing/connect/create` - Vytvoření/obnovení Stripe Express účtu
- `GET /api/billing/connect/status` - Stav Stripe Connect účtu
- `POST /api/billing/connect/webhook` - Webhook pro Stripe události

### Rezervace
- `GET /api/bookings` - Seznam rezervací
- `POST /api/bookings` - Vytvoření rezervace
- `PUT /api/bookings/{id}` - Aktualizace rezervace

## Stripe Connect Integrace

### Nastavení

1. V Stripe Dashboardu zapněte Connect → Express
2. Nastavte webhook URL: `https://your-domain.com/api/billing/connect/webhook`
3. Zapněte "Listen to events on connected accounts"
4. Přidejte event: `account.updated`
5. Zkopírujte webhook signing secret do `STRIPE_WEBHOOK_SECRET_CONNECT`

### Workflow

1. **Vytvoření účtu**: `POST /api/billing/connect/create`
   - Pokud účet neexistuje, vytvoří nový Stripe Express účet
   - Vygeneruje Account Link pro onboarding
   - Vrátí URL pro přesměrování

2. **Onboarding**: Uživatel dokončí ověření ve Stripe
   - Po úspěchu: přesměrování na `/app/billing/connect/success`
   - Po chybě: přesměrování na `/app/billing/connect/refresh`

3. **Webhook**: Stripe odesílá `account.updated` eventy
   - API aktualizuje stav v databázi (`pending`/`restricted`/`active`)
   - Pouze když `charges_enabled && payouts_enabled` → `active`

4. **Status check**: `GET /api/billing/connect/status`
   - Frontend kontroluje aktuální stav účtu
   - Podle stavu zobrazuje příslušné UI

## Databázové schéma

Schema je sdíleno s Node.js backendem. Klíčová pole pro Stripe Connect:

- `organizations.stripe_account_id` - ID Stripe Express účtu
- `organizations.stripe_onboarding_status` - Stav onboardingu (`pending`, `restricted`, `active`)

## Bezpečnost

- JWT tokeny pro autentizaci
- CORS konfigurace
- Webhook signature verification
- Organization-based data isolation
- Rate limiting (doporučeno pro produkci)

## Testování

Použijte Stripe test mode pro vývoj:
- Test API klíče začínají `sk_test_`
- Webhook události lze simulovat v Stripe CLI
- Express onboarding lze dokončit s test daty
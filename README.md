# Workshop Commerce

A production-oriented e-commerce foundation with a Laravel API, a Next.js administration panel, PostgreSQL, Redis, AWS S3 media support, Nginx, and Docker Compose. The root `app/` directory is intentionally empty for a future customer storefront.

## Project map

```text
.
├── api/                  Laravel 12 JSON API
├── admin/                Next.js 16 administration panel
├── app/                  Reserved for the future customer app
├── nginx/                Single-entry reverse proxy
├── docker-compose.yaml   Local service topology
├── PRODUCT.md            Durable product constraints
└── DESIGN.md             Implemented admin design system
```

## What is included

- Verify-before-create registration: pending registration data stays in Redis until the email link is confirmed.
- Asymmetric RS256 access JWTs plus opaque, hashed, rotating PostgreSQL refresh sessions with replay-family revocation.
- HttpOnly browser cookies, throttling, generic credential failures, trusted-origin checks, ownership policies, and live admin-role verification.
- Public catalog reads and protected user, basket, order, admin, reference-data, image, and analytics operations.
- Database-side filtering, search, sorting, aggregation, eager loading, indexes, and seven-item pagination.
- Product/color image ownership, deterministic S3 prefixes, and compensating storage cleanup when a database change fails.
- Historical order-item snapshots so catalog edits do not rewrite past orders.
- Responsive admin routes for Dashboard, Users, Orders, Goods, Admins, and Markers with loading, error, empty, retry, search, and pagination states.

## Quick start with Docker

Requirements: Docker with Compose and OpenSSL.

```bash
cp .env.example .env
cp api/.env.example api/.env
mkdir -p api/storage/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out api/storage/keys/jwt-private.pem
openssl pkey -in api/storage/keys/jwt-private.pem -pubout -out api/storage/keys/jwt-public.pem
docker compose up --build
```

The stack runs at:

- Admin panel: `http://localhost:8080/login`
- API: `http://localhost:8080/api`
- Health check: `http://localhost:8080/health`

On first startup, the API waits for PostgreSQL and Redis, applies migrations, and then serves requests. Seed the optional synthetic administrators with:

```bash
docker compose exec api php artisan db:seed
```

The local test accounts are:

| Name | Email | Password |
| --- | --- | --- |
| Demo Administrator | `admin@example.test` | `password` |
| Catalog Administrator | `catalog.admin@example.test` | `password` |
| Orders Administrator | `orders.admin@example.test` | `password` |

All three accounts are verified administrators. The seeder is idempotent, so it can be run repeatedly without creating duplicates. These credentials are for local development only; change or remove them before any shared deployment.

Stop services with `docker compose down`. Add `--volumes` only when you deliberately want to delete the local PostgreSQL, Redis, dependency, and build volumes.

## Configuration

The root `.env` controls published ports and PostgreSQL credentials. `api/.env` controls Laravel, authentication, mail, and media. Docker Compose explicitly pins the API to the Compose PostgreSQL and Redis services so a developer’s local database choice cannot leak into the container environment.

When the admin panel runs directly on port 3000 in development, its `/api` requests are proxied to `ADMIN_API_PROXY_TARGET` (the Docker gateway at `http://localhost:8080/api` by default). This keeps browser cookies same-origin and avoids sending API requests to the Next.js router.

### Email verification

For local work, `MAIL_MAILER=log` writes the confirmation URL to `api/storage/logs/laravel.log`. For a real mail provider, fill the standard Laravel `MAIL_*` values and keep `FRONTEND_VERIFY_URL` pointed at the admin `/verify` route. Pending records expire after `AUTH_PENDING_TTL_HOURS` and are consumed atomically on successful verification.

### JWT keys and cookies

Compose mounts `api/storage/keys` read-only at `/run/secrets`; private and public PEM files are ignored by source control. Access cookies default to 15 minutes and refresh sessions to 30 days. In HTTPS environments set `SESSION_SECURE_COOKIE=true`, use the intended SameSite policy, and configure exact allowed origins, issuer, and audience values.

### AWS S3

Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, and `AWS_BUCKET`. Optional `AWS_URL`, `AWS_ENDPOINT`, and path-style configuration support S3-compatible services. Uploaded objects use:

```text
goods/{good-id}/{color-slug}/{safe-original-name}-{random-suffix}.{extension}
```

The database stores both the object path and public URL. Deleting an image removes the object; a failed database insert removes the just-uploaded object as compensation.

## Local development without Docker

API requirements: PHP 8.2+, Composer, PostgreSQL, Redis, and OpenSSL. Admin requirements: Node.js 22+ and npm.

```bash
cd api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

For a host-run API, change the database/Redis hosts from service names to `127.0.0.1`, and point the JWT key paths to the absolute local PEM paths or place PEM contents in the inline environment variables.

```bash
cd admin
cp .env.example .env.local
npm install
npm run dev
```

## API shape

Public endpoints cover registration/verification, login/refresh/logout, catalog products, categories, subcategories, colors, and materials. Authenticated endpoints cover the current user, logout-all, users, baskets, and orders. Current administrators additionally receive catalog mutations, product image operations, administrator creation/detail, marker mutations, and dashboard/product statistics.

Use `php artisan route:list --path=api` for the complete method and middleware matrix. API resources return stable JSON envelopes and pagination metadata; validation errors use HTTP 422, unauthenticated requests 401, forbidden requests 403, missing records 404, conflicts 409, and throttled requests 429.

## Database decisions

The supplied schema was treated as domain input rather than copied mechanically:

- Table and column names are normalized to Laravel/PostgreSQL conventions; quantities replace the misspelled `qntty` fields.
- Money is `decimal(12,2)`, not integer, and constrained non-negative.
- Product inventory is explicit and decremented transactionally during order creation.
- Images belong directly to a valid product/color pair instead of using a separate image registry join.
- Many-to-many joins have composite uniqueness and foreign keys; lookup and filtering fields are indexed.
- Orders keep customer snapshots, while order items keep product name, color, unit price, quantity, and item status snapshots. This preserves auditability when live users or goods later change.
- Lowercase email uniqueness and PostgreSQL search indexes support normalized login and scalable catalog search.

## Verification commands

```bash
cd api
./vendor/bin/pint --test
php artisan test

cd ../admin
npm run lint
npm run test
npm run build

cd ..
docker compose config --quiet
```

The backend suite covers the verification lifecycle, normalized credentials, refresh rotation/replay revocation, logout behavior, catalog filtering/pagination/resource shape, order ownership, and admin authorization. The frontend suite exercises the shared table behavior and formatter contract.

## Deployment notes

- Replace all example credentials and the synthetic seeded administrator.
- Keep the private JWT key outside the image and source tree; use the deployment platform’s secret mount.
- Run migrations as a controlled release step if your platform should not migrate on application boot.
- Put TLS in front of Nginx, enable secure cookies, set exact origins, and keep Nginx upload limits aligned with Laravel validation.
- Use a private PostgreSQL/Redis network, managed backups, S3 lifecycle/versioning as appropriate, centralized logs, and external health monitoring.
- Build the admin production image using the Dockerfile’s `production` stage when deploying without the development Compose profile.

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
- Per-color/size inventory rows with additive restocking and transactional checkout deductions.
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

For local work, `MAIL_MAILER=log` writes the confirmation URL to `api/storage/logs/laravel.log`. For a real mail provider, fill the standard Laravel `MAIL_*` values and point `FRONTEND_VERIFY_URL` at the customer-facing app's `/home` route (the default local URL is `http://localhost:3000/home`). The storefront's global context submits the token to `POST /api/account/verify`, which consumes it once and starts the session. Pending records expire after `AUTH_PENDING_TTL_HOURS` and are consumed atomically on successful verification.

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
- Product inventory is explicit and decremented transactionally during order creation or paid pre-order confirmation. Pending pre-orders do not reserve stock.
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

### Category and product images

Apply migrations with `docker compose exec api php artisan migrate --force` after updating the API. The category cover migration creates `category_images` and a nullable, unique `categories.image_id` foreign key, preserving existing categories. Category create/update accepts an optional multipart `image` (JPEG, PNG, WebP; up to 10 MiB). Use `POST /api/categories/{id}` with `_method=PUT` for multipart updates, or the existing JSON PUT/PATCH routes for text fields. `remove_image=true` removes the cover; do not combine it with an uploaded image. Saving a category and its cover is transactional, with storage cleanup on failure or replacement.

Category images are stored under `categories/{categoryId}/`. Product creation/editing can queue multiple images for selected colors, uploaded under `goods/{goodId}/{color}/`. Failed product uploads remain available to retry against the already-created product. Color and material selectors search the API with pagination and keep selections across searches.

S3 uploads use `bucket-owner-full-control`, compatible with Bucket owner enforced buckets. No public ACL or bucket-policy change is required. By default, category and product image resources return signed URLs valid for one hour; refresh the resource to obtain a new URL. Set `AWS_SIGNED_URLS=false` only when a public bucket policy or public CDN serves the configured image URLs. AWS credentials stay in `api/.env`; after changing them, recreate the API container with `docker compose up -d --no-deps api` so its environment is updated.

### Inventory and sizes

The `good_register` table is the stock ledger for a product. Each row references one
product and color, stores a nonnegative unsigned quantity, and may carry a free-form
size label such as `XL`, `43.5`, or `One size`. A null size is the unsized variant.
The product's `current_quantity` is the cached sum of its register rows; checkout locks
the selected rows and decrements them atomically. The admin product form edits all rows
at once and uses `inventory_version` to reject stale saves. When new stock arrives, use
the product detail page's Add stock control or `POST /api/goods/{good}/inventory/{register}/restock`.

The migration preserves legacy product-wide totals. If a legacy product had several
colors, its total becomes an `Unassigned stock` color row so an administrator can later
allocate it to concrete colors and sizes. Legacy basket entries that identify exactly
one replacement row are linked automatically; ambiguous entries remain available for
the customer to select again.

### Local Stripe webhooks

When running Stripe CLI on the host with Docker Compose, forward events to the Nginx port published by `HTTP_PORT` in the root `.env` (default `8080`). Port `8000` is internal to the API container.

```bash
stripe listen \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed \
  --forward-to http://127.0.0.1:8080/api/webhooks/stripe
```

Set `STRIPE_WEBHOOK_SECRET` in `api/.env` to the local listener's signing secret and apply it with `docker compose up -d api`. Keep the listener running while you complete a test preorder. A successful delivery shows HTTP `200` in the listener output.

### Transactional email

The API records email intents in PostgreSQL alongside successful seller submissions, paid Stripe preorders, eligible sign-ins, and first-time account verification. Laravel's scheduler places due intents on the Redis `transactional-mail` queue once per minute. A queue worker delivers them.

Set these values in the API environment.

| Variable | Setting |
| --- | --- |
| `MAIL_MAILER` | Use `log` locally or `smtp` for delivery through your provider. Tests use `array`. |
| `MAIL_SCHEME`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | Use the provider's SMTP connection settings and credentials. `MAIL_URL` can supply the connection URL instead. |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | Use the verified sender address and the display name, such as Pointet. |
| `MAIL_TIMEOUT` | SMTP timeout in seconds, with a default of 15. Keep it below the worker timeout. |
| `FRONTEND_URL` | Public storefront base URL for authenticated preorder links. Use HTTPS in production. |
| `QUEUE_CONNECTION`, `REDIS_QUEUE_RETRY_AFTER` | Use `redis` and keep the reservation timeout above the 60-second worker timeout. The default is 90 seconds. |
| `APP_KEY` | Use the same Laravel application key on the API and worker. Keep previous keys configured during rotation until pending messages are processed. |

For local development, run these commands from `api` and keep the worker and scheduler running in separate terminals.

```bash
php artisan migrate
php artisan queue:work redis --queue=transactional-mail,default --timeout=60
php artisan schedule:work
```

Docker Compose starts `scheduler` and `queue-worker` automatically when starting the full stack. Both share the API image and environment and wait for the API to finish its startup migrations. To update an existing stack or apply changes to `api/.env`, run:

```bash
docker compose up -d --build api queue-worker scheduler
docker compose ps api queue-worker scheduler
```

Use `docker compose logs --tail=100 queue-worker scheduler` to check process output. The Laravel log records unsuccessful delivery attempts by outbox ID. For a seller application, look up `seller:<application-id>` in `transactional_emails`. An unsent row with `available_at` set is eligible for dispatch at that time. A row with no `sent_at` or `available_at` has exhausted its retries. Applications submitted before email recording was enabled may have no outbox row.

In production, run `php artisan migrate --force` during release, supervise `php artisan queue:work redis --queue=transactional-mail,default --timeout=60`, and invoke `php artisan schedule:run` once per minute from cron or the deployment scheduler. Run `php artisan queue:restart` on release so workers reload the code and configuration.

Use `php artisan transactional-mail:dispatch` for an immediate outbox scan. Delivery failures retry after 1, 5, 15, and 60 minutes. After the fifth failed attempt, correct the issue and run `php artisan transactional-mail:retry <outbox-id>`. The outbox stores an encrypted recipient and payload until acceptance by the configured transport, then removes the payload and retains the unique event key. `sent_at` records transport acceptance. SMTP can deliver a duplicate if the connection or worker fails after the server accepts the message and before the application records that acceptance.

Identical validated seller submissions return the original application. Sign-in alerts use a random browser cookie and only trigger when a different browser signs in while an active session exists. Legacy sessions use a conservative user-agent match until they gain a device identifier. Standard orders currently have no Stripe-backed paid transition. Payment confirmation emails therefore apply to paid preorders.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The current surface is for e-commerce administrators who maintain a mixed catalog of clothing, bags, and furniture, manage customers and administrators, review orders, and monitor commercial performance. A later customer-facing storefront will serve shoppers, but it is explicitly outside this implementation.

## Product Purpose

Provide a secure operational foundation for an e-commerce business: a Laravel API, a focused Next.js administration workspace, and reproducible local infrastructure. Success means administrators can safely manage the catalog and reference data, inspect users and orders, handle product imagery by color, and read server-calculated sales statistics without exposing customer-owned data.

## Operating Context

Administrators work in a persistent desktop-oriented control panel with searchable seven-row tables, detail routes, accessible modals, an order-summary view, product galleries, and dashboard analytics. The system uses PostgreSQL for durable business data, Redis for pending registrations, opaque refresh sessions in PostgreSQL, public AWS S3 product media, and HttpOnly cookies for browser authentication.

## Capabilities and Constraints

- Laravel owns authentication, authorization, validation, serialization, aggregation, and all business mutations.
- Registration is verify-before-create: pending data is kept in Redis and a user is created only after email confirmation.
- Access tokens are short-lived asymmetric JWTs; refresh tokens are opaque, hashed, rotating, and replay protected.
- Public catalog reads coexist with owner-scoped user, basket, and order access and current-role-checked admin operations.
- Product images belong to a specific product-color combination and are stored under an S3 product/color prefix.
- Order items preserve historical product name and unit-price snapshots.
- The Next.js admin uses the App Router, TypeScript, centralized typed queries, server components by default, SCSS Modules, Tailwind v4, Vitest, and localized navigation.
- The root `app/` directory remains empty for the future customer application.
- Product naming, production deployment provider, commercial pricing, and final customer storefront behavior remain open decisions.

## Brand Commitments

The supplied `DESIGN-uk.md` is binding for the admin panel: Apple-inspired neutral canvases, SF Pro-style typography, restrained blue actions, quiet chrome, deliberate radius tiers, compact transactional density, and product imagery carrying the visual emphasis. The interface must not replace this with a generic dashboard aesthetic.

## Evidence on Hand

- Database diagram: `/Users/drobysz/Downloads/poinet workshop db scheme_2026-08-13T12_27_18.493Z.png`
- Markdown schema: `/Users/drobysz/Downloads/poinet workshop db scheme_2026-08-13T12_26_48.774Z.md`
- SQL schema: `/Users/drobysz/Downloads/poinet workshop db scheme_2026-08-13T12_25_18.409Z.sql`
- Authentication architecture: `/Users/drobysz/Desktop/instructions/laravel-auth-email-verification-guide.md`
- Admin engineering standard: `/Users/drobysz/Desktop/instructions/NEXTJS_PROJECT_STANDARD.md`
- Admin visual standard: `/Users/drobysz/Desktop/instructions/DESIGN-uk.md`

No real customer, sales, product-media, benchmark, or testimonial dataset was supplied; demo content must remain clearly synthetic.

## Product Principles

- Backend authorization is authoritative and ownership is explicit.
- Operational views stay legible, searchable, and useful before they become expressive.
- Durable order history must not change when the live catalog changes.
- Media storage and database state change atomically or compensate safely.
- Aggregate in the database, paginate at the API, and never move bulk filtering into the browser.

## Accessibility & Inclusion

Admin interactions must be keyboard accessible, expose visible focus, use semantic controls, provide loading/error/empty/retry states, support reduced motion, and keep modal focus and background interaction correctly contained.

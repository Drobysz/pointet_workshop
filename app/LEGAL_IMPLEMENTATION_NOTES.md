# Legal documentation implementation

## Update — 14 November 2026: six documents, six languages

This section supersedes the routes, files and placeholders described below; the cookie and data findings further down are still the factual basis of the texts.

- **Documents** (`/docs/{slug}`): `legal_notice` (mentions légales), `privacy_policy`, `cookies_policy`, `refund_policy`, `seller_policy`, `seller_rules`. The slug list lives in `app/[locale]/(main)/docs/_content/index.ts`; each slug has a thin `page.tsx` that renders the shared `LegalDocumentPage`.
- **Content**: one JSON file per language and document in `docs/_content/{locale}/{slug}.json` for `en`, `fr`, `de`, `it`, `ru`, `uk`, plus `shared.json` with the operator details block and the definitions used by several documents. Section ids are identical in every language. Block types: `paragraph`, `heading`, `list`, `ordered`, `table`, `shared`.
- **Operator identity**: the texts never hard-code the business. They reference `{{LEGAL_OPERATOR_NAME}}`, `{{LEGAL_SIREN}}`… and `fillLegalVariables` replaces them from the environment at request time (the pages call `connection()`), so the values can change without a rebuild. The variables are listed in `app/.env.example`; Docker Compose forwards them to the `app` container from the root `.env`. A variable without a value is rendered as `[LEGAL_…]`.
- **Authoring**: the Russian text is the approved original; the other five languages are translations of it. When a clause changes, change it in all six files and bump `lastUpdated`.
- **Cookies described**: `access_token` (15 min), `refresh_token` (30 days), `pointet-guest-basket` (30 days), `guest_token` (12 months, guest orders and pre-orders), `NEXT_LOCALE` (up to 12 months).
- **Still to be supplied by the operator**: real `LEGAL_*` values, including the consumer mediator and the hosting provider. The platform fee, payout frequency and Byrd tariffs are deliberately not stated in the texts: the Seller Terms say they are communicated before registration and shown in the seller console.

## Original implementation notes (September 2026)

Implementation notes updated: 17 September 2026. Policy text revision remains 16 September 2026; the JSON refactor did not change the legal wording.

## Routes and presentation

Completed the existing `/docs/privacy_policy` and `/docs/cookies_policy` route stubs. The existing middleware supplies the locale prefix (`en`, `fr`, `de`, `it`, `ru`). Both policies remain in English, including their metadata, with `lang="en"` on the article. Cross-links explicitly preserve the current route locale. `/docs` continues to redirect to the privacy policy.

The pages reuse the current site shell, font, neutral/amber palette, documentation navigation and SCSS/Tailwind conventions. They provide a large title, revision date, separator, numbered sections, paragraphs and lists. No screenshot was attached alongside the request; the written layout requirements and existing page styles were used.

## Files created

Under `app/app/[locale]/(main)/docs/_components/`:

- `LegalPageLayout.tsx`: shared article, English language annotation, title and semantic date.
- `LegalSection.tsx`: numbered, named sections with stable anchor IDs.
- `LegalContent.tsx`: shared renderer for JSON paragraphs, subheadings, lists, emphasis, line breaks and locale-aware links.
- `content.json`: shared contact/security text and the revision-date label.
- `legal.module.scss`: shared responsive document typography and spacing.

Each policy directory also has a `content.json` with its title, date, metadata and sections. Its `page.tsx` imports this data and maps sections to `LegalSection` and `LegalContent`.

Also created this report: `app/LEGAL_IMPLEMENTATION_NOTES.md`.

## Files modified

- `app/app/[locale]/(main)/docs/(docs)/privacy_policy/page.tsx`: 12 English sections, appropriate metadata, locale-preserving cookie-policy link.
- `app/app/[locale]/(main)/docs/(docs)/cookies_policy/page.tsx`: 11 English sections replacing the duplicated privacy page, appropriate metadata, locale-preserving privacy-policy link.
- `app/app/[locale]/(main)/docs/layout/SideMenu/SideMenu.tsx`: corrected `/docs/cookies)policy` to `/docs/cookies_policy`.
- `app/app/[locale]/(main)/docs/layout/GridLayout.module.scss`: removed the content column's fixed minimum and excessive mobile horizontal padding.
- `app/json/footer_links.json`: pointed the two policy links to their respective pages.

Replaced the obsolete policy JSON with the verified policy content and removed the duplicated `page.module.scss` from each policy directory. All policy text now lives in JSON, including shared contact/security content; the redundant `LegalContact.tsx` and `AuthenticationCookieSecurity.tsx` components were removed in the JSON refactor. The renderer uses React elements rather than raw HTML.

## Authentication and cookie findings

Sources: `api/config/auth_tokens.php`, `api/app/Services/Auth/SessionService.php`, `api/app/Services/Auth/AccessTokenService.php`, `api/.env.example`, and `docker-compose.yaml`.

| Cookie | Purpose | Verified project lifetime | Attributes |
| --- | --- | --- | --- |
| `access_token` | Authenticate protected requests | 15 minutes from issue/renewal | HttpOnly; Secure defaults to true; SameSite defaults to Lax; path `/` |
| `refresh_token` | Renew authentication | 30 days from issue/renewal | HttpOnly; Secure defaults to true; SameSite defaults to Lax; path `/` |
| `NEXT_LOCALE` | Public website language preference | Session cookie; no explicit Max-Age/Expires | SameSite=Lax; no HttpOnly or Secure setting supplied by this routing configuration |
| `admin_locale` | Separate administration interface language preference | 365 days from language selection | SameSite=Lax; path `/`; set by browser JavaScript |

Authentication cookie names, durations, domain, Secure and SameSite are configurable. HttpOnly is passed as true by the cookie-writing service. The cookie domain defaults to host-only when unset. Refresh tokens rotate; the old refresh token is revoked. Sign-out clears cookies in the current browser. JWTs contain an expiry and can remain cryptographically valid until expiry; the policies do not promise immediate invalidation of every issued access token.

**Deployment qualification:** the example environment and Docker Compose disable Secure for local HTTP. The backend configuration itself defaults Secure to true. No running production cookie headers were available to verify. The policies explicitly distinguish defaults from deployed settings; authentication settings were not changed.

Public locale behavior was checked in `app/i18n/routing.ts`, `app/proxy.ts`, and the installed next-intl routing/middleware/navigation implementation. It uses `NEXT_LOCALE`, SameSite=Lax, and no persistent expiry. The middleware updates a differing existing preference or sets one when the selected language differs from the browser preference; client navigation synchronizes language changes. Browser session restoration can preserve a session cookie. The separate admin preference was found in `admin/i18n/config.ts` and `admin/app/(admin_panel)/layout/AsideMenu/AsideMenu.tsx`.

Laravel's generic session configuration also exists, but the commerce authentication endpoints run through the API middleware, not the web-session middleware. It was not described as an additional commerce authentication cookie.

## Confirmed personal data and retention

Sources: the commerce migration, `User`, `Order`, `OrderItem`, `Basket`, `AuthRefreshToken`, registration/user/order request validation, and authentication/order controllers.

- Required registration fields: email, full name and password; password is hashed.
- User records: ID, email, full name, password hash, role, email-verification timestamp and creation/update timestamps. The referrer relationship is nullable.
- Basket records associate a user with products, quantities and optional colours.
- Orders store customer name/email snapshots, user relationship, status and placement date; order items store product/colour names, unit prices, quantities and statuses. These records support current orders and order history; there is no separate purchase-history table.
- Authentication records store a refresh-token hash, account/session/family identifiers, expiry/revocation/usage timestamps, IP address and user agent. Raw token values were not documented.
- The contact form handles selected service and project description and opens a prefilled WhatsApp URL.
- **Phone and delivery-address fields are absent from the account/order schema and request validators.** They cannot be confirmed as optional persisted fields. The policy describes optional details supplied in correspondence, rather than inventing database fields. An address can be necessary for a requested delivery.
- Pending registration data expires after 24 hours by default and is consumed during verification. A used-verification marker is retained for one day.
- No fixed deletion schedule for accounts, orders or expired/revoked authentication records was found. Token expiry is not record deletion. No unsupported fixed legal/accounting retention period was added.

## Integrations and third-party cookies

- WhatsApp is used through an external `wa.me` contact URL in `app/helpers/messages.ts`. The selected service and description are included in that URL before the visitor chooses whether to send the message. It is not an embedded tracking widget.
- `api/app/Services/Catalog/ProductImageService.php` explicitly uses the S3 disk for public product images. Filesystem settings allow AWS or an S3-compatible endpoint. The local/example region is `us-east-1`; production service, region and endpoint are not verified. The policy describes possible connection-data processing when images are fetched directly, without claiming customer account/order records are stored in S3.
- PostgreSQL and Redis support business records and pending registrations; their presence does not identify a managed hosting provider.
- Mail defaults to the log transport in the inspected local configuration. Postmark, Resend, SES, SMTP and Slack settings are configuration options, not evidence of active provider use. No such provider was represented as active.
- No payment provider, visitor analytics, advertising, external sign-in, embedded media or support-widget cookie integration was found. Admin dashboard business reporting is not browser visitor analytics.
- Google fonts are imported through `next/font`, which serves built font assets from the application; this is not evidence of browser-side Google tracking cookies.
- No third-party advertising or analytics cookies were found in the application. External WhatsApp use is subject to that service's cookie practices. Production network traffic was not audited.

## Outstanding operator information

Both pages reuse `alexdrobyszfr@gmail.com`, which was already present in the privacy-policy code and content. No email was invented. Confirm that this remains the intended privacy contact.

Explicit placeholders remain for:

1. The operator/data controller's full legal name.
2. The operator's postal address.
3. Identities and roles of hosting/infrastructure and any delivery providers that process customer data.
4. Relevant international recipients and destination countries, applicable transfer mechanisms, and how to obtain details or copies of safeguards.

Actual production HTTPS/Secure settings, provider arrangements and retention practices need operator verification. No unverified international-transfer mechanism or legal identity was invented.

## Legal reference checks

The requested GDPR purposes, legal bases, qualified rights and retention principles were checked against [Your Europe: data protection under GDPR](https://europa.eu/youreurope/business/governance-and-sustainability/digital-and-data-compliance/data-protection-gdpr/index_en.htm). The necessary-cookie distinction was checked against [CNIL: cookies and the law](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi). The policy links directly to the CNIL and avoids blanket consent from visiting the site.

## Validation

- Targeted ESLint passed for both policy pages and the changed shared renderer/layout.
- The JSON refactor was checked against the previous JSX output: text, markup, dates, metadata and cross-links match exactly for both policies in all five locales. TypeScript checking still reports only the same three unrelated errors below.
- The production build compiled successfully, then failed type checking on existing unrelated imports/types in `NotificationPopUp.tsx` (`@/app/context/global.interface` and its resulting status-index error) and `ImagesSliderBackground.tsx` (`@/lib/utils`). Standalone TypeScript checking reported those same three errors, none in the policy files.
- Browser verification covered both policies in all five locales: the article language is English, section counts are 12/11, metadata is distinct, and cross-links preserve each locale.
- Desktop and mobile visual checks confirmed readable document typography. At 320px and 375px, the policy article and its descendants fit the viewport.
- The existing global footer overflows on mobile and the existing header has crowded navigation at narrow widths. These are outside the policy components and were not changed.
- No authentication, database or unrelated application behavior was modified.

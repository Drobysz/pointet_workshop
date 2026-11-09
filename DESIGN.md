---
name: Pointet Admin
description: The Pointet storefront's editorial identity, adapted to a dense administrative workspace.
colors:
  canvas: "#f3f4f6"
  surface: "#ffffff"
  surface-soft: "#f3f4f6"
  ink: "#27272a"
  ink-soft: "#52525b"
  muted: "#71717a"
  line: "#e4e4e7"
  accent: "#b91c1c"
  accent-mid: "#ef4444"
  accent-soft: "#fecaca"
  accent-tint: "#fee2e2"
  danger: "#dc2626"
  success: "#15803d"
  warning: "#b45309"
typography:
  wordmark:
    fontFamily: "after, Inter, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 400
  title:
    fontFamily: "Tiny5, Inter, sans-serif"
    fontSize: "clamp(2.1rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.1
  label:
    fontFamily: "Tiny5, Inter, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
  figure:
    fontFamily: "Jersey 10, Tiny5, Inter, sans-serif"
    fontSize: "clamp(2.4rem, 4vw, 3.2rem)"
    fontWeight: 400
    lineHeight: 0.9
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "0.75rem"
  inner: "1rem"
  card: "1.5rem"
  chip: "0.5rem"
spacing:
  control-x: "1rem"
  panel: "clamp(1rem, 2.5vw, 1.5rem)"
  page: "clamp(1rem, 3vw, 2.5rem)"
  content-max: "1270px"
components:
  button-primary:
    backgroundColor: "radial-gradient(#fca5a5 10%, rgba(254,202,202,.7) 75%, rgba(209,213,219,.6))"
    textColor: "#7f1d1d"
    rounded: "{rounded.control}"
    height: "42px"
    padding: "0 1rem"
  input:
    backgroundColor: "rgba(255,255,255,.7)"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 1rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.panel}"
---

# Design System: Pointet Admin

## Overview

**Creative North Star: "The Storefront, Back Office Edition"**

The admin panel is the Pointet storefront seen from behind the counter. It keeps the storefront's canvas, surfaces, red accent, pixel display faces and motion, and arranges them for repeated operational work: one page title, bordered-by-shadow white panels, dense tables, and forms with the storefront's rounded controls.

The tokens live in `admin/app/globals.css` (CSS variables plus Tailwind `@theme static` fonts) and the recipes in `admin/styles/_mixins.scss`. Shared primitives are in `admin/components`: `Button`, `Field` (`Input`, `Select`, `Textarea`, `Checkbox`), `Panel`, `PageHeader`, `EntityTable`, `Pagination`, `SearchField`, `Segmented`, `StatusBadge`, `StatePanel`, `Modal`, `DetailList`, `BackLink`, `Spinner`.

**Key Characteristics:**

- Gray-100 canvas with white cards floating on a soft ambient shadow (no card borders).
- Red is the only accent: links, active navigation, focus rings, primary buttons and the page-title gradient.
- Tiny5 for labels, navigation, titles and buttons; Jersey 10 for large figures; Inter for everything that must be read at length.
- Recessed gray blocks (`surface-soft`, 1rem radius) for rows nested inside a card.
- Short ease-out transitions (150–450 ms), `active:scale(.98)` on controls, reduced-motion respected.

## Colors

- **Canvas / Surface / Surface-soft:** page background, cards, nested rows.
- **Ink / Ink-soft / Muted / Faint:** text hierarchy (body, secondary copy, labels, dividers).
- **Accent family:** `accent` for links and titles, `accent-mid` for focus and hover borders, `accent-soft` and `accent-tint` for fills, the radial `#fecaca → #f87171` for selected states.
- **Semantic:** success (paid, approved, delivered, visible), warning (pending, processing), danger (failed, declined, cancelled), info (shipped, refunded).

**The Red Is a Signal Rule.** Red marks the current section, the primary action, a link or a focused control; large red surfaces appear only on the login hero and the product performance card.

## Typography

- **Wordmark:** the storefront's `after` face with the transparent-to-red gradient.
- **Title:** Tiny5 with the wordmark gradient (page headers), plain ink for panel headers.
- **Label:** Tiny5 at 0.95–1.15rem for field labels, table headers, badges, navigation and buttons.
- **Figure:** Jersey 10 for metric values, prices and totals (Latin digits only; Cyrillic copy falls back to Tiny5/Inter).
- **Body:** Inter 15px for table cells, descriptions and form values.

## Layout

Desktop keeps a sticky 264px navigation card; between 768px and 1024px it collapses to a 76px icon rail with titles on hover; below 768px a translucent, blurred top bar holds the wordmark and a burger that unfolds a top sheet styled like the storefront's mobile menu. Page content is centered at 1270px with fluid padding. Tables scroll horizontally inside their card; forms collapse to one column at 640px.

## Elevation & Depth

Cards use `0 0 30px -14px rgba(0,0,0,.35)`; nested rows are flat gray; modals and the mobile sheet add a translucent `rgba(36,39,45,.38)` overlay with a 6px blur behind a white window that carries the storefront's red corner glow.

## Components

- **Buttons:** `primary` (soft red radial, saturates on hover), `secondary` (gray pill), `outline`, `danger`, `ghost` (round icon control). All 42px tall, 0.75rem radius, Tiny5 label.
- **Fields:** 44px controls, 0.75rem radius, gray-300 border, red border and `rgba(252,165,165,.5)` ring on focus, Tiny5 label indented 0.5rem, hint and error below.
- **Chips / Segmented:** storefront category chips; the selected chip takes the red radial and white text.
- **Tables:** inside a card, Tiny5 headers, 0.9rem cells, hover tint `rgba(254,226,226,.45)`, storefront-style pagination (bordered squares, current one filled red).
- **Status badges:** Tiny5, chip radius, semantic tint and text colour.
- **State panels:** Tiny5 title, muted description, spinner for loading, secondary retry button.

## Do's and Don'ts

- **Do** reuse the primitives and mixins instead of re-declaring control styles.
- **Do** keep nested content gray and flat; only the page's cards carry a shadow.
- **Don't** add blue, gradients outside the brand recipes, or borders around cards.
- **Don't** use pixel faces for long text; they are for labels, titles and figures.

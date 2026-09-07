---
name: Workshop Commerce Admin
description: A restrained, Apple-inspired operational workspace for e-commerce administration.
colors:
  action-blue: "#0071e3"
  link-blue: "#0066cc"
  absolute-black: "#000000"
  ink: "#1d1d1f"
  secondary-ink: "#6e6e73"
  divider: "#d2d2d7"
  canvas: "#f5f5f7"
  surface: "#ffffff"
  danger: "#b42318"
typography:
  display:
    fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(42px, 6vw, 72px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, sans-serif"
    fontSize: "clamp(28px, 3vw, 40px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.47
  label:
    fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  control: "9px"
  card: "16px"
  modal: "18px"
  pill: "100px"
spacing:
  control-x: "12px"
  panel: "20px"
  page-min: "24px"
  page-max: "52px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 15px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "10px"
    height: "48px"
    padding: "0 13px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.panel}"
---

# Design System: Workshop Commerce Admin

## Overview

**Creative North Star: "The Quiet Operations Studio"**

The admin workspace borrows the calm precision of Apple’s utility surfaces: neutral layers, strong black-and-white structure, restrained blue actions, and product imagery as the principal source of color. It is compact enough for repeated operational work without becoming visually busy.

Interaction states are clear but quiet. Borders, tonal shifts, focus rings, and short transitions communicate hierarchy; ornament is reserved for product media and the focused black statistics surface.

**Key Characteristics:**

- Neutral canvas with crisp white work surfaces.
- Black navigation and selective high-contrast feature areas.
- Blue used for actions, links, focus, and selected controls.
- Compact tables and forms with generous page-level breathing room.
- Product color and imagery carry visual emphasis.

## Colors

The palette is a neutral operational foundation with one restrained blue accent and a semantic danger red.

### Primary

- **Action Blue:** Primary calls to action, selected controls, and focus borders.
- **Link Blue:** Navigational links inside dense content and tables.

### Neutral

- **Absolute Black:** Persistent navigation, login introduction, and high-contrast analytics panels.
- **Primary Ink:** Headings, body text, and selected pagination states.
- **Secondary Ink:** Supporting copy, metadata, inactive navigation, and placeholders.
- **Divider Gray:** Borders, table rules, and structural separators.
- **Quiet Canvas:** Page background and recessed search/control surfaces.
- **Clean Surface:** Cards, tables, forms, and modal content.

### Named Rules

**The Blue Is a Signal Rule.** Blue identifies an action, link, focus state, or current selection; it is not ambient decoration.

**The Product Owns the Color Rule.** Keep application chrome neutral so product photographs and color swatches remain the strongest chromatic elements.

## Typography

**Display Font:** SF Pro Display with the Apple system sans-serif fallback.
**Body Font:** SF Pro Text with system and Helvetica fallbacks.

**Character:** The type system is direct, compact, and highly legible. Tight display tracking gives first-level headings confidence while body and table text remain conventional and easy to scan.

### Hierarchy

- **Display** (600, fluid 42–72px, 1): Reserved for the login statement.
- **Headline** (600, fluid 28–40px, 1.05): Page titles with compact, negative tracking.
- **Title** (600, 21–32px): Modal and form-section headings.
- **Body** (400, 15px, 1.47): Default interface copy; descriptions generally stop near 64 characters.
- **Label** (600, 12–14px): Fields, table headers, badges, and compact controls.

### Named Rules

**The Two-Level Emphasis Rule.** Use weight 600 for hierarchy and 400 for content; avoid adding extra font weights to manufacture importance.

## Layout

Desktop administration uses a fixed 248px black sidebar and fluid content padding from 24px to 52px. Between 640px and 960px, navigation collapses to a 76px icon rail. Below 640px, navigation becomes an off-canvas drawer and page padding reduces to 16px.

Pages use one main heading followed by bordered white surfaces. Tables remain horizontally scrollable rather than compressing columns below legibility. Complex detail layouts collapse from two columns at 1024px, while summary grids collapse between 704px and 768px. The recurring rhythm is 12–20px inside controls and surfaces, 24–28px between page groups, and responsive breathing room around the page.

## Elevation & Depth

The system is flat by default. White surfaces are separated from the quiet canvas by one-pixel dividers; shadows are reserved for focus rings, the selected segmented control, and modal elevation. Backdrop blur is used only when an overlay or mobile navigation scrim must preserve context.

### Shadow Vocabulary

- **Focus halo** (`0 0 0 3px rgba(0,113,227,.12)`): Keyboard and field focus without moving layout.
- **Selected segment** (`0 1px 3px rgba(0,0,0,.1)`): A small lift for the active analytics range.
- **Modal lift** (`0 18px 50px rgba(0,0,0,.18)`): The only strong ambient shadow.

### Named Rules

**The Flat Until Necessary Rule.** Default surfaces use tone and border; meaningful overlay or interaction states may use elevation.

## Shapes

Controls use gently curved 7–10px corners, content panels use 14–18px corners, and circular geometry is limited to avatars, swatches, icon controls, and gallery controls. Thin neutral borders keep shapes precise. Pills appear only for compact floating control groups, never as the universal form language.

## Components

### Buttons

- **Shape:** Compact rounded rectangle (9px) with a minimum 42–48px touch height for primary actions.
- **Primary:** Action blue with white semibold text; destructive confirmation may use danger red.
- **Hover / Focus:** Quiet tonal change where applicable and a visible two- or three-pixel focus outline/halo.
- **Secondary / Ghost:** White or transparent with a neutral divider border; icon actions use a 34–36px square.

### Chips

- **Style:** Status badges use a quiet gray fill, dark secondary text, a 6px radius, and compact 12px labels.
- **State:** Interactive segmented controls use a recessed canvas track; the selected segment becomes white and slightly lifted.

### Cards / Containers

- **Corner Style:** 14–18px depending on visual importance.
- **Background:** Clean white over the quiet canvas, with black reserved for navigation and emphasized statistics.
- **Shadow Strategy:** Flat at rest; use the elevation vocabulary only for selected or overlaid states.
- **Border:** One-pixel divider gray.
- **Internal Padding:** Usually 16–20px, increasing to fluid 24–40px for the black statistics panel.

### Inputs / Fields

- **Style:** White 48px fields with a 10px radius, medium-gray stroke, and 13px horizontal padding.
- **Focus:** Action-blue border plus translucent blue halo.
- **Error / Disabled:** Semantic danger text for errors; disabled primary actions reduce opacity and retain their size.

### Navigation

Persistent black navigation uses muted gray labels at rest, white labels on hover/current state, and a dark tonal active fill. The icon rail preserves the same destinations at medium widths; the mobile drawer adds a scrim and explicit menu control.

### Data Table

Tables live in a single 16px white panel with integrated search and pagination. Headers are 12px secondary labels, cells are 14px, rows divide with one-pixel lines, and hover uses only a near-white tonal shift. Seven-row API pagination is the standard operational density.

## Do's and Don'ts

### Do:

- **Do** use the quiet canvas, bordered white surfaces, and black navigation as the default hierarchy.
- **Do** preserve visible focus and at least 42px primary interaction height.
- **Do** keep product images grouped and selectable by color.
- **Do** make dense data horizontally scrollable before sacrificing legibility.
- **Do** honor reduced-motion preferences and keep state transitions under 200ms.

### Don't:

- **Don't** use blue as a decorative wash or large ambient background.
- **Don't** add gradients, heavy shadows, glass cards, or ornamental dashboard chrome.
- **Don't** replace established radius tiers with universal pills.
- **Don't** hide error, empty, loading, retry, or disabled states.
- **Don't** introduce a second display family or a large collection of font weights.


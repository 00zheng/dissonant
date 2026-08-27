# Dissonant Design System (Stitch Source of Truth)

Design system specifications extracted directly from the **Dissonant Music App** Stitch project ("Dissonant Noir").

---

## 1. Colors

A high-contrast, brutalist monochrome foundation paired with a single vibrant "Heat" accent.

| Role | Token / Hex | Usage |
| --- | --- | --- |
| **Canvas / Background** | `#000000` / `#131313` | Main app background, OLED depth |
| **Surface (Lowest)** | `#0E0E0E` | Embedded containers |
| **Surface (Low)** | `#1C1B1B` | Card backgrounds, list item backgrounds |
| **Surface (Default)** | `#201F1F` | Default component containers |
| **Surface (High / Highest)** | `#2A2A2A` / `#353534` | Popovers, active containers, borders |
| **Content (Primary Text)** | `#E5E2E1` | Main headings and primary text |
| **Muted Content** | `#E8BDB3` (50% opacity) | Secondary text, metadata, durations |
| **Primary Accent ("Heat")** | `#FF3B00` | Playback progress, active indicators, hero actions |
| **Primary Container** | `#FF562D` | Accent container fills |
| **Borders / Outlines** | `#282828` / `#5E3F38` | 1px structural separators |

---

## 2. Typography

Primary Font Family: **Inter**

| Role | Font Size | Weight | Line Height | Letter Spacing | Case / Extra |
| --- | --- | --- | --- | --- | --- |
| **Display Large** | `64px` | 800 | 1.1 | `-0.04em` | Hero titles, album headlines |
| **Headline Large** | `32px` | 700 | 1.2 | `-0.02em` | Main view headers (Desktop) |
| **Headline Mobile** | `24px` | 700 | 1.2 | Standard | Main view headers (Mobile) |
| **Headline Medium** | `20px` | 600 | 1.4 | Standard | Section titles, modal headers |
| **Body Large** | `16px` | 400 | 1.6 | Standard | Primary list text, body |
| **Body Small** | `14px` | 400 | 1.5 | Standard | Artist names, secondary info |
| **Label Caps** | `12px` | 700 | 1.0 | `0.1em` | UPPERCASE navigation & section tags |
| **Mono Label** | `11px` | 500 | 1.0 | Standard | Timestamps, track index, counters |

---

## 3. Spacing & Rhythm

Built on a strict **4px base grid**.

- **Safe Margins (Desktop):** `40px` (`margin-safe`)
- **Safe Margins (Mobile):** `20px` (`margin-mobile`)
- **Grid Gutters:** `24px` (`gutter`)
- **Vertical Stack Gaps:**
  - `stack-sm`: `8px`
  - `stack-md`: `16px`
  - `stack-lg`: `48px`

---

## 4. Borders and Radii

Flat, geometric shape language with no unnecessary rounded corners.

- **Small Components (Buttons, Inputs):** `4px` (`rounded-sm`)
- **Cards & Album Imagery:** `8px` (`rounded-lg`)
- **Chips & Pills:** `9999px` (`rounded-full`)
- **Engineered UI (Progress Bars, Checkboxes):** `0px` – `2px` radius
- **Borders:** `1px` solid stroke (`#282828` / `#5E3F38`). No heavy borders or colored shadows.

---

## 5. Shadows & Depth

Rejects traditional drop shadows and backdrop blurs in favor of **Tonal Layering** and **Flat Stacking**.

- **Canvas Level:** `#000000` / `#131313`
- **Surface Level:** `#1C1B1B` / `#201F1F`
- **Elevated / Modal Level:** `#2A2A2A` with a solid `1px` border (`#282828`).
- **Overlays & Popovers:** Solid background with high-contrast `1px` border; no backdrop blur.

---

## 6. Navigation

- **Desktop Navigation:** Fixed left vertical sidebar or top utility bar using `label-caps` typography. Active route indicated by solid `#E5E2E1` text and an accent line or dark fill shift.
- **Mobile Navigation:** Bottom navigation bar with `20px` safe-area padding and pill-based active tab indicators.

---

## 7. Page Layouts

- **Library View:** 12-column grid displaying album tiles, transitioning into high-density vertical tracklist rows.
- **Search View:** Top sticky search input bar, quick-filter chips directly below, grouped results by Artists, Albums, and Tracks.
- **Player View:** Fixed bottom audio bar featuring current track thumbnail, title block, `2px` progress line (`#FF3B00`), duration text, and playback controls. Expands to a hero view with large album artwork (4–6 column width).
- **Project Detail View:** Large format header with album cover, tracklist table with 50% opacity metadata, and primary action bar.

---

## 8. Reusable Components

- **Cards (Album Art):** `8px` radius container. Cover art occupies full width. Text block below uses `body-sm` for title and `mono-label` for secondary metadata.
- **Track List Rows:** Full-width rows with `12px` vertical padding. Metadata columns aligned to grid. Secondary text rendered at 50% opacity.
- **Filter Chips:** Pill shape (`rounded-full`). Inactive states use `1px` outline; active states use solid white fill with black text.
- **Progress Bar:** `2px` height track (`#1A1A1A`), filled region uses accent `#FF3B00`. Handle knob is hidden unless hovered.

---

## 9. Buttons and Inputs

- **Primary Button:** Solid White (`#FFFFFF`) background with Black (`#000000`) text, `4px` radius. Alternatively solid `#FF3B00` accent for hero play actions.
- **Secondary Button:** Transparent background with `1px` border (`#282828`) and White text.
- **Input Fields:** Minimalist `4px` rounded container with `1px` border (`#282828`) or bottom-stroke only. Internal padding of `12px 16px`. Placeholder text at 50% opacity.

---

## 10. Hover & Active States

- **Button Hover:** `70%` opacity shift or slight fill shift. No drop shadow.
- **Row / Card Hover:** Background fill shifts to `#1C1B1B` / `#2A2A2A` or border brightens to `#E5E2E1`.
- **Input Focus:** Border color shifts from subtle gray to solid `#FFFFFF` or `#FF3B00`. No outer glow ring.

---

## 11. Responsive Behavior

- **Desktop (>= 1024px):** 12-column grid, `40px` safe margins, persistent left sidebar navigation.
- **Mobile (< 768px):** Reflows to 1–4 column grid, `20px` margins, bottom navigation sheet, full-width track rows.

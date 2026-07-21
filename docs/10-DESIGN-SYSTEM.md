# Design System

The frontend has one visual idea: **stationery**. Notes are ruled stock, graphite and pen
ink, so the interface is built from those materials rather than from generic product-UI
conventions. Every token below is defined once in `src/styles/tokens.css` and used
everywhere — no ad-hoc colours, spacing or radii in component files.

## Palette

Six surface/text colours plus two "marks". The distinction matters: the first six build
the page, the last two only ever appear as something drawn *on* it.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--paper` | `#ECEEE9` | `#14181A` | page background — cool grey-green, the colour of recycled notebook stock |
| `--sheet` | `#FAFBF8` | `#1C2124` | writing surfaces: cards, auth card, editor panel, navbar |
| `--ink` | `#12211F` | `#E7EBE6` | body text — near-black with a teal cast, never pure `#000` |
| `--graphite` | `#5E6C68` | `#9AA6A2` | secondary text, timestamps, labels |
| `--rule` | `#D5DAD3` | `#2E3639` | hairlines, borders, ruled lines |
| `--ink-blue` | `#17565C` | `#7FC4C9` | primary action, links, focus ring — fountain-pen blue-black |
| `--highlighter` | `#F0CF4E` | `#C9A93B` | **mark:** active nav swipe, pinned notes. Nothing else. |
| `--red-pen` | `#9C2F27` | `#E08B80` | **mark:** destructive actions and the margin rule. Nothing else. |

Deliberately avoided: cream (`#F4F1EA`-ish) with a terracotta accent, and near-black with a
single neon accent. Both are what every generated interface currently looks like, and
neither says anything about writing.

## Type

| Role | Face | Why |
|---|---|---|
| Display | **Newsreader Variable** | a text serif drawn for reading on screen — editorial, not decorative. Used for headings, note titles, and the "last edited" annotation in italic. |
| Body / UI | **Public Sans Variable** | neutral grotesque with slightly open apertures; carries labels and controls without competing with the serif. |
| Mono | system stack | only Quill code blocks need it; not worth a third download. |

Both are self-hosted through `@fontsource-variable/*`. No CDN request, so the app renders
identically offline and leaks nothing to a font host.

**Scale** (1.2 ratio, `--text-*`): 12 · 14 · 16 · 19 · 23 · 28 · 34 · 41 px.
Body copy is 16px/1.6. Display sizes set at 1.15 line-height with `-0.015em` tracking.

## Spacing, radius, elevation

- **Spacing** (`--sp-1`…`--sp-8`): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px. Nothing in the
  UI uses a value outside this scale.
- **Radius**: 2px controls, 4px cards, 6px panels. Paper does not have 16px rounded
  corners — the restraint is the point, and it separates the app from the pill-shaped
  default look.
- **Elevation**: a hairline `--rule` border plus a tight, low-opacity shadow — a sheet
  lying on a desk, not a floating material card.

## Signature: the margin rule

Every writing surface — note card, auth card, editor panel — carries a vertical hairline
in `--red-pen` at low opacity, inset 28px from its left edge, with content starting to its
right. It is the margin of an exercise book.

This is intentionally *not* the usual thick accent bar flush against the left edge. The
rule sits inside the surface, the gutter to its left stays empty, and the effect is that
every piece of content in the app looks written on a page.

Two echoes of the same stationery idea, used sparingly:

- the active nav item gets a **highlighter swipe** — a slightly rotated band of
  `--highlighter` behind the text — instead of a filled pill;
- pinned notes get a highlighter band across the top-left corner of the card.

## Layout

- **App shell**: sticky top navbar (wordmark, nav links, avatar menu containing the user's
  name, Profile and Log out). No sidebar: two destinations do not justify 240px of
  permanent chrome, and the space is better spent on the notes.
- **Containers**: `--page-max` 1080px for the dashboard grid; the editor narrows to 760px
  because measure matters when the content is prose. Horizontal padding steps 16 → 24 →
  32px across breakpoints.
- **Breakpoints**: 600px (2-column grid), 900px (3-column), 1024px (full navbar spacing).
  Mobile-first — every rule is written for the small screen and widened from there.

## Non-negotiables

Visible keyboard focus on every interactive element (2px `--ink-blue` outline, 2px
offset) · `prefers-reduced-motion` honoured · `prefers-color-scheme` honoured · all text
meets WCAG AA against its own background · no colour used as the only carrier of meaning.

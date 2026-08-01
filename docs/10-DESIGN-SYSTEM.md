# Design System

Every token lives once in `src/styles/tokens.css`. Component files should never introduce
a colour, radius or spacing value of their own.

The values here were measured off the live Zoho Notebook web app
(`notebook.zoho.com/app/index.html#/all-notes`) using computed styles, so the numbers are
mostly transcribed rather than invented. Where we couldn't use the original (the typeface,
mainly) the substitution is noted below.

## Palette

The chrome is deliberately neutral. All the colour in the app comes from the notes
themselves, which is why the surface tokens are greys and the accent is plain black.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--paper` | `#f7f7f7` | `#1a1a1a` | body background |
| `--sheet` | `#ffffff` | `#262626` | header, popovers, raised chrome |
| `--sheet-sunk` | `#f1f1f1` | `#303030` | recessed panels |
| `--list-surface` | `#f9f9f9` | `#202020` | the note-list pane |
| `--ink` | `#212121` | `#ececec` | text on app surfaces, inverts with the theme |
| `--ink-strong` | `#000000` | `#ffffff` | header and nav text |
| `--note-ink` | `#212121` | `#212121` | text on a note, always dark |
| `--graphite` | 40% ink | 50% ink | timestamps, secondary meta |
| `--rule` | `#d7d7d7` @ 36% | white @ 14% | the hairline between panes |
| `--action` | `#000000` | `#ececec` | primary button, focus |
| `--red-pen` | `#e42527` | `#ff6b6d` | destructive actions |

`--note-ink` is kept separate from `--ink` on purpose. Note surfaces stay a saturated
colour in both themes, so their text has to stay dark even when the rest of the chrome
inverts at night.

### Note colours

The sticky-note palette, sampled from the reference app's picker. The chrome itself only
uses these seven:

`--note-yellow` `#ffed7d` (default), `--note-blue` `#b3d9e6`, `--note-green` `#d1ebb8`,
`--note-pink` `#ffa8b3`, `--note-purple` `#d1c4e9`, `--note-orange` `#ffc27d`,
`--note-grey` `#e3e3e3`.

The full 28-swatch grid the colour picker offers lives in `components/notePalette.js`.

## Type

Zoho ships "Puvi", which is proprietary and can't be redistributed. Public Sans is the
closest freely-licensed humanist sans, so it carries both display and body:

| Token | Face |
|---|---|
| `--font-display` | Public Sans Variable, then Segoe UI, system-ui |
| `--font-body` | same as display |
| `--font-mono` | system stack (ui-monospace, Cascadia Mono, SF Mono, Menlo) |
| `--font-editor` | follows `--font-body` unless the Editor Font setting overrides it |

Newsreader Variable is bundled but only appears if a user picks the serif editor font.
Both families are self-hosted through `@fontsource-variable/*`, so there's no CDN request,
the app renders identically offline, and nothing leaks to a font host.

**Sizes** are kept in px because the source app does: 12, 14, 16, 18, 22, 24, 30, 38.
Line heights are explicit too (`--leading-tight` 22.8px for card titles,
`--leading-normal` 24px, `--leading-title` 32px for the editor title).

## Spacing, shape, elevation

- **Spacing** (`--sp-1` to `--sp-8`) on a 4px base: 4, 8, 12, 16, 24, 32, 48, 64.
- **Radius**: 4px controls, 6px note cards, 8px panels.
- **Elevation**: the chrome is almost entirely flat. `--shadow-sheet` is `none`, and
  shadows are reserved for things that genuinely float (`--shadow-lift`,
  `--shadow-popover`).

## Shell geometry

These are the load-bearing numbers. Changing one of them moves the layout.

| Token | Value | What it sets |
|---|---|---|
| `--header-h` | 48px | top bar |
| `--sidebar-w` | 210px | nav rail |
| `--list-w` | 345px | note-list pane |
| `--drawer-w` | 440px | settings drawer |
| `--nav-row-h` | 29px | a nav row |
| `--nav-inset` | 16px | where nav rows start from the left edge |
| `--card-h` | 85px | note card at the default preview size |
| `--card-gap` | 16px | gap between cards |
| `--measure-max` | 720px | editor body, so prose keeps a readable measure |

The layout is three panes: rail, list, editor. `Workspace.jsx` swaps to one pane at a
time on narrow screens, and the Settings drawer offers a grid layout as an alternative
to the multipane default.

## Theming

Night mode is driven by the Settings drawer, which stamps `data-theme` on `<html>`.
Putting it on the root element means every stylesheet can react to it, including anything
rendered outside the React tree. The editor font works the same way via
`data-editor-font`.

## Legacy aliases

`--ink-blue`, `--ink-blue-deep`, `--ink-blue-wash` and `--highlighter` are left over from
the earlier stationery-themed palette. The auth screens and the profile page still
reference them, so they're aliased onto the current palette to keep those screens
coherent. Retire them as those screens get reworked. `--margin-rule` and `--page-max` are
in the same category and are currently zeroed out.

## Non-negotiables

Visible keyboard focus on every interactive element, `prefers-reduced-motion` honoured,
all text meeting WCAG AA against its own background, and no colour ever used as the only
carrier of meaning.

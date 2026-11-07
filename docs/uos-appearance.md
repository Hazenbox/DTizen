# UOS appearance

**Settings → Appearance → Interface appearance** offers Classic, Glass and UOS. UOS is the
Apple TV-style home screen: wide 16:9 tiles, a focus effect that lifts and lights the
tile, Inter type, Glisse's Liquid Glass, and Continue Watching on top. It builds on
Glass, so it needs no new colour system. It is the default for new installs.

## What the design borrows

From Apple's tvOS guidance (the focus system, parallax and layered artwork, materials,
dark-first colour, readable type at ten feet) and from tvOS 26's Liquid Glass:

| Idea                                 | Here                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Focus is scale, light and depth      | Focused tile scales 1.09, lifts, gains a soft shadow and a specular sheen  |
| Layered artwork moves with focus     | Artwork sits on its own layer and scales 1.06 inside the tile              |
| Name shown only for the focused tile | Caption slides up over a scrim on focus                                    |
| No bright outline                    | The Classic focus ring is replaced by the lift and sheen                   |
| Realistic, unhurried motion          | One 0.38 s ease-out token for tile focus; no bounce, nothing animates idle |
| What you were watching comes first   | Continue Watching is the top row, above the apps                           |
| 16:9 content                         | Tiles and Continue Watching cards are 16:9                                 |

## Glisse

UOS uses Glisse's own components, with their Liquid Glass, from
[0kzh/glisse](https://github.com/0kzh/glisse) (MIT). Their files are copied unmodified into
`launcher/src/vendor/glisse` (see its README) and rendered through `preact/compat`.
`vendor/react-shim.d.ts` gives them React's types.

| Glisse           | Where UOS uses it                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------- |
| TabBar           | The header's Home and All apps tabs (`GlassTabs`)                                         |
| Glass            | Behind the header's Settings and Samsung Home shortcuts                                   |
| SegmentedControl | Settings → Appearance, and every short choice (up to four) in Settings (`GlassSegmented`) |
| Button           | Settings choice buttons and actions, filled when chosen (`GlassChoice`)                   |
| Slider           | Settings → Backgrounds → animation speed                                                  |
| Input            | The weather search and the HDMI names                                                     |

Not used: Glisse's Switch (Settings has no toggles that are not choices) and Menu (the app
actions menu keeps its own focus handling).

How they meet the remote:

- Each segment, tab and button is a Home or Settings control, so the remote focuses it and OK
  picks it. Left and Right move focus through the launcher's navigation, not Glisse's own
  arrow selection, so moving never changes the choice or the page.
- Pointer and touch use Glisse as written: press and drag lift the selection into a lens.
- Glisse's dark tokens are set in `themes.css`, because Chromium 69 ignores the `:where()`
  rules they come in.

Not ported: Glisse bends the page behind the lens with `backdrop-filter`, which Chromium 69
lacks, so on the TV the lens refracts the labels but not the backdrop.

## Type

Inter (Regular, Medium, SemiBold, Bold; SIL Open Font License 1.1, see
`launcher/assets/fonts/README.txt`) is UOS's UI font through `--font-ui`. Classic and Glass
keep their fonts. The full licence text should ship beside the font files.

## Continue Watching

On by default, from every app that exposes a Samsung Continue Watching feed. YouTube is
never included. Choosing apps in Settings → Apps → Continue Watching replaces "every app"
with the choice. A TV that saved its choices before this keeps them.

## Decisions

- **Tile shape belongs to the grid.** `AppGrid` sets `data-shape="wide"` and a
  `--app-card-ratio`; cards and fallbacks size from `--app-card-unit`, the short side,
  so Classic and Glass stay square and unchanged.
- **Saved settings are preserved.** `glassSettings` stays; `uosAppearance` is added. UOS
  implies Glass, so the existing body class and tokens still apply. A TV that saved an
  appearance before UOS existed keeps it.

## Not in this change

Apple's own pages could not be fetched here, so exact tvOS values (safe area, focus
scale) are approximations from third-party summaries. Tilt from the remote's touch
surface has no equivalent on a Samsung D-pad. A Top Shelf banner needs per-app content
the launcher does not have. Disney+ and BBC Sounds have no mark in any Simple Icons
release, so they keep their text labels.

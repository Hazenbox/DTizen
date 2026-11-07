# This fork

This is Hazenbox's fork of [helalaou/AeroTizen](https://github.com/helalaou/AeroTizen). Its
default branch is `main`, and it adds the [UOS appearance](uos-appearance.md) on top of upstream.
UOS, Continue Watching and Inter are on by default for new installs.

## Remotes

| Remote     | Points at                           | Used for                    |
| ---------- | ----------------------------------- | --------------------------- |
| `origin`   | `Hazenbox/AeroTizen` (this fork)    | where the work is pushed    |
| `upstream` | `helalaou/AeroTizen` (the original) | where new changes come from |

## Pulling in upstream changes

```sh
tools/sync-upstream.sh
```

It refuses to run with uncommitted changes, fetches `upstream`, lists the new commits and merges
them into `main`. Then check the result and push:

```sh
npm ci
npm run lint && npm run typecheck && npm run test:components && npm test
npm run test:browser
git push origin main
```

If the merge stops on conflicts, resolve them, `git add` the files and `git commit`. Keep
upstream's changes and re-apply ours on top. UOS stays the default through three values in
`launcher/src/services/preferences/defaults.ts`: `glassSettings`, `uosAppearance` and
`continueWatching`, all `true`.

## Files this fork changes that upstream also edits

These are the likely conflicts:

- `launcher/css/themes.css`, `motion.css`, `base.css`: theme tokens, the `body.uos-ui` block, Glisse's
  tokens and the Inter font faces.
- `launcher/src/home/components/Home/Home.tsx`, `HomeHeader/`, `AppGrid/`, `HomeAppCard/`,
  `ContinueWatchingCard/`, `AppArtwork/`: tile shape, focus, header tabs and the order of rows.
- `launcher/src/home/state/createHomeController.ts`: Continue Watching leads in UOS.
- `launcher/src/settings/`: `ChoiceGroup`, `ChoiceOption`, `AppearanceSettings`, `SpeedSlider`,
  `WeatherSearch`, `InputName` and the settings actions.
- `launcher/js/continue-watching.js`, `app-catalog.js`: YouTube is excluded, and four logos are added.
- `tests/browser/*.spec.cjs`: specs that never chose an appearance are pinned to Classic
  (`glassSettings: false`). Pin any new spec the same way if it assumes Classic.

New files are ours alone: `launcher/src/vendor/`, `launcher/assets/fonts/`, `GlassTabs/`,
`GlassSegmented/`, `GlassChoice.*`, `docs/uos-appearance.md` and `tests/browser/uos.spec.cjs`.

## Licences

AeroTizen is MIT. Glisse (`launcher/src/vendor/glisse`) is MIT, and its licence sits beside it.
Inter is under the SIL Open Font License 1.1; see `launcher/assets/fonts/README.txt`.

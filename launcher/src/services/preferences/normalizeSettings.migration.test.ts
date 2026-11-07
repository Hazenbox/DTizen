import { expect, test } from "vitest";

import { DEFAULT_SETTINGS } from "./defaults";
import { normalizeSettings } from "./normalizeSettings";

const locale = { timeFormat: () => "24" as const, tempUnit: () => "C" as const };
const speed = { MIN: 0.5, MAX: 2 };
const pick = (saved: unknown) => {
  const { glassSettings, uosAppearance, continueWatching, continueWatchingAll } = normalizeSettings(
    saved,
    DEFAULT_SETTINGS,
    locale,
    speed,
  );
  return { glassSettings, uosAppearance, continueWatching, continueWatchingAll };
};

test("a fresh install opens in UOS with every Continue Watching app", () => {
  expect(pick({})).toEqual({
    glassSettings: true,
    uosAppearance: true,
    continueWatching: true,
    continueWatchingAll: true,
  });
});

test("a saved appearance from before UOS keeps its look", () => {
  expect(pick({ glassSettings: true }).uosAppearance).toBe(false);
  expect(pick({ glassSettings: false }).uosAppearance).toBe(false);
  expect(pick({ glassSettings: true, uosAppearance: true }).uosAppearance).toBe(true);
});

test("saved Continue Watching choices from before 'every app' stay as chosen", () => {
  expect(pick({ continueWatching: true, continueWatchingApps: ["a"] }).continueWatchingAll).toBe(false);
  expect(pick({ continueWatching: false }).continueWatchingAll).toBe(false);
  expect(pick({ continueWatching: true, continueWatchingAll: true }).continueWatchingAll).toBe(true);
});

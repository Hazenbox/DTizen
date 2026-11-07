const { test, expect } = require("@playwright/test");
const { openCategory } = require("./drawer_helpers.cjs");

test.beforeEach(async ({ page }) => {
  await page.route("https://**/*", (route) => route.fulfill({ body: "{}" }));
  await page.route("http://127.0.0.1:47790/**", (route) => route.fulfill({ body: "{}" }));
});

const seed = (page, values) =>
  page.addInitScript((values) => {
    if (!localStorage.getItem("aerotizen.settings.v1"))
      localStorage.setItem(
        "aerotizen.settings.v1",
        JSON.stringify({ home: ["demo0", "demo1"], background: "black", showWeather: false, ...values }),
      );
  }, values);

test("a fresh install opens in UOS with wide tiles and Glisse's tab bar", async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");
  await page.waitForFunction(() => AeroTizen.apps.ready);
  await expect(page.locator("body")).toHaveClass(/uos-ui/);
  await expect(page.locator("#grid")).toHaveAttribute("data-shape", "wide");
  const size = await page
    .locator("#grid > [data-id]")
    .first()
    .evaluate((node) => [node.offsetWidth, node.offsetHeight]);
  expect(size[0] / size[1]).toBeCloseTo(16 / 9, 1);
  const tabs = page.locator("[data-header-tabs] [role=tab]");
  await expect(tabs).toHaveCount(2);
  await expect(page.locator("#home-tab")).toHaveAttribute("aria-selected", "true");
});

test("the remote moves along the header without changing the page, and OK opens it", async ({ page }) => {
  await seed(page, { uosAppearance: true, glassSettings: true });
  await page.goto("/");
  await page.waitForFunction(() => AeroTizen.apps.ready);
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("#home-tab")).toHaveAttribute("data-focused", "true");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#apps-tab")).toHaveAttribute("data-focused", "true");
  await expect(page.locator("#home-tab")).toHaveAttribute("aria-selected", "true");
  expect(await page.locator("[data-header-tabs] [tabindex='0']").count()).toBe(1);
  await page.keyboard.press("Enter");
  await expect(page.locator("#apps-tab")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#grid")).toHaveAttribute("data-page", "apps");
});

test("Appearance is Glisse's segmented control, picked with OK and never by moving", async ({ page }) => {
  await seed(page, { uosAppearance: true, glassSettings: true });
  await page.goto("/");
  await page.waitForFunction(() => AeroTizen.apps.ready);
  await page.locator("#gear").click();
  await openCategory(page, "appearance");
  const group = page.locator("#settings-appearance");
  await expect(group.locator("[role=radio]")).toHaveText(["Classic", "Glass", "UOS"]);
  await expect(group.locator('[data-key="settings-appearance:uos"]')).toHaveAttribute("aria-checked", "true");
  await page.locator('[data-key="settings-appearance:uos"]').focus();
  await page.keyboard.press("ArrowLeft");
  await expect(group.locator('[data-key="settings-appearance:glass"]')).toHaveAttribute("data-focused", "true");
  expect(await page.evaluate(() => AeroTizen.settings.getSnapshot().uosAppearance)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(group.locator('[data-key="settings-appearance:glass"]')).toHaveAttribute("aria-checked", "true");
  expect(await page.evaluate(() => AeroTizen.settings.getSnapshot().uosAppearance)).toBe(false);
  await expect(page.locator("body")).not.toHaveClass(/uos-ui/);
  await expect(page.locator("[data-header-tabs] [role=tab]")).toHaveCount(0);
});

test("short Settings choices are Glisse segments, with one control in the tab order", async ({ page }) => {
  await seed(page, { uosAppearance: true, glassSettings: true });
  await page.goto("/");
  await page.waitForFunction(() => AeroTizen.apps.ready);
  await page.locator("#gear").click();
  await openCategory(page, "appearance");
  const size = page.locator("#home-card-columns");
  await expect(size.locator("[role=radio]")).toHaveText(["Small", "Medium", "Large"]);
  await size.locator('[data-key="home-card-columns:4"]').click();
  await expect(size.locator('[data-key="home-card-columns:4"]')).toHaveAttribute("aria-checked", "true");
  expect(await page.evaluate(() => AeroTizen.settings.getSnapshot().homeCardColumns)).toBe(4);
  expect(await page.locator("#editor [tabindex='0']").count()).toBe(1);
});

test("the animation speed slider is Glisse's, and a pointer sets the speed", async ({ page }) => {
  await seed(page, { uosAppearance: true, glassSettings: true, background: "waves", speed: 1 });
  await page.goto("/");
  await page.waitForFunction(() => AeroTizen.apps.ready);
  await page.locator("#gear").click();
  await openCategory(page, "wallpaper");
  const slider = page.locator(".lg-slider input[type=range]");
  await expect(slider).toHaveCount(1);
  await expect(slider).toHaveAttribute("tabindex", "-1");
  await slider.fill("2");
  await expect.poll(() => page.evaluate(() => AeroTizen.settings.getSnapshot().speed)).toBe(2);
});

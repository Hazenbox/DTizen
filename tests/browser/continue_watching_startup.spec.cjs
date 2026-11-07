const { test, expect } = require("@playwright/test");
const prime = "org.tizen.primevideo",
  netflix = "org.tizen.netflix-app";

for (const correctClock of [false, true]) {
  test(
    correctClock
      ? "a cold TV clock correction does not cancel startup retries"
      : "a late startup feed appears without reopening AeroTizen or reloading settled cards",
    async ({ page }) => {
      const reads = { prime: 0, netflix: 0 },
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.clock.install({ time: new Date(correctClock ? 7680 : "2026-10-26T20:00:00Z") });
      await page.route("https://**/*", (r) => r.fulfill({ body: "{}" }));
      await page.route("http://127.0.0.1:47790/**", (r) => r.fulfill({ body: "{}" }));
      await page.route("http://localhost:9013/**", (r) => {
        const isPrime = r.request().headers().app_id === "3201910019365";
        const count = ++reads[isPrime ? "prime" : "netflix"];
        const records =
          isPrime && count < 9
            ? []
            : [
                {
                  app_id: isPrime ? "3201910019365" : "3201907018807",
                  content_id: isPrime ? "prime-item" : "netflix-item",
                  content_title: isPrime ? "Late Prime programme" : "Netflix programme",
                  payload: "saved-launch-data",
                  timestamp: isPrime ? 1000 : 2000,
                },
              ];
        return r.fulfill({
          status: isPrime && count === 1 ? 503 : 200,
          headers: { "access-control-allow-origin": "*" },
          contentType: "application/json",
          body: JSON.stringify(records),
        });
      });
      await page.addInitScript(
        ({ prime, netflix, correctClock }) => {
          localStorage.setItem(
            "aerotizen.settings.v1",
            JSON.stringify({
              glassSettings: false,
              home: [netflix],
              showWeather: false,
              background: "black",
              continueWatching: true,
              continueWatchingApps: [prime, netflix],
            }),
          );
          window.providerLaunches = [];
          window.completedFeeds = 0;
          const open = XMLHttpRequest.prototype.open,
            send = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.open = function (method, url, ...args) {
            this.startupFeed = String(url).startsWith("http://localhost:9013/");
            return open.call(this, method, url, ...args);
          };
          XMLHttpRequest.prototype.send = function (...args) {
            if (this.startupFeed)
              this.addEventListener("loadend", () => {
                window.completedFeeds++;
              });
            return send.apply(this, args);
          };
          window.tizen = {
            application: {
              getAppsInfo: (done) => {
                const inventory = [
                  { id: prime, name: "Prime Video", packageId: prime },
                  { id: netflix, name: "Netflix", packageId: "NetflixPkg" },
                ];
                if (correctClock) window.releaseInventory = () => done(inventory);
                else done(inventory);
              },
              getAppMetaData: () => [
                {
                  key: "http://samsung.com/tv/metadata/app_support_continue_watching",
                  value: "true",
                },
              ],
              launchAppControl: (...args) => window.providerLaunches.push(args),
            },
          };
        },
        { prime, netflix, correctClock },
      );
      await page.goto("/");
      if (correctClock) {
        await page.waitForFunction(() => typeof releaseInventory === "function");
        await page.clock.fastForward(15445);
        await page.clock.setSystemTime(new Date("2026-10-26T20:00:00Z"));
        await page.evaluate(() => window.releaseInventory());
      }
      await page.waitForFunction(() => window.completedFeeds === 2);
      await expect(page.locator("#continue-items > [data-key]")).toHaveCount(1);
      await page.evaluate(() => {
        window.firstCard = document.querySelector("#continue-items > [data-key]");
        window.firstIcon = window.firstCard.querySelector("[data-continue-part=source-badge]");
      });
      for (const [index, delay] of [2000, 5000, 15000, 30000, 60000, 60000, 60000, 60000].entries()) {
        await page.clock.fastForward(delay);
        await page.waitForFunction((expected) => window.completedFeeds === expected, index + 3, {
          timeout: 5000,
        });
      }
      await expect(page.locator("#continue-items > [data-key]")).toHaveCount(2);
      await expect(page.locator("#continue-items > [data-key]").last()).toContainText("Late Prime programme");
      expect(
        await page.evaluate(
          () =>
            window.firstCard === document.querySelector("#continue-items > [data-key]") &&
            window.firstIcon === window.firstCard.querySelector("[data-continue-part=source-badge]"),
        ),
      ).toBe(true);
      await page.clock.fastForward(120000);
      expect(reads).toEqual({ prime: 9, netflix: 1 });
      expect(await page.evaluate(() => window.providerLaunches)).toEqual([]);
      expect(errors).toEqual([]);
    },
  );
}

test("settled cards reorder on the existing clock tick without rereading feeds", async ({ page }, info) => {
  const corrected = new Date("2026-10-27T09:00:00Z"),
    recent = corrected.getTime() / 1000 - 3600;
  const errors = [],
    reads = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date(7680) });
  await page.route("https://**/*", (route) => route.fulfill({ body: "{}" }));
  await page.route("http://127.0.0.1:47790/**", (route) => route.fulfill({ body: "{}" }));
  await page.route("http://localhost:9013/**", (route) => {
    const id = route.request().headers().app_id;
    reads.push(id);
    return route.fulfill({
      headers: { "access-control-allow-origin": "*" },
      contentType: "application/json",
      body: JSON.stringify([
        {
          app_id: id,
          content_id: id,
          content_title: id === "3201910019365" ? "Newer Prime programme" : "Older Netflix programme",
          timestamp: id === "3201910019365" ? recent : recent - 3600,
          payload: "saved-launch-data",
        },
      ]),
    });
  });
  await page.addInitScript(
    ({ prime, netflix }) => {
      localStorage.setItem(
        "aerotizen.settings.v1",
        JSON.stringify({
          glassSettings: false,
          home: [prime],
          showWeather: false,
          background: "black",
          continueWatching: true,
          continueWatchingApps: [prime, netflix],
        }),
      );
      window.tizen = {
        application: {
          getAppsInfo: (done) =>
            done([
              { id: prime, packageId: prime, name: "Prime Video" },
              { id: netflix, packageId: "NetflixPkg", name: "Netflix" },
            ]),
          getAppMetaData: () => [
            { key: "http://samsung.com/tv/metadata/app_support_continue_watching", value: "true" },
          ],
        },
      };
    },
    { prime, netflix },
  );
  await page.goto("/");
  const titles = page.locator("[data-continue-part=title]");
  await expect(titles).toHaveText(["Older Netflix programme", "Newer Prime programme"]);
  expect(reads).toHaveLength(2);
  await page.clock.setSystemTime(corrected);
  await page.clock.fastForward(10000);
  await expect(titles).toHaveText(["Newer Prime programme", "Older Netflix programme"]);
  expect(await page.evaluate(() => AeroTizen.continueWatching.items.map((item) => item.timestamp))).toEqual([
    recent,
    recent - 3600,
  ]);
  await page.evaluate(() => {
    window.correctedCards = [...document.querySelectorAll("#continue-items > [data-key]")];
  });
  await page.clock.fastForward(30000);
  expect(reads).toHaveLength(2);
  expect(
    await page.evaluate(() =>
      window.correctedCards.every(
        (card, index) => card === document.querySelectorAll("#continue-items > [data-key]")[index],
      ),
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath("clock-corrected-order.png") });
  expect(errors).toEqual([]);
});

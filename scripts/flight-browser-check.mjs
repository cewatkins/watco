import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { checkedUrl } from "./browser-guard.mjs";

const url = checkedUrl(process.argv.slice(2).find(arg => !arg.startsWith("--")) ?? "http://127.0.0.1:8080/");
const live = process.argv.includes("--live");
const screenshots = fileURLToPath(new URL("../screenshots/", import.meta.url));
mkdirSync(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const results = [];
const mailboxRequests = [];

async function open(context, viewport) {
  const page = await context.newPage();
  page.on("request", request => {
    if (new URL(request.url()).pathname === "/api/rtc") mailboxRequests.push(request.url());
  });
  if (viewport) await page.setViewportSize(viewport);
  page.setDefaultTimeout(60000);
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && !message.text().includes("ERR_INTERNET_DISCONNECTED")) errors.push(message.text());
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.__controlsTest));
  return page;
}
async function start(page) {
  await page.getByRole("button", { name: "Start engines", exact: true }).click();
  await page.waitForFunction(() => Boolean(document.querySelector("details summary")));
}
async function flightChecks(viewport) {
  const context = await browser.newContext();
  const page = await open(context, viewport);
  assert.equal(await page.evaluate(() => localStorage.getItem("field28-flight-log-v1")), null);
  await page.getByLabel("Airframe", { exact: true }).selectOption("light");
  await page.getByLabel(/Weather/).selectOption("1");
  await page.getByText("Wind: calm.", { exact: false }).waitFor();
  await page.getByLabel(/Weather/).selectOption("0");
  await start(page);
  assert.equal(await page.evaluate(() => window.__controlsTest.getShipSnapshot().aero.id), "light");
  await page.keyboard.press("r");
  assert.equal(await page.evaluate(() => window.__controlsTest.getShipSnapshot().aero.id), "light");

  const switches = await page.evaluate(() => {
    const probe = window.__controlsTest;
    return Array.from({ length: 5 }, () => {
      const before = JSON.stringify(probe.getShipSnapshot());
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyC", key: "c" }));
      return { mode: probe.getCameraMode(), unchanged: before === JSON.stringify(probe.getShipSnapshot()) };
    });
  });
  assert.deepEqual(switches.map(s => s.mode), ["tower", "wing", "spot", "cockpit", "chase"]);
  assert.ok(switches.every(s => s.unchanged));
  for (let i = 0; i < 3; i++) await page.keyboard.press("c");
  await page.getByRole("button", { name: "Spot", exact: true }).waitFor();
  await page.screenshot({ path: join(screenshots, `flight-${viewport.width}-spot.png`) });
  await page.keyboard.press("c");
  await page.getByRole("button", { name: "Cockpit", exact: true }).waitFor();
  const nightUnchanged = await page.evaluate(() => {
    const before = JSON.stringify(window.__controlsTest.getShipSnapshot());
    document.querySelector("button[aria-pressed]").click();
    return before === JSON.stringify(window.__controlsTest.getShipSnapshot());
  });
  assert.ok(nightUnchanged);
  await page.getByRole("button", { name: "Night lighting", exact: true }).waitFor();
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(screenshots, `flight-${viewport.width}-cockpit.png`) });
  await page.keyboard.press("c");
  await page.getByRole("button", { name: "Chase", exact: true }).waitFor();
  for (const [key, sign] of [["KeyA", 1], ["KeyD", -1]]) {
    await page.evaluate(() => window.__controlsTest.prepRollTest());
    await page.evaluate(code => window.__controlsTest.setKeys([code]), key);
    await page.waitForTimeout(500);
    const roll = await page.evaluate(() => window.__controlsTest.getRoll());
    await page.evaluate(() => window.__controlsTest.setKeys([]));
    assert.ok(roll * sign > 0.05, `${key} roll ${roll}`);
  }
  await page.getByText("Radio & local map", { exact: true }).click();
  await page.locator('svg[aria-label^="North-up"]').waitFor();
  const trafficDot = page.locator('svg[aria-label^="North-up"] circle').nth(1);
  const x = await trafficDot.getAttribute("cx");
  await page.waitForTimeout(1000);
  assert.notEqual(await trafficDot.getAttribute("cx"), x, "traffic map dot must move with model");
  await page.screenshot({ path: join(screenshots, `flight-${viewport.width}-tools.png`) });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

  await page.getByRole("button", { name: "End flight / briefing", exact: true }).click();
  assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem("field28-flight-log-v1")).length) > 0);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__controlsTest);
  await page.getByText(/Local flight log · [1-9]\d* flights/).waitFor();
  await page.getByText(/Local flight log · \d+ flights/).click();
  await page.getByRole("button", { name: "Forget local flight log", exact: true }).click();
  await page.getByText("Local flight log · 0 flights", { exact: true }).waitFor();

  await start(page);
  const trafficBefore = await page.evaluate(() => window.__controlsTest.getTrafficSnapshot().x);
  await context.setOffline(true);
  await page.evaluate(() => window.__controlsTest.setKeys(["KeyW"]));
  await page.waitForFunction(() => window.__controlsTest.getSpeed() > 1);
  assert.ok(await page.evaluate(() => window.__controlsTest.getSpeed()) > 1, "solo plane moves offline");
  assert.notEqual(await page.evaluate(() => window.__controlsTest.getTrafficSnapshot().x), trafficBefore, "N344TG flies offline");
  await context.setOffline(false);
  await context.close();
  results.push({ viewport: viewport.width, cameras: true, night: true, controls: true, map: true, log: true, offline: true });
  console.log(`Passed ${url} at ${viewport.width}px`);
}

async function liveChecks() {
  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  const pages = [];
  const room = crypto.randomUUID().replaceAll("-", "");
  try {
    for (const context of contexts) {
      const page = await open(context);
      await start(page);
      await page.getByText("Radio & local map", { exact: true }).click();
      const input = page.getByLabel("Private room code", { exact: true });
      await input.pressSequentially("acdef");
      assert.equal(await page.evaluate(() => window.__controlsTest.getCameraMode()), "chase", "typing a room code must not operate flight controls");
      await input.fill(room);
      await page.getByRole("checkbox").check();
      await page.getByRole("button", { name: "Join room", exact: true }).click();
      pages.push(page);
      console.log(`Joined real mailbox: pilot ${pages.length}`);
    }
    for (const page of pages) {
      await page.getByText("Live direct connection", { exact: true }).waitFor({ timeout: 60000 });
      await page.waitForFunction(() => window.__controlsTest.getRemoteShips().length === 1);
    }
    await pages[1].evaluate(() => {
      window.__controlsTest.prepRollTest();
      window.__controlsTest.setKeys(["KeyA", "KeyW"]);
    });
    await pages[0].waitForFunction(() => {
      const ship = window.__controlsTest.getRemoteShips()[0];
      return ship?.y > 100 && ship.roll > 0.05;
    });
    const ship = await pages[0].evaluate(() => window.__controlsTest.getRemoteShips()[0]);
    assert.notEqual(ship.id, "tg");
    assert.ok(ship.roll > 0);
    await pages[0].screenshot({ path: join(screenshots, "flight-live.png") });
    await pages[1].getByRole("button", { name: "Leave room", exact: true }).click();
    await pages[0].waitForFunction(() => window.__controlsTest.getRemoteShips().length === 0);
    results.push({ live: true, humanShip: true, disconnect: true });
  } finally {
    await Promise.all(contexts.map(c => c.close()));
  }
}
try {
  await flightChecks({ width: 1280, height: 800 });
  await flightChecks({ width: 390, height: 844 });
  assert.deepEqual(mailboxRequests, [], "solo flight must not request signaling");
  if (live) await liveChecks();
  assert.deepEqual(errors, [], "browser runtime/console errors");
  console.log(JSON.stringify({ url, results, errors }, null, 2));
} finally {
  await browser.close();
}

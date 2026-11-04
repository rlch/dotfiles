/**
 * Tells the operator the moment iPhone Duo 512GB Star White (MK2F4ZA/A) can be picked up at an Apple Store in
 * Hong Kong. It never buys or reserves anything: the operator does. No model is called. The `hk-iphone-duo`
 * trigger (dot_config/abyme/triggers.ts) starts it every two hours as the process of .abyme/processes.ts.
 *
 * Each run reads every HK part at every HK Apple Store from Apple's store-pickup endpoint, plain HTTP
 * (`/hk/shop/retail/pickup-message`). The product page itself asks `/hk/shop/fulfillment-messages`, which answers
 * HTTP 541 (Apple's 404) even inside a real browser (2026-11-04); its status is logged each run, so the day it
 * comes back shows. The last result is kept in ~/.local/state/hk-iphone-duo/last.json. A store newly offering
 * the watched part is told once, as an abyme notice (every page, and the phone while the operator is idle) and a
 * macOS notification.
 *
 * Exits non-zero when Apple cannot be read or answers in a shape it does not know: never a silent "unavailable".
 *
 *   node scripts/hk-iphone-duo-pickup.mjs                 a run
 *   node scripts/hk-iphone-duo-pickup.mjs --dry           reads and prints, tells no one, keeps nothing
 *   node scripts/hk-iphone-duo-pickup.mjs --test-notify   one notice marked TEST, nothing read or kept
 */
import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const BUY = 'https://www.apple.com/hk/shop/buy-iphone/iphone-duo';
const PICKUP = 'https://www.apple.com/hk/shop/retail/pickup-message';
const PAGE_FULFILMENT = 'https://www.apple.com/hk/shop/fulfillment-messages';
const STATE_DIR = join(homedir(), '.local/state/hk-iphone-duo');
const STATE = join(STATE_DIR, 'last.json');
const KEY = 'hk-iphone-duo';

/** Every HK iPhone Duo part, as its own pickup answer titles it (read 2026-11-04). */
const PARTS = {
  'MK2D4ZA/A': '256GB Star White',
  'MK2E4ZA/A': '256GB Night Sky',
  'MK2F4ZA/A': '512GB Star White',
  'MK2G4ZA/A': '512GB Night Sky',
  'MK2H4ZA/A': '1TB Star White',
  'MK2J4ZA/A': '1TB Night Sky',
  'MK2K4ZA/A': '2TB Star White',
  'MK2L4ZA/A': '2TB Night Sky',
};
/** What is told (operator, 2026-11-04): this part alone. The rest are read and kept. */
const WATCH = ['MK2F4ZA/A'];
/** Hong Kong's Apple Stores. One missing from an answer fails the run; a new one is read and logged. */
const STORES = {
  R428: 'ifc mall',
  R499: 'Canton Road',
  R409: 'Causeway Bay',
  R485: 'Festival Walk',
  R673: 'apm Hong Kong',
  R610: 'New Town Plaza',
};
/** `pickupDisplay` as Apple writes it; any other value fails the run. */
const DISPLAYS = { available: true, unavailable: false, ineligible: false };

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const exec = promisify(execFile);

class Shape extends Error {}
const need = (ok, what) => {
  if (!ok) throw new Shape(`Apple's pickup answer changed: ${what}`);
};

async function get(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json', Referer: BUY },
    signal: AbortSignal.timeout(30_000),
  });
  return { status: res.status, text: await res.text() };
}

/** Each part's pickup at each HK store: `{ [store]: { name, parts: { [part]: { available, quote } } } }`. */
async function readPickup() {
  const q = new URLSearchParams({ pl: 'true', location: 'Central' });
  Object.keys(PARTS).forEach((p, i) => q.set(`parts.${i}`, p));
  const { status, text } = await get(`${PICKUP}?${q}`);
  if (status !== 200) throw new Error(`pickup-message answered HTTP ${status}: ${text.slice(0, 200)}`);
  let body;
  try {
    body = JSON.parse(text).body;
  } catch {
    throw new Shape(`not JSON: ${text.slice(0, 200)}`);
  }
  need(body && Array.isArray(body.stores), 'no body.stores');
  const out = {};
  for (const s of body.stores) {
    need(typeof s.storeNumber === 'string' && s.partsAvailability, 'a store without storeNumber or partsAvailability');
    if (s.country && s.country !== 'HK') continue;
    if (!STORES[s.storeNumber]) console.log(`new store in the answer: ${s.storeNumber} ${s.storeName}`);
    const parts = {};
    for (const [part, title] of Object.entries(PARTS)) {
      const a = s.partsAvailability[part];
      need(a, `${s.storeNumber} has no entry for ${part}`);
      need(a.pickupDisplay in DISPLAYS, `${s.storeNumber} ${part} pickupDisplay is ${JSON.stringify(a.pickupDisplay)}`);
      const named = a.messageTypes?.regular?.storePickupProductTitle?.replace(/ /g, ' ');
      need(!named || named.endsWith(title), `${part} is titled ${JSON.stringify(named)}, not ${title}`);
      parts[part] = {
        available: DISPLAYS[a.pickupDisplay],
        quote: a.messageTypes?.regular?.storePickupQuote ?? a.pickupSearchQuote ?? a.pickupDisplay,
      };
    }
    out[s.storeNumber] = { name: s.storeName, parts };
  }
  for (const n of Object.keys(STORES)) need(out[n], `store ${n} (${STORES[n]}) is missing`);
  return out;
}

/** The page's own request: logged, never relied on. */
async function pageEndpoint() {
  const q = new URLSearchParams({ fae: 'true', pl: 'true', 'mts.0': 'regular', 'parts.0': WATCH[0], location: 'Central' });
  try {
    const { status } = await get(`${PAGE_FULFILMENT}?${q}`);
    return `HTTP ${status}`;
  } catch (e) {
    return e.message;
  }
}

async function sh(cmd, args) {
  const { stdout } = await exec(cmd, args, { maxBuffer: 16 << 20 });
  return stdout;
}
const abyme = (service, fn, args) =>
  sh('abyme', ['call', service, fn, ...Object.entries(args).map(([k, v]) => `${k}=${v}`)]);

/** An abyme notice (cleared first, so a dismissed one toasts again) and a macOS notification. */
async function notify(key, title, body) {
  await abyme('notifications', 'clear', { key });
  await abyme('notifications', 'notice', { key, title, body, source: BUY });
  await sh('osascript', [
    '-e',
    `display notification ${JSON.stringify(body)} with title ${JSON.stringify(title)} sound name "Glass"`,
  ]).catch((e) => console.error(`macOS notification failed: ${e.message.split('\n')[0]}`));
}

/** `{ part, store }` pairs of the watched parts that are available. */
const availableOf = (stores) =>
  Object.entries(stores).flatMap(([store, s]) =>
    WATCH.filter((p) => s.parts[p]?.available).map((part) => ({ part, store })),
  );

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--test-notify')) {
    await notify(
      `${KEY}-test`,
      'TEST: iPhone Duo pickup checker',
      `TEST only, nothing is available: this is how a real alert reaches you. ${BUY}`,
    );
    return console.log('sent the TEST notice');
  }
  const [stores, page] = await Promise.all([readPickup(), pageEndpoint()]);
  const now = new Date().toISOString();
  for (const [n, s] of Object.entries(stores)) {
    const line = Object.entries(s.parts)
      .map(([p, a]) => `${PARTS[p]} ${a.available ? 'AVAILABLE' : '-'}`)
      .join(', ');
    console.log(`${n} ${s.name}: ${line}`);
  }
  console.log(`page's fulfillment-messages: ${page}`);

  let last = null;
  try {
    last = JSON.parse(await readFile(STATE, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw new Error(`${STATE} unreadable: ${e.message}`);
  }
  const was = new Set(last ? availableOf(last.stores).map((a) => `${a.part} ${a.store}`) : []);
  const nowAvail = availableOf(stores);
  const fresh = nowAvail.filter((a) => !was.has(`${a.part} ${a.store}`));

  if (argv.includes('--dry')) return console.log(JSON.stringify({ available: nowAvail, fresh }));

  if (fresh.length) {
    const models = [...new Set(fresh.map((a) => `iPhone Duo ${PARTS[a.part]} (${a.part})`))].join(', ');
    const where = [...new Set(nowAvail.map((a) => `Apple ${stores[a.store].name}`))].join(', ');
    const title = `iPhone Duo pickup open in HK: ${models}`;
    const body = `${models} can be reserved for pickup at ${where}. Buy: ${BUY}`;
    await notify(KEY, title, body);
    console.log(`told: ${body}`);
  } else if (!nowAvail.length && was.size) {
    await abyme('notifications', 'clear', { key: KEY });
    console.log('no longer available anywhere: cleared the notice');
  } else {
    console.log(nowAvail.length ? 'available, already told' : 'not available for pickup at any HK store');
  }

  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(`${STATE}.tmp`, JSON.stringify({ checked: now, page, stores }, null, 2));
  await rename(`${STATE}.tmp`, STATE);
}

main().catch((e) => {
  console.error(e instanceof Shape ? `FORMAT CHANGED: ${e.message}` : `FAILED: ${e.message}`);
  process.exit(e instanceof Shape ? 3 : 1);
});

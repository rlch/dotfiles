---
name: browser
description: Drive a real browser from a coding session with Microsoft's playwright-cli. Headless by default, in a browser of the agent's own; the one shared headed Chromium (logins, 1Password, bot-protected sites such as ImmiAccount) only under a lease from `browser-headed`. Use to open or click through a page, read a snapshot, take a screenshot, inspect console or network. There is no browser MCP server.
---

# Browser: your own headless browser, or the headed one on a lease

Ten agents run at once, so no agent shares a browser with another. Playwright connects to Chromium with
`waitForDebuggerOnStart`, so Chromium holds every new tab until each connected client says go. One hung client
wedges everyone's new tabs blank (2026-10-05). That is why:

- **Headless (the default):** `playwright-cli -s=<name> open` gives you your own daemon and your own Chromium, with
  an in-memory profile and no shared port.
- **Headed (rare):** the persistent "Chromium Debug" profile on `127.0.0.1:9222`, one agent at a time, through
  `browser-headed`.

`PLAYWRIGHT_MCP_CONFIG` (set in fish) already points every session at ungoogled Chromium, headless,
`--disable-features=MacAppCodeSignClone`, with output in `~/Library/Caches/playwright-cli`. Pass no launch flags
of your own, and never launch Chromium or Chrome by hand.

## Headless: everything that doesn't need a login or a human

```bash
S=<task>-$RANDOM                                    # unique; names are shared machine-wide
playwright-cli -s=$S open --idle-timeout=600000 https://example.com
playwright-cli -s=$S snapshot                       # element refs (e15…) for the next commands
playwright-cli -s=$S click e15
playwright-cli -s=$S fill e21 "text"
playwright-cli -s=$S screenshot                     # prints the file path
playwright-cli -s=$S console                        # also: requests, request <n>, tracing-start/-stop
playwright-cli -s=$S close                          # always, when done
```

- The session daemon outlives your shell. `--idle-timeout` (10 min here) reaps it if you forget `close`.
- Never `close-all` or `kill-all`: they end other agents' browsers.
- `playwright-cli --help` lists every command.

## Headed: logins, 1Password, sites that block headless

ImmiAccount (`immi.homeaffairs.gov.au`) is always headed: Akamai returns 403 to headless.

```bash
browser-headed acquire <task>                       # prints http://127.0.0.1:9222, or exits 2 if another agent holds it
playwright-cli -s=<task> attach --cdp=http://127.0.0.1:9222
browser-headed run <task> tab-new https://…          # your own tab; never drive the user's tabs
browser-headed run <task> snapshot                  # every command on the lease goes through `run`
…
browser-headed run <task> tab-close <index>
playwright-cli -s=<task> detach
browser-headed release                              # always; it also reaps every CDP client left behind
```

- **`browser-headed run`, never bare `playwright-cli`, on the lease.** `tab-new` and `tab-select` activate Chromium,
  and aerospace follows it to the `agent` workspace. `run` checks that you hold the lease and puts the user's focus
  back.
- **Held by someone else:** wait and retry, or tell the user. Never `release --force` another agent's lease.
- **Service down:** `acquire` starts it in the herdr `browser` workspace, with no focus change. Never launch the
  browser from your own shell.
- **Logging in:** the user signs in by hand or with the 1Password extension in that profile. Never type a password
  or read one from `op` yourself.
- **Extensions:** ungoogled Chromium has no Web Store button. `browser-headed extension <web store id>` opens
  Chromium's own "Add extension?" dialog (it also updates an installed one); only the user can click Add.
- **Never bring the window forward yourself:** no `Page.bringToFront` in `run-code`.

## Reusing a login headlessly

A site that doesn't block headless can reuse the headed login:

```bash
# while holding the lease, attached:
playwright-cli -s=<task> state-save ~/.local/state/browser-auth/<site>.json
chmod 600 ~/.local/state/browser-auth/<site>.json
# later, in any headless session:
playwright-cli -s=$S state-load ~/.local/state/browser-auth/<site>.json
```

- The file holds live session cookies. Keep it in `~/.local/state/browser-auth/` (dir 700), never in a repo, and
  delete it when the task ends.

## DevTools extras (rare)

- Performance traces, Lighthouse and heap snapshots come from `chrome-devtools` (the chrome-devtools-mcp CLI).
- It runs one daemon per machine, so check `chrome-devtools status` first; if another agent's is running, wait.
- Run it on its own throwaway browser and stop it when done:

```bash
chrome-devtools start --isolated --headless --executablePath=/Applications/Chromium.app/Contents/MacOS/Chromium \
  --chromeArg=--disable-features=MacAppCodeSignClone --no-usage-statistics
…
chrome-devtools stop
```

- Never point it at `:9222`.

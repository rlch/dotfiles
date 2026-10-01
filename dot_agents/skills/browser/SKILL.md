---
name: browser
description: Drive a real browser from a coding session with the vendors' CLIs, playwright-cli and chrome-devtools, attached to the shared automation Chromium on 127.0.0.1:9222. Use to open or click through a page, read a snapshot, take a screenshot, inspect console, network or performance. There is no browser MCP server; these CLIs are how a session reaches a browser.
---

# Browser: the vendors' CLIs, on demand

No browser MCP server starts with a session (2026-10-01). Twenty-three sessions were holding 171 idle browser-MCP
processes and 11.6 GB. Each CLI below keeps one background daemon and is run only when a task needs a browser.
Both attach to the ungoogled Chromium on `127.0.0.1:9222`. If nothing answers there, tell the user to run
`chrome-debug`. Never launch stable Chrome.

## Flows: `playwright-cli` (Microsoft, `@playwright/cli`)

```bash
playwright-cli -s=<task> attach --cdp=http://127.0.0.1:9222   # once per task; <task> names YOUR session
playwright-cli -s=<task> goto https://example.com
playwright-cli -s=<task> snapshot                              # element refs (e15…) for the next commands
playwright-cli -s=<task> click e15
playwright-cli -s=<task> fill e21 "text"
playwright-cli -s=<task> screenshot
playwright-cli -s=<task> detach                                # leaves the Chromium running
```

Always pass `-s=<task>` with a name of your own. Sessions on one machine share the Chromium, and the session name is
what keeps your tab yours. `playwright-cli --help` lists every command. The package also ships its own longer guide;
`playwright-cli --help` prints where it is.

## DevTools: `chrome-devtools` (the chrome-devtools-mcp package's CLI)

```bash
chrome-devtools start --browserUrl http://127.0.0.1:9222 --no-usage-statistics   # its daemon, on the shared Chromium
chrome-devtools list_pages
chrome-devtools list_network_requests
chrome-devtools list_console_messages
chrome-devtools performance_start_trace
chrome-devtools status | stop
```

Use it for the network, the console, performance traces, Lighthouse and heap snapshots. Use `playwright-cli` for
clicking through a flow. `chrome-devtools <command> --help` gives each command's flags.

## Rules (global CLAUDE.md › Browser)

- One tab per task, and work in your own tab, never the active one.
- Never bring the window forward. No `Page.bringToFront`, and no target created without `background: true`.
- A screenshot that needs nothing interactive goes to a headless Chromium of your own on another port, started with
  `--disable-features=MacAppCodeSignClone`. Kill it by PID when done.

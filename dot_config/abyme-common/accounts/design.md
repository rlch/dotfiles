# accounts: which Claude account an agent abyme launches runs on

The operator's own plugin, on `agents.prepare`. Not abyme's, and unrelated to `cl` / `clodcurrent`
in a terminal, which stay as they are, on their own account folders.

## Accounts are setup-tokens (resource-budgets 5.4, 2026-10-24)

- An account is a setup-token in the keychain, `abyme-accounts-<slug>` (account `$USER`), made by
  `claude setup-token` and good for a year. Which accounts there are, and when each token was
  made, is the keychain's to say: listed from its attributes (`security dump-keychain`, which
  prints no secret), at most once a second, the token made again replacing the one before (`mdat`).
  Five on 2026-10-24: main, richard, hsone, tuteroai, rjmhjkl; rjmathies on 2026-10-25.
- A Claude launch of the owner's gets its account's token as the harness's
  `CLAUDE_CODE_OAUTH_TOKEN` (`secret`) and the slug (`account`), on Claude Code's default config
  folder: no `CLAUDE_CONFIG_DIR`, so every agent's sessions are in one folder and a resume finds
  its own. abyme gives `secret` only to the owner's launches; another user's agent runs on that
  user's own sign-in, never a pool account.
- Each token is its own login (no two slugs share one), so a row is one account.
- Gone with the per-account folders (5.4): token renewal, the conversation sync between folders,
  trust written into each folder's `.claude.json`, the `/api/oauth/usage` read and the usage file
  shared between profiles, `clodcurrent renew --login` in a terminal, and ignore by clodcurrent's
  `.clodcurrent-disabled`. Before the switch every agent's session was copied, newest kept, from
  each `~/.claude-<slug>/projects` into `~/.claude/projects`, once, by hand.
- Checked on a setup-token (2026-10-24): a turn runs on it alone (`apiKeySource: none`), and
  WebSearch and WebFetch work. `get_usage` does not answer under one: its windows come from the
  harness's `rate_limit_event`.

## Usage

| | the plugin |
| --- | --- |
| Push | each turn, Claude's adapter says how full its account is (`rate_limit_event`), and abyme keeps it on the agent (`usage_limits` in `agents.all`). On the debounced agents change, each account takes its agents' `five_hour` and `seven_day` entries newer than its read and its last push taken: each overwrites that window, the other and the model windows kept. The read is kept in the store, so a cap stands across abymed's restarts. An account no harness has spoken of reads as unused until its first turn does. `rejected` puts that window at 100 and marks the account spent until it resets |
| Score, model windows | clodcurrent's (`pick.ts`); the model is the launch's value of category `model` |
| Tiers | clodcurrent's first two: free and not capped, then not capped; then an account whose read is stale (older than 30 min) and near its cap (5h 90, 7d 85), which may already be full: it is tried last (hsone read 89% of its week for 13 h after its token answered its weekly limit, 2026-10-25). A capped account (a window at 100, or spent) is never picked: with only those left, the launch fails with `every account is capped; the first back is <slug> at <ISO>`. A pinned account stays pinned while it has room; capped (a window at 100, or spent), it is skipped by quota until it resets, then the agent returns to it (operator, 2026-10-26) |
| Busy | per account: abyme's agents whose `agents.all` record is `busy` (the agents plugin's one rule), by the `account` their launch said, plus a pick counted from the moment it is made |
| Warm | an agent taken up again (`resume`) within an hour of its last call stays on the account that call ran on (its record's `account`), busy or worn, unless that account is spent, has a window at 100, has the model's window spent, or is gone or ignored; then, and past the hour, the pick is by quota. A pin goes first. Its last call is the later of its harness's last usage push (`usage_limits[].at`) and, read only when that is past the hour, its transcript's last assistant line (`~/.claude/projects/<cwd, non-alphanumerics as ->/<session>.jsonl`, its last MB; not a subagent's, not `<synthetic>`). Not the push alone: 30 of 485 agents' was over 5 minutes older than their last answer (up to 46). Not the file's mtime: Claude Code writes `cost-state` and `last-prompt` there as it exits. Why: prompt caches are per account and agents write 1-hour ones; abyme stops an idle agent after 15 minutes and every resume re-picked, preferring headroom and no busy agents, so a warm agent moved and re-wrote its ~250k-token context at the cache-write price. 388 of the 394 cache rebuilds 5–60 minutes after an agent's last call (22–24 Oct) came with its account changing, ~7% of all usage |
| Limit hit | a launch with `limited` (the agent's last turn hit a usage limit) marks the account it ran on spent until the window that caps it resets (`binding`: the one its read has at 100, the later when both; else the one the message names), else an hour; the pick then moves the agent, and abyme sends the prompt again there. A pinned agent moves too, and returns to its pin once that has room. The marks are kept in the store, so a restart puts no spent account back in the rotation (hsone, every agent's pick after the 2026-10-24 restart); one past its end is dropped. load's accounts count a spent account's window capped until the mark ends, so a limited agent waits for an account a pick would give it, not one only its read says has room |
| Probe | picks as for a launch (the harness opens a session to say its choices) |
| Ignore | "Ignore Claude account…" takes one off the rotation (kept in the store); "Use Claude account again…" puts it back |

## Setup-tokens

- `abyme call accounts token slug=<s>` (and "Sign in to Claude account…") runs `claude setup-token`
  under the plugin, never in a terminal, so the token is in no scrollback: its stdin a fifo in the
  mint's scratch, held open (with stdin closed it never opens the browser); `BROWSER` a script that
  writes the authorize URL there; its pid kept there. It answers that URL: an agent opens it on
  browser profile `claude-<s>` and hands it to the operator, or the command opens it for them. Once
  they Authorize, the token goes straight to the keychain (`security -i` on stdin). A slug with no
  token yet is a new account.
- Off this Mac (a phone, another computer) the localhost callback is out of reach and Claude shows a
  code instead: `abyme call accounts code slug=<s> code=<code>` writes it into the waiting
  setup-token's fifo.
- One mint at a time an account. A mint whose setup-token process is gone (abymed restarted under
  it) is known by its pid and made again, never answered as waiting (it was, forever, 2026-10-24).
- `tokens()` and the view's `tokens` say when each ends, a year after the keychain says it was
  made; 30 days before, the status bar says "sign in: <slug>".
- `abyme call accounts revoke slug=<s>` takes the token out of the keychain and closes the agents on
  it; the answer points at claude.ai/settings/claude-code, where Claude revokes it.

## Tokens

- Read from the keychain for one launch, held only for it. Never in the store, a value a page
  follows, a log line, an error, an answer or a command's arguments.
- Pages see an account's slug and its windows' percentages and reset times; never an email, uuid
  or token.

## What the operator sees

- **Status segment** (right): how many accounts have quota left, each one's windows in its tooltip,
  and a token near its year's end. "Back in" is the row's `back`, the reset of the window that caps it.
- **`abyme call accounts view`**: `{ accounts: AccountSeen[], tokens }` (`pick.ts`), one per
  account: `slugs`, `five`/`seven` in percent (null: unknown), their resets, per-model `windows`,
  `capped` (a window its read has at 100, or a spent mark: a refusal the account itself gave, until
  it resets), `binding` (`five` or `seven`), `back`, `stale` (its read older than 30 min), `spent`
  (`{ until, window }` while a turn's limit keeps it out of picks), `read` (when the numbers were
  pushed), `agents` (busy on it). The status bar and load's Resources read it (`load.readers`).
- **Which account an agent is on**: the agent's `account`; `abyme call accounts agents`.

## Pins and the agent's row

- New agent has an **Account** field (`agents.fields`): By quota, or an account. Its pick reaches
  `prepare` as `with["accounts.account"]` and is kept as the agent's pin, by `launch.agent`.
- "Run on account…" in the agent's menu changes that pin; "By quota" sets it to `auto`, which
  overrides the field on later resumes.

## As built

- `server.ts` (the hook, pushes, busy, setup-tokens, the service), `pick.ts` (clodcurrent's score,
  tiers and model windows, the keychain listing, nothing of abyme), `client.tsx` and `segment.tsx`
  (the status segment, "Run on account…", "Sign in to Claude account…"), `options.ts`. `test.ts`, in
  the source only: `node dot_config/abyme-common/accounts/test.ts`.
- The service: `token`, `code`, `tokens`, `revoke`, `pick [model=…]` (what a launch would get,
  counting nothing), `view`, `agents`, `pin agent=… slug=…` (`slug:=null` takes it off), `pins`,
  `ignore`, `ignored`.
- Set up by `common()` in `abyme-common/index.ts`: `accounts.setup()`.

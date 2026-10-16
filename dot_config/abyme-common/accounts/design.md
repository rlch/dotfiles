# accounts: which Claude account an agent abyme launches runs on

The operator's own plugin, on `agents.prepare`. Not abyme's, and unrelated to `cl` / `clodcurrent`
in a terminal, which stay as they are. The off-herdr design's example
(`~/dev/abyme/openspec/changes/archive/2026-10-09-off-herdr/examples/accounts/server.ts`) is the
starting point; this says where it changes.

## What clodcurrent does (read 2026-10-10, ~/dev/clodcurrent/src)

- **Accounts** (`account.rs`): `~/.claude` (`main`, identity in `~/.claude.json`) and each
  `~/.claude-<slug>` whose `.claude.json` has `oauthAccount.emailAddress`; identity is
  `accountUuid`, else the email; `.clodcurrent-disabled` hides a folder.
- **Tokens** (`keychain.rs`, `oauth.rs`): the keychain item `Claude Code-credentials` (main) or
  `Claude Code-credentials-<first 8 hex of sha256(folder)>`, account `$USER`, read with
  `security find-generic-password -w`; JSON `claudeAiOauth { accessToken, refreshToken, expiresAt }`.
- **Quota** (`usage.rs`, `usage_cache.rs`): `GET https://api.anthropic.com/api/oauth/usage` with
  `Authorization: Bearer <accessToken>` and `anthropic-beta: oauth-2025-04-20`, once per identity
  per launch, cached 60 s on disk, a 30-minute-old answer used when the API fails or answers 429; a
  window whose reset has passed counts as 0. Answer: `five_hour`, `seven_day`, `seven_day_opus`,
  `seven_day_sonnet`, `limits[]` (per-model weekly windows).
- **Score and pick** (`usage.rs`, `select.rs`): 5-hour headroom plus refill due within 5 h, gated
  below 15 % weekly left, urged by weekly burn pace, 7-day left as tiebreak. Four tiers: free and not
  capped; not capped; free; any. An account whose window for the requested model family is spent is
  out; none left is a refusal.
- **Busy** (`session.rs`): `~/.local/state/clodcurrent/sessions.json`, `{ slug, pid, started }` per
  launch under `flock`, dead pids pruned. Busy is per identity.
- **Renewal** (`account.rs`, `renew.rs`): on every launch's quota read, an expired non-main token is
  renewed (`POST https://platform.claude.com/v1/oauth/token`, refresh grant) and written back with
  the credential on `security add-generic-password -w`'s command line, even while a Claude runs on
  it. `clodcurrent renew` guards live sessions; `--login` runs `claude auth login`.
- **Trust** (`trust.rs`): `hasTrustDialogAccepted` and `hasCompletedProjectOnboarding` on the git
  toplevel in the account's `.claude.json`, under `$HOME` only.
- **Sync** (`sync.rs`): every launch copies the newest of each `projects/<p>/<s>.jsonl` touched in
  14 days into every account folder (before exec on a resume, detached otherwise); `sync` also
  merges `history.jsonl`.
- **Shared config** (`sharing.rs`), **add**, **login**: symlinks main's settings, skills, hooks into
  each folder; onboarding.

## What the plugin does

| | the plugin |
| --- | --- |
| Accounts | as clodcurrent, through `abyme.fs` |
| Quota | as clodcurrent, kept in an `abyme.value` (60 s fresh, 30 min stale on failure) |
| Score, tiers, model windows | as clodcurrent; the model is the launch's value of category `model` |
| Busy | as clodcurrent, per identity: `sessions.json` read only (terminal sessions), plus abyme's live agents by `config_dir` (status not `done`), plus a pick counted from the moment it is made, as clodcurrent registers at launch (operator, 2026-10-10: same logic as clodcurrent) |
| Sync | as clodcurrent: the newest copy of each conversation touched in 14 days into every account folder, mtime kept; in the background on each launch, and finished before a resume starts (operator, 2026-10-10) |
| Trust | as clodcurrent, written only at the version read (`ifVersion`) |
| Renewal | only an idle, non-main account whose token has expired; written through `security -i` on stdin (operator, 2026-10-10: renew) |
| Probe | picks as for a launch (the harness opens a session to say its choices); no trust write |
| Left out | `history.jsonl`, shared-config symlinks, `add`, login |

## Tokens

- Read from the keychain at each request, held only for that request. Never in the store, a value
  a page follows, a log line, an error, an answer or a command's arguments.
- Sent only to `api.anthropic.com/api/oauth/usage` and, for renewal, `platform.claude.com/v1/oauth/token`,
  the two endpoints clodcurrent calls.
- Pages see an account's slug and its windows' percentages and reset times; never an email, uuid
  or token.

`abyme.net.fetch` used to put headers on curl's command line; abyme 60b13e6c gives curl a 0600
config file instead, live since f66d5564.

## What the operator sees

- **Status segment** (right): how many accounts have quota left ("4/8 accounts"), each account's
  windows in its tooltip (operator, 2026-10-10: one item, not one per account).
- **Which account an agent is on**: its `config_dir` is kept on the agent, but nothing a plugin can
  add shows on an agent's row or chat header. A gap; meanwhile `abyme call accounts agents`.
- **A pin**: the agent menu's "Run on account…" sets the account for that agent's next resume (by its
  session). Pinning a new agent needs a field on New agent and the agent's id on the launch; neither
  exists. Gaps.

## Pins and the agent's row (abyme a9ec1b9c)

- New agent has an **Account** field (`agents.fields`): By quota, or an account. Its pick reaches
  `prepare` as `with["accounts.account"]` and is kept as the agent's pin, by `launch.agent`.
- "Run on account…" in the agent's menu changes that pin; "By quota" sets it to `auto`, which
  overrides the field on later resumes.
- Each agent's row and chat header say its account (`agents.badges`), "pinned" or "by quota" on hover.

## As built (2026-10-10)

- `server.ts` (the hook, quota, tokens, busy, trust, sync, the service), `pick.ts` (clodcurrent's
  score, tiers and model windows, nothing of abyme), `client.tsx` and `segment.tsx` (the status
  segment, "Run on account…"), `options.ts`. `test.ts`, in the source only, is clodcurrent's
  selection and scoring tests against `pick.ts`: `node dot_config/abyme/accounts/test.ts`.
- The service: `abyme call accounts pick [model=…]` (what a launch would get, counting nothing),
  `agents`, `pin session=… slug=…` (`slug:=null` takes it off), `pins`, `sync`, `view`.
- "Run on account…" shows on an agent whose `kind` is `claude` or unsaid. Pins are by agent id.
- Checked on a scratch abymed with a fake home, keychain and API: picks in order b, a, main, then b
  in use; a Fable launch skips the account whose Fable week is spent; codex untouched; trust written;
  sync copies newest, times kept; a pinned resume runs on the pin; an expired idle token renewed
  over stdin, other fields kept; an account in clodcurrent's register is busy and not renewed; no
  token in `security`'s arguments, abymed's log or its state; the segment, its tooltip and the menu
  pin in a headless page, console clean. No real quota read was made.
- Not on until `init.ts` sets it up: `import accounts from "./accounts"; accounts.setup();`.

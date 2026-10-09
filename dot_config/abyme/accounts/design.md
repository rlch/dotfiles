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
| Busy | abyme's live agents per account (`agents.items`, `config_dir`, status not `done`), plus launches it picked in the last 60 s that are not listed yet, plus `sessions.json` read only |
| Spread | among accounts that are not capped, fewer running agents first, then score: twenty launches spread instead of all landing in tier 2's best |
| Resume | stays on the account whose folder holds the session; if that account is capped, picks another and copies that one transcript there first |
| Trust | as clodcurrent, written only at the version read (`ifVersion`) |
| Renewal | only an idle, non-main account whose token has expired; written through `security -i` on stdin |
| Probe | picks as for a launch (the harness opens a session to say its choices); no trust write |
| Left out | the all-folders sync, `history.jsonl`, shared-config symlinks, `add`, login |

**Why no sync.** The `claude` reader now looks in the agent's own `config_dir` first, so abyme never
needs a copy. A resume needs the transcript in the folder it runs under; staying on the session's
account does that with no copy, and the one-file copy covers a switch. What the operator loses: an
abyme agent's conversation is not in the other accounts' folders until a terminal `cl` launch runs
clodcurrent's own sync, which it does on every launch anyway. What they gain: no copying of every
recent transcript into every folder every few minutes.

## Tokens

- Read from the keychain at each request, held only for that request. Never in the store, a value
  a page follows, a log line, an error, an answer or a command's arguments.
- Sent only to `api.anthropic.com/api/oauth/usage` and, for renewal, `platform.claude.com/v1/oauth/token`,
  the two endpoints clodcurrent calls.
- Pages see an account's slug and its windows' percentages and reset times; never an email, uuid
  or token.

**Gap in abyme**: `abyme.net.fetch` runs `curl -H "<name>: <value>"` (crates/abymed/src/host/procs.rs,
`fetch`), so a bearer header is on curl's command line, readable in `ps` for the length of the
request. The plugin is not to be turned on until `fetch` takes headers off the command line (curl
reads them from a file or stdin: `-H @file`, `-K -`).

## What the operator sees

- **Status segment** (right): each account's 5-hour use, the 7-day and model windows in its title;
  a capped one dimmed.
- **Which account an agent is on**: its `config_dir` is kept on the agent, but nothing a plugin can
  add shows on an agent's row or chat header. A gap; meanwhile `abyme call accounts agents`.
- **A pin**: the agent menu's "Run on account…" sets the account for that agent's next resume (by its
  session). Pinning a new agent needs a field on New agent and the agent's id on the launch; neither
  exists. Gaps.

## Gaps for abyme

1. `net.fetch` puts headers on curl's command line.
2. `Launch` carries no agent id: a pin per new agent, and matching a pick to the agent it became,
   are not possible.
3. No list for a plugin to add to an agent's row, chat header or the New agent form.

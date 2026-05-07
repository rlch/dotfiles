# Ollama + Hermes Agent — quick reference

Hardware: **M5 Max, 128GB unified memory, 40 GPU cores**. Full open-weights
range fits, including 120B-class. (`Brewfile.heavy` only — mbp role, not mini.)

Stack:
- **Hermes Agent** (NousResearch) — primary AI CLI. Cloud-first: OpenAI
  `gpt-5.5-codex` for the heavy lifting, `gpt-5-mini` for auxiliary
  classifiers/summarisers. OpenRouter + Cerebras wired as alternates.
  Self-improving skills, cross-session memory, cron scheduler, MCP, and
  messaging gateways (Telegram/Discord/Slack/WhatsApp/Signal/Email).
- **Ollama** — local LLM daemon on `:11434`. Used for offline / privacy /
  experimentation. Reachable from Hermes as `/model custom:ollama:<id>`.

Docs: <https://hermes-agent.nousresearch.com/docs/>

---

## 1. Ollama setup

```sh
# Open Ollama.app once from /Applications. Grant permissions. The menu-bar
# app starts the daemon on :11434 and persists across reboots.

# Persistent env vars (set BEFORE the daemon, then quit + relaunch the app —
# launchctl setenv survives the menu-bar app re-launch).
launchctl setenv OLLAMA_KEEP_ALIVE 24h          # stay loaded all day
launchctl setenv OLLAMA_CONTEXT_LENGTH 65536    # Hermes wants ≥64k for tool loops
launchctl setenv OLLAMA_FLASH_ATTENTION 1
launchctl setenv OLLAMA_KV_CACHE_TYPE q8_0      # KV cache RAM savings
launchctl setenv OLLAMA_MAX_LOADED_MODELS 3     # juggle small + medium + big

# Pull starter models — 128GB means no quant compromises.
ollama pull qwen3-coder-next:30b   # ~22GB MoE — main coding/agent
ollama pull qwen3.6:27b            # ~36GB dense — best SWE-bench (Apr 2026)
ollama pull gemma4:8b              # ~5GB — fast small
ollama pull hermes-4:14b           # ~9GB — tool-calling specialist
ollama pull nomic-embed-text       # embeddings (RAG later)
# Optional bigger:
# ollama pull gpt-oss:120b         # ~70GB Q4 — fits comfortably
```

### Ollama API surfaces (all on `:11434`, share loaded models)

- `/api/chat` — Ollama-native (best for tool calling, parallel calls)
- `/v1/chat/completions` — OpenAI-compatible
- `/v1/messages` — Anthropic-compatible (Claude Code can hit it directly)

### MLX backend

Opt-in since Ollama 0.19 (March 2026). ~1.6× prefill / 1.9× decode vs llama.cpp.
Model card needs an `mlx` tag — falls back to GGUF if absent. Default-on
probably Q3 2026. Check with `ollama show <model>` → look for `engine: mlx`.

---

## 2. Hermes Agent install

**Automated by chezmoi** on heavy-hardware hosts:
[`.chezmoiscripts/run_onchange_install-hermes.sh.tmpl`](../../.chezmoiscripts/run_onchange_install-hermes.sh.tmpl)
runs the official curl|bash installer the first time `chezmoi apply` sees
`hermes` missing from PATH. The installer auto-provisions `uv`, Python 3.11,
Node.js 22, ripgrep, ffmpeg. **Only prerequisite: git.**

Force a reinstall with:

```sh
rm -rf ~/.hermes/hermes-agent ~/.local/bin/hermes
chezmoi apply
```

### Layout

| Path | Tracked? | What |
|---|---|---|
| `~/.hermes/config.yaml` | ✅ `dot_hermes/config.yaml.tmpl` | Main config — providers, aux models, agent behaviour |
| `~/.hermes/.env` | ❌ secrets | `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`, etc. |
| `~/.hermes/hermes-agent/` | ❌ | Source code (installer-managed) |
| `~/.local/bin/hermes` | ❌ | Binary symlink (on $PATH via fish config) |
| `~/.hermes/{memories,skills,cron,logs,auth.json}` | ❌ | Hermes-managed runtime state |

### Bootstrapping `.env`

Secrets live in `~/.hermes/.env` (not in this repo). After first install:

```sh
cat > ~/.hermes/.env <<'EOF'
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-v1-...
CEREBRAS_API_KEY=csk-...
EOF
chmod 600 ~/.hermes/.env
```

Or run `hermes setup` and let the wizard write them.

### Switching to Ollama (offline / privacy work)

Ollama is wired in `config.yaml` as a named custom provider. Switch with:

```sh
/model custom:ollama:qwen3-coder-next:30b
```

`hermes model` for an interactive picker. Match the model's `num_ctx` to
`OLLAMA_CONTEXT_LENGTH` (65536) — Ollama lies about effective context (see §10).

---

## 3. Daily commands

```sh
# Ollama
ollama list                      # what's on disk
ollama ps                        # what's loaded in RAM
ollama run qwen3:7b              # one-shot REPL
ollama show <model>              # template, params, ctx length

# Hermes
hermes                           # interactive TUI (alias: hermes chat)
hermes -c                        # continue most recent session
hermes -r <id>                   # resume specific session
hermes chat -q "prompt"          # one-shot, non-interactive
hermes -s <skill>                # preload a skill at launch
hermes model                     # change model
hermes tools                     # configure toolsets
hermes mcp                       # manage MCP servers
hermes sessions list             # past sessions
hermes skills                    # browse / install / publish skills
hermes cron                      # inspect / tick scheduler
hermes config edit               # ~/.hermes/config.yaml
hermes config set K V            # quick config tweak
hermes update                    # pull latest + reinstall
hermes doctor                    # diagnose
hermes logs                      # tail/filter logs
```

In-chat slash commands worth remembering: `/help`, `/model`, `/tools`,
`/skills browse`, `/<skill-name>`, `/background <prompt>`, `/personality
<name>`, `/reasoning <none|low|medium|high|xhigh>`, `/verbose` (cycles
off→new→all→verbose), `/title <name>`, `/voice on`, `/usage`, `/insights`,
`/compress`, `/retry`, `/undo`, `/new`.

---

## 4. Skills (`~/.hermes/skills/`)

Each skill is a directory with `SKILL.md` (Markdown + YAML frontmatter:
`name`, `description`, `version`, `platforms`). Auto-available as
`/<skill-name>` in chat. Public registry at <https://agentskills.io> (~672
skills as of May 2026); `hermes skills install <path>` to add.

The agent **auto-creates skills** when it completes a complex task (5+ tool
calls), recovers from a dead-end, gets corrected by you, or discovers a
non-trivial workflow. Background maintenance via `hermes curator`.

---

## 5. Cron (`~/.hermes/cron/`)

Jobs in `jobs.json`, output snapshots in `output/{job_id}/{timestamp}.md`.
Schedule formats:

- `"30m"`, `"2h"`, `"1d"` — relative one-shot
- `"every 30m"`, `"every 2h"` — recurring intervals
- `"0 9 * * *"` — cron expressions
- `"2026-03-15T09:00:00"` — ISO timestamps

Jobs can attach skills (`load_skills: [...]`) and route output via `delivery`:
`origin` (back to source — default for messaging), `local` (file only —
default for CLI), or any platform name (`telegram`, `discord`, etc.).

**Cron only ticks while the gateway is running** — `hermes gateway run` (fg)
or `hermes gateway install` (launchd, background).

---

## 6. MCP (`~/.hermes/config.yaml` → `mcp_servers:`)

```sh
cd ~/.hermes/hermes-agent && uv pip install -e ".[mcp]"
```

```yaml
mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/rjm/projects"]
  remote_api:
    url: "https://mcp.example.com/mcp"
    headers:
      Authorization: "Bearer ${MCP_TOKEN}"
```

Tools register prefixed: `mcp_<server>_<tool>`. Both stdio and HTTP/SSE
servers supported. Hermes can also expose itself via `hermes mcp` / `hermes acp`.

---

## 7. Memory + context (two distinct subsystems)

**Memory (`~/.hermes/memories/`)** — auto-managed across sessions:

- `MEMORY.md` — agent's notes (~2,200 chars / ~800 tokens)
- `USER.md` — user profile (~1,375 chars / ~500 tokens)

The agent edits these via the `memory` tool. **Updates are deferred to next
session** — written to disk immediately, but only injected into the system
prompt at session start. Don't expect "remember this" mid-session to be
recallable in the same session.

Toggleable: `memory.memory_enabled`, `memory.user_profile_enabled`.

**Context files** — per-project, loaded by location at session start
(priority order, first match wins):

| File | Scope |
|---|---|
| `.hermes.md` / `HERMES.md` | Walks up to git root (highest priority) |
| `AGENTS.md` | Working dir + subdirs |
| `CLAUDE.md` | Working dir + subdirs (Claude Code already uses this) |
| `.cursorrules` | Project root only |
| `SOUL.md` | Always loaded from `~/.hermes/` (global personality, separate chain) |

Loaded at startup, prompt-injection scanned, truncated at 20,000 chars,
progressively discovered as the agent navigates new dirs in a session.

---

## 8. Telegram gateway (free, runs locally on Mac)

```sh
# 1. Create a bot via @BotFather: /newbot → name → username ending in `bot`
# 2. Find your numeric user ID by messaging @userinfobot
# 3. Wire it up
hermes gateway setup
# Pick Telegram, paste token, paste your numeric ID into the allowlist.
# Or write directly into ~/.hermes/.env:
#   TELEGRAM_BOT_TOKEN=123456789:ABC...
#   TELEGRAM_ALLOWED_USERS=123456789

# 4. Start the gateway (foreground)
hermes gateway run

# 4b. Or install as a launch agent for always-on background
hermes gateway install
```

The Mac must stay awake for the gateway to respond. launchd does NOT wake a
sleeping Mac — either disable sleep on AC, or run `caffeinate` while away.

---

## 9. Config + env vars worth knowing

`~/.hermes/config.yaml` — main config. `~/.hermes/.env` — secrets. Precedence:
CLI args > `config.yaml` > `.env` > defaults. Env-var substitution: `${VAR}`
(bare `$VAR` not supported).

**Daily-driver config keys:**

- `model.default` / `model.provider` / `model.base_url` / `model.context_length`
- `terminal.backend` (`local | docker | ssh | modal | daytona | vercel_sandbox | singularity`)
- `terminal.cwd`, `terminal.persistent_shell`
- `approvals.mode` (`manual | smart | off`) — command-approval prompting
- `agent.disabled_toolsets`, `agent.max_turns` (default 90), `agent.reasoning_effort`
- `memory.memory_enabled`, `memory.user_profile_enabled`
- `display.tool_progress`, `display.show_reasoning`, `display.show_cost`
- `security.redact_secrets`, `security.tirith_enabled`

**Env vars:**

- `HERMES_HOME` — override `~/.hermes`
- `HERMES_MODEL` — override default model
- `HERMES_YOLO_MODE=true` — disable safety checks (use sparingly)
- `OPENAI_BASE_URL` / `OPENAI_API_KEY` — fallback for the custom endpoint path
- `MESSAGING_CWD` — gateway working directory
- `HERMES_API_TIMEOUT` (default 1800s)
- `HERMES_STREAM_READ_TIMEOUT` (120s remote, auto-1800s for localhost)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USERS`

---

## 10. Gotchas (the ones that bite people)

- **launchd PATH stripping (macOS).** The #1 macOS issue. After any Homebrew
  install (e.g. installing ffmpeg or node), re-run `hermes gateway install` so
  the agent's plist captures the new PATH. Verify with:
  ```sh
  /usr/libexec/PlistBuddy -c "Print :EnvironmentVariables:PATH" \
    ~/Library/LaunchAgents/ai.hermes.gateway.plist
  ```
- **Context-length lying.** Ollama reports max ctx, not effective `num_ctx`.
  Set both `OLLAMA_CONTEXT_LENGTH` (daemon env) and `model.context_length`
  (Hermes config) to the same number, or weird things happen.
- **Memory updates are deferred.** Mid-session memory writes don't appear in
  the prompt until the next session.
- **Default `num_ctx` = 2048 on Ollama.** Always override (env above) — Hermes
  needs ≥64k for tool loops.
- **Cold start** of a 30B model is 15–30s. The 24h `KEEP_ALIVE` above prevents
  this once warm.
- **GPU offload split** — if `ollama ps` shows anything other than 100% GPU,
  drop model size or context.
- **Logs:** `~/.hermes/logs/gateway.log`. `tail -50` is the FAQ-recommended
  first debug step.
- **Stopping:** `Ctrl+C` on `hermes gateway run`. The docs don't document a
  clean `gateway stop` for launchd-installed gateways — `launchctl unload`
  the plist if you need to.
- **Upgrading:** `hermes update` (one command, syncs all profiles).
- **No codesigning issues** — Hermes is pure Python/Node, no Gatekeeper drama.
- **LM Studio coexistence:** if you ever run it, it has its own engine on
  `:1234` and own model store. Don't run both unless measured — they fight
  over unified memory.

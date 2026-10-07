# =============================================================================
# Fish entry — runs after conf.d/*.fish (which is where fisher-installed
# plugins live: done, sponge, fzf.fish).
# =============================================================================

# Quiet shell.
set fish_greeting

# --- PATH -------------------------------------------------------------------
# Keep this list short and intentional. Tool-specific PATH entries belong
# to mise (`mise use <tool>`) or the tool's own installer.
# ~/.local/bin goes first so its shims win over Homebrew (e.g. the `op` shim
# that caches 1Password reads for agent processes — see dot_local/bin/op).
fish_add_path -g \
    $HOME/.local/bin \
    /opt/homebrew/opt/rustup/bin \
    /opt/homebrew/bin \
    /opt/homebrew/share/google-cloud-sdk/bin \
    /opt/homebrew/opt/gnu-sed/libexec/gnubin \
    /opt/homebrew/opt/python@3.13/libexec/bin \
    $HOME/.cargo/bin \
    $HOME/go/bin \
    $HOME/fvm/default/bin   # fvm's globally-selected Flutter — populated by `fvm global <ver>`

# --- Env --------------------------------------------------------------------
set -x EDITOR    nvim
set -x VISUAL    nvim
set -x GIT_EDITOR nvim
set -x MANPAGER  'nvim +Man!'
set -x XDG_CONFIG_HOME $HOME/.config

# Go
set -x GOPATH    $HOME/go
set -x GOPRIVATE go.buf.build,github.com

# Rust
set -x CARGO_HOME $HOME/.cargo
# No global RUSTFLAGS: it's a cargo fingerprint input, so a value here that
# differs from what rust-analyzer/GUI/CI see forces each to rebuild the whole
# dep graph into its own variant. Nothing on this machine links the C libpq
# (every Postgres user is pure-Rust sqlx+rustls), so the old
# `-L .../libpq/lib` linked nothing and only polluted the fingerprint. Any
# project that genuinely needs a link path puts it in its own .cargo/config.toml.

# gh enhance — bubbletint theme id (https://lrstanley.github.io/bubbletint/).
set -x ENHANCE_THEME catppuccin_mocha


# Point SSH_AUTH_SOCK at 1Password's agent so non-OpenSSH clients (Go-based
# tools like upterm, terraform, gcloud, yazi VFS, etc.) find the keys. The
# `ssh` binary itself reads `IdentityAgent` from ~/.ssh/config and ignores
# this var, so OpenSSH behaviour is unchanged.
set -gx SSH_AUTH_SOCK "$HOME/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"

# Claude Code — flicker-free fullscreen TUI (alt-screen renderer with
# virtualized scrollback). Equivalent to `/tui fullscreen`, but persistent
# across sessions. https://code.claude.com/docs/en/env-vars
set -gx CLAUDE_CODE_NO_FLICKER 1

# OpenCode — consume only its native, chezmoi-managed skill root. OpenCode also
# scans ~/.claude/skills and ~/.agents/skills by default; disabling both avoids
# duplicate names selecting another client's implementation nondeterministically.
set -gx OPENCODE_DISABLE_CLAUDE_CODE_SKILLS 1
set -gx OPENCODE_DISABLE_EXTERNAL_SKILLS 1

# playwright-cli (the `browser` skill) — one config for every agent, every
# account, every cwd: ungoogled Chromium, headless, MacAppCodeSignClone off (a
# killed launch otherwise leaks a whole app copy under $TMPDIR/../X), and
# snapshots/screenshots written to one cache dir instead of `.playwright-cli/`
# in whatever repo the agent stands in. chromium-clone-sweep prunes the dir.
set -gx PLAYWRIGHT_MCP_CONFIG "$HOME/.config/playwright-cli/config.json"

# Headroom — local LLM context-compression proxy. Persistent Docker container
# managed by the Docker-native `headroom install` wrapper.
set -gx HEADROOM_PORT     8787
set -gx HEADROOM_HOST     127.0.0.1
set -gx HEADROOM_MODE     token
set -gx HEADROOM_BACKEND  anthropic
set -gx LANGFUSE_BASE_URL https://langfuse.tutero.dev   # self-hosted; keys via `langfuse-env`
#t set -gx ANTHROPIC_BASE_URL http://127.0.0.1:8787

# Java — brew's openjdk is keg-only and invisible to /usr/libexec/java_home.
# JAVA_HOME lets JVM tools (maestro for Android UI flows, Gradle for Android
# builds) find it without a sudo symlink into /Library/Java/JavaVirtualMachines.
# 21, not brew's newest: the Android Gradle plugin refuses a JDK past 21.
set -l _jdk /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
test -d $_jdk; or set _jdk /opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home
test -d $_jdk; and set -gx JAVA_HOME $_jdk

# Android SDK and NDK from the brew casks (Tauri's `android init/dev/build`
# read ANDROID_HOME and NDK_HOME; the emulator and sdkmanager go on PATH).
set -l _android /opt/homebrew/share/android-commandlinetools
if test -d $_android
    set -gx ANDROID_HOME $_android
    set -gx ANDROID_SDK_ROOT $_android
    # avdmanager writes AVDs under ~/.config/.android (XDG); the emulator only
    # looks in ~/.android unless told.
    set -gx ANDROID_AVD_HOME $HOME/.config/.android/avd
    fish_add_path -g $_android/emulator $_android/cmdline-tools/latest/bin
end
test -d /opt/homebrew/share/android-ndk; and set -gx NDK_HOME /opt/homebrew/share/android-ndk

# fzf — Catppuccin Mocha (matches ghostty)
set -gx FZF_DEFAULT_OPTS "\
--color=bg+:#313244,bg:#1E1E2E,spinner:#F5E0DC,hl:#F38BA8 \
--color=fg:#CDD6F4,header:#F38BA8,info:#CBA6F7,pointer:#F5E0DC \
--color=marker:#B4BEFE,fg+:#CDD6F4,prompt:#CBA6F7,hl+:#F38BA8 \
--color=selected-bg:#45475A \
--color=border:#6C7086,label:#CDD6F4"

# --- Abbreviations ----------------------------------------------------------
# Tools
abbr tm  task-master
abbr wr  wrangler
abbr tp  telepresence
abbr h   helm
abbr mk  minikube
abbr kk  k9s
abbr tf  terraform
abbr v   "fg &>/dev/null || nvim"
abbr gw  worktree-tui
abbr cld 'cl --dangerously-skip-permissions'
abbr n   pnpm
abbr frb flutter_rust_bridge_codegen
abbr ai  cl
abbr iz  inbox-zero

# Git (rebase-heavy; gp routes through the per-push approval hook)
abbr gl  'git pull --rebase'
abbr gp  'git push'
abbr gst 'git status -sb'
abbr glo 'git log --oneline --graph --decorate -20'
abbr grc 'git rebase --continue'
abbr gra 'git rebase --abort'

# CLI utilities
abbr f   yazi
abbr j   just
abbr bt  btop
abbr we  watchexec
abbr cgc cargo-gc
abbr ct  'cargo nextest run'        # cargo test alias is blocked by built-in shadowing (cargo#10049)

# chezmoi (dotfiles management)
abbr cz   'chezmoi apply -v'
abbr czd  'chezmoi diff'
abbr cze  'chezmoi edit -a'
abbr czcd 'chezmoi cd'
abbr czre 'chezmoi re-add'

# Edit configs (open the chezmoi source in nvim — apply via `cz` after).
abbr efish 'nvim ~/dev/dotfiles/dot_config/fish/config.fish'
abbr envim 'nvim ~/dev/dotfiles/dot_config/nvim'
abbr edot  'cd ~/dev/dotfiles && nvim'

# Flutter helpers
alias fpg  "flutter pub get"
alias fc   "flutter clean"
alias frm  "flutter run -d macos"
alias frc  "flutter run -d chrome"
alias frcc "flutter run -d chrome --web-header=Cross-Origin-Opener-Policy=same-origin --web-header=Cross-Origin-Embedder-Policy=require-corp"

# Docker compose
alias dcub "docker compose up --build -d && lazydocker"
alias dcd  "docker compose down"

# Misc
alias intel "arch -x86_64"
alias dn    "say done"
alias vo    "nvim +\":setlocal filetype=log | setlocal buftype=nofile\" -"
alias cbo   "tee /dev/tty | cb"
alias sfish "source ~/.config/fish/config.fish"

# eza file listing
if type -q eza
    alias l  "eza -l -g --icons"
    alias ll "l -a"
    alias la ll
end

# --- Vi mode ----------------------------------------------------------------
set fish_cursor_default     block
set fish_cursor_insert      line
set fish_cursor_replace_one underscore
set fish_cursor_visual      block
set fish_vi_force_cursor    1

# --- Interactive-only setup -------------------------------------------------
status --is-interactive; or return
status job-control full

# --- Tool init --------------------------------------------------------------
type -q zoxide   && zoxide init fish | source
type -q starship && starship init fish | source
type -q atuin    && atuin init fish --disable-up-arrow | source
type -q mise     && mise activate fish | source
type -q direnv   && direnv hook fish | source

# Completions for tools that don't ship fish completions natively.
type -q kubectl     && kubectl completion fish | source
type -q flux        && flux completion fish | source
type -q claude-squad && claude-squad completion fish | source

# --- Secrets (not tracked) --------------------------------------------------
test -e ~/.config/fish/secrets.fish && source ~/.config/fish/secrets.fish

# Added by OrbStack: command-line tools and integration
# This won't be added again if you remove it.
source ~/.orbstack/shell/init2.fish 2>/dev/null || :

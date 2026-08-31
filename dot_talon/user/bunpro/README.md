# Bunpro voice control (Talon)

Hands-free bunpro.jp in Firefox, LipSurf-style. Source of truth:
`~/dev/dotfiles/dot_talon/user/bunpro/` (chezmoi-managed — edit there, then
`chezmoi apply`; never edit `~/.talon/user/bunpro/` directly). Real files, not
symlinks: Talon's hot reload breaks through symlinked paths.

Layers on top of:

- **talonhub/community** (`~/.talon/user/community`) — base grammar, Firefox
  app support, `browser.host` scoping.
- **Rango** (Firefox extension + `~/.talon/user/rango-talon`) — generic
  in-page interaction: say the hint letters to click anything, `upper` /
  `downer` to scroll, `go tab <letters>`, `blank <hint>` for new tab.

## One-time setup (per host)

1. Launch **Talon.app**; grant **Microphone** and **Accessibility**.
2. Menu-bar Talon icon → **Speech Recognition → Conformer D** (one-time
   ~500 MB download; nothing is recognized until this is in).
3. Firefox: install **Rango** — https://addons.mozilla.org/en-US/firefox/addon/rango/
   - Click its toolbar icon once (clipboard permission handshake).
   - `about:addons` → gear → **Manage Extension Shortcuts** → make sure
     Rango's *"Get the talon request"* shortcut is bound (its default uses
     the Insert key, which Mac keyboards don't have — rebind if empty).
4. Firefox: install a userscript manager (Violentmonkey), then install
   `bunpro-bridge.user.js` from this directory (Violentmonkey → ⊕ →
   "Install from local file", or open the file and paste).
5. Bunpro **Settings → Reviews**: recommended for the voice flow —
   *Require correct answer: Off*, autoplay audio to taste.

## Review flow

With the bridge userscript active (typing mode):

- **Say the answer** (romaji, e.g. "te i ru" or "teimasu"): if it matches one
  of the current question's accepted answers it is typed and submitted.
  Anything else you say matches no command and **nothing happens** — a
  misheard or wrong answer can never be graded.
- **"next"** — advance past the result screen (plain Enter).
- **"wrong"** — the only way to record a miss. On the result screen it uses
  Bunpro's Backspace grade-toggle; on the question screen it submits a
  deliberately wrong answer (わからない) so Bunpro reveals the correct one.
- **"answer ..."** — escape hatch: dictate anything into the input and
  submit, unverified.

Without the bridge, or in **Reveal & Grade** answering style: "flip" reveals,
"good"/"next" passes, "wrong"/"again" fails.

Utilities during a session (Bunpro's own shortcuts underneath): "play audio"
(a), "translate" (s), "show info" (i), "hide info" (Esc), "furigana" (f),
"oops" (Backspace), "wrap up" (w), "quit session" (q).

## Navigation (anywhere on bunpro.jp)

"bun pro dash", "start reviews", "start cram", "start learn", "show grammar",
"show decks", "show stats", "show settings", "search for ...". Everything
else: Rango hints.

## How the bridge works

`bunpro-bridge.user.js` appends `«BP:<phase>:<ans1>|<ans2>»` to
`document.title` (phase `q` question / `r` result). `bunpro.py` watches the
active window title, romanizes each accepted answer, and publishes the spoken
forms as the dynamic `{user.bunpro_answer}` list — so the recognizer only
ever matches the *current* correct answers.

## Troubleshooting

- Script errors: `tail -f ~/.talon/talon.log`; live poking: `~/.talon/bin/repl`.
- Bridge not finding answers (Bunpro redesigns break extraction):
  `localStorage.setItem("bunproTalonDebug", "1")` on bunpro.jp, watch the
  console, inspect `window.__bunproTalon` (`.sniffed` holds recent quiz API
  payloads — use them to fix the extractors in the userscript).
- Site commands dead but community works: URL scoping may have failed —
  the title fallback needs "Bunpro" in the window title; check Talon has
  Accessibility permission for `browser.host` matching.
- Spoken-romaji recognition is the experimental part (English Conformer
  meets Japanese). If an answer won't register, try syllable-spacing
  ("te i ma su"), or fall back to "answer ..." / Reveal & Grade mode.

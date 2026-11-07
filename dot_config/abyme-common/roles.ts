// What every profile's agents start without, and the helpers that add a role's preset (agents.presets),
// shared by coding (../abyme/init.ts) and tutero (../abyme-tutero/init.ts) so the two never drift.

import agents from "@abyme/agents";

export const official = (ids: string[]) => ids.map((id) => `${id}@claude-plugins-official`);
// A preset's `without` is one list of ids from its harness's inventory (abyme change without-by-adapter):
// for Claude, `plugin:<name@marketplace>`, `server:<name>` and `skill:<name>`.
export type Without = string[];
const plugin = (names: string[]): Without => names.map((n) => `plugin:${n}`);
const server = (names: string[]): Without => names.map((n) => `server:${n}`);
const skill = (names: string[]): Without => names.map((n) => `skill:${n}`);

// What every agent starts without, spread into each role's list by `role()` (abyme change preset-loads;
// operator, 2026-10-25), so a role stops carrying the user config it has no use for.
// Only drops: every skill not named stays listed and loadable, a repository's, the user's and
// abyme's always. figma, commit-commands and skill-creator are off in settings.json for every session.
// What no agent uses: Claude Code's own skills nobody runs here, the workspace canvas plugin (its one
// skill, build-component), and the language servers of languages no repository here is in.
// anthropic-skills' artifact-emulator and import-memory stay listed: a plugin's skill goes only with
// the whole plugin, and the rest of anthropic-skills is used.
export const AGENTS_WITHOUT: Without = [
  ...plugin(["workspace@skills-dir", ...official(["clangd-lsp", "gopls-lsp", "lua-lsp", "pyright-lsp", "swift-lsp"])]),
  ...skill([
    "dataviz", "update-config", "keybindings-help", "fewer-permission-prompts", "find-skills", "plugin-authoring", "init",
    "run", "loop", "simplify", "security-review",
  ]),
];
/** A Claude role's whole list: every agent's, then its own. */
export const full = (w: Without): Without => [...new Set([...AGENTS_WITHOUT, ...w])];

// By role: cloudflare only for infra (langfuse's server is a project server of ~/dev/tutero alone, so
// a preset cannot name it, without-by-adapter 7.2), the mobile server
// (phone control) only for the mobile role, and no language servers for a role that reads no code
// (a lead or a dispatcher too). Each agent paid a mobile-mcp and a node process for it (operator, 2026-10-26).
export const CLOUDFLARE = plugin(official(["cloudflare"]));
export const RUST_LSP = plugin(official(["rust-analyzer-lsp"]));
export const TS_LSP = plugin(official(["typescript-lsp"]));
export const MOBILE = server(["mobile"]);
// The user-level Tutero skills (langfuse; rjm's sentry, slack and to-phone) only for schools' roles
// (prompt-layers audit, operator, 2026-11-05): every other agent listed them for nothing.
export const TUTERO: Without = [...plugin(["rjm@skills-dir"]), ...skill(["langfuse"])];
export const NO_CODE: Without = [...CLOUDFLARE, ...RUST_LSP, ...TS_LSP, ...TUTERO, ...MOBILE];
export const LEAD = NO_CODE;
// abyme's and bevy-ts's roles: TypeScript and Rust.
export const CODE: Without = [...CLOUDFLARE, ...TUTERO, ...MOBILE];

// Teams (the teams and work plugins, set up by code's platform list): a team per piece of work from a
// template in a repository's .abyme/teams.ts, each role's agent starting from one of these presets
// when work first reaches it; each repository's lead is a role of the repository (`roles` in its
// file, `lead@<repo>`), kept open in its main checkout. How work moves is
// the work plugin's skill alone, so each preset says only what its role does.
// What a role runs on: Claude over ACP by default; or abyme's own harness (roles-on-harness), its
// `folder` absolute, ~ or under the agent's folder (`.abyme/harness/<role>`), whose `without` names
// its own tool ids (none yet). Every role is on Claude until the operator switches one (operator, 2026-11-05).
export type On = { provider: "acp"; harness: "claude" } | { provider: "harness"; harness: "abyme"; config: { folder: string } };
export const CLAUDE: On = { provider: "acp", harness: "claude" };
export const role = (id: string, title: string, model: string, without: Without, instructions: string, on: On = CLAUDE) =>
  agents.presets.add({ id, title, model, instructions, ...on, without: on.provider === "acp" ? full(without) : [] });
// Every lead dispatches and never operates (operator, 2026-11-04; abyme change
// rulings-survive-compaction): lead@schools patched an org setting, cherry-picked, deployed prod
// and merged its own iac PR itself, and acted on a summary's "standing ruling".
export const LEADS =
  " Outside what these instructions name as yours, you never operate: no deploy, merge (`gh pr merge`, with `--admin` or not), cherry-pick, change to a setting (a repository's, an organisation's, a cloud's), build, or command that reads or writes a secret, neither yourself nor through your harness's own sub-agents. That work goes to a role of a team; when no template fits, say so and ask the operator for one. The operator's \"you\" and \"I give U permission\" mean your team. A cause or a time you report comes from a tool result you ran; else say whose claim it is. In a design discussion with the operator, keep speccing: start no fix until they are confident it is all specced. When the operator rules on how work goes (skip a check, land past review, allow something), record it at once with teams_rule, their words exactly, what it is about and until when; act only on rulings your rulings file holds.";
export const lead = (id: string, title: string, model: string, instructions: string, without: Without = LEAD, on: On = CLAUDE) => role(id, title, model, without, instructions + LEADS, on);

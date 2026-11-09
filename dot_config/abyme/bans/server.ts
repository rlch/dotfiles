// The operator's own bans, beside abyme's guard (guard.bans, guard.search), as hooks on every
// agent's calls: the two of ~/.claude/guard.py the guard does not carry (abyme change
// hook-substrate; operator's global rules). Plain `claude` outside abyme keeps guard.py.
// It runs on every machine (abymed refuses a half that imports a capability only as optional),
// but hooks hears every machine's items, so it adds its hooks on the control plane alone, the
// operator's Mac, where chezmoi deploys: one copy of each, as before.
import abyme from "@abyme/cell";
import hooks from "@abyme/hooks/inventory";
import fs from "@abyme/fs";
import process from "@abyme/process";
import { LOCAL } from "@abyme/machines/label";

const home = fs.home.replace(/\/+$/, "");
// Where chezmoi deploys, as guard.py's MANAGED_ROOTS; a session's transcripts are not.
const MANAGED = [".config", ".claude", ".agents", ".local"].map((d) => `${home}/${d}/`);
const UNMANAGED = [`${home}/.claude/projects/`];
const managed = (p: string) => MANAGED.some((r) => p.startsWith(r)) && !UNMANAGED.some((r) => p.startsWith(r));
const absolute = (p: string, cwd: string) => {
  const q = p.replace(/^~(?=\/|$)/, home);
  return q.startsWith("/") ? q : `${cwd.replace(/\/+$/, "")}/${q}`;
};

const CHEZMOI = "/opt/homebrew/bin/chezmoi";

/** The chezmoi source of `path`, or null when chezmoi does not manage it. */
async function sourceOf(path: string): Promise<string | null> {
  // By its path: abymed's PATH may not hold Homebrew's.
  const r = await process.run(CHEZMOI, { args: ["source-path", path], timeoutMs: 8_000 });
  return r.code === 0 ? r.stdout.trim() || null : null;
}

if (abyme.machine === LOCAL) {
  // Editing a chezmoi-deployed file: the next `chezmoi apply` overwrites it.
  hooks.items.add({
    id: "bans.chezmoi-deployed",
    on: "tool.before",
    match: { kind: ["edit"] },
    timeout: 10_000,
    async run(event) {
      if (event.on !== "tool.before") return;
      const cwd = event.tool.cwd ?? home;
      for (const p of (event.tool.paths ?? []).map((x) => absolute(x, cwd)).filter(managed)) {
        const src = await sourceOf(p);
        if (src) return { deny: `${p} is deployed by chezmoi and would be overwritten. Edit the source, ${src}, then run \`chezmoi apply\`. Read ~/dev/dotfiles/CLAUDE.md first.` };
      }
    },
  });

  // A Haiku sub-agent: Haiku is never used (the operator's model rule).
  hooks.items.add({
    id: "bans.haiku",
    on: "tool.before",
    match: { kind: ["agent"] },
    run(event) {
      if (event.on !== "tool.before") return;
      const model = String((event.tool.raw.input as Record<string, unknown>).model ?? "");
      return /haiku/i.test(model) ? { deny: "Haiku is never used (global model rule). Use sonnet for retrieval, opus otherwise." } : undefined;
    },
  });
}

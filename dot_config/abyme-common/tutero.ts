// Where Tutero's work is, for the start guard of each profile (abyme tutero-headless-read, design 5):
// coding refuses a start in it, tutero one outside it. A team's worktree is under abyme's worktrees
// folder, so a folder is judged by the repository holding it, its main checkout (`git.origin`).

// A plain import, never `/optional`: init.ts reads an optional service once, before git has
// started, and would see none for good (a cold test abymed, 2026-11-05).
import git from "@abyme/git";

/** Tutero's repositories, each a checkout under it. */
export const TUTERO_DIR = "/Users/rjm/dev/tutero";

const under = (dir: string) => dir === TUTERO_DIR || dir.startsWith(`${TUTERO_DIR}/`);

/** Whether `dir`, or the repository holding it, is under ~/dev/tutero. A folder in no repository
 * (git.origin throws) is not. */
export async function inTutero(dir: string): Promise<boolean> {
  if (under(dir)) return true;
  const held = await git.origin({ dir }).catch(() => null);
  return held != null && under(held.repo);
}

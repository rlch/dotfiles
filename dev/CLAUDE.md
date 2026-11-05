# ~/dev — workspace layout

- `~/dev/<project>/` — projects. Edits here get committed.
- `~/dev/plugins/<host>/<plugin-id>/` — local plugin source code, grouped by host app.
- `~/dev/refs/` — read-only research clones. **All reference clones go here**, not inside the
  project being worked on. Add one with `git -C ~/dev/refs clone --depth 1 <url>`.
- `~/dev/forks/` — the operator's own forks of OSS projects.

Before cloning, check whether the repo already exists in `refs/`, `forks/`, or `plugins/`.

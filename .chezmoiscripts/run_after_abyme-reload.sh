#!/usr/bin/env bash
# Apply what chezmoi just wrote to the running abyme: abyme watches none of its config's files, so
# an edit applies only at `abyme reload` (abyme's docs/abymed/your-config.md). Runs after every
# apply. Silent, and never a failure, when abyme is not running (exit 3), or is a build before the
# reload (its route answers `not_found`, its CLI takes `reload` for a service that is off).

set -uo pipefail

command -v abyme >/dev/null 2>&1 || exit 0
out=$(abyme reload 2>&1)
code=$?
case "$code" in
  0) [ -z "$out" ] || printf 'abyme reload: your config has problems:\n%s\n' "$out" ;;
  3) ;;
  *)
    case "$out" in
      *not_found* | *"reload service is off"*) ;;
      *) printf 'abyme reload did not apply the config (exit %s): %s\n' "$code" "$out" >&2 ;;
    esac
    ;;
esac
exit 0

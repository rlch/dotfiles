# GNU `timeout` under its real name. macOS ships no `timeout`; coreutils
# installs it as `gtimeout`. A wrapper (not a coreutils-gnubin PATH entry) so
# only this one tool is exposed — the rest of BSD coreutils stays unshadowed.
function timeout --wraps gtimeout --description 'GNU timeout (coreutils gtimeout) under its real name'
    gtimeout $argv
end

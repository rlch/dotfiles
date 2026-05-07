function chrome-debug --description 'Launch Chromium with CDP on :9222 so Claude Code MCPs can attach'
    set -l port (test -n "$CHROME_DEBUG_PORT"; and echo $CHROME_DEBUG_PORT; or echo 9222)
    # Chromium silently disables --remote-debugging-port against the default
    # profile (same upstream check as Chrome 137+), so we must point at a
    # sister dir. Persistent across reboots so any logins/extensions you set
    # up here stick around.
    #
    # We launch ungoogled-Chromium (cask: ungoogled-chromium) instead of
    # stable Google Chrome so the agent-controlled browser is visually and
    # process-wise distinct from any manually-opened stable-Chrome window —
    # generic Chromium icon vs. blue Chrome icon, different app name,
    # separate process tree, no Google sign-in churn. Same Blink/V8/CDP
    # under the hood, so DevTools / chrome-devtools-mcp DX is identical.
    set -l profile (test -n "$CHROME_DEBUG_PROFILE"; and echo $CHROME_DEBUG_PROFILE; or echo "$HOME/Library/Application Support/Chromium Debug")
    set -l chrome /Applications/Chromium.app/Contents/MacOS/Chromium

    if not test -x "$chrome"
        echo "Chromium not found at: $chrome" >&2
        echo "Install it via: brew install --cask ungoogled-chromium" >&2
        return 1
    end

    # If something is already listening on the debug port, identify it and
    # decide: short-circuit (it's Chromium and CDP is healthy) or evict
    # (anything else — typically a stale stable-Chrome session squatting on
    # 9222 from a prior `chrome-debug` invocation that targeted Chrome).
    set -l holder_pid (lsof -nP -iTCP:$port -sTCP:LISTEN -t 2>/dev/null | head -n 1)
    if test -n "$holder_pid"
        set -l holder_comm (ps -p $holder_pid -o comm= 2>/dev/null | string trim)
        if string match -q '*Chromium*' -- "$holder_comm"
            if curl -sf --max-time 1 "http://127.0.0.1:$port/json/version" >/dev/null 2>&1
                echo "Chromium already exposing CDP on :$port"
                return 0
            end
        else
            echo "Port :$port held by '$holder_comm' (pid $holder_pid) — evicting before launching Chromium..."
            if string match -q '*Google Chrome*' -- "$holder_comm"
                osascript -e 'tell application "Google Chrome" to quit' 2>/dev/null
            else
                kill $holder_pid 2>/dev/null
            end
            # Wait up to 10s for the port to free.
            for i in (seq 40)
                lsof -nP -iTCP:$port -sTCP:LISTEN -t >/dev/null 2>&1; or break
                sleep 0.25
            end
            # osascript-quit closes Chrome windows but the parent runtime can
            # linger and keep the listening socket — escalate to SIGKILL on
            # whatever's still squatting after the soft-quit timeout.
            set -l still_pid (lsof -nP -iTCP:$port -sTCP:LISTEN -t 2>/dev/null | head -n 1)
            if test -n "$still_pid"
                echo "  soft-quit timed out; SIGKILL pid $still_pid"
                kill -9 $still_pid 2>/dev/null
                sleep 0.5
            end
        end
    end

    # Quit any other Chromium instance not on the debug port so this launch
    # owns the process tree and the --remote-debugging-port flag actually
    # takes effect.
    if pgrep -x "Chromium" >/dev/null
        echo "Quitting existing Chromium so it can relaunch with --remote-debugging-port..."
        osascript -e 'tell application "Chromium" to quit' 2>/dev/null
        for i in (seq 20)
            pgrep -x "Chromium" >/dev/null; or break
            sleep 0.25
        end
    end

    "$chrome" \
        --remote-debugging-port=$port \
        --user-data-dir="$profile" \
        $argv >/dev/null 2>&1 &
    disown
    echo "Chromium debug instance starting on :$port (profile: $profile)"
end

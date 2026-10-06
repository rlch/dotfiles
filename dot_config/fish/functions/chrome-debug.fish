function chrome-debug --description 'Make sure the shared headed Chromium (CDP :9222) is running'
    # The headed browser is a service now: `browser-headed` runs a watchdog in
    # the herdr `browser` workspace that relaunches ungoogled Chromium on the
    # persistent "Chromium Debug" profile (logins, 1Password) whenever it is
    # down. Agents take it one at a time with `browser-headed acquire`;
    # headless work never touches it. This is the human-facing name for `up`.
    browser-headed up $argv
end

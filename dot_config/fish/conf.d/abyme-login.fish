# The keychain's Mistral key for abyme's init.ts (abyme.env), read only in the login shell the abyme
# gateway runs at its start (ABYME_LOGIN_ENV), so a terminal's login runs no `security`.
if set -q ABYME_LOGIN_ENV
    set -gx MISTRAL_API_KEY (security find-generic-password -s abyme-mistral -w 2>/dev/null)
end

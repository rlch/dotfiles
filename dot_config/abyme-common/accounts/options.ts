// What the operator may set for accounts, in init.ts: `accounts.setup({ ... })`.
export default {
  home: { type: "string", title: "Home", description: "Where Claude Code's user settings are read from, for a launch's model; $HOME unless set. For a check." },
  security: { type: "string", default: "security", title: "Keychain command", description: "macOS `security`, or a fake one for a check." },
} as const;

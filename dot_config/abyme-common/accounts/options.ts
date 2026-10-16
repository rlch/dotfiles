// What the operator may set for accounts, in init.ts: `accounts.setup({ ... })`.
export default {
  renew: {
    type: "boolean",
    default: true,
    title: "Renew tokens",
    description: "Renew an expired token of an account nothing runs on, never main's, as clodcurrent does.",
  },
  syncDays: {
    type: "number",
    default: 14,
    title: "Sync days",
    description: "Conversations changed within this many days are copied into every account folder on each launch.",
  },
  home: { type: "string", title: "Home", description: "Where the account folders are; $HOME unless set. For a check." },
  security: { type: "string", default: "security", title: "Keychain command", description: "macOS `security`, or a fake one for a check." },
  usageUrl: { type: "string", default: "https://api.anthropic.com/api/oauth/usage", title: "Usage endpoint", description: "For a check." },
  tokenUrl: { type: "string", default: "https://platform.claude.com/v1/oauth/token", title: "Token endpoint", description: "For a check." },
} as const;

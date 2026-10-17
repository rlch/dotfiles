// What the operator may set for publish, in init.ts: `publish.setup({ ... })`.
export default {
  root: {
    type: "string",
    default: "~/dev/artifacts",
    title: "Artifacts repository",
    description: "A document is exported into its artifacts/<slug>/ and published from there. For a check, a scratch folder.",
  },
  command: { type: "string", default: "artifact", title: "Artifact command", description: "The `artifact` CLI, or a fake one for a check." },
  url: { type: "string", default: "https://artifacts.rjmath.com", title: "Site", description: "Where a published page is, shown before publishing." },
} as const;

rrweb's own builds, copied as published so the plugin needs no build and no node_modules: each is
one ES module with no imports (the recorder's worker inlined as a blob). The view draws its own
controls around the Replayer; rrweb-player's are not used.

| File | From | sha512 of the tarball |
| --- | --- | --- |
| record.js | @rrweb/record 2.1.7, dist/record.js | lIAbWdH8JwRuujURxTBtgrlsPvyBUGXUa9aB5hK8s5DdHgagyLFkIaAWhtthuOwT3o4o4+w38yUVPLc3W2oOrw== |
| replay.js, replay.css | @rrweb/replay 2.1.7, dist/replay.js, dist/style.css | KqS3iUxafAL8dO8fwCEydrOc3rYbGwnV73wac4JO5s1I7fgd6toX3tJFKnAuIUnbAcgSO+DQZ7GrsGX8hOAODQ== |

Both MIT (github.com/rrweb-io/rrweb). The `//# sourceMappingURL` line is dropped, and record.js's
`onceStylesheetLoaded` waits only on a `rel="stylesheet"` link (a preload never gets a sheet: its
wait timed out and serialized it again every 5 s, forever, piling a `load` listener on the link
each time; a page up 16 hours spent 84% of its main thread there, 2026-10-19). Keep that patch on
an update.

record.js carries a second patch, which takes rrweb's work off the interaction path (2026-10-24,
abyme's docs/research/replay-cheap.md): its MutationObserver callback only queues the records; a
drain after the frame has painted (`requestAnimationFrame`, then `scheduler.postTask` at
`user-visible`, or a MessageChannel task in WebKit) processes them and serialises what they added,
4 ms at a time (`__BUDGET`), with `emit` run as a generator that yields when a slice is spent. A
sibling added since an emit began, with no id yet, is skipped so that its own add goes first. A
checkout (`lock`) drops the queue, since its full snapshot holds the page as it is; `unlock` and
`unfreeze` schedule a drain instead of emitting at once. It is made by abyme's
`scripts/replay-rig/patch.mjs <record.js> sliced` on rrweb's own file; on an update, apply both
patches to the new file and run `scripts/replay-rig` before and after (rrweb's time in a click's
task, the longest slice, and the replay's fidelity).

To update: `npm pack @rrweb/record@<v> @rrweb/replay@<v>` in an empty folder, copy the
same files, and write the new integrity here. The `.d.ts` files are the little the plugin uses.

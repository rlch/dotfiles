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
`scripts/replay-rig/patch.mjs <record.js> sliced` on rrweb's own file; on an update, apply all
three patches to the new file and run `scripts/replay-rig` before and after (rrweb's time in a
click's task, the longest slice, and the replay's fidelity).

A third patch walks a checkout in slices too (2026-11-02; `patch.mjs <record.js> snapshot`, after
`sliced`): a whole snapshot of a big chat page took 200-800 ms of one task, live. `record.takeFullSnapshot`
now answers a promise of its cost (`{ ms, work, longest, slices, records }`); the page's first
snapshot, at `record()`, stays whole. The walk is `serializeNodeWithId` as a generator that yields
once a slice has spent `__BUDGET` (a leaf is serialised as before); the page goes on changing
meanwhile, and one consistent recording comes of it so:
- The mutation buffers stay locked for the walk and keep queueing (a buffer made during it, for a
  shadow root or an iframe, waits too); the queue goes out after the FullSnapshot, as rrweb's usual
  diffs against the page as it is then.
- A child is skipped by the walk if a record queued so far added it (its add serialises it whole,
  as it is then; walked, its add would find its old copy unequal and replay it twice), if it left
  its parent since the parent listed it, or if it was walked already (moved).
- Meta and FullSnapshot go out together at the end; whatever rrweb emitted during the walk (input,
  scroll, a same-origin iframe attaching) after them. A stylesheet rule event of a sheet the walk
  has not reached is dropped, since the walk reads the sheet as it is then.
- A sheet of 256 rules or more is stringified in slices, and again whole if a rule of it changed
  meanwhile.
- The walk reads no scroll position: each read lays out a page that changed between slices, and in
  WebKit 8,000 of them cost about 90 ms even on a still page. Every element ever seen scrolled (a
  `scroll` event, or a position in the first snapshot) is kept in a WeakSet; the last step reads
  those, and the window's, in a `ResizeObserver` callback, once the frame is laid out (after 250 ms
  if the page draws no frames).

On abyme's chat page rebuilt from a save (0986bc1c, 8,250 elements, 580 KB of CSS) a checkout went
from one task of 91 ms (Chromium) and 158 ms (WebKit) to slices of at most 6 ms, 35 and 29 ms of
work in all, 105 and 43 ms of wall time; a replay from a checkout taken while the page added,
removed, moved and restyled nodes in the light DOM, a shadow root and an iframe matched the page
in every run, and failed without the skips.

To update: `npm pack @rrweb/record@<v> @rrweb/replay@<v>` in an empty folder, copy the
same files, and write the new integrity here. The `.d.ts` files are the little the plugin uses.

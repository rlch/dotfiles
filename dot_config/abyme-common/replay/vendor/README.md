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
an update. To update: `npm pack @rrweb/record@<v> @rrweb/replay@<v>` in an empty folder, copy the
same files, and write the new integrity here. The `.d.ts` files are the little the plugin uses.

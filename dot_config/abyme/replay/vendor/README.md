rrweb's own builds, copied as published so the plugin needs no build and no node_modules: each is
one ES module with no imports (its worker inlined as a blob).

| File | From | sha512 of the tarball |
| --- | --- | --- |
| record.js | @rrweb/record 2.1.7, dist/record.js | lIAbWdH8JwRuujURxTBtgrlsPvyBUGXUa9aB5hK8s5DdHgagyLFkIaAWhtthuOwT3o4o4+w38yUVPLc3W2oOrw== |
| rrweb-player.js, rrweb-player.css | rrweb-player 2.1.7, dist/rrweb-player.js, dist/style.css | jY6ovTq+Ll9nh8s0WEUl9abNKY9UQO524lFShaoSakQsGooYUGvzxg0xFWEQn7qY4rP5Q5BSRV0vbtRW35+o6A== |

Both MIT (github.com/rrweb-io/rrweb). The `//# sourceMappingURL` line is dropped; nothing else
changed. To update: `npm pack @rrweb/record@<v> rrweb-player@<v>` in an empty folder, copy the
same files, and write the new integrity here. The `.d.ts` files are the little the plugin uses.

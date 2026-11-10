import {cp, mkdir} from 'node:fs/promises';

// Publish only runtime files; keep backups and development tools private.
await mkdir('dist', {recursive:true});
for (const entry of ['index.html', 'favicon.svg', 'src', 'assets']) {
  await cp(entry, `dist/${entry}`, {recursive:true});
}
console.log('Static site exported to dist/');

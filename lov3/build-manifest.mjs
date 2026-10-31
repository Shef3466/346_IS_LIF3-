import { readFileSync } from 'node:fs';
import { buildManifest } from './provenance.mjs';

// Run from any working directory: node lov3/build-manifest.mjs
const book = JSON.parse(readFileSync(new URL('./genesis.json', import.meta.url), 'utf8'));
process.stdout.write(JSON.stringify(buildManifest(book), null, 2) + '\n');

// Run after `next build`: stamps a unique build id into out/sw.js
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

let hash = 'dev';
try {
  hash = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch {}
const id = `${hash}-${Date.now().toString(36)}`;

const file = 'out/sw.js';
writeFileSync(file, readFileSync(file, 'utf8').replaceAll('__BUILD_ID__', id));
console.log(`sw.js stamped with build id ${id}`);

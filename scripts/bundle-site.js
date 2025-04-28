import { join } from 'node:path';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';

const dest = '_site';
const sources = [
  'assets/',
  'dist',
  'examples',
  'index.html',
];

if (existsSync(dest)) {
  rmSync(dest, { recursive: true });
}

mkdirSync(dest);

for(const src of sources) {
  cpSync(src, join(dest, src), { recursive: true });
}

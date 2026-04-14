/**
 * Patches Mastra Studio to include a custom Sandbox tab.
 *
 * What it does:
 *   1. Copies sandbox/inject.js  → studio assets dir (client-side script)
 *   2. Copies sandbox/page.html  → studio assets dir (sandbox page content)
 *   3. Injects a <script> tag into Studio's index.html to load the injector
 *
 * The patch is idempotent — safe to run multiple times.
 *
 * Usage:
 *   node scripts/patch-studio.mjs          # apply patch
 *   node scripts/patch-studio.mjs --undo   # remove patch
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const studioDir = resolve(root, 'node_modules/mastra/dist/studio');
const indexPath = resolve(studioDir, 'index.html');
const assetsDir = resolve(studioDir, 'assets');

const MARKER = '<!-- MASTRA-SANDBOX-PATCHED -->';

const srcInject = resolve(root, 'src/mastra/sandbox/inject.js');
const srcPage = resolve(root, 'src/mastra/sandbox/page.html');
const destInject = resolve(assetsDir, 'sandbox-inject.js');
const destPage = resolve(assetsDir, 'sandbox-page.html');

// ── Undo mode ────────────────────────────────────────────────────

if (process.argv.includes('--undo')) {
  if (!existsSync(indexPath)) {
    console.log('Studio not found — nothing to undo.');
    process.exit(0);
  }

  let html = readFileSync(indexPath, 'utf-8');
  if (!html.includes(MARKER)) {
    console.log('Studio is not patched — nothing to undo.');
    process.exit(0);
  }

  // Remove the injected lines
  html = html
    .split('\n')
    .filter(line => !line.includes(MARKER) && !line.includes('sandbox-inject.js'))
    .join('\n');
  writeFileSync(indexPath, html, 'utf-8');

  // Remove copied assets
  if (existsSync(destInject)) unlinkSync(destInject);
  if (existsSync(destPage)) unlinkSync(destPage);

  console.log('Studio sandbox patch removed.');
  process.exit(0);
}

// ── Apply mode ───────────────────────────────────────────────────

if (!existsSync(indexPath)) {
  console.log('Studio not found at', studioDir);
  console.log('Run "npm install" first, then re-run this script.');
  process.exit(1);
}

if (!existsSync(srcInject) || !existsSync(srcPage)) {
  console.log('Sandbox source files not found. Expected:');
  console.log('  ', srcInject);
  console.log('  ', srcPage);
  process.exit(1);
}

// 1. Copy assets
copyFileSync(srcInject, destInject);
copyFileSync(srcPage, destPage);

// 2. Patch index.html (if not already patched)
let html = readFileSync(indexPath, 'utf-8');
if (html.includes(MARKER)) {
  // Already patched — just update the copied assets (done above)
  console.log('Studio sandbox assets updated (already patched).');
  process.exit(0);
}

html = html.replace(
  '</head>',
  `    ${MARKER}\n    <script defer src="./assets/sandbox-inject.js"></script>\n  </head>`
);

writeFileSync(indexPath, html, 'utf-8');
console.log('Studio patched — Sandbox tab will appear in the sidebar.');

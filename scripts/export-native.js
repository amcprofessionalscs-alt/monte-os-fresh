#!/usr/bin/env node
/**
 * export-native.js
 *
 * Extracts the pre-rendered HTML pages and static assets from a normal
 * `next build` output into `out/` — without `output: 'export'`, so
 * dynamic API route handlers are never touched.
 *
 * Run: node scripts/export-native.js
 * (Usually invoked via npm run build:static)
 */

const fs   = require('fs');
const path = require('path');

const ROOT   = path.join(__dirname, '..');
const NEXT   = path.join(ROOT, '.next');
const OUT    = path.join(ROOT, 'out');
const PUBLIC = path.join(ROOT, 'public');

// Pages to export: [srcHtml, destHtml]
// srcHtml  — relative to .next/server/app/
// destHtml — relative to out/
const PAGE_MAP = [
  ['index.html',       'index.html'],
  ['login.html',       'login.html'],
  ['history.html',     'history.html'],
  ['ignite.html',      'ignite.html'],
  ['ignition.html',    'ignition.html'],
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

console.log('📦  Exporting native build to /out …\n');

// 1. Clean / create out/
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 2. Copy pre-rendered page HTML
const appServer = path.join(NEXT, 'server', 'app');
let pagesCopied = 0;
for (const [src, dst] of PAGE_MAP) {
  const srcPath = path.join(appServer, src);
  const dstPath = path.join(OUT, dst);
  if (fs.existsSync(srcPath)) {
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    fs.copyFileSync(srcPath, dstPath);
    console.log(`  ✓  ${src} → out/${dst}`);
    pagesCopied++;
  } else {
    console.warn(`  ⚠  ${src} not found — skipping`);
  }
}

// 3. Generate auth/callback shim (forwards code to home for PKCE exchange)
const callbackHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Next Step OS</title>
  <script>
    var code = new URLSearchParams(window.location.search).get('code');
    window.location.replace(code ? '/?auth_code=' + encodeURIComponent(code) : '/login.html');
  </script>
</head>
<body></body>
</html>`;
fs.mkdirSync(path.join(OUT, 'auth', 'callback'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'auth', 'callback', 'index.html'), callbackHtml);
console.log('  ✓  auth/callback shim generated');

// 4. Copy _next/static assets
const staticSrc = path.join(NEXT, 'static');
const staticDst = path.join(OUT, '_next', 'static');
if (fs.existsSync(staticSrc)) {
  copyDir(staticSrc, staticDst);
  console.log('  ✓  _next/static assets copied');
} else {
  console.warn('  ⚠  .next/static not found');
}

// 5. Copy public/ assets
if (fs.existsSync(PUBLIC)) {
  copyDir(PUBLIC, OUT);
  console.log('  ✓  public/ assets copied');
}

console.log(`\n✅  Done — ${pagesCopied} pages exported to /out\n`);

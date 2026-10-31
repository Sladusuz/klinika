// Sayt fayllarini worker/public ga yig'adi (Cloudflare Worker saytni ham, API ni ham shu domenda beradi)
import { rmSync, mkdirSync, cpSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'worker', 'public');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
for (const f of ['index.html', '404.html', 'admin', 'assets', 'robots.txt', 'site.webmanifest']) if (existsSync(join(root, f))) cpSync(join(root, f), join(out, f), { recursive: true });
writeFileSync(join(out, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/
  Content-Security-Policy: frame-ancestors 'self'
/index.html
  Content-Security-Policy: frame-ancestors 'self'
/assets/img/*
  Cache-Control: public, max-age=86400
/admin/*
  Content-Security-Policy: frame-ancestors https://web.telegram.org https://webk.telegram.org https://webz.telegram.org https://*.telegram.org
  Cache-Control: no-store
  X-Robots-Tag: noindex, nofollow
`);
console.log('public/ tayyor');

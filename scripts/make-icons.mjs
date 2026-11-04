#!/usr/bin/env node
// Draws the T-Coder app icon (a tiny late-90s window with a command field
// and a "T") on a 32×32 grid and writes it as PNG at the sizes the PWA
// manifest needs. Dependency-free: a minimal PNG encoder on node:zlib.
//
// Usage: node scripts/make-icons.mjs

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const C = {
  desk: hex('#b9c6d6'),
  surface: hex('#dce4ee'),
  frame: hex('#173a63'),
  title: hex('#0b3a6e'),
  titleHi: hex('#2f67a6'),
  field: hex('#ffffff'),
  fieldEdge: hex('#4d6480'),
  mark: hex('#dce4ee'),
};

const inRect = (x, y, x0, y0, x1, y1) => x >= x0 && x < x1 && y >= y0 && y < y1;

/** Colour at grid position (x, y), 0 ≤ x, y < 32. */
const paint = (x, y) => {
  if (!inRect(x, y, 3, 4, 29, 28)) return C.desk;
  if (!inRect(x, y, 4, 5, 28, 27)) return C.frame;
  if (inRect(x, y, 4, 5, 28, 10)) {
    if (inRect(x, y, 6, 6, 9, 9)) return C.mark;
    return x < 16 ? C.title : C.titleHi;
  }
  if (inRect(x, y, 7, 13, 25, 18)) return inRect(x, y, 8, 14, 24, 17) ? C.field : C.fieldEdge;
  if (inRect(x, y, 10, 20, 22, 22) || inRect(x, y, 15, 20, 17, 26)) return C.title;
  return C.surface;
};

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const png = (size) => {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let py = 0; py < size; py++) {
    const row = py * (size * 3 + 1);
    raw[row] = 0; // filter: none
    for (let px = 0; px < size; px++) {
      const [r, g, b] = paint(Math.floor((px * 32) / size), Math.floor((py * 32) / size));
      raw.set([r, g, b], row + 1 + px * 3);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(resolve(root, 'public', name), png(size));
  console.log(`public/${name} (${size}×${size})`);
}

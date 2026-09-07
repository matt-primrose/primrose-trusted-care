// Brand-art background remover. One-off asset prep, not part of the build.
//
//   node scripts/cutout-art.mjs <in.png> <out.png> <targetWidth> [tolerance] [minAreaPct]
//
// Used to turn the owner-supplied Safe Ride van illustrations (brand-assets/ptsf_*.png,
// full scene with sky/trees/road) into the small transparent cutouts the home-page
// "Coming Soon" banner uses. Flood-fills the background inward from the borders,
// drops leftover islands, crops to the subject, and downscales.
//
// No image dependencies on purpose (see CLAUDE.md §2): PNG decode/encode is hand-rolled
// on top of node:zlib. Handles 8-bit non-interlaced PNGs only, which is all we have.
//
// Commands used for the current banner art:
//   node scripts/cutout-art.mjs brand-assets/ptsf_side.png brand-assets/ptc-safe-ride-side.png 400 16 0.004 95
//   node scripts/cutout-art.mjs brand-assets/ptsf_back.png brand-assets/ptc-safe-ride-back.png 300 18 0.004 95
//
// Tuning notes: tolerance is a per-channel RGB delta for the fill. The van body is white,
// so near-white pixels are never traversed (otherwise the fill eats the van); leftover
// white background reads as invisible on the white banner card. Lower tolerance preserves
// detail behind glass (the side view's driver needs ~10); higher clears sky better
// (the rear view takes 18). Seeds must be light and the fill can only drift so far from
// its seed color, or it rides the road-to-shadow gradient into the black tires and erases
// them. minAreaPct above ~0.005 starts eating real detail (the front hubcap goes first).

import zlib from 'node:zlib';
import fs from 'node:fs';


function readPng(path) {
  const buf = fs.readFileSync(path);
  let off = 8;
  let ihdr = null;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (!ihdr) throw new Error('no IHDR');
  if (ihdr.depth !== 8 || ihdr.interlace !== 0) throw new Error(`unsupported depth/interlace ${ihdr.depth}/${ihdr.interlace}`);
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[ihdr.colorType];
  if (!channels) throw new Error(`unsupported colorType ${ihdr.colorType}`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const { width: w, height: h } = ihdr;
  const stride = w * channels;
  const out = Buffer.alloc(w * h * 4);
  const prev = Buffer.alloc(stride);
  const line = Buffer.alloc(stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    raw.copy(line, 0, p, p + stride);
    p += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      line[i] = v & 0xff;
    }
    line.copy(prev);
    for (let x = 0; x < w; x++) {
      const s = x * channels, d = (y * w + x) * 4;
      if (channels >= 3) {
        out[d] = line[s]; out[d + 1] = line[s + 1]; out[d + 2] = line[s + 2];
        out[d + 3] = channels === 4 ? line[s + 3] : 255;
      } else {
        out[d] = out[d + 1] = out[d + 2] = line[s];
        out[d + 3] = channels === 2 ? line[s + 1] : 255;
      }
    }
  }
  return { width: w, height: h, data: out };
}

function writePng({ width, height, data }, path) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const chunks = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])];
  const chunk = (type, body) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(body.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), body]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  chunks.push(chunk('IHDR', ihdr));
  chunks.push(chunk('IDAT', zlib.deflateSync(raw, { level: 9 })));
  chunks.push(chunk('IEND', Buffer.alloc(0)));
  fs.writeFileSync(path, Buffer.concat(chunks));
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}


const [, , inPath, outPath, targetWStr, tolStr] = process.argv;
const targetW = Number(targetWStr);
const tol = Number(tolStr ?? 28);
const minAreaPct = Number(process.argv[6] ?? 0.001);
// How far a filled pixel may drift from the border color its region started at.
const drift = Number(process.argv[7] ?? 55);

const img = readPng(inPath);
const { width: w, height: h, data } = img;
const bg = new Uint8Array(w * h);
// Seed color each filled pixel inherited, so the fill can't gradient-walk somewhere
// unrelated: the road shades smoothly into the van's shadow and on into its black
// tires, which a purely neighbor-based tolerance happily eats.
const seedRGB = new Uint8Array(w * h * 3);
const stack = [];

const push = (x, y) => {
  const i = y * w + x;
  if (!bg[i]) {
    bg[i] = 1;
    seedRGB[i * 3] = data[i * 4];
    seedRGB[i * 3 + 1] = data[i * 4 + 1];
    seedRGB[i * 3 + 2] = data[i * 4 + 2];
    stack.push(i);
  }
};
// Seeds must be light: the black tires touch dark background at the frame edge,
// and a dark seed lets the fill claim the whole tire.
const lum = (i) => 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
const seed = (x, y) => {
  const i = y * w + x;
  if (!nearWhite(i) && lum(i) >= 95) push(x, y);
};

// Near-white pixels are off limits: the van body is white, so an unguarded
// fill walks from the sky straight through it. Background whites (clouds,
// houses) survive instead, and they're invisible on the white banner card.
const nearWhite = (i) => {
  const p = i * 4, r = data[p], g = data[p + 1], b = data[p + 2];
  return r > 222 && g > 222 && b > 222;
};
for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

const close = (a, b) => {
  if (nearWhite(b)) return false;
  const p = a * 4, q = b * 4, s = a * 3;
  return Math.abs(data[p] - data[q]) <= tol
    && Math.abs(data[p + 1] - data[q + 1]) <= tol
    && Math.abs(data[p + 2] - data[q + 2]) <= tol
    && Math.abs(seedRGB[s] - data[q]) <= drift
    && Math.abs(seedRGB[s + 1] - data[q + 1]) <= drift
    && Math.abs(seedRGB[s + 2] - data[q + 2]) <= drift;
};

while (stack.length) {
  const i = stack.pop();
  const x = i % w, y = (i - x) / w;
  const take = (j) => {
    if (bg[j] || !close(i, j)) return;
    bg[j] = 1;
    seedRGB[j * 3] = seedRGB[i * 3];
    seedRGB[j * 3 + 1] = seedRGB[i * 3 + 1];
    seedRGB[j * 3 + 2] = seedRGB[i * 3 + 2];
    stack.push(j);
  };
  if (x > 0) take(i - 1);
  if (x < w - 1) take(i + 1);
  if (y > 0) take(i - w);
  if (y < h - 1) take(i + w);
}

let removed = 0;
for (let i = 0; i < w * h; i++) if (bg[i]) { data[i * 4 + 3] = 0; removed++; }

// Drop small detached islands (leaf specks, stray flowers, cloud fragments) that
// survived the fill. Threshold, not "largest component only": removing the glass
// severs the driver from the van body, and she needs to stay.
const seen = new Uint8Array(w * h);
const minArea = Math.round(w * h * minAreaPct);
const drop = [];
for (let start = 0; start < w * h; start++) {
  if (seen[start] || !data[start * 4 + 3]) continue;
  const comp = [start];
  seen[start] = 1;
  for (let k = 0; k < comp.length; k++) {
    const i = comp[k], x = i % w, y = (i - x) / w;
    const visit = (j) => { if (!seen[j] && data[j * 4 + 3]) { seen[j] = 1; comp.push(j); } };
    if (x > 0) visit(i - 1);
    if (x < w - 1) visit(i + 1);
    if (y > 0) visit(i - w);
    if (y < h - 1) visit(i + w);
  }
  if (comp.length < minArea) drop.push(comp);
}
for (const comp of drop) for (const i of comp) { data[i * 4 + 3] = 0; removed++; }

// Crop to the opaque bounding box.
let minX = w, minY = h, maxX = -1, maxY = -1;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (data[i * 4 + 3] && !nearWhite(i)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
const cw = maxX - minX + 1, ch = maxY - minY + 1;

// Box-filter downscale on premultiplied alpha.
const scale = targetW / cw;
const tw = targetW, th = Math.max(1, Math.round(ch * scale));
const out = Buffer.alloc(tw * th * 4);
for (let y = 0; y < th; y++) {
  const sy0 = minY + Math.floor((y * ch) / th);
  const sy1 = minY + Math.max(Math.floor(((y + 1) * ch) / th), Math.floor((y * ch) / th) + 1);
  for (let x = 0; x < tw; x++) {
    const sx0 = minX + Math.floor((x * cw) / tw);
    const sx1 = minX + Math.max(Math.floor(((x + 1) * cw) / tw), Math.floor((x * cw) / tw) + 1);
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let sy = sy0; sy < sy1; sy++) {
      for (let sx = sx0; sx < sx1; sx++) {
        const s = (sy * w + sx) * 4, al = data[s + 3] / 255;
        r += data[s] * al; g += data[s + 1] * al; b += data[s + 2] * al; a += al; n++;
      }
    }
    const d = (y * tw + x) * 4;
    if (a > 0) {
      out[d] = Math.round(r / a); out[d + 1] = Math.round(g / a); out[d + 2] = Math.round(b / a);
      out[d + 3] = Math.round((a / n) * 255);
    }
  }
}
writePng({ width: tw, height: th, data: out }, outPath);
console.log(`${outPath}: bg removed ${(removed / (w * h) * 100).toFixed(1)}% | crop ${cw}x${ch} -> ${tw}x${th}`);

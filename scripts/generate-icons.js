import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Standard SVG Icon (Vector)
// Pure brutalist monochrome design with #FF3B00 accent dot, adhering to Dissonant Noir design system
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="#0E0E0E"/>
  <rect x="24" y="24" width="464" height="464" rx="80" fill="none" stroke="#282828" stroke-width="4"/>
  
  <!-- Dissonant Inner Emblem Card -->
  <rect x="96" y="96" width="320" height="320" rx="40" fill="#E5E2E1"/>
  
  <!-- D glyph cutout/fill -->
  <path d="M 176 160 H 252 C 302 160 336 194 336 256 C 336 318 302 352 252 352 H 176 Z M 224 204 V 308 H 250 C 276 308 292 290 292 256 C 292 222 276 204 250 204 Z" fill="#0E0E0E"/>
  
  <!-- Signature Heat Accent Dot (#FF3B00) -->
  <circle cx="370" cy="142" r="22" fill="#FF3B00"/>
</svg>`;

// 2. Maskable SVG Icon (Safe zone centered, full bleed background)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#0E0E0E"/>
  
  <!-- Emblem sized perfectly within 70% safe zone -->
  <rect x="136" y="136" width="240" height="240" rx="30" fill="#E5E2E1"/>
  
  <!-- D glyph -->
  <path d="M 196 184 H 253 C 290 184 316 210 316 256 C 316 302 290 328 253 328 H 196 Z M 232 217 V 295 H 252 C 271 295 283 281 283 256 C 283 231 271 217 252 217 Z" fill="#0E0E0E"/>
  
  <!-- Signature Heat Accent Dot (#FF3B00) -->
  <circle cx="340" cy="172" r="16" fill="#FF3B00"/>
</svg>`;

// 3. Apple Touch Icon SVG (No corner radius, iOS adds squircle mask automatically)
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="#0E0E0E"/>
  <rect x="8" y="8" width="164" height="164" fill="none" stroke="#282828" stroke-width="2"/>
  
  <!-- Dissonant Card -->
  <rect x="34" y="34" width="112" height="112" rx="14" fill="#E5E2E1"/>
  
  <!-- D glyph -->
  <path d="M 62 56 H 88 C 106 56 118 68 118 90 C 118 112 106 124 88 124 H 62 Z M 79 72 V 108 H 88 C 97 108 102 101 102 90 C 102 79 97 72 88 72 Z" fill="#0E0E0E"/>
  
  <!-- Heat Accent Dot -->
  <circle cx="130" cy="50" r="8" fill="#FF3B00"/>
</svg>`;

// 4. Favicon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="12" fill="#0E0E0E"/>
  <rect x="12" y="12" width="40" height="40" rx="6" fill="#E5E2E1"/>
  <path d="M 22 20 H 31 C 37.5 20 42 24.5 42 32 C 42 39.5 37.5 44 31 44 H 22 Z M 28 25.5 V 38.5 H 31 C 34.5 38.5 36.5 36 36.5 32 C 36.5 28 34.5 25.5 31 25.5 Z" fill="#0E0E0E"/>
  <circle cx="46" cy="18" r="3.5" fill="#FF3B00"/>
</svg>`;

async function generate() {
  // Write SVG files
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  console.log('Created favicon.svg');

  // Generate PNG 512x512
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // Generate PNG 192x192
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // Generate Maskable 512x512
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));
  console.log('Created maskable-icon-512x512.png');

  // Generate Apple Touch Icon 180x180
  await sharp(Buffer.from(appleTouchSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Generate favicon.ico (using 48x48 PNG buffer)
  await sharp(Buffer.from(faviconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');

  console.log('All icons generated successfully.');
}

generate().catch(console.error);

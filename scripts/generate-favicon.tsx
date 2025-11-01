import { renderToString } from 'react-dom/server';
import { Home } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import React from 'react';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Your primary color from CSS (HSL: 188, 78%, 41%)
const primaryColor = hslToRgb(188, 78, 41);

// Convert the Lucide icon to SVG string
const svgString = renderToString(
  <Home size={48} color={primaryColor} absoluteStrokeWidth />
);

// Save as PNG using sharp
async function convertToPng() {
  try {
    await sharp(Buffer.from(svgString))
      .resize(48, 48)
      .png()
      .toFile(path.join(__dirname, '../client/public/favicon.png'));
    
    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

convertToPng();
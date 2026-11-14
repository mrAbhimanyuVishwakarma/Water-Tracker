const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const characters = path.join(root, 'assets/characters');
for (const mascot of ['brownie', 'dodo', 'mammoth', 'sloth', 'turtle', 'penguin']) {
  const folder = path.join(characters, mascot);
  fs.mkdirSync(folder, { recursive: true });
  execFileSync('ffmpeg', ['-y', '-i', path.join(folder, 'sipping.mp4'), '-vf', 'select=eq(n\\,0)', '-frames:v', '1', path.join(folder, 'poster.png'), '-loglevel', 'error']);
}
// Local eye patches come from the same Brownie clip, preserving his face design.
execFileSync('ffmpeg', ['-y', '-ss', '3', '-i', path.join(characters, 'brownie/sipping.mp4'), '-frames:v', '1', path.join(characters, 'brownie/blink.png'), '-loglevel', 'error']);

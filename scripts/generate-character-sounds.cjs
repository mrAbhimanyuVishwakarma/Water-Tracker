// Original, repeatable water-note signatures. No third-party recordings or microphone data.
// Run with: node scripts/generate-character-sounds.cjs
const fs = require('node:fs');
const path = require('node:path');
const characters = path.join(__dirname, '../assets/characters');
const rate = 22050;
const signatures = {
  brownie: [420, 550, 0.08, 0.30],
  dodo: [680, 920, 0.065, 0.27],
  mammoth: [180, 240, 0.12, 0.42],
  sloth: [310, 360, 0.17, 0.48],
  turtle: [480, 420, 0.11, 0.34],
  penguin: [790, 610, 0.06, 0.26],
};

for (const [name, [first, second, gap, decay]] of Object.entries(signatures)) {
  const output = path.join(characters, name);
  fs.mkdirSync(output, { recursive: true });
  const duration = gap + decay + 0.12;
  const count = Math.ceil(rate * duration);
  const buffer = Buffer.alloc(44 + count * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(count * 2, 40);
  function note(time, frequency) {
    if (time < 0 || time > decay + 0.1) return 0;
    const envelope = Math.min(time / 0.012, 1) * Math.exp(-time * 8 / decay);
    const phase = 2 * Math.PI * frequency * (time + 0.025 * (1 - Math.exp(-time * 25)));
    return envelope * (Math.sin(phase) + Math.sin(phase * 2) * 0.13);
  }
  for (let index = 0; index < count; index++) {
    const time = index / rate;
    const sample = (note(time, first) + note(time - gap, second) * 0.8) * 0.33;
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + index * 2);
  }
  fs.writeFileSync(path.join(output, 'reaction.wav'), buffer);
  console.log(`${name}/reaction.wav: ${Math.round(duration * 1000)} ms, ${buffer.length} bytes`);
}

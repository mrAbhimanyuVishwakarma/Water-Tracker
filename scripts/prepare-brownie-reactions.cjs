// Offline authoring only. Originals remain untouched. Requires ffmpeg/ffprobe.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const base = path.join(root, 'assets/characters/brownie');
const bin = process.env.BROWNIE_FFMPEG_DIR || '';
const exe = name => path.join(bin, process.platform === 'win32' ? `${name}.exe` : name);
function run(name, args, options = {}) {
  const result = spawnSync(exe(name), args, { maxBuffer: 128 * 1024 * 1024, ...options });
  if (result.status !== 0) throw new Error(String(result.stderr || result.error));
  return result;
}
const output = path.join(base, 'runtime');
fs.mkdirSync(output, { recursive: true });
const names = fs.readdirSync(path.join(base, 'sources/reactions')).filter(name => name.endsWith('.mp4'));
const manifest = {};
const matte = "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(g(X,Y),r(X,Y)+10)*gt(g(X,Y),b(X,Y)+10),0,255)'";
// Preserve the little wood slice from the original as part of the shared static habitat.
// Its dark foot pixels are excluded by the warm wood color mask; the character sits above it.
const wood = "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(between(X,170,360)*between(Y,620,665)*gt(r(X,Y),g(X,Y)+30)*gt(g(X,Y),b(X,Y)+15),255,0)'";
run('ffmpeg', ['-v', 'error', '-y', '-i', path.join(base, 'sources/sipping-original.mp4'), '-i', path.join(base, 'sources/habitat-background.png'), '-filter_complex', `[0:v]scale=1280:720,crop=720:720:280:0,${wood}[wood];[1:v]scale=720:720[grass];[grass][wood]overlay,format=rgb24[v]`, '-map', '[v]', '-frames:v', '1', path.join(output, 'habitat.png')]);
for (const name of [...names, 'sipping-original.mp4']) {
  const original = name === 'sipping-original.mp4';
  const source = path.join(base, original ? 'sources/sipping-original.mp4' : `sources/reactions/${name}`);
  const info = JSON.parse(run('ffprobe', ['-v', 'quiet', '-show_format', '-show_streams', '-of', 'json', source]).stdout);
  const duration = Number(info.format.duration);
  // Measure movement against the final resting pose, rather than trimming by a fixed duration.
  const frames = run('ffmpeg', ['-v', 'error', '-i', source, '-vf', 'fps=8,scale=64:36,format=gray', '-f', 'rawvideo', '-']).stdout;
  const size = 64 * 36;
  const count = Math.floor(frames.length / size);
  let first = count - 1, last = 0;
  const final = frames.subarray((count - 1) * size, count * size);
  for (let i = 0; i < count; i++) {
    let delta = 0;
    for (let y = 3; y < 35; y++) for (let x = 20; x < 44; x++) {
      const p = y * 64 + x;
      delta += Math.abs(frames[i * size + p] - final[p]);
    }
    if (delta / (32 * 24) > 1.4) { first = Math.min(first, i); last = i; }
  }
  const audio = run('ffmpeg', ['-hide_banner', '-i', source, '-af', 'silencedetect=noise=-38dB:d=0.15', '-vn', '-f', 'null', '-']);
  const silence = [...String(audio.stderr).matchAll(/silence_(start|end): ([\d.]+)/g)];
  let firstAudio = 0, lastAudio = duration;
  if (silence[0]?.[1] === 'start' && Number(silence[0][2]) < 0.1) firstAudio = Number(silence.find(item => item[1] === 'end')?.[2] || 0);
  const trailing = silence.at(-1);
  if (trailing?.[1] === 'end' && Number(trailing[2]) >= duration - 0.1) lastAudio = Number(silence.at(-2)?.[2] || duration);
  const silent = /^(idle-blink|look-)/.test(name);
  const start = original ? 0 : Math.max(0, Math.min(first / 8, silent ? duration : firstAudio) - 0.25);
  const end = original ? duration : Math.min(duration, Math.max(last / 8, silent ? 0 : lastAudio) + 0.4);
  const length = Math.max(0.8, end - start);
  const target = original ? 'sipping.mp4' : name;
  // All clips share the exact same square canvas and static habitat. Background processing is offline.
  const filter = `[0:v]scale=1280:720,crop=720:720:280:0,${matte}[character];[1:v]scale=720:720[habitat];[habitat][character]overlay=shortest=1,format=yuv420p[v]`;
  run('ffmpeg', ['-v', 'error', '-y', '-ss', start.toFixed(3), '-i', source, '-loop', '1', '-i', path.join(output, 'habitat.png'), '-filter_complex', filter, '-map', '[v]', '-map', '0:a:0?', '-t', length.toFixed(3), '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'aac', '-b:a', '128k', ...(silent ? ['-af', 'volume=0'] : []), '-movflags', '+faststart', path.join(output, target)]);
  manifest[target.replace('.mp4', '')] = { start, end, duration: length, originalDuration: duration };
  console.log(`${target}: ${start.toFixed(2)}–${end.toFixed(2)}s (${length.toFixed(2)}s)`);
}
run('ffmpeg', ['-v', 'error', '-y', '-i', path.join(base, 'sources/reaction-master.png'), '-i', path.join(output, 'habitat.png'), '-filter_complex', `[0:v]crop=720:720:280:0,${matte}[character];[1:v]scale=720:720[habitat];[habitat][character]overlay,format=rgb24[v]`, '-map', '[v]', '-frames:v', '1', path.join(output, 'poster.png')]);
fs.writeFileSync(path.join(output, 'clips.json'), JSON.stringify(manifest, null, 2) + '\n');

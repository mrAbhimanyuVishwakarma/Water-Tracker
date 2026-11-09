/* Derive website media from the app's original MP4s. Requires a full FFmpeg build. */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ffmpegIndex = process.argv.indexOf('--ffmpeg');
const ffmpeg = ffmpegIndex >= 0 ? process.argv[ffmpegIndex + 1] : process.env.FFMPEG_BIN || 'ffmpeg';
const output = path.join(root, 'website', 'assets', 'mascots');
const previewOnly = process.argv.includes('--posters-only');
const darkOnly = process.argv.includes('--dark-only');
fs.mkdirSync(output, { recursive: true });

function run(args, options = {}) {
  return execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    maxBuffer: 8 * 1024 * 1024,
    windowsHide: true,
    ...options,
  });
}

for (const name of ['dodo', 'mammoth', 'sloth', 'turtle', 'penguin']) {
  const input = path.join(root, 'assets', name + '_sipping.mp4');
  // Sample the backdrop, outside the character, instead of assuming pure #00ff00.
  const color = run(['-i', input, '-vf', 'crop=32:32:0:0,scale=1:1,format=rgb24',
    '-frames:v', '1', '-f', 'rawvideo', 'pipe:1']);
  const key = '0x' + color.subarray(0, 3).toString('hex');
  // Crop the empty widescreen margins; retain the entire character and its base.
  // RGB distance includes brightness, preserving the turtle's light-green body
  // while removing the darker, saturated green backdrop.
  const subject = `crop=720:720:280:0,format=rgba,colorkey=${key}:0.10:0.035,scale=512:512:flags=lanczos,setsar=1`;
  const dest = extension => path.join(output, name + '-sipping.' + extension);
  if (!darkOnly) run(['-ss', '0.5', '-i', input, '-vf', subject, '-frames:v', '1',
    '-c:v', 'libwebp', '-q:v', '85', '-compression_level', '6', dest('webp')]);
  if (!previewOnly) {
    if (!darkOnly) run(['-i', input, '-vf', subject, '-r', '24', '-an', '-c:v', 'libvpx-vp9',
      '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '32', '-deadline', 'good',
      '-cpu-used', '4', '-row-mt', '1', '-auto-alt-ref', '0', '-threads', '2', dest('webm')]);
    // H.264 fallback: flatten onto the exact white card surface for browsers
    // without transparent WebM support. Original app MP4s are never modified.
    if (!darkOnly) run(['-i', input, '-f', 'lavfi', '-i', 'color=c=white:s=512x512:r=24',
      '-filter_complex', `[0:v]${subject}[subject];[1:v][subject]overlay=shortest=1:format=auto,format=yuv420p[out]`,
      '-map', '[out]', '-r', '24', '-an', '-c:v', 'libx264', '-preset', 'medium',
      '-crf', '24', '-movflags', '+faststart', '-threads', '2', dest('mp4')]);
    // Match the dark theme's --surface (#232321) without relying on browser
    // alpha-video support. Keep this matte in sync with website/styles.css.
    run(['-i', input, '-f', 'lavfi', '-i', 'color=c=0x232321:s=512x512:r=24',
      '-filter_complex', `[0:v]${subject}[subject];[1:v][subject]overlay=shortest=1:format=auto,format=yuv420p[out]`,
      '-map', '[out]', '-r', '24', '-an', '-c:v', 'libx264', '-preset', 'medium',
      '-crf', '24', '-movflags', '+faststart', '-threads', '2', dest('dark.mp4')]);
  }
  console.log(`${name}: ${key} backdrop removed${previewOnly ? ' (poster preview)' : darkOnly ? '; dark-theme MP4 ready' : '; website media ready'}`);
}

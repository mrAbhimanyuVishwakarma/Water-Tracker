/* Reuse the user's swimming reference without modifying the original recording. */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const flag = process.argv.indexOf('--ffmpeg');
const ffmpeg = flag >= 0 ? process.argv[flag + 1] : process.env.FFMPEG_BIN || 'ffmpeg';
const poolInput = path.join(root, 'assets', 'Recording 2026-11-09 203247.mp4');
const swimmerInput = path.join(root, 'assets', 'capibara swimming right to left.mp4');
const output = path.join(root, 'website', 'assets', 'swimming');
fs.mkdirSync(output, { recursive: true });

function run(args) {
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit', windowsHide: true,
  });
}

// The capybara has left the pool by eight seconds. Remove the recording's purple edges.
run(['-ss', '8', '-i', poolInput, '-vf', 'crop=1610:286:12:0', '-frames:v', '1',
  '-c:v', 'libwebp', '-q:v', '90', path.join(output, 'pool.webp')]);

// Use one matching three-second stroke cycle from the clean 24 fps source. A smooth
// tracking curve stabilizes the character; colorkey + despill supplies clean alpha.
const trackingX = '6.01343352*t*t*t-32.33604295*t*t+98.50620156*t+98.26199405';
const subject = `crop=320:240:x='${trackingX}':y=60,format=rgba,` +
  'colorkey=0x1cce2e:0.28:0.10,despill=type=green:mix=0.65:expand=0.08,fps=24';
run(['-ss', '3.625', '-t', '3.042', '-i', swimmerInput, '-vf', subject, '-an',
  '-c:v', 'libwebp_anim', '-q:v', '90', '-compression_level', '6', '-loop', '0',
  path.join(output, 'brownie-swim.webp')]);
run(['-ss', '3.625', '-i', swimmerInput, '-vf', subject, '-frames:v', '1',
  '-c:v', 'libwebp', '-q:v', '92',
  path.join(output, 'brownie-swim-poster.webp')]);
console.log('Pool artwork and stabilized 24 fps transparent swimming animation prepared.');

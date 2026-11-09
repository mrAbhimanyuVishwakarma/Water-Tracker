/* Reuse the user's swimming reference without modifying the original recording. */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const flag = process.argv.indexOf('--ffmpeg');
const ffmpeg = flag >= 0 ? process.argv[flag + 1] : process.env.FFMPEG_BIN || 'ffmpeg';
const input = path.join(root, 'assets', 'Recording 2026-11-09 203247.mp4');
const output = path.join(root, 'website', 'assets', 'swimming');
fs.mkdirSync(output, { recursive: true });

function run(args) {
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit', windowsHide: true,
  });
}

// The capybara has left the pool by eight seconds. Remove the recording's purple edges.
run(['-ss', '8', '-i', input, '-vf', 'crop=1610:286:12:0', '-frames:v', '1',
  '-c:v', 'libwebp', '-q:v', '90', path.join(output, 'pool.webp')]);

// Follow the recorded character so its swim stroke can move along a responsive lane.
// Warm foreground colors survive; cyan water and pale grid lines become transparent.
const subject = "crop=260:200:x='1140-210*t':y='22+7*t',fps=18,format=rgba," +
  "geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':" +
  "a='255*clip((r(X,Y)-g(X,Y)-6)/10,0,1)*clip((g(X,Y)-b(X,Y)-4)/8,0,1)'";
run(['-i', input, '-t', '4', '-vf', subject, '-an', '-c:v', 'libwebp_anim',
  '-q:v', '88', '-compression_level', '6', '-loop', '0', path.join(output, 'brownie-swim.webp')]);
run(['-i', input, '-vf', subject, '-frames:v', '1', '-c:v', 'libwebp', '-q:v', '90',
  path.join(output, 'brownie-swim-poster.webp')]);
console.log('Pool artwork and transparent swimming animation prepared.');

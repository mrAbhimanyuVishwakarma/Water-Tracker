// Run from the repository root against an installed candidate release APK.
// Uses existing local test data; does not add drinks, sign in, or clear app data.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const adb = process.env.BROWNIE_ADB || path.join(process.env.ANDROID_HOME, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const serial = process.env.BROWNIE_TEST_DEVICE || 'emulator-5554';
const app = 'com.brownie.watertracker';
const completed = process.argv.includes('--completed');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function command(...args) {
  const result = spawnSync(adb, ['-s', serial, ...args], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout.trim();
}
function healthy(pid) {
  const current = command('shell', 'pidof', app);
  if (current !== pid) throw new Error(`App exited or restarted: expected ${pid}, got ${current}`);
  const errors = command('logcat', '--pid', pid, '-d', '-v', 'brief', 'ReactNativeJS:E', 'AndroidRuntime:E', '*:S');
  if (/FATAL EXCEPTION|JavascriptException|TypeError|ReferenceError|Exception in HostFunction/.test(errors)) throw new Error(errors);
}
async function main() {
  command('shell', 'am', 'force-stop', app);
  command('shell', 'am', 'start', '-W', '-n', `${app}/.MainActivity`);
  await delay(3000);
  const pid = command('shell', 'pidof', app);
  healthy(pid);
  console.log(`Cold launch passed (PID ${pid})`);
  const size = command('shell', 'wm', 'size').match(/(\d+)x(\d+)/);
  const sx = Number(size[1]) / 1080, sy = Number(size[2]) / 2340;
  const point = (x, y) => [String(Math.round(x * sx)), String(Math.round(y * sy))];
  const tests = completed ? [
    ['left ear', 'tap', 413, 900], ['right ear', 'tap', 657, 889],
    ['face', 'tap', 542, 1018], ['belly', 'tap', 459, 1275],
    ['left foot', 'tap', 475, 1410], ['right foot', 'tap', 723, 1410],
    ['tail', 'tap', 338, 1326], ['crown', 'tap', 529, 903],
    ['double tap', 'double', 542, 1018], ['hold', 'hold', 459, 1275],
    ['head stroke', 'swipe', 529, 903, 579, 903],
    ['look left', 'swipe', 542, 1018, 442, 1018],
    ['look right', 'swipe', 542, 1018, 642, 1018],
    ['look up', 'swipe', 542, 1018, 542, 918],
    ['look down', 'swipe', 542, 1018, 542, 1118],
    ['glass', 'tap', 605, 1270],
  ] : [
    ['left ear', 'tap', 360, 840], ['right ear', 'tap', 650, 800],
    ['face', 'tap', 550, 1030], ['belly', 'tap', 390, 1320],
    ['left foot', 'tap', 595, 1490], ['right foot', 'tap', 850, 1460],
    ['tail', 'tap', 225, 1440], ['crown', 'tap', 515, 820],
    ['double tap', 'double', 550, 1030], ['hold', 'hold', 390, 1320],
    ['head stroke', 'swipe', 500, 850, 560, 850],
    ['look left', 'swipe', 550, 1030, 450, 1030],
    ['look right', 'swipe', 550, 1030, 650, 1030],
    ['look up', 'swipe', 550, 1030, 550, 930],
    ['look down', 'swipe', 550, 1030, 550, 1130],
    ['glass', 'tap', 720, 1240],
  ];
  for (const [name, kind, x, y, endX, endY] of tests) {
    const start = point(x, y);
    if (kind === 'tap' || kind === 'double') {
      command('shell', 'input', 'tap', ...start);
      if (kind === 'double') { await delay(70); command('shell', 'input', 'tap', ...start); }
    } else command('shell', 'input', 'swipe', ...start, ...point(endX ?? x, endY ?? y), kind === 'hold' ? '800' : '500');
    await delay(900);
    healthy(pid);
    const shot = `brownie-smoke-${completed ? 'completed-' : ''}${name.replaceAll(' ', '-')}.png`;
    command('shell', 'screencap', '-p', `/sdcard/${shot}`);
    command('pull', `/sdcard/${shot}`, `.expo/${shot}`);
    await delay(completed && name === 'glass' ? 11000 : name === 'face' ? 8000 : 5500);
    healthy(pid);
    console.log(`${name}: app remained alive through playback and cleanup`);
  }
  command('shell', 'input', 'tap', ...point(550, 1030));
  await delay(900);
  healthy(pid);
  command('shell', 'input', 'keyevent', 'KEYCODE_HOME');
  await delay(1000);
  command('shell', 'am', 'start', '-W', '-n', `${app}/.MainActivity`);
  await delay(2000);
  healthy(pid);
  console.log('Background / foreground passed; no fatal JS or Android exceptions.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

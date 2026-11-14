const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/utils/brownieInteractions.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = { exports: {} };
new Function('exports', 'require', compiled)(loaded.exports, name =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/utils', name), 'utf8')));
const { brownieArtworkFrame, brownieHitTest, brownieGlassHitTest, brownieContainsPoint,
  brownieDragIntent, brownieLookOffset, brownieVideoKey, canStartBrownieReaction, newestUnseenDrink } = loaded.exports;

test('Android Babel worklet closures can call the hit mask on the first touch', () => {
  const filename = path.resolve(__dirname, '../src/utils/brownieInteractions.ts');
  const code = require('@babel/core').transformSync(source, {
    filename, presets: ['babel-preset-expo'], caller: { name: 'metro', platform: 'android' },
  }).code;
  const native = { exports: {} };
  const localRequire = require('node:module').createRequire(filename);
  new Function('exports', 'require', code)(native.exports, localRequire);
  for (const variant of ['vessel', 'poster']) {
    const frame = native.exports.brownieArtworkFrame(270, 330, variant);
    const x = frame.left + (variant === 'poster' ? 350 : 170) * frame.scale;
    const y = frame.top + (variant === 'poster' ? 160 : 85) * frame.scale;
    assert.equal(native.exports.brownieDragIntent(x, y, 270, 330, variant), 'pet');
    assert.equal(native.exports.brownieContainsPoint(x, y, 270, 330, variant), true);
  }
});

test('every touch reaction resolves to a bundled processed video, with distinct ears and four swipe directions', () => {
  assert.equal(brownieVideoKey('ear', 'left'), 'earLeft');
  assert.equal(brownieVideoKey('ear', 'right'), 'earRight');
  for (const direction of ['lookLeft', 'lookRight', 'lookUp', 'lookDown']) assert.equal(brownieVideoKey('follow', 'left', direction), direction);
  const filename = path.join(__dirname, '../src/constants/mascotMedia.ts');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const registry = { exports: {} };
  new Function('require', 'exports', code)(name => {
    const asset = path.resolve(path.dirname(filename), name);
    assert.ok(fs.existsSync(asset), `Missing asset ${name}`);
    return name.endsWith('.json') ? JSON.parse(fs.readFileSync(asset, 'utf8')) : asset;
  }, registry.exports);
  const videos = registry.exports.BROWNIE_REACTION_VIDEOS;
  const trims = require('../assets/characters/brownie/runtime/clips.json');
  for (const reaction of Object.keys(loaded.exports.BROWNIE_REACTIONS)) {
    assert.ok(videos[brownieVideoKey(reaction)]);
  }
  assert.notEqual(videos.earLeft, videos.earRight);
  for (const file of Object.values(videos)) {
    const trim = trims[path.basename(file, '.mp4')];
    assert.ok(trim.duration > 0 && trim.duration <= trim.originalDuration + 0.001);
    assert.ok(trim.start >= 0 && trim.end <= trim.originalDuration + 0.001);
  }
  assert.match(registry.exports.MASCOT_MEDIA.brownie.sippingVideo, /runtime[\\/]sipping.mp4$/);
});

test('finite video player plays embedded audio once, handles errors once, and stops on unmount', () => {
  const filename = path.join(__dirname, '../src/components/BrownieReactionVideo.tsx');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  for (const soundEnabled of [true, false]) {
    const effects = [], events = {}, cleanups = [];
    let ended = 0, played = 0, paused = 0;
    const player = { status: 'readyToPlay', play: () => played++, pause: () => paused++ };
    const react = { createElement: () => null, useState: value => [value, () => {}], useRef: value => ({ current: value }), useEffect: effect => effects.push(effect) };
    const module = { exports: {} };
    new Function('require', 'exports', code)(name => ({
      react, 'react-native': { StyleSheet: { absoluteFill: {} }, View: () => null },
      expo: { useEventListener: (_, name, handler) => { events[name] = handler; } },
      'expo-video': { useVideoPlayer: (_, setup) => { setup(player); return player; }, VideoView: () => null },
    })[name], module.exports);
    module.exports.BrownieReactionVideo({ source: 1, soundEnabled, onEnd: () => ended++ });
    for (const effect of effects) { const cleanup = effect(); if (cleanup) cleanups.push(cleanup); }
    assert.equal(player.muted, !soundEnabled);
    assert.equal(player.loop, false);
    assert.equal(player.staysActiveInBackground, false);
    assert.equal(played, 1);
    events.playToEnd();
    events.playToEnd();
    events.statusChange({ status: 'error' });
    assert.equal(ended, 1, 'end/error races must not finish the same request twice');
    for (const cleanup of cleanups) cleanup();
    assert.ok(paused >= 1);
  }
});

test('Brownie body regions follow contained artwork on phones and tablets, including letterboxing', () => {
  for (const [width, height] of [[230, 280], [270, 330], [540, 660], [700, 350], [240, 600]]) {
    const frame = brownieArtworkFrame(width, height);
    const hit = (x, y) => brownieHitTest(frame.left + x * frame.scale, frame.top + y * frame.scale, width, height);
    assert.deepEqual(hit(110, 85), { reaction: 'ear', ear: 'left' });
    assert.deepEqual(hit(235, 60), { reaction: 'ear', ear: 'right' });
    assert.deepEqual(hit(210, 172), { reaction: 'face' });
    assert.deepEqual(hit(185, 342), { reaction: 'belly' });
    assert.equal(hit(390, 10), null);
    assert.equal(brownieHitTest(0, 0, width, height), null);
  }
});

test('small ear artwork keeps a 48-point touch target with ear priority over face', () => {
  const width = 230;
  const height = 280;
  const frame = brownieArtworkFrame(width, height);
  assert.deepEqual(brownieHitTest(frame.left + 110 * frame.scale + 23, frame.top + 85 * frame.scale, width, height), { reaction: 'ear', ear: 'left' });
});

test('invalid or collapsed layouts and out-of-bounds touches do not trigger Brownie', () => {
  for (const args of [[0, 0, 0, 0], [0, 0, 4, 4], [NaN, 1, 270, 330], [1, Infinity, 270, 330], [1, 1, Infinity, 330], [-50, 20, 270, 330], [600, 600, 270, 330]]) {
    assert.equal(brownieHitTest(...args), null);
  }
});

test('glass replay follows the cup at every size; face and belly do not replay', () => {
  for (const [width, height] of [[230, 280], [540, 660], [240, 600]]) {
    const frame = brownieArtworkFrame(width, height);
    const hit = (x, y) => brownieGlassHitTest(frame.left + x * frame.scale, frame.top + y * frame.scale, width, height);
    assert.equal(hit(285, 320), true);
    assert.equal(hit(210, 172), false);
    assert.equal(hit(185, 342), false);
    // The whole artwork still accepts double-tap/hold as well as specific body-region taps.
    assert.equal(brownieContainsPoint(frame.left + 330 * frame.scale, frame.top + 440 * frame.scale, width, height), true);
  }
});

test('both feet and the tail have distinct targets in vessel and video poses', () => {
  for (const variant of ['vessel', 'poster']) {
    for (const [width, height] of [[230, 280], [540, 660], [700, 350]]) {
      const frame = brownieArtworkFrame(width, height, variant);
      const hit = (x, y) => brownieHitTest(frame.left + x * frame.scale, frame.top + y * frame.scale, width, height, variant);
      const points = variant === 'poster' ? [[290, 605], [532, 598], [173, 552]] : [[212, 426], [350, 418], [42, 392]];
      assert.deepEqual(hit(...points[0]), { reaction: 'foot', foot: 'left' });
      assert.deepEqual(hit(...points[1]), { reaction: 'foot', foot: 'right' });
      assert.deepEqual(hit(...points[2]), { reaction: 'tail' });
    }
  }
});

test('only the visible character and glass hold scrolling; white margins, grass and letterboxing do not', () => {
  for (const variant of ['vessel', 'poster']) {
    for (const [width, height] of [[230, 280], [540, 660], [700, 350], [240, 600]]) {
      const frame = brownieArtworkFrame(width, height, variant);
      const contains = (x, y) => brownieContainsPoint(frame.left + x * frame.scale, frame.top + y * frame.scale, width, height, variant);
      const body = variant === 'poster'
        ? [[242, 157], [468, 147], [362, 267], [285, 505], [173, 552], [290, 605], [532, 598], [400, 480]]
        : [[110, 85], [235, 60], [210, 172], [185, 342], [42, 392], [212, 426], [350, 418], [285, 320]];
      for (const point of body) assert.equal(contains(...point), true, `${variant}: body ${point}`);
      const space = variant === 'poster'
        ? [[15, 15], [150, 300], [590, 280], [600, 600], [370, 680]]
        : [[10, 10], [35, 180], [380, 180], [390, 470]];
      for (const point of space) assert.equal(contains(...point), false, `${variant}: white space ${point}`);
      assert.equal(brownieContainsPoint(0, 0, width, height, variant), false);
    }
  }
});

test('head strokes, face drags and glass replay occupy separate gesture regions', () => {
  for (const variant of ['vessel', 'poster']) {
    const width = 270;
    const height = 330;
    const frame = brownieArtworkFrame(width, height, variant);
    const intent = (x, y) => brownieDragIntent(frame.left + x * frame.scale, frame.top + y * frame.scale, width, height, variant);
    assert.equal(intent(...(variant === 'poster' ? [350, 150] : [180, 80])), 'pet');
    assert.equal(intent(...(variant === 'poster' ? [500, 260] : [300, 160])), 'follow');
    assert.equal(intent(...(variant === 'poster' ? [550, 260] : [355, 160])), null);
    assert.equal(intent(...(variant === 'poster' ? [400, 480] : [285, 320])), null);
    assert.equal(intent(0, 0), null);
  }
});

test('pupil travel stays bounded and invalid positions return to the neutral gaze', () => {
  for (const variant of ['vessel', 'poster']) {
    assert.deepEqual(brownieLookOffset(-5000, 9000, 270, 330, variant), { x: -1, y: 1 });
    assert.deepEqual(brownieLookOffset(NaN, 0, 270, 330, variant), { x: 0, y: 0 });
    assert.deepEqual(brownieLookOffset(0, 0, 0, 0, variant), { x: 0, y: 0 });
  }
});

test('voiced videos finish once without overlapping; only silent idle can be interrupted', () => {
  assert.equal(canStartBrownieReaction(null, 'idle'), true);
  assert.equal(canStartBrownieReaction('tail', 'idle'), false);
  assert.equal(canStartBrownieReaction('follow', 'idle'), false);
  assert.equal(canStartBrownieReaction('idle', 'tail'), true);
  for (const current of ['rest', 'pet', 'follow']) assert.equal(canStartBrownieReaction(current, 'tail'), false);
  assert.equal(canStartBrownieReaction('hop', 'face'), false);
  assert.equal(canStartBrownieReaction('tail', 'tail'), false);
  assert.equal(canStartBrownieReaction('tail', 'drink'), false);
});

test('drink acknowledgement ignores saved history and picks only the newest added positive drink', () => {
  const saved = [{ id: 'old', amount: 250, timestamp: 10 }];
  const seen = new Set(saved.map(log => log.id));
  assert.equal(newestUnseenDrink(saved, seen), null);
  const first = { id: 'new-1', amount: 100, timestamp: 20 };
  const latest = { id: 'new-2', amount: 300, timestamp: 30 };
  assert.equal(newestUnseenDrink([latest, ...saved, first, { id: 'invalid', amount: 0, timestamp: 50 }], seen), latest);
  assert.equal(newestUnseenDrink([first, latest], new Set(['new-1', 'new-2'])), null);
  assert.equal(seen.size, 1);
});

test('video-poster hit regions use square video framing rather than the old vessel artwork', () => {
  for (const [width, height] of [[230, 280], [540, 660], [700, 350]]) {
    const frame = brownieArtworkFrame(width, height, 'poster');
    assert.equal(frame.width, frame.height);
    const hit = (x, y) => brownieHitTest(frame.left + x * frame.scale, frame.top + y * frame.scale, width, height, 'poster');
    assert.deepEqual(hit(242, 157), { reaction: 'ear', ear: 'left' });
    assert.deepEqual(hit(468, 147), { reaction: 'ear', ear: 'right' });
    assert.deepEqual(hit(362, 267), { reaction: 'face' });
    assert.deepEqual(hit(285, 505), { reaction: 'belly' });
    assert.equal(brownieGlassHitTest(frame.left + 400 * frame.scale, frame.top + 480 * frame.scale, width, height, 'poster'), true);
    assert.equal(brownieGlassHitTest(frame.left + 285 * frame.scale, frame.top + 505 * frame.scale, width, height, 'poster'), false);
  }
});

test('all character sound files are distinct, short playable mono PCM assets', () => {
  const seen = new Set();
  for (const name of ['brownie', 'dodo', 'mammoth', 'sloth', 'turtle', 'penguin']) {
    const file = fs.readFileSync(path.join(__dirname, `../assets/characters/${name}/reaction.wav`));
    assert.equal(file.toString('ascii', 0, 4), 'RIFF');
    assert.equal(file.toString('ascii', 8, 12), 'WAVE');
    assert.equal(file.readUInt16LE(20), 1);
    assert.equal(file.readUInt16LE(22), 1);
    assert.equal(file.readUInt32LE(40) + 44, file.length);
    assert.ok(file.readUInt32LE(40) / file.readUInt32LE(28) < 1);
    seen.add(require('node:crypto').createHash('sha256').update(file).digest('hex'));
  }
  assert.equal(seen.size, 6);
});

test('every Brownie interaction has its own bundled voice clip with audible PCM samples', () => {
  const filename = path.join(__dirname, '../src/constants/mascotMedia.ts');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(name => {
    const resolved = path.resolve(path.dirname(filename), name);
    return name.endsWith('.json') ? JSON.parse(fs.readFileSync(resolved, 'utf8')) : resolved;
  }, exports);
  const sounds = exports.BROWNIE_REACTION_SOUNDS;
  const hashes = new Set();
  for (const reaction of Object.keys(loaded.exports.BROWNIE_REACTIONS)) {
    const file = fs.readFileSync(sounds[reaction]);
    assert.equal(file.toString('ascii', 0, 4), 'RIFF');
    assert.equal(file.toString('ascii', 8, 12), 'WAVE');
    assert.equal(file.readUInt16LE(20), 1);
    assert.equal(file.readUInt16LE(22), 1);
    const data = file.indexOf(Buffer.from('data'));
    const bytes = file.readUInt32LE(data + 4);
    const measuredDuration = bytes / file.readUInt32LE(28) * 1000;
    assert.ok(Math.abs(measuredDuration - exports.BROWNIE_SOUND_DURATIONS[reaction]) <= 1, `${reaction} timing metadata does not match its full audio`);
    let peak = 0;
    for (let i = data + 8; i < data + 8 + bytes; i += 2) peak = Math.max(peak, Math.abs(file.readInt16LE(i)));
    assert.ok(peak > 2000 && peak < 32767, `${reaction} is silent or clipped`);
    hashes.add(require('node:crypto').createHash('sha256').update(file).digest('hex'));
  }
  assert.equal(hashes.size, Object.keys(loaded.exports.BROWNIE_REACTIONS).length);
});

test('completed goals render the opaque character instead of water, with glass replay and Brownie interactions', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const surfaces = [];
  const pans = [];
  const rejected = [];
  const touched = [];
  const element = tag => ({ children, testID, accessibilityLabel, pointerEvents, ...props }) => {
    if (testID === 'brownie-touch-surface') surfaces.push(props);
    return React.createElement(tag, { 'data-testid': testID, 'aria-label': accessibilityLabel, 'data-source': props.source,
      'data-actions': props.accessibilityActions ? JSON.stringify(props.accessibilityActions) : undefined,
      style: Array.isArray(props.style) ? Object.assign({}, ...props.style) : props.style }, children);
  };
  const fragment = ({ children }) => React.createElement(React.Fragment, null, children);
  const rn = { View: element('div'), Text: element('span'), Pressable: element('button'), Image: element('img'), ActivityIndicator: element('div'),
    StyleSheet: { create: value => value, absoluteFill: {} }, AppState: { currentState: 'active' }, Platform: { OS: 'android' } };
  const svg = { __esModule: true, default: element('svg') };
  for (const name of ['ClipPath', 'Defs', 'Ellipse', 'G', 'Image', 'Mask', 'Path', 'RadialGradient', 'Rect', 'Stop', 'Circle', 'LinearGradient']) {
    svg[name] = ({ children, id, opacity, href }) => React.createElement('g', { 'data-svg': name, id, opacity, 'data-source': href }, children);
  }
  const reanimated = { __esModule: true, default: { View: element('div'), createAnimatedComponent: component => component },
    useSharedValue: value => React.useRef({ value }).current, useAnimatedStyle: () => ({}), cancelAnimation: () => {},
    useAnimatedProps: () => ({}),
    Easing: { out: () => {}, cubic: () => {} } };
  const mocks = {
    react: React, 'react-native': rn, 'react-native-svg': svg, 'react-native-reanimated': reanimated,
    '@expo/vector-icons': { Ionicons: element('i') },
    'expo-audio': { useAudioPlayer: () => ({}), setAudioModeAsync: async () => {} },
    'expo-video': { useVideoPlayer: () => ({}), VideoView: element('video') }, expo: { useEventListener: () => {} },
    '@react-native-async-storage/async-storage': {},
    'react-native-worklets': { scheduleOnRN: (fn, ...args) => fn(...args) },
    'react-native-gesture-handler': { GestureDetector: fragment, GestureStateManager: { fail: tag => rejected.push(tag) },
      useTapGesture: value => value, usePanGesture: value => { pans.push(value); return value; },
      useLongPressGesture: value => value, useExclusiveGestures: () => ({}), useCompetingGestures: () => ({}) },
    'expo-haptics': {},
  };
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = { exports: {} };
    cache.set(filename, mod);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const localRequire = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.endsWith('.json')) return JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), name), 'utf8'));
      if (/\.(png|mp4|wav)$/.test(name)) {
        assert.ok(fs.existsSync(path.resolve(path.dirname(filename), name)), `Missing bundled asset: ${name}`);
        return name;
      }
      if (name.startsWith('.')) {
        const target = path.resolve(path.dirname(filename), name);
        const resolved = [target, `${target}.ts`, `${target}.tsx`, path.join(target, 'index.ts')].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
        return load(resolved);
      }
      return require(name);
    };
    new Function('require', 'module', 'exports', code)(localRequire, mod, mod.exports);
    return mod.exports;
  }
  const { CapybaraVessel } = load(path.join(__dirname, '../src/components/CapybaraVessel.tsx'));
  const render = (amount, mascotId = 'brownie') => renderToStaticMarkup(React.createElement(CapybaraVessel, {
    mascotId, dailyTarget: 2000, width: 270, height: 330, soundEnabled: false,
    onCharacterTouchStart: identifiers => touched.push(identifiers),
    logs: [{ id: 'test', amount, effectiveAmount: amount, color: '#00C3E3' }],
  }));
  const progress = render(1000);
  assert.match(progress, /mascotClip/);
  assert.match(progress, /opacity:0.38/);
  for (const mascot of ['brownie', 'dodo', 'mammoth', 'sloth', 'turtle', 'penguin']) {
    const full = render(2000, mascot);
    assert.doesNotMatch(full, /mascotClip/);
    assert.doesNotMatch(full, /opacity:0.38/);
    assert.match(full, /100% GOAL CRUSHED!/);
    assert.match(full, /Replay sipping celebration/);
    assert.ok(full.includes(`characters/${mascot}/${mascot === 'brownie' ? 'runtime/' : ''}poster.png`));
    if (mascot === 'brownie') {
      assert.match(full, /brownie-touch-surface/);
      assert.doesNotMatch(full, /Choose a reaction|Replay sipping celebration<|brownie-actions-toggle|brownie-reaction-status/);
      assert.doesNotMatch(full, /<button/);
      const frame = brownieArtworkFrame(270, 330, 'poster');
      const touch = (identifier, x, y) => ({ identifier, locationX: frame.left + x * frame.scale, locationY: frame.top + y * frame.scale });
      const surface = surfaces.at(-1);
      surface.onTouchStart({ nativeEvent: { changedTouches: [touch(1, 150, 300)] } });
      assert.deepEqual(touched, [], 'white space must not request a scroll lock');
      surface.onTouchStart({ nativeEvent: { changedTouches: [touch(2, 362, 267), touch(3, 150, 300)] } });
      assert.deepEqual(touched, [[2]], 'only fingers starting on Brownie may hold the scroll lock');
      const pan = pans.at(-1);
      assert.equal(pan.cancelsJSResponder, false, 'activating the drag must preserve touch-end delivery for the scroll lock');
      pan.onTouchesDown({ handlerTag: 91, changedTouches: [{ x: touch(4, 150, 300).locationX, y: touch(4, 150, 300).locationY }] });
      assert.deepEqual(rejected, [91], 'a white-space drag must fail before it can steal scrolling');
      pan.onTouchesDown({ handlerTag: 92, changedTouches: [{ x: touch(5, 362, 267).locationX, y: touch(5, 362, 267).locationY }] });
      assert.deepEqual(rejected, [91], 'a character drag must remain eligible');
    }
  }
});

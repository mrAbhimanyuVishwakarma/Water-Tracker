import type { DrinkLog } from '../types';
import touchMasks from '../../assets/characters/brownie/touch-mask.json';

export type BrownieReaction = 'ear' | 'face' | 'belly' | 'hop' | 'rest' | 'pet' | 'drink' | 'idle' | 'follow' | 'foot' | 'tail';
export type BrownieEar = 'left' | 'right';
export type BrownieArtVariant = 'vessel' | 'poster';

// Coordinates belong to characters/brownie/vessel.png, not to the surrounding screen.
export const BROWNIE_ART = { width: 398, height: 479, inset: 4 };
export const BROWNIE_POSTER = { width: 720, height: 720, inset: 0 };

export const BROWNIE_REACTIONS: Record<BrownieReaction, { label: string; message: string; duration: number }> = {
  ear: { label: 'Wiggle ears', message: 'You have Brownie’s attention.', duration: 1100 },
  face: { label: 'Make Brownie smile', message: 'A little smile, just for you.', duration: 1500 },
  belly: { label: 'Tickle belly', message: 'That tickles!', duration: 1100 },
  hop: { label: 'Happy hop', message: 'Making a little splash!', duration: 1200 },
  rest: { label: 'Help Brownie relax', message: 'A quiet moment with Brownie.', duration: 3600 },
  pet: { label: 'Pet Brownie’s head', message: 'Brownie leans into your touch.', duration: 1800 },
  drink: { label: 'Show a happy sip response', message: 'A little nod for your latest sip.', duration: 1500 },
  idle: { label: 'Let Brownie look around', message: 'Brownie is taking a little look around.', duration: 1600 },
  follow: { label: 'Make Brownie look around', message: 'You have Brownie’s eyes following along.', duration: 2600 },
  foot: { label: 'Tap a foot', message: 'A tiny kick, just for fun.', duration: 1100 },
  tail: { label: 'Tap Brownie’s tail', message: 'Brownie closes his eyes and shakes his head: no, no.', duration: 1700 },
};

export function canStartBrownieReaction(current: BrownieReaction | null, next: BrownieReaction) {
  if (next === 'idle') return current === null;
  // Only silent idle may be interrupted. Voiced clips finish before another starts.
  return current === null || current === 'idle';
}

export function brownieVideoKey(reaction: BrownieReaction, side: BrownieEar = 'left',
  direction: 'lookLeft' | 'lookRight' | 'lookUp' | 'lookDown' = 'lookLeft') {
  return reaction === 'ear' ? side === 'left' ? 'earLeft' : 'earRight' : reaction === 'follow' ? direction : reaction;
}

export function newestUnseenDrink(logs: readonly DrinkLog[], seen: ReadonlySet<string>) {
  return logs.reduce<DrinkLog | null>((latest, log) =>
    !seen.has(log.id) && log.amount > 0 && (!latest || log.timestamp >= latest.timestamp) ? log : latest, null);
}

export function brownieArtworkFrame(width: number, height: number, variant: BrownieArtVariant = 'vessel') {
  'worklet';
  const art = variant === 'poster' ? BROWNIE_POSTER : BROWNIE_ART;
  const scale = Math.max(0, Math.min(
    (width - art.inset * 2) / art.width,
    (height - art.inset * 2) / art.height,
  ));
  return {
    scale,
    width: art.width * scale,
    height: art.height * scale,
    left: (width - art.width * scale) / 2,
    top: (height - art.height * scale) / 2,
  };
}

export function brownieHitTest(x: number, y: number, width: number, height: number, variant: BrownieArtVariant = 'vessel'):
  { reaction: 'ear' | 'face' | 'belly' | 'foot' | 'tail' | 'pet'; ear?: BrownieEar; foot?: BrownieEar } | null {
  const frame = brownieArtworkFrame(width, height, variant);
  if (!frame.scale || ![x, y, width, height].every(Number.isFinite)) return null;
  const artX = (x - frame.left) / frame.scale;
  const artY = (y - frame.top) / frame.scale;
  const art = variant === 'poster' ? BROWNIE_POSTER : BROWNIE_ART;
  if (artX < 0 || artX > art.width || artY < 0 || artY > art.height) return null;

  // Expand each ear to at least a 48-point touch target; ears win overlap with the face.
  const earRadius = Math.max(31, 24 / frame.scale);
  if (variant === 'poster') {
    if (Math.hypot(artX - 242, artY - 157) <= earRadius) return { reaction: 'ear', ear: 'left' };
    if (Math.hypot(artX - 468, artY - 147) <= earRadius) return { reaction: 'ear', ear: 'right' };
    if (artX < 225 && Math.hypot(artX - 173, artY - 552) <= Math.max(35, 24 / frame.scale)) return { reaction: 'tail' };
    if (Math.hypot(artX - 300, artY - 630) <= Math.max(40, 24 / frame.scale)) return { reaction: 'foot', foot: 'left' };
    if (Math.hypot(artX - 530, artY - 630) <= Math.max(45, 24 / frame.scale)) return { reaction: 'foot', foot: 'right' };
    if (artX >= 280 && artX <= 425 && artY >= 110 && artY <= 205) return { reaction: 'pet' };
    if (((artX - 362) / 152) ** 2 + ((artY - 267) / 115) ** 2 <= 1) return { reaction: 'face' };
    if (((artX - 285) / 100) ** 2 + ((artY - 505) / 92) ** 2 <= 1) return { reaction: 'belly' };
    return null;
  }
  if (Math.hypot(artX - 110, artY - 85) <= earRadius) return { reaction: 'ear', ear: 'left' };
  if (Math.hypot(artX - 235, artY - 60) <= earRadius) return { reaction: 'ear', ear: 'right' };
  if (artX >= 145 && artX <= 205 && artY >= 35 && artY <= 90) return { reaction: 'pet' };
  if (artX < 86 && Math.hypot(artX - 42, artY - 392) <= Math.max(30, 24 / frame.scale)) return { reaction: 'tail' };
  if (Math.hypot(artX - 212, artY - 426) <= Math.max(27, 24 / frame.scale)) return { reaction: 'foot', foot: 'left' };
  if (Math.hypot(artX - 350, artY - 418) <= Math.max(29, 24 / frame.scale)) return { reaction: 'foot', foot: 'right' };
  if (((artX - 210) / 118) ** 2 + ((artY - 172) / 93) ** 2 <= 1) return { reaction: 'face' };
  if (((artX - 185) / 116) ** 2 + ((artY - 342) / 91) ** 2 <= 1) return { reaction: 'belly' };
  return null;
}

// Worklets capture their dependencies when the module initializes. Define this
// before brownieDragIntent so its closure never captures an undefined function.
export function brownieContainsPoint(x: number, y: number, width: number, height: number, variant: BrownieArtVariant = 'vessel') {
  'worklet';
  const frame = brownieArtworkFrame(width, height, variant);
  if (frame.scale <= 0 || ![x, y, width, height].every(Number.isFinite)) return false;
  const mask = touchMasks[variant];
  const artX = (x - frame.left) / frame.scale;
  const artY = (y - frame.top) / frame.scale;
  if (artX < 0 || artY < 0 || artX >= mask.width || artY >= mask.height) return false;
  const column = Math.floor(artX / mask.step);
  const row = mask.rows[Math.floor(artY / mask.step)];
  for (let index = 0; index < row.length; index += 2) {
    if (column >= row[index] && column < row[index + 1]) return true;
  }
  return false;
}

export function brownieDragIntent(x: number, y: number, width: number, height: number, variant: BrownieArtVariant = 'vessel'): 'pet' | 'follow' | null {
  'worklet';
  if (!brownieContainsPoint(x, y, width, height, variant)) return null;
  const frame = brownieArtworkFrame(width, height, variant);
  if (!frame.scale || ![x, y, width, height].every(Number.isFinite)) return null;
  const artX = (x - frame.left) / frame.scale;
  const artY = (y - frame.top) / frame.scale;
  if (variant === 'poster') {
    if (artX >= 220 && artX <= 490 && artY >= 105 && artY <= 207) return 'pet';
    if (artX >= 125 && artX <= 595 && artY >= 190 && artY <= 370) return 'follow';
  } else {
    if (artX >= 85 && artX <= 260 && artY >= 40 && artY <= 120) return 'pet';
    if (artX >= 35 && artX <= 385 && artY >= 105 && artY <= 250) return 'follow';
  }
  return null;
}

export function brownieLookOffset(x: number, y: number, width: number, height: number, variant: BrownieArtVariant = 'vessel') {
  'worklet';
  const frame = brownieArtworkFrame(width, height, variant);
  if (!frame.scale || ![x, y, width, height].every(Number.isFinite)) return { x: 0, y: 0 };
  const artX = (x - frame.left) / frame.scale;
  const artY = (y - frame.top) / frame.scale;
  const poster = variant === 'poster';
  return {
    x: Math.max(-1, Math.min(1, (artX - (poster ? 375 : 210)) / (poster ? 145 : 105))),
    y: Math.max(-1, Math.min(1, (artY - (poster ? 240 : 134)) / (poster ? 100 : 80))),
  };
}

export function brownieGlassHitTest(x: number, y: number, width: number, height: number, variant: BrownieArtVariant = 'vessel') {
  const frame = brownieArtworkFrame(width, height, variant);
  if (!frame.scale || ![x, y, width, height].every(Number.isFinite)) return false;
  const artX = (x - frame.left) / frame.scale;
  const artY = (y - frame.top) / frame.scale;
  return variant === 'poster'
    ? artX >= 350 && artX <= 495 && artY >= 415 && artY <= 592
    : artX >= 226 && artX <= 352 && artY >= 246 && artY <= 399;
}


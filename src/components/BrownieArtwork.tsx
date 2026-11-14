import React, { ReactNode, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, Image as SvgImage, Mask, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { BrownieArtVariant, brownieArtworkFrame } from '../utils/brownieInteractions';
import { MASCOT_MEDIA } from '../constants/mascotMedia';

const SOURCE = MASCOT_MEDIA.brownie.vessel;
const OPEN_EYES = MASCOT_MEDIA.brownie.openEyes;
const BLINK = MASCOT_MEDIA.brownie.blink;
const ART = {
  vessel: {
    width: 398, height: 479, source: SOURCE, neckY: 250,
    leftEar: 'M78 48 H121 L143 78 L129 115 L96 110 L78 91 Z',
    rightEar: 'M214 32 H256 V83 H214 Z',
    leftPivot: [123, 105], rightPivot: [235, 77],
    leftFoot: 'M181 392 C187 377 211 376 224 391 C237 413 236 443 222 456 C205 467 186 461 178 446 C176 427 176 405 181 392 Z',
    rightFoot: 'M328 390 C340 376 365 375 374 389 L376 417 C368 443 354 453 330 449 L315 437 Z',
    leftFootPivot: [207, 398], rightFootPivot: [330, 401],
  },
  poster: {
    width: 720, height: 720, source: MASCOT_MEDIA.brownie.poster, neckY: 378,
    leftEar: 'M199 118 L241 116 L279 164 L253 198 L217 190 L200 162 Z',
    rightEar: 'M434 110 H499 V181 L451 187 Z',
    leftPivot: [252, 185], rightPivot: [461, 178],
    leftFoot: 'M268 566 C285 555 307 562 315 585 L320 616 C319 638 299 650 277 642 C257 633 256 598 268 566 Z',
    rightFoot: 'M520 556 C531 546 553 549 568 565 L570 590 C562 618 551 640 527 639 L504 628 L505 597 Z',
    leftFootPivot: [282, 575], rightFootPivot: [521, 576],
  },
};

type ArtProps = {
  width: number; height: number; earWiggle: SharedValue<number>; ear: 'left' | 'right';
  footWiggle: SharedValue<number>; foot: 'left' | 'right';
  headShake: SharedValue<number>;
  opacity: number; variant: BrownieArtVariant;
};

function ArtworkPart({ art, scale, path, pivot, angle, active = true, direction = 1 }: {
  art: typeof ART[BrownieArtVariant]; scale: number; path: string; pivot: number[];
  angle: SharedValue<number>; active?: boolean; direction?: number;
}) {
  const id = useId().replace(/:/g, '');
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${active ? angle.value * direction : 0}deg` }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: [pivot[0] * scale, pivot[1] * scale, 0] }, style]}>
    <Svg width="100%" height="100%" viewBox={`0 0 ${art.width} ${art.height}`}>
      <Defs><ClipPath id={id}><Path d={path} /></ClipPath></Defs>
      <G clipPath={`url(#${id})`}><SvgImage href={art.source} width={art.width} height={art.height} /></G>
    </Svg>
  </Animated.View>;
}

// The original head and its expression share one small, neck-anchored sway.
export function BrownieHeadMotion({ width, height, variant, headShake, children }: {
  width: number; height: number; variant: BrownieArtVariant; headShake: SharedValue<number>; children: ReactNode;
}) {
  const frame = brownieArtworkFrame(width, height, variant);
  const art = ART[variant];
  const style = useAnimatedStyle(() => ({ transform: [
    // Keep the neck level so the original neck/straw join never opens a gap.
    { translateX: headShake.value * frame.scale }, { scaleX: 1 - Math.abs(headShake.value) * 0.001 },
  ] }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill,
    { transformOrigin: [frame.left + frame.width * 0.5, frame.top + art.neckY * frame.scale, 0] }, style]}>{children}</Animated.View>;
}

export function BrownieArtwork({ width, height, earWiggle, ear, footWiggle, foot, headShake, opacity, variant }: ArtProps) {
  const id = useId().replace(/:/g, '');
  const frame = brownieArtworkFrame(width, height, variant);
  const art = ART[variant];
  const viewBox = `0 0 ${art.width} ${art.height}`;
  // A small overlap under the moving neck prevents a hairline on either side.
  const outside = `M0 ${art.neckY - 6} H${art.width} V${art.height} H0 Z ${art.leftFoot} ${art.rightFoot}`;
  const head = `M0 0 H${art.width} V${art.neckY} H0 Z ${art.leftEar} ${art.rightEar}`;
  const image = <SvgImage href={art.source} width={art.width} height={art.height} />;
  const frameStyle = { position: 'absolute' as const, left: frame.left, top: frame.top, width: frame.width, height: frame.height };

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <View style={frameStyle}>
        <Svg width="100%" height="100%" viewBox={viewBox}>
          <Defs><ClipPath id={`${id}body`}><Path d={outside} clipRule="evenodd" fillRule="evenodd" /></ClipPath></Defs>
          <G clipPath={`url(#${id}body)`}>{image}</G>
        </Svg>
        <ArtworkPart art={art} scale={frame.scale} path={art.leftFoot} pivot={art.leftFootPivot} angle={footWiggle} active={foot === 'left'} />
        <ArtworkPart art={art} scale={frame.scale} path={art.rightFoot} pivot={art.rightFootPivot} angle={footWiggle} active={foot === 'right'} direction={-1} />
      </View>
      <BrownieHeadMotion width={width} height={height} variant={variant} headShake={headShake}>
        <View style={frameStyle}>
          <Svg width="100%" height="100%" viewBox={viewBox}>
            <Defs><ClipPath id={`${id}head`}><Path d={head} clipRule="evenodd" fillRule="evenodd" /></ClipPath></Defs>
            <G clipPath={`url(#${id}head)`}>{image}</G>
          </Svg>
          <ArtworkPart art={art} scale={frame.scale} path={art.leftEar} pivot={art.leftPivot} angle={earWiggle} active={ear === 'left'} />
          <ArtworkPart art={art} scale={frame.scale} path={art.rightEar} pivot={art.rightPivot} angle={earWiggle} active={ear === 'right'} direction={-1} />
        </View>
      </BrownieHeadMotion>
    </View>
  );
}

// Reuse only the eye from the alternate artwork: its white border and different body never appear.
export function BrownieExpression({ width, height, eyes, blush, variant }: {
  width: number; height: number; eyes: SharedValue<number>; blush: SharedValue<number>; variant: BrownieArtVariant;
}) {
  const id = useId().replace(/:/g, '');
  const frame = brownieArtworkFrame(width, height, variant);
  const poster = variant === 'poster';
  const viewBox = poster ? '0 0 720 720' : '0 0 398 479';
  const eyesStyle = useAnimatedStyle(() => ({ opacity: eyes.value }));
  const blushStyle = useAnimatedStyle(() => ({ opacity: blush.value }));
  const style = { position: 'absolute' as const, left: frame.left, top: frame.top, width: frame.width, height: frame.height };
  return (
    <View pointerEvents="none" style={style}>
      <Animated.View style={[StyleSheet.absoluteFill, eyesStyle]}>
        <Svg width="100%" height="100%" viewBox={viewBox}>
          <Defs>
            <RadialGradient id={`${id}feather`}><Stop offset="0.72" stopColor="white" /><Stop offset="1" stopColor="black" /></RadialGradient>
            <Mask id={`${id}eye`} maskUnits="userSpaceOnUse" x={poster ? 240 : 130} y={poster ? 190 : 94} width={poster ? 265 : 85} height={poster ? 105 : 80}>
              <Rect width={poster ? 720 : 398} height={poster ? 720 : 479} fill="black" />
              {poster ? <>
                <Ellipse cx="295" cy="240" rx="42" ry="38" fill={`url(#${id}feather)`} />
                <Ellipse cx="458" cy="236" rx="40" ry="37" fill={`url(#${id}feather)`} />
              </> : <Ellipse cx="174" cy="134" rx="35" ry="34" fill={`url(#${id}feather)`} />}
            </Mask>
          </Defs>
          <G mask={`url(#${id}eye)`}>
            <SvgImage href={poster ? BLINK : OPEN_EYES} x={poster ? 0 : -4} y={poster ? 6 : 18} width={poster ? 720 : 398} height={poster ? 720 : 479} />
          </G>
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, blushStyle]}>
        <Svg width="100%" height="100%" viewBox={viewBox}>
          <Ellipse cx={poster ? 270 : 157} cy={poster ? 284 : 169} rx={poster ? 24 : 22} ry={poster ? 14 : 12} fill="#F59B70" opacity="0.7" />
          {poster && <Ellipse cx="483" cy="273" rx="24" ry="14" fill="#F59B70" opacity="0.7" />}
        </Svg>
      </Animated.View>
    </View>
  );
}

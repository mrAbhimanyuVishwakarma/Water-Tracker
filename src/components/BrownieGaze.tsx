import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, Image as SvgImage } from 'react-native-svg';
import Animated, { SharedValue, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import { MASCOT_MEDIA } from '../constants/mascotMedia';
import { BrownieArtVariant, brownieArtworkFrame } from '../utils/brownieInteractions';

const AnimatedImage = Animated.createAnimatedComponent(SvgImage);

export function BrownieGaze({ width, height, variant, looking, lookX, lookY }: {
  width: number; height: number; variant: BrownieArtVariant; looking: SharedValue<number>;
  lookX: SharedValue<number>; lookY: SharedValue<number>;
}) {
  const id = useId().replace(/:/g, '');
  const frame = brownieArtworkFrame(width, height, variant);
  const poster = variant === 'poster';
  const artWidth = poster ? 720 : 398;
  const artHeight = poster ? 720 : 479;
  const source = poster ? MASCOT_MEDIA.brownie.poster : MASCOT_MEDIA.brownie.openEyes;
  const eyes = poster ? [{ x: 295, y: 240, rx: 22, ry: 25 }, { x: 458, y: 236, rx: 21, ry: 24 }] : [{ x: 174, y: 134, rx: 14, ry: 17 }];
  const lookStyle = useAnimatedStyle(() => ({ opacity: looking.value }));
  const pupilProps = useAnimatedProps(() => ({
    x: (poster ? 0 : -4) + lookX.value * (poster ? 8 : 4),
    y: (poster ? 0 : 18) + lookY.value * (poster ? 6 : 3),
  }));

  return <View pointerEvents="none" style={{ position: 'absolute', left: frame.left, top: frame.top, width: frame.width, height: frame.height }}>
    <Animated.View style={[StyleSheet.absoluteFill, lookStyle]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${artWidth} ${artHeight}`}>
        <Defs><ClipPath id={`${id}pupils`}>{eyes.map(eye => <Ellipse key={eye.x} cx={eye.x} cy={eye.y} rx={eye.rx} ry={eye.ry} />)}</ClipPath></Defs>
        <G clipPath={`url(#${id}pupils)`}>
          {eyes.map(eye => <Ellipse key={eye.x} cx={eye.x} cy={eye.y} rx={eye.rx} ry={eye.ry} fill="#FFF4DF" />)}
          <AnimatedImage href={source} width={artWidth} height={artHeight} animatedProps={pupilProps} />
        </G>
      </Svg>
    </Animated.View>
  </View>;
}

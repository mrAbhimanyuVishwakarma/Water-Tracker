import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Image } from 'react-native';
import { MascotId } from '../types';
import { MASCOT_MEDIA } from '../constants/mascotMedia';

interface Props {
  type: 'float' | 'sipping';
  mascotId: MascotId | string;
  width: number;
  height: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

export const CrispVectorMascot: React.FC<Props> = ({
  type,
  mascotId,
  width,
  height,
  opacity = 1,
  style,
}) => {
  const media = Object.hasOwn(MASCOT_MEDIA, mascotId) ? MASCOT_MEDIA[mascotId as MascotId] : MASCOT_MEDIA.brownie;
  const source = type === 'float' ? media.float : media.vessel;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { width, height, opacity },
        style,
      ]}
    >
      <Image
        source={source}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});


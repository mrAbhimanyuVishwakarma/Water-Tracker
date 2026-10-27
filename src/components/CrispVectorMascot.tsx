import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Image, ImageSourcePropType } from 'react-native';
import { MascotId } from '../types';

interface Props {
  type: 'float' | 'sipping';
  mascotId: MascotId | string;
  width: number;
  height: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

// 100% reliable, hardware-accelerated high-resolution mascot artworks for Android & iOS
export const MASCOT_ASSETS: Record<'float' | 'sipping', Record<string, ImageSourcePropType>> = {
  float: {
    brownie: require('../../assets/capybara_donut_float.png'),
    dodo: require('../../assets/dodo_donut_float.png'),
    mammoth: require('../../assets/mammoth_donut_float.png'),
    sloth: require('../../assets/sloth_donut_float.png'),
    turtle: require('../../assets/turtle_donut_float.png'),
    penguin: require('../../assets/penguin_donut_float.png'),
  },
  sipping: {
    brownie: require('../../assets/brownie_sipping.png'),
    dodo: require('../../assets/dodo_sipping.png'),
    mammoth: require('../../assets/mammoth_sipping.png'),
    sloth: require('../../assets/sloth_sipping.png'),
    turtle: require('../../assets/turtle_sipping.png'),
    penguin: require('../../assets/penguin_sipping.png'),
  },
};

export const CrispVectorMascot: React.FC<Props> = ({
  type,
  mascotId,
  width,
  height,
  opacity = 1,
  style,
}) => {
  const source =
    MASCOT_ASSETS[type]?.[mascotId] || MASCOT_ASSETS[type]?.brownie;

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


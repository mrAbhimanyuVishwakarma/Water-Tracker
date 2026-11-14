import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { MASCOT_MEDIA } from '../constants/mascotMedia';
import { MascotId } from '../types';

const GLASSES: Record<MascotId, { x: number; y: number; width: number; height: number }> = {
  brownie: { x: 326, y: 378, width: 150, height: 192 },
  dodo: { x: 215, y: 410, width: 125, height: 186 },
  mammoth: { x: 292, y: 455, width: 138, height: 218 },
  sloth: { x: 258, y: 392, width: 139, height: 217 },
  turtle: { x: 258, y: 398, width: 144, height: 220 },
  penguin: { x: 276, y: 417, width: 147, height: 234 },
};

export function CompletedMascot({ mascotId, width, height, onGlassPress, enabled }: {
  mascotId: MascotId; width: number; height: number; onGlassPress: () => void; enabled: boolean;
}) {
  const scale = Math.min(width, height) / 720;
  const glass = GLASSES[mascotId];
  const hitWidth = Math.max(48, glass.width * scale);
  const hitHeight = Math.max(48, glass.height * scale);
  return <View style={{ width, height }}>
    <Image source={MASCOT_MEDIA[mascotId].poster} resizeMode="contain" style={{ width, height }} accessible={false} />
    <Pressable onPress={onGlassPress} disabled={!enabled} accessibilityRole="button"
      accessibilityLabel="Replay sipping celebration" accessibilityHint="Tap the water glass to sip again"
      testID="mascot-glass-replay"
      style={{ position: 'absolute',
        left: (width - 720 * scale) / 2 + (glass.x + glass.width / 2) * scale - hitWidth / 2,
        top: (height - 720 * scale) / 2 + (glass.y + glass.height / 2) * scale - hitHeight / 2,
        width: hitWidth, height: hitHeight }} />
  </View>;
}

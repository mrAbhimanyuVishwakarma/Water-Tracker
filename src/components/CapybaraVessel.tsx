import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  ClipPath,
  Rect,
  G,
  Circle,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { DrinkLog, MascotId } from '../types';
import { feedback } from '../utils/feedback';
import { CrispVectorMascot } from './CrispVectorMascot';

interface Props {
  logs: DrinkLog[];
  dailyTarget: number; // in ml
  mascotId?: MascotId;
  width?: number;
  height?: number;
}

const DEFAULT_WIDTH = 270;
const DEFAULT_HEIGHT = 330;

// Mascot Vector Contours (fitted to 270x330 viewBox)
const MASCOT_CONTOURS: Record<string, string> = {
  brownie:
    'M 167.4 26.7 L 158.3 28.1 L 152.7 40.0 L 129.4 28.8 L 118.2 36.5 L 111.2 35.1 L 92.2 50.5 L 71.8 40.7 L 59.8 51.9 L 59.1 65.9 L 68.2 78.6 L 53.5 96.8 L 57.7 103.8 L 48.5 132.6 L 54.2 136.8 L 56.3 157.1 L 65.4 161.3 L 38.0 211.8 L 34.5 262.3 L 19.0 244.8 L 8.4 259.5 L 19.0 294.6 L 30.3 304.4 L 59.1 306.5 L 93.6 322.0 L 156.2 326.9 L 186.4 310.7 L 242.7 312.9 L 258.9 293.2 L 262.4 275.7 L 255.4 268.7 L 241.3 270.1 L 234.3 259.5 L 236.4 239.2 L 249.0 223.8 L 247.6 212.5 L 240.6 206.2 L 242.7 183.1 L 231.5 175.4 L 206.1 171.9 L 222.3 157.8 L 230.8 141.7 L 229.3 100.3 L 211.8 74.4 L 177.3 49.1 L 176.6 35.8 Z',
  dodo:
    'M 119.4 0.7 L 106.5 15.2 L 96.3 17.9 L 87.5 32.4 L 74.6 37.9 L 63.1 58.6 L 67.8 81.3 L 61.1 117.8 L 75.3 146.7 L 66.5 151.6 L 57.0 143.3 L 23.1 139.9 L 11.5 150.9 L 10.2 167.4 L 0.7 179.1 L 8.8 227.3 L 28.5 242.5 L 9.5 243.2 L 0.0 252.2 L 12.9 286.6 L 10.2 302.4 L 29.8 316.9 L 105.2 329.3 L 179.8 328.6 L 253.7 313.5 L 265.9 300.4 L 263.2 284.5 L 269.3 246.6 L 263.9 239.7 L 244.2 237.7 L 255.1 212.9 L 254.4 188.8 L 242.9 163.3 L 246.9 156.4 L 244.9 128.1 L 236.1 121.3 L 223.9 123.3 L 220.5 99.9 L 206.2 86.1 L 188.6 44.1 L 168.9 28.9 L 146.5 23.4 L 135.0 2.1 Z',
  mammoth:
    'M 153.3 0.7 L 117.4 2.8 L 101.8 16.5 L 91.6 17.9 L 72.6 37.2 L 68.5 49.6 L 36.0 62.0 L 20.4 88.9 L 17.0 130.2 L 38.7 152.3 L 44.1 168.1 L 41.4 184.6 L 52.2 191.5 L 40.7 208.1 L 35.3 234.2 L 23.1 221.1 L 14.9 220.5 L 0.7 243.2 L 0.0 257.0 L 5.4 268.7 L 17.6 277.0 L 13.6 303.8 L 31.2 316.2 L 99.7 328.6 L 173.0 329.3 L 242.2 319.0 L 268.6 302.4 L 269.3 291.4 L 255.1 270.1 L 253.0 250.8 L 237.4 239.1 L 238.8 209.4 L 224.5 190.8 L 231.3 173.6 L 220.5 163.3 L 244.2 104.7 L 238.1 69.6 L 223.2 48.2 L 199.4 40.0 L 180.5 14.5 L 161.5 9.0 Z',
  sloth:
    'M 146.0 76.0 L 126.0 82.0 L 112.0 88.0 L 104.0 94.0 L 99.0 100.0 L 95.0 106.0 L 92.0 112.0 L 85.0 118.0 L 90.0 124.0 L 77.0 130.0 L 63.0 136.0 L 67.0 142.0 L 59.0 148.0 L 63.0 154.0 L 64.0 160.0 L 68.0 166.0 L 78.0 172.0 L 82.0 178.0 L 76.0 184.0 L 68.0 190.0 L 50.0 196.0 L 44.0 202.0 L 54.0 208.0 L 41.0 214.0 L 44.0 220.0 L 61.0 226.0 L 42.0 232.0 L 44.0 238.0 L 56.0 244.0 L 54.0 250.0 L 45.0 256.0 L 50.0 262.0 L 69.0 268.0 L 106.0 274.0 L 167.0 274.0 L 206.0 268.0 L 220.0 262.0 L 224.0 256.0 L 219.0 250.0 L 228.0 244.0 L 230.0 238.0 L 211.0 232.0 L 223.0 226.0 L 227.0 220.0 L 228.0 214.0 L 226.0 208.0 L 220.0 202.0 L 216.0 196.0 L 197.0 190.0 L 195.0 184.0 L 193.0 178.0 L 191.0 172.0 L 196.0 166.0 L 202.0 160.0 L 205.0 154.0 L 208.0 148.0 L 209.0 142.0 L 210.0 136.0 L 209.0 130.0 L 203.0 124.0 L 201.0 118.0 L 199.0 112.0 L 196.0 106.0 L 192.0 100.0 L 187.0 94.0 L 178.0 88.0 L 167.0 82.0 L 155.0 76.0 Z',
  turtle:
    'M 124.0 88.0 L 113.0 94.0 L 107.0 100.0 L 102.0 106.0 L 99.0 112.0 L 97.0 118.0 L 96.0 124.0 L 95.0 130.0 L 93.0 136.0 L 61.0 142.0 L 59.0 148.0 L 60.0 154.0 L 55.0 160.0 L 56.0 166.0 L 64.0 172.0 L 64.0 178.0 L 63.0 184.0 L 59.0 190.0 L 58.0 196.0 L 58.0 202.0 L 61.0 208.0 L 67.0 214.0 L 68.0 220.0 L 68.0 226.0 L 69.0 232.0 L 70.0 238.0 L 70.0 244.0 L 71.0 250.0 L 76.0 256.0 L 131.0 262.0 L 152.0 262.0 L 199.0 256.0 L 212.0 250.0 L 215.0 244.0 L 213.0 238.0 L 206.0 232.0 L 209.0 226.0 L 212.0 220.0 L 213.0 214.0 L 214.0 208.0 L 214.0 202.0 L 214.0 196.0 L 212.0 190.0 L 210.0 184.0 L 208.0 178.0 L 204.0 172.0 L 198.0 166.0 L 194.0 160.0 L 198.0 154.0 L 200.0 148.0 L 201.0 142.0 L 202.0 136.0 L 201.0 130.0 L 201.0 124.0 L 199.0 118.0 L 197.0 112.0 L 193.0 106.0 L 188.0 100.0 L 181.0 94.0 L 170.0 88.0 Z',
  penguin:
    'M 128.0 82.0 L 120.0 88.0 L 108.0 94.0 L 100.0 100.0 L 88.0 106.0 L 85.0 112.0 L 83.0 118.0 L 81.0 124.0 L 80.0 130.0 L 78.0 136.0 L 75.0 142.0 L 75.0 148.0 L 59.0 154.0 L 60.0 160.0 L 63.0 166.0 L 73.0 172.0 L 54.0 178.0 L 57.0 184.0 L 74.0 190.0 L 64.0 196.0 L 63.0 202.0 L 63.0 208.0 L 65.0 214.0 L 76.0 220.0 L 60.0 226.0 L 59.0 232.0 L 67.0 238.0 L 58.0 244.0 L 48.0 250.0 L 50.0 256.0 L 61.0 262.0 L 82.0 268.0 L 183.0 268.0 L 208.0 262.0 L 218.0 256.0 L 221.0 250.0 L 220.0 244.0 L 203.0 238.0 L 214.0 232.0 L 214.0 226.0 L 199.0 220.0 L 206.0 214.0 L 205.0 208.0 L 204.0 202.0 L 202.0 196.0 L 200.0 190.0 L 199.0 184.0 L 198.0 178.0 L 201.0 172.0 L 206.0 166.0 L 209.0 160.0 L 212.0 154.0 L 212.0 148.0 L 211.0 142.0 L 211.0 136.0 L 210.0 130.0 L 209.0 124.0 L 207.0 118.0 L 205.0 112.0 L 194.0 106.0 L 189.0 100.0 L 181.0 94.0 L 170.0 88.0 L 154.0 82.0 Z',
};

export const CapybaraVessel: React.FC<Props> = ({
  logs,
  dailyTarget,
  mascotId = 'brownie',
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  const wavePhase = useSharedValue(0);
  const fillAnim = useSharedValue(0);
  const bobbing = useSharedValue(0);

  // Total logged ml and fill ratio
  const totalLogged = logs.reduce((sum, item) => sum + item.amount, 0);
  const fillPercent = Math.min(totalLogged / Math.max(dailyTarget, 1), 1.0);
  const isFilled = totalLogged >= dailyTarget;

  // Selected mascot contour path
  const contourPath = MASCOT_CONTOURS[mascotId] || MASCOT_CONTOURS.brownie;

  useEffect(() => {
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 2200,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    bobbing.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    fillAnim.value = withSpring(fillPercent, {
      damping: 14,
      stiffness: 90,
    });
  }, [fillPercent]);

  const bobbingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobbing.value }],
  }));

  // Stacking calculation inside the vessel outline
  const BASE_Y = 325;
  const TOP_Y = 25;
  const TOTAL_HEIGHT = BASE_Y - TOP_Y;

  let accumulatedHeight = 0;
  const layers = logs.map((log, index) => {
    const fraction = log.amount / Math.max(dailyTarget, 1);
    const layerHeight = fraction * TOTAL_HEIGHT;
    const bottom = BASE_Y - accumulatedHeight;
    accumulatedHeight += layerHeight;
    const top = BASE_Y - accumulatedHeight;
    return {
      id: log.id || `layer-${index}`,
      color: log.color,
      top,
      bottom,
      height: layerHeight,
    };
  });

  // Celebration animations when water target is reached (100% full)
  const celebScale = useSharedValue(1);
  const celebRotate = useSharedValue(0);
  const auraPulse = useSharedValue(0.6);
  const sparkleFloat = useSharedValue(0);

  useEffect(() => {
    if (isFilled) {
      // 1. Play celebration sound and heavy joyful haptic
      feedback.triggerHaptic('success');
      feedback.playWaterDropSound();

      // 2. Joyful breathing squash-and-stretch celebration loop
      celebScale.value = withRepeat(
        withSequence(
          withTiming(1.07, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.98, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // 3. Gentle happy wiggle
      celebRotate.value = withRepeat(
        withSequence(
          withTiming(2.8, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(-2.8, { duration: 800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );

      // 4. Radiant golden aura pulse
      auraPulse.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.45, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // 5. Shimmering star sparkle float
      sparkleFloat.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(4, { duration: 1400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [isFilled]);

  const celebStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: celebScale.value },
      { rotate: `${celebRotate.value}deg` },
    ],
  }));

  const auraStyle = useAnimatedStyle(() => ({
    opacity: auraPulse.value,
    transform: [{ scale: 1 + (auraPulse.value - 0.5) * 0.15 }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sparkleFloat.value }],
  }));

  return (
    <Animated.View style={[styles.container, { width, height }, bobbingStyle]}>
      {isFilled ? (
        // GOAL COMPLETED (100%): Premium Celebratory Animation
        <Animated.View entering={ZoomIn.duration(650)} style={styles.celebrationWrapper}>
          {/* Radiant Golden Vector Aura Halo */}
          <Animated.View style={[styles.auraHalo, auraStyle]}>
            <Svg width={width * 1.15} height={height * 1.15} viewBox="0 0 300 300">
              <Defs>
                <LinearGradient id="auraGold" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.75" />
                  <Stop offset="50%" stopColor="#38BDF8" stopOpacity="0.45" />
                  <Stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Circle cx="150" cy="150" r="130" fill="url(#auraGold)" />
            </Svg>
          </Animated.View>

          {/* Floating Confetti Sparkles & Water Crystals */}
          <Animated.View style={[styles.sparkleContainer, sparkleStyle]} pointerEvents="none">
            <Text style={[styles.sparkleItem, { top: 0, left: 20 }]}>✨</Text>
            <Text style={[styles.sparkleItem, { top: 12, right: 24 }]}>⭐</Text>
            <Text style={[styles.sparkleItem, { top: 70, left: -6 }]}>💧</Text>
            <Text style={[styles.sparkleItem, { top: 85, right: -10 }]}>✨</Text>
            <Text style={[styles.sparkleItem, { bottom: 35, left: 16 }]}>🎉</Text>
            <Text style={[styles.sparkleItem, { bottom: 42, right: 18 }]}>🌟</Text>
          </Animated.View>

          {/* Dancing Animated Happy Character */}
          <Animated.View style={celebStyle}>
            <CrispVectorMascot
              type="sipping"
              mascotId={mascotId}
              width={width}
              height={height}
            />
          </Animated.View>

          {/* Celebratory Shimmering Badge */}
          <View style={styles.goalCompletedBadge}>
            <Text style={styles.goalCompletedText}>🏆 100% GOAL CRUSHED!</Text>
          </View>
        </Animated.View>
      ) : (
        // IN PROGRESS: Original animal image outlined as a vessel filling with flowing fluid
        <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
          {/* Base Original Image as outlined/translucent vessel container */}
          <CrispVectorMascot
            type="sipping"
            mascotId={mascotId}
            width={width - 8}
            height={height - 8}
            opacity={0.38}
          />

          {/* Flowing Fluid Layer Stacked Inside Animal Vessel Contour */}
          <View style={StyleSheet.absoluteFill}>
            <Svg width={width} height={height} viewBox="0 0 270 330">
              <Defs>
                <ClipPath id="mascotClip">
                  <Path d={contourPath} />
                </ClipPath>

                <LinearGradient id="glassGloss" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
                  <Stop offset="0.3" stopColor="rgba(255,255,255,0.05)" />
                  <Stop offset="0.8" stopColor="rgba(255,255,255,0.02)" />
                  <Stop offset="1" stopColor="rgba(255,255,255,0.25)" />
                </LinearGradient>
              </Defs>

              {/* Stacked Liquid Bands inside Animal Outline */}
              <G clipPath="url(#mascotClip)">
                {layers.map((layer, idx) => (
                  <G key={layer.id}>
                    <Rect
                      x="0"
                      y={layer.top}
                      width="270"
                      height={layer.height + 2}
                      fill={layer.color}
                      opacity={0.88}
                    />

                    {/* Top fluid wave surface */}
                    {idx === layers.length - 1 && (
                      <Path
                        d={`
                          M 0 ${layer.top}
                          Q 67 ${layer.top - 5}, 135 ${layer.top}
                          T 270 ${layer.top}
                          L 270 ${layer.top + 10}
                          L 0 ${layer.top + 10}
                          Z
                        `}
                        fill={layer.color}
                        opacity={0.92}
                      />
                    )}
                  </G>
                ))}

                {/* Floating air bubbles inside fluid */}
                {fillPercent > 0.08 && (
                  <G fill="rgba(255, 255, 255, 0.65)">
                    <Circle cx="120" cy={BASE_Y - 35} r="3" />
                    <Circle cx="155" cy={BASE_Y - 55} r="2.2" />
                    <Circle cx="95" cy={BASE_Y - 70} r="2.5" />
                    <Circle cx="140" cy={BASE_Y - 95} r="3.2" />
                    {fillPercent > 0.4 && (
                      <>
                        <Circle cx="110" cy={BASE_Y - 140} r="2" />
                        <Circle cx="165" cy={BASE_Y - 165} r="3" />
                        <Circle cx="130" cy={BASE_Y - 190} r="2.5" />
                      </>
                    )}
                  </G>
                )}
              </G>

              {/* Crisp Vessel Outline Stroke */}
              <Path
                d={contourPath}
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.5"
                opacity={0.65}
              />
            </Svg>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineImage: {
    opacity: 0.38,
  },
  goalCompletedBadge: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalCompletedText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  auraHalo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  sparkleItem: {
    position: 'absolute',
    fontSize: 22,
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});

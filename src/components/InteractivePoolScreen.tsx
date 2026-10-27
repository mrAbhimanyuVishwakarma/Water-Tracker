import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
  Rect,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedSensor,
  SensorType,
  useFrameCallback,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { feedback } from '../utils/feedback';
import { MascotId } from '../types';
import { CrispVectorMascot } from './CrispVectorMascot';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

// Ensure dimensions cover full display including system navigation bars & insets
const REAL_WIDTH = Math.max(WINDOW_WIDTH, SCREEN_WIDTH);
const REAL_HEIGHT = Math.max(WINDOW_HEIGHT, SCREEN_HEIGHT) + 160;

const FLOAT_SIZE = 180;
const HALF_FLOAT = FLOAT_SIZE / 2;
const BUTTON_HEIGHT = 58;
const BUTTON_MARGIN_BOTTOM = 36;

interface RippleItem {
  id: number;
  x: number;
  y: number;
  speed: number;
}

interface Props {
  onGetStarted?: () => void;
  onBack?: () => void;
  isStandalone?: boolean;
  characterId?: MascotId;
}

// Single Animated Ripple Component
const WaterRipple: React.FC<{ item: RippleItem }> = ({ item }) => {
  const scale = useSharedValue(0.2);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    // Spreads fast then slows (ease-out), fades as it grows
    scale.value = withTiming(2.2, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(0, {
      duration: 1100,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.rippleRing,
        {
          left: item.x - 45,
          top: item.y - 45,
        },
        animatedStyle,
      ]}
    >
      {/* Outer bright thin edge */}
      <View style={styles.rippleInnerBand} />
    </Animated.View>
  );
};

export const InteractivePoolScreen: React.FC<Props> = ({
  onGetStarted,
  onBack,
  isStandalone = false,
  characterId = 'brownie',
}) => {
  const insets = useSafeAreaInsets();

  // Character float position & velocity
  const posX = useSharedValue(SCREEN_WIDTH / 2);
  const posY = useSharedValue(SCREEN_HEIGHT / 2 - 20);
  const velX = useSharedValue(0);
  const velY = useSharedValue(0);

  // Character rotation (lean like a boat turning, up to 30 deg)
  const rotateDeg = useSharedValue(0);

  // Squash on hard impact
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);

  // Gentle idle bobbing offset
  const bobOffset = useSharedValue(0);
  const bobTime = useSharedValue(0);

  // Drifting caustic light lines
  const causticShift = useSharedValue(0);

  // Touch drag coordinates (for computer testing and touch drift)
  const isDragging = useSharedValue(false);
  const targetX = useSharedValue(SCREEN_WIDTH / 2);
  const targetY = useSharedValue(SCREEN_HEIGHT / 2);

  // Gravity sensor for tilt physics
  const gravitySensor = useAnimatedSensor(SensorType.GRAVITY, {
    interval: 16,
  });

  // Dynamic baseline calibration that slowly follows hand over ~10s
  const baseRoll = useSharedValue(0);
  const basePitch = useSharedValue(0);
  const calibrated = useSharedValue(false);

  // Ripples state
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const rippleIdRef = useRef(0);
  const lastRippleTime = useRef(0);

  const addRipple = (x: number, y: number, speed: number) => {
    const now = Date.now();
    const interval = speed > 220 ? 110 : 190;
    if (now - lastRippleTime.current < interval) return;
    lastRippleTime.current = now;

    rippleIdRef.current += 1;
    const newId = rippleIdRef.current;
    setRipples((prev) => [...prev.slice(-6), { id: newId, x, y, speed }]);
  };

  // Safe coordinate extractor for touch events
  const safeExtractCoord = (event: any) => {
    const ne = event?.nativeEvent;
    if (!ne) return null;
    const x =
      typeof ne.locationX === 'number' && Number.isFinite(ne.locationX)
        ? ne.locationX
        : typeof ne.pageX === 'number' && Number.isFinite(ne.pageX)
        ? ne.pageX
        : null;
    const y =
      typeof ne.locationY === 'number' && Number.isFinite(ne.locationY)
        ? ne.locationY
        : typeof ne.pageY === 'number' && Number.isFinite(ne.pageY)
        ? ne.pageY
        : null;

    if (x !== null && y !== null) {
      return { x, y };
    }
    return null;
  };

  // Physics frame loop running on UI thread at 60fps
  useFrameCallback((frameInfo) => {
    'worklet';
    const dt = 0.016;

    // Safety guard against NaN
    if (!Number.isFinite(posX.value) || isNaN(posX.value)) posX.value = SCREEN_WIDTH / 2;
    if (!Number.isFinite(posY.value) || isNaN(posY.value)) posY.value = SCREEN_HEIGHT / 2 - 20;
    if (!Number.isFinite(velX.value) || isNaN(velX.value)) velX.value = 0;
    if (!Number.isFinite(velY.value) || isNaN(velY.value)) velY.value = 0;

    let forceX = 0;
    let forceY = 0;
    let effectiveRoll = 0;
    let effectivePitch = 0;

    // 1. Process phone pitch & roll angles from gravity sensor
    if (gravitySensor && gravitySensor.sensor.value) {
      const { x: rawGx, y: rawGy, z: rawGz } = gravitySensor.sensor.value;

      if (Number.isFinite(rawGx) && Number.isFinite(rawGy) && Number.isFinite(rawGz)) {
        // Calculate true phone pitch and roll angles in degrees
        const roll = Math.atan2(rawGx, Math.sqrt(rawGy * rawGy + rawGz * rawGz)) * (180 / Math.PI);
        const pitch = Math.atan2(rawGy, Math.sqrt(rawGx * rawGx + rawGz * rawGz)) * (180 / Math.PI);

        // "Level" means however phone is held when opened
        if (!calibrated.value) {
          baseRoll.value = roll;
          basePitch.value = pitch;
          calibrated.value = true;
        } else {
          // Level slowly follows hand over about 10 seconds (dt / 10s = 0.0016)
          baseRoll.value += (roll - baseRoll.value) * 0.0016;
          basePitch.value += (pitch - basePitch.value) * 0.0016;
        }

        const deltaRoll = roll - baseRoll.value;
        const deltaPitch = pitch - basePitch.value;
        const absRoll = Math.abs(deltaRoll);
        const absPitch = Math.abs(deltaPitch);

        // 3-degree deadzone: ignore small hand wobble, then let tilt ease in
        if (absRoll > 3.0) {
          const excess = absRoll - 3.0;
          effectiveRoll = Math.sign(deltaRoll) * Math.min(Math.pow(excess, 1.15), 45);
        }

        if (absPitch > 3.0) {
          const excess = absPitch - 3.0;
          effectivePitch = Math.sign(deltaPitch) * Math.min(Math.pow(excess, 1.15), 45);
        }
      }
    }

    const tiltMagnitude = Math.sqrt(effectiveRoll * effectiveRoll + effectivePitch * effectivePitch);

    // 2. Caustic light lines drifting slowly like sunlight
    causticShift.value = (causticShift.value + 0.35) % 800;

    // 3. User touch press & hold drift (for testing on computer or finger interaction)
    if (isDragging.value) {
      const dx = targetX.value - posX.value;
      const dy = targetY.value - posY.value;
      forceX = Math.max(Math.min(dx * 4.8, 900), -900);
      forceY = Math.max(Math.min(dy * 4.8, 900), -900);
    } else {
      // Tilt physics: tilt left -> goes left, tip top away -> goes up (-Y), tip toward you -> goes down (+Y)
      forceX = effectiveRoll * 14.5;
      forceY = -effectivePitch * 14.5;
    }

    // 4. Water drag: speeds up smoothly and coasts to a stop (never instant)
    velX.value = (velX.value + forceX * dt) * 0.942;
    velY.value = (velY.value + forceY * dt) * 0.942;

    posX.value += velX.value * dt;
    posY.value += velY.value * dt;

    // 5. Idle bobbing when still
    const currentSpeed = Math.sqrt(velX.value * velX.value + velY.value * velY.value);
    if (currentSpeed < 15 && tiltMagnitude < 0.5) {
      bobTime.value += dt * 2.2;
      bobOffset.value = Math.sin(bobTime.value) * 3.5;
    } else {
      bobOffset.value += (0 - bobOffset.value) * 0.1;
    }

    // 6. Edge boundaries & soft bounce with wall squash
    const topSafe = Math.max(insets.top + 10, 50);
    const bottomSafe = Math.max(insets.bottom, 20) + BUTTON_HEIGHT + BUTTON_MARGIN_BOTTOM + 16;
    const minX = HALF_FLOAT + 8;
    const maxX = SCREEN_WIDTH - HALF_FLOAT - 8;
    const minY = topSafe + HALF_FLOAT;
    const maxY = SCREEN_HEIGHT - bottomSafe - HALF_FLOAT;

    // Hard collision threshold for squash
    const SQUASH_SPEED_THRESHOLD = 110;

    if (posX.value <= minX) {
      const hitSpeed = Math.abs(velX.value);
      posX.value = minX;
      velX.value = hitSpeed * 0.38; // Soft bounce
      if (hitSpeed > SQUASH_SPEED_THRESHOLD) {
        scaleX.value = 0.95; // 5% squash against wall
        scaleX.value = withSpring(1, { damping: 9, stiffness: 130 });
      }
    } else if (posX.value >= maxX) {
      const hitSpeed = Math.abs(velX.value);
      posX.value = maxX;
      velX.value = -hitSpeed * 0.38;
      if (hitSpeed > SQUASH_SPEED_THRESHOLD) {
        scaleX.value = 0.95;
        scaleX.value = withSpring(1, { damping: 9, stiffness: 130 });
      }
    }

    if (posY.value <= minY) {
      const hitSpeed = Math.abs(velY.value);
      posY.value = minY;
      velY.value = hitSpeed * 0.38;
      if (hitSpeed > SQUASH_SPEED_THRESHOLD) {
        scaleY.value = 0.95;
        scaleY.value = withSpring(1, { damping: 9, stiffness: 130 });
      }
    } else if (posY.value >= maxY) {
      const hitSpeed = Math.abs(velY.value);
      posY.value = maxY;
      velY.value = -hitSpeed * 0.38;
      if (hitSpeed > SQUASH_SPEED_THRESHOLD) {
        scaleY.value = 0.95;
        scaleY.value = withSpring(1, { damping: 9, stiffness: 130 });
      }
    }

    // 7. Leaning: leans left or right like a boat turning, up to 30 degrees
    const targetLean = Math.min(Math.max(velX.value * 0.13, -30), 30);
    rotateDeg.value += (targetLean - rotateDeg.value) * 0.12;

    // 8. Water ripples dropped just behind character only while moving
    if (currentSpeed > 45) {
      const dirX = velX.value / currentSpeed;
      const dirY = velY.value / currentSpeed;
      const dropX = posX.value - dirX * 36;
      const dropY = posY.value - dirY * 36;
      runOnJS(addRipple)(dropX, dropY, currentSpeed);
    }
  });

  // Animated styles
  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - HALF_FLOAT },
      { translateY: posY.value - HALF_FLOAT + bobOffset.value },
      { rotate: `${rotateDeg.value}deg` },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - HALF_FLOAT + 15 },
      { translateY: posY.value - HALF_FLOAT + 22 },
      { scale: 0.94 },
    ],
  }));

  const causticsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: causticShift.value - 400 }],
  }));

  // Procedural wobbly pool tile grout lines
  const { hLines, vLines } = useMemo(() => {
    const tileSpacing = 68;
    const cols = Math.ceil(REAL_WIDTH / tileSpacing) + 3;
    const rows = Math.ceil(REAL_HEIGHT / tileSpacing) + 4;

    const h: string[] = [];
    for (let r = 0; r <= rows; r++) {
      const y = r * tileSpacing;
      let path = `M -20 ${y}`;
      for (let x = 0; x <= REAL_WIDTH + 60; x += 40) {
        const offset = Math.sin((x + y * 0.5) * 0.05) * 3.5;
        path += ` Q ${x + 20} ${y + offset}, ${x + 40} ${y}`;
      }
      h.push(path);
    }

    const v: string[] = [];
    for (let c = 0; c <= cols; c++) {
      const x = c * tileSpacing;
      let path = `M ${x} -20`;
      for (let y = 0; y <= REAL_HEIGHT + 60; y += 40) {
        const offset = Math.cos((y + x * 0.5) * 0.05) * 3.5;
        path += ` Q ${x + offset} ${y + 20}, ${x} ${y + 40}`;
      }
      v.push(path);
    }

    return { hLines: h, vLines: v };
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.value = false;
  }, [isDragging]);

  // Guard: Never intercept touches directed at bottom action button or top close button
  const isTouchInInteractiveUI = useCallback(
    (e: any) => {
      const coord = safeExtractCoord(e);
      if (!coord) return false;
      const bottomButtonZone = SCREEN_HEIGHT - (insets.bottom + 16 + BUTTON_HEIGHT + 36);
      if (coord.y >= bottomButtonZone) return true;
      if (isStandalone && coord.y <= insets.top + 70 && coord.x >= SCREEN_WIDTH - 80) return true;
      return false;
    },
    [insets, isStandalone]
  );

  return (
    <View style={styles.container}>
      {/* 1. Pool Water Background: Bright blue getting deeper toward the bottom, dynamically filling 100% of screen */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <SvgLinearGradient id="poolWaterGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#38BDF8" />
            <Stop offset="45%" stopColor="#0284C7" />
            <Stop offset="100%" stopColor="#0369A1" />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#poolWaterGradient)" />
      </Svg>

      {/* 2. Dedicated Water Touch Surface: Captures drag/tilt on pool water without stealing button presses */}
      <View
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={(e) => !isTouchInInteractiveUI(e)}
        onMoveShouldSetResponder={(e) => !isTouchInInteractiveUI(e)}
        onResponderGrant={(e) => {
          if (isTouchInInteractiveUI(e)) return;
          const coord = safeExtractCoord(e);
          if (coord) {
            isDragging.value = true;
            targetX.value = coord.x;
            targetY.value = coord.y;
          }
        }}
        onResponderMove={(e) => {
          if (isTouchInInteractiveUI(e)) return;
          const coord = safeExtractCoord(e);
          if (coord) {
            targetX.value = coord.x;
            targetY.value = coord.y;
          }
        }}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      />

      {/* 2. App Name Painted on the Pool Floor (under tiles and light) */}
      <View style={styles.poolFloorTitleWrapper} pointerEvents="none">
        <Text style={styles.poolFloorTitle}>brownie</Text>
      </View>

      {/* 3. Pool Tiles: Wobbly White Grout Lines covering entire display past bottom */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height={REAL_HEIGHT}>
          <G stroke="rgba(255, 255, 255, 0.38)" strokeWidth="1.6" fill="none">
            {hLines.map((d, i) => (
              <Path key={`h-${i}`} d={d} />
            ))}
            {vLines.map((d, i) => (
              <Path key={`v-${i}`} d={d} />
            ))}
          </G>
        </Svg>
      </View>

      {/* 4. Sunlight Caustic Light Lines Drifting Slowly on Water */}
      <Animated.View style={[StyleSheet.absoluteFill, causticsStyle]} pointerEvents="none">
        <Svg width="100%" height={REAL_HEIGHT * 2}>
          <G stroke="rgba(255, 255, 255, 0.28)" strokeWidth="2.5" fill="none">
            <Path d="M -50 120 Q 90 90, 220 140 T 450 110 T 700 160" />
            <Path d="M -20 280 Q 120 250, 260 300 T 520 260 T 750 320" />
            <Path d="M -40 450 Q 80 490, 240 430 T 480 480 T 720 440" />
            <Path d="M -30 620 Q 140 580, 290 640 T 560 610 T 740 660" />
            <Path d="M -50 790 Q 90 830, 230 780 T 500 820 T 760 790" />
            <Path d="M -20 960 Q 130 920, 270 980 T 540 940 T 750 990" />
            <Path d="M -40 1120 Q 100 1080, 250 1140 T 520 1100 T 760 1150" />
            <Path d="M -30 1280 Q 120 1250, 280 1310 T 550 1270 T 780 1320" />
          </G>
        </Svg>
      </Animated.View>

      {/* 5. Soft Sparkles Drifting on Water */}
      <View style={[styles.sparkle, { top: SCREEN_HEIGHT * 0.24, right: 65 }]} pointerEvents="none">
        <Text style={styles.sparkleText}>✦</Text>
      </View>
      <View style={[styles.sparkle, { top: SCREEN_HEIGHT * 0.62, right: 75 }]} pointerEvents="none">
        <Text style={styles.sparkleText}>✦</Text>
      </View>
      <View style={[styles.sparkle, { top: SCREEN_HEIGHT * 0.42, left: 45 }]} pointerEvents="none">
        <Text style={styles.sparkleText}>✦</Text>
      </View>

      {/* 6. Dynamic Water Ripples dropped while moving */}
      {ripples.map((r) => (
        <WaterRipple key={r.id} item={r} />
      ))}

      {/* 7. Soft Shadow of the Character on the Pool Floor (down & right) */}
      <Animated.View style={[styles.characterShadow, shadowStyle]} pointerEvents="none" />

      {/* 8. Character on Float with White Foam Contact Ring */}
      <Animated.View style={[styles.characterFloatWrapper, characterStyle]}>
        {/* Thin white foam line where float touches water */}
        <View style={styles.foamRing} pointerEvents="none" />

        <CrispVectorMascot
          type="float"
          mascotId={characterId}
          width={FLOAT_SIZE}
          height={FLOAT_SIZE}
        />
      </Animated.View>

      {/* 9. Minimal Top Close Button (if opened from within app) */}
      {isStandalone && onBack && (
        <TouchableOpacity
          style={[styles.closeBtn, { top: Math.max(insets.top + 8, 24) }]}
          activeOpacity={0.8}
          onPress={() => {
            feedback.triggerHaptic('light');
            onBack();
          }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      )}

      {/* 10. Single "Get Started" Button at the Bottom: White, rounded, full-width */}
      <View
        style={[
          styles.buttonContainer,
          {
            bottom: Math.max(insets.bottom + 16, 28),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.getStartedButton}
          activeOpacity={0.9}
          onPress={() => {
            feedback.triggerHaptic('medium');
            if (onGetStarted) onGetStarted();
            else if (onBack) onBack();
          }}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0369A1',
  },
  poolFloorTitleWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolFloorTitle: {
    fontSize: 88,
    fontWeight: '900',
    color: '#0369A1',
    opacity: 0.32,
    letterSpacing: -2,
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-black',
  },
  characterFloatWrapper: {
    position: 'absolute',
    width: FLOAT_SIZE,
    height: FLOAT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foamRing: {
    position: 'absolute',
    width: FLOAT_SIZE - 4,
    height: FLOAT_SIZE - 4,
    borderRadius: (FLOAT_SIZE - 4) / 2,
    borderWidth: 2.2,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  characterImage: {
    width: FLOAT_SIZE,
    height: FLOAT_SIZE,
  },
  characterShadow: {
    position: 'absolute',
    width: FLOAT_SIZE - 12,
    height: FLOAT_SIZE - 12,
    borderRadius: (FLOAT_SIZE - 12) / 2,
    backgroundColor: 'rgba(3, 105, 161, 0.42)',
    shadowColor: '#0369A1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  rippleRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.8,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleInnerBand: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1.5,
    borderColor: 'rgba(3, 105, 161, 0.28)',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 10,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  buttonContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 100,
    elevation: 10,
  },
  getStartedButton: {
    height: BUTTON_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: BUTTON_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
});

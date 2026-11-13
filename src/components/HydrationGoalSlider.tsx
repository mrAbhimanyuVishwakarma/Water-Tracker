import React, { useRef, useState } from 'react';
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { MeasurementUnit } from '../types';
import { feedback } from '../utils/feedback';
import { formatVolume } from '../utils/storage';

interface Props {
  value: number;
  unit: MeasurementUnit;
  onChange: (value: number) => void;
  minimum?: number;
  maximum?: number;
}

const DEFAULT_MINIMUM = 1000;
const DEFAULT_MAXIMUM = 6000;
const GOAL_STEP = 50;

export const HydrationGoalSlider: React.FC<Props> = ({
  value,
  unit,
  onChange,
  minimum = DEFAULT_MINIMUM,
  maximum = DEFAULT_MAXIMUM,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchAreaRef = useRef<any>(null);
  const trackPageX = useRef(0);
  const lastHapticStep = useRef(Math.round(value / 100));
  const boundedValue = Math.max(minimum, Math.min(maximum, value));
  const progress = (boundedValue - minimum) / Math.max(maximum - minimum, 1);

  const setFromPosition = (x: number) => {
    if (trackWidth <= 0) return;
    const boundedX = Math.max(0, Math.min(x, trackWidth));
    const rawValue = minimum + (boundedX / trackWidth) * (maximum - minimum);
    const nextValue = Math.round(rawValue / GOAL_STEP) * GOAL_STEP;
    if (nextValue === value) return;
    onChange(nextValue);

    const nextHapticStep = Math.round(nextValue / 100);
    if (nextHapticStep !== lastHapticStep.current) {
      lastHapticStep.current = nextHapticStep;
      void feedback.triggerSelectionHaptic();
    }
  };

  const measureTrack = () => {
    touchAreaRef.current?.measureInWindow((x: number, _y: number, width: number) => {
      trackPageX.current = x;
      if (width > 0 && width !== trackWidth) setTrackWidth(width);
    });
  };

  const handleGesture = (event: GestureResponderEvent) => {
    setFromPosition(event.nativeEvent.pageX - trackPageX.current);
  };

  const adjustBy = (delta: number) => {
    const nextValue = Math.max(minimum, Math.min(maximum, boundedValue + delta));
    onChange(nextValue);
    void feedback.triggerSelectionHaptic();
  };

  return (
    <View style={styles.container}>
      <View
        ref={touchAreaRef}
        style={styles.touchArea}
        onLayout={(event: LayoutChangeEvent) => {
          setTrackWidth(event.nativeEvent.layout.width);
          requestAnimationFrame(measureTrack);
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          setDragging(true);
          measureTrack();
          handleGesture(event);
        }}
        onResponderMove={handleGesture}
        onResponderRelease={() => setDragging(false)}
        onResponderTerminate={() => setDragging(false)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Daily hydration goal"
        accessibilityValue={{ min: minimum, max: maximum, now: boundedValue, text: formatVolume(boundedValue, unit) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => adjustBy(event.nativeEvent.actionName === 'increment' ? 100 : -100)}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            { left: `${progress * 100}%`, transform: [{ translateX: -14 }, { scale: dragging ? 1.16 : 1 }] },
          ]}
        >
          <View style={styles.thumbCore} />
        </View>
      </View>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{formatVolume(minimum, unit)}</Text>
        <Text style={styles.hint}>Drag to fine-tune</Text>
        <Text style={styles.rangeText}>{formatVolume(maximum, unit)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 18,
  },
  touchArea: {
    height: 48,
    justifyContent: 'center',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BAE6FD',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  thumb: {
    position: 'absolute',
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0369A1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  rangeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Rect,
} from 'react-native-svg';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { BeverageConfig } from '../types';
import { feedback } from '../utils/feedback';
import { formatVolume } from '../utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CUP_WIDTH = 200;
const CUP_HEIGHT = 280;

interface Props {
  visible: boolean;
  beverage: BeverageConfig;
  unit: 'ml' | 'oz';
  cupPresets: number[];
  onClose: () => void;
  onAddDrink: (amount: number) => void;
}

export const CupSelectorModal: React.FC<Props> = ({
  visible,
  beverage,
  unit,
  cupPresets,
  onClose,
  onAddDrink,
}) => {
  const [currentAmount, setCurrentAmount] = useState<number>(beverage.defaultAmount);

  // Cup fill height normalized (0 to 1)
  // Max cup volume is 750ml, min is 50ml
  const MAX_VOLUME = 750;
  const MIN_VOLUME = 50;

  const fillRatio = Math.max(0.1, Math.min(currentAmount / MAX_VOLUME, 0.95));
  const dragStartY = useSharedValue(0);

  const updateAmountFromDrag = (dy: number) => {
    // dy negative means dragging up -> increase amount
    const deltaMl = -dy * 1.5;
    const newAmount = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, Math.round((currentAmount + deltaMl) / 10) * 10));
    if (newAmount !== currentAmount) {
      setCurrentAmount(newAmount);
      feedback.triggerHaptic('light');
    }
  };

  const handlePresetSelect = (preset: number) => {
    setCurrentAmount(preset);
    feedback.triggerHaptic('light');
    feedback.playWaterDropSound();
  };

  const handleConfirm = () => {
    feedback.triggerHaptic('success');
    feedback.playPourSound();
    onAddDrink(currentAmount);
  };

  // Glass cup tapered polygon path
  // Top: width 180, Bottom: width 130, Height 260
  const CUP_PATH = `
    M 20 20
    L 180 20
    L 155 260
    C 153 270, 145 275, 135 275
    L 65 275
    C 55 275, 47 270, 45 260
    Z
  `;

  const liquidTopY = 275 - fillRatio * 240;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header with Close Button */}
          <View style={styles.headerRow}>
            <Text style={styles.beverageTitle}>{beverage.label}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                feedback.triggerHaptic('light');
                onClose();
              }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Drag Glass Cup */}
          <View
            style={styles.cupContainer}
            onStartShouldSetResponder={() => true}
            onResponderMove={(e) => {
              const touch = e.nativeEvent;
              // Simple relative drag
              const relativeY = touch.locationY;
              // Map touched Y on cup to volume
              const ratio = 1 - Math.max(0.05, Math.min(relativeY / CUP_HEIGHT, 0.95));
              const newAmount = Math.round((MIN_VOLUME + ratio * (MAX_VOLUME - MIN_VOLUME)) / 10) * 10;
              if (newAmount !== currentAmount) {
                setCurrentAmount(newAmount);
                feedback.triggerHaptic('light');
              }
            }}
          >
            <Svg width={CUP_WIDTH} height={CUP_HEIGHT} viewBox="0 0 200 285">
              <Defs>
                <ClipPath id="cupClip">
                  <Path d={CUP_PATH} />
                </ClipPath>
                <LinearGradient id="cupLiquidGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={beverage.color} />
                  <Stop offset="100%" stopColor={beverage.waveColor} />
                </LinearGradient>
              </Defs>

              {/* Glass Cup Outline (Transparent Soft Glass) */}
              <Path
                d={CUP_PATH}
                fill="rgba(240, 249, 255, 0.75)"
                stroke="#CBD5E1"
                strokeWidth="3.5"
              />

              {/* Liquid inside Cup Mask */}
              <Path
                clipPath="url(#cupClip)"
                d={`
                  M 0 ${liquidTopY}
                  Q 50 ${liquidTopY - 4}, 100 ${liquidTopY}
                  T 200 ${liquidTopY}
                  L 200 285
                  L 0 285
                  Z
                `}
                fill="url(#cupLiquidGrad)"
              />

              {/* Glass Rim highlight */}
              <Path
                d="M 22 22 L 178 22"
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </Svg>

            <Text style={styles.dragHint}>Drag cup to adjust volume</Text>
          </View>

          {/* Volume Indicator (oz / ml) */}
          <View style={styles.amountDisplay}>
            <Text style={styles.amountText}>{formatVolume(currentAmount, unit)}</Text>
          </View>

          {/* Quick Preset Buttons */}
          <View style={styles.presetRow}>
            {cupPresets.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  currentAmount === preset && styles.presetChipActive,
                ]}
                onPress={() => handlePresetSelect(preset)}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    currentAmount === preset && styles.presetChipTextActive,
                  ]}
                >
                  {formatVolume(preset, unit)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: beverage.color }]}
            activeOpacity={0.85}
            onPress={handleConfirm}
          >
            <Text style={styles.addButtonText}>
              + {beverage.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 10,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  beverageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
  cupContainer: {
    width: CUP_WIDTH,
    height: CUP_HEIGHT + 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dragHint: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  amountDisplay: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  presetChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  presetChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

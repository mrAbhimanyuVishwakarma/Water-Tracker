import React, { useState } from 'react';
import {
  Animated as RNAnimated,
  PanResponder,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BEVERAGES } from '../constants/beverages';
import { BeverageConfig, MeasurementUnit } from '../types';
import { feedback } from '../utils/feedback';
import { formatVolume } from '../utils/storage';

const SELECTED_ROW_HEIGHT = 76;

const hydrationSummary = (beverage: BeverageConfig, unit: MeasurementUnit): string => {
  const effectiveAmount = Math.round(beverage.defaultAmount * beverage.hydrationMultiplier);
  const hydrationText = beverage.hydrationMultiplier > 0
    ? `${Math.round(beverage.hydrationMultiplier * 100)}% · ${formatVolume(beverage.defaultAmount, unit)} counts as ${formatVolume(effectiveAmount, unit)}`
    : `${formatVolume(beverage.defaultAmount, unit)} reduces hydration by ${formatVolume(Math.abs(effectiveAmount), unit)}`;
  return beverage.caffeineMg ? `${hydrationText} · ${beverage.caffeineMg} mg caffeine` : hydrationText;
};

interface SelectedDrinkRowProps {
  beverage: BeverageConfig;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onRemove: (key: string) => void;
  onDragStateChange: (dragging: boolean) => void;
  unit: MeasurementUnit;
}

const SelectedDrinkRow: React.FC<SelectedDrinkRowProps> = ({
  beverage,
  index,
  total,
  onMove,
  onRemove,
  onDragStateChange,
  unit,
}) => {
  const [translateY] = useState(() => new RNAnimated.Value(0));
  const [dragging, setDragging] = useState(false);

  const finishDrag = (dy: number) => {
    const offset = Math.round(dy / SELECTED_ROW_HEIGHT);
    const destination = Math.max(0, Math.min(total - 1, index + offset));
    translateY.setValue(0);
    setDragging(false);
    onDragStateChange(false);
    if (destination !== index) {
      feedback.triggerHaptic('medium');
      onMove(index, destination);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 2,
    onPanResponderGrant: () => {
      setDragging(true);
      onDragStateChange(true);
      feedback.triggerHaptic('light');
    },
    onPanResponderMove: (_, gesture) => {
      const min = -index * SELECTED_ROW_HEIGHT;
      const max = (total - index - 1) * SELECTED_ROW_HEIGHT;
      translateY.setValue(Math.max(min, Math.min(max, gesture.dy)));
    },
    onPanResponderRelease: (_, gesture) => finishDrag(gesture.dy),
    onPanResponderTerminate: () => finishDrag(0),
  });

  const moveBy = (offset: number) => {
    const destination = Math.max(0, Math.min(total - 1, index + offset));
    if (destination !== index) onMove(index, destination);
  };

  return (
    <RNAnimated.View
      style={[
        styles.selectedRow,
        dragging && styles.selectedRowDragging,
        { transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.rowDrinkIcon, { backgroundColor: beverage.color }]}>
        <Ionicons name={beverage.icon as any} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{beverage.label}</Text>
        <Text style={styles.rowPosition}>Position {index + 1} in quick log</Text>
        <Text style={styles.rowSub} numberOfLines={1}>{hydrationSummary(beverage, unit)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${beverage.label} from quick log`}
        disabled={total <= 1}
        onPress={() => onRemove(beverage.type)}
      >
        <Ionicons name="remove-circle-outline" size={22} color={total <= 1 ? '#CBD5E1' : '#64748B'} />
      </TouchableOpacity>
      <View
        style={styles.dragHandle}
        accessibilityRole="adjustable"
        accessibilityLabel={`Reorder ${beverage.label}`}
        accessibilityHint="Drag up or down"
        accessibilityActions={[
          { name: 'increment', label: 'Move down' },
          { name: 'decrement', label: 'Move up' },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') moveBy(1);
          if (event.nativeEvent.actionName === 'decrement') moveBy(-1);
        }}
        {...panResponder.panHandlers}
      >
        <Ionicons name="reorder-three" size={26} color="#475569" />
      </View>
    </RNAnimated.View>
  );
};

interface Props {
  visibleBeverages: string[];
  unit: MeasurementUnit;
  onQuickAdd: (beverage: BeverageConfig) => void;
  onEditAmount: (beverage: BeverageConfig) => void;
  onUpdateVisibleBeverages: (keys: string[]) => void;
}

export const BeverageDock: React.FC<Props> = ({
  visibleBeverages,
  unit,
  onQuickAdd,
  onEditAmount,
  onUpdateVisibleBeverages,
}) => {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(visibleBeverages);
  const [isDragging, setIsDragging] = useState(false);

  const handleRemoveKey = (key: string) => {
    feedback.triggerHaptic('light');
    setSelectedKeys((current) => current.length <= 1 ? current : current.filter((item) => item !== key));
  };

  const handleAddKey = (key: string) => {
    feedback.triggerHaptic('light');
    setSelectedKeys((current) => current.includes(key) ? current : [...current, key]);
  };

  const handleMoveKey = (from: number, to: number) => {
    setSelectedKeys((current) => {
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleSaveCustomization = () => {
    feedback.triggerHaptic('success');
    onUpdateVisibleBeverages(selectedKeys);
    setIsCustomizeModalOpen(false);
  };

  // Only render active beverages
  const activeBeverageConfigs = visibleBeverages
    .map((key) => BEVERAGES[key])
    .filter(Boolean);
  const selectedBeverageConfigs = selectedKeys
    .map((key) => BEVERAGES[key])
    .filter(Boolean);
  const availableBeverageConfigs = Object.values(BEVERAGES)
    .filter((beverage) => !selectedKeys.includes(beverage.type));

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Visible Beverage Icons */}
        {activeBeverageConfigs.map((bev) => (
          <View key={bev.type} style={styles.dockItem}>
            <View style={styles.drinkActionWrap}>
              <TouchableOpacity
                style={[styles.drinkCircle, { backgroundColor: bev.color }]}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Quick add ${bev.defaultAmount} milliliters of ${bev.label}`}
                onPress={() => {
                  feedback.triggerHaptic('success');
                  feedback.playPourSound();
                  onQuickAdd(bev);
                }}
              >
                <Ionicons name={bev.icon as any} size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.plusBadge}
                activeOpacity={0.8}
                hitSlop={13}
                accessibilityRole="button"
                accessibilityLabel={`Choose a different amount of ${bev.label}`}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  onEditAmount(bev);
                }}
              >
                <Ionicons name="add" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.dockLabel} numberOfLines={1}>{bev.label.toUpperCase()}</Text>
            <Text style={styles.dockAmount}>{formatVolume(bev.defaultAmount, unit)}</Text>
          </View>
        ))}

        {/* 2. Customize Button directly in the dock */}
        <TouchableOpacity
          style={styles.dockItem}
          activeOpacity={0.8}
          onPress={() => {
            feedback.triggerHaptic('medium');
            setSelectedKeys(visibleBeverages);
            setIsCustomizeModalOpen(true);
          }}
        >
          <View style={styles.customizeCircle}>
            <Ionicons name="options-outline" size={24} color="#0284C7" />
          </View>
          <Text style={[styles.dockLabel, { color: '#0284C7' }]}>CUSTOMIZE</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Customize Beverages Modal */}
      <Modal
        visible={isCustomizeModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCustomizeModalOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              accessibilityRole="button"
              accessibilityLabel="Close customize drinks"
              onPress={() => setIsCustomizeModalOpen(false)}
            >
              <Ionicons name="close" size={20} color="#475569" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Customize Drinks</Text>
            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleSaveCustomization}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Your selected drinks appear first. Drag the handle to choose their quick-log order.
          </Text>

          <ScrollView
            scrollEnabled={!isDragging}
            contentContainerStyle={styles.beverageList}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hydrationGuide}>
              <View style={styles.hydrationGuideIcon}>
                <Ionicons name="book-outline" size={21} color="#0369A1" />
              </View>
              <View style={styles.hydrationGuideCopy}>
                <Text style={styles.hydrationGuideTitle}>How drinks count</Text>
                <Text style={styles.hydrationGuideText}>
                  Your goal uses effective hydration, not just cup size. A 250 ml coffee at 80% adds 200 ml; water adds the full amount.
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Selected</Text>
              <Text style={styles.sectionCount}>{selectedBeverageConfigs.length}</Text>
            </View>
            <View style={styles.selectedList}>
              {selectedBeverageConfigs.map((beverage, index) => (
                <SelectedDrinkRow
                  key={beverage.type}
                  beverage={beverage}
                  index={index}
                  total={selectedBeverageConfigs.length}
                  onMove={handleMoveKey}
                  onRemove={handleRemoveKey}
                  onDragStateChange={setIsDragging}
                  unit={unit}
                />
              ))}
            </View>

            {availableBeverageConfigs.length > 0 && (
              <>
                <View style={[styles.sectionHeader, styles.availableHeader]}>
                  <Text style={styles.sectionTitle}>Available</Text>
                  <Text style={styles.sectionHint}>Tap + to add</Text>
                </View>
                <View style={styles.availableList}>
                  {availableBeverageConfigs.map((beverage) => (
                    <TouchableOpacity
                      key={beverage.type}
                      style={styles.availableRow}
                      activeOpacity={0.72}
                      accessibilityRole="button"
                      accessibilityLabel={`Add ${beverage.label} to quick log`}
                      onPress={() => handleAddKey(beverage.type)}
                    >
                      <View style={[styles.rowDrinkIcon, { backgroundColor: beverage.color }]}>
                        <Ionicons name={beverage.icon as any} size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.rowCopy}>
                        <Text style={styles.rowLabel}>{beverage.label}</Text>
                        <Text style={styles.rowSub} numberOfLines={2}>{hydrationSummary(beverage, unit)}</Text>
                      </View>
                      <View style={styles.addButton}>
                        <Ionicons name="add" size={18} color="#0369A1" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    alignItems: 'center',
  },
  dockItem: {
    alignItems: 'center',
    width: 68,
  },
  drinkActionWrap: {
    width: 58,
    height: 58,
    position: 'relative',
  },
  drinkCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  customizeCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  dockAmount: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    fontVariant: ['tabular-nums'],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSaveBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    lineHeight: 18,
    fontWeight: '500',
  },
  beverageList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  hydrationGuide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
  },
  hydrationGuideIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
  },
  hydrationGuideCopy: {
    flex: 1,
  },
  hydrationGuideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  hydrationGuideText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#334155',
  },
  sectionHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionCount: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0F2FE',
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  availableHeader: {
    marginTop: 20,
  },
  selectedList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  selectedRow: {
    minHeight: SELECTED_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CBD5E1',
  },
  selectedRowDragging: {
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
  },
  availableList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  availableRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  rowDrinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  rowPosition: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

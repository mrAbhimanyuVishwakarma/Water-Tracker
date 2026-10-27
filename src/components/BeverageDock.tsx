import React, { useState } from 'react';
import {
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
import { BeverageConfig } from '../types';
import { feedback } from '../utils/feedback';

interface Props {
  visibleBeverages: string[];
  onSelectBeverage: (beverage: BeverageConfig) => void;
  onUpdateVisibleBeverages: (keys: string[]) => void;
}

export const BeverageDock: React.FC<Props> = ({
  visibleBeverages,
  onSelectBeverage,
  onUpdateVisibleBeverages,
}) => {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(visibleBeverages);

  const handleToggleKey = (key: string) => {
    feedback.triggerHaptic('light');
    if (selectedKeys.includes(key)) {
      // Don't allow unselecting everything; keep at least one
      if (selectedKeys.length <= 1) return;
      setSelectedKeys(selectedKeys.filter((k) => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
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

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Visible Beverage Icons */}
        {activeBeverageConfigs.map((bev) => (
          <TouchableOpacity
            key={bev.type}
            style={styles.dockItem}
            activeOpacity={0.75}
            onPress={() => {
              feedback.triggerHaptic('light');
              onSelectBeverage(bev);
            }}
          >
            <View style={[styles.drinkCircle, { backgroundColor: bev.color }]}>
              <Ionicons name={bev.icon as any} size={28} color="#FFFFFF" />
              <View style={styles.plusBadge}>
                <Ionicons name="add" size={12} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.dockLabel} numberOfLines={1}>{bev.label.toUpperCase()}</Text>
          </TouchableOpacity>
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
              onPress={() => setIsCustomizeModalOpen(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
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
            Select which drinks appear in your quick-log dock. Keep it minimal or add your favorites!
          </Text>

          <ScrollView contentContainerStyle={styles.beverageList}>
            {Object.values(BEVERAGES).map((bev) => {
              const isChecked = selectedKeys.includes(bev.type);
              return (
                <TouchableOpacity
                  key={bev.type}
                  style={[styles.beverageRow, isChecked && styles.beverageRowActive]}
                  onPress={() => handleToggleKey(bev.type)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.rowDrinkIcon, { backgroundColor: bev.color }]}>
                    <Ionicons name={bev.icon as any} size={20} color="#FFFFFF" />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.rowLabel}>{bev.label}</Text>
                    <Text style={styles.rowSub}>
                      {bev.hydrationMultiplier > 0
                        ? `${Math.round(bev.hydrationMultiplier * 100)}% Hydration`
                        : 'Dehydrating (-50%)'}
                      {bev.caffeineMg ? ` · ${bev.caffeineMg}mg caffeine` : ''}
                    </Text>
                  </View>

                  <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                    {isChecked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              );
            })}
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
  modalCloseText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
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
    gap: 10,
    paddingTop: 8,
  },
  beverageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  beverageRowActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { feedback } from '../utils/feedback';
import { CurrencyCode, UserSettings } from '../types';
import { PRICING_BY_CURRENCY } from '../constants/beverages';
import { CrispVectorMascot } from '../components/CrispVectorMascot';

interface Props {
  settings?: UserSettings;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  onUpdateCurrency?: (currency: CurrencyCode) => void;
}

export const PricingPaywallScreen: React.FC<Props> = ({
  settings,
  onClose,
  onUpgradeSuccess,
  onUpdateCurrency,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'lifetime' | 'monthly'>('yearly');
  const [currency, setCurrency] = useState<CurrencyCode>(settings?.currency || 'INR');

  const pricing = PRICING_BY_CURRENCY[currency] || PRICING_BY_CURRENCY.INR;

  const handleSelectCurrency = (code: CurrencyCode) => {
    feedback.triggerHaptic('light');
    setCurrency(code);
    onUpdateCurrency?.(code);
  };

  const handleSubscribe = () => {
    feedback.triggerHaptic('success');
    feedback.playPourSound();
    onUpgradeSuccess();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) }]}>
      {/* Top Bar with Currency Selector & Close Button */}
      <View style={styles.topBar}>
        {/* Currency Switcher */}
        <View style={styles.currencyToggle}>
          {(['INR', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.currencyPill, currency === c && styles.currencyPillActive]}
              onPress={() => handleSelectCurrency(c)}
            >
              <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>
                {c === 'INR' ? '₹ INR' : c === 'USD' ? '$ USD' : c === 'EUR' ? '€ EUR' : '£ GBP'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            feedback.triggerHaptic('light');
            onClose();
          }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom + 30, 48) }]}
      >
        {/* Golden Mascot Header */}
        <View style={styles.mascotContainer}>
          <CrispVectorMascot
            type="float"
            mascotId="brownie"
            width={120}
            height={120}
          />
          <View style={styles.proCrownBadge}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
        </View>

        <Text style={styles.title}>Brownie Premium</Text>
        <Text style={styles.subtitle}>
          Unlock all animals, custom drinks, and smart habit widgets!
        </Text>

        {/* Features Checklist */}
        <View style={styles.featuresList}>
          {[
            { icon: 'paw', text: 'All Extinct & Rare Mascots (Dotti the Dodo, Manny the Mammoth)' },
            { icon: 'cafe', text: '30+ Custom Drinks, Teas & Unlimited Presets' },
            { icon: 'notifications', text: 'Smart Adaptive Reminders & Schedules' },
            { icon: 'analytics', text: 'Health Trends & Detailed History Insights' },
            { icon: 'sparkles', text: 'Fun Sound Effects & Haptic Themes' },
          ].map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Ionicons name={f.icon as any} size={18} color="#0284C7" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Option Cards with 3-Day Free Trial */}
        <View style={styles.plansContainer}>
          {/* Yearly Tier (Best Value with 3-Day Free Trial) */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardActive,
            ]}
            onPress={() => {
              feedback.triggerHaptic('light');
              setSelectedPlan('yearly');
            }}
          >
            <View style={styles.badgeBestValue}>
              <Text style={styles.bestValueText}>MOST POPULAR · 3 DAYS FREE TRIAL</Text>
            </View>
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>Yearly Access</Text>
                <Text style={styles.planSub}>
                  3 days free, then {pricing.yearlyPrice} ({pricing.yearlyMonthlyEquiv})
                </Text>
              </View>
              <View style={[styles.radioCircle, selectedPlan === 'yearly' && styles.radioCircleActive]} />
            </View>
          </TouchableOpacity>

          {/* Lifetime Tier */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'lifetime' && styles.planCardActive,
            ]}
            onPress={() => {
              feedback.triggerHaptic('light');
              setSelectedPlan('lifetime');
            }}
          >
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>Lifetime Pass</Text>
                <Text style={styles.planSub}>Pay once, unlock forever for {pricing.lifetimePrice}</Text>
              </View>
              <View style={[styles.radioCircle, selectedPlan === 'lifetime' && styles.radioCircleActive]} />
            </View>
          </TouchableOpacity>

          {/* Monthly Tier */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardActive,
            ]}
            onPress={() => {
              feedback.triggerHaptic('light');
              setSelectedPlan('monthly');
            }}
          >
            <View style={styles.planRow}>
              <View>
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planSub}>{pricing.monthlyPrice}, cancel anytime</Text>
              </View>
              <View style={[styles.radioCircle, selectedPlan === 'monthly' && styles.radioCircleActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.subscribeBtn}
          activeOpacity={0.85}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeBtnText}>
            {selectedPlan === 'yearly' ? 'START 3-DAY FREE TRIAL' : 'UPGRADE TO PREMIUM'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.guaranteeText}>
          No commitment. Cancel anytime in Google Play Store.
        </Text>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => feedback.triggerHaptic('light')}>
            <Text style={styles.linkText}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.bullet}>•</Text>
          <TouchableOpacity onPress={() => feedback.triggerHaptic('light')}>
            <Text style={styles.linkText}>Terms</Text>
          </TouchableOpacity>
          <Text style={styles.bullet}>•</Text>
          <TouchableOpacity onPress={() => feedback.triggerHaptic('light')}>
            <Text style={styles.linkText}>Privacy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 2,
    gap: 4,
  },
  currencyPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currencyPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  currencyTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  closeBtn: {
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
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  mascotImage: {
    width: 130,
    height: 130,
  },
  proCrownBadge: {
    position: 'absolute',
    top: -4,
    right: 4,
    backgroundColor: '#FEF08A',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EAB308',
  },
  crownEmoji: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  featuresList: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 18,
    marginVertical: 18,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  plansContainer: {
    width: '100%',
    gap: 12,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    padding: 16,
  },
  planCardActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  badgeBestValue: {
    alignSelf: 'flex-start',
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  planSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioCircleActive: {
    borderColor: '#0284C7',
    borderWidth: 7,
  },
  subscribeBtn: {
    width: '100%',
    backgroundColor: '#0284C7',
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: 'rgba(2, 132, 199, 0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  guaranteeText: {
    marginTop: 10,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  bullet: {
    color: '#CBD5E1',
  },
});

import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PurchasesPackage } from 'react-native-purchases';
import { UserSettings } from '../types';
import { buyPackage, hasPremium, loadPackages, restorePurchases } from '../services/billing';
import { legalUrls, openLegalPage } from '../services/legal';
import { CrispVectorMascot } from '../components/CrispVectorMascot';

interface Props {
  settings: UserSettings;
  onClose: () => void;
  onOpenAuth: () => void;
  onEntitlementsChanged: () => Promise<void>;
}

function formatPeriod(period: string): string {
  const match = /^P(\d+)([DWMY])$/.exec(period);
  if (!match) return period;
  const units: Record<string, string> = { D: 'day', W: 'week', M: 'month', Y: 'year' };
  return `${match[1]} ${units[match[2]]}${match[1] === '1' ? '' : 's'}`;
}

export const PricingPaywallScreen: React.FC<Props> = ({ settings, onClose, onOpenAuth, onEntitlementsChanged }) => {
  const insets = useSafeAreaInsets();
  const userId = settings.userAccount?.id;
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(userId));
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);
  const legalReady = Boolean(legalUrls.terms?.startsWith('https://') && legalUrls.privacy?.startsWith('https://'));

  useEffect(() => {
    let active = true;
    if (!userId) return;
    loadPackages(userId).then(items => {
      if (!active) return;
      setPackages(items); setSelected(items[0]?.identifier || null);
      if (!items.length) setMessage('Premium plans are not available yet. Please try again later.');
    }).catch(error => { if (active) setMessage(error instanceof Error ? error.message : 'Could not load plans.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, reload]);

  const perform = useCallback(async (restore: boolean) => {
    if (!userId) { onOpenAuth(); return; }
    if (busy) return;
    const item = packages.find(item => item.identifier === selected);
    if (!restore && (!item || !legalReady)) return;
    setBusy(true); setMessage('');
    try {
      const info = restore ? await restorePurchases(userId) : await buyPackage(userId, item!);
      await onEntitlementsChanged();
      setMessage(hasPremium(info) ? 'Premium is active. Enjoy your mascots!' :
        restore ? 'No active premium purchase was found for this account.' :
          'Premium is not active yet. Pending purchases unlock after payment is confirmed.');
    } catch (error) {
      if (!(error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled)) {
        setMessage(error instanceof Error ? error.message : 'The purchase could not be completed. Please try again.');
      }
    } finally { setBusy(false); }
  }, [userId, busy, packages, selected, legalReady, onEntitlementsChanged, onOpenAuth]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) }]}>
      <View style={styles.topBar}>
        <Text style={styles.planName}>Brownie Premium</Text>
        <TouchableOpacity accessibilityLabel="Close premium plans" style={styles.closeBtn} disabled={busy} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <CrispVectorMascot type="float" mascotId="brownie" width={120} height={120} />
        <Text style={styles.title}>{settings.isPremium ? 'Premium is active' : 'Meet the whole pool'}</Text>
        <Text style={styles.subtitle}>Unlock all six mascots and choose your hydration companion.</Text>
        {!userId && <Text style={styles.subtitle}>Sign in before buying so your purchase can be associated with your account. Guest history stays on this device.</Text>}
        {loading && <ActivityIndicator style={{ margin: 20 }} accessibilityLabel="Loading plans" />}
        <View style={[styles.plansContainer, { marginTop: 20 }]}>
          {packages.map(item => (
            <TouchableOpacity key={item.identifier} disabled={busy} accessibilityRole="radio"
              accessibilityState={{ selected: selected === item.identifier }}
              style={[styles.planCard, selected === item.identifier && styles.planCardActive]}
              onPress={() => setSelected(item.identifier)}>
              <Text style={styles.planName}>{item.product.title}</Text>
              <Text style={styles.planSub}>{item.product.priceString}{item.product.subscriptionPeriod ? ` / ${formatPeriod(item.product.subscriptionPeriod)}` : ' · one-time purchase'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!!message && <Text accessibilityLiveRegion="polite" style={styles.subtitle}>{message}</Text>}
        {!legalReady && <Text style={styles.subtitle}>Purchases are not available yet. Please check back later.</Text>}
        <TouchableOpacity style={[styles.subscribeBtn, (busy || loading || (Boolean(userId) && (!selected || !legalReady || settings.isPremium))) && { opacity: 0.5 }]}
          disabled={busy || loading || (Boolean(userId) && (!selected || !legalReady || settings.isPremium))}
          onPress={() => void perform(false)}>
          {busy ? <ActivityIndicator color="#FFF" /> : <Text style={styles.subscribeBtnText}>{userId ? 'CONTINUE WITH GOOGLE PLAY' : 'SIGN IN TO CONTINUE'}</Text>}
        </TouchableOpacity>
        <Text style={styles.guaranteeText}>Subscriptions renew automatically until cancelled in Google Play. Any eligible offers and final payment terms are shown by Google Play before you confirm. Lifetime access is a one-time purchase.</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity disabled={busy} onPress={() => void perform(true)}><Text style={styles.linkText}>Restore Purchases</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => void openLegalPage('terms')}><Text style={styles.linkText}>Terms</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => void openLegalPage('privacy')}><Text style={styles.linkText}>Privacy</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={{ marginTop: 20 }} disabled={busy || loading || !userId} onPress={() => { setLoading(true); setMessage(''); setReload(value => value + 1); }}><Text style={styles.linkText}>Reload plans</Text></TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => {
          Linking.openURL('https://play.google.com/store/account/subscriptions').catch(() => Alert.alert('Could not open Google Play', 'Open Google Play to manage your subscriptions.'));
        }}><Text style={styles.linkText}>Manage subscriptions</Text></TouchableOpacity>
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

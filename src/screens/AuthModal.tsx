import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserAccount } from '../types';
import { feedback } from '../utils/feedback';
import { openLegalPage } from '../services/legal';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  signOutCloudUser,
  signInWithGoogle,
  deleteCloudAccount,
} from '../services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  userAccount?: UserAccount | null;
  onClose: () => void;
  syncStatus: string;
  onSync: () => Promise<void>;
  onDeleted: (id: string) => Promise<void>;
}

export const AuthModal: React.FC<Props> = ({
  visible,
  userAccount,
  onClose,
  syncStatus,
  onSync,
  onDeleted,
}) => {
  const insets = useSafeAreaInsets();
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  
  // Mobile OTP States
  const countryCode = '+91';
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true); setErrorMessage(null);
    try { await signInWithGoogle(); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Sign-in failed.'); }
    finally { setIsLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      feedback.triggerHaptic('heavy');
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    feedback.triggerHaptic('medium');
    setIsLoading(true);
    setErrorMessage(null);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, '')}`;
    const result = await sendPhoneOtp(fullPhone);
    if (!result.success) {
      setIsLoading(false); setErrorMessage(result.error || 'Could not send code.'); return;
    }
    setOtpCode('');

    setIsLoading(false);
    setOtpSent(true);
    setCountdown(30);
    feedback.triggerHaptic('success');
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode.trim())) {
      feedback.triggerHaptic('heavy');
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }
    feedback.triggerHaptic('medium');
    setIsLoading(true);
    setErrorMessage(null);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\s+/g, '')}`;
    const result = await verifyPhoneOtp(fullPhone, otpCode.trim());

    setIsLoading(false);
    if (result.success) {
      feedback.triggerHaptic('success');
    } else setErrorMessage(result.error || 'Verification failed. Please try again.');
  };

  const handleSignOutClick = async () => {
    setIsLoading(true);
    try { await signOutCloudUser(); onClose(); }
    catch (error) { Alert.alert('Could not sign out', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setIsLoading(false); }
  };

  const handleDelete = () => {
    if (!userAccount || isLoading) return;
    const id = userAccount.id;
    Alert.alert('Delete your account?', 'This permanently deletes your account and cloud hydration history. Your Google Play subscription must be cancelled separately in Google Play.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Account', style: 'destructive', onPress: async () => {
        setIsLoading(true);
        try { await deleteCloudAccount(id); await onDeleted(id); onClose(); }
        catch { Alert.alert('Deletion failed', 'Your account deletion could not be completed. Please try again.'); }
        finally { setIsLoading(false); }
      } },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => { if (!isLoading) onClose(); }}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  {userAccount ? 'Your Cloud Account' : 'Sign In & Sync'}
                </Text>
                <Text style={styles.subtitle}>
                  {userAccount
                    ? 'Manage your account and backup'
                    : 'Sign in to back up your hydration history'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                disabled={isLoading}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  onClose();
                }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {userAccount ? (
              /* Logged In View */
              <View style={styles.loggedInBox}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {userAccount.name?.charAt(0) || '👤'}
                  </Text>
                </View>
                <Text style={styles.userName}>{userAccount.name || 'Active Member'}</Text>
                <Text style={styles.userIdentifier}>
                  {userAccount.email || userAccount.phone}
                </Text>

                <View style={styles.syncStatusBadge}>
                  <View style={styles.greenDot} />
                  <Text style={styles.syncStatusText}>{syncStatus}</Text>
                </View>

                <View style={styles.syncInfoCard}>
                  <View style={styles.syncInfoRow}>
                    <Ionicons name="cloud-done-outline" size={20} color="#0284C7" />
                    <Text style={styles.syncInfoText}>Purchases are managed through Google Play</Text>
                  </View>
                  <View style={styles.syncInfoRow}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#0284C7" />
                    <Text style={styles.syncInfoText}>Guest history stays separate on this device</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn} disabled={isLoading} onPress={() => void onSync()}>
                  <Text style={styles.primaryBtnText}>Sync Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.signOutBtn} disabled={isLoading} onPress={handleDelete}>
                  <Text style={styles.signOutText}>Delete Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signOutBtn}
                  activeOpacity={0.8}
                  onPress={handleSignOutClick}
                  disabled={isLoading}
                >
                  <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Login / Sign-up View */
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Method Selector Tabs */}
                <View style={styles.tabBar}>
                  <TouchableOpacity
                    style={[styles.tab, authMethod === 'google' && styles.tabActive]}
                    onPress={() => {
                      feedback.triggerHaptic('light');
                      setAuthMethod('google');
                      setErrorMessage(null);
                    }}
                  >
                    <Ionicons
                      name="logo-google"
                      size={16}
                      color={authMethod === 'google' ? '#0284C7' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        authMethod === 'google' && styles.tabTextActive,
                      ]}
                    >
                      Google Sign-In
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tab, authMethod === 'phone' && styles.tabActive]}
                    onPress={() => {
                      feedback.triggerHaptic('light');
                      setAuthMethod('phone');
                      setErrorMessage(null);
                    }}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={16}
                      color={authMethod === 'phone' ? '#0284C7' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.tabText,
                        authMethod === 'phone' && styles.tabTextActive,
                      ]}
                    >
                      Mobile OTP
                    </Text>
                  </TouchableOpacity>
                </View>

                {errorMessage && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                {authMethod === 'google' ? (
                  /* Google Sign In Tab */
                  <View style={styles.methodContent}>
                    <View style={styles.googleHeroBox}>
                      <View style={styles.googleIconCircle}>
                        <Ionicons name="logo-google" size={32} color="#4285F4" />
                      </View>
                      <Text style={styles.googleHeroTitle}>Sign in with Google</Text>
                      <Text style={styles.googleHeroSub}>
                        Use your Google account to save your hydration history. Purchases use your Google Play account.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.googleButton}
                      activeOpacity={0.88}
                      onPress={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                          <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Mobile OTP Tab */
                  <View style={styles.methodContent}>
                    {!otpSent ? (
                      /* Step 1: Phone Input */
                      <View>
                        <Text style={styles.inputLabel}>Enter your phone number</Text>
                        <View style={styles.phoneInputRow}>
                          <View style={styles.countryCodeBox}>
                            <Text style={styles.countryCodeText}>{countryCode}</Text>
                          </View>
                          <TextInput
                            style={styles.phoneTextInput}
                            placeholder="98765 43210"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            editable={!isLoading}
                            maxLength={12}
                          />
                        </View>

                        <TouchableOpacity
                          style={styles.primaryBtn}
                          activeOpacity={0.88}
                          onPress={handleSendOtp}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <Text style={styles.primaryBtnText}>Send Verification Code</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Step 2: OTP Verification */
                      <View>
                        <Text style={styles.inputLabel}>
                          Code sent to {countryCode} {phoneNumber}
                        </Text>
                        <TextInput
                          style={styles.otpInput}
                          placeholder="• • • •"
                          placeholderTextColor="#94A3B8"
                          keyboardType="number-pad"
                          value={otpCode}
                          onChangeText={setOtpCode}
                          editable={!isLoading}
                          maxLength={6}
                          autoFocus={true}
                        />

                        <TouchableOpacity
                          style={styles.primaryBtn}
                          activeOpacity={0.88}
                          onPress={handleVerifyOtp}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <Text style={styles.primaryBtnText}>Verify & Log In</Text>
                          )}
                        </TouchableOpacity>

                        <View style={styles.resendRow}>
                          {countdown > 0 ? (
                            <Text style={styles.countdownText}>
                              Resend code in {countdown}s
                            </Text>
                          ) : (
                            <TouchableOpacity disabled={isLoading} onPress={handleSendOtp}>
                              <Text style={styles.resendBtnText}>Resend OTP SMS</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity disabled={isLoading} onPress={() => { setOtpSent(false); setOtpCode(''); }}>
                            <Text style={styles.changePhoneText}>Change number</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Continue as Guest Footer */}
                <Text style={styles.subtitle}>Signing in backs up your drinks, preferences, and health profile to your account. Guest history stays on this device.</Text>
                <TouchableOpacity onPress={() => void openLegalPage('privacy')}>
                  <Text style={styles.guestButtonText}>Read Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => {
                    feedback.triggerHaptic('light');
                    onClose();
                  }}
                >
                  <Text style={styles.guestButtonText}>Continue as Guest (No Login)</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 3,
    maxWidth: SCREEN_WIDTH - 90,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0284C7',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  methodContent: {
    marginBottom: 16,
  },
  googleHeroBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },
  googleHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  googleHeroSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 28,
    gap: 12,
    shadowColor: 'rgba(66, 133, 244, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  countryCodeBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  phoneTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 16,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 10,
    color: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(2, 132, 199, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 6,
  },
  countdownText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  changePhoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  guestButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  guestButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  loggedInBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#7DD3FC',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0284C7',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  userIdentifier: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 14,
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  syncStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  syncInfoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  syncInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncInfoText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
});

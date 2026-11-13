import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { feedback } from '../utils/feedback';
import {
  downloadUpdateApk,
  isSamsungDevice,
  launchApkInstaller,
  openAndroidSecuritySettings,
  openInstallPermissionSettings,
  UpdateCheckResult,
} from '../utils/updater';

interface Props {
  visible: boolean;
  updateInfo: UpdateCheckResult | null;
  onClose: () => void;
}

type Stage = 'ready' | 'downloading' | 'installer' | 'help' | 'error';

export const UpdateModal: React.FC<Props> = ({ visible, updateInfo, onClose }) => {
  const [stage, setStage] = useState<Stage>('ready');
  const [progress, setProgress] = useState(0);
  const [downloadedUri, setDownloadedUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const samsung = isSamsungDevice();

  if (!updateInfo?.available || !updateInfo.apkUrl) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Size unavailable';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const openInstaller = async (uri: string) => {
    setStage('installer');
    try {
      await launchApkInstaller(uri);
      setStage('help');
    } catch {
      setStage('help');
    }
  };

  const downloadAndInstall = async () => {
    setStage('downloading');
    setProgress(0);
    setErrorMessage('');
    feedback.triggerHaptic('medium');
    try {
      const uri = await downloadUpdateApk(updateInfo, setProgress);
      setDownloadedUri(uri);
      feedback.triggerHaptic('success');
      await openInstaller(uri);
    } catch (error) {
      setStage('error');
      setErrorMessage(error instanceof Error ? error.message : 'The update could not be downloaded. Please try again.');
      feedback.triggerHaptic('heavy');
    }
  };

  const retryInstaller = async () => {
    if (downloadedUri) await openInstaller(downloadedUri);
  };

  const closeAllowed = stage !== 'downloading' && stage !== 'installer';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (closeAllowed) onClose(); }}>
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-download-outline" size={30} color="#0369A1" />
          </View>
          <Text style={styles.title}>A new Brownie update is ready</Text>
          <Text style={styles.subtitle}>{updateInfo.releaseTitle}</Text>

          <View style={styles.versionRow}>
            <Text style={styles.currentVersion}>v{updateInfo.currentVersion}</Text>
            <Ionicons name="arrow-forward" size={16} color="#64748B" />
            <Text style={styles.newVersion}>v{updateInfo.latestVersion}</Text>
            <Text style={styles.downloadSize}>{formatBytes(updateInfo.downloadSize)}</Text>
          </View>

          <View style={styles.notesBlock}>
            <Text style={styles.notesTitle}>What changed</Text>
            <ScrollView style={styles.notesScroll} nestedScrollEnabled>
              <Text style={styles.notesText}>{updateInfo.releaseNotes}</Text>
            </ScrollView>
          </View>

          {samsung && stage === 'ready' && (
            <View style={styles.deviceNote}>
              <Ionicons name="shield-checkmark-outline" size={19} color="#92400E" />
              <Text style={styles.deviceNoteText}>
                Samsung may ask you to allow this source or temporarily turn off Auto Blocker before installing.
              </Text>
            </View>
          )}

          {stage === 'downloading' && (
            <View style={styles.progressBlock}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>Downloading securely… {progress}%</Text>
            </View>
          )}

          {stage === 'installer' && (
            <View style={styles.busyRow}>
              <ActivityIndicator color="#0284C7" />
              <Text style={styles.busyText}>Opening Android installer…</Text>
            </View>
          )}

          {stage === 'help' && (
            <View style={styles.helpBlock}>
              <Text style={styles.helpTitle}>Was installation blocked?</Text>
              <Text style={styles.helpText}>
                Allow Brownie to install this update in Android’s “Install unknown apps” screen, then try again.
              </Text>
              {samsung && (
                <Text style={styles.samsungSteps}>
                  Samsung: Settings → Security and privacy → Auto Blocker → temporarily turn it off. Turn it back on after Brownie is updated.
                </Text>
              )}
              <View style={styles.helpActions}>
                <TouchableOpacity style={styles.secondaryAction} onPress={() => void openInstallPermissionSettings()}>
                  <Text style={styles.secondaryActionText}>Allow this source</Text>
                </TouchableOpacity>
                {samsung && (
                  <TouchableOpacity style={styles.secondaryAction} onPress={() => void openAndroidSecuritySettings()}>
                    <Text style={styles.secondaryActionText}>Open security settings</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.primaryAction} onPress={() => void retryInstaller()}>
                <Text style={styles.primaryActionText}>Try installation again</Text>
              </TouchableOpacity>
            </View>
          )}

          {stage === 'error' && (
            <View style={styles.errorBlock}>
              <Ionicons name="alert-circle-outline" size={19} color="#B91C1C" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.actions}>
            {closeAllowed && (
              <TouchableOpacity style={styles.laterAction} onPress={onClose}>
                <Text style={styles.laterActionText}>{stage === 'help' ? 'Done' : 'Later'}</Text>
              </TouchableOpacity>
            )}
            {(stage === 'ready' || stage === 'error') && (
              <TouchableOpacity style={styles.primaryAction} onPress={() => void downloadAndInstall()}>
                <Ionicons name="download-outline" size={19} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>{stage === 'error' ? 'Try download again' : 'Download and install'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.68)',
  },
  sheet: {
    maxHeight: '90%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
  },
  title: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  currentVersion: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  newVersion: { fontSize: 12, fontWeight: '900', color: '#0369A1' },
  downloadSize: { fontSize: 11, fontWeight: '700', color: '#475569' },
  notesBlock: {
    marginTop: 14,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  notesTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 5 },
  notesScroll: { maxHeight: 112 },
  notesText: { fontSize: 13, lineHeight: 18, fontWeight: '500', color: '#334155' },
  deviceNote: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
  },
  deviceNoteText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600', color: '#78350F' },
  progressBlock: { marginTop: 16 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: '#E2E8F0' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#0284C7' },
  progressText: { marginTop: 7, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#0369A1' },
  busyRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 16 },
  busyText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  helpBlock: { marginTop: 14, padding: 13, borderRadius: 14, backgroundColor: '#F0F9FF' },
  helpTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  helpText: { marginTop: 4, fontSize: 12, lineHeight: 17, fontWeight: '600', color: '#334155' },
  samsungSteps: { marginTop: 8, fontSize: 12, lineHeight: 17, fontWeight: '700', color: '#78350F' },
  helpActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  errorBlock: { flexDirection: 'row', gap: 8, marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: '#FEF2F2' },
  errorText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600', color: '#991B1B' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  laterAction: { minHeight: 48, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  laterActionText: { fontSize: 14, fontWeight: '800', color: '#475569' },
  primaryAction: {
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#0284C7',
  },
  primaryActionText: { fontSize: 13, fontWeight: '900', color: '#FFFFFF', textAlign: 'center' },
  secondaryAction: {
    minHeight: 42,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
  },
  secondaryActionText: { fontSize: 12, fontWeight: '800', color: '#0369A1', textAlign: 'center' },
});

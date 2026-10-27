import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UpdateCheckResult, downloadAndInstallApk } from '../utils/updater';
import { feedback } from '../utils/feedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  updateInfo: UpdateCheckResult | null;
  onClose: () => void;
}

export const UpdateModal: React.FC<Props> = ({ visible, updateInfo, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!updateInfo || !updateInfo.available || !updateInfo.apkUrl) {
    return null;
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes <= 0) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleStartUpdate = async () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);
    setErrorMessage(null);
    setStatusMessage('Downloading update in background...');
    feedback.triggerHaptic('medium');

    const result = await downloadAndInstallApk(updateInfo.apkUrl!, (pct) => {
      setProgress(pct);
      setStatusMessage(`Downloading... ${pct}%`);
    });

    if (result.success) {
      setStatusMessage('Download complete! Opening Android installer...');
      feedback.triggerHaptic('success');
      setTimeout(() => {
        setDownloading(false);
        onClose();
      }, 1500);
    } else {
      setDownloading(false);
      setErrorMessage(result.error || 'Failed to download update. Check internet connection.');
      feedback.triggerHaptic('heavy');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Icon */}
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 34 }}>🚀</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>New Update Available!</Text>
          <Text style={styles.subtitle}>{updateInfo.releaseTitle}</Text>

          {/* Version Comparison Pill */}
          <View style={styles.versionRow}>
            <View style={styles.versionBadgeCurrent}>
              <Text style={styles.versionTextCurrent}>Current v{updateInfo.currentVersion}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#0284C7" />
            <View style={styles.versionBadgeNew}>
              <Text style={styles.versionTextNew}>New v{updateInfo.latestVersion}</Text>
            </View>
          </View>

          {updateInfo.downloadSize && (
            <Text style={styles.sizeText}>Download Size: {formatBytes(updateInfo.downloadSize)}</Text>
          )}

          {/* Changelog / Release Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesHeader}>What&apos;s New:</Text>
            <ScrollView style={styles.notesScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.notesText}>{updateInfo.releaseNotes}</Text>
            </ScrollView>
          </View>

          {/* Error Message if any */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {/* Progress Bar (when downloading) */}
          {downloading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>{statusMessage}</Text>
                <ActivityIndicator size="small" color="#0284C7" style={{ marginLeft: 6 }} />
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {!downloading && (
              <TouchableOpacity
                style={styles.laterButton}
                activeOpacity={0.8}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  onClose();
                }}
              >
                <Text style={styles.laterButtonText}>Later</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.installButton,
                downloading && styles.installButtonDisabled,
                !downloading && { flex: 1 },
              ]}
              activeOpacity={0.85}
              disabled={downloading}
              onPress={handleStartUpdate}
            >
              <Ionicons
                name={downloading ? 'cloud-download' : 'download-outline'}
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.installButtonText}>
                {downloading ? `Updating (${progress}%)` : 'Update & Install Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 40, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  headerIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  versionBadgeCurrent: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionTextCurrent: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  versionBadgeNew: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  versionTextNew: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '800',
  },
  sizeText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '600',
  },
  notesContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: 140,
  },
  notesHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesScroll: {
    maxHeight: 90,
  },
  notesText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  laterButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: 'rgba(2, 132, 199, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  installButtonDisabled: {
    backgroundColor: '#94A3B8',
    flex: 1,
  },
  installButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

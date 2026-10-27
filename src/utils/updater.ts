import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';

export const CURRENT_APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// Default repository when not set by user
export const DEFAULT_GITHUB_REPO = 'mrAbhimanyuVishwakarma/Water-Tracker';

export interface UpdateCheckResult {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseTitle: string;
  releaseNotes: string;
  apkUrl: string | null;
  releaseDate: string;
  assetName: string;
  downloadSize?: number;
}

/**
 * Compare semantic versions (e.g., '1.0.1' > '1.0.0')
 */
export function isNewerVersion(remote: string, current: string): boolean {
  const cleanRemote = remote.replace(/^v/i, '').trim();
  const cleanCurrent = current.replace(/^v/i, '').trim();

  const rParts = cleanRemote.split('.').map((p) => parseInt(p, 10) || 0);
  const cParts = cleanCurrent.split('.').map((p) => parseInt(p, 10) || 0);

  const length = Math.max(rParts.length, cParts.length);
  for (let i = 0; i < length; i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

/**
 * Check GitHub latest release for APK update
 */
export async function checkGitHubRelease(repo?: string): Promise<UpdateCheckResult> {
  const targetRepo = (repo && repo.trim().length > 0 ? repo : DEFAULT_GITHUB_REPO).trim();
  const fallbackResult: UpdateCheckResult = {
    available: false,
    currentVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    releaseTitle: '',
    releaseNotes: '',
    apkUrl: null,
    releaseDate: '',
    assetName: '',
  };

  try {
    const cleanRepo = targetRepo.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    const apiUrl = `https://api.github.com/repos/${cleanRepo}/releases/latest`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'BrownieWaterTracker-App',
      },
    });

    if (!response.ok) {
      // 404 or rate-limited
      return fallbackResult;
    }

    const data = await response.json();
    const tagName: string = data.tag_name || '';
    const latestVersion = tagName.replace(/^v/i, '');
    const hasUpdate = isNewerVersion(latestVersion, CURRENT_APP_VERSION);

    // Look for APK in release assets
    const apkAsset = Array.isArray(data.assets)
      ? data.assets.find(
          (a: any) =>
            typeof a.name === 'string' &&
            a.name.toLowerCase().endsWith('.apk')
        )
      : null;

    const apkUrl = apkAsset ? apkAsset.browser_download_url : null;
    const downloadSize = apkAsset ? apkAsset.size : undefined;

    return {
      available: hasUpdate && apkUrl !== null,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion,
      releaseTitle: data.name || `Release ${tagName}`,
      releaseNotes: data.body || 'No release notes provided.',
      apkUrl,
      releaseDate: data.published_at ? new Date(data.published_at).toLocaleDateString() : '',
      assetName: apkAsset ? apkAsset.name : '',
      downloadSize,
    };
  } catch (err) {
    console.warn('Error checking GitHub release:', err);
    return fallbackResult;
  }
}

/**
 * Download APK in the background with progress and prompt Android installation
 */
export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress?: (percent: number, receivedBytes: number, totalBytes: number) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    if (Platform.OS !== 'android') {
      // Non-android: open download URL in browser
      await Linking.openURL(apkUrl);
      return { success: true };
    }

    const filename = 'BrownieWaterTracker-Update.apk';
    const localUri = `${FileSystem.cacheDirectory}${filename}`;

    // Remove existing cached update if present
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      apkUrl,
      localUri,
      {},
      (downloadProgress: any) => {
        const total = downloadProgress.totalBytesExpectedToWrite;
        const current = downloadProgress.totalBytesWritten;
        const progress = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;
        if (onProgress) {
          onProgress(progress, current, total);
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || !result.uri) {
      throw new Error('Download failed: No file URI received');
    }

    // Get Android content URI through FileProvider
    const contentUri = await FileSystem.getContentUriAsync(result.uri);

    // Launch Android Package Installer
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: 'application/vnd.android.package-archive',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to download/install update:', error);
    // Graceful fallback: Open direct download link in browser
    try {
      await Linking.openURL(apkUrl);
    } catch (_) {}
    return { success: false, error: error?.message || 'Installation failed' };
  }
}

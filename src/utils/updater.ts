import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

export const CURRENT_APP_VERSION = Constants.expoConfig?.version || '0.0.3';
export const DEFAULT_GITHUB_REPO = 'mrAbhimanyuVishwakarma/Water-Tracker';
const MAX_APK_BYTES = 300 * 1024 * 1024;

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
  error?: string;
}

interface GitHubAsset {
  name?: unknown;
  browser_download_url?: unknown;
  size?: unknown;
}

interface GitHubRelease {
  tag_name?: unknown;
  name?: unknown;
  body?: unknown;
  published_at?: unknown;
  assets?: unknown;
}

export const isGithubUpdaterEnabled = (): boolean =>
  Platform.OS === 'android' && Constants.expoConfig?.extra?.githubApkUpdates === true;

export const isSamsungDevice = (): boolean =>
  (Device.manufacturer || Device.brand || '').toLowerCase().includes('samsung');

export function isNewerVersion(remote: string, current: string): boolean {
  const parse = (value: string) => value.replace(/^v/i, '').split('-')[0].split('.').map((part) => Number.parseInt(part, 10) || 0);
  const remoteParts = parse(remote);
  const currentParts = parse(current);
  const length = Math.max(remoteParts.length, currentParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (remoteParts[index] || 0) - (currentParts[index] || 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
}

const fallbackResult = (error?: string): UpdateCheckResult => ({
  available: false,
  currentVersion: CURRENT_APP_VERSION,
  latestVersion: CURRENT_APP_VERSION,
  releaseTitle: '',
  releaseNotes: '',
  apkUrl: null,
  releaseDate: '',
  assetName: '',
  error,
});

export async function checkGitHubRelease(): Promise<UpdateCheckResult> {
  if (!isGithubUpdaterEnabled()) return fallbackResult('GitHub updates are not enabled in this build.');
  try {
    const response = await fetch(`https://api.github.com/repos/${DEFAULT_GITHUB_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'BrownieWaterTracker-App' },
    });
    if (!response.ok) return fallbackResult(`GitHub returned ${response.status}. Try again later.`);

    const release = await response.json() as GitHubRelease;
    const tagName = typeof release.tag_name === 'string' ? release.tag_name : '';
    if (!tagName) return fallbackResult('The latest release does not have a version tag.');
    const assets = Array.isArray(release.assets) ? release.assets as GitHubAsset[] : [];
    const apk = assets.find((asset) => typeof asset.name === 'string' && asset.name.toLowerCase().endsWith('.apk'));
    const apkUrl = typeof apk?.browser_download_url === 'string' ? apk.browser_download_url : null;
    const downloadSize = typeof apk?.size === 'number' ? apk.size : undefined;
    const latestVersion = tagName.replace(/^v/i, '');
    const validDownload = apkUrl?.startsWith(`https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/`) === true;

    return {
      available: isNewerVersion(latestVersion, CURRENT_APP_VERSION) && validDownload && (downloadSize || 0) <= MAX_APK_BYTES,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion,
      releaseTitle: typeof release.name === 'string' ? release.name : `Brownie ${tagName}`,
      releaseNotes: typeof release.body === 'string' && release.body.trim() ? release.body.trim() : 'This release includes improvements and fixes.',
      apkUrl: validDownload ? apkUrl : null,
      releaseDate: typeof release.published_at === 'string' ? new Date(release.published_at).toLocaleDateString() : '',
      assetName: typeof apk?.name === 'string' ? apk.name : '',
      downloadSize,
      error: !apkUrl ? 'The latest release does not include an APK file.' : undefined,
    };
  } catch {
    return fallbackResult('Could not reach GitHub. Check your internet connection and try again.');
  }
}

export async function downloadUpdateApk(
  update: UpdateCheckResult,
  onProgress: (percent: number) => void
): Promise<string> {
  if (!update.apkUrl || !update.apkUrl.startsWith(`https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/`)) {
    throw new Error('This release does not contain a trusted APK download.');
  }
  if ((update.downloadSize || 0) > MAX_APK_BYTES) throw new Error('This update is unexpectedly large and was not downloaded.');
  if (!FileSystem.cacheDirectory) throw new Error('Temporary storage is unavailable on this device.');

  const localUri = `${FileSystem.cacheDirectory}BrownieWaterTracker-${update.latestVersion}.apk`;
  await FileSystem.deleteAsync(localUri, { idempotent: true });
  const download = FileSystem.createDownloadResumable(update.apkUrl, localUri, {}, (status) => {
    const total = status.totalBytesExpectedToWrite;
    onProgress(total > 0 ? Math.min(100, Math.round((status.totalBytesWritten / total) * 100)) : 0);
  });
  const result = await download.downloadAsync();
  if (!result?.uri) throw new Error('The APK download did not finish. Please try again.');
  return result.uri;
}

export async function launchApkInstaller(fileUri: string): Promise<void> {
  if (Platform.OS !== 'android') throw new Error('APK installation is available only on Android.');
  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
    type: 'application/vnd.android.package-archive',
  });
}

export async function openInstallPermissionSettings(): Promise<void> {
  const packageName = Constants.expoConfig?.android?.package;
  await IntentLauncher.startActivityAsync('android.settings.MANAGE_UNKNOWN_APP_SOURCES', {
    data: packageName ? `package:${packageName}` : undefined,
  });
}

export async function openAndroidSecuritySettings(): Promise<void> {
  try {
    await IntentLauncher.startActivityAsync('android.settings.SECURITY_SETTINGS');
  } catch {
    await Linking.openSettings();
  }
}

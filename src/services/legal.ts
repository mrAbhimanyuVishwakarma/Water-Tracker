import { Alert, Linking } from 'react-native';

export const legalUrls = {
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL,
  terms: process.env.EXPO_PUBLIC_TERMS_URL,
  deletion: process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL,
};

export async function openLegalPage(kind: keyof typeof legalUrls) {
  const url = legalUrls[kind];
  if (!url || !/^https:\/\//i.test(url)) {
    Alert.alert('Page unavailable', 'This page is not available yet. Please try again later.');
    return;
  }
  try { await Linking.openURL(url); }
  catch { Alert.alert('Could not open page', 'Please check your connection and try again.'); }
}

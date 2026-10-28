import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const entitlement = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || 'premium';
let currentUser: string | null = null;
let configured = false;
let queue: Promise<unknown> = Promise.resolve();

export function billingOperation<T>(operation: () => Promise<T>): Promise<T> {
  const next = queue.then(operation, operation);
  queue = next.catch(() => {});
  return next;
}

export function hasPremium(info: CustomerInfo): boolean {
  const access = info.entitlements.active[entitlement];
  const verified = access?.verification === Purchases.VERIFICATION_RESULT.VERIFIED || access?.verification === Purchases.VERIFICATION_RESULT.VERIFIED_ON_DEVICE;
  return Boolean(verified && access?.isActive && (!access.expirationDate || new Date(access.expirationDate).getTime() > Date.now()));
}

export async function identifyBillingUser(userId: string): Promise<CustomerInfo> {
  if (Platform.OS !== 'android' || Constants.appOwnership === 'expo') {
    throw new Error('Purchases require the Android app installed from Google Play.');
  }
  if (!apiKey || !apiKey.startsWith('goog_')) throw new Error('Purchases are not available yet. Please try again later.');
  if (!configured) {
    Purchases.configure({ apiKey, appUserID: userId, entitlementVerificationMode: Purchases.ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL });
    configured = true;
    currentUser = userId;
  } else if (currentUser !== userId) {
    currentUser = null;
    const result = await Purchases.logIn(userId);
    currentUser = userId;
    return result.customerInfo;
  }
  return Purchases.getCustomerInfo();
}

export function listenForBillingUpdates(listener: (userId: string | null, info: CustomerInfo) => void) {
  if (Platform.OS !== 'android' || Constants.appOwnership === 'expo' || !apiKey?.startsWith('goog_')) return () => {};
  const handler = (info: CustomerInfo) => listener(currentUser, info);
  Purchases.addCustomerInfoUpdateListener(handler);
  return () => Purchases.removeCustomerInfoUpdateListener(handler);
}

export async function loadPackages(userId: string): Promise<PurchasesPackage[]> {
  return billingOperation(async () => {
    await identifyBillingUser(userId);
    return (await Purchases.getOfferings()).current?.availablePackages || [];
  });
}

export async function buyPackage(userId: string, item: PurchasesPackage) {
  return billingOperation(async () => {
    await identifyBillingUser(userId);
    return (await Purchases.purchasePackage(item)).customerInfo;
  });
}

export async function restorePurchases(userId: string) {
  return billingOperation(async () => {
    await identifyBillingUser(userId);
    return Purchases.restorePurchases();
  });
}

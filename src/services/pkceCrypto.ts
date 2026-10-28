import { Platform } from 'react-native';
import * as ExpoCrypto from 'expo-crypto';

// Hermes does not supply WebCrypto. Bridge only the random/digest operations used by
// Supabase PKCE to Expo's native implementation; do not replace a browser's crypto.
export function installPkceCrypto() {
  if (Platform.OS === 'web') return;
  const crypto: Partial<Crypto> = globalThis.crypto || {};
  if (typeof crypto.getRandomValues !== 'function') Object.defineProperty(crypto, 'getRandomValues', { value: ExpoCrypto.getRandomValues });
  const subtle: Partial<SubtleCrypto> = crypto.subtle || {};
  if (typeof subtle.digest !== 'function') Object.defineProperty(subtle, 'digest', { value:
    async (algorithm: AlgorithmIdentifier, data: BufferSource) => {
      const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
      if (name.toUpperCase() !== 'SHA-256') throw new Error('This native crypto adapter supports SHA-256 digests only.');
      return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data);
    },
  });
  if (!crypto.subtle) Object.defineProperty(crypto, 'subtle', { value: subtle });
  if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: crypto, configurable: true });
}

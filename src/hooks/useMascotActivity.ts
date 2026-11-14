import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, Platform } from 'react-native';

export function useMascotActivity() {
  // Stay still until the system preference has been read.
  const [reduceMotion, setReduceMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');

  useEffect(() => {
    let mounted = true;
    let preferenceChanged = false;
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      preferenceChanged = true;
      setReduceMotion(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted && !preferenceChanged) setReduceMotion(value);
    }).catch(() => {});

    const updateVisibility = () => {
      const appActive = AppState.currentState === null || AppState.currentState === 'active';
      const pageVisible = Platform.OS !== 'web' || typeof document === 'undefined' || !document.hidden;
      setForeground(appActive && pageVisible);
    };
    updateVisibility();
    const appState = AppState.addEventListener('change', updateVisibility);
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', updateVisibility);
    }
    return () => {
      mounted = false;
      motion.remove();
      appState.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', updateVisibility);
      }
    };
  }, []);

  return { reduceMotion, foreground };
}

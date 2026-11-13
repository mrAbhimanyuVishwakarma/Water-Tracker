import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MascotId } from '../types';
import { dayKey } from '../utils/accountData';
import { feedback } from '../utils/feedback';

const VIDEOS: Record<MascotId, number> = {
  brownie: require('../../assets/brownie_sipping_clean.mp4'),
  dodo: require('../../assets/dodo_sipping_clean.mp4'),
  sloth: require('../../assets/sloth_sipping_clean.mp4'),
  turtle: require('../../assets/turtle_sipping_clean.mp4'),
  mammoth: require('../../assets/mammoth_sipping_clean.mp4'),
  penguin: require('../../assets/penguin_sipping_clean.mp4'),
};

const CELEBRATED_KEY = '@brownie_goal_celebrated_day';
let celebratedDay: string | null = null;

// Mounted alongside the vessel so opening an already-completed day never autoplays.
export function useGoalCelebration(isFilled: boolean) {
  const previous = useRef(isFilled);
  const [autoPlay, setAutoPlay] = useState(false);

  if (!isFilled && autoPlay) setAutoPlay(false);

  useEffect(() => {
    const crossed = isFilled && !previous.current;
    previous.current = isFilled;
    let cancelled = false;

    if (crossed) {
      const day = dayKey(Date.now());
      void AsyncStorage.getItem(CELEBRATED_KEY).catch(() => null).then(savedDay => {
        if (cancelled || savedDay === day || celebratedDay === day) return;
        celebratedDay = day;
        void AsyncStorage.setItem(CELEBRATED_KEY, day).catch(() => {});
        feedback.triggerHaptic('success');
        setAutoPlay(true);
      });
    }

    return () => { cancelled = true; };
  }, [isFilled]);

  return autoPlay;
}

function SippingVideo({
  source,
  playRequest,
  soundEnabled,
  onError,
}: {
  source: number;
  playRequest: number;
  soundEnabled: boolean;
  onError: () => void;
}) {
  const [ready, setReady] = useState(false);
  const wantsPlayback = useRef(false);
  const player = useVideoPlayer(source, instance => {
    instance.muted = !soundEnabled;
    instance.loop = false;
    instance.staysActiveInBackground = false;
  });

  const resetToFirstFrame = useCallback(() => {
    wantsPlayback.current = false;
    player.pause();
    player.currentTime = 0;
  }, [player]);

  useEventListener(player, 'playToEnd', resetToFirstFrame);

  useEffect(() => {
    player.muted = !soundEnabled;
  }, [player, soundEnabled]);

  const updatePlaybackForAppState = useCallback(() => {
    const visible = Platform.OS !== 'web' || typeof document === 'undefined' || !document.hidden;
    // AppState may be null while the native bridge initializes.
    const foreground = AppState.currentState === null || AppState.currentState === 'active';

    if (player.status === 'error') {
      onError();
      return;
    }

    if (!foreground || !visible) player.pause();
    else if (wantsPlayback.current && player.status === 'readyToPlay') player.play();
  }, [onError, player]);

  useEventListener(player, 'statusChange', updatePlaybackForAppState);

  useEffect(() => {
    updatePlaybackForAppState();
    const subscription = AppState.addEventListener('change', updatePlaybackForAppState);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', updatePlaybackForAppState);
    }

    return () => {
      player.pause();
      subscription.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', updatePlaybackForAppState);
      }
    };
  }, [player, updatePlaybackForAppState]);

  useEffect(() => {
    if (!ready || playRequest === 0) return;
    wantsPlayback.current = true;
    player.currentTime = 0;
    player.play();
  }, [playRequest, player, ready]);

  useEffect(() => {
    if (ready) return;
    const timeout = setTimeout(onError, 15000);
    return () => clearTimeout(timeout);
  }, [ready, onError]);

  return (
    <>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
        surfaceType="textureView"
        onFirstFrameRender={() => setReady(true)}
      />
      {!ready && (
        <View pointerEvents="none" style={styles.loading}>
          <ActivityIndicator color="#0284C7" accessibilityLabel="Loading celebration" />
        </View>
      )}
    </>
  );
}

export function GoalCelebration({ mascotId, width, height, autoPlay, soundEnabled }: {
  mascotId: MascotId;
  width: number;
  height: number;
  autoPlay: boolean;
  soundEnabled: boolean;
}) {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [playbackError, setPlaybackError] = useState(false);
  const [playRequest, setPlayRequest] = useState(0);
  const attempted = useRef(false);
  const source = VIDEOS[mascotId];

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(value => { if (mounted) setReduceMotion(value); })
      .catch(() => { if (mounted) setReduceMotion(true); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!autoPlay || reduceMotion === null || reduceMotion || attempted.current) return;
    const startPlayback = setTimeout(() => {
      if (attempted.current) return;
      attempted.current = true;
      setPlayRequest(value => value + 1);
    }, 0);
    return () => clearTimeout(startPlayback);
  }, [autoPlay, reduceMotion]);

  const replay = () => {
    if (reduceMotion) return;
    attempted.current = true;
    setPlaybackError(false);
    feedback.triggerHaptic('light');
    setPlayRequest(value => value + 1);
  };

  const fail = useCallback(() => setPlaybackError(true), []);

  return (
    <View style={[styles.container, { width, height }]}>
      <Pressable
        style={styles.mascot}
        disabled={reduceMotion === true}
        onPress={replay}
        accessibilityRole={reduceMotion ? 'image' : 'button'}
        accessibilityLabel={reduceMotion ? 'Daily hydration goal completed' : 'Replay sipping celebration'}
        accessibilityHint={reduceMotion ? undefined : 'Plays the character animation once'}
      >
        <View pointerEvents="none" style={styles.panel}>
          <SippingVideo
            source={source}
            playRequest={playRequest}
            soundEnabled={soundEnabled}
            onError={fail}
          />
        </View>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.badge} accessibilityRole="text">100% GOAL CRUSHED!</Text>
        {playbackError && (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            Couldn&apos;t play the celebration. Tap the character to try again.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  mascot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  video: { width: '100%', height: '100%' },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  error: { fontSize: 12, color: '#9A3412', textAlign: 'center', marginTop: 8 },
  footer: { position: 'absolute', bottom: 0, alignItems: 'center' },
  badge: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
});

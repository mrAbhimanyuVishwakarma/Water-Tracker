import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MascotId } from '../types';
import { dayKey } from '../utils/accountData';
import { feedback } from '../utils/feedback';
import { CrispVectorMascot } from './CrispVectorMascot';

const VIDEOS: Partial<Record<MascotId, number>> = {
  dodo: require('../../assets/dodo_sipping.mp4'),
  sloth: require('../../assets/sloth_sipping.mp4'),
  turtle: require('../../assets/turtle_sipping.mp4'),
  mammoth: require('../../assets/mammoth_sipping.mp4'),
  penguin: require('../../assets/penguin_sipping.mp4'),
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
        feedback.playWaterDropSound();
        setAutoPlay(true);
      });
    }
    return () => { cancelled = true; };
  }, [isFilled]);
  return autoPlay;
}

function SippingVideo({ source, onDone, onError }: { source: number; onDone: () => void; onError: () => void }) {
  const [ready, setReady] = useState(false);
  const player = useVideoPlayer(source, instance => {
    instance.muted = true;
    instance.loop = false;
    instance.staysActiveInBackground = false;
  });
  useEventListener(player, 'playToEnd', onDone);
  const updatePlayback = useCallback(() => {
    const visible = Platform.OS !== 'web' || typeof document === 'undefined' || !document.hidden;
    // AppState may be null while the native bridge initializes.
    const foreground = AppState.currentState === null || AppState.currentState === 'active';
    if (player.status === 'error') { onError(); return; }
    if (foreground && visible && player.status === 'readyToPlay') player.play();
    else if (!foreground || !visible) player.pause();
  }, [player, onError]);
  useEventListener(player, 'statusChange', updatePlayback);
  useEffect(() => {
    updatePlayback();
    const subscription = AppState.addEventListener('change', updatePlayback);
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.addEventListener('visibilitychange', updatePlayback);
    return () => {
      player.pause();
      subscription.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') document.removeEventListener('visibilitychange', updatePlayback);
    };
  }, [player, updatePlayback]);
  useEffect(() => {
    if (ready) return;
    const timeout = setTimeout(onError, 15000);
    return () => clearTimeout(timeout);
  }, [ready, onError]);
  return <>
    <VideoView player={player} style={styles.video}
      contentFit="contain" nativeControls={false} surfaceType="textureView"
      onFirstFrameRender={() => setReady(true)} />
    {!ready && <View pointerEvents="none" style={styles.loading}>
      <ActivityIndicator color="#0284C7" accessibilityLabel="Loading celebration" />
    </View>}
  </>;
}

export function GoalCelebration({ mascotId, width, height, autoPlay }: {
  mascotId: MascotId; width: number; height: number; autoPlay: boolean;
}) {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [replayId, setReplayId] = useState(0);
  const source = VIDEOS[mascotId];
  const [previousMascot, setPreviousMascot] = useState(mascotId);
  if (previousMascot !== mascotId) {
    setPreviousMascot(mascotId);
    setPlaying(false);
    setPlaybackError(false);
  }
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => { if (mounted) setReduceMotion(true); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      setReduceMotion(value);
      if (value) setPlaying(false);
    });
    return () => { mounted = false; subscription.remove(); };
  }, []);
  const attempted = useRef(false);
  useEffect(() => {
    if (!autoPlay || reduceMotion === null || attempted.current) return;
    if (reduceMotion || !source) return;
    const timeout = setTimeout(() => {
      if (attempted.current) return;
      attempted.current = true;
      setPlaying(true);
    }, 350);
    return () => clearTimeout(timeout);
  }, [autoPlay, reduceMotion, source]);
  const replay = () => {
    attempted.current = true;
    setPlaybackError(false);
    setReplayId(value => value + 1);
    setPlaying(true);
  };
  const finish = useCallback(() => setPlaying(false), []);
  const fail = useCallback(() => {
    setPlaying(false);
    setPlaybackError(true);
  }, []);
  return (
    <View style={[styles.container, { width, height }]}>
      <Pressable style={styles.mascot} disabled={!source} onPress={replay}
        accessibilityRole={source ? 'button' : 'image'}
        accessibilityLabel={source ? 'Replay sipping celebration' : 'Daily hydration goal completed'}>
        <CrispVectorMascot type="sipping" mascotId={mascotId} width={width} height={height - 70} />
        {playing && source && <View pointerEvents="none" style={[styles.panel, { width, height: width * 9 / 16 }]}>
          <SippingVideo key={`${source}-${replayId}`} source={source} onDone={finish} onError={fail} />
        </View>}
      </Pressable>
      <View style={styles.footer}>
        <Text style={styles.badge} accessibilityRole="text">🏆 100% GOAL CRUSHED!</Text>
        {source && <Pressable accessibilityRole="button" accessibilityLabel="Replay sipping celebration"
          onPress={replay} style={styles.replay}>
          <Text style={styles.replayText}>? Replay celebration</Text>
        </Pressable>}
        {playbackError && <Text accessibilityLiveRegion="polite" style={styles.error}>Couldn?t play the celebration. Tap replay to try again.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  mascot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 70, alignItems: 'center', justifyContent: 'center' },
  panel: { position: 'absolute', borderRadius: 22, overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F9FF' },
  error: { fontSize: 12, color: '#9A3412', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, alignItems: 'center' },
  badge: { backgroundColor: '#0284C7', color: '#FFFFFF', fontWeight: '900', fontSize: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  replay: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  replayText: { color: '#0369A1', fontSize: 13, fontWeight: '700' },
});

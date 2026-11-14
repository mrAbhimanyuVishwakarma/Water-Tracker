import React, { ReactNode, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { GestureDetector, GestureStateManager, type GestureTouchEvent, useCompetingGestures, useExclusiveGestures, useLongPressGesture, usePanGesture, useTapGesture } from 'react-native-gesture-handler';
import { useMascotActivity } from '../hooks/useMascotActivity';
import { BROWNIE_REACTIONS, BrownieArtVariant, BrownieEar, brownieArtworkFrame, brownieContainsPoint, brownieDragIntent, brownieGlassHitTest, brownieHitTest, brownieVideoKey, BrownieReaction, canStartBrownieReaction, newestUnseenDrink } from '../utils/brownieInteractions';
import { BROWNIE_REACTION_VIDEOS, MASCOT_MEDIA } from '../constants/mascotMedia';
import { feedback } from '../utils/feedback';
import { DrinkLog } from '../types';
import { BrownieReactionVideo } from './BrownieReactionVideo';

const ACTIONS = Object.keys(BROWNIE_REACTIONS) as BrownieReaction[];
const NO_LOGS: readonly DrinkLog[] = [];
type Clip = { id: number; source: number; reaction: BrownieReaction; silent: boolean };
type Tracker = { seen: Set<string>; pending: boolean };
type Props = {
  width: number; height: number; enabled?: boolean; soundEnabled: boolean; artworkOpacity: number;
  variant?: BrownieArtVariant; onGlassPress?: () => void;
  onCharacterTouchStart?: (identifiers: number[]) => void;
  drinkLogs?: readonly DrinkLog[];
  children: (artwork: ReactNode) => ReactNode;
};

export function BrownieInteraction(props: Props) {
  const { reduceMotion, foreground } = useMascotActivity();
  const available = foreground && props.enabled !== false;
  const tracker = useRef<Tracker>({ seen: new Set((props.drinkLogs ?? NO_LOGS).map(log => log.id)), pending: false });
  // Backgrounding, scrolling offscreen, or changing motion preferences unmounts the player and its voice.
  return <BrownieScene key={`${available}-${reduceMotion}-${props.variant}`} {...props}
    available={available} reduceMotion={reduceMotion} tracker={tracker} />;
}

function BrownieScene({ width, height, available, reduceMotion, soundEnabled, artworkOpacity, variant = 'vessel',
  onGlassPress, onCharacterTouchStart, drinkLogs = NO_LOGS, children, tracker }: Props & {
    available: boolean; reduceMotion: boolean; tracker: RefObject<Tracker>;
  }) {
  const [clip, setClip] = useState<Clip | null>(null);
  const active = useRef<Clip | null>(null);
  const sequence = useRef(0);
  const drag = useRef({ mode: null as 'pet' | 'follow' | null, played: false });
  const frame = brownieArtworkFrame(width, height, variant);
  const finish = useCallback(() => { active.current = null; setClip(null); }, []);
  const play = useCallback((reaction: BrownieReaction, side: BrownieEar = 'left', automatic = false,
    direction: 'lookLeft' | 'lookRight' | 'lookUp' | 'lookDown' = 'lookLeft', override?: number) => {
    if (!available || !canStartBrownieReaction(active.current?.reaction ?? null, reaction)) return false;
    if (!automatic) void feedback.triggerHaptic(reaction === 'hop' ? 'success' : 'light');
    // Keep a static pose and haptic feedback when the system requests reduced motion.
    if (reduceMotion) return true;
    const source = override ?? BROWNIE_REACTION_VIDEOS[brownieVideoKey(reaction, side, direction)];
    const next = { id: ++sequence.current, source, reaction, silent: automatic || reaction === 'idle' || reaction === 'follow' };
    active.current = next;
    setClip(next);
    return true;
  }, [available, reduceMotion]);

  useEffect(() => {
    if (newestUnseenDrink(drinkLogs, tracker.current.seen)) tracker.current.pending = variant === 'vessel';
    if (variant === 'poster') tracker.current.pending = false;
    tracker.current.seen = new Set(drinkLogs.map(log => log.id));
    if (!available || !tracker.current.pending || clip) return;
    const timer = setTimeout(() => {
      if (play('drink')) tracker.current.pending = false;
    }, 180);
    return () => clearTimeout(timer);
  }, [available, drinkLogs, tracker, clip, play, variant]);
  useEffect(() => {
    if (!available || reduceMotion || clip) return;
    const timer = setTimeout(() => play('idle', 'left', true), 28000);
    return () => clearTimeout(timer);
  }, [available, reduceMotion, clip, play]);

  const replay = () => {
    if (!available || (active.current && active.current.reaction !== 'idle')) return;
    if (active.current) finish();
    if (onGlassPress) onGlassPress();
    else play('drink', 'left', false, 'lookLeft', BROWNIE_REACTION_VIDEOS.sip);
  };
  const rejectWhitespace = (event: GestureTouchEvent) => {
    'worklet';
    if (!event.changedTouches.some(touch => brownieContainsPoint(touch.x, touch.y, width, height, variant))) GestureStateManager.fail(event.handlerTag);
  };
  const singleTap = useTapGesture({
    enabled: available, cancelsTouchesInView: false, cancelsJSResponder: false, runOnJS: true,
    maxDistance: 10, maxDuration: 240, onTouchesDown: rejectWhitespace,
    onDeactivate: event => {
      if (event.canceled) return;
      if (brownieGlassHitTest(event.x, event.y, width, height, variant)) { replay(); return; }
      const hit = brownieHitTest(event.x, event.y, width, height, variant);
      if (hit) play(hit.reaction, hit.foot ?? hit.ear);
    },
  });
  const doubleTap = useTapGesture({
    enabled: available, cancelsTouchesInView: false, cancelsJSResponder: false, runOnJS: true,
    numberOfTaps: 2, maxDelay: 240, maxDuration: 240, maxDistance: 10, onTouchesDown: rejectWhitespace,
    onDeactivate: event => {
      if (!event.canceled && brownieContainsPoint(event.x, event.y, width, height, variant)) play('hop');
    },
  });
  const longPress = useLongPressGesture({
    enabled: available, cancelsTouchesInView: false, cancelsJSResponder: false, runOnJS: true,
    minDuration: 500, maxDistance: 10, onTouchesDown: rejectWhitespace,
    onActivate: event => {
      if (brownieContainsPoint(event.x, event.y, width, height, variant)) play('rest');
    },
  });
  const pan = usePanGesture({
    enabled: available, cancelsTouchesInView: false, cancelsJSResponder: false, runOnJS: true,
    maxPointers: 1, minDistance: 8, onTouchesDown: rejectWhitespace,
    onBegin: event => {
      drag.current = { mode: brownieDragIntent(event.x, event.y, width, height, variant), played: false };
    },
    onUpdate: event => {
      if (drag.current.played || !drag.current.mode) return;
      const dx = event.translationX, dy = event.translationY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
      const direction = Math.abs(dx) >= Math.abs(dy) ? dx < 0 ? 'lookLeft' : 'lookRight' : dy < 0 ? 'lookUp' : 'lookDown';
      drag.current.played = true;
      play(drag.current.mode, 'left', false, direction);
    },
  });
  const taps = useExclusiveGestures(doubleTap, singleTap);
  const gestures = useCompetingGestures(longPress, taps, pan);
  const artwork = <Image source={variant === 'poster' ? MASCOT_MEDIA.brownie.poster : MASCOT_MEDIA.brownie.vessel}
    resizeMode="contain" accessible={false} style={{ position: 'absolute', left: frame.left, top: frame.top,
      width: frame.width, height: frame.height, opacity: artworkOpacity }} />;
  return <View style={{ width }}>
    <GestureDetector gesture={gestures}>
      <View collapsable={false} style={{ width, height }} testID="brownie-touch-surface"
        onTouchStart={event => {
          if (!available) return;
          const ids = event.nativeEvent.changedTouches.filter(touch => brownieContainsPoint(touch.locationX, touch.locationY, width, height, variant)).map(touch => touch.identifier);
          if (ids.length) onCharacterTouchStart?.(ids);
        }}
        accessible accessibilityRole="button" accessibilityLabel={clip ? `Play with Brownie. ${BROWNIE_REACTIONS[clip.reaction].message}` : 'Play with Brownie'}
        accessibilityHint="Tap an ear, face, belly, foot or tail. Stroke the head to pet, swipe the face to look, double tap to hop, or hold to relax. Tap the glass to sip."
        accessibilityState={{ disabled: !available, busy: !!clip }}
        accessibilityActions={[{ name: 'activate', label: 'Make Brownie smile' }, ...ACTIONS.map(name => ({ name, label: BROWNIE_REACTIONS[name].label })), { name: 'replay', label: 'Replay sipping celebration' }]}
        onAccessibilityTap={() => play('face')}
        onAccessibilityAction={event => {
          const name = event.nativeEvent.actionName;
          if (name === 'replay') replay();
          else if (name === 'activate') play('face');
          else if (ACTIONS.includes(name as BrownieReaction)) play(name as BrownieReaction);
        }}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {variant === 'vessel' && <Image source={require('../../assets/characters/brownie/runtime/habitat.png')}
            resizeMode="contain" style={StyleSheet.absoluteFill} accessible={false} />}
          {children(artwork)}
        </View>
        {clip && <BrownieReactionVideo key={clip.id} source={clip.source} soundEnabled={soundEnabled && !clip.silent} onEnd={finish} />}
      </View>
    </GestureDetector>
  </View>;
}

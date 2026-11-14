import { useCallback, useEffect, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { MascotId } from '../types';
import { BROWNIE_REACTION_SOUNDS, MASCOT_MEDIA } from '../constants/mascotMedia';
import type { BrownieReaction } from '../utils/brownieInteractions';

export function useCharacterSound(mascotId: MascotId, enabled: boolean, active: boolean) {
  const player = useAudioPlayer(MASCOT_MEDIA[mascotId].reactionSound, { keepAudioSessionActive: false });
  const loadedSource = useRef(MASCOT_MEDIA[mascotId].reactionSound);
  const request = useRef(0);
  const permission = useRef({ allowed: false });

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false, allowsRecording: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  }, []);

  useEffect(() => {
    const session = { allowed: enabled && active };
    permission.current = session;
    player.muted = !session.allowed;
    player.volume = 0.55;
    if (!session.allowed) player.pause();
    return () => {
      session.allowed = false;
    };
  }, [active, enabled, player]);

  return useCallback((reaction?: BrownieReaction) => {
    if (!enabled || !active) return;
    const current = ++request.current;
    const session = permission.current;
    const source = mascotId === 'brownie' && reaction ? BROWNIE_REACTION_SOUNDS[reaction] : MASCOT_MEDIA[mascotId].reactionSound;
    // One player prevents stacked voices when a reaction interrupts another.
    player.pause();
    if (loadedSource.current !== source) {
      loadedSource.current = source;
      player.replace(source);
      if (session.allowed) player.play();
      return;
    }
    void player.seekTo(0).then(() => {
      if (session.allowed && current === request.current) player.play();
    }).catch(() => {});
  }, [active, enabled, mascotId, player]);
}

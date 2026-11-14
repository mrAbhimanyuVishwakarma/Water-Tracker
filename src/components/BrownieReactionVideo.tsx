import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

// One mounted player owns the clip AND its voice. No separate reaction sound is layered over it.
export function BrownieReactionVideo({ source, soundEnabled, onEnd }: {
  source: number; soundEnabled: boolean; onEnd: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    player.pause();
    onEnd();
  };
  const player = useVideoPlayer(source, instance => {
    instance.loop = false;
    instance.muted = !soundEnabled;
    instance.staysActiveInBackground = false;
  });
  useEventListener(player, 'playToEnd', finish);
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') finish();
    else if (status === 'readyToPlay' && !finished.current) player.play();
  });
  useEffect(() => {
    player.muted = !soundEnabled;
  }, [player, soundEnabled]);
  useEffect(() => {
    if (player.status === 'readyToPlay') player.play();
    const timeout = setTimeout(finish, 20000);
    return () => { finished.current = true; clearTimeout(timeout); player.pause(); };
    // The component is keyed by playback request and owns one finite clip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: visible ? 1 : 0, backgroundColor: '#FFFFFF' }]}>
    <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain"
      nativeControls={false} surfaceType="textureView" onFirstFrameRender={() => setVisible(true)} />
  </View>;
}

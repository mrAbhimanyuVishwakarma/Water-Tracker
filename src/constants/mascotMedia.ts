import type { ImageSourcePropType } from 'react-native';
import type { MascotId } from '../types';
import type { BrownieReaction } from '../utils/brownieInteractions';
import brownieSoundDurations from '../../assets/characters/brownie/sounds/durations.json';

export const BROWNIE_SOUND_DURATIONS: Record<BrownieReaction, number> = brownieSoundDurations;

export const BROWNIE_REACTION_VIDEOS = {
  earLeft: require('../../assets/characters/brownie/runtime/ear-left.mp4'),
  earRight: require('../../assets/characters/brownie/runtime/ear-right.mp4'),
  face: require('../../assets/characters/brownie/runtime/face-oh.mp4'),
  belly: require('../../assets/characters/brownie/runtime/belly-tickle.mp4'),
  hop: require('../../assets/characters/brownie/runtime/happy-hop.mp4'),
  rest: require('../../assets/characters/brownie/runtime/relax.mp4'),
  pet: require('../../assets/characters/brownie/runtime/head-pet.mp4'),
  drink: require('../../assets/characters/brownie/runtime/drink-nod.mp4'),
  idle: require('../../assets/characters/brownie/runtime/idle-blink.mp4'),
  lookLeft: require('../../assets/characters/brownie/runtime/look-left.mp4'),
  lookRight: require('../../assets/characters/brownie/runtime/look-right.mp4'),
  lookUp: require('../../assets/characters/brownie/runtime/look-up.mp4'),
  lookDown: require('../../assets/characters/brownie/runtime/look-down.mp4'),
  foot: require('../../assets/characters/brownie/runtime/foot-left.mp4'),
  tail: require('../../assets/characters/brownie/runtime/tail-no-no.mp4'),
  sip: require('../../assets/characters/brownie/runtime/sip-celebrate.mp4'),
};

export const BROWNIE_REACTION_SOUNDS = {
  ear: require('../../assets/characters/brownie/sounds/ear-chuckle.wav'),
  face: require('../../assets/characters/brownie/sounds/face-surprise.wav'),
  belly: require('../../assets/characters/brownie/sounds/belly-laugh.wav'),
  hop: require('../../assets/characters/brownie/sounds/hop-cheer.wav'),
  rest: require('../../assets/characters/brownie/sounds/rest-sigh.wav'),
  pet: require('../../assets/characters/brownie/sounds/pet-content.wav'),
  drink: require('../../assets/characters/brownie/sounds/drink-refresh.wav'),
  idle: require('../../assets/characters/brownie/sounds/idle-murmur.wav'),
  follow: require('../../assets/characters/brownie/sounds/follow-curious.wav'),
  foot: require('../../assets/characters/brownie/sounds/foot-giggle.wav'),
  tail: require('../../assets/characters/brownie/sounds/tail-no-no.wav'),
} satisfies Record<BrownieReaction, number>;

interface MascotMedia {
  float: ImageSourcePropType;
  vessel: ImageSourcePropType;
  poster: ImageSourcePropType;
  sippingVideo: number;
  reactionSound: number;
  openEyes?: ImageSourcePropType;
  blink?: ImageSourcePropType;
}

// One asset entry per character. Keep require paths literal so Metro can bundle them.
// poster.png is lossless frame 0 from the adjacent sipping.mp4, with identical framing.
export const MASCOT_MEDIA = {
  brownie: {
    float: require('../../assets/characters/brownie/float.png'),
    vessel: require('../../assets/characters/brownie/vessel.png'),
    poster: require('../../assets/characters/brownie/runtime/poster.png'),
    sippingVideo: require('../../assets/characters/brownie/runtime/sipping.mp4'),
    reactionSound: require('../../assets/characters/brownie/reaction.wav'),
    openEyes: require('../../assets/characters/brownie/open-eyes.png'),
    blink: require('../../assets/characters/brownie/blink.png'),
  },
  dodo: {
    float: require('../../assets/characters/dodo/float.png'),
    vessel: require('../../assets/characters/dodo/vessel.png'),
    poster: require('../../assets/characters/dodo/poster.png'),
    sippingVideo: require('../../assets/characters/dodo/sipping.mp4'),
    reactionSound: require('../../assets/characters/dodo/reaction.wav'),
  },
  mammoth: {
    float: require('../../assets/characters/mammoth/float.png'),
    vessel: require('../../assets/characters/mammoth/vessel.png'),
    poster: require('../../assets/characters/mammoth/poster.png'),
    sippingVideo: require('../../assets/characters/mammoth/sipping.mp4'),
    reactionSound: require('../../assets/characters/mammoth/reaction.wav'),
  },
  sloth: {
    float: require('../../assets/characters/sloth/float.png'),
    vessel: require('../../assets/characters/sloth/vessel.png'),
    poster: require('../../assets/characters/sloth/poster.png'),
    sippingVideo: require('../../assets/characters/sloth/sipping.mp4'),
    reactionSound: require('../../assets/characters/sloth/reaction.wav'),
  },
  turtle: {
    float: require('../../assets/characters/turtle/float.png'),
    vessel: require('../../assets/characters/turtle/vessel.png'),
    poster: require('../../assets/characters/turtle/poster.png'),
    sippingVideo: require('../../assets/characters/turtle/sipping.mp4'),
    reactionSound: require('../../assets/characters/turtle/reaction.wav'),
  },
  penguin: {
    float: require('../../assets/characters/penguin/float.png'),
    vessel: require('../../assets/characters/penguin/vessel.png'),
    poster: require('../../assets/characters/penguin/poster.png'),
    sippingVideo: require('../../assets/characters/penguin/sipping.mp4'),
    reactionSound: require('../../assets/characters/penguin/reaction.wav'),
  },
} satisfies Record<MascotId, MascotMedia>;

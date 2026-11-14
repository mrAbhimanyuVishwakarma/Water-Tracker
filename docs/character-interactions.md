# Brownie interactions

Implemented on `character-interaction`. Brownie uses the individually generated videos, with embedded audio. Other characters keep their existing celebration behavior.

| Trigger | Video |
| --- | --- |
| Tap left / right ear (viewer coordinates) | `ear-left` / `ear-right` |
| Tap face or eyes | `face-oh` |
| Tap exposed belly | `belly-tickle` |
| Tap either foot | `foot-left` (shared without mirroring) |
| Tap tail | `tail-no-no` |
| Tap crown or stroke forehead | `head-pet` |
| Double tap visible body or glass | `happy-hop` |
| Hold visible body for 500 ms | `relax` |
| Swipe on face left / right / up / down | Corresponding `look-*` clip, silent |
| Add water before goal completion | `drink-nod` after logging panel closes |
| Tap glass before completion | `sip-celebrate` |
| Reach 100% once per day, or tap glass afterward | Original `sources/sipping-original.mp4`, processed as `runtime/sipping.mp4` |
| 28 quiet seconds | `idle-blink`, silent |

An already-completed day opens on the interactive still without automatic replay. Goal completion owns the scene and suppresses an extra drink nod. The generated replacement goal celebration is not used.

Single taps wait for the double-tap window. Long press and drag compete with taps. Face swipes choose one finite directional video; they do not continuously track a moving finger. A stroke starts one head-pet clip that finishes even after release. Each voiced reaction finishes before another starts; there is no tap backlog. User input may interrupt silent idle. Glass replay is ignored while another clip owns playback.

All controls are on the character. Native accessibility actions expose reactions without precise body taps. Reduced Motion keeps the static artwork and haptic feedback instead of playing reaction videos. The existing Sound and Haptic settings apply. No recording or microphone access is used.

## Habitat and framing

Brownie's common still and runtime clips use a 720 × 720 canvas with the same static, noninteractive muted-green habitat. The original video supplies its wood slice; source green backgrounds are removed offline. The original sipping movement and embedded sound are retained. The app fits both still and videos with `contain`.

The translucent water vessel remains before completion. During a reaction, the full-color generated video temporarily overlays it; afterward the vessel returns. At completion, only the fully visible still and habitat remain between clips.

Touch maps use separate vessel and completed-pose coordinates. Artwork-derived masks include Brownie's body and glass, excluding white space and habitat. Only a finger starting on the character locks dashboard scrolling; release/cancel, backgrounding, and opening the drink panel release the lock. White-space gestures fail immediately. Playback stops when inactive, scrolling, or offscreen.

## Media authoring

Original downloads remain untouched under `assets/characters/brownie/sources/reactions/`. Prompt packs remain in each character's folder: [Brownie](../assets/characters/brownie/animation-prompts.md), [Manni](../assets/characters/mammoth/animation-prompts.md).

Run `node scripts/media/prepare-brownie-reactions.cjs` with FFmpeg and FFprobe on PATH, or set `BROWNIE_FFMPEG_DIR` to their directory. The script writes runtime MP4s, common poster, habitat, and `clips.json` recording trim ranges. Movement and audio activity determine conservative leading/trailing trims. Original sipping keeps its complete performance. Idle and directional-look outputs are muted. No voice is synthesized or layered over video playback.

The asset registry is `src/constants/mascotMedia.ts`. Only runtime media are consumed by Brownie's interaction player; legacy WAVs remain preserved for provenance. One finite `expo-video` player owns a reaction and its audio. Completion/error returns to the still, and unmount stops the player. A separate goal player is paused outside goal playback.

After changing the master or vessel artwork, regenerate touch masks with `python scripts/media/generate-brownie-touch-mask.py` (Pillow, NumPy, SciPy; authoring only). Masks derive from the original square character image, excluding the decorative habitat.

## Verification

Run `npm test`, `npm run typecheck`, and `npm run lint`. Tests cover touch geometry at multiple sizes, both ears, feet, tail, glass, white-space scrolling, video routing, asset existence, conservative trim bounds, one-shot playback/error handling, audio muting and cleanup, and completed versus water-vessel rendering.

The Android Babel-transformed regression is essential: worklets capture dependencies at module initialization. `brownieContainsPoint` must be initialized before the `brownieDragIntent` worklet captures it. TypeScript-only helper tests bypass that transform and previously missed a first-touch release crash.

Install the actual candidate APK on the test emulator before handoff. Run `node scripts/qa/smoke-brownie-android.cjs` on the Today screen before completion, or add `--completed` when the local guest test data has reached the goal. The script cold-launches the app, exercises 16 gestures, checks the process and fatal logs through playback/cleanup, captures screenshots, and backgrounds the app during playback. It does not sign in, clear data, or add drinks. Set `BROWNIE_TEST_DEVICE` to change the emulator serial and `BROWNIE_ADB` if ADB is outside `ANDROID_HOME`. Review the screenshots as well as process survival; a successful build alone is not a runtime test.

Android export validates Metro's literal media requires. Processed poster and video contact sheets are visually reviewed. Physical-device gesture feel, audible balance, and native video transitions still require a live phone check.

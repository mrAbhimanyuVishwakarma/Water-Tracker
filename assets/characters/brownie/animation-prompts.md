# Brownie: individual reaction video prompts

Every block below is self-contained: attach the same master image, attach the supplied video as an acting/voice reference when the generator accepts it, then copy ONE whole prompt. Generate one MP4 per block.

## Shared master frame

Use `assets/characters/brownie/sources/reaction-master.png`. This is a 1280 × 720 canvas containing the original 720 × 720 master image unchanged in the center, with matching green padding on both sides. The square original is preserved as `sources/reaction-master-square-original.png`. This new animation set should share the widescreen image as its resting pose. Upload the replacement file again in Flow and replace BOTH frame slots; the earlier upload remains square.

Where first/end-frame controls are available, place the SAME file in BOTH slots. Google Flow supports start and end frames; see [Google's instructions](https://support.google.com/flow/answer/16353334?hl=en). Gemini Apps also accepts image/video references and audio instructions; see [Gemini video help](https://support.google.com/gemini/answer/16126339?hl=en). Feature controls can differ by model and interface. Prompting alone cannot guarantee pixel-identical endpoints.

Keep the original 16:9 framing for the whole batch. The app can use one consistent central square crop and green-background treatment for all clips afterward. Do not crop, zoom or recolor individual downloads differently.

The phrase “loop-ready” here means: common still → one complete reaction → the SAME common still. Touch reactions will play once in the app and return to the still; they do not need to repeat continuously.

## Generation order and audio

Generate **tail**, **face/eye**, and **happy hop** first, and compare their voice quality before spending generations on the rest. Use the same reference and voice configuration throughout.

There is no one- or two-second limit. Let the movement and voice finish at a natural pace, including longer reactions when appropriate. If the generator has a fixed clip length, leave unused time quiet in the neutral pose rather than stretching, repeating or truncating the action.

Each clip owns its original audio. On integration, the app should play that audio once, without layering the old WAV reaction over it. Eye touch should produce one “Oh!”, not “oh-oh”; tail should produce one two-word “No, no.” phrase. Double tap uses a natural giggle, avoiding the robotic spoken “yeah” cue.

The four directional eye clips are optional assets for fixed-direction reactions. A prerecorded video cannot continuously track an arbitrary moving finger. Smooth live finger following still needs the app's pupil movement code; a single optional curiosity cue can play on initial touch, rather than on each direction change.

## Files to return

Save the original downloaded MP4s, with embedded audio intact, under `assets/characters/brownie/sources/reactions/`, using the filenames below. Keep the shared master image alongside this set. Avoid screen recordings, extra music, stitched compilations and editing the ending into a reversed animation.

Check each generated clip: complete body visible; glass and straw unchanged; one intended action; correct single voice cue; same character position and scale at both ends; clean return to the master pose. If the model drifts, regenerate or keep it as a draft rather than silently changing the shared master between clips.

## 01. Tail — gentle “no, no”

Filename: `tail-no-no.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie reacts as though his little tail area on the viewer's left has just been touched. No touching hand appears. He gently closes both eyes and swings only his head left, then right, in an affectionate “please don't” gesture. Keep his body seated and his paws holding the glass securely. Give him a soft, playful expression with no angry eyebrows or scowl.

Audio: say exactly “No, no.” once as one natural two-word phrase, with the first “no” accompanying the leftward head movement and the second accompanying the rightward movement. Let the two words have slightly different, conversational intonation. It should sound like a spontaneous gentle objection, not a warning, chant or synthesized announcement. No extra words or giggle layered over the phrase. Reopen his eyes and restore the exact master pose after finishing.
```

## 02. Eye / face touch — one “oh”

Filename: `face-oh.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie reacts to a light touch near his cheek or eye, with no hand shown. He gives one soft blink, opens his eyes a little wider in mild surprise, makes a small rounded mouth, then softens into a friendly smile. Keep this cute and harmless; no injury, tears or distress. Keep his glass, paws and straw stable, with natural mouth movement around the straw.

Audio: exactly ONE soft “Oh!” with a single clear vowel and a warm, lightly surprised tone. Do not say “oh-oh,” “oho,” “uh-oh,” or repeat “oh.” One voice only, with no echo or second vocal layer. Complete the sound before returning precisely to the original eyes, smile and resting pose.
```

## 03. Double tap — happy hop

Filename: `happy-hop.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie becomes briefly delighted, makes a small anticipatory squash, performs one tiny seated hop, lands softly, and settles back into his original pose. His paws keep hold of the glass; the glass and straw move naturally with him and remain unchanged. The water may wobble slightly but does not spill. Make the hop modest and charming, without flying, turning around, changing size or doing a second jump.

Audio: one short genuine breathy giggle or delighted little laugh, naturally performed and synchronized with the happy movement. No spoken “yeah,” “yay,” or “yeah-yeah.” Do not read laughter syllables as words. No added splash sound or music competing with the giggle. Return fully to the exact master frame.
```

## 04. Ear on viewer’s left

Filename: `ear-left.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie's ear on the viewer's LEFT gives a small soft twitch, followed by a slight head tilt toward that ear. His eyes brighten with curious amusement. The other ear can move minimally with the head but is not the focus. Keep his seated body and glass steady.

Audio: one quiet natural chuckle, smaller and softer than the belly-tickle laugh, with no spoken words. The ear movement should feel like a response to a gentle touch, not irritation. Let the ear and head settle back completely, ending on the unchanged master pose.
```

## 05. Ear on viewer’s right

Filename: `ear-right.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie's ear on the viewer's RIGHT gives a small soft twitch, followed by a slight head tilt toward that ear. His eyes brighten with curious amusement. Keep the existing markings, scarf, glass and striped straw in place; do not mirror or flip the character to animate the opposite ear.

Audio: one quiet natural chuckle in the same Brownie voice, with a slightly different spontaneous cadence from the opposite-ear reaction. No words. The ear and head return completely to the exact master pose.
```

## 06. Belly tickle

Filename: `belly-tickle.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie reacts as though his belly is being lightly tickled, with no hand shown. His belly gives a small soft squash, shoulders bob gently, eyes briefly squeeze with happiness, and cheeks lift in a genuine smile. Keep him seated and keep his paws safely gripping the glass. Use restrained, soft-body movement, not a rubbery stretch or a long shaking fit.

Audio: one genuine warm giggle with a few naturally uneven laugh pulses and light breathing, matching the source video's cute laughter. Do not speak “ha ha” or “hee hee” as text. Avoid squealing or loud gasps. Let the laugh finish fully, then settle the body, eyes, smile and glass back into the exact master pose.
```

## 07. Foot on viewer’s left

Filename: `foot-left.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie reacts to a playful touch on the foot visible on the viewer's LEFT. That foot gives one small ticklish kick forward and relaxes. The other foot stays nearly still. His body wobbles just enough to feel alive, and his glass stays secure. Do not add toes, change the foot shape, or turn the character around.

Audio: one spontaneous light giggle, softer and shorter in character than the belly-tickle laugh, without forcing a specific duration. No words and no second laugh track. The moving foot must return to its exact original position and angle before the clip ends.
```

## 08. Foot on viewer’s right

Filename: `foot-right.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie reacts to a playful touch on the foot visible on the viewer's RIGHT. That foot gives one small ticklish kick and relaxes while the other foot remains nearly still. Keep the exact same character orientation; do not mirror the reference. Maintain a gentle seated wobble and a stable grip on the glass.

Audio: one light genuine giggle in the same voice, with natural small breath variations. No dialogue. Restore the exact original foot angle, seated body position, eyes, straw and glass, ending on the common master frame.
```

## 09. Head petting

Filename: `head-pet.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie responds as though his forehead is being gently stroked, with no hand or finger shown. He slowly leans his head a little into the imagined touch, closes both eyes with a contented expression, relaxes his shoulders, and holds the peaceful feeling briefly. Keep his body seated and his glass steady.

Audio: one soft appreciative “mm” or contented hum, naturally voiced, not a spoken sentence or exaggerated purr. Let it finish without a sharp cutoff. He then eases his head back, opens his eyes and restores the exact master pose.
```

## 10. Long press — relaxation

Filename: `relax.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie slowly closes his eyes, relaxes his shoulders, and takes two gentle unhurried breaths. Show a very small natural rise and fall of the chest and belly. Keep the cup securely held and the water quiet. This is peaceful relaxation, not falling asleep, collapsing, yawning widely or snoring.

Audio: only soft natural breathing and one small relaxed exhale, close and gentle, without speech, music or repeated artificial sighs. Allow several seconds if the breaths need it; do not rush or stretch them unnaturally. After the breaths, open his eyes and settle precisely into the same alert resting pose as the master image.
```

## 11. New drink logged — grateful nod

Filename: `drink-nod.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie notices that the user has logged a drink. His eyes glance down toward his own glass, he gives one appreciative little nod, and a few small bubbles rise inside the existing water. He is acknowledging the drink, not performing the full sipping animation. Keep his glass in its original position and the final water level unchanged.

Audio: one small satisfied “ah,” warm and natural, with no words of praise or narration. Return his gaze, head, mouth and water to the exact master resting frame after the bubbles settle.
```

## 12. Quiet idle

Filename: `idle-blink.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie remains comfortably seated in the master pose. After a quiet pause, he makes one natural blink, gives a tiny curious glance, and returns his gaze to the original direction. A very slight ear movement is enough; keep the rest of the body and glass almost still. This should feel like an occasional living moment, not continuous bouncing or a performance.

Audio: completely silent. No voice, breathing track, music, chime or ambient sound. Restore the precise original eyes, ear positions, head angle and resting pose at the end.
```

## 13. Look toward viewer’s left

Filename: `look-left.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie keeps his head, body, glass and paws almost still. His pupils and gaze gently move toward the viewer's LEFT as though noticing a finger there. Keep the eyes inside their original shapes without stretching, crossing or sliding the eye sockets. Briefly hold the interested gaze, then smoothly return the pupils to their exact master positions.

Audio: silent. Do not add a new voice cue every time the gaze changes direction. End on the identical master frame.
```

## 14. Look toward viewer’s right

Filename: `look-right.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie keeps his head, body, glass and paws almost still. His pupils and gaze gently move toward the viewer's RIGHT as though noticing a finger there. Do not mirror the character or change the eye shapes. Briefly hold the interested gaze, then smoothly return his pupils to the exact master positions.

Audio: silent. No words, hum, music or repeated reaction sound. End on the identical master frame.
```

## 15. Look upward

Filename: `look-up.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie gently looks UP with his pupils while keeping his head and seated body nearly still. The eyes remain naturally aligned and within their original shapes; do not roll the eyes back, cross them, enlarge them or lift the whole character. Briefly hold a curious upward gaze, then return his pupils precisely to the original positions.

Audio: silent. No voice, music or sound effect. The final image must match the common master frame.
```

## 16. Look downward

Filename: `look-down.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie gently looks DOWN with his pupils as though noticing a finger below his face. Keep his head, paws and glass nearly still. Avoid crossed eyes or changing the eye sockets. Briefly hold the interested downward gaze, then return the pupils smoothly to their exact starting positions.

Audio: silent. No new sound on each gaze direction. End on the identical master frame.
```

## 17. Glass tap / goal completion — sipping

Filename: `sip-celebrate.mp4`

```text
Create ONE standalone reaction animation of Brownie, the capybara in the attached master still. Use the master image as BOTH the opening frame and the final frame. Preserve his exact character design, warm brown colors, dark outlines, eyes, blush, scarf, body proportions, glass, striped straw, water level, scale, position and framing. Use the supplied Brownie video only as an acting and voice reference; do not reproduce its sequence of several reactions.

Keep the camera locked, the same 16:9 canvas, and the same flat green background from the master image. Keep the entire character, feet, tail and glass visible and within the central square area. No camera movement, reframing, cuts, added hands, new characters, scenery, captions or new decorative graphics.

Begin with a brief quiet hold of the exact master pose. Perform only the action below at its natural pace. Finish the entire movement and vocalization, then settle naturally into the exact master pose: same open eyes, head angle, smile, paw grip, straw placement, water level and body position. Hold that identical still quietly at the end. No reverse playback, repeated action cycle, fade, morph or dissolve to hide the return. If extra generation time remains, stay in the final resting pose; do not stretch the action or repeat its sound. A longer reaction is fine when it feels natural.

For audible reactions, use one consistent original fictional mascot voice: soft, youthful, warm, gently breathy and naturally expressive, matching the supplied video's cute vocal character. Use one dry voice performance with subtle natural variation, not an adult voice shifted upward. No robotic delivery, metallic buzz, nasal filtering, autotune, doubled voices, echo, music, narration or unrelated speech. The individual action below determines exactly which sound, or silence, to use.

ACTION FOR THIS CLIP:
Brownie takes one gentle sip through the existing striped straw while holding the same glass. Use a small believable cheek and mouth movement, a few tiny bubbles inside the water, and a relaxed satisfied expression. The glass, straw, paws and water must not morph, duplicate or disappear. Keep the sip modest and centered.

Audio: a quiet natural sip followed by ONE soft contented “ah,” with no layered giggle, narration or music. Let both sounds finish naturally. He then returns his cheeks, eyes, mouth, paws, straw and glass to the exact master positions. The final water level must match the reference so the common resting frame remains unchanged.
```



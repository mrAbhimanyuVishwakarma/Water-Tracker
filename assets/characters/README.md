# Character assets

Each mobile character has its own folder. The app's static asset references are registered in [`src/constants/mascotMedia.ts`](../../src/constants/mascotMedia.ts).

Keep animation prompt packs inside their character folders as `animation-prompts.md`: [Brownie](brownie/animation-prompts.md) and [Manni](mammoth/animation-prompts.md). Each pack names its own shared `sources/reaction-master.png` and individual MP4s. Future character prompt packs should follow the same structure.

Brownie's current interaction and celebration assets are in `brownie/runtime/`: trimmed square reaction videos, the processed original sipping video, a common `poster.png`, shared static `habitat.png`, and measured trim ranges in `clips.json`. Regenerate with `node scripts/media/prepare-brownie-reactions.cjs` (FFmpeg/FFprobe; optionally set `BROWNIE_FFMPEG_DIR`). Original generated downloads stay in `brownie/sources/reactions/`; `brownie/sources/sipping-original.mp4` remains the celebration source. Legacy root-level files and synthesized sounds are retained but no longer drive Brownie's interaction playback.

```text
characters/
  brownie/
    animation-prompts.md     Individual prompts with one shared first/last frame
    float.png                Pool artwork
    float.svg                Vector source
    vessel.png               Transparent hydration-vessel artwork and avatar
    vessel.svg               Vector source
    sipping.mp4              Production video, including original audio
    poster.png               Exact first frame of sipping.mp4
    touch-mask.json          Brownie's body/glass hit regions; white space scrolls
    reaction.wav             Short sound for touch reactions
    sounds/                  Brownie's distinct interaction cues and measured durations
    blink.png                Brownie expression frame from the same video
    open-eyes.png            Brownie vessel expression reference
    silhouette.svgpath       Available silhouette source
    contour.svgpath          Available contour source
    float-clean.svg          Alternate cleaned vector source
    sources/
      sipping-original.mp4   Original unprocessed video
      swimming-green.mp4    Original swimming source
      swimming-pool.mp4     Alternate swimming source
      interaction-giggle.wav          Isolated giggle from Brownie's own video
      interaction-voice-reference.wav Repeated giggle for offline voice conditioning
      reaction-master.png    Shared still for generated reaction clips
  dodo/
  mammoth/
  sloth/
  turtle/
  penguin/
```

The other characters share the core file names; only applicable expression, vector, and source extras are present. Existing source artwork and recordings are preserved. Application icons and general reference recordings remain in the parent `assets/` directory.

## Generating media

From the project root:

```sh
node scripts/media/extract-mascot-posters.cjs
node scripts/media/generate-character-sounds.cjs
python scripts/media/generate-brownie-touch-mask.py
powershell -File scripts/media/generate-brownie-voices.ps1
```

Poster extraction needs FFmpeg. The first script reads each `sipping.mp4` and writes its adjacent `poster.png`; Brownie's blink also comes from that clip. The second writes the deterministic character signatures. Brownie's voice script uses the original video giggle for laughter and Chatterbox Nano conditioned on that reference for other cues; its PowerShell file launches the Python generator. Authoring requires a separate Python environment with Chatterbox and FFmpeg. The app bundles only the finished WAVs and their timing metadata. Natural durations are retained, with no forced speech truncation or speed-up. Sipping playback uses the original audio embedded in the video.

The website serves independently optimized media from `website/assets/`. Its public URLs are separate from this mobile asset layout. Website media generation scripts read the originals in each character's `sources/` folder.

## Adding a character

1. Add its assets here and a literal-path entry in `MASCOT_MEDIA`.
2. Add its ID to `MascotId` and metadata to `MASCOTS` in `src/constants/beverages.ts`.
3. Add the hydration contour in `CapybaraVessel.tsx` and the glass hit region in `CompletedMascot.tsx`.
4. For body reactions, define a character-specific touch map and expression layers. Brownie's anatomy must not be reused blindly.
5. Update the character lists in the media-generation scripts, then run lint, typecheck, tests, and an Expo bundle export.

Only assets referenced by the registry enter the app bundle; keeping source files here does not automatically bundle them.

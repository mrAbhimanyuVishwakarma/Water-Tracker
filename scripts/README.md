# Development tools

Run commands from the repository root. App runtime code belongs in `src/`; these tools run during development, media authoring or release validation.

| Purpose | Command |
| --- | --- |
| Automated regression tests | `npm test` (files in `tests/`) |
| Lint / TypeScript | `npm run lint` / `npm run typecheck` |
| Installed Android APK gesture checks | `npm run test:android` |
| Completed-character gesture checks | `npm run test:android -- --completed` |
| Validate production configuration | `npm run release:check` |
| Local website preview | `npm run website:preview` |
| Preview on another port, without opening a browser | `npm run website:preview -- --port 3001 --no-browser` |
| Prepare Brownie's runtime videos and common habitat | `npm run media:brownie` |
| Regenerate Brownie's body/glass touch masks | `npm run media:touch-mask` |

## Directories

- `dev/`: Python standard-library website server. Reuses a matching running preview. Python 3 is required.
- `media/`: reusable offline asset preparation. FFmpeg/FFprobe are required for video tools; Python tools document their extra authoring dependencies. Their models and environments stay outside the app bundle.
- `qa/`: Android smoke testing through ADB against an explicitly selected test emulator. See [character interactions](../docs/character-interactions.md).
- `release/`: configuration validation used by `release:check` and EAS's post-install hook. This directory must remain included in EAS uploads.
- `windows/`: platform launchers. Double-click `preview-website.bat` here to preview the website. The emulator/mirroring helpers use PATH, `ANDROID_HOME` or `ANDROID_SDK_ROOT`.
- `legacy/`: historical one-off preparation scripts retained for provenance. They are outside normal builds and may require source inputs or Python dependencies not present in a clean checkout.

## Media preparation

```sh
node scripts/media/extract-mascot-posters.cjs
node scripts/media/generate-character-sounds.cjs
python scripts/media/convert_all_to_svg.py
node scripts/media/prepare-website-mascots.cjs
node scripts/media/prepare-website-swimming.cjs
```

The optional legacy voice authoring tools are `media/generate-brownie-voices.py` and its adjacent PowerShell launcher. Brownie's current interactions use generated videos' embedded audio instead.

Runtime assets remain in `assets/characters/<id>/`, original inputs in each character's `sources/`, and generated production outputs in `runtime/`. Keep production media versioned; local contact sheets, temporary renders, model downloads, environments and diagnostics belong under ignored `.expo/` or `.cache/`. See [character assets](../assets/characters/README.md).

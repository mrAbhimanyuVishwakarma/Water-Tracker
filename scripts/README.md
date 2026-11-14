# Project scripts

`preview-website.py` starts a Python 3 static server bound to this computer and opens the website in the default browser. On Windows, double-click `testlocal.bat` in the repository root. The default address is `http://localhost:3000`; use `testlocal.bat --port 3001` to choose another port. The `--no-browser` option starts the preview without opening a browser window. Run `python scripts/preview-website.py` directly on other platforms. A matching preview that is already running is reused.

`convert_all_to_svg.py` regenerates the TypeScript SVG asset map from `float.png` and `vessel.png` in each `assets/characters/<id>/` folder.

`extract-mascot-posters.cjs` extracts each character's exact video first frame into the same folder's `poster.png` (requires FFmpeg). `generate-character-sounds.cjs` writes each folder's `reaction.wav`. The application media registry lives in `src/constants/mascotMedia.ts`; see `assets/characters/README.md` for the folder layout and steps for adding a character.

`prepare-website-mascots.cjs` and `prepare-website-swimming.cjs` read original mobile sources from the character folders and write optimized website assets. Their website output URLs remain unchanged.

The `windows/` helpers launch an Android emulator or mirror a connected device. They use tools from `PATH`, `ANDROID_HOME`, or `ANDROID_SDK_ROOT` and accept an optional device or emulator name.

The `legacy/` directory contains one-off asset preparation scripts kept for provenance. Some require Python packages such as Pillow or vtracer and source images that are not part of the application repository. They are not used by normal development or builds.

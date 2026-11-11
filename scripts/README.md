# Project scripts

`preview-website.py` starts a Python 3 static server bound to this computer and opens the website in the default browser. On Windows, double-click `testlocal.bat` in the repository root. The default address is `http://localhost:3000`; use `testlocal.bat --port 3001` to choose another port. The `--no-browser` option starts the preview without opening a browser window. Run `python scripts/preview-website.py` directly on other platforms. A matching preview that is already running is reused.

`convert_all_to_svg.py` regenerates the TypeScript SVG asset map from the artwork in `assets/`.

The `windows/` helpers launch an Android emulator or mirror a connected device. They use tools from `PATH`, `ANDROID_HOME`, or `ANDROID_SDK_ROOT` and accept an optional device or emulator name.

The `legacy/` directory contains one-off asset preparation scripts kept for provenance. Some require Python packages such as Pillow or vtracer and source images that are not part of the application repository. They are not used by normal development or builds.

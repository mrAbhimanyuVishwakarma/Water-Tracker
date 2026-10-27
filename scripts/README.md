# Project scripts

`convert_all_to_svg.py` regenerates the TypeScript SVG asset map from the artwork in `assets/`.

The `windows/` helpers launch an Android emulator or mirror a connected device. They use tools from `PATH`, `ANDROID_HOME`, or `ANDROID_SDK_ROOT` and accept an optional device or emulator name.

The `legacy/` directory contains one-off asset preparation scripts kept for provenance. Some require Python packages such as Pillow or vtracer and source images that are not part of the application repository. They are not used by normal development or builds.

# Application assets

- Root images are Expo app icons, splash artwork and other shared runtime assets. Keep their names aligned with `app.json`.
- [`characters/`](characters/README.md) groups each mascot's production artwork, videos, prompt pack and original sources.
- `sources/recordings/` preserves original screen recordings used as authoring references. The website swimming tool reads its pool reference here.

Production assets remain versioned so clean checkouts can bundle the app. Original authoring inputs are retained for reproducibility, but `.easignore` excludes `sources/` directories from mobile build uploads. Temporary renders, contact sheets, caches and downloaded voice models belong in ignored `.expo/` or `.cache/` instead.

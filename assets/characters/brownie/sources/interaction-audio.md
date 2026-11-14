# Brownie interaction voice source

The voice reference comes from this character's own `../sipping.mp4`, not a real person's voice sample or another character.

- HTDemucs separated the vocal stem from the existing background music.
- `interaction-giggle.wav` is 5.65–6.80 seconds from that stem, normalized and gently faded. The audible giggle occupies roughly 5.9–6.6 seconds of the video.
- `interaction-voice-reference.wav` repeats the giggle to 6.3 seconds for offline voice conditioning. It is not played by the app.
- Ear, foot, and belly WAVs use that original giggle, with modest tempo/loudness variation.
- Other cues use Chatterbox Nano (`ResembleAI/chatterbox-nano`, MIT), conditioned on the same reference. Generation used Chatterbox commit `ab55923c27757c90cfcc407baa57dc25a7d25217`.
- Spoken cues preserve their complete generated duration. Leading/trailing silence is trimmed. No Windows speech synthesis, forced speech speed-up, or time truncation is used.
- Tail, double-tap cheer, and face/eye-touch cues have a warmer mastering profile: restrained cuts around 950 Hz and 2.6 kHz, softer high frequencies and onset, and slightly gentler loudness. The approved voice, words, pitch, and natural timing remain intact. Use `python scripts/generate-brownie-voices.py --remaster-only` to apply the profile to cached raw takes without regenerating their performances.

The original video remains unchanged. The app references only finished WAVs and measured durations from `../sounds/`; models and source WAVs are not bundled.

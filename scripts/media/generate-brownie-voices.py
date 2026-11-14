"""Offline cues using Brownie's original giggle and Chatterbox Nano (MIT).

Requires FFmpeg, torch, soundfile, chatterbox-tts in a separate Python environment.
No model, network request or voice synthesis is used in the mobile app.
"""
import argparse
import json
from functools import partial
from pathlib import Path
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
CHARACTER = ROOT / 'assets/characters/brownie'
SCRATCH = ROOT / '.expo/brownie-generated-voice'
PROMPTS = {
    'face-surprise': 'Oh!',
    'hop-cheer': 'Yay!',
    'rest-sigh': '[sigh]',
    'pet-content': 'Mmm.',
    'drink-refresh': 'Ahh!',
    'idle-murmur': 'Hmm.',
    'follow-curious': 'Huh?',
    'tail-no-no': 'No, no.',
}

# These brief voiced exclamations need gentler mastering than the original giggle.
# Reduce nasal/metallic resonance without shifting pitch or changing the phrasing.
SOFT_VOICES = {'tail-no-no', 'hop-cheer', 'face-surprise'}
WARM_VOICE_EQ = ('equalizer=f=950:t=q:w=1.0:g=-2.8,'
                 'equalizer=f=2600:t=q:w=1.2:g=-2.0,'
                 'highshelf=f=4800:g=-2.0,lowshelf=f=350:g=1.0,')


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)], check=True)


def finish(source, destination, tempo=1.0, loudness=-22):
    import numpy as np
    import soundfile as sf
    intermediate = SCRATCH / (destination.stem + '-trimmed.wav')
    filters = ('highpass=f=100,lowpass=f=7500,'
               'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-42dB,'
               'areverse,silenceremove=start_periods=1:start_duration=0.02:start_threshold=-42dB,areverse,'
               f'atempo={tempo}')
    ffmpeg('-i', source, '-af', filters, '-ac', 1, '-ar', 24000, intermediate)
    samples, rate = sf.read(intermediate)
    if len(samples) < rate * 0.12:
        raise ValueError(f'{destination.name}: generated voice is empty')
    peak = float(np.max(np.abs(samples)))
    if peak < 0.002:
        raise ValueError(f'{destination.name}: generated voice is too quiet')
    soft = destination.stem in SOFT_VOICES
    tone = WARM_VOICE_EQ if soft else ''
    target = -23 if soft else loudness
    attack = 0.025 if soft else 0.012
    ffmpeg('-i', intermediate, '-af',
           f'{tone}loudnorm=I={target}:TP=-4:LRA=7,afade=t=in:d={attack},areverse,afade=t=in:d=0.035,areverse',
           '-ac', 1, '-ar', 24000, '-c:a', 'pcm_s16le',
           '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', destination)
    print(f'{destination.name}: {len(samples)/rate:.2f}s', flush=True)


def write_durations(output):
    import soundfile as sf
    names = {
        'ear': 'ear-chuckle', 'face': 'face-surprise', 'belly': 'belly-laugh',
        'hop': 'hop-cheer', 'rest': 'rest-sigh', 'pet': 'pet-content',
        'drink': 'drink-refresh', 'idle': 'idle-murmur', 'follow': 'follow-curious',
        'foot': 'foot-giggle', 'tail': 'tail-no-no',
    }
    durations = {reaction: round(sf.info(output / (name + '.wav')).duration * 1000)
                 for reaction, name in names.items()}
    (output / 'durations.json').write_text(json.dumps(durations, indent=2) + '\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model-dir', type=Path, help='Existing Chatterbox Nano checkpoint directory')
    parser.add_argument('--seed', type=int, default=43)
    parser.add_argument('--only', choices=list(PROMPTS), help='Regenerate one voiced reaction')
    parser.add_argument('--remaster-only', action='store_true', help='Refinish cached raw cues without generating a different voice')
    args = parser.parse_args()
    output = CHARACTER / 'sounds'
    SCRATCH.mkdir(parents=True, exist_ok=True)
    output.mkdir(exist_ok=True)
    if args.remaster_only:
        for name in [args.only] if args.only else sorted(SOFT_VOICES):
            raw = SCRATCH / (name + '-raw.wav')
            if not raw.exists():
                raise FileNotFoundError(f'{raw}: regenerate the original cue before remastering')
            finish(raw, output / (name + '.wav'))
        write_durations(output)
        return
    import torch
    import soundfile as sf
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    torch.set_num_threads(4)
    giggle = CHARACTER / 'sources/interaction-giggle.wav'
    reference = CHARACTER / 'sources/interaction-voice-reference.wav'
    if not giggle.exists() or not reference.exists():
        raise FileNotFoundError('Extract the original animation reference first; see character-interactions.md')
    if not args.only:
        # Preserve actual laughter, not an adult voice reading laughter syllables.
        for name, tempo, loudness in [
            ('ear-chuckle', 1.07, -24),
            ('foot-giggle', 1.0, -22),
            ('belly-laugh', 0.92, -22),
        ]:
            sample = SCRATCH / (name + '-source.wav')
            ffmpeg('-i', giggle, sample)
            finish(sample, output / (name + '.wav'), tempo, loudness)
    if args.model_dir:
        model_path = args.model_dir
    else:
        from huggingface_hub import snapshot_download
        model_path = snapshot_download('ResembleAI/chatterbox-nano', allow_patterns=[
            't3_nano_v1.safetensors', 's3gen_meanflow.safetensors',
            've.safetensors', '*.json', '*.txt', 'conds.pt',
        ])
    model = ChatterboxTurboTTS.from_local(model_path, device='cpu', nano=True)
    # Runaway-generation guard, not a duration target. Complete short utterances
    # terminate naturally; no speech is trimmed or sped up to fit a time limit.
    model.t3.inference_turbo = partial(model.t3.inference_turbo, max_gen_len=450)
    # The checked-in reference is already normalized; preserve float32 with NumPy 2.
    model.prepare_conditionals(str(reference), norm_loudness=False)
    for index, (name, text) in enumerate(PROMPTS.items()):
        if args.only and args.only != name:
            continue
        torch.manual_seed(args.seed + index)
        print(f'Generating {name} with the animation voice reference', flush=True)
        start = time.monotonic()
        wav = model.generate(text, temperature=0.65)
        raw = SCRATCH / (name + '-raw.wav')
        sf.write(raw, wav.squeeze().numpy(), model.sr)
        finish(raw, output / (name + '.wav'))
        print(f'Generated in {time.monotonic()-start:.1f}s', flush=True)
    write_durations(output)


if __name__ == '__main__':
    main()

"""Derive compact touch regions from the shipped artwork, excluding white space.

Authoring only: requires Pillow, NumPy and SciPy. No image processing runs in-app.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing, binary_fill_holes, label

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'assets/characters/brownie'
STEP = 3
output = {}
for variant, name in [('vessel', 'vessel.png'), ('poster', 'poster.png')]:
    image = Image.open(ASSETS / ('sources/reaction-master-square-original.png' if variant == 'poster' else name)).convert('RGBA')
    rgba = np.asarray(image).astype(np.int16)
    red, green, blue, alpha = [rgba[:, :, i] for i in range(4)]
    mask = (alpha >= 32) & (np.minimum.reduce([red, green, blue]) < 235)
    if variant == 'poster':
        # The square video poster contains decorative grass and a small stump.
        # Neither belongs to Brownie's interactive silhouette.
        grass = (green > red + 12) & (green > blue + 12)
        mask &= ~grass
        mask[680:, :] = False
    mask = binary_closing(mask, structure=np.ones((3, 3)))
    components, count = label(mask)
    sizes = np.bincount(components.ravel())
    sizes[0] = 0
    mask = binary_fill_holes(components == sizes.argmax())
    rows = []
    for y in range(0, image.height, STEP):
        sampled = mask[min(y + STEP // 2, image.height - 1), STEP // 2::STEP]
        # Horizontal runs preserve gaps beside ears/legs rather than widening
        # each row to a rectangle around the entire image.
        padded = np.pad(sampled.astype(np.int8), (1, 1))
        edges = np.flatnonzero(np.diff(padded))
        rows.append(edges.tolist())
    output[variant] = {'width': image.width, 'height': image.height, 'step': STEP, 'rows': rows}
    preview = ROOT / '.expo/brownie-touch-masks'
    preview.mkdir(parents=True, exist_ok=True)
    background = Image.new('RGBA', image.size, 'white')
    background.alpha_composite(image)
    tint = Image.new('RGBA', image.size, (0, 140, 220, 100))
    background.alpha_composite(Image.composite(tint, Image.new('RGBA', image.size), Image.fromarray(mask.astype(np.uint8) * 255)))
    background.convert('RGB').save(preview / f'{variant}.png')

(ASSETS / 'touch-mask.json').write_text(json.dumps(output, separators=(',', ':')) + '\n')
print('Generated Brownie artwork touch masks')

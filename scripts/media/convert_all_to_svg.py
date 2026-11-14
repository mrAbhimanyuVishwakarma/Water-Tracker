import os
import glob
import vtracer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSETS_DIR = ROOT / 'assets/characters'
OUTPUT_TS = ROOT / 'src/constants/svgAssets.ts'

characters = ['brownie', 'dodo', 'mammoth', 'sloth', 'turtle', 'penguin']
images_to_convert = [
    (f'{ASSETS_DIR}/{character}/{artwork}.png',
     f'{ASSETS_DIR}/{character}/{artwork}.svg',
     ('CAPYBARA' if character == 'brownie' else character.upper()) + '_DONUT_FLOAT_SVG'
     if artwork == 'float' else character.upper() + '_SIPPING_SVG')
    for character in characters
    for artwork in ['float', 'vessel']
]

svg_exports = {}

for in_path, out_path, var_name in images_to_convert:
    if os.path.exists(out_path):
        print(f"Reading existing {out_path}...")
        with open(out_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
            svg_exports[var_name] = svg_content
        print(f"  [OK] Loaded {out_path} ({len(svg_content)} chars)")
    elif os.path.exists(in_path):
        print(f"Vectorizing {in_path} -> {out_path}...")
        vtracer.convert_image_to_svg_py(
            in_path,
            out_path,
            colormode='color',
            hierarchical='cutout',
            mode='spline',
            filter_speckle=10,
            color_precision=6,
            corner_threshold=60,
            path_precision=1
        )
        with open(out_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
            svg_exports[var_name] = svg_content
        print(f"  [OK] Saved {out_path} ({len(svg_content)} chars)")
    else:
        print(f"  [WARN] {in_path} does not exist")

# Generate TypeScript file exporting the SVG XML strings and a helper component
print("Writing TypeScript exports...")
with open(OUTPUT_TS, 'w', encoding='utf-8') as f:
    f.write("/**\n * Auto-generated Crisp Vector SVG Assets for Resolution-Independent Rendering\n */\n\n")
    for var_name, content in svg_exports.items():
        escaped = content.replace("`", "\\`").replace("${", "\\${")
        f.write(f"export const {var_name} = `{escaped}`;\n\n")

    f.write("// Float character mapping\n")
    f.write("export const FLOAT_SVGS: Record<string, string> = {\n")
    f.write("  brownie: CAPYBARA_DONUT_FLOAT_SVG,\n")
    f.write("  dodo: DODO_DONUT_FLOAT_SVG,\n")
    f.write("  mammoth: MAMMOTH_DONUT_FLOAT_SVG,\n")
    f.write("  sloth: SLOTH_DONUT_FLOAT_SVG,\n")
    f.write("  turtle: TURTLE_DONUT_FLOAT_SVG,\n")
    f.write("  penguin: PENGUIN_DONUT_FLOAT_SVG,\n")
    f.write("};\n\n")

    f.write("// Companion sipping avatar mapping\n")
    f.write("export const MASCOT_SIPPING_SVGS: Record<string, string> = {\n")
    f.write("  brownie: BROWNIE_SIPPING_SVG,\n")
    f.write("  dodo: DODO_SIPPING_SVG,\n")
    f.write("  mammoth: MAMMOTH_SIPPING_SVG,\n")
    f.write("  sloth: SLOTH_SIPPING_SVG,\n")
    f.write("  turtle: TURTLE_SIPPING_SVG,\n")
    f.write("  penguin: PENGUIN_SIPPING_SVG,\n")
    f.write("};\n")

print("All SVGs updated and exported to TS successfully!")

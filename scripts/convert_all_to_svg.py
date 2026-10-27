import os
import glob
import vtracer

ASSETS_DIR = 'assets'
OUTPUT_TS = 'src/constants/svgAssets.ts'

images_to_convert = [
    ('assets/capybara_donut_float.png', 'assets/capybara_donut_float.svg', 'CAPYBARA_DONUT_FLOAT_SVG'),
    ('assets/dodo_donut_float.png', 'assets/dodo_donut_float.svg', 'DODO_DONUT_FLOAT_SVG'),
    ('assets/mammoth_donut_float.png', 'assets/mammoth_donut_float.svg', 'MAMMOTH_DONUT_FLOAT_SVG'),
    ('assets/sloth_donut_float.png', 'assets/sloth_donut_float.svg', 'SLOTH_DONUT_FLOAT_SVG'),
    ('assets/turtle_donut_float.png', 'assets/turtle_donut_float.svg', 'TURTLE_DONUT_FLOAT_SVG'),
    ('assets/penguin_donut_float.png', 'assets/penguin_donut_float.svg', 'PENGUIN_DONUT_FLOAT_SVG'),
    ('assets/brownie_sipping.png', 'assets/brownie_sipping.svg', 'BROWNIE_SIPPING_SVG'),
    ('assets/dodo_sipping.png', 'assets/dodo_sipping.svg', 'DODO_SIPPING_SVG'),
    ('assets/mammoth_sipping.png', 'assets/mammoth_sipping.svg', 'MAMMOTH_SIPPING_SVG'),
    ('assets/sloth_sipping.png', 'assets/sloth_sipping.svg', 'SLOTH_SIPPING_SVG'),
    ('assets/turtle_sipping.png', 'assets/turtle_sipping.svg', 'TURTLE_SIPPING_SVG'),
    ('assets/penguin_sipping.png', 'assets/penguin_sipping.svg', 'PENGUIN_SIPPING_SVG'),
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

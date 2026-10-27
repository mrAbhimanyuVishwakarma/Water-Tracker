import os
from PIL import Image
import vtracer

assets = [
    (r"C:\Users\abhim\.gemini\antigravity-ide\brain\55c527fd-d298-4e08-839a-c9e61723558a\sloth_sipping_1793099073308.jpg", "sloth_sipping"),
    (r"C:\Users\abhim\.gemini\antigravity-ide\brain\55c527fd-d298-4e08-839a-c9e61723558a\turtle_sipping_1793099127023.jpg", "turtle_sipping"),
    (r"C:\Users\abhim\.gemini\antigravity-ide\brain\55c527fd-d298-4e08-839a-c9e61723558a\penguin_sipping_1793099155618.jpg", "penguin_sipping"),
]

for src, name in assets:
    png_out = f"assets/{name}.png"
    svg_out = f"assets/{name}.svg"
    
    # 1. Save as PNG
    im = Image.open(src).convert("RGBA")
    im.save(png_out, "PNG", optimize=True)
    print(f"[OK] Saved {png_out}")

    # 2. Vectorize to SVG
    vtracer.convert_image_to_svg_py(
        png_out,
        svg_out,
        colormode='color',
        hierarchical='cutout',
        mode='spline',
        filter_speckle=10,
        color_precision=6,
        corner_threshold=60,
        path_precision=1
    )
    print(f"[OK] Saved {svg_out}")

print("All new sipping assets processed!")

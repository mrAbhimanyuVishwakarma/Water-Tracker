import os
from PIL import Image

donut_src = r"C:\Users\abhim\.gemini\antigravity-ide\brain\55c527fd-d298-4e08-839a-c9e61723558a\capybara_donut_float_1793079882985.jpg"
sipping_src = r"C:\Users\abhim\.gemini\antigravity-ide\brain\55c527fd-d298-4e08-839a-c9e61723558a\brownie_sipping_water_1793079923153.jpg"

os.makedirs("assets", exist_ok=True)

def make_transparent(src_path, dest_path, threshold=245):
    img = Image.open(src_path).convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        # Check if near white
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    img.save(dest_path, "PNG")
    print(f"Saved transparent PNG: {dest_path} ({os.path.getsize(dest_path)} bytes)")

make_transparent(donut_src, os.path.join("assets", "capybara_donut_float.png"))
make_transparent(sipping_src, os.path.join("assets", "brownie_sipping.png"))

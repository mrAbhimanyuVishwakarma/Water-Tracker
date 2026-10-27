import os
from PIL import Image

def extract_contour(image_path, target_width=270, target_height=330):
    im = Image.open(image_path).convert('RGB')
    im.thumbnail((target_width - 24, target_height - 24), Image.Resampling.LANCZOS)
    
    canvas = Image.new('RGB', (target_width, target_height), (255, 255, 255))
    offset_x = (target_width - im.width) // 2
    offset_y = (target_height - im.height) // 2 + 8
    canvas.paste(im, (offset_x, offset_y))
    
    pixels = canvas.load()
    w, h = canvas.size
    
    left_points = []
    right_points = []
    
    for y in range(10, h - 10, 6):
        min_x = None
        max_x = None
        for x in range(w):
            r, g, b = pixels[x, y]
            # Character sticker is non-white
            if r < 240 or g < 240 or b < 240:
                if min_x is None:
                    min_x = x
                max_x = x
        if min_x is not None:
            left_points.append((min_x - 3, y))
            right_points.append((max_x + 3, y))
            
    if not left_points:
        return ""
        
    points = left_points + list(reversed(right_points))
    path_cmds = [f"M {points[0][0]:.1f} {points[0][1]:.1f}"]
    for p in points[1:]:
        path_cmds.append(f"L {p[0]:.1f} {p[1]:.1f}")
    path_cmds.append("Z")
    
    return " ".join(path_cmds)

contours = {}
for mascot in ['sloth', 'turtle', 'penguin']:
    path = f"assets/{mascot}_sipping.png"
    if os.path.exists(path):
        c = extract_contour(path)
        contours[mascot] = c
        print(f"[OK] Contour for {mascot}: {len(c)} chars")

with open('scripts/legacy/generated/new_mascot_contours.py', 'w') as f:
    f.write(f"MASCOT_CONTOURS = {repr(contours)}\n")

print("Done extracting contours!")

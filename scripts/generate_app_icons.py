import os
from PIL import Image, ImageOps, ImageDraw

SOURCE_IMAGE = r"C:\Users\abhim\.gemini\antigravity-ide\brain\55c527fd-d298-4e08-839a-c9e61723558a\app_icon_fullbleed_1793098637452.jpg"
ASSETS_DIR = "assets"

def process_icons():
    if not os.path.exists(SOURCE_IMAGE):
        print(f"Error: {SOURCE_IMAGE} not found")
        return

    img = Image.open(SOURCE_IMAGE).convert("RGBA")
    w, h = img.size
    print(f"Loaded source image: {w}x{h}")

    # Fix corners: replace any white/corner pixels near the 4 corners with nearby water color
    # The corner radius is around 80px out of 1024px.
    # We can sample the water color from inside (e.g. at (120, 120)) and paint over any white corners
    corner_size = 90
    pixels = img.load()

    # Determine water colors near each corner
    tl_color = pixels[corner_size + 10, corner_size + 10]
    tr_color = pixels[w - corner_size - 10, corner_size + 10]
    bl_color = pixels[corner_size + 10, h - corner_size - 10]
    br_color = pixels[w - corner_size - 10, h - corner_size - 10]

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Detect white or transparent corner border pixels
            if r > 245 and g > 245 and b > 245:
                if x < corner_size and y < corner_size:
                    pixels[x, y] = tl_color
                elif x > w - corner_size and y < corner_size:
                    pixels[x, y] = tr_color
                elif x < corner_size and y > h - corner_size:
                    pixels[x, y] = bl_color
                elif x > w - corner_size and y > h - corner_size:
                    pixels[x, y] = br_color

    # 1. Main App Icon (1024x1024 PNG)
    icon_1024 = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    icon_1024.save(os.path.join(ASSETS_DIR, "icon.png"), "PNG", optimize=True)
    print("[OK] Saved assets/icon.png (1024x1024)")

    # 2. Favicon (192x192 PNG for crisp web & browser tabs)
    favicon = img.resize((192, 192), Image.Resampling.LANCZOS)
    favicon.save(os.path.join(ASSETS_DIR, "favicon.png"), "PNG", optimize=True)
    print("[OK] Saved assets/favicon.png (192x192)")

    # 3. Splash Icon (512x512)
    splash_icon = img.resize((512, 512), Image.Resampling.LANCZOS)
    splash_icon.save(os.path.join(ASSETS_DIR, "splash-icon.png"), "PNG", optimize=True)
    print("[OK] Saved assets/splash-icon.png (512x512)")

    # 4. Android Adaptive Icons
    # Android Adaptive background: 1024x1024 background
    icon_1024.save(os.path.join(ASSETS_DIR, "android-icon-background.png"), "PNG", optimize=True)
    print("[OK] Saved assets/android-icon-background.png")

    # Android Adaptive foreground: character scaled to fit inside 66% safe zone (center 660x660 in 1024x1024)
    # Create transparent canvas 1024x1024
    foreground = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    # We place the circular masked or bounded capybara in center
    scaled_subject = img.resize((760, 760), Image.Resampling.LANCZOS)
    # Circular mask with smooth edges
    mask = Image.new("L", (760, 760), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((10, 10, 750, 750), fill=255)
    
    # Smooth slight shadow/glow
    offset_x = (1024 - 760) // 2
    offset_y = (1024 - 760) // 2
    foreground.paste(scaled_subject, (offset_x, offset_y), mask)
    foreground.save(os.path.join(ASSETS_DIR, "android-icon-foreground.png"), "PNG", optimize=True)
    print("[OK] Saved assets/android-icon-foreground.png")

    # Monochrome icon for Android 13+ theming (grayscale mask)
    mono = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    mono_mask = mask.resize((720, 720), Image.Resampling.LANCZOS)
    mono_draw = Image.new("RGBA", (720, 720), (255, 255, 255, 255))
    mono_offset = (1024 - 720) // 2
    mono.paste(mono_draw, (mono_offset, mono_offset), mono_mask)
    mono.save(os.path.join(ASSETS_DIR, "android-icon-monochrome.png"), "PNG", optimize=True)
    print("[OK] Saved assets/android-icon-monochrome.png")

    print("\nAll app icons and favicons generated and saved successfully!")

if __name__ == "__main__":
    process_icons()

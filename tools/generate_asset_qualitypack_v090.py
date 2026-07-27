from __future__ import annotations

from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance
from pathlib import Path
import colorsys
import json
import math
import random
import shutil

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = PROJECT_ROOT / 'public' / 'assets'
QUALITY_ROOT = ASSET_ROOT / 'atlases' / 'quality'
SOURCE_ROOT = PROJECT_ROOT / 'art_source' / 'v0.9.0'
RNG = random.Random(9072026)
VERSION = '0.9.0'

REGIONS = [
    ('verdant_rift', 0.36, (23, 58, 52), (102, 215, 153)),
    ('sunken_dunes', 0.10, (60, 33, 24), (244, 177, 86)),
    ('frost_citadel', 0.56, (20, 35, 64), (142, 222, 255)),
    ('ember_foundry', 0.01, (48, 15, 21), (255, 91, 43)),
    ('neon_arcology', 0.73, (19, 18, 54), (180, 92, 255)),
]

SCHOOLS = ['fire', 'frost', 'storm', 'void', 'nature', 'radiant', 'physical', 'arcane', 'shadow', 'tech']
ITEM_TYPES = ['blade', 'greatsword', 'spear', 'bow', 'staff', 'focus', 'helm', 'armor', 'boots', 'ring', 'amulet', 'relic']
PROP_TYPES = ['tree', 'rock', 'ruin', 'crystal', 'shrine', 'machine', 'banner', 'chest', 'portal', 'lamp']


def rgb_hsv(h: float, s: float, v: float, a: int = 255) -> tuple[int, int, int, int]:
    r, g, b = colorsys.hsv_to_rgb(h % 1.0, max(0.0, min(1.0, s)), max(0.0, min(1.0, v)))
    return int(r * 255), int(g * 255), int(b * 255), a


def frame_meta(x: int, y: int, w: int, h: int, anchor=(0.5, 0.5)) -> dict:
    return {
        'frame': {'x': x, 'y': y, 'w': w, 'h': h},
        'rotated': False,
        'trimmed': False,
        'spriteSourceSize': {'x': 0, 'y': 0, 'w': w, 'h': h},
        'sourceSize': {'w': w, 'h': h},
        'anchor': {'x': anchor[0], 'y': anchor[1]},
    }


def ensure_clean() -> None:
    shutil.rmtree(QUALITY_ROOT, ignore_errors=True)
    shutil.rmtree(SOURCE_ROOT, ignore_errors=True)
    QUALITY_ROOT.mkdir(parents=True, exist_ok=True)
    SOURCE_ROOT.mkdir(parents=True, exist_ok=True)


def save_webp(image: Image.Image, path: Path, quality: int = 90) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, 'WEBP', quality=quality, method=3, lossless=False, exact=True)
    return path.stat().st_size


def save_png(image: Image.Image, path: Path) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, 'PNG', optimize=False, compress_level=0)
    return path.stat().st_size


def save_atlas(
    relative_dir: str,
    base_name: str,
    tiles: list[tuple[str, Image.Image]],
    cols: int,
    quality: int = 90,
    animations: dict[str, list[str]] | None = None,
    tags: list[str] | None = None,
) -> dict:
    if not tiles:
        raise ValueError(base_name)
    width = max(tile.width for _, tile in tiles)
    height = max(tile.height for _, tile in tiles)
    rows = math.ceil(len(tiles) / cols)
    atlas = Image.new('RGBA', (cols * width, rows * height), (0, 0, 0, 0))
    frames: dict[str, dict] = {}
    for index, (name, tile) in enumerate(tiles):
        x = (index % cols) * width
        y = (index // cols) * height
        atlas.alpha_composite(tile, (x, y))
        frames[name] = frame_meta(x, y, width, height)
    out = QUALITY_ROOT / relative_dir
    out.mkdir(parents=True, exist_ok=True)
    image_name = f'{base_name}.webp'
    image_path = out / image_name
    save_webp(atlas, image_path, quality=quality)
    payload = {
        'frames': frames,
        'animations': animations or {},
        'meta': {
            'app': 'LUMERIFT quality asset generator',
            'version': VERSION,
            'qualityStage': 'production-candidate-procedural',
            'image': image_name,
            'format': 'RGBA8888',
            'size': {'w': atlas.width, 'h': atlas.height},
            'scale': '1',
            'tags': tags or [],
        },
    }
    json_path = out / f'{base_name}.json'
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    return {
        'json': str(json_path.relative_to(ASSET_ROOT)).replace('\\', '/'),
        'image': str(image_path.relative_to(ASSET_ROOT)).replace('\\', '/'),
        'frames': len(frames),
        'animations': len(animations or {}),
        'bytes': image_path.stat().st_size + json_path.stat().st_size,
        'size': [atlas.width, atlas.height],
    }


def gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    w, h = size
    im = Image.new('RGB', size, top)
    d = ImageDraw.Draw(im)
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        d.line((0, y, w, y), fill=c)
    return im.convert('RGBA')


def texture_overlay(size: tuple[int, int], seed: int, strength: float = 0.14, blur: float = 0.7) -> Image.Image:
    random.seed(seed)
    w, h = size
    small = (max(96, w // 4), max(96, h // 4))
    noise = Image.effect_noise(small, 42 + seed % 30).convert('L')
    if blur > 0:
        noise = noise.filter(ImageFilter.GaussianBlur(max(0.2, blur * 0.5)))
    noise = noise.resize(size, Image.Resampling.BILINEAR)
    colored = Image.merge('RGBA', (noise, noise, noise, Image.new('L', size, int(255 * strength))))
    return colored


def vignette(size: tuple[int, int], opacity: int = 170) -> Image.Image:
    w, h = size
    small = (max(96, w // 4), max(96, h // 4))
    sw, sh = small
    mask = Image.new('L', small, 0)
    d = ImageDraw.Draw(mask)
    margin = int(min(sw, sh) * 0.08)
    d.ellipse((-margin, -margin, sw + margin, sh + margin), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(max(4, int(min(sw, sh) * 0.18))))
    inv = ImageChops.invert(mask)
    inv = ImageEnhance.Contrast(inv).enhance(1.4).resize(size, Image.Resampling.BILINEAR)
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    layer.putalpha(inv.point(lambda p: int(p * opacity / 255)))
    return layer


def glow(size: tuple[int, int], center: tuple[float, float], radius: float, color: tuple[int, int, int, int]) -> Image.Image:
    w, h = size
    scale = 0.25
    sw, sh = max(64, int(w * scale)), max(64, int(h * scale))
    x, y = center[0] * scale, center[1] * scale
    rr = radius * scale
    layer = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=color)
    layer = layer.filter(ImageFilter.GaussianBlur(max(2, int(rr * 0.45))))
    return layer.resize(size, Image.Resampling.BILINEAR)


def line_glow(size: tuple[int, int], points: list[tuple[float, float]], color: tuple[int, int, int, int], width: int) -> Image.Image:
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.line(points, fill=color, width=width, joint='curve')
    blurred = layer.filter(ImageFilter.GaussianBlur(max(2, width // 2)))
    blurred.alpha_composite(layer)
    return blurred


def region_scene(region_index: int, variant: int, size: tuple[int, int], detailed: bool = True) -> Image.Image:
    name, hue, dark, accent = REGIONS[region_index]
    w, h = size
    local = random.Random(9000 + region_index * 100 + variant)
    bottom = tuple(min(255, int(v * 0.72 + 28)) for v in accent)
    im = gradient(size, dark, bottom)
    im.alpha_composite(texture_overlay(size, 18000 + region_index * 100 + variant, 0.12 if detailed else 0.07))
    im.alpha_composite(glow(size, (w * (0.28 + 0.12 * variant), h * 0.28), min(w, h) * 0.34, (*accent, 110)))
    d = ImageDraw.Draw(im, 'RGBA')

    # Distant silhouettes and layered atmosphere.
    horizon = int(h * 0.53)
    for layer_index in range(5):
        alpha = 40 + layer_index * 22
        base_y = horizon + layer_index * int(h * 0.05)
        points = [(-40, h)]
        step = max(40, w // 9)
        for x in range(-40, w + 80, step):
            peak = base_y - local.randint(int(h * 0.04), int(h * (0.16 + layer_index * 0.025)))
            points.append((x, peak))
        points.extend([(w + 40, h), (-40, h)])
        layer_color = rgb_hsv(hue + layer_index * 0.012, 0.55, 0.12 + layer_index * 0.045, alpha)
        d.polygon(points, fill=layer_color)

    # Main path / rift.
    path = [
        (w * 0.50, h * 1.04),
        (w * (0.31 + variant * 0.05), h * 0.80),
        (w * (0.63 - variant * 0.04), h * 0.62),
        (w * (0.43 + variant * 0.03), h * 0.43),
        (w * (0.54 - variant * 0.02), h * 0.19),
    ]
    im.alpha_composite(line_glow(size, path, (*accent, 74), max(22, w // 8)))
    d.line(path, fill=(148, 137, 131, 130), width=max(26, w // 7), joint='curve')
    d.line(path, fill=(225, 220, 208, 42), width=max(10, w // 13), joint='curve')

    # Region-specific structures.
    count = 70 if detailed else 34
    for i in range(count):
        x = local.randint(-20, w + 20)
        y = local.randint(int(h * 0.28), int(h * 0.92))
        s = local.randint(max(7, w // 80), max(18, w // 25))
        depth = 0.45 + 0.55 * (y / h)
        alpha = int(80 + 135 * depth)
        if region_index == 0:
            trunk = (45, 29, 24, alpha)
            leaf = rgb_hsv(hue + local.uniform(-0.04, 0.04), 0.68, 0.34 + depth * 0.2, alpha)
            d.rectangle((x - s * 0.12, y - s * 1.5, x + s * 0.12, y + s), fill=trunk)
            for ox, oy, rr in [(-0.5, -1.2, 0.8), (0.35, -1.4, 0.75), (0, -1.8, 0.7)]:
                d.ellipse((x + s * ox - s * rr, y + s * oy - s * rr, x + s * ox + s * rr, y + s * oy + s * rr), fill=leaf)
        elif region_index == 1:
            d.polygon([(x - s, y + s), (x - s * 0.65, y - s), (x + s * 0.5, y - s * 1.4), (x + s, y + s)], fill=(126, 87, 53, alpha))
            d.rectangle((x - s * 0.2, y - s * 0.9, x + s * 0.2, y + s), fill=(208, 152, 82, alpha))
        elif region_index == 2:
            ice = (174, 226, 255, alpha)
            d.polygon([(x - s, y + s), (x - s * 0.2, y - s * 1.8), (x + s * 0.8, y + s)], fill=ice)
            d.line((x - s * 0.2, y - s * 1.7, x + s * 0.2, y + s * 0.8), fill=(245, 252, 255, alpha), width=max(1, s // 7))
        elif region_index == 3:
            d.polygon([(x - s, y + s), (x - s * 0.4, y - s), (x + s * 0.2, y - s * 1.6), (x + s, y + s)], fill=(54, 19, 22, alpha))
            if i % 3 == 0:
                im.alpha_composite(glow(size, (x, y - s), max(6, s * 0.6), (255, 91, 43, min(150, alpha))), (0, 0))
        else:
            building = rgb_hsv(hue + local.uniform(-0.05, 0.05), 0.62, 0.31 + depth * 0.2, alpha)
            d.rounded_rectangle((x - s * 0.42, y - s * 2.3, x + s * 0.42, y + s), radius=max(2, s // 6), fill=building)
            d.line((x - s * 0.32, y - s * 1.3, x + s * 0.32, y - s * 1.3), fill=(*accent, alpha), width=max(1, s // 8))

    # Rift rings, motes, and foreground framing.
    cx, cy = w * (0.50 + (variant - 1) * 0.05), h * 0.34
    for ring in range(5):
        rr = min(w, h) * (0.055 + ring * 0.035)
        d.ellipse((cx - rr, cy - rr * 0.78, cx + rr, cy + rr * 0.78), outline=(*accent, 170 - ring * 24), width=max(2, w // 220))
    for _ in range(180 if detailed else 70):
        x = local.randrange(w)
        y = local.randrange(h)
        r = local.randint(1, max(2, w // 220))
        d.ellipse((x - r, y - r, x + r, y + r), fill=(*accent, local.randint(25, 125)))

    # Foreground shapes.
    d.polygon([(0, h), (0, h * 0.70), (w * 0.12, h * 0.82), (w * 0.18, h)], fill=(4, 8, 16, 180))
    d.polygon([(w, h), (w, h * 0.66), (w * 0.86, h * 0.80), (w * 0.79, h)], fill=(4, 8, 16, 190))
    im.alpha_composite(vignette(size, 175))
    return im


def draw_face(d: ImageDraw.ImageDraw, cx: int, cy: int, scale: float, palette: dict, style: int) -> None:
    skin = palette['skin']
    hair = palette['hair']
    eye = palette['eye']
    d.ellipse((cx - 42 * scale, cy - 52 * scale, cx + 42 * scale, cy + 52 * scale), fill=skin)
    # Jaw/face shaping.
    d.polygon([(cx - 38 * scale, cy + 12 * scale), (cx - 20 * scale, cy + 58 * scale), (cx, cy + 70 * scale), (cx + 20 * scale, cy + 58 * scale), (cx + 38 * scale, cy + 12 * scale)], fill=skin)
    # Hair silhouette.
    if style % 4 == 0:
        d.polygon([(cx - 50*scale, cy - 30*scale), (cx - 30*scale, cy - 70*scale), (cx + 12*scale, cy - 82*scale), (cx + 54*scale, cy - 42*scale), (cx + 38*scale, cy - 5*scale), (cx - 40*scale, cy - 2*scale)], fill=hair)
    elif style % 4 == 1:
        d.pieslice((cx - 58*scale, cy - 80*scale, cx + 58*scale, cy + 25*scale), 180, 360, fill=hair)
        d.polygon([(cx - 55*scale, cy - 25*scale), (cx - 65*scale, cy + 80*scale), (cx - 32*scale, cy + 45*scale)], fill=hair)
    elif style % 4 == 2:
        for i in range(7):
            x = cx - 48*scale + i*16*scale
            d.polygon([(x, cy - 35*scale), (x + 12*scale, cy - 92*scale), (x + 24*scale, cy - 28*scale)], fill=hair)
    else:
        d.ellipse((cx - 58*scale, cy - 85*scale, cx + 58*scale, cy + 15*scale), fill=hair)
        d.rectangle((cx - 58*scale, cy - 30*scale, cx - 40*scale, cy + 70*scale), fill=hair)
        d.rectangle((cx + 40*scale, cy - 30*scale, cx + 58*scale, cy + 70*scale), fill=hair)
    # Eyes and highlights.
    d.line((cx - 26*scale, cy + 2*scale, cx - 6*scale, cy), fill=(30, 23, 30, 255), width=max(1, int(3*scale)))
    d.line((cx + 6*scale, cy, cx + 26*scale, cy + 2*scale), fill=(30, 23, 30, 255), width=max(1, int(3*scale)))
    d.ellipse((cx - 20*scale, cy - 2*scale, cx - 12*scale, cy + 6*scale), fill=eye)
    d.ellipse((cx + 12*scale, cy - 2*scale, cx + 20*scale, cy + 6*scale), fill=eye)
    d.line((cx - 8*scale, cy + 28*scale, cx + 9*scale, cy + 28*scale), fill=(125, 55, 70, 220), width=max(1, int(2*scale)))


def portrait(kind: str, index: int, size: tuple[int, int]) -> Image.Image:
    w, h = size
    local = random.Random(23000 + hash(kind) % 1000 + index)
    hue = (0.54 + index * 0.073 + {'hero': 0.0, 'boss': 0.42, 'npc': 0.15}.get(kind, 0)) % 1
    accent = rgb_hsv(hue, 0.68, 1.0, 255)
    dark = rgb_hsv(hue, 0.55, 0.12, 255)
    im = gradient(size, (4, 7, 16), dark[:3])
    im.alpha_composite(texture_overlay(size, 21000 + index, 0.11, 0.5))
    im.alpha_composite(glow(size, (w * 0.5, h * 0.34), min(w, h) * 0.42, (*accent[:3], 115)))
    d = ImageDraw.Draw(im, 'RGBA')

    cx = w // 2
    body_y = int(h * 0.70)
    scale = min(w / 512, h / 768)
    if kind == 'boss':
        # Large creature silhouette with asymmetry and armor.
        head_y = int(h * 0.34)
        body_color = rgb_hsv(hue + 0.03, 0.62, 0.23, 255)
        d.ellipse((cx - 100*scale, head_y - 105*scale, cx + 100*scale, head_y + 95*scale), fill=body_color, outline=accent, width=max(2, int(5*scale)))
        horn = rgb_hsv(hue - 0.05, 0.35, 0.85, 255)
        d.polygon([(cx - 70*scale, head_y - 65*scale), (cx - 150*scale, head_y - 180*scale), (cx - 100*scale, head_y - 20*scale)], fill=horn)
        d.polygon([(cx + 70*scale, head_y - 65*scale), (cx + 150*scale, head_y - 180*scale), (cx + 100*scale, head_y - 20*scale)], fill=horn)
        d.ellipse((cx - 62*scale, head_y - 15*scale, cx - 22*scale, head_y + 20*scale), fill=accent)
        d.ellipse((cx + 22*scale, head_y - 15*scale, cx + 62*scale, head_y + 20*scale), fill=accent)
        d.polygon([(cx - 46*scale, head_y + 48*scale), (cx, head_y + 90*scale), (cx + 46*scale, head_y + 48*scale)], fill=(7, 4, 8, 255))
        armor = rgb_hsv(hue + 0.08, 0.48, 0.36, 255)
        d.polygon([(cx - 190*scale, body_y - 120*scale), (cx - 95*scale, body_y - 210*scale), (cx + 95*scale, body_y - 210*scale), (cx + 190*scale, body_y - 120*scale), (cx + 150*scale, h), (cx - 150*scale, h)], fill=armor, outline=accent, width=max(3, int(6*scale)))
        for side in (-1, 1):
            d.polygon([(cx + side*105*scale, body_y - 185*scale), (cx + side*220*scale, body_y - 130*scale), (cx + side*165*scale, body_y - 60*scale)], fill=rgb_hsv(hue, 0.45, 0.52, 255))
        for _ in range(24):
            x = local.randint(int(cx - 160*scale), int(cx + 160*scale))
            y = local.randint(int(body_y - 180*scale), h)
            rr = local.randint(2, max(3, int(7*scale)))
            d.ellipse((x-rr, y-rr, x+rr, y+rr), fill=(*accent[:3], local.randint(50, 150)))
    else:
        # Human silhouette and clothing.
        skin_options = [(235, 190, 161, 255), (181, 121, 87, 255), (238, 208, 178, 255), (133, 84, 67, 255)]
        hair_options = [(18, 23, 36, 255), (91, 45, 30, 255), (222, 215, 195, 255), (44, 32, 78, 255), (28, 88, 94, 255)]
        palette = {
            'skin': skin_options[index % len(skin_options)],
            'hair': hair_options[(index * 3) % len(hair_options)],
            'eye': accent,
        }
        shoulder = int(112 * scale if kind == 'hero' else 92 * scale)
        armor = rgb_hsv(hue + 0.04, 0.46, 0.34 if kind == 'hero' else 0.27, 255)
        cloth = rgb_hsv(hue - 0.06, 0.58, 0.22, 255)
        d.polygon([(cx - shoulder, body_y - 110*scale), (cx - shoulder*1.45, h), (cx + shoulder*1.45, h), (cx + shoulder, body_y - 110*scale), (cx, body_y - 175*scale)], fill=cloth)
        d.polygon([(cx - shoulder, body_y - 105*scale), (cx - 45*scale, body_y - 165*scale), (cx + 45*scale, body_y - 165*scale), (cx + shoulder, body_y - 105*scale), (cx + 72*scale, h), (cx - 72*scale, h)], fill=armor, outline=accent, width=max(2, int(4*scale)))
        # Armor panels.
        for p in range(4):
            yy = body_y - 60*scale + p * 48*scale
            d.line((cx - 65*scale, yy, cx + 65*scale, yy), fill=(*accent[:3], 110), width=max(1, int(3*scale)))
        draw_face(d, cx, int(h * 0.34), scale, palette, index)
        # Weapon / class silhouette.
        if kind == 'hero':
            angle = -0.72 + (index % 3) * 0.18
            vx, vy = math.cos(angle), math.sin(angle)
            x1, y1 = cx + 50*scale, body_y - 20*scale
            x2, y2 = x1 + vx * 260*scale, y1 + vy * 260*scale
            d.line((x1, y1, x2, y2), fill=(230, 239, 250, 255), width=max(4, int(12*scale)))
            d.line((x1, y1, x2, y2), fill=accent, width=max(2, int(4*scale)))
        else:
            badge_x = cx + int(70*scale)
            badge_y = body_y - int(120*scale)
            d.regular_polygon((badge_x, badge_y, 18*scale), n_sides=6, fill=accent)
    # Decorative frame and particles.
    for ring in range(3):
        margin = int((18 + ring * 11) * scale)
        d.rounded_rectangle((margin, margin, w - margin, h - margin), radius=int(24*scale), outline=(*accent[:3], 90 - ring*18), width=max(1, int(3*scale)))
    for _ in range(110):
        x = local.randrange(w); y = local.randrange(h)
        r = local.randint(1, max(2, int(3*scale)))
        d.ellipse((x-r, y-r, x+r, y+r), fill=(*accent[:3], local.randint(20, 105)))
    im.alpha_composite(vignette(size, 145))
    return im


def icon_tile(category: str, index: int, size: int = 160) -> Image.Image:
    local = random.Random(30000 + index + hash(category) % 999)
    base_hue = (ITEM_TYPES.index(category) / len(ITEM_TYPES) + index * 0.013) % 1.0
    accent = rgb_hsv(base_hue, 0.68, 1.0, 255)
    secondary = rgb_hsv(base_hue + 0.10, 0.42, 0.84, 255)
    im = gradient((size, size), (5, 8, 17), rgb_hsv(base_hue, 0.55, 0.16)[:3])
    im.alpha_composite(texture_overlay((size, size), 31000 + index, 0.10, 0.35))
    im.alpha_composite(glow((size, size), (size * 0.5, size * 0.47), size * 0.34, (*accent[:3], 100)))
    d = ImageDraw.Draw(im, 'RGBA')
    d.rounded_rectangle((7, 7, size-8, size-8), radius=28, fill=(4, 8, 18, 172), outline=accent, width=5)
    d.rounded_rectangle((15, 15, size-16, size-16), radius=22, outline=(*secondary[:3], 130), width=2)
    cx = cy = size // 2
    mode = ITEM_TYPES.index(category)
    metal = (215, 226, 237, 255)
    dark = rgb_hsv(base_hue, 0.55, 0.28, 255)
    if mode <= 5:
        # Weapon silhouettes.
        angle = -0.85 + (index % 7) * 0.04
        vx, vy = math.cos(angle), math.sin(angle)
        length = size * (0.31 + (index % 4) * 0.025)
        d.line((cx-vx*length, cy-vy*length, cx+vx*length, cy+vy*length), fill=metal, width=13)
        d.line((cx-vx*length, cy-vy*length, cx+vx*length, cy+vy*length), fill=accent, width=4)
        d.line((cx-vy*32, cy+vx*32, cx+vy*32, cy-vx*32), fill=secondary, width=12)
        if mode in (2, 4):
            d.ellipse((cx-30, cy-30, cx+30, cy+30), outline=accent, width=7)
        if mode == 3:
            d.arc((35, 25, size-35, size-25), 70, 290, fill=metal, width=10)
            d.line((55, 35, size-55, size-35), fill=accent, width=4)
    elif mode in (6, 7, 8):
        if mode == 6:
            d.pieslice((45, 35, size-45, size-35), 180, 360, fill=dark, outline=accent, width=6)
            d.rectangle((50, 92, size-50, 130), fill=dark, outline=accent, width=5)
        elif mode == 7:
            d.polygon([(cx, 30), (size-40, 65), (size-52, size-40), (cx, size-18), (52, size-40), (40, 65)], fill=dark, outline=accent)
            d.line((cx, 38, cx, size-34), fill=secondary, width=5)
        else:
            d.polygon([(45, 42), (size-45, 42), (size-60, size-28), (cx, size-8), (60, size-28)], fill=dark, outline=accent)
            d.line((65, 78, size-65, 78), fill=secondary, width=6)
    else:
        sides = 5 + (index % 3)
        d.regular_polygon((cx, cy, size*0.30), n_sides=sides, rotation=index*7, fill=dark, outline=accent, width=6)
        d.regular_polygon((cx, cy, size*0.16), n_sides=6, rotation=-index*9, fill=secondary)
        d.ellipse((cx-18, cy-18, cx+18, cy+18), fill=(245, 250, 255, 230))
    # Micro details and edge shine.
    for _ in range(26):
        x = local.randint(20, size-20); y = local.randint(20, size-20)
        r = local.randint(1, 4)
        d.ellipse((x-r, y-r, x+r, y+r), fill=(*accent[:3], local.randint(25, 90)))
    d.arc((22, 18, size-22, size-18), 200, 330, fill=(255,255,255,100), width=3)
    return im


def skill_icon(school: str, index: int, size: int = 160) -> Image.Image:
    school_index = SCHOOLS.index(school)
    hue = (school_index / len(SCHOOLS) + index * 0.009) % 1
    accent = rgb_hsv(hue, 0.70, 1.0, 255)
    secondary = rgb_hsv(hue + 0.12, 0.35, 1.0, 230)
    im = gradient((size, size), (5, 7, 17), rgb_hsv(hue, 0.64, 0.18)[:3])
    im.alpha_composite(texture_overlay((size, size), 40000 + school_index * 100 + index, 0.10, 0.4))
    im.alpha_composite(glow((size, size), (size/2, size/2), size*0.38, (*accent[:3], 130)))
    d = ImageDraw.Draw(im, 'RGBA')
    d.rounded_rectangle((7,7,size-8,size-8), radius=31, fill=(4,8,18,165), outline=accent, width=5)
    cx=cy=size//2
    mode=index%12
    if mode == 0:
        d.polygon([(cx, 25),(cx+24,75),(cx+55,106),(cx+15,165),(cx-38,145),(cx-55,95)], fill=accent)
    elif mode == 1:
        for r in (28,50,72): d.arc((cx-r,cy-r,cx+r,cy+r),20+index*7,285+index*7,fill=accent,width=8)
    elif mode == 2:
        d.line((35,155,73,98,60,82,118,25,102,88,158,75,118,160),fill=accent,width=14,joint='curve')
    elif mode == 3:
        d.regular_polygon((cx,cy,70),n_sides=3+index%6,rotation=index*11,outline=accent,width=9)
        d.regular_polygon((cx,cy,35),n_sides=6,rotation=-index*13,fill=secondary)
    elif mode == 4:
        d.ellipse((32,32,size-32,size-32),outline=accent,width=12)
        d.line((cx,38,cx,size-38),fill=secondary,width=8)
        d.line((38,cy,size-38,cy),fill=secondary,width=8)
    elif mode == 5:
        for a in range(0,360,30):
            d.line((cx,cy,cx+math.cos(math.radians(a))*72,cy+math.sin(math.radians(a))*72),fill=accent,width=7)
        d.ellipse((cx-22,cy-22,cx+22,cy+22),fill=(255,255,255,235))
    elif mode == 6:
        d.arc((22,30,size-22,size-22),195,350,fill=accent,width=18)
        d.arc((35,18,size-35,size-35),25,175,fill=secondary,width=10)
    elif mode == 7:
        for p in range(5):
            r=24+p*13; d.arc((cx-r,cy-r,cx+r,cy+r),p*49,p*49+145,fill=accent,width=7)
    elif mode == 8:
        d.polygon([(cx,20),(160,75),(145,150),(cx,175),(47,150),(32,75)],outline=accent,width=10)
        d.ellipse((70,70,122,122),fill=secondary)
    elif mode == 9:
        d.line((35,145,157,47),fill=accent,width=16)
        d.line((47,158,145,35),fill=secondary,width=9)
    elif mode == 10:
        for r in range(18,78,18): d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=accent,width=6)
    else:
        d.polygon([(25,96),(72,36),(96,70),(120,36),(167,96),(120,156),(96,122),(72,156)],fill=accent)
    d.arc((18,18,size-18,size-18),195,330,fill=(255,255,255,100),width=3)
    return im


def prop_tile(prop_type: str, index: int, region_index: int, size: int = 192) -> Image.Image:
    local = random.Random(50000 + region_index*1000 + index)
    _, hue, dark, accent_rgb = REGIONS[region_index]
    accent = (*accent_rgb,255)
    im=Image.new('RGBA',(size,size),(0,0,0,0))
    im.alpha_composite(glow((size,size),(size/2,size*0.57),size*0.30,(*accent_rgb,75)))
    d=ImageDraw.Draw(im,'RGBA'); cx=size//2; base=int(size*0.80)
    # shadow
    d.ellipse((40,base-8,size-40,base+24),fill=(0,0,0,90))
    if prop_type=='tree':
        d.rectangle((cx-18,85,cx+18,base),fill=(72,45,31,255))
        for ox,oy,r in [(-45,70,55),(25,55,62),(0,18,58)]:
            d.ellipse((cx+ox-r,90+oy-r,cx+ox+r,90+oy+r),fill=rgb_hsv(hue+local.uniform(-.03,.03),.65,.34,240),outline=accent,width=3)
    elif prop_type=='rock':
        pts=[(35,base),(65,92),(120,46),(190,78),(224,base),(160,215),(78,210)]
        d.polygon(pts,fill=rgb_hsv(hue,.25,.34,255),outline=accent)
        d.line((72,108,135,66,174,92),fill=(255,255,255,70),width=5)
    elif prop_type=='ruin':
        d.rectangle((50,58,205,base),fill=rgb_hsv(hue,.18,.36,255),outline=accent,width=4)
        d.rectangle((80,92,175,base),fill=(15,18,27,255))
        for x in (62,193): d.rectangle((x-13,42,x+13,base),fill=rgb_hsv(hue,.20,.45,255),outline=accent,width=3)
    elif prop_type=='crystal':
        d.polygon([(cx,25),(190,105),(165,base),(90,base),(65,105)],fill=rgb_hsv(hue+.08,.6,.68,230),outline=accent)
        d.line((cx,35,cx,base-12),fill=(245,255,255,150),width=6)
    elif prop_type=='shrine':
        d.polygon([(45,base),(72,74),(cx,35),(184,74),(211,base)],fill=rgb_hsv(hue,.42,.28,255),outline=accent)
        d.ellipse((cx-38,90,cx+38,166),outline=accent,width=8)
    elif prop_type=='machine':
        d.rounded_rectangle((45,55,211,base),radius=22,fill=rgb_hsv(hue+.3,.42,.28,255),outline=accent,width=5)
        d.ellipse((80,80,176,176),outline=accent,width=10)
        for a in range(0,360,45): d.line((cx,128,cx+math.cos(math.radians(a))*55,128+math.sin(math.radians(a))*55),fill=accent,width=5)
    elif prop_type=='banner':
        d.rectangle((60,35,72,base),fill=(80,62,50,255))
        d.polygon([(72,52),(204,72),(175,145),(72,130)],fill=rgb_hsv(hue+.1,.62,.48,255),outline=accent)
        d.regular_polygon((135,98,30),n_sides=6,fill=accent)
    elif prop_type=='chest':
        d.rounded_rectangle((40,100,216,base),radius=18,fill=(82,48,29,255),outline=accent,width=5)
        d.pieslice((40,45,216,160),180,360,fill=(101,59,35,255),outline=accent,width=5)
        d.rectangle((118,105,138,160),fill=accent)
    elif prop_type=='portal':
        d.ellipse((35,25,221,base),outline=rgb_hsv(hue+.15,.58,.55,255),width=26)
        d.ellipse((58,47,198,base-23),outline=accent,width=8)
        for r in (25,45,65): d.arc((cx-r,128-r,cx+r,128+r),index*13,index*13+240,fill=(*accent_rgb,130),width=4)
    else:
        d.rectangle((cx-18,65,cx+18,base),fill=(55,60,78,255),outline=accent,width=4)
        d.rounded_rectangle((72,28,184,116),radius=28,fill=rgb_hsv(hue+.15,.4,.36,255),outline=accent,width=5)
        d.ellipse((104,58,152,106),fill=accent)
    # local texture specks
    for _ in range(18):
        x=local.randint(35,size-35); y=local.randint(30,base)
        rr=local.randint(1,4); d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(*accent_rgb,local.randint(20,90)))
    return im


def vfx_frame(effect_index: int, frame_index: int, size: int = 128) -> Image.Image:
    local=random.Random(60000+effect_index*100+frame_index)
    hue=(effect_index*0.037)%1; accent=rgb_hsv(hue,.72,1,255)
    im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im,'RGBA')
    t=(frame_index+1)/12; cx=cy=size//2
    ring=8+t*45
    for layer in range(4):
        rr=ring+layer*5
        d.arc((cx-rr,cy-rr,cx+rr,cy+rr),effect_index*17+frame_index*22, effect_index*17+frame_index*22+210,fill=(*accent[:3],max(20,190-layer*35)),width=max(2,8-layer))
    spokes=5+effect_index%7
    for s in range(spokes):
        a=(s/spokes)*math.tau+frame_index*.18
        length=18+t*(35+effect_index%5*5)
        x=cx+math.cos(a)*length; y=cy+math.sin(a)*length
        d.line((cx,cy,x,y),fill=(*accent[:3],150),width=3+effect_index%3)
        r=2+frame_index%4; d.ellipse((x-r,y-r,x+r,y+r),fill=(255,255,255,180))
    for _ in range(10):
        a=local.random()*math.tau; length=local.uniform(10,55)*t
        x=cx+math.cos(a)*length; y=cy+math.sin(a)*length
        rr=local.randint(1,4); d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(*accent[:3],local.randint(50,160)))
    glow_img=im.filter(ImageFilter.GaussianBlur(5)); glow_img.alpha_composite(im)
    return glow_img


def ui_tile(name: str, index: int, size: int = 192) -> Image.Image:
    hue=(.55+index*.025)%1; accent=rgb_hsv(hue,.48,1,255)
    im=gradient((size,size),(6,9,18),rgb_hsv(hue,.45,.18)[:3])
    im.alpha_composite(texture_overlay((size,size),70000+index,0.08,0.7))
    d=ImageDraw.Draw(im,'RGBA')
    d.rounded_rectangle((8,8,size-9,size-9),radius=38,fill=(6,11,24,215),outline=accent,width=6)
    d.rounded_rectangle((18,18,size-19,size-19),radius=30,outline=(*accent[:3],110),width=2)
    mode=index%8
    if mode==0:
        d.rounded_rectangle((34,60,size-35,size-60),radius=24,fill=(*accent[:3],40),outline=accent,width=5)
    elif mode==1:
        d.rounded_rectangle((28,82,size-29,size-82),radius=35,fill=(*accent[:3],70),outline=accent,width=5)
        d.line((50,110,size-50,110),fill=(255,255,255,80),width=3)
    elif mode==2:
        for r in (42,68,92): d.arc((128-r,128-r,128+r,128+r),15+index*13,245+index*13,fill=accent,width=6)
    elif mode==3:
        d.regular_polygon((128,128,82),n_sides=6,outline=accent,width=7)
        d.regular_polygon((128,128,50),n_sides=6,fill=(*accent[:3],50))
    elif mode==4:
        d.rectangle((45,55,211,201),fill=(0,0,0,60),outline=accent,width=5)
        for yy in (95,135,175): d.line((58,yy,198,yy),fill=(*accent[:3],80),width=3)
    elif mode==5:
        d.ellipse((42,42,214,214),outline=accent,width=8)
        d.ellipse((82,82,174,174),fill=(*accent[:3],60),outline=accent,width=4)
    elif mode==6:
        d.polygon([(128,30),(220,93),(184,214),(72,214),(36,93)],fill=(*accent[:3],35),outline=accent)
    else:
        d.rounded_rectangle((35,35,221,221),radius=70,fill=(*accent[:3],35),outline=accent,width=8)
        d.line((70,128,186,128),fill=accent,width=8)
        d.line((128,70,128,186),fill=accent,width=8)
    return im


def build_keyarts() -> list[dict]:
    entries=[]
    runtime_folder=ASSET_ROOT/'loading'/'quality'
    source_folder=SOURCE_ROOT/'keyart'
    for region_index,(region,_,_,_) in enumerate(REGIONS):
        for variant in range(1,3):
            runtime=region_scene(region_index,variant,(720,1280),detailed=True)
            if variant>=2:
                d=ImageDraw.Draw(runtime,'RGBA'); cx=360; cy=830
                accent=REGIONS[region_index][3]
                d.ellipse((cx-38,cy-265,cx+38,cy-190),fill=(222,200,185,255))
                d.polygon([(cx-75,cy-185),(cx+75,cy-185),(cx+120,cy+125),(cx,cy+215),(cx-120,cy+125)],fill=(22,28,52,245),outline=(*accent,255),width=6)
                d.line((cx+40,cy-130,cx+185,cy-340),fill=(235,244,255,255),width=14)
                d.line((cx+40,cy-130,cx+185,cy-340),fill=(*accent,255),width=4)
            runtime_path=runtime_folder/f'{region}_keyart_{variant:02d}.webp'
            save_webp(runtime,runtime_path,quality=91)
            master=runtime.resize((1440,2560),Image.Resampling.LANCZOS)
            master_path=source_folder/f'{region}_keyart_{variant:02d}_master.png'
            save_png(master,master_path)
            entries.append({
                'id':f'{region}.keyart.{variant:02d}',
                'runtime':str(runtime_path.relative_to(ASSET_ROOT)).replace('\\','/'),
                'master':str(master_path.relative_to(PROJECT_ROOT)).replace('\\','/'),
                'runtimeSize':[720,1280],
                'masterSize':[1440,2560],
                'bytes':runtime_path.stat().st_size,
            })
    return entries


def build_portraits() -> tuple[list[dict], list[dict], list[dict]]:
    results=[]
    categories=[('heroes','hero',8,(512,768),4),('bosses','boss',12,(512,512),4),('npc','npc',16,(384,512),4)]
    for folder,kind,count,runtime_size,cols in categories:
        tiles=[]
        source_folder=SOURCE_ROOT/'portraits'/folder
        for i in range(count):
            runtime=portrait(kind,i,runtime_size)
            master_size=(1024,1536) if kind=='hero' else ((1024,1024) if kind=='boss' else (768,1024))
            master=runtime.resize(master_size,Image.Resampling.LANCZOS)
            save_png(master,source_folder/f'{kind}_{i:02d}_master.png')
            tiles.append((f'quality.{kind}.{i:02d}',runtime))
        chunk_size=8
        manifests=[]
        for chunk_index,start in enumerate(range(0,len(tiles),chunk_size),start=1):
            subset=tiles[start:start+chunk_size]
            manifests.append(save_atlas(folder,f'{folder}_quality_{chunk_index:02d}',subset,cols=cols,quality=91,tags=[kind,'portrait','quality']))
        results.append(manifests)
    return results[0],results[1],results[2]


def build_items() -> list[dict]:
    tiles=[]
    total=384
    for i in range(total):
        category=ITEM_TYPES[i%len(ITEM_TYPES)]
        tiles.append((f'quality.item.{category}.{i:03d}',icon_tile(category,i)))
    manifests=[]
    for chunk_index,start in enumerate(range(0,total,64),start=1):
        manifests.append(save_atlas('items',f'items_quality_{chunk_index:02d}',tiles[start:start+64],cols=8,quality=90,tags=['item','icon','quality']))
    # Source contact sheets preserve higher-quality PNG masters without 384 separate files.
    source_folder=SOURCE_ROOT/'contact_sheets'; source_folder.mkdir(parents=True,exist_ok=True)
    for page,start in enumerate(range(0,total,64),start=1):
        sheet=Image.new('RGBA',(8*256,8*256),(0,0,0,0))
        for slot,(_,tile) in enumerate(tiles[start:start+64]):
            sheet.alpha_composite(tile.resize((256,256),Image.Resampling.LANCZOS),((slot%8)*256,(slot//8)*256))
        save_png(sheet,source_folder/f'items_quality_page_{page:02d}_master.png')
    return manifests


def build_skills() -> list[dict]:
    tiles=[]
    total=160
    for i in range(total):
        school=SCHOOLS[i%len(SCHOOLS)]
        tiles.append((f'quality.skill.{school}.{i:03d}',skill_icon(school,i)))
    manifests=[]
    for chunk_index,start in enumerate(range(0,total,40),start=1):
        manifests.append(save_atlas('skills',f'skills_quality_{chunk_index:02d}',tiles[start:start+40],cols=8,quality=91,tags=['skill','icon','quality']))
    source_folder=SOURCE_ROOT/'contact_sheets'; source_folder.mkdir(parents=True,exist_ok=True)
    for page,start in enumerate(range(0,total,40),start=1):
        sheet=Image.new('RGBA',(8*256,5*256),(0,0,0,0))
        for slot,(_,tile) in enumerate(tiles[start:start+40]):
            sheet.alpha_composite(tile.resize((256,256),Image.Resampling.LANCZOS),((slot%8)*256,(slot//8)*256))
        save_png(sheet,source_folder/f'skills_quality_page_{page:02d}_master.png')
    return manifests


def build_props() -> list[dict]:
    tiles=[]
    total=240
    for i in range(total):
        region=i%len(REGIONS); prop_type=PROP_TYPES[(i//len(REGIONS))%len(PROP_TYPES)]
        tiles.append((f'quality.prop.{REGIONS[region][0]}.{prop_type}.{i:03d}',prop_tile(prop_type,i,region)))
    manifests=[]
    for chunk_index,start in enumerate(range(0,total,48),start=1):
        manifests.append(save_atlas('environment',f'props_quality_{chunk_index:02d}',tiles[start:start+48],cols=8,quality=90,tags=['environment','prop','quality']))
    return manifests


def build_vfx() -> list[dict]:
    manifests=[]; total_effects=32
    all_tiles=[]; all_animations={}
    for effect in range(total_effects):
        names=[]
        for frame in range(12):
            name=f'quality.vfx.{effect:02d}.{frame:02d}'
            names.append(name); all_tiles.append((name,vfx_frame(effect,frame)))
        all_animations[f'quality.vfx.{effect:02d}']=names
    effects_per_atlas=8
    for chunk_index,effect_start in enumerate(range(0,total_effects,effects_per_atlas),start=1):
        frame_start=effect_start*12; frame_end=(effect_start+effects_per_atlas)*12
        subset=all_tiles[frame_start:frame_end]
        anim={k:v for k,v in all_animations.items() if effect_start<=int(k.split('.')[-1])<effect_start+effects_per_atlas}
        manifests.append(save_atlas('effects',f'vfx_quality_{chunk_index:02d}',subset,cols=12,quality=92,animations=anim,tags=['vfx','animation','quality']))
    return manifests


def build_ui() -> list[dict]:
    names=['panel','button','slot','frame','badge','meter','popup','control']
    tiles=[]
    for i in range(96):
        tiles.append((f'quality.ui.{names[i%len(names)]}.{i:03d}',ui_tile(names[i%len(names)],i)))
    manifests=[]
    for chunk_index,start in enumerate(range(0,96,48),start=1):
        manifests.append(save_atlas('ui',f'ui_quality_{chunk_index:02d}',tiles[start:start+48],cols=8,quality=91,tags=['ui','9slice-candidate','quality']))
    source_folder=SOURCE_ROOT/'ui'; source_folder.mkdir(parents=True,exist_ok=True)
    for page,start in enumerate(range(0,96,48),start=1):
        sheet=Image.new('RGBA',(8*320,6*320),(0,0,0,0))
        for slot,(_,tile) in enumerate(tiles[start:start+48]):
            sheet.alpha_composite(tile.resize((320,320),Image.Resampling.LANCZOS),((slot%8)*320,(slot//8)*320))
        save_png(sheet,source_folder/f'ui_quality_page_{page:02d}_master.png')
    return manifests


def build_maps() -> list[dict]:
    entries=[]
    for region_index,(region,_,_,_) in enumerate(REGIONS):
        folder=ASSET_ROOT/'maps'/'quality'/f'chapter{region_index+1}'
        for variant in range(1,4):
            image=region_scene(region_index,variant,(720,1280),detailed=True)
            path=folder/f'{region}_battle_{variant:02d}.webp'
            save_webp(image,path,quality=90)
            entries.append({'id':f'{region}.battle.{variant:02d}','path':str(path.relative_to(ASSET_ROOT)).replace('\\','/'),'size':[720,1280],'bytes':path.stat().st_size})
    return entries


def summarize_manifests(groups: dict[str,list[dict]], keyarts:list[dict], maps:list[dict]) -> dict:
    atlas_count=sum(len(v) for v in groups.values())
    frames=sum(m['frames'] for manifests in groups.values() for m in manifests)
    animations=sum(m['animations'] for manifests in groups.values() for m in manifests)
    runtime_files=[]
    for manifests in groups.values():
        for m in manifests: runtime_files.extend([m['json'],m['image']])
    runtime_files.extend([e['runtime'] for e in keyarts])
    runtime_files.extend([e['path'] for e in maps])
    runtime_bytes=sum((ASSET_ROOT/p).stat().st_size for p in runtime_files)
    source_files=[p for p in SOURCE_ROOT.rglob('*') if p.is_file()]
    source_bytes=sum(p.stat().st_size for p in source_files)
    return {
        'version':VERSION,
        'qualityStage':'production-candidate-procedural',
        'truthfulnessNote':'최종 상용 원화가 아닌 고해상도 절차형 제작 후보 자산. 외부 아트 디렉션과 수작업 리터칭 전에는 final/AAA로 표기 금지.',
        'counts':{
            'atlases':atlas_count,
            'frames':frames,
            'animations':animations,
            'heroes':8,
            'bossPortraits':12,
            'npcPortraits':16,
            'itemIcons':384,
            'skillIcons':160,
            'environmentProps':240,
            'vfxSets':32,
            'vfxFrames':384,
            'uiFrames':96,
            'keyarts':len(keyarts),
            'battleBackgrounds':len(maps),
            'masterSourceFiles':len(source_files),
        },
        'bytes':{'runtime':runtime_bytes,'sourceMasters':source_bytes,'combined':runtime_bytes+source_bytes},
        'groups':groups,
        'keyarts':keyarts,
        'maps':maps,
        'sourceRoot':str(SOURCE_ROOT.relative_to(PROJECT_ROOT)).replace('\\','/'),
    }


def main() -> None:
    ensure_clean()
    keyarts=build_keyarts()
    heroes,bosses,npcs=build_portraits()
    groups={
        'heroes':heroes,
        'bosses':bosses,
        'npc':npcs,
        'items':build_items(),
        'skills':build_skills(),
        'environment':build_props(),
        'vfx':build_vfx(),
        'ui':build_ui(),
    }
    maps=build_maps()
    summary=summarize_manifests(groups,keyarts,maps)
    summary_path=ASSET_ROOT/'QUALITYPACK_V090_SUMMARY.json'
    summary_path.write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    source_manifest=SOURCE_ROOT/'SOURCE_MANIFEST.json'
    source_manifest.write_text(json.dumps({
        'version':VERSION,
        'qualityStage':'production-candidate-procedural',
        'generator':'tools/generate_asset_qualitypack_v090.py',
        'sourceFiles':[str(p.relative_to(PROJECT_ROOT)).replace('\\','/') for p in SOURCE_ROOT.rglob('*') if p.is_file() and p.name!='SOURCE_MANIFEST.json'],
        'replacementPolicy':'동일 런타임 키와 프레임 이름을 유지하며 수작업 원화로 교체한다.',
    },ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary['counts'],ensure_ascii=False,indent=2))
    print(json.dumps({k:round(v/1024/1024,2) for k,v in summary['bytes'].items()},ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()

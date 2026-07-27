from __future__ import annotations
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
JOBS = [
    (
        ROOT / 'public/assets/live/v1/atlases/player/player_live_v1.webp',
        ROOT / 'public/assets/live/v1/atlases/player/player_live_v1.json',
        ROOT / 'public/assets/live/v2/atlases/player/player_live_v2.webp',
        ROOT / 'public/assets/live/v2/atlases/player/player_live_v2.json',
    ),
    (
        ROOT / 'public/assets/live/v1/atlases/monsters/monsters_live_v1.webp',
        ROOT / 'public/assets/live/v1/atlases/monsters/monsters_live_v1.json',
        ROOT / 'public/assets/live/v2/atlases/monsters/monsters_live_v2.webp',
        ROOT / 'public/assets/live/v2/atlases/monsters/monsters_live_v2.json',
    ),
]


def grade_frame(frame: Image.Image) -> Image.Image:
    rgba = frame.convert('RGBA')
    alpha = rgba.getchannel('A')
    rgb = rgba.convert('RGB')
    rgb = ImageEnhance.Color(rgb).enhance(0.92)
    rgb = ImageEnhance.Brightness(rgb).enhance(1.24)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.12)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.2)

    gray = ImageOps.grayscale(rgb)
    shadow_mask = ImageOps.invert(gray).point(lambda v: int(v * 0.055))
    highlight_mask = gray.point(lambda v: max(0, int((v - 116) * 0.12)))
    teal = Image.new('RGB', rgb.size, (22, 88, 89))
    gold = Image.new('RGB', rgb.size, (214, 169, 91))
    rgb = Image.composite(teal, rgb, shadow_mask)
    rgb = Image.composite(gold, rgb, highlight_mask)

    graded = rgb.convert('RGBA')
    graded.putalpha(alpha)

    expanded = alpha.filter(ImageFilter.MaxFilter(5))
    outline_alpha = ImageChops.subtract(expanded, alpha).point(lambda v: int(v * 0.75))
    outline = Image.new('RGBA', rgba.size, (3, 12, 16, 0))
    outline.putalpha(outline_alpha)

    soft = alpha.filter(ImageFilter.GaussianBlur(3))
    shadow_alpha = ImageChops.offset(soft, 0, 3).point(lambda v: int(v * 0.35))
    shadow = Image.new('RGBA', rgba.size, (0, 0, 0, 0))
    shadow.putalpha(shadow_alpha)

    composed = Image.alpha_composite(shadow, outline)
    return Image.alpha_composite(composed, graded)


for source_image, source_json, output_image, output_json in JOBS:
    atlas = Image.open(source_image).convert('RGBA')
    data = json.loads(source_json.read_text(encoding='utf-8'))
    result = Image.new('RGBA', atlas.size, (0, 0, 0, 0))
    for entry in data['frames'].values():
        frame = entry['frame']
        x, y, w, h = frame['x'], frame['y'], frame['w'], frame['h']
        crop = atlas.crop((x, y, x + w, y + h))
        result.alpha_composite(grade_frame(crop), (x, y))
    output_image.parent.mkdir(parents=True, exist_ok=True)
    result.save(output_image, 'WEBP', lossless=False, quality=88, method=4, exact=True)
    data.setdefault('meta', {})['image'] = output_image.name
    data['meta']['artPass'] = 'v1.2.0-unified-grade'
    output_json.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'generated {output_image.relative_to(ROOT)} {output_image.stat().st_size / 1_000_000:.2f} MB')

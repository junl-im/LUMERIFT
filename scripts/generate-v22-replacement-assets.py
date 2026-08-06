from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public' / 'assets' / 'live' / 'v22'
SOURCE = ROOT / 'art_source' / 'mobile_masters' / 'v22'
PUBLIC.mkdir(parents=True, exist_ok=True)
SOURCE.mkdir(parents=True, exist_ok=True)

CHARACTER_POSTER = Path('/mnt/data/lumerift_캐릭터_업그레이드_쇼케이스.png')
MASTER_POSTER = Path('/mnt/data/루메리프트_환상적_업그레이드_쇼케이스.png')
PATCH_POSTER = Path('/mnt/data/imagegen.png')

for source in (CHARACTER_POSTER, MASTER_POSTER, PATCH_POSTER):
    if not source.exists():
        raise FileNotFoundError(source)
    shutil.copy2(source, SOURCE / source.name)


def contain_crop(image: Image.Image, box: tuple[int, int, int, int], size: tuple[int, int], *, darken=0.0, saturation=1.0, contrast=1.0, blur=0.0) -> Image.Image:
    crop = image.crop(box).convert('RGB')
    target_ratio = size[0] / size[1]
    ratio = crop.width / crop.height
    if ratio > target_ratio:
        new_w = int(crop.height * target_ratio)
        left = (crop.width - new_w) // 2
        crop = crop.crop((left, 0, left + new_w, crop.height))
    else:
        new_h = int(crop.width / target_ratio)
        top = max(0, (crop.height - new_h) // 2)
        crop = crop.crop((0, top, crop.width, top + new_h))
    crop = crop.resize(size, Image.Resampling.LANCZOS)
    if blur:
        crop = crop.filter(ImageFilter.GaussianBlur(blur))
    crop = ImageEnhance.Color(crop).enhance(saturation)
    crop = ImageEnhance.Contrast(crop).enhance(contrast)
    if darken:
        shade = Image.new('RGB', crop.size, (3, 6, 16))
        crop = Image.blend(crop, shade, darken)
    return crop


def add_vignette(image: Image.Image, strength=0.5, top_clear=0.0) -> Image.Image:
    base = image.convert('RGBA')
    w, h = base.size
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w * 0.5, h * 0.44
    dx = (xx - cx) / (w * 0.72)
    dy = (yy - cy) / (h * 0.64)
    dist = np.sqrt(dx * dx + dy * dy)
    mask = np.clip((dist - 0.32) / 0.68, 0, 1) * (255 * strength)
    if top_clear > 0:
        mask *= np.clip((yy / max(1, h * top_clear)), 0, 1)
    overlay = Image.new('RGBA', base.size, (1, 3, 12, 0))
    overlay.putalpha(Image.fromarray(mask.astype(np.uint8), 'L'))
    return Image.alpha_composite(base, overlay)


def add_bottom_fade(image: Image.Image, start=0.56, strength=0.88) -> Image.Image:
    base = image.convert('RGBA')
    w, h = base.size
    y = np.arange(h, dtype=np.float32)
    alpha = np.clip((y - h * start) / max(1, h * (1 - start)), 0, 1) * 255 * strength
    mask = np.repeat(alpha[:, None], w, axis=1).astype(np.uint8)
    overlay = Image.new('RGBA', base.size, (2, 5, 15, 0))
    overlay.putalpha(Image.fromarray(mask, 'L'))
    return Image.alpha_composite(base, overlay)


def save_webp(image: Image.Image, path: Path, *, quality=90, lossless=False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, 'WEBP', quality=quality, method=4, lossless=lossless)

char = Image.open(CHARACTER_POSTER)
master = Image.open(MASTER_POSTER)
patch = Image.open(PATCH_POSTER)

# Login/title art: large hero, clear upper title area, dark lower UI area.
title = contain_crop(char, (180, 165, 785, 1540), (540, 960), darken=0.18, saturation=1.08, contrast=1.08)
title = add_vignette(title, 0.62)
title = add_bottom_fade(title, 0.48, 0.91)
save_webp(title, PUBLIC / 'backgrounds' / 'title_reborn_v22.webp', quality=91)

# Lobby art: slightly brighter hero and city, while lower command area remains readable.
lobby = contain_crop(master, (245, 100, 865, 1290), (540, 960), darken=0.10, saturation=1.08, contrast=1.08)
lobby = add_vignette(lobby, 0.52)
lobby = add_bottom_fade(lobby, 0.61, 0.78)
save_webp(lobby, PUBLIC / 'backgrounds' / 'lobby_reborn_v22.webp', quality=91)

# Character art cards.
hero_full = contain_crop(char, (205, 190, 755, 1260), (512, 768), darken=0.02, saturation=1.08, contrast=1.1)
hero_full = add_vignette(hero_full, 0.35)
save_webp(hero_full, PUBLIC / 'portraits' / 'hero_reborn_v22.webp', quality=92)
hero_face = contain_crop(char, (270, 205, 555, 520), (512, 512), darken=0.02, saturation=1.06, contrast=1.08)
save_webp(hero_face, PUBLIC / 'portraits' / 'hero_face_reborn_v22.webp', quality=92)

# Monster/boss cards from the unified master board.
monster_full = contain_crop(master, (20, 625, 710, 1085), (768, 512), darken=0.04, saturation=1.12, contrast=1.12)
monster_full = add_vignette(monster_full, 0.34)
save_webp(monster_full, PUBLIC / 'portraits' / 'monster_reborn_v22.webp', quality=92)
for phase, box, hue in [
    (1, (40, 650, 620, 1050), 0),
    (2, (80, 640, 690, 1060), 1),
    (3, (20, 610, 720, 1090), 2),
]:
    im = contain_crop(master, box, (512, 512), darken=0.03, saturation=1.10 + phase * 0.03, contrast=1.08 + phase * 0.03)
    if hue == 1:
        # Frost phase: cooler luminous veil.
        veil = Image.new('RGB', im.size, (18, 72, 120))
        im = Image.blend(im, veil, 0.10)
    elif hue == 2:
        # Overdrive phase: richer violet.
        veil = Image.new('RGB', im.size, (78, 18, 108))
        im = Image.blend(im, veil, 0.11)
    save_webp(im, PUBLIC / 'portraits' / f'boss_phase_{phase}_reborn_v22.webp', quality=92)


def recolor_rgba(arr: np.ndarray, mode: str) -> np.ndarray:
    rgb = arr[..., :3].astype(np.float32) / 255.0
    a = arr[..., 3:4].astype(np.float32) / 255.0
    lum = rgb[..., 0:1] * 0.2126 + rgb[..., 1:2] * 0.7152 + rgb[..., 2:3] * 0.0722
    maxc = rgb.max(axis=2, keepdims=True)
    minc = rgb.min(axis=2, keepdims=True)
    sat = maxc - minc
    warm = np.clip((rgb[..., 0:1] - rgb[..., 2:3]) * 2.4 + (rgb[..., 1:2] - rgb[..., 2:3]) * 0.6, 0, 1)
    if mode == 'player':
        shadow = np.array([0.015, 0.025, 0.075])
        mid = np.array([0.065, 0.11, 0.24])
        violet = np.array([0.31, 0.17, 0.70])
        silver = np.array([0.77, 0.87, 1.0])
        gold = np.array([0.92, 0.67, 0.25])
        base = shadow + (mid - shadow) * np.clip(lum * 2.2, 0, 1)
        base = base + violet * np.clip((lum - 0.22) * 1.6, 0, 0.48)
        base = base * (0.72 + sat * 0.7) + silver * np.clip((lum - 0.68) * 2.1, 0, 0.55)
        base = base * (1 - warm * 0.42) + gold * warm * (0.25 + lum * 0.35)
    elif mode == 'monster':
        shadow = np.array([0.008, 0.015, 0.045])
        mid = np.array([0.055, 0.075, 0.18])
        violet = np.array([0.36, 0.10, 0.74])
        cyan = np.array([0.13, 0.56, 0.92])
        gold = np.array([0.80, 0.49, 0.16])
        base = shadow + (mid - shadow) * np.clip(lum * 2.5, 0, 1)
        cool = np.clip(rgb[..., 2:3] - rgb[..., 0:1] + sat * 0.4, 0, 1)
        base = base + violet * np.clip((lum - 0.15) * 1.45 + cool * 0.25, 0, 0.62)
        base = base + cyan * np.clip((lum - 0.66) * 1.8, 0, 0.42)
        base = base * (1 - warm * 0.28) + gold * warm * (0.15 + lum * 0.22)
    elif mode == 'ui':
        shadow = np.array([0.006, 0.012, 0.035])
        navy = np.array([0.035, 0.07, 0.16])
        violet = np.array([0.20, 0.11, 0.42])
        gold = np.array([0.88, 0.63, 0.24])
        base = shadow + (navy - shadow) * np.clip(lum * 2.8, 0, 1)
        base = base + violet * np.clip(sat * 0.75 + (lum - 0.3) * 0.5, 0, 0.35)
        base = base * (1 - warm * 0.48) + gold * warm * (0.35 + lum * 0.35)
    else:
        shadow = np.array([0.005, 0.008, 0.03])
        violet = np.array([0.35, 0.08, 0.82])
        cyan = np.array([0.12, 0.62, 1.0])
        white = np.array([0.92, 0.96, 1.0])
        base = shadow + violet * np.clip(lum * 1.65 + sat * 0.35, 0, 0.82)
        base = base + cyan * np.clip((lum - 0.42) * 1.15, 0, 0.45)
        base = base + white * np.clip((lum - 0.8) * 2.0, 0, 0.35)
    out = np.concatenate([np.clip(base, 0, 1), a], axis=2)
    return (out * 255 + 0.5).astype(np.uint8)


def stylize_atlas(src_json: Path, src_image: Path, out_dir: Path, out_base: str, mode: str, version: str) -> tuple[int, int]:
    data = json.loads(src_json.read_text('utf-8'))
    src = Image.open(src_image).convert('RGBA')
    canvas = Image.new('RGBA', src.size, (0, 0, 0, 0))
    for frame in data['frames'].values():
        f = frame['frame']
        box = (f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])
        tile = src.crop(box)
        arr = recolor_rgba(np.asarray(tile), mode)
        core = Image.fromarray(arr, 'RGBA')
        if mode in ('player', 'monster'):
            original = ImageEnhance.Color(tile).enhance(0.45)
            core = Image.blend(core, original, 0.16)
            core = ImageEnhance.Brightness(core).enhance(1.18 if mode == 'player' else 1.13)
            core = ImageEnhance.Contrast(core).enhance(1.10)
        alpha = core.getchannel('A')
        outline = alpha.filter(ImageFilter.MaxFilter(5))
        outline = ImageChops.subtract(outline, alpha)
        outline_layer = Image.new('RGBA', core.size, (6, 8, 24, 0))
        outline_layer.putalpha(outline.point(lambda x: min(185, int(x * 0.82))))
        glow = alpha.filter(ImageFilter.GaussianBlur(2.2))
        glow_layer = Image.new('RGBA', core.size, (83, 47, 214, 0))
        glow_layer.putalpha(glow.point(lambda x: min(92, int(x * 0.22))))
        merged = Image.alpha_composite(glow_layer, outline_layer)
        if mode in ('player', 'monster'):
            inner = alpha.filter(ImageFilter.MinFilter(3))
            edge = ImageChops.subtract(alpha, inner)
            gold_layer = Image.new('RGBA', core.size, (222, 166, 67, 0))
            gold_layer.putalpha(edge.point(lambda x: min(120, int(x * 0.34))))
            merged = Image.alpha_composite(merged, gold_layer)
        merged = Image.alpha_composite(merged, core)
        # Clean center details after resizing/compression.
        merged = ImageEnhance.Sharpness(merged).enhance(1.35 if mode in ('player', 'monster') else 1.15)
        canvas.alpha_composite(merged, (f['x'], f['y']))
    out_dir.mkdir(parents=True, exist_ok=True)
    image_name = f'{out_base}.webp'
    json_name = f'{out_base}.json'
    save_webp(canvas, out_dir / image_name, quality=92, lossless=False)
    data['meta']['image'] = image_name
    data['meta']['version'] = version
    data['meta']['app'] = f'LUMERIFT integrated visual replacement {version}'
    data['meta']['visualReplacement'] = True
    data['meta']['qualityStage'] = 'production-candidate-unified-art-pass'
    (out_dir / json_name).write_text(json.dumps(data, ensure_ascii=False, indent=2), 'utf-8')
    return len(data.get('frames', {})), len(data.get('animations', {}))

# Imported here to avoid hidden dependency before the helper is used.
from PIL import ImageChops

specs = [
    ('public/assets/live/v10/atlases/player/player_premium_body_v10.json', 'public/assets/live/v10/atlases/player/player_premium_body_v10.webp', PUBLIC / 'atlases/player', 'player_reborn_body_v22', 'player'),
    ('public/assets/live/v4/atlases/monsters/monsters_live_v4.json', 'public/assets/live/v4/atlases/monsters/monsters_live_v4.webp', PUBLIC / 'atlases/monsters', 'monsters_reborn_v22', 'monster'),
    ('public/assets/live/v4/atlases/effects/combat_effects_v4.json', 'public/assets/live/v4/atlases/effects/combat_effects_v4.webp', PUBLIC / 'atlases/effects', 'combat_effects_reborn_v22', 'effects'),
    ('public/assets/live/v5/atlases/ui/ui_luminous_v5.json', 'public/assets/live/v5/atlases/ui/ui_luminous_v5.webp', PUBLIC / 'atlases/ui', 'ui_reborn_v22', 'ui'),
]
metrics = {}
for json_path, image_path, out_dir, out_base, mode in specs:
    metrics[out_base] = stylize_atlas(ROOT / json_path, ROOT / image_path, out_dir, out_base, mode, '1.11.38')

contract = {
    'schema': 'lumerift-integrated-visual-replacement-v22',
    'version': '1.11.38',
    'qualityStage': 'production-candidate-unified-art-pass',
    'defaultRuntimeReplacement': True,
    'oldOverlayStackDefaultEnabled': False,
    'finalHandPaintedFullBodyAtlasesComplete': False,
    'sourceReferences': [p.name for p in (CHARACTER_POSTER, MASTER_POSTER, PATCH_POSTER)],
    'assets': {
        'playerAtlas': 'assets/live/v22/atlases/player/player_reborn_body_v22.json',
        'monsterAtlas': 'assets/live/v22/atlases/monsters/monsters_reborn_v22.json',
        'effectsAtlas': 'assets/live/v22/atlases/effects/combat_effects_reborn_v22.json',
        'uiAtlas': 'assets/live/v22/atlases/ui/ui_reborn_v22.json',
        'titleBackground': 'assets/live/v22/backgrounds/title_reborn_v22.webp',
        'lobbyBackground': 'assets/live/v22/backgrounds/lobby_reborn_v22.webp',
        'heroPortrait': 'assets/live/v22/portraits/hero_reborn_v22.webp',
        'heroFace': 'assets/live/v22/portraits/hero_face_reborn_v22.webp',
        'monsterPortrait': 'assets/live/v22/portraits/monster_reborn_v22.webp',
        'bossPortraits': [f'assets/live/v22/portraits/boss_phase_{i}_reborn_v22.webp' for i in (1, 2, 3)],
    },
    'metrics': {k: {'frames': v[0], 'animations': v[1]} for k, v in metrics.items()},
    'visualPolicy': {
        'palette': ['deep-navy', 'blue-black', 'violet', 'cyan', 'soft-gold'],
        'integratedMaterials': ['armor', 'cloth', 'crystal', 'rune-light'],
        'mobileReadabilityMinimum': 80,
        'initialLoadBudgetBytes': 15_000_000,
    },
    'fallback': ['v10-player', 'v4-monsters', 'v4-effects', 'v5-ui'],
}
contract_path = PUBLIC / 'production' / 'INTEGRATED_VISUAL_REPLACEMENT_V22.json'
contract_path.parent.mkdir(parents=True, exist_ok=True)
contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2), 'utf-8')

print(json.dumps({'generated': True, 'metrics': metrics}, ensure_ascii=False))

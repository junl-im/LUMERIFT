from __future__ import annotations

import json
import math
import shutil
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/mnt/data/lumerift_v100_sources')
PUBLIC = ROOT / 'public' / 'assets'
LIVE = PUBLIC / 'live' / 'v1'
ART_SOURCE = ROOT / 'art_source' / 'open_art' / 'v1.0.0'


def ensure_dirs() -> None:
    for path in [
        LIVE / 'atlases' / 'player',
        LIVE / 'atlases' / 'monsters',
        LIVE / 'atlases' / 'ui',
        LIVE / 'backgrounds',
        LIVE / 'portraits',
        LIVE / 'licenses',
        ART_SOURCE / 'characters',
        ART_SOURCE / 'monsters',
        ART_SOURCE / 'backgrounds',
        ART_SOURCE / 'portraits',
    ]:
        path.mkdir(parents=True, exist_ok=True)


def save_webp(image: Image.Image, path: Path, *, quality: int = 90, lossless: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, 'WEBP', quality=quality, method=4, lossless=lossless)


def atlas_frame(x: int, y: int, w: int, h: int, anchor=(0.5, 0.78)) -> dict:
    return {
        'frame': {'x': x, 'y': y, 'w': w, 'h': h},
        'rotated': False,
        'trimmed': False,
        'spriteSourceSize': {'x': 0, 'y': 0, 'w': w, 'h': h},
        'sourceSize': {'w': w, 'h': h},
        'anchor': {'x': anchor[0], 'y': anchor[1]},
    }


def write_atlas(path: Path, image_name: str, frames: dict, animations: dict, size: tuple[int, int]) -> None:
    payload = {
        'frames': frames,
        'animations': animations,
        'meta': {
            'app': 'LUMERIFT live art pipeline v1.0.0',
            'version': '1.0.0',
            'image': image_name,
            'format': 'RGBA8888',
            'size': {'w': size[0], 'h': size[1]},
            'scale': '1',
        },
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def pack_cells(cells: list[tuple[str, Image.Image]], cell: int, cols: int, anchor=(0.5, 0.78)) -> tuple[Image.Image, dict]:
    rows = math.ceil(len(cells) / cols)
    canvas = Image.new('RGBA', (cols * cell, rows * cell), (0, 0, 0, 0))
    frames: dict[str, dict] = {}
    for index, (name, image) in enumerate(cells):
        x = (index % cols) * cell
        y = (index // cols) * cell
        canvas.alpha_composite(image, (x, y))
        frames[name] = atlas_frame(x, y, cell, cell, anchor)
    return canvas, frames


def fit_cell(image: Image.Image, size: int, *, content_scale: float = 1.0) -> Image.Image:
    src = image.convert('RGBA')
    bbox = src.getbbox()
    if bbox:
        src = src.crop(bbox)
    max_size = int(size * content_scale)
    ratio = min(max_size / max(1, src.width), max_size / max(1, src.height))
    target = src.resize((max(1, int(src.width * ratio)), max(1, int(src.height * ratio))), Image.Resampling.LANCZOS)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    x = (size - target.width) // 2
    y = size - target.height - int(size * 0.05)
    out.alpha_composite(target, (x, y))
    return out


def build_player() -> None:
    source_path = SOURCE / 'isometric_knight_sheet.png'
    source = Image.open(source_path).convert('RGBA')
    source_cell = 128
    output_cell = 192
    cells: list[tuple[str, Image.Image]] = []
    for index in range(source.width // source_cell):
        frame = source.crop((index * source_cell, 0, (index + 1) * source_cell, source_cell))
        cells.append((f'knight_{index:02d}', fit_cell(frame, output_cell, content_scale=0.92)))
    atlas, frames = pack_cells(cells, output_cell, cols=16, anchor=(0.5, 0.82))

    # Source page documents 0-22 as a look-around idle sequence. Remaining ranges are
    # grouped into usable runtime actions after visual inspection of the published sheet.
    sequences = {
        'idle': list(range(0, 12)),
        'run': list(range(56, 68)),
        'attack1': list(range(22, 29)),
        'attack2': list(range(29, 35)),
        'attack3': list(range(35, 41)),
        'skill1': list(range(41, 48)),
        'skill2': list(range(48, 56)),
        'hit': [42, 43, 44],
        'death': list(range(44, 56)),
        'dodge': list(range(56, 64)),
    }
    animations: dict[str, list[str]] = {}
    for state, indices in sequences.items():
        names = [f'knight_{index:02d}' for index in indices]
        for direction in ('n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'):
            animations[f'player.{state}.{direction}'] = names

    image_path = LIVE / 'atlases' / 'player' / 'player_live_v1.webp'
    json_path = LIVE / 'atlases' / 'player' / 'player_live_v1.json'
    save_webp(atlas, image_path, quality=96, lossless=False)
    write_atlas(json_path, image_path.name, frames, animations, atlas.size)
    shutil.copy2(source_path, ART_SOURCE / 'characters' / 'isometric_knight_sheet.png')


def extract_sheet_frame(source: Image.Image, cell: int, row: int, col: int, output_cell: int, scale: float) -> Image.Image:
    frame = source.crop((col * cell, row * cell, (col + 1) * cell, (row + 1) * cell))
    return fit_cell(frame, output_cell, content_scale=scale)


def build_monsters() -> None:
    mappings = [
        ('monster_crawler', 'spider.png', 128, 0.76),
        ('monster_brute', 'orc_heavy.png', 128, 0.85),
        ('monster_wisp', 'orc_archer.png', 128, 0.82),
        ('monster_spitter', 'orc_regular.png', 128, 0.82),
        ('monster_shade', 'spider_giant.png', 128, 0.84),
        ('monster_warden', 'orc_elite.png', 128, 0.9),
        ('monster_mender', 'werebear_brown_armor.png', 128, 0.92),
        ('boss_harbinger', 'troll.png', 256, 0.98),
    ]
    output_cell = 192
    states = {
        'idle': list(range(0, 4)),
        'move': list(range(4, 12)),
        'attack': list(range(12, 19)),
        'hit': [18, 19],
        'die': list(range(19, 24)),
        'roar': list(range(24, 32)),
    }
    rank_for = {
        'monster_crawler': 'normal', 'monster_brute': 'normal', 'monster_wisp': 'normal',
        'monster_spitter': 'normal', 'monster_shade': 'normal',
        'monster_warden': 'elite', 'monster_mender': 'elite', 'boss_harbinger': 'boss',
    }
    cells: list[tuple[str, Image.Image]] = []
    animations: dict[str, list[str]] = {}
    first_by_rank: dict[tuple[str, str], list[str]] = {}

    for monster_id, filename, source_cell, content_scale in mappings:
        source_path = SOURCE / 'flare' / filename
        source = Image.open(source_path).convert('RGBA')
        source_cols = source.width // source_cell
        row = 0
        for state, indices in states.items():
            valid = [index for index in indices if index < source_cols]
            names: list[str] = []
            for local, col in enumerate(valid):
                name = f'{monster_id}_{state}_{local:02d}'
                cells.append((name, extract_sheet_frame(source, source_cell, row, col, output_cell, content_scale)))
                names.append(name)
            animations[f'monster.{monster_id}.{state}'] = names
            rank_key = (rank_for[monster_id], state)
            first_by_rank.setdefault(rank_key, names)
        shutil.copy2(source_path, ART_SOURCE / 'monsters' / filename)

    for (rank, state), names in first_by_rank.items():
        animations[f'monster.{rank}.{state}'] = names

    atlas, frames = pack_cells(cells, output_cell, cols=16, anchor=(0.5, 0.82))
    image_path = LIVE / 'atlases' / 'monsters' / 'monsters_live_v1.webp'
    json_path = LIVE / 'atlases' / 'monsters' / 'monsters_live_v1.json'
    save_webp(atlas, image_path, quality=92, lossless=True)
    write_atlas(json_path, image_path.name, frames, animations, atlas.size)


def cover_crop(image: Image.Image, size: tuple[int, int], focus_y: float = 0.5) -> Image.Image:
    target_w, target_h = size
    ratio = max(target_w / image.width, target_h / image.height)
    resized = image.resize((math.ceil(image.width * ratio), math.ceil(image.height * ratio)), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - target_w) // 2)
    excess_y = max(0, resized.height - target_h)
    top = max(0, min(excess_y, int(excess_y * focus_y)))
    return resized.crop((left, top, left + target_w, top + target_h))


def vertical_gradient(size: tuple[int, int], stops: list[tuple[float, tuple[int, int, int, int]]]) -> Image.Image:
    w, h = size
    out = Image.new('RGBA', size)
    px = out.load()
    for y in range(h):
        t = y / max(1, h - 1)
        left = stops[0]
        right = stops[-1]
        for i in range(len(stops) - 1):
            if stops[i][0] <= t <= stops[i + 1][0]:
                left, right = stops[i], stops[i + 1]
                break
        span = max(1e-6, right[0] - left[0])
        p = max(0, min(1, (t - left[0]) / span))
        color = tuple(round(left[1][c] * (1 - p) + right[1][c] * p) for c in range(4))
        for x in range(w):
            px[x, y] = color
    return out


def build_backgrounds() -> None:
    source_path = SOURCE / 'rpg_background.png'
    source = Image.open(source_path).convert('RGBA')
    base = cover_crop(source, (1080, 1920), focus_y=0.45)
    base = ImageEnhance.Color(base).enhance(0.9)
    base = ImageEnhance.Contrast(base).enhance(1.08)

    lobby = base.copy()
    lobby.alpha_composite(vertical_gradient(lobby.size, [
        (0.0, (4, 9, 14, 24)), (0.45, (4, 8, 14, 48)), (0.72, (5, 8, 15, 150)), (1.0, (4, 6, 12, 240)),
    ]))
    # restrained cyan-gold atmosphere to bridge fantasy and modern-rift style
    glow = Image.new('RGBA', lobby.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((720, 150, 1260, 690), fill=(60, 222, 203, 42))
    gd.ellipse((-280, 820, 430, 1530), fill=(255, 188, 80, 24))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    lobby.alpha_composite(glow)

    battle = base.copy()
    battle = ImageEnhance.Contrast(battle).enhance(1.18)
    battle.alpha_composite(vertical_gradient(battle.size, [
        (0.0, (5, 8, 14, 90)), (0.23, (5, 8, 14, 45)), (0.55, (10, 17, 20, 30)), (1.0, (4, 6, 11, 180)),
    ]))
    # arena floor light and vignette are baked so actors remain readable
    arena = Image.new('RGBA', battle.size, (0, 0, 0, 0))
    ad = ImageDraw.Draw(arena)
    ad.ellipse((130, 540, 950, 1500), fill=(52, 159, 137, 28), outline=(116, 245, 210, 46), width=5)
    arena = arena.filter(ImageFilter.GaussianBlur(18))
    battle.alpha_composite(arena)

    save_webp(lobby, LIVE / 'backgrounds' / 'lobby_forest_live_v1.webp', quality=92)
    save_webp(battle, LIVE / 'backgrounds' / 'battle_forest_live_v1.webp', quality=92)
    shutil.copy2(source_path, ART_SOURCE / 'backgrounds' / 'fantasy_rpg_background.png')


def make_portrait_card(source: Image.Image, size: tuple[int, int], tint=(20, 42, 37)) -> Image.Image:
    cover = cover_crop(source.convert('RGBA'), size, focus_y=0.22)
    cover = ImageEnhance.Contrast(cover).enhance(1.08)
    cover = ImageEnhance.Color(cover).enhance(0.88)
    overlay = Image.new('RGBA', size, (*tint, 30))
    cover = Image.alpha_composite(cover, overlay)
    # vignette and bottom fade
    mask = Image.new('L', size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((8, 8, size[0] - 8, size[1] - 8), radius=38, fill=255)
    card = Image.new('RGBA', size, (0, 0, 0, 0))
    card.paste(cover, mask=mask)
    border = ImageDraw.Draw(card)
    border.rounded_rectangle((8, 8, size[0] - 8, size[1] - 8), radius=38, outline=(206, 184, 116, 230), width=5)
    border.rounded_rectangle((16, 16, size[0] - 16, size[1] - 16), radius=31, outline=(102, 231, 207, 95), width=2)
    card.alpha_composite(vertical_gradient(size, [(0.0, (0, 0, 0, 0)), (0.68, (4, 7, 12, 24)), (1.0, (4, 7, 12, 205))]))
    return card


def remove_uniform_background(image: Image.Image, target=(123, 123, 123), tolerance=16) -> Image.Image:
    rgba = image.convert('RGBA')
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            distance = max(abs(r-target[0]), abs(g-target[1]), abs(b-target[2]))
            if distance <= tolerance:
                pixels[x, y] = (r, g, b, 0)
            elif distance <= tolerance * 2:
                pixels[x, y] = (r, g, b, int(a * (distance-tolerance)/tolerance))
    return rgba


def build_portraits() -> None:
    hero_source = Image.open(SOURCE / 'hero_portrait.png').convert('RGBA')
    hero_card = make_portrait_card(hero_source, (720, 960))
    save_webp(hero_card, LIVE / 'portraits' / 'hero_live_v1.webp', quality=94)
    shutil.copy2(SOURCE / 'hero_portrait.png', ART_SOURCE / 'portraits' / 'hero_portrait.png')

    boss_source = Image.open(SOURCE / 'boss_defiledspriggan.png').convert('RGBA')
    boss_clean = remove_uniform_background(boss_source)
    boss_bg = Image.new('RGBA', (720, 720), (9, 11, 19, 255))
    radial = Image.new('RGBA', boss_bg.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(radial)
    rd.ellipse((70, 70, 650, 650), fill=(118, 65, 183, 95), outline=(235, 113, 118, 160), width=7)
    radial = radial.filter(ImageFilter.GaussianBlur(16))
    boss_bg.alpha_composite(radial)
    boss_fit = fit_cell(boss_clean, 680, content_scale=0.92)
    boss_bg.alpha_composite(boss_fit, (20, 20))
    bd = ImageDraw.Draw(boss_bg)
    bd.rounded_rectangle((8, 8, 712, 712), radius=40, outline=(220, 184, 111, 230), width=6)
    save_webp(boss_bg, LIVE / 'portraits' / 'boss_harbinger_live_v1.webp', quality=94)
    shutil.copy2(SOURCE / 'boss_defiledspriggan.png', ART_SOURCE / 'portraits' / 'boss_defiledspriggan.png')


def texture_panel(size: int, base: tuple[int, int, int], border: tuple[int, int, int], accent: tuple[int, int, int], seed: int) -> Image.Image:
    im = Image.new('RGBA', (size, size), (*base, 245))
    px = im.load()
    # deterministic fine grain to avoid flat placeholder appearance
    for y in range(size):
        for x in range(size):
            noise = ((x * 17 + y * 31 + seed * 43) % 17) - 8
            r = max(0, min(255, base[0] + noise))
            g = max(0, min(255, base[1] + noise))
            b = max(0, min(255, base[2] + noise))
            px[x, y] = (r, g, b, 244)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((2, 2, size - 3, size - 3), radius=24, outline=(*border, 255), width=4)
    d.rounded_rectangle((8, 8, size - 9, size - 9), radius=19, outline=(*accent, 120), width=2)
    d.line((18, 12, size - 18, 12), fill=(255, 255, 255, 56), width=2)
    d.line((18, size - 13, size - 18, size - 13), fill=(0, 0, 0, 95), width=3)
    for cx, cy in ((15, 15), (size-16, 15), (15, size-16), (size-16, size-16)):
        d.ellipse((cx-3, cy-3, cx+3, cy+3), fill=(*border, 230), outline=(255,255,255,80))
    # subtle diagonal rune cuts
    for offset in (30, 44, 58):
        d.line((offset, 18, offset + 13, 31), fill=(*accent, 50), width=2)
    return im


def build_ui() -> None:
    cell = 128
    definitions = [
        ('panel', (9, 18, 27), (177, 153, 92), (70, 224, 196), 1),
        ('panel_strong', (5, 10, 17), (210, 181, 105), (93, 231, 205), 2),
        ('panel_gold', (28, 22, 15), (231, 195, 105), (255, 221, 150), 3),
        ('button_primary', (19, 86, 78), (196, 171, 96), (97, 246, 216), 4),
        ('button_secondary', (18, 29, 42), (126, 148, 169), (95, 213, 200), 5),
        ('button_danger', (93, 29, 39), (230, 164, 106), (255, 103, 127), 6),
        ('slot_common', (20, 27, 36), (133, 148, 164), (178, 197, 210), 7),
        ('slot_rare', (17, 38, 57), (90, 181, 225), (107, 224, 255), 8),
        ('slot_heroic', (48, 25, 68), (213, 158, 84), (193, 108, 255), 9),
        ('boss_panel', (39, 12, 23), (226, 151, 96), (247, 82, 105), 10),
        ('resource_chip', (9, 18, 28), (162, 146, 95), (91, 225, 199), 11),
        ('tab_active', (22, 67, 61), (217, 186, 102), (105, 242, 214), 12),
        ('tab_inactive', (14, 23, 34), (97, 117, 135), (62, 148, 141), 13),
        ('action_button', (22, 65, 68), (225, 191, 99), (93, 237, 206), 14),
        ('skill_button', (36, 30, 78), (222, 172, 103), (174, 101, 255), 15),
        ('frame_portrait', (11, 15, 21), (230, 199, 113), (95, 226, 205), 16),
        ('skill_frame', (22, 27, 48), (230, 199, 113), (142, 105, 255), 17),
        ('slot', (20, 27, 36), (133, 148, 164), (178, 197, 210), 18),
    ]
    cells = [(name, texture_panel(cell, base, border, accent, seed)) for name, base, border, accent, seed in definitions]
    atlas, frames = pack_cells(cells, cell, cols=4, anchor=(0.5, 0.5))
    image_path = LIVE / 'atlases' / 'ui' / 'ui_live_v1.webp'
    json_path = LIVE / 'atlases' / 'ui' / 'ui_live_v1.json'
    save_webp(atlas, image_path, quality=96, lossless=True)
    write_atlas(json_path, image_path.name, frames, {}, atlas.size)


def copy_source_assets() -> None:
    # Questquest illustration sources used as portrait candidates, not combat sprites.
    for name in [
        'hero_warlord.png', 'monster_frogling.png', 'monster_giantspider.png',
        'monster_goblinboomer.png', 'monster_fireelemental.png', 'monster_bonegolem.png',
        'monster_crystalgolem.png', 'monster_dragonwhelp.png', 'boss_defiledspriggan.png',
    ]:
        source = SOURCE / name
        if source.exists():
            shutil.copy2(source, ART_SOURCE / 'portraits' / name)


def write_license_manifest() -> None:
    manifest = {
        'release': '1.0.0',
        'qualityStage': 'production-candidate-open-art-pass',
        'policy': 'Only assets with explicit redistributable licenses are included. Procedural v0.9 art is retained only as legacy/non-default content.',
        'assets': [
            {
                'id': 'fantasy-rpg-background', 'usage': ['lobby background', 'chapter 1 battle background'],
                'creator': 'AliHamieh', 'license': 'CC0 1.0', 'source': 'OpenGameArt: Fantasy RPG Background',
            },
            {
                'id': 'character-portrait', 'usage': ['lobby hero portrait'],
                'creator': 'zonked', 'license': 'CC0 1.0', 'source': 'OpenGameArt: Character Portrait',
            },
            {
                'id': 'isometric-knight', 'usage': ['player combat sprite'],
                'creator': 'VWolfdog; based on Clint Bellanger Base Human Mesh', 'license': 'CC-BY 3.0',
                'source': 'OpenGameArt: Isometric Knight NPC',
            },
            {
                'id': 'orc-flare-sheets', 'usage': ['normal and elite combat sprites'],
                'creator': 'johndh and Clint Bellanger', 'license': 'CC-BY-SA 3.0',
                'source': 'OpenGameArt: Orc FLARE sprite sheets',
            },
            {
                'id': 'werebear-flare-sheet', 'usage': ['elite combat sprite'],
                'creator': 'johndh and Clint Bellanger', 'license': 'CC-BY-SA 3.0',
                'source': 'OpenGameArt: Werebear FLARE sprite sheets',
            },
            {
                'id': 'spider-flare-sheets', 'usage': ['normal combat sprites'],
                'creator': 'Wciow and John.d.h / FLARE contributors', 'license': 'CC-BY-SA 3.0',
                'source': 'OpenGameArt: Spider FLARE sprite sheets',
            },
            {
                'id': 'flare-troll', 'usage': ['boss combat sprite'],
                'creator': 'VWolfdog; based on Clint Bellanger Base Human Mesh', 'license': 'CC-BY 3.0',
                'source': 'OpenGameArt: FLARE Model - Troll',
            },
            {
                'id': 'questquest-illustrations', 'usage': ['boss portrait', 'bestiary portrait candidates'],
                'creator': 'Justin Nichol', 'license': 'CC-BY 4.0', 'source': 'GitHub: JustinNichol/questquest',
            },
        ],
    }
    (LIVE / 'licenses' / 'ASSET_LICENSES.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    notice = '''LUMERIFT v1.0.0 third-party art notices\n\nSee docs/THIRD_PARTY_ASSETS.md and ASSET_LICENSES.json for complete attributions.\nAssets are redistributed under their respective CC0, CC-BY 3.0, CC-BY-SA 3.0, or CC-BY 4.0 terms.\nThe CC-BY-SA derivative runtime sprite atlas remains available under CC-BY-SA 3.0.\n'''
    (LIVE / 'licenses' / 'NOTICE.txt').write_text(notice, encoding='utf-8')


def write_summary() -> None:
    files = [path for path in LIVE.rglob('*') if path.is_file()]
    total = sum(path.stat().st_size for path in files)
    summary = {
        'release': '1.0.0',
        'qualityStage': 'production-candidate-open-art-pass',
        'runtimeFiles': len(files),
        'runtimeBytes': total,
        'defaultArt': {
            'player': 'live/v1/atlases/player/player_live_v1.json',
            'monsters': 'live/v1/atlases/monsters/monsters_live_v1.json',
            'ui': 'live/v1/atlases/ui/ui_live_v1.json',
            'lobbyBackground': 'live/v1/backgrounds/lobby_forest_live_v1.webp',
            'battleBackground': 'live/v1/backgrounds/battle_forest_live_v1.webp',
            'heroPortrait': 'live/v1/portraits/hero_live_v1.webp',
            'bossPortrait': 'live/v1/portraits/boss_harbinger_live_v1.webp',
        },
    }
    (PUBLIC / 'LIVE_ART_V100_SUMMARY.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main() -> None:
    ensure_dirs()
    build_player()
    build_monsters()
    build_backgrounds()
    build_portraits()
    build_ui()
    copy_source_assets()
    write_license_manifest()
    write_summary()
    print('PASS generated LUMERIFT v1.0.0 live art runtime pack')


if __name__ == '__main__':
    main()

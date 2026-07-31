#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE_JSON = ROOT / 'public/assets/live/v10/atlases/player/player_premium_body_v10.json'
SOURCE_IMAGE = ROOT / 'public/assets/live/v10/atlases/player/player_premium_body_v10.webp'
OUT_DIR = ROOT / 'public/assets/live/v11/atlases/player'
MASTER_DIR = ROOT / 'art_source/lumerift_original/v1.11.22/character'
OUT_IMAGE = OUT_DIR / 'player_weapon_attack_body_v11.webp'
OUT_JSON = OUT_DIR / 'player_weapon_attack_body_v11.json'
MASTER_IMAGE = MASTER_DIR / 'player_weapon_attack_body_v11_master.png'
SPEC_JSON = MASTER_DIR / 'player_weapon_attack_body_v11_spec.json'

FAMILIES = ('blade', 'greatblade', 'riftlance')
POSES = ('attack1', 'attack2', 'attack3')
DIRECTIONS = ('n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw')
FRAME_SIZE = 112
FRAMES_PER_ANIMATION = 6
COLUMNS = 24

SOURCE_POSE = {
    ('blade', 'attack1'): 'attack1',
    ('blade', 'attack2'): 'attack2',
    ('blade', 'attack3'): 'attack3',
    ('greatblade', 'attack1'): 'attack3',
    ('greatblade', 'attack2'): 'skill1',
    ('greatblade', 'attack3'): 'attack3',
    ('riftlance', 'attack1'): 'attack2',
    ('riftlance', 'attack2'): 'skill2',
    ('riftlance', 'attack3'): 'attack1',
}

SOURCE_ORDER = {
    'blade': (0, 1, 2, 3, 4, 5),
    'greatblade': (0, 0, 1, 2, 3, 4),
    'riftlance': (0, 1, 2, 3, 4, 5),
}

ANGLE = {
    'n': -math.pi / 2,
    'ne': -math.pi / 4,
    'e': 0,
    'se': math.pi / 4,
    's': math.pi / 2,
    'sw': 3 * math.pi / 4,
    'w': math.pi,
    'nw': -3 * math.pi / 4,
}

FAMILY_STYLE = {
    'blade': {'core': (226, 255, 249, 255), 'glow': (74, 244, 222, 180), 'length': 42, 'width': 4},
    'greatblade': {'core': (255, 244, 210, 255), 'glow': (255, 183, 80, 185), 'length': 50, 'width': 9},
    'riftlance': {'core': (235, 230, 255, 255), 'glow': (159, 112, 255, 190), 'length': 58, 'width': 4},
}


def frame_image(source: Image.Image, atlas: dict, frame_name: str) -> Image.Image:
    entry = atlas['frames'][frame_name]['frame']
    crop = source.crop((entry['x'], entry['y'], entry['x'] + entry['w'], entry['y'] + entry['h']))
    canvas = Image.new('RGBA', (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(crop, ((FRAME_SIZE - crop.width) // 2, 10))
    return canvas


def source_frame_name(atlas: dict, family: str, pose: str, direction: str, frame_index: int) -> str:
    source_pose = SOURCE_POSE[(family, pose)]
    animation = atlas['animations'].get(f'player.{source_pose}.{direction}') or atlas['animations'][f'player.{source_pose}.s']
    order = SOURCE_ORDER[family]
    source_index = min(len(animation) - 1, order[frame_index])
    return animation[source_index]


def point(origin: tuple[float, float], angle: float, distance: float, lateral: float = 0) -> tuple[float, float]:
    dx, dy = math.cos(angle), math.sin(angle)
    px, py = -dy, dx
    return origin[0] + dx * distance + px * lateral, origin[1] + dy * distance + py * lateral


def draw_weapon(frame: Image.Image, family: str, pose: str, direction: str, frame_index: int) -> Image.Image:
    style = FAMILY_STYLE[family]
    base_angle = ANGLE[direction]
    progress = frame_index / (FRAMES_PER_ANIMATION - 1)
    pose_bias = {'attack1': -0.42, 'attack2': 0.18, 'attack3': 0.55}[pose]
    if family == 'greatblade':
        sweep = (-0.72 + progress * 1.25) + pose_bias * 0.45
    elif family == 'riftlance':
        sweep = (-0.08 + math.sin(progress * math.pi) * 0.08) + pose_bias * 0.12
    else:
        sweep = (-0.62 + progress * 1.12) + pose_bias * 0.38
    angle = base_angle + sweep
    reach_pulse = math.sin(progress * math.pi)
    length = style['length'] + reach_pulse * (8 if family == 'riftlance' else 5)
    origin = (56 + math.cos(base_angle) * 2, 56 + math.sin(base_angle) * 2)
    start = point(origin, angle, 7)
    end = point(origin, angle, length)

    glow_layer = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_width = style['width'] + (9 if family == 'greatblade' else 7)
    glow_draw.line((start, end), fill=style['glow'], width=glow_width)
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=4.2 if family == 'greatblade' else 3.2))
    frame = Image.alpha_composite(frame, glow_layer)

    weapon = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(weapon)
    px, py = -math.sin(angle), math.cos(angle)
    if family == 'greatblade':
        half = style['width'] / 2
        guard = point(origin, angle, 10)
        points = [
            (guard[0] + px * half, guard[1] + py * half),
            (end[0] + px * (half * 0.42), end[1] + py * (half * 0.42)),
            point(end, angle, 7),
            (end[0] - px * (half * 0.42), end[1] - py * (half * 0.42)),
            (guard[0] - px * half, guard[1] - py * half),
        ]
        draw.polygon(points, fill=style['core'])
        draw.line((guard, end), fill=(255, 207, 115, 255), width=2)
        draw.line((point(origin, angle, 3, -8), point(origin, angle, 3, 8)), fill=(255, 218, 139, 255), width=3)
    elif family == 'riftlance':
        draw.line((start, end), fill=(93, 78, 126, 255), width=style['width'] + 2)
        draw.line((start, end), fill=style['core'], width=style['width'])
        tip = point(end, angle, 9)
        left = point(end, angle, -2, 5)
        right = point(end, angle, -2, -5)
        draw.polygon((left, tip, right), fill=(216, 200, 255, 255))
        draw.ellipse((start[0] - 3, start[1] - 3, start[0] + 3, start[1] + 3), fill=(178, 129, 255, 255))
    else:
        draw.line((start, end), fill=(54, 91, 96, 255), width=style['width'] + 3)
        draw.line((start, end), fill=style['core'], width=style['width'])
        tip = point(end, angle, 6)
        draw.polygon((point(end, angle, -1, 3), tip, point(end, angle, -1, -3)), fill=(237, 255, 251, 255))
        draw.line((point(origin, angle, 4, -6), point(origin, angle, 4, 6)), fill=(124, 246, 226, 255), width=3)

    contact_index = 3 if family != 'greatblade' else 4
    if frame_index == contact_index:
        flare = point(end, angle, 4)
        radius = 8 if family == 'greatblade' else 6
        draw.ellipse((flare[0] - radius, flare[1] - radius, flare[0] + radius, flare[1] + radius), outline=style['core'], width=2)
        draw.line((point(flare, angle + math.pi / 2, radius + 4), point(flare, angle - math.pi / 2, radius + 4)), fill=style['core'], width=2)
    return Image.alpha_composite(frame, weapon)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    MASTER_DIR.mkdir(parents=True, exist_ok=True)
    atlas = json.loads(SOURCE_JSON.read_text(encoding='utf-8'))
    source = Image.open(SOURCE_IMAGE).convert('RGBA')
    total = len(FAMILIES) * len(POSES) * len(DIRECTIONS) * FRAMES_PER_ANIMATION
    rows = math.ceil(total / COLUMNS)
    sheet = Image.new('RGBA', (COLUMNS * FRAME_SIZE, rows * FRAME_SIZE), (0, 0, 0, 0))
    frames: dict[str, dict] = {}
    animations: dict[str, list[str]] = {}
    cursor = 0
    for family in FAMILIES:
        for pose in POSES:
            for direction in DIRECTIONS:
                animation_key = f'weapon_body.{family}.{pose}.{direction}'
                animation_frames: list[str] = []
                for frame_index in range(FRAMES_PER_ANIMATION):
                    source_name = source_frame_name(atlas, family, pose, direction, frame_index)
                    frame = frame_image(source, atlas, source_name)
                    frame = draw_weapon(frame, family, pose, direction, frame_index)
                    x = (cursor % COLUMNS) * FRAME_SIZE
                    y = (cursor // COLUMNS) * FRAME_SIZE
                    sheet.alpha_composite(frame, (x, y))
                    frame_name = f'{animation_key}.{frame_index:02d}'
                    frames[frame_name] = {
                        'frame': {'x': x, 'y': y, 'w': FRAME_SIZE, 'h': FRAME_SIZE},
                        'rotated': False,
                        'trimmed': False,
                        'spriteSourceSize': {'x': 0, 'y': 0, 'w': FRAME_SIZE, 'h': FRAME_SIZE},
                        'sourceSize': {'w': FRAME_SIZE, 'h': FRAME_SIZE},
                        'anchor': {'x': 0.5, 'y': 0.76},
                    }
                    animation_frames.append(frame_name)
                    cursor += 1
                animations[animation_key] = animation_frames

    sheet.save(MASTER_IMAGE, optimize=True)
    sheet.save(OUT_IMAGE, 'WEBP', lossless=True, method=6)
    payload = {
        'frames': frames,
        'animations': animations,
        'meta': {
            'app': 'LUMERIFT weapon-specific attack body derivative pipeline',
            'version': '1.11.22',
            'image': OUT_IMAGE.name,
            'format': 'RGBA8888',
            'size': {'w': sheet.width, 'h': sheet.height},
            'scale': '1',
            'lumeriftWeaponAttackBody': True,
            'source': 'player_premium_body_v10 licensed runtime derivative',
            'productionStatus': 'production-candidate-generated-derivative',
        },
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    spec = {
        'asset': 'player_weapon_attack_body_v11',
        'release': '1.11.22',
        'runtime': str(OUT_IMAGE.relative_to(ROOT)).replace('\\', '/'),
        'atlas': str(OUT_JSON.relative_to(ROOT)).replace('\\', '/'),
        'master': MASTER_IMAGE.name,
        'source': str(SOURCE_IMAGE.relative_to(ROOT)).replace('\\', '/'),
        'families': list(FAMILIES),
        'poses': list(POSES),
        'directions': list(DIRECTIONS),
        'framesPerAnimation': FRAMES_PER_ANIMATION,
        'frameSize': [FRAME_SIZE, FRAME_SIZE],
        'frames': len(frames),
        'animations': len(animations),
        'productionStatus': 'production-candidate-generated-derivative',
        'note': '전용 무기 실루엣과 접촉 프레임을 v10 본체 파생 프레임에 합성한 모바일 제작용 후보입니다. 수작업 최종 원화로 주장하지 않습니다.',
    }
    SPEC_JSON.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'generated {len(frames)} frames / {len(animations)} animations / {sheet.width}x{sheet.height}')


if __name__ == '__main__':
    main()

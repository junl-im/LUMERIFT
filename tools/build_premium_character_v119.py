#!/usr/bin/env python3
"""Build the LUMERIFT v1.11.19 premium directional player body atlas.

The generated runtime atlas is a mobile-sized derivative of the licensed v4
knight sheet. It keeps gameplay animation timing intact while adding distinct
8-direction silhouettes, cape/hair motion, armor plating, rune highlights and
state-aware material treatment.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE_JSON = ROOT / "public/assets/live/v4/atlases/player/player_live_v4.json"
SOURCE_IMAGE = ROOT / "public/assets/live/v4/atlases/player/player_live_v4.webp"
OUT_DIR = ROOT / "public/assets/live/v10/atlases/player"
OUT_JSON = OUT_DIR / "player_premium_body_v10.json"
OUT_IMAGE = OUT_DIR / "player_premium_body_v10.webp"
MASTER_DIR = ROOT / "art_source/lumerift_original/v1.11.19/character"
MASTER_IMAGE = MASTER_DIR / "player_premium_body_v10_master.png"
MASTER_SPEC = MASTER_DIR / "player_premium_body_v10_spec.json"

RENDER = 144
CELL = 88
COLS = 20
DIRECTIONS = ("n", "ne", "e", "se", "s", "sw", "w", "nw")
STATE_ORDER = ("idle", "run", "attack1", "attack2", "attack3", "skill1", "skill2", "hit", "death", "dodge")
DIRECTION_VECTOR = {
    "n": (0.0, -1.0),
    "ne": (0.707, -0.707),
    "e": (1.0, 0.0),
    "se": (0.707, 0.707),
    "s": (0.0, 1.0),
    "sw": (-0.707, 0.707),
    "w": (-1.0, 0.0),
    "nw": (-0.707, -0.707),
}

PALETTE = {
    "ink": (7, 13, 21, 255),
    "steel": (158, 183, 195, 255),
    "steel_bright": (225, 241, 239, 255),
    "teal": (83, 240, 218, 255),
    "teal_soft": (84, 198, 204, 190),
    "gold": (244, 198, 105, 255),
    "violet": (183, 118, 255, 220),
    "cape": (19, 36, 51, 238),
    "cape_light": (49, 93, 112, 190),
}


def load_source() -> tuple[dict[str, Any], Image.Image]:
    return json.loads(SOURCE_JSON.read_text(encoding="utf-8")), Image.open(SOURCE_IMAGE).convert("RGBA")


def crop_frame(atlas: Image.Image, payload: dict[str, Any], key: str) -> Image.Image:
    frame = payload["frames"][key]["frame"]
    return atlas.crop((frame["x"], frame["y"], frame["x"] + frame["w"], frame["y"] + frame["h"]))


def fit_source(frame: Image.Image, direction: str, state: str, phase: float) -> Image.Image:
    # Isolate the dense character body from the source weapon trail. The v4
    # source includes long weapon pixels that would otherwise pull the body
    # off-center when producing unique direction frames.
    alpha = frame.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return Image.new("RGBA", (RENDER, RENDER), (0, 0, 0, 0))
    pixels = alpha.load()
    total = 0
    weighted_x = 0
    for y in range(bbox[1], bbox[3]):
        for x in range(bbox[0], bbox[2]):
            value = pixels[x, y]
            if value < 18:
                continue
            # Strong alpha is mostly body/armor; faint trails receive less weight.
            weight = value * value
            total += weight
            weighted_x += x * weight
    center_x = weighted_x / total if total else (bbox[0] + bbox[2]) / 2
    bottom = bbox[3]
    crop_w = 118
    crop_h = 174
    left = max(0, min(frame.width - crop_w, int(center_x - crop_w * 0.5)))
    top = max(0, min(frame.height - crop_h, bottom - crop_h))
    cropped = frame.crop((left, top, left + crop_w, top + crop_h))

    dx, dy = DIRECTION_VECTOR[direction]
    target_h = 132 if state not in {"death", "dodge"} else 124
    target_w = max(74, int(cropped.width * target_h / max(1, cropped.height)))
    perspective = 0.93 + abs(dx) * 0.07 - (0.025 if direction == "n" else 0)
    target_w = max(72, min(106, int(target_w * perspective)))
    body = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
    if dx < -0.05:
        body = ImageOps.mirror(body)

    lean = dx * (2.4 if state in {"idle", "run"} else 4.2)
    if state == "dodge":
        lean += dx * 3.5
    shear = math.tan(math.radians(lean))
    transformed = body.transform(
        body.size,
        Image.Transform.AFFINE,
        (1, shear, -shear * body.height * 0.42, 0, 1, 0),
        resample=Image.Resampling.BICUBIC,
    )
    transformed = ImageEnhance.Contrast(transformed).enhance(1.13)
    transformed = ImageEnhance.Color(transformed).enhance(1.08)
    transformed = ImageEnhance.Sharpness(transformed).enhance(1.22)

    canvas = Image.new("RGBA", (RENDER, RENDER), (0, 0, 0, 0))
    lift = -3 if dy < -0.25 else 0
    if state == "run":
        lift -= int(abs(math.sin(phase * math.pi * 2)) * 2)
    if state in {"skill1", "skill2"}:
        lift -= int(math.sin(phase * math.pi) * 4)
    x = (RENDER - transformed.width) // 2 + int(dx * 3)
    y = RENDER - transformed.height - 3 + lift
    canvas.alpha_composite(transformed, (x, y))
    return canvas

def alpha_outline(body: Image.Image, color: tuple[int, int, int, int], radius: int = 3) -> Image.Image:
    alpha = body.getchannel("A")
    expanded = alpha.filter(ImageFilter.MaxFilter(radius * 2 + 1))
    outline_alpha = ImageChops.subtract(expanded, alpha).point(lambda value: int(value * 0.72))
    outline = Image.new("RGBA", body.size, color)
    outline.putalpha(outline_alpha)
    return outline


def draw_back_layer(direction: str, state: str, phase: float) -> Image.Image:
    layer = Image.new("RGBA", (RENDER, RENDER), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    dx, dy = DIRECTION_VECTOR[direction]
    cx, cy = RENDER * 0.5, RENDER * 0.53
    sway = math.sin(phase * math.pi * 2) * (4.5 if state == "run" else 1.8)
    motion = 11 if state in {"run", "dodge", "attack1", "attack2", "attack3"} else 6
    back_x = -dx * motion + (-dy * sway)
    back_y = -dy * motion + (dx * sway)
    shoulder_l = (cx - 12 - dx * 3, cy - 12 - dy * 3)
    shoulder_r = (cx + 12 - dx * 3, cy - 12 - dy * 3)
    tail = (cx + back_x, cy + 42 + back_y)
    draw.polygon([
        shoulder_l, shoulder_r,
        (tail[0] + 13, tail[1] - 2),
        (tail[0] + 5, tail[1] + 8),
        (tail[0] - 7, tail[1] + 5),
        (tail[0] - 14, tail[1] - 3),
    ], fill=PALETTE["cape"])
    draw.line([shoulder_l, (tail[0] - 7, tail[1] - 2)], fill=PALETTE["cape_light"], width=2)
    draw.line([shoulder_r, (tail[0] + 7, tail[1] - 3)], fill=(75, 137, 151, 105), width=2)

    ribbon_len = 21 if state in {"run", "attack1", "attack2", "attack3", "dodge"} else 15
    origin = (cx - dx * 3, cy - 31 - dy * 2)
    perp = (-dy, dx)
    for side in (-1, 1):
        end = (
            origin[0] - dx * ribbon_len + perp[0] * side * (4 + sway * 0.22),
            origin[1] - dy * ribbon_len + 8 + perp[1] * side * (4 + sway * 0.22),
        )
        draw.line([origin, end], fill=(24, 15, 23, 225), width=3)
        draw.line([origin, end], fill=(117, 76, 94, 125), width=1)
    return layer.filter(ImageFilter.GaussianBlur(0.28))


def draw_front_layer(direction: str, state: str, phase: float) -> Image.Image:
    layer = Image.new("RGBA", (RENDER, RENDER), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    dx, dy = DIRECTION_VECTOR[direction]
    cx, cy = RENDER * 0.5, RENDER * 0.49
    attack_boost = 1.0 if state.startswith("attack") else 1.22 if state.startswith("skill") else 0.72
    pulse = 0.72 + 0.28 * math.sin(phase * math.pi)
    near_shift = dx * 3

    # Compact shoulder plates preserve the source anatomy instead of covering it.
    left_plate = [
        (cx - 20 + near_shift, cy - 5),
        (cx - 11 + near_shift, cy - 10),
        (cx - 7 + near_shift, cy - 1),
        (cx - 14 + near_shift, cy + 5),
    ]
    right_plate = [
        (cx + 7 + near_shift, cy - 1),
        (cx + 11 + near_shift, cy - 10),
        (cx + 20 + near_shift, cy - 5),
        (cx + 14 + near_shift, cy + 5),
    ]
    draw.polygon(left_plate, fill=(69, 101, 116, 175), outline=(211, 234, 234, 205))
    draw.polygon(right_plate, fill=(64, 86, 103, 175), outline=(244, 198, 105, 195))

    rune_alpha = int(128 + 105 * pulse * attack_boost)
    rune_y = cy + 8
    draw.polygon([(cx, rune_y - 6), (cx + 5, rune_y), (cx, rune_y + 8), (cx - 5, rune_y)], fill=(83, 240, 218, rune_alpha))
    draw.line([(cx, rune_y - 4), (cx, rune_y + 6)], fill=(238, 255, 249, min(255, rune_alpha + 30)), width=1)

    face_factor = 0.45 if direction in {"n", "ne", "nw"} else 1.0
    draw.arc((cx - 13, cy - 31, cx + 13, cy - 10), 205, 335, fill=(231, 245, 238, int(165 * face_factor)), width=2)
    draw.line([(cx - 12, cy + 17), (cx - 8, cy + 35)], fill=(221, 238, 236, int(115 * face_factor)), width=1)
    draw.line([(cx + 12, cy + 17), (cx + 8, cy + 35)], fill=(244, 198, 105, int(115 * face_factor)), width=1)

    if state.startswith("skill"):
        radius = 21 + int(3 * pulse)
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=(83, 240, 218, 100), width=2)
        draw.arc((cx - radius - 4, cy - radius - 4, cx + radius + 4, cy + radius + 4), 20, 155, fill=(183, 118, 255, 105), width=2)
    elif state == "dodge":
        perp = (-dy, dx)
        for offset in (-7, 0, 7):
            start = (cx - dx * 13 + perp[0] * offset, cy - dy * 13 + perp[1] * offset)
            end = (cx - dx * 38 + perp[0] * offset, cy - dy * 38 + perp[1] * offset)
            draw.line([start, end], fill=(83, 240, 218, 72), width=1)
    return layer.filter(ImageFilter.GaussianBlur(0.18))

def render_frame(source: Image.Image, direction: str, state: str, index: int, count: int) -> Image.Image:
    phase = 0 if count <= 1 else index / (count - 1)
    body = fit_source(source, direction, state, phase)
    back = draw_back_layer(direction, state, phase)
    front = draw_front_layer(direction, state, phase)
    outline = alpha_outline(body, (8, 18, 27, 225), 3)
    teal_outline = alpha_outline(body, (69, 230, 208, 92), 1)
    composite = Image.new("RGBA", (RENDER, RENDER), (0, 0, 0, 0))
    composite.alpha_composite(back)
    composite.alpha_composite(outline)
    composite.alpha_composite(teal_outline)
    composite.alpha_composite(body)
    composite.alpha_composite(front)
    return composite.resize((CELL, CELL), Image.Resampling.LANCZOS)

def build() -> None:
    payload, source_atlas = load_source()
    frame_cache: dict[str, Image.Image] = {}
    frames: dict[str, Any] = {}
    animations: dict[str, list[str]] = {}
    rendered: list[tuple[str, Image.Image]] = []

    for state in STATE_ORDER:
        for direction in DIRECTIONS:
            animation_key = f"player.{state}.{direction}"
            source_keys = payload["animations"][animation_key]
            target_keys: list[str] = []
            for index, source_key in enumerate(source_keys):
                source_frame = frame_cache.get(source_key)
                if source_frame is None:
                    source_frame = crop_frame(source_atlas, payload, source_key)
                    frame_cache[source_key] = source_frame
                frame_key = f"premium_body.{state}.{direction}.{index:02d}"
                image = render_frame(source_frame, direction, state, index, len(source_keys))
                rendered.append((frame_key, image))
                target_keys.append(frame_key)
            animations[animation_key] = target_keys

    rows = math.ceil(len(rendered) / COLS)
    atlas = Image.new("RGBA", (COLS * CELL, rows * CELL), (0, 0, 0, 0))
    for frame_index, (key, image) in enumerate(rendered):
        x = (frame_index % COLS) * CELL
        y = (frame_index // COLS) * CELL
        atlas.alpha_composite(image, (x, y))
        frames[key] = {
            "frame": {"x": x, "y": y, "w": CELL, "h": CELL},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": CELL, "h": CELL},
            "sourceSize": {"w": CELL, "h": CELL},
            "anchor": {"x": 0.5, "y": 0.79},
        }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT_IMAGE, "WEBP", quality=50, method=6, alpha_quality=64)
    output = {
        "frames": frames,
        "animations": animations,
        "meta": {
            "app": "LUMERIFT premium directional body pipeline",
            "version": "1.11.19",
            "image": OUT_IMAGE.name,
            "format": "RGBA8888",
            "size": {"w": atlas.width, "h": atlas.height},
            "scale": "1",
            "lumeriftDirectionalBody": True,
            "source": "player_live_v4 licensed runtime derivative",
        },
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Mobile production master: a representative 8-direction x 4-state contact sheet.
    MASTER_DIR.mkdir(parents=True, exist_ok=True)
    showcase_states = ("idle", "run", "attack3", "skill2")
    master_cell = 192
    master = Image.new("RGBA", (len(DIRECTIONS) * master_cell, len(showcase_states) * master_cell), (5, 10, 17, 255))
    for row, state in enumerate(showcase_states):
        for col, direction in enumerate(DIRECTIONS):
            key = animations[f"player.{state}.{direction}"][len(animations[f"player.{state}.{direction}"]) // 2]
            entry = frames[key]["frame"]
            tile = atlas.crop((entry["x"], entry["y"], entry["x"] + CELL, entry["y"] + CELL)).resize((master_cell, master_cell), Image.Resampling.LANCZOS)
            master.alpha_composite(tile, (col * master_cell, row * master_cell))
    master.save(MASTER_IMAGE, "PNG", optimize=True)
    spec = {
        "release": "1.11.19",
        "asset": "player_premium_body_v10",
        "runtime": str(OUT_IMAGE.relative_to(ROOT)).replace("\\", "/"),
        "source": str(SOURCE_IMAGE.relative_to(ROOT)).replace("\\", "/"),
        "directions": list(DIRECTIONS),
        "states": list(STATE_ORDER),
        "runtimeFrameSize": [CELL, CELL],
        "runtimeFrameCount": len(rendered),
        "animationCount": len(animations),
        "policy": "mobile production master; derived from licensed v4 knight; PNG/WebP only",
        "notes": [
            "direction-specific cape, hair, shoulder plates and rune highlights",
            "gameplay timing and animation keys preserved",
            "no collision, AttackFootprint or Player Save changes",
        ],
    }
    MASTER_SPEC.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"PASS premium player body v10: {len(rendered)} frames, {len(animations)} animations, {atlas.width}x{atlas.height}")


if __name__ == "__main__":
    build()

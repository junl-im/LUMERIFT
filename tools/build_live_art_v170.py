from __future__ import annotations

import json
import math
import random
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/live/v4'
SOURCE = ROOT / 'art_source/open_art/v1.0.0'


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def shifted(mask: Image.Image, x: int, y: int) -> Image.Image:
    result = Image.new('L', mask.size, 0)
    result.paste(mask, (x, y))
    return result


def color_layer(size: tuple[int, int], color: tuple[int, int, int], alpha: Image.Image) -> Image.Image:
    layer = Image.new('RGBA', size, (*color, 0))
    layer.putalpha(alpha)
    return layer


def screen(a: Image.Image, b: Image.Image) -> Image.Image:
    return ImageChops.screen(a.convert('RGB'), b.convert('RGB')).convert('RGBA')


def enhance_sprite(
    frame: Image.Image,
    primary: tuple[int, int, int],
    accent: tuple[int, int, int],
    *,
    strength: float = 0.25,
) -> Image.Image:
    frame = frame.convert('RGBA')
    alpha = frame.getchannel('A')
    if alpha.getbbox() is None:
        return frame

    rgb = frame.convert('RGB')
    rgb = ImageEnhance.Brightness(rgb).enhance(1.22)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.17)
    rgb = ImageEnhance.Color(rgb).enhance(1.10)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.45)

    gray = ImageOps.grayscale(rgb)
    colorized = ImageOps.colorize(gray, black=(4, 8, 13), white=primary)
    rgb = Image.blend(rgb, colorized, strength)

    # Warm metallic highlights while retaining the source detail.
    highlights = gray.point(lambda p: max(0, min(255, int((p - 128) * 1.7))))
    accent_layer = Image.new('RGB', frame.size, accent)
    accent_mix = Image.composite(accent_layer, rgb, highlights)
    rgb = Image.blend(rgb, accent_mix, 0.12)

    body = rgb.convert('RGBA')
    body.putalpha(alpha)

    # Dark silhouette outline + colored rim light for mobile readability.
    expanded = alpha.filter(ImageFilter.MaxFilter(7))
    outline_mask = ImageChops.subtract(expanded, alpha).point(lambda p: int(p * 0.92))
    outline = color_layer(frame.size, (2, 7, 11), outline_mask)

    rim_source = shifted(alpha, -2, -2)
    rim_mask = ImageChops.subtract(rim_source, alpha.filter(ImageFilter.MinFilter(3)))
    rim_mask = rim_mask.point(lambda p: min(150, int(p * 0.72)))
    rim = color_layer(frame.size, accent, rim_mask)

    glow_mask = expanded.filter(ImageFilter.GaussianBlur(4)).point(lambda p: int(p * 0.16))
    glow = color_layer(frame.size, accent, glow_mask)

    result = Image.alpha_composite(glow, outline)
    result = Image.alpha_composite(result, body)
    result = Image.alpha_composite(result, rim)
    return result


def build_processed_atlas(
    source_json: Path,
    source_image: Path,
    output_json: Path,
    output_image: Path,
    palette_for_name,
) -> tuple[int, int]:
    data = json.loads(source_json.read_text(encoding='utf-8'))
    image = Image.open(source_image).convert('RGBA')
    source_alpha = image.getchannel('A')
    result = Image.new('RGBA', image.size, (0, 0, 0, 0))

    for name, entry in data['frames'].items():
        box = entry['frame']
        x, y, w, h = box['x'], box['y'], box['w'], box['h']
        frame = image.crop((x, y, x + w, y + h)).convert('RGBA')
        alpha = frame.getchannel('A')
        primary, accent, strength = palette_for_name(name)
        rgb = frame.convert('RGB')
        rgb = ImageEnhance.Brightness(rgb).enhance(1.24)
        rgb = ImageEnhance.Contrast(rgb).enhance(1.16)
        rgb = ImageEnhance.Color(rgb).enhance(1.10)
        gray = ImageOps.grayscale(rgb)
        colorized = ImageOps.colorize(gray, black=(4, 8, 13), white=primary)
        rgb = Image.blend(rgb, colorized, strength)
        highlight = gray.point(lambda value: 255 if value > 168 else 0)
        accent_layer = Image.new('RGB', frame.size, accent)
        rgb = Image.blend(rgb, Image.composite(accent_layer, rgb, highlight), 0.10)
        processed = rgb.convert('RGBA')
        processed.putalpha(alpha)
        result.alpha_composite(processed, (x, y))

    # One global readability pass is dramatically faster than filtering every frame.
    expanded = source_alpha.filter(ImageFilter.MaxFilter(5))
    outline_mask = ImageChops.subtract(expanded, source_alpha).point(lambda value: int(value * 0.90))
    outline = color_layer(image.size, (2, 7, 11), outline_mask)
    glow_mask = expanded.filter(ImageFilter.GaussianBlur(2.2)).point(lambda value: int(value * 0.10))
    glow = color_layer(image.size, (103, 225, 214), glow_mask)
    result = Image.alpha_composite(glow, outline)
    result = Image.alpha_composite(result, Image.new('RGBA', image.size, (0, 0, 0, 0))) if False else result
    result = Image.alpha_composite(result, Image.new('RGBA', image.size, (0, 0, 0, 0))) if False else result
    # Composite the processed body over the outline/glow.
    body = Image.new('RGBA', image.size, (0, 0, 0, 0))
    for name, entry in data['frames'].items():
        box = entry['frame']
        x, y, w, h = box['x'], box['y'], box['w'], box['h']
        frame = image.crop((x, y, x + w, y + h)).convert('RGBA')
        alpha = frame.getchannel('A')
        primary, accent, strength = palette_for_name(name)
        rgb = frame.convert('RGB')
        rgb = ImageEnhance.Brightness(rgb).enhance(1.24)
        rgb = ImageEnhance.Contrast(rgb).enhance(1.16)
        rgb = ImageEnhance.Color(rgb).enhance(1.10)
        gray = ImageOps.grayscale(rgb)
        rgb = Image.blend(rgb, ImageOps.colorize(gray, black=(4, 8, 13), white=primary), strength)
        processed = rgb.convert('RGBA')
        processed.putalpha(alpha)
        body.alpha_composite(processed, (x, y))
    result = Image.alpha_composite(result, body)

    ensure_parent(output_image)
    result.save(output_image, 'WEBP', lossless=False, quality=88, method=3, alpha_quality=96)
    data['meta']['image'] = output_image.name
    data['meta']['app'] = 'LUMERIFT v1.7 live-art unification pipeline'
    data['meta']['version'] = '1.7.0'
    ensure_parent(output_json)
    output_json.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return len(data['frames']), len(data.get('animations', {}))


def player_palette(_name: str):
    return (113, 196, 204), (246, 202, 112), 0.30


def monster_palette(name: str):
    palettes = {
        'monster_crawler': ((112, 90, 170), (210, 105, 255), 0.30),
        'monster_brute': ((165, 126, 82), (255, 188, 92), 0.22),
        'monster_wisp': ((75, 169, 174), (123, 245, 236), 0.30),
        'monster_spitter': ((87, 144, 103), (155, 244, 129), 0.30),
        'monster_shade': ((88, 78, 150), (193, 120, 255), 0.34),
        'monster_warden': ((132, 146, 154), (249, 199, 100), 0.20),
        'monster_mender': ((98, 160, 146), (145, 255, 205), 0.28),
        'boss_harbinger': ((142, 72, 74), (255, 105, 109), 0.30),
    }
    for key, value in palettes.items():
        if key in name:
            return value
    return (130, 145, 150), (104, 225, 215), 0.22


def draw_particles(draw: ImageDraw.ImageDraw, seed: int, palette: tuple[int, int, int], count: int, area: tuple[int, int, int, int]) -> None:
    rng = random.Random(seed)
    x0, y0, x1, y1 = area
    for _ in range(count):
        x = rng.randint(x0, x1)
        y = rng.randint(y0, y1)
        r = rng.choice((1, 1, 2, 2, 3))
        alpha = rng.randint(30, 105)
        draw.ellipse((x-r, y-r, x+r, y+r), fill=(*palette, alpha))


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int, int], bottom: tuple[int, int, int, int]) -> Image.Image:
    w, h = size
    img = Image.new('RGBA', size)
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(round(top[i] * (1-t) + bottom[i] * t) for i in range(4))
        for x in range(w):
            px[x, y] = c
    return img


def make_background(
    source: Image.Image,
    output: Path,
    *,
    seed: int,
    top_tint: tuple[int, int, int],
    ground_tint: tuple[int, int, int],
    rift_tint: tuple[int, int, int],
    corruption: float,
    arena_y: int,
) -> None:
    base = ImageOps.fit(source.convert('RGB'), (540, 960), method=Image.Resampling.LANCZOS, centering=(0.56, 0.48)).convert('RGBA')
    base = ImageEnhance.Contrast(base).enhance(1.08)
    base = ImageEnhance.Color(base).enhance(0.82)

    tint = vertical_gradient((540, 960), (*top_tint, 105), (*ground_tint, 150))
    base = Image.alpha_composite(base, tint)

    # Ground readability zone.
    ground = Image.new('RGBA', base.size, (0, 0, 0, 0))
    g = ImageDraw.Draw(ground, 'RGBA')
    g.ellipse((-110, arena_y - 170, 650, arena_y + 270), fill=(*ground_tint, 126), outline=(*rift_tint, 128), width=4)
    g.ellipse((-35, arena_y - 115, 575, arena_y + 205), outline=(*rift_tint, 72), width=2)
    for radius, alpha in ((245, 52), (175, 38), (105, 28)):
        g.ellipse((270-radius, arena_y-radius*0.52, 270+radius, arena_y+radius*0.52), outline=(*rift_tint, alpha), width=2)

    # Perspective rune spokes.
    for angle in range(0, 360, 30):
        a = math.radians(angle)
        x1 = 270 + math.cos(a) * 60
        y1 = arena_y + math.sin(a) * 26
        x2 = 270 + math.cos(a) * 300
        y2 = arena_y + math.sin(a) * 150
        g.line((x1, y1, x2, y2), fill=(*rift_tint, int(28 + corruption * 42)), width=2)

    ground = ground.filter(ImageFilter.GaussianBlur(1.2))
    base = Image.alpha_composite(base, ground)

    # Rift column and fog layers.
    effects = Image.new('RGBA', base.size, (0, 0, 0, 0))
    e = ImageDraw.Draw(effects, 'RGBA')
    rift_x = 270 + int(math.sin(seed) * 45)
    for width, alpha in ((85, 16), (55, 24), (24, 42), (8, 95)):
        e.rounded_rectangle((rift_x-width, 65, rift_x+width, arena_y-75), radius=width//2, fill=(*rift_tint, int(alpha * corruption)))
    e.ellipse((rift_x-115, 125, rift_x+115, 355), outline=(*rift_tint, int(105*corruption)), width=5)
    e.ellipse((rift_x-76, 162, rift_x+76, 318), outline=(245, 239, 210, int(60*corruption)), width=2)
    draw_particles(e, seed, rift_tint, int(34 + corruption * 35), (30, 90, 510, 790))
    effects = effects.filter(ImageFilter.GaussianBlur(1.5))
    base = Image.alpha_composite(base, effects)

    # Top HUD contrast and bottom control contrast.
    shade = vertical_gradient((540, 960), (2, 5, 8, 175), (1, 3, 6, 105))
    shade.putalpha(Image.new('L', (540, 960), 0))
    alpha = Image.new('L', (540, 960), 0)
    ad = ImageDraw.Draw(alpha)
    ad.rectangle((0, 0, 540, 205), fill=150)
    ad.rectangle((0, 775, 540, 960), fill=115)
    alpha = alpha.filter(ImageFilter.GaussianBlur(45))
    shade.putalpha(alpha)
    base = Image.alpha_composite(base, shade)

    ensure_parent(output)
    base.convert('RGB').save(output, 'WEBP', quality=88, method=3)


def make_lobby_background(source: Image.Image, output: Path) -> None:
    base = ImageOps.fit(source.convert('RGB'), (540, 960), method=Image.Resampling.LANCZOS, centering=(0.42, 0.50)).convert('RGBA')
    base = ImageEnhance.Contrast(base).enhance(1.12)
    base = ImageEnhance.Color(base).enhance(0.88)
    overlay = vertical_gradient((540, 960), (4, 18, 23, 92), (3, 7, 12, 180))
    base = Image.alpha_composite(base, overlay)
    light = Image.new('RGBA', base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(light, 'RGBA')
    d.ellipse((-120, 100, 480, 820), fill=(95, 216, 202, 30))
    d.ellipse((110, 130, 620, 810), outline=(244, 202, 112, 50), width=3)
    draw_particles(d, 1701, (115, 235, 216), 70, (20, 80, 520, 800))
    light = light.filter(ImageFilter.GaussianBlur(7))
    base = Image.alpha_composite(base, light)
    ensure_parent(output)
    base.convert('RGB').save(output, 'WEBP', quality=88, method=3)


def enhance_portrait(source_path: Path, output_path: Path, primary: tuple[int,int,int], accent: tuple[int,int,int], *, phase: int = 0) -> None:
    src = Image.open(source_path).convert('RGBA')
    src = ImageOps.fit(src, (720, 960) if 'hero' in output_path.name else (720, 720), method=Image.Resampling.LANCZOS)
    src = ImageEnhance.Brightness(src).enhance(1.08)
    src = ImageEnhance.Contrast(src).enhance(1.15)
    src = ImageEnhance.Color(src).enhance(1.08)
    gray = ImageOps.grayscale(src.convert('RGB'))
    grade = ImageOps.colorize(gray, black=(3, 7, 11), white=primary).convert('RGBA')
    result = Image.blend(src, grade, 0.18 + phase * 0.04)
    effect = Image.new('RGBA', result.size, (0,0,0,0))
    d = ImageDraw.Draw(effect, 'RGBA')
    w,h = result.size
    d.ellipse((w*0.10, h*0.08, w*0.90, h*0.96), outline=(*accent, 78 + phase*35), width=7+phase*2)
    if phase:
        for i in range(8 + phase*4):
            a = math.radians(i * (360 / (8 + phase*4)) + phase*13)
            cx, cy = w/2, h*0.48
            r1, r2 = w*0.28, w*(0.39 + phase*0.025)
            d.line((cx+math.cos(a)*r1, cy+math.sin(a)*r1, cx+math.cos(a)*r2, cy+math.sin(a)*r2), fill=(*accent, 90), width=3)
    effect = effect.filter(ImageFilter.GaussianBlur(2.0))
    result = Image.alpha_composite(result, effect)
    ensure_parent(output_path)
    result.save(output_path, 'WEBP', quality=89, method=3)


def effect_frame(kind: str, index: int, total: int = 8) -> Image.Image:
    size = 96
    scale = 3
    canvas = Image.new('RGBA', (size*scale, size*scale), (0,0,0,0))
    draw = ImageDraw.Draw(canvas, 'RGBA')
    t = index / max(1, total-1)
    cx = cy = size*scale/2

    colors = {
        'slash': ((125, 247, 232), (248, 214, 127)),
        'nova': ((108, 168, 255), (198, 126, 255)),
        'hit': ((255, 236, 166), (255, 111, 94)),
        'explosion': ((255, 194, 89), (255, 72, 64)),
        'dodge': ((117, 238, 220), (116, 155, 255)),
    }
    primary, accent = colors[kind]

    if kind == 'slash':
        start = int(205 - t*58)
        end = int(338 + t*35)
        radius = int((28 + t*13)*scale)
        box = (cx-radius, cy-radius, cx+radius, cy+radius)
        draw.arc(box, start=start, end=end, fill=(*primary, int(220*(1-t*0.5))), width=int((9-4*t)*scale))
        draw.arc(box, start=start+5, end=end-5, fill=(*accent, int(165*(1-t*0.55))), width=int((4-1*t)*scale))
    elif kind == 'nova':
        radius = (10 + 35*t)*scale
        draw.ellipse((cx-radius,cy-radius,cx+radius,cy+radius), outline=(*primary,int(220*(1-t))), width=max(2,int((8-5*t)*scale)))
        radius2 = (6 + 23*t)*scale
        draw.ellipse((cx-radius2,cy-radius2,cx+radius2,cy+radius2), outline=(*accent,int(190*(1-t*0.7))), width=max(2,int((5-2*t)*scale)))
    elif kind == 'hit':
        rays = 8
        length = (12 + 28*t)*scale
        for i in range(rays):
            a = i*math.pi*2/rays + t*0.4
            inner = 5*scale
            draw.line((cx+math.cos(a)*inner,cy+math.sin(a)*inner,cx+math.cos(a)*length,cy+math.sin(a)*length),fill=(*primary,int(230*(1-t*0.75))),width=max(2,int((5-3*t)*scale)))
        r=(14+12*t)*scale
        draw.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(*accent,int(120*(1-t))))
    elif kind == 'explosion':
        r=(8+31*t)*scale
        draw.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(*accent,int(175*(1-t))),outline=(*primary,int(230*(1-t))),width=max(2,int((7-4*t)*scale)))
        for i in range(12):
            a=i*math.pi*2/12+t
            rr=(16+28*t)*scale
            pr=3*scale*(1-t*0.5)
            px,py=cx+math.cos(a)*rr,cy+math.sin(a)*rr
            draw.ellipse((px-pr,py-pr,px+pr,py+pr),fill=(*primary,int(200*(1-t))))
    elif kind == 'dodge':
        for i in range(5):
            offset=(i*8+t*18)*scale
            alpha=int(170*(1-t)*(1-i*0.12))
            draw.arc((cx-34*scale-offset,cy-22*scale+i*2*scale,cx+18*scale-offset,cy+22*scale+i*2*scale),200,340,fill=(*primary,alpha),width=4*scale)
        r=(7+12*t)*scale
        draw.ellipse((cx-r,cy-r,cx+r,cy+r),outline=(*accent,int(140*(1-t))),width=3*scale)

    blur = canvas.filter(ImageFilter.GaussianBlur(4.0*scale))
    glow = Image.new('RGBA', canvas.size, (0,0,0,0))
    glow = Image.alpha_composite(glow, blur)
    glow = Image.alpha_composite(glow, canvas)
    return glow.resize((size,size), Image.Resampling.LANCZOS)


def build_effects_atlas(output_json: Path, output_image: Path) -> tuple[int,int]:
    kinds = ['slash','nova','hit','explosion','dodge']
    cols, rows, cell = 8, len(kinds), 96
    atlas = Image.new('RGBA',(cols*cell,rows*cell),(0,0,0,0))
    frames = {}
    animations = {}
    for row,kind in enumerate(kinds):
        names=[]
        for index in range(cols):
            name=f'effect_{kind}_{index}'
            names.append(name)
            atlas.alpha_composite(effect_frame(kind,index,cols),(index*cell,row*cell))
            frames[name]={
                'frame': {'x':index*cell,'y':row*cell,'w':cell,'h':cell},
                'rotated':False,'trimmed':False,
                'spriteSourceSize':{'x':0,'y':0,'w':cell,'h':cell},
                'sourceSize':{'w':cell,'h':cell},
                'anchor':{'x':0.5,'y':0.76},
            }
        animations[f'effect.{kind}']=names
    ensure_parent(output_image)
    atlas.save(output_image,'WEBP',lossless=False,quality=90,method=3,alpha_quality=96)
    payload={'frames':frames,'animations':animations,'meta':{'app':'LUMERIFT v1.7 VFX pipeline','version':'1.7.0','image':output_image.name,'format':'RGBA8888','size':{'w':atlas.width,'h':atlas.height},'scale':'1'}}
    ensure_parent(output_json)
    output_json.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return len(frames),len(animations)


def main() -> None:
    player_frames, player_anims = build_processed_atlas(
        ROOT/'public/assets/live/v2/atlases/player/player_live_v2.json',
        ROOT/'public/assets/live/v2/atlases/player/player_live_v2.webp',
        OUT/'atlases/player/player_live_v4.json',
        OUT/'atlases/player/player_live_v4.webp',
        player_palette,
    )
    monster_frames, monster_anims = build_processed_atlas(
        ROOT/'public/assets/live/v2/atlases/monsters/monsters_live_v2.json',
        ROOT/'public/assets/live/v2/atlases/monsters/monsters_live_v2.webp',
        OUT/'atlases/monsters/monsters_live_v4.json',
        OUT/'atlases/monsters/monsters_live_v4.webp',
        monster_palette,
    )
    effects_frames, effects_anims = build_effects_atlas(
        OUT/'atlases/effects/combat_effects_v4.json',
        OUT/'atlases/effects/combat_effects_v4.webp',
    )

    source = Image.open(SOURCE/'backgrounds/fantasy_rpg_background.png')
    backgrounds = [
        ('forest_approach_v4.webp', 1701, (12, 34, 39), (8, 27, 29), (91, 221, 200), 0.58, 585),
        ('forest_ruins_v4.webp', 1702, (35, 32, 25), (27, 23, 18), (244, 188, 94), 0.68, 590),
        ('forest_depths_v4.webp', 1703, (25, 22, 42), (18, 15, 34), (179, 111, 247), 0.82, 598),
        ('rift_core_v4.webp', 1704, (39, 15, 23), (28, 9, 15), (255, 83, 102), 1.0, 605),
    ]
    for filename, seed, top, ground, rift, corruption, arena_y in backgrounds:
        make_background(source, OUT/'backgrounds'/filename, seed=seed, top_tint=top, ground_tint=ground, rift_tint=rift, corruption=corruption, arena_y=arena_y)
    make_lobby_background(source, OUT/'backgrounds/lobby_forest_v4.webp')

    enhance_portrait(ROOT/'public/assets/live/v2/portraits/hero_v2.webp', OUT/'portraits/hero_v4.webp', (100,182,190),(245,202,112))
    boss_src = ROOT/'public/assets/live/v2/portraits/boss_v2.webp'
    enhance_portrait(boss_src, OUT/'portraits/boss_phase_1_v4.webp',(143,77,78),(255,117,103),phase=1)
    enhance_portrait(boss_src, OUT/'portraits/boss_phase_2_v4.webp',(120,63,138),(218,104,255),phase=2)
    enhance_portrait(boss_src, OUT/'portraits/boss_phase_3_v4.webp',(103,43,54),(255,73,92),phase=3)

    files = sorted(p for p in OUT.rglob('*') if p.is_file())
    summary = {
        'release':'1.7.0',
        'qualityStage':'production-candidate-unified-art-pass',
        'playerFrames':player_frames,
        'playerAnimations':player_anims,
        'monsterFrames':monster_frames,
        'monsterAnimations':monster_anims,
        'effectsFrames':effects_frames,
        'effectsAnimations':effects_anims,
        'battleBackgrounds':4,
        'bossPhasePortraits':3,
        'runtimeFiles':len(files),
        'runtimeBytes':sum(p.stat().st_size for p in files),
    }
    (ROOT/'public/assets/LIVE_ART_V170_SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))


if __name__ == '__main__':
    main()

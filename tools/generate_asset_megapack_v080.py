from __future__ import annotations

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path
import colorsys
import json
import math
import random
import shutil
import struct
import subprocess
import wave

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = PROJECT_ROOT / 'public' / 'assets'
RNG = random.Random(8072026)


def rgba(h: float, s: float, v: float, a: int = 255) -> tuple[int, int, int, int]:
    r, g, b = colorsys.hsv_to_rgb(h % 1.0, max(0, min(1, s)), max(0, min(1, v)))
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


def save_atlas(relative_dir: str, base_name: str, tiles: list[tuple[str, Image.Image]], animations: dict[str, list[str]] | None = None, cols: int = 16, quality: int = 88) -> None:
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
    out = ASSET_ROOT / relative_dir
    out.mkdir(parents=True, exist_ok=True)
    atlas_name = f'{base_name}.webp'
    atlas.save(out / atlas_name, 'WEBP', quality=quality, method=6, lossless=False)
    payload = {
        'frames': frames,
        'animations': animations or {},
        'meta': {
            'app': 'LUMERIFT asset megapack generator',
            'version': '0.8.0',
            'image': atlas_name,
            'format': 'RGBA8888',
            'size': {'w': atlas.width, 'h': atlas.height},
            'scale': '1',
        },
    }
    (out / f'{base_name}.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')


def glow_layer(size: int, hue: float, radius: int = 20, alpha: int = 170) -> Image.Image:
    layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = rgba(hue, 0.65, 1.0, alpha)
    d.ellipse((size // 2 - radius, size // 2 - radius, size // 2 + radius, size // 2 + radius), fill=c)
    return layer.filter(ImageFilter.GaussianBlur(radius // 2))


def icon_tile(kind: str, index: int, size: int = 64) -> Image.Image:
    hue = ((index * 0.087) + {'weapon': 0.02, 'armor': 0.56, 'accessory': 0.76, 'consumable': 0.32, 'material': 0.12, 'currency': 0.48}.get(kind, 0.0)) % 1
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    im.alpha_composite(glow_layer(size, hue, 18, 110))
    d = ImageDraw.Draw(im)
    border = rgba(hue, 0.45, 0.95, 255)
    dark = rgba(hue, 0.62, 0.25, 255)
    bright = rgba(hue, 0.25, 1.0, 255)
    d.rounded_rectangle((5, 5, size - 6, size - 6), radius=12, fill=(8, 14, 28, 225), outline=border, width=2)
    cx = cy = size // 2
    if kind == 'weapon':
        angle = -0.8 + (index % 5) * 0.16
        vx, vy = math.cos(angle), math.sin(angle)
        d.line((cx - vx * 18, cy - vy * 18, cx + vx * 19, cy + vy * 19), fill=bright, width=5)
        d.line((cx - vy * 8, cy + vx * 8, cx + vy * 8, cy - vx * 8), fill=border, width=4)
        d.polygon([(cx + vx * 24, cy + vy * 24), (cx + vx * 17 - vy * 4, cy + vy * 17 + vx * 4), (cx + vx * 17 + vy * 4, cy + vy * 17 - vx * 4)], fill=bright)
    elif kind == 'armor':
        d.polygon([(cx, 13), (49, 22), (45, 49), (cx, 56), (19, 49), (15, 22)], fill=dark, outline=bright)
        d.line((cx, 15, cx, 52), fill=border, width=3)
        d.arc((20, 20, 44, 44), 30, 150, fill=bright, width=3)
    elif kind == 'accessory':
        r = 17
        d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=bright, width=5)
        d.regular_polygon((cx, cy, 10), n_sides=5 + index % 3, rotation=index * 11, fill=border)
        d.ellipse((cx-4, cy-4, cx+4, cy+4), fill=(255,255,255,240))
    elif kind == 'consumable':
        d.rounded_rectangle((22, 18, 42, 50), radius=7, fill=dark, outline=bright, width=3)
        d.rectangle((27, 12, 37, 20), fill=border)
        d.ellipse((25, 27, 39, 43), fill=rgba(hue, 0.75, 1.0, 230))
    elif kind == 'material':
        points = []
        for p in range(8):
            a = p * math.pi / 4
            rr = 21 if p % 2 == 0 else 12
            points.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
        d.polygon(points, fill=dark, outline=bright)
        d.line((cx-10, cy+8, cx+10, cy-8), fill=(255,255,255,170), width=3)
    elif kind == 'currency':
        d.ellipse((13, 13, 51, 51), fill=dark, outline=bright, width=4)
        d.regular_polygon((cx, cy, 12), n_sides=6, rotation=30, fill=border)
        d.arc((18, 18, 46, 46), 40, 260, fill=(255,255,255,180), width=2)
    return im


def make_items() -> dict[str, int]:
    definitions = [('weapon', 32), ('armor', 32), ('accessory', 24), ('consumable', 24), ('material', 32), ('currency', 16)]
    tiles = []
    for kind, count in definitions:
        for index in range(count):
            tiles.append((f'mega_item.{kind}.{index:02d}', icon_tile(kind, index)))
    save_atlas('atlases/items', 'mega_items_v1', tiles, cols=16)
    return {kind: count for kind, count in definitions}


def skill_tile(school: str, index: int, size: int = 72) -> Image.Image:
    schools = ['fire', 'ice', 'storm', 'void', 'nature', 'radiant', 'physical', 'arcane', 'shadow', 'tech']
    hue = (schools.index(school) / len(schools) + index * 0.017) % 1
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    im.alpha_composite(glow_layer(size, hue, 25, 150))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((4, 4, size-5, size-5), radius=15, fill=(5, 10, 22, 232), outline=rgba(hue, .55, 1, 255), width=3)
    cx = cy = size // 2
    color = rgba(hue, .68, 1.0, 255)
    secondary = rgba((hue + .1) % 1, .3, 1.0, 220)
    mode = index % 8
    if mode == 0:
        d.polygon([(cx, 10), (cx+8, 30), (cx+20, 42), (cx+4, 61), (cx-14, 52), (cx-18, 36)], fill=color)
    elif mode == 1:
        for r in (8, 16, 24): d.arc((cx-r, cy-r, cx+r, cy+r), 20+index*9, 260+index*9, fill=color, width=3)
    elif mode == 2:
        d.line((15, 57, 28, 35, 24, 30, 43, 12, 37, 34, 55, 31, 43, 57), fill=color, width=6, joint='curve')
    elif mode == 3:
        d.regular_polygon((cx, cy, 25), n_sides=3 + index % 5, rotation=index*15, outline=color, width=4)
        d.regular_polygon((cx, cy, 11), n_sides=6, fill=secondary)
    elif mode == 4:
        d.ellipse((13, 13, 59, 59), outline=color, width=5)
        d.line((cx, 15, cx, 57), fill=secondary, width=4)
        d.line((15, cy, 57, cy), fill=secondary, width=4)
    elif mode == 5:
        for a in range(0, 360, 45):
            x = cx + math.cos(math.radians(a)) * 24
            y = cy + math.sin(math.radians(a)) * 24
            d.line((cx, cy, x, y), fill=color, width=4)
        d.ellipse((cx-8, cy-8, cx+8, cy+8), fill=(255,255,255,235))
    elif mode == 6:
        d.arc((11, 12, 61, 61), 200, 350, fill=color, width=9)
        d.arc((15, 8, 56, 55), 30, 180, fill=secondary, width=5)
    else:
        for p in range(4):
            r = 10 + p*6
            d.arc((cx-r, cy-r, cx+r, cy+r), p*55, p*55+150, fill=color, width=3)
    return im


def make_skills() -> dict[str, int]:
    schools = ['fire', 'ice', 'storm', 'void', 'nature', 'radiant', 'physical', 'arcane', 'shadow', 'tech']
    tiles=[]
    for school in schools:
        for index in range(8):
            tiles.append((f'skill.{school}.{index:02d}', skill_tile(school, index)))
    save_atlas('atlases/skills', 'skill_icons_v1', tiles, cols=10)
    return {school: 8 for school in schools}


def status_tile(index: int, size: int = 56) -> Image.Image:
    hue = (index * .061) % 1
    im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    c=rgba(hue,.7,1,255); dark=rgba(hue,.6,.25,240)
    d.rounded_rectangle((4,4,51,51),radius=13,fill=(7,12,24,230),outline=c,width=2)
    mode=index%12; cx=cy=28
    if mode==0: d.polygon([(cx,8),(42,21),(36,47),(20,47),(14,21)],fill=dark,outline=c)
    elif mode==1: d.ellipse((11,11,45,45),outline=c,width=5); d.line((17,39,39,17),fill=c,width=5)
    elif mode==2: d.polygon([(cx,8),(46,43),(10,43)],fill=dark,outline=c); d.line((cx,19,cx,34),fill=c,width=4)
    elif mode==3: d.arc((10,10,46,46),20,330,fill=c,width=6)
    elif mode==4: d.line((11,28,45,28),fill=c,width=6); d.line((28,11,28,45),fill=c,width=6)
    elif mode==5: d.ellipse((14,14,42,42),fill=dark,outline=c,width=3); d.ellipse((22,22,34,34),fill=c)
    elif mode==6: d.regular_polygon((cx,cy,20),n_sides=6,outline=c,width=4)
    elif mode==7: d.arc((8,15,48,47),180,360,fill=c,width=5); d.arc((16,8,40,40),0,180,fill=c,width=5)
    elif mode==8: d.line((12,44,44,12),fill=c,width=7); d.ellipse((8,38,18,48),fill=c); d.ellipse((38,8,48,18),fill=c)
    elif mode==9: d.polygon([(12,20),(28,8),(44,20),(38,45),(18,45)],fill=dark,outline=c)
    elif mode==10:
        for a in range(0,360,60): d.line((cx,cy,cx+math.cos(math.radians(a))*18,cy+math.sin(math.radians(a))*18),fill=c,width=3)
    else: d.arc((8,8,48,48),45,315,fill=c,width=6); d.polygon([(40,10),(48,19),(37,20)],fill=c)
    return im


def make_status() -> int:
    tiles=[(f'status.{i:02d}',status_tile(i)) for i in range(48)]
    save_atlas('atlases/status','status_icons_v1',tiles,cols=12)
    return len(tiles)


def ui_tile(index: int, size: int = 48) -> Image.Image:
    hue=(.52+index*.023)%1; im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    c=rgba(hue,.45,1,255); d.rounded_rectangle((3,3,44,44),radius=10,fill=(8,14,27,220),outline=c,width=2)
    cx=cy=24; mode=index%24
    if mode==0: d.polygon([(10,24),(25,10),(38,24),(32,24),(32,39),(17,39),(17,24)],outline=c,width=4)
    elif mode==1: d.ellipse((10,8,38,36),outline=c,width=4); d.line((24,36,24,43),fill=c,width=4)
    elif mode==2: d.rounded_rectangle((9,13,39,36),radius=4,outline=c,width=4); d.line((14,19,34,19),fill=c,width=3)
    elif mode==3: d.line((10,15,38,15),fill=c,width=4); d.line((10,24,38,24),fill=c,width=4); d.line((10,33,38,33),fill=c,width=4)
    elif mode==4: d.ellipse((11,11,37,37),outline=c,width=4); d.line((31,31,41,41),fill=c,width=4)
    elif mode==5: d.arc((9,9,39,39),40,310,fill=c,width=4); d.polygon([(37,8),(42,17),(32,17)],fill=c)
    elif mode==6: d.polygon([(12,10),(36,10),(41,24),(24,41),(7,24)],outline=c,width=4)
    elif mode==7: d.rounded_rectangle((12,17,36,39),radius=5,outline=c,width=4); d.arc((16,5,32,25),180,360,fill=c,width=4)
    elif mode==8: d.ellipse((10,10,38,38),outline=c,width=4); d.line((24,10,24,38),fill=c,width=3); d.line((10,24,38,24),fill=c,width=3)
    elif mode==9: d.polygon([(9,17),(39,17),(33,39),(15,39)],outline=c,width=4); d.line((18,17,20,9),fill=c,width=4); d.line((30,17,28,9),fill=c,width=4)
    elif mode==10: d.ellipse((15,8,33,25),outline=c,width=4); d.arc((9,20,39,43),180,360,fill=c,width=4)
    elif mode==11: d.line((24,8,24,40),fill=c,width=5); d.polygon([(12,22),(24,10),(36,22)],fill=c)
    elif mode==12: d.line((9,24,39,24),fill=c,width=5); d.polygon([(25,11),(39,24),(25,37)],fill=c)
    elif mode==13: d.line((39,24,9,24),fill=c,width=5); d.polygon([(23,11),(9,24),(23,37)],fill=c)
    elif mode==14: d.line((12,12,36,36),fill=c,width=5); d.line((36,12,12,36),fill=c,width=5)
    elif mode==15: d.line((10,24,20,34,39,13),fill=c,width=5)
    elif mode==16: d.ellipse((10,13,38,34),outline=c,width=4); d.polygon([(17,34),(14,42),(25,35)],fill=c)
    elif mode==17: d.rectangle((10,12,38,38),outline=c,width=4); d.line((16,20,32,20),fill=c,width=3); d.line((16,27,32,27),fill=c,width=3)
    elif mode==18: d.regular_polygon((cx,cy,16),n_sides=6,outline=c,width=4); d.ellipse((20,20,28,28),fill=c)
    elif mode==19: d.polygon([(24,7),(29,18),(41,19),(32,27),(35,40),(24,33),(13,40),(16,27),(7,19),(19,18)],outline=c,width=3)
    elif mode==20: d.arc((9,9,39,39),90,270,fill=c,width=4); d.arc((13,13,35,35),270,90,fill=c,width=4)
    elif mode==21: d.ellipse((12,12,36,36),outline=c,width=4); d.polygon([(21,17),(34,24),(21,31)],fill=c)
    elif mode==22: d.line((10,36,20,26,27,31,39,14),fill=c,width=4)
    else: d.ellipse((9,9,39,39),outline=c,width=4); d.rectangle((22,13,26,26),fill=c); d.ellipse((22,31,26,35),fill=c)
    return im


def make_ui() -> int:
    tiles=[(f'ui.icon.{i:02d}',ui_tile(i)) for i in range(96)]
    save_atlas('atlases/ui','ui_icons_v2',tiles,cols=16)
    return len(tiles)


def creature_portrait(kind: str, index: int, size: int = 96) -> Image.Image:
    hue = (index * .073 + {'normal':.3,'elite':.74,'boss':.01}.get(kind,0))%1
    im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    c=rgba(hue,.65,1,255); body=rgba(hue,.72,.42,255)
    d.rounded_rectangle((3,3,92,92),radius=18,fill=(5,10,20,235),outline=c,width=3)
    cx=48; cy=53; r={'normal':27,'elite':31,'boss':35}[kind]
    if kind!='normal': d.ellipse((cx-r-5,cy-r-5,cx+r+5,cy+r+5),outline=rgba((hue+.1)%1,.55,.85,170),width=4)
    sides=5+(index%4)
    d.regular_polygon((cx,cy,r),n_sides=sides,rotation=index*13,fill=body,outline=c,width=3)
    if index%3==0:
        d.polygon([(cx-r+6,cy-r+5),(cx-r-10,cy-r-15),(cx-8,cy-r+2)],fill=c)
        d.polygon([(cx+r-6,cy-r+5),(cx+r+10,cy-r-15),(cx+8,cy-r+2)],fill=c)
    eye_count=1+(index%4)
    for eye in range(eye_count):
        x=cx+(eye-(eye_count-1)/2)*13
        d.ellipse((x-4,cy-8,x+4,cy),fill=(255,255,255,245)); d.ellipse((x-1,cy-6,x+2,cy-2),fill=c)
    d.arc((cx-16,cy+2,cx+16,cy+24),5,175,fill=(255,255,255,200),width=3)
    if kind=='boss':
        d.arc((8,8,88,88),190,350,fill=(255,210,110,240),width=5)
    return im


def make_bestiary() -> dict[str,int]:
    definitions=[('normal',30),('elite',10),('boss',8)]; tiles=[]
    for kind,count in definitions:
        for i in range(count): tiles.append((f'bestiary.{kind}.{i:02d}',creature_portrait(kind,i)))
    save_atlas('atlases/bestiary','bestiary_portraits_v1',tiles,cols=8)
    return dict(definitions)


def npc_portrait(index: int, size: int = 96) -> Image.Image:
    hue=(.53+index*.051)%1; im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    accent=rgba(hue,.48,1,255); skin=(218+index%20,190+index%25,172+index%20,255)
    d.rounded_rectangle((3,3,92,92),radius=18,fill=(8,13,25,235),outline=accent,width=3)
    d.ellipse((28,14,68,54),fill=skin,outline=(245,235,225,255),width=2)
    hair=rgba((hue+.15)%1,.55,.32,255)
    d.pieslice((25,8,71,55),180,360,fill=hair)
    d.ellipse((37,33,42,38),fill=(22,30,48,255)); d.ellipse((54,33,59,38),fill=(22,30,48,255))
    d.arc((42,40,55,49),0,180,fill=(120,70,75,255),width=2)
    role=index%8
    if role in (0,4): d.polygon([(18,92),(30,53),(66,53),(79,92)],fill=rgba(hue,.55,.38,255),outline=accent)
    elif role in (1,5): d.polygon([(10,92),(31,54),(64,54),(86,92)],fill=(55,64,100,255),outline=accent)
    elif role in (2,6): d.ellipse((24,53,72,105),fill=(80,48,72,255),outline=accent)
    else: d.rectangle((22,54,74,92),fill=(32,72,68,255),outline=accent,width=2)
    if index%3==0: d.ellipse((61,18,77,34),outline=accent,width=3)
    return im


def make_npcs() -> int:
    tiles=[(f'npc.portrait.{i:02d}',npc_portrait(i)) for i in range(32)]
    save_atlas('atlases/npc','npc_portraits_v1',tiles,cols=8)
    return len(tiles)


def prop_tile(region: str, index: int, size: int = 80) -> Image.Image:
    regions=['forest','ruins','desert','snow','volcanic','city']
    base_hue=(regions.index(region)/len(regions)+index*.019)%1
    im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    c=rgba(base_hue,.58,.72,255); light=rgba(base_hue,.32,1,230); dark=rgba(base_hue,.72,.25,255)
    cx=40; floor=68; mode=index%10
    d.ellipse((12,62,68,75),fill=(4,7,13,90))
    if mode==0:
        d.rectangle((35,24,45,floor),fill=dark); d.ellipse((13,7,67,48),fill=c,outline=light)
    elif mode==1:
        d.polygon([(8,floor),(23,28),(37,58),(50,18),(72,floor)],fill=dark,outline=c)
    elif mode==2:
        d.rectangle((17,36,63,floor),fill=dark,outline=light,width=2); d.arc((18,17,62,58),180,360,fill=c,width=9)
    elif mode==3:
        for x in range(18,66,12): d.rectangle((x,25,x+7,floor),fill=c,outline=light)
    elif mode==4:
        d.ellipse((19,20,61,62),fill=dark,outline=light,width=3); d.arc((25,25,55,55),0,300,fill=c,width=5)
    elif mode==5:
        d.polygon([(12,floor),(26,19),(53,15),(69,floor)],fill=c,outline=light); d.line((25,35,54,27),fill=dark,width=5)
    elif mode==6:
        d.rectangle((16,47,64,floor),fill=dark,outline=light); d.polygon([(12,47),(40,17),(68,47)],fill=c,outline=light)
    elif mode==7:
        d.line((cx,18,cx,floor),fill=c,width=7); d.ellipse((25,12,55,34),outline=light,width=5); d.ellipse((32,19,48,27),fill=light)
    elif mode==8:
        for r in (8,15,22): d.arc((cx-r,40-r,cx+r,40+r),30+index*5,290+index*5,fill=light,width=3)
        d.rectangle((36,45,44,floor),fill=dark)
    else:
        d.rounded_rectangle((13,25,67,floor),radius=8,fill=dark,outline=light,width=3); d.line((18,41,62,41),fill=c,width=4)
    return im


def make_environment() -> dict[str,int]:
    regions=['forest','ruins','desert','snow','volcanic','city']; tiles=[]
    for region in regions:
        for i in range(20): tiles.append((f'prop.{region}.{i:02d}',prop_tile(region,i)))
    save_atlas('atlases/environment','environment_props_v1',tiles,cols=12)
    return {r:20 for r in regions}


def effect_frame(effect_index: int, frame_index: int, size: int = 96) -> Image.Image:
    hue=(effect_index*.041)%1; im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    c=rgba(hue,.65,1,max(50,255-frame_index*28)); c2=rgba((hue+.12)%1,.35,1,max(20,210-frame_index*24)); cx=cy=48
    mode=effect_index%8; progress=(frame_index+1)/6
    if mode==0:
        r=int(10+34*progress); d.arc((cx-r,cy-r,cx+r,cy+r),20+effect_index*8,300+effect_index*8,fill=c,width=max(2,10-frame_index))
    elif mode==1:
        for ray in range(8):
            a=ray*math.pi/4+frame_index*.15; r=12+progress*32
            d.line((cx,cy,cx+math.cos(a)*r,cy+math.sin(a)*r),fill=c,width=max(2,6-frame_index//2))
    elif mode==2:
        d.ellipse((cx-30*progress,cy-16*progress,cx+30*progress,cy+16*progress),outline=c,width=6)
        d.ellipse((cx-14*progress,cy-30*progress,cx+14*progress,cy+30*progress),outline=c2,width=4)
    elif mode==3:
        pts=[]
        for p in range(12):
            a=p*math.pi/6; rr=(10 if p%2 else 36)*progress
            pts.append((cx+math.cos(a)*rr,cy+math.sin(a)*rr))
        d.polygon(pts,fill=c2,outline=c)
    elif mode==4:
        d.line((10,70-frame_index*4,30,40,23,36,53,12,45,45,73,29,58,78),fill=c,width=7,joint='curve')
    elif mode==5:
        r=34*progress; d.arc((cx-r,cy-r,cx+r,cy+r),180,360,fill=c,width=8); d.arc((cx-r,cy-r,cx+r,cy+r),0,180,fill=c2,width=5)
    elif mode==6:
        for p in range(6):
            a=p*math.pi/3+frame_index*.25; r=15+frame_index*5
            x=cx+math.cos(a)*r; y=cy+math.sin(a)*r
            d.ellipse((x-5,y-5,x+5,y+5),fill=c)
    else:
        r=8+frame_index*6; d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=c,width=6); d.ellipse((cx-r//2,cy-r//2,cx+r//2,cy+r//2),fill=c2)
    return im.filter(ImageFilter.GaussianBlur(0.35))


def make_effects() -> int:
    tiles=[]; animations={}
    for effect_index in range(24):
        names=[]
        for frame_index in range(6):
            name=f'mega_effect.{effect_index:02d}.{frame_index}'
            names.append(name); tiles.append((name,effect_frame(effect_index,frame_index)))
        animations[f'effect.mega.{effect_index:02d}']=names
    save_atlas('atlases/effects','effects_mega_v1',tiles,animations=animations,cols=12)
    return len(animations)


def emblem_tile(index: int, size: int = 72) -> Image.Image:
    hue=(index*.053)%1; im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    c=rgba(hue,.55,1,255); dark=rgba(hue,.7,.28,245); cx=cy=36
    d.ellipse((4,4,68,68),fill=(5,10,22,225),outline=c,width=3)
    d.regular_polygon((cx,cy,25),n_sides=3+index%6,rotation=index*9,fill=dark,outline=c,width=3)
    d.regular_polygon((cx,cy,12),n_sides=5+(index%3),rotation=-index*7,outline=(255,255,255,210),width=3)
    return im


def make_emblems() -> int:
    tiles=[(f'emblem.{i:02d}',emblem_tile(i)) for i in range(64)]
    save_atlas('atlases/emblems','emblems_v1',tiles,cols=16)
    return len(tiles)


def tutorial_tile(index: int, size: int = 72) -> Image.Image:
    im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im); hue=(.5+index*.031)%1; c=rgba(hue,.4,1,255)
    d.rounded_rectangle((4,4,67,67),radius=15,fill=(8,14,28,225),outline=c,width=3)
    cx=cy=36; mode=index%10
    if mode==0: d.ellipse((12,12,60,60),outline=c,width=4); d.line((36,18,36,54),fill=c,width=3); d.line((18,36,54,36),fill=c,width=3)
    elif mode==1: d.polygon([(36,10),(56,36),(36,62),(16,36)],outline=c,width=4)
    elif mode==2: d.line((12,36,60,36),fill=c,width=6); d.polygon([(45,21),(60,36),(45,51)],fill=c)
    elif mode==3: d.arc((11,11,61,61),20,320,fill=c,width=6); d.polygon([(55,10),(64,23),(49,23)],fill=c)
    elif mode==4: d.rectangle((15,18,57,54),outline=c,width=4); d.line((21,27,51,27),fill=c,width=3)
    elif mode==5: d.ellipse((17,14,55,52),outline=c,width=4); d.line((36,52,36,62),fill=c,width=4)
    elif mode==6: d.line((15,55,28,35,24,31,45,12,41,34,58,29,45,58),fill=c,width=5)
    elif mode==7: d.regular_polygon((cx,cy,22),n_sides=6,outline=c,width=4); d.ellipse((30,30,42,42),fill=c)
    elif mode==8: d.line((15,20,57,52),fill=c,width=6); d.line((57,20,15,52),fill=c,width=6)
    else: d.polygon([(36,10),(62,57),(10,57)],outline=c,width=4); d.ellipse((33,45,39,51),fill=c)
    return im


def make_tutorial() -> int:
    tiles=[(f'tutorial.glyph.{i:02d}',tutorial_tile(i)) for i in range(40)]
    save_atlas('atlases/tutorial','tutorial_glyphs_v1',tiles,cols=10)
    return len(tiles)


def map_image(region_index: int, variant: int, width: int = 540, height: int = 960) -> Image.Image:
    base_hues=[.36,.10,.55,.01,.68]
    hue=(base_hues[region_index]+variant*.02)%1
    im=Image.new('RGBA',(width,height),(0,0,0,255)); d=ImageDraw.Draw(im)
    top=rgba(hue,.55,.14,255); bottom=rgba((hue+.05)%1,.55,.30,255)
    for y in range(height):
        t=y/(height-1); color=tuple(int(top[i]*(1-t)+bottom[i]*t) for i in range(3))+(255,)
        d.line((0,y,width,y),fill=color)
    local=random.Random(region_index*100+variant)
    for _ in range(85):
        x=local.randint(-30,width+30); y=local.randint(80,height-80); r=local.randint(10,65)
        c=rgba((hue+local.uniform(-.05,.05))%1,.5,local.uniform(.25,.5),local.randint(30,95))
        d.ellipse((x-r,y-r,x+r,y+r),fill=c)
    path=[(width*.5,height),(width*(.3+.1*variant),height*.76),(width*(.62-.06*variant),height*.56),(width*(.38+.04*variant),height*.36),(width*.52,height*.12)]
    d.line(path,fill=(118,112,120,110),width=150,joint='curve'); d.line(path,fill=(200,190,182,38),width=95,joint='curve')
    for ring in range(3):
        rr=35+ring*27; d.ellipse((width*.52-rr,height*.43-rr,width*.52+rr,height*.43+rr),outline=rgba((hue+.2)%1,.45,1,110-ring*20),width=4)
    for _ in range(24):
        x=local.randint(0,width); y=local.randint(100,height-120); s=local.randint(14,45)
        if region_index==0: d.polygon([(x,y-s*2),(x-s,y+s),(x+s,y+s)],fill=rgba(hue,.7,.25,190))
        elif region_index==1: d.rectangle((x-s//2,y-s,x+s//2,y+s),fill=rgba(hue,.55,.27,170))
        elif region_index==2: d.polygon([(x-s,y+s),(x,y-s),(x+s,y+s)],fill=(210,230,245,130))
        elif region_index==3: d.polygon([(x-s,y+s),(x,y-s),(x+s,y+s)],fill=(55,20,22,200)); d.ellipse((x-6,y-s,x+6,y-s+14),fill=(255,105,50,180))
        else: d.rectangle((x-s//2,y-s*2,x+s//2,y+s),fill=rgba(hue,.7,.45,170)); d.line((x-s//2,y-s,x+s//2,y-s),fill=(100,240,255,160),width=3)
    return im.filter(ImageFilter.GaussianBlur(.3))


def make_maps() -> int:
    regions=['forest','desert_ruins','snow_citadel','volcanic_forge','neon_arcology']
    count=0
    for region_index, region in enumerate(regions):
        folder=ASSET_ROOT/'maps'/f'chapter{region_index+1}'; folder.mkdir(parents=True,exist_ok=True)
        for variant in range(1,4):
            map_image(region_index,variant).save(folder/f'{region}_v{variant}.webp','WEBP',quality=76,method=6)
            count+=1
    return count


def key_art(index: int, width: int = 540, height: int = 960) -> Image.Image:
    hue=(.56+index*.09)%1; im=Image.new('RGBA',(width,height),(0,0,0,255)); d=ImageDraw.Draw(im)
    for y in range(height):
        t=y/height; d.line((0,y,width,y),fill=rgba((hue+t*.08)%1,.65,.10+.25*t,255))
    cx=width//2; horizon=int(height*.58)
    for r,alpha in [(190,30),(135,55),(82,100)]: d.ellipse((cx-r,horizon-r,cx+r,horizon+r),outline=rgba((hue+.18)%1,.45,1,alpha),width=8)
    # hero silhouette
    d.ellipse((cx-38,horizon-225,cx+38,horizon-149),fill=(230,220,210,255))
    d.polygon([(cx-65,horizon-145),(cx+65,horizon-145),(cx+95,horizon+65),(cx,horizon+125),(cx-95,horizon+65)],fill=(45,55,95,255),outline=rgba(hue,.45,1,255))
    d.line((cx+35,horizon-120,cx+145,horizon-280),fill=(240,245,255,255),width=14)
    d.line((cx+140,horizon-275,cx+175,horizon-330),fill=rgba((hue+.2)%1,.4,1,230),width=7)
    for _ in range(80):
        x=RNG.randint(0,width); y=RNG.randint(0,height); rr=RNG.randint(1,4)
        d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=rgba((hue+.2)%1,.3,1,RNG.randint(30,130)))
    d.rounded_rectangle((45,770,495,900),radius=28,fill=(4,8,18,175),outline=rgba(hue,.4,1,160),width=3)
    return im.filter(ImageFilter.GaussianBlur(.2))


def make_loading() -> int:
    folder=ASSET_ROOT/'loading'; folder.mkdir(parents=True,exist_ok=True)
    for i in range(8): key_art(i).save(folder/f'loading_keyart_{i+1:02d}.webp','WEBP',quality=78,method=6)
    return 8


def make_brand_assets() -> int:
    folder=ASSET_ROOT/'brand'; folder.mkdir(parents=True,exist_ok=True)
    for i,(w,h) in enumerate([(512,256),(512,512),(1024,512)],start=1):
        im=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(im); hue=.52+i*.04
        im.alpha_composite(glow_layer(min(w,h),hue,min(w,h)//3,150).resize((w,h)))
        d.rounded_rectangle((10,10,w-10,h-10),radius=min(w,h)//8,fill=(5,10,22,210),outline=rgba(hue,.45,1,255),width=max(3,min(w,h)//40))
        cx=w//2; cy=h//2
        d.ellipse((cx-min(w,h)//5,cy-min(w,h)//5,cx+min(w,h)//5,cy+min(w,h)//5),outline=rgba(hue,.5,1,255),width=max(5,min(w,h)//35))
        d.polygon([(cx,cy-min(w,h)//4),(cx+min(w,h)//8,cy),(cx,cy+min(w,h)//4),(cx-min(w,h)//8,cy)],fill=rgba((hue+.15)%1,.5,1,220))
        im.save(folder/f'lumerift_mark_{i}.webp','WEBP',quality=88,method=6)
    return 3


def write_wave(path: Path, frequency: float, duration: float, mode: int, seed: int) -> None:
    sample_rate=22050; count=int(sample_rate*duration); local=random.Random(seed)
    path.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(path),'wb') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sample_rate)
        frames=[]
        for i in range(count):
            t=i/sample_rate; env=(1-min(1,t/duration))**1.8
            if mode==0: value=math.sin(2*math.pi*(frequency+frequency*.4*t)*t)
            elif mode==1: value=math.sin(2*math.pi*frequency*t)+.35*math.sin(2*math.pi*frequency*2.01*t)
            elif mode==2: value=(local.random()*2-1)*.7+math.sin(2*math.pi*frequency*t)*.3
            elif mode==3: value=math.sin(2*math.pi*frequency*t)*math.sin(2*math.pi*9*t)
            else: value=math.sin(2*math.pi*frequency*t)+.2*math.sin(2*math.pi*(frequency/2)*t)
            sample=max(-1,min(1,value*.35*env)); frames.append(struct.pack('<h',int(sample*32767)))
        wf.writeframes(b''.join(frames))


def convert_audio(wav: Path, target: Path, codec: str) -> None:
    target.parent.mkdir(parents=True,exist_ok=True)
    if codec=='ogg': args=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-c:a','libvorbis','-q:a','3',str(target)]
    else: args=['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-c:a','libopus','-b:a','48k',str(target)]
    subprocess.run(args,check=True)


def make_audio() -> dict[str,int]:
    temp=PROJECT_ROOT/'tools'/'.audio_temp_v080'; shutil.rmtree(temp,ignore_errors=True); temp.mkdir(parents=True)
    categories={'ui':12,'combat':16,'ambient':8}
    for category,count in categories.items():
        for i in range(count):
            duration=.18+i%4*.07 if category!='ambient' else 1.1+i%3*.25
            wav=temp/f'{category}_{i:02d}.wav'; write_wave(wav,180+i*33,duration,i%5,1000+i)
            if category=='ambient': convert_audio(wav,ASSET_ROOT/'audio'/category/f'{category}_{i:02d}.opus','opus')
            else: convert_audio(wav,ASSET_ROOT/'audio'/category/f'{category}_{i:02d}.ogg','ogg')
    shutil.rmtree(temp,ignore_errors=True)
    return categories


def main() -> None:
    summary={
        'items': make_items(),
        'skills': make_skills(),
        'statusIcons': make_status(),
        'uiIcons': make_ui(),
        'bestiary': make_bestiary(),
        'npcPortraits': make_npcs(),
        'environment': make_environment(),
        'effectAnimations': make_effects(),
        'emblems': make_emblems(),
        'tutorialGlyphs': make_tutorial(),
        'maps': make_maps(),
        'loadingArt': make_loading(),
        'brandAssets': make_brand_assets(),
        'audio': make_audio(),
    }
    (ASSET_ROOT/'MEGAPACK_V080_SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()

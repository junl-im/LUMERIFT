from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
LIVE1 = ROOT / 'public/assets/live/v1'
LIVE2 = ROOT / 'public/assets/live/v2'
PREVIEWS = ROOT / 'docs/previews'

UI_DIR = LIVE2 / 'atlases/ui'
BG_DIR = LIVE2 / 'backgrounds'
PORTRAIT_DIR = LIVE2 / 'portraits'
for path in (UI_DIR, BG_DIR, PORTRAIT_DIR, PREVIEWS):
    path.mkdir(parents=True, exist_ok=True)

FONT_REG = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
FONT_BOLD = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
FONT_DISPLAY = '/usr/share/fonts/truetype/nanum/NanumSquareB.ttf'

GOLD = (205, 170, 92)
GOLD_LIGHT = (246, 221, 155)
TEAL = (47, 194, 174)
TEAL_LIGHT = (114, 231, 211)
RED = (198, 68, 83)
BLUE = (63, 126, 166)
PURPLE = (128, 80, 180)
INK = (7, 12, 18)
SLATE = (18, 27, 37)
SLATE_2 = (25, 38, 49)

FRAME = 192
COLS = 5


def rgba(color: tuple[int, int, int], a: int = 255) -> tuple[int, int, int, int]:
    return (*color, a)


def add_noise(img: Image.Image, amount: int = 7, seed: int = 7) -> Image.Image:
    random.seed(seed)
    noise = Image.new('L', img.size)
    px = noise.load()
    for y in range(img.height):
        for x in range(img.width):
            px[x, y] = 128 + random.randint(-amount, amount)
    noise = noise.filter(ImageFilter.GaussianBlur(0.35))
    shade = Image.merge('RGBA', (noise, noise, noise, Image.new('L', img.size, 28)))
    return Image.alpha_composite(img.convert('RGBA'), shade)


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int], alpha=255) -> Image.Image:
    w, h = size
    out = Image.new('RGBA', size)
    draw = ImageDraw.Draw(out)
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        draw.line((0, y, w, y), fill=(*c, alpha))
    return out


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new('L', size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0]-1, size[1]-1), radius=radius, fill=255)
    return mask


def glow_layer(size: tuple[int, int], box: tuple[int, int, int, int], color: tuple[int, int, int], blur: int, alpha: int) -> Image.Image:
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse(box, fill=(*color, alpha))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def corner_motif(draw: ImageDraw.ImageDraw, color: tuple[int, int, int], size: int = FRAME) -> None:
    pad = 15
    length = 28
    for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        x = pad if sx > 0 else size - pad
        y = pad if sy > 0 else size - pad
        draw.line((x, y, x + sx * length, y), fill=(*color, 190), width=3)
        draw.line((x, y, x, y + sy * length), fill=(*color, 190), width=3)
        draw.ellipse((x-3, y-3, x+3, y+3), fill=(*GOLD_LIGHT, 230))


def make_panel(accent=GOLD, strong=False, glass=False, danger=False, selected=False) -> Image.Image:
    img = vertical_gradient((FRAME, FRAME), (27, 39, 50), (9, 15, 22), 250)
    img = add_noise(img, 5, 12)
    mask = rounded_mask((FRAME, FRAME), 30)
    img.putalpha(mask)
    draw = ImageDraw.Draw(img, 'RGBA')

    outer = accent if not danger else RED
    draw.rounded_rectangle((3, 3, FRAME-4, FRAME-4), radius=29, outline=(*outer, 225), width=3)
    draw.rounded_rectangle((8, 8, FRAME-9, FRAME-9), radius=25, outline=(255,255,255,45), width=1)
    draw.rounded_rectangle((15, 15, FRAME-16, FRAME-16), radius=19, outline=(*outer, 70), width=1)
    if strong:
        draw.rectangle((18, 26, FRAME-19, 29), fill=(*outer, 90))
        draw.rectangle((18, FRAME-31, FRAME-19, FRAME-28), fill=(*outer, 55))
    if glass:
        sheen = Image.new('RGBA', img.size, (0,0,0,0))
        sd = ImageDraw.Draw(sheen)
        sd.polygon([(14, 14), (FRAME-14, 14), (FRAME-60, 70), (42, 70)], fill=(255,255,255,18))
        img = Image.alpha_composite(img, sheen.filter(ImageFilter.GaussianBlur(6)))
        draw = ImageDraw.Draw(img, 'RGBA')
    if selected:
        glow = glow_layer(img.size, (18, 18, FRAME-18, FRAME-18), outer, 12, 55)
        img = Image.alpha_composite(img, glow)
        draw = ImageDraw.Draw(img, 'RGBA')
    corner_motif(draw, outer)
    return img


def make_button(accent=TEAL, danger=False, secondary=False) -> Image.Image:
    base_top = (30, 52, 58) if not secondary else (30, 39, 48)
    base_bottom = (9, 18, 23) if not secondary else (10, 15, 21)
    img = vertical_gradient((FRAME, FRAME), base_top, base_bottom, 255)
    img = add_noise(img, 5, 19)
    mask = rounded_mask((FRAME, FRAME), 36)
    img.putalpha(mask)
    c = RED if danger else (GOLD if secondary else accent)
    draw = ImageDraw.Draw(img, 'RGBA')
    draw.rounded_rectangle((3, 3, FRAME-4, FRAME-4), radius=34, outline=(*c, 235), width=4)
    draw.rounded_rectangle((10, 10, FRAME-11, FRAME-11), radius=28, outline=(255,255,255,50), width=2)
    draw.line((24, 32, FRAME-24, 32), fill=(*c, 65), width=2)
    draw.line((30, FRAME-32, FRAME-30, FRAME-32), fill=(0,0,0,90), width=2)
    img = Image.alpha_composite(img, glow_layer(img.size, (26, 18, FRAME-26, 92), c, 20, 38))
    return img


def make_slot(accent=(110, 130, 145), selected=False) -> Image.Image:
    img = vertical_gradient((FRAME, FRAME), (24, 32, 42), (8, 12, 18), 255)
    img = add_noise(img, 6, 33)
    mask = rounded_mask((FRAME, FRAME), 28)
    img.putalpha(mask)
    draw = ImageDraw.Draw(img, 'RGBA')
    draw.rounded_rectangle((5, 5, FRAME-6, FRAME-6), radius=26, outline=(*accent, 245), width=5)
    draw.rounded_rectangle((14, 14, FRAME-15, FRAME-15), radius=19, outline=(255,255,255,45), width=2)
    draw.rounded_rectangle((25, 25, FRAME-26, FRAME-26), radius=14, fill=(3,8,13,170), outline=(*accent,80), width=1)
    for i in range(4):
        r = 5 + i * 3
        draw.ellipse((FRAME/2-r, FRAME/2-r, FRAME/2+r, FRAME/2+r), outline=(*accent, 30), width=1)
    if selected:
        img = Image.alpha_composite(img, glow_layer(img.size, (18,18,FRAME-18,FRAME-18), accent, 16, 70))
    return img


def make_circle_frame(accent=TEAL, thick=5) -> Image.Image:
    img = Image.new('RGBA', (FRAME, FRAME), (0,0,0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    draw.ellipse((7,7,FRAME-8,FRAME-8), fill=(9,16,22,215), outline=(*accent,245), width=thick)
    draw.ellipse((18,18,FRAME-19,FRAME-19), fill=(17,28,36,220), outline=(255,255,255,55), width=2)
    draw.ellipse((29,29,FRAME-30,FRAME-30), outline=(*accent,60), width=2)
    img = Image.alpha_composite(img, glow_layer(img.size, (20,20,FRAME-20,FRAME-20), accent, 15, 40))
    return img


def make_portrait_frame(accent=GOLD) -> Image.Image:
    img = Image.new('RGBA', (FRAME, FRAME), (0,0,0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    draw.rounded_rectangle((5,5,FRAME-6,FRAME-6), radius=38, fill=(8,14,20,35), outline=(*accent,245), width=5)
    draw.rounded_rectangle((15,15,FRAME-16,FRAME-16), radius=31, outline=(255,255,255,70), width=2)
    draw.arc((20,20,FRAME-21,FRAME-21), 210, 330, fill=(*TEAL_LIGHT,160), width=4)
    corner_motif(draw, accent)
    return img


def make_node(accent=TEAL, locked=False, boss=False) -> Image.Image:
    img = Image.new('RGBA', (FRAME, FRAME), (0,0,0,0))
    draw = ImageDraw.Draw(img, 'RGBA')
    c = RED if boss else accent
    alpha = 100 if locked else 245
    draw.ellipse((23,23,FRAME-24,FRAME-24), fill=(7,13,19,235), outline=(*c,alpha), width=7)
    draw.ellipse((36,36,FRAME-37,FRAME-37), fill=(20,31,40,230), outline=(255,255,255,45), width=2)
    draw.polygon([(FRAME//2,45),(FRAME-47,FRAME//2),(FRAME//2,FRAME-45),(47,FRAME//2)], outline=(*c,120), fill=(0,0,0,0))
    if locked:
        draw.rounded_rectangle((74,80,118,124), radius=7, fill=(2,6,10,220), outline=(160,170,180,170), width=3)
        draw.arc((80,58,112,94), 180, 360, fill=(160,170,180,200), width=5)
    if boss:
        draw.ellipse((66,66,126,126), fill=(*RED,45), outline=(*RED,200), width=3)
    return img


def build_ui_atlas() -> None:
    frames: list[tuple[str, Image.Image]] = [
        ('panel', make_panel(GOLD, glass=True)),
        ('panel_strong', make_panel(GOLD, strong=True)),
        ('panel_gold', make_panel(GOLD, strong=True, selected=True)),
        ('panel_glass', make_panel(TEAL, glass=True)),
        ('button_primary', make_button(TEAL)),
        ('button_secondary', make_button(GOLD, secondary=True)),
        ('button_danger', make_button(RED, danger=True)),
        ('button_icon', make_button(TEAL, secondary=True)),
        ('slot_common', make_slot((119,139,153))),
        ('slot_rare', make_slot((65,151,211))),
        ('slot_heroic', make_slot((166,91,211))),
        ('slot_selected', make_slot(GOLD, selected=True)),
        ('boss_panel', make_panel(RED, strong=True, danger=True)),
        ('resource_chip', make_panel(TEAL, glass=True)),
        ('tab_active', make_button(TEAL)),
        ('tab_inactive', make_button(GOLD, secondary=True)),
        ('action_button', make_circle_frame(TEAL, 6)),
        ('skill_button', make_circle_frame(GOLD, 5)),
        ('frame_portrait', make_portrait_frame(GOLD)),
        ('skill_frame', make_circle_frame(GOLD_LIGHT, 5)),
        ('slot', make_slot((119,139,153))),
        ('nav_active', make_button(TEAL)),
        ('nav_idle', make_button(GOLD, secondary=True)),
        ('stage_node', make_node(TEAL)),
        ('stage_node_locked', make_node((120,130,140), locked=True)),
        ('stage_node_boss', make_node(RED, boss=True)),
        ('medal', make_circle_frame(GOLD_LIGHT, 7)),
        ('toast', make_panel(TEAL, glass=True)),
        ('divider', make_panel(GOLD)),
        ('portrait_small', make_portrait_frame(TEAL)),
    ]
    rows = math.ceil(len(frames) / COLS)
    atlas = Image.new('RGBA', (COLS * FRAME, rows * FRAME), (0,0,0,0))
    meta = {'frames': {}, 'animations': {}, 'meta': {'app':'LUMERIFT visual overhaul v1.2.0','version':'1.2.0','image':'ui_obsidian_v2.webp','format':'RGBA8888','size':{'w':COLS*FRAME,'h':rows*FRAME},'scale':'1'}}
    for i, (name, tile) in enumerate(frames):
        x = (i % COLS) * FRAME
        y = (i // COLS) * FRAME
        atlas.alpha_composite(tile, (x, y))
        meta['frames'][name] = {
            'frame': {'x':x,'y':y,'w':FRAME,'h':FRAME},
            'rotated': False,
            'trimmed': False,
            'spriteSourceSize': {'x':0,'y':0,'w':FRAME,'h':FRAME},
            'sourceSize': {'w':FRAME,'h':FRAME},
            'anchor': {'x':0.5,'y':0.5},
        }
    atlas.save(UI_DIR / 'ui_obsidian_v2.webp', 'WEBP', quality=94, method=5, lossless=True)
    (UI_DIR / 'ui_obsidian_v2.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')


def color_grade_background(src: Path, dest: Path, lobby: bool) -> None:
    img = Image.open(src).convert('RGB')
    target = (1080, 1920)
    ratio = max(target[0]/img.width, target[1]/img.height)
    img = img.resize((round(img.width*ratio), round(img.height*ratio)), Image.Resampling.LANCZOS)
    left = (img.width-target[0])//2
    top = max(0, (img.height-target[1])//2)
    img = img.crop((left, top, left+target[0], top+target[1]))
    img = ImageEnhance.Contrast(img).enhance(1.18)
    img = ImageEnhance.Color(img).enhance(0.78 if lobby else 0.72)
    img = ImageEnhance.Brightness(img).enhance(0.82 if lobby else 0.72)
    overlay = Image.new('RGBA', target, (0,0,0,0))
    od = ImageDraw.Draw(overlay, 'RGBA')
    od.rectangle((0,0,target[0],target[1]), fill=(3,10,16,50))
    od.rectangle((0,0,target[0],260), fill=(2,6,10,115))
    od.rectangle((0,target[1]-520,target[0],target[1]), fill=(2,5,10,150 if lobby else 100))
    # Rift glow and soft magical haze
    overlay = Image.alpha_composite(overlay, glow_layer(target, (690,160,1190,720), TEAL, 90, 65 if lobby else 35))
    overlay = Image.alpha_composite(overlay, glow_layer(target, (-200,900,420,1600), PURPLE, 130, 30))
    if not lobby:
        od = ImageDraw.Draw(overlay, 'RGBA')
        od.ellipse((110,760,970,1740), fill=(5,13,18,75), outline=(*TEAL,45), width=5)
    # vignette
    vignette = Image.new('L', target, 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse((-260,-260,target[0]+260,target[1]+260), fill=220)
    vignette = ImageChops.invert(vignette.filter(ImageFilter.GaussianBlur(170)))
    dark = Image.new('RGBA', target, (0,0,0,170))
    dark.putalpha(vignette)
    out = Image.alpha_composite(img.convert('RGBA'), overlay)
    out = Image.alpha_composite(out, dark)
    out.save(dest, 'WEBP', quality=90, method=5)


def crop_portrait(src: Path, dest: Path, boss=False) -> None:
    img = Image.open(src).convert('RGBA')
    # remove the old baked border and recrop for a cinematic portrait
    margin_x = max(12, int(img.width * 0.035))
    margin_y = max(12, int(img.height * 0.025))
    img = img.crop((margin_x, margin_y, img.width-margin_x, img.height-margin_y))
    target = (720, 920 if not boss else 720)
    ratio = max(target[0]/img.width, target[1]/img.height)
    img = img.resize((round(img.width*ratio), round(img.height*ratio)), Image.Resampling.LANCZOS)
    left = (img.width-target[0])//2
    top = max(0, (img.height-target[1])//2)
    img = img.crop((left, top, left+target[0], top+target[1]))
    img = ImageEnhance.Contrast(img).enhance(1.08)
    img = ImageEnhance.Color(img).enhance(0.88)
    grade = Image.new('RGBA', target, (6,14,20,28))
    img = Image.alpha_composite(img, grade)
    # bottom fade and edge vignette
    fade = Image.new('L', target, 255)
    fd = ImageDraw.Draw(fade)
    for y in range(target[1]):
        if y > target[1]*0.70:
            t=(y-target[1]*0.70)/(target[1]*0.30)
            fd.line((0,y,target[0],y),fill=max(0,round(255*(1-t*0.82))))
    img.putalpha(fade)
    img.save(dest, 'WEBP', quality=92, method=5)


def font(size: int, bold=False, display=False) -> ImageFont.FreeTypeFont:
    path = FONT_DISPLAY if display else (FONT_BOLD if bold else FONT_REG)
    return ImageFont.truetype(path, size)


def panel(draw: ImageDraw.ImageDraw, box, accent=GOLD, fill=(8,16,23,215), radius=28, width=3):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=(*accent,220), width=width)
    inset=(box[0]+7,box[1]+7,box[2]-7,box[3]-7)
    draw.rounded_rectangle(inset, radius=max(5,radius-7), outline=(255,255,255,35), width=1)


def text(draw: ImageDraw.ImageDraw, xy, value, size, color=(240,244,238), bold=False, anchor=None, display=False):
    draw.text(xy, value, font=font(size,bold,display), fill=color, anchor=anchor)


def extract_frame(atlas_path: Path, json_path: Path, key: str) -> Image.Image:
    atlas=Image.open(atlas_path).convert('RGBA')
    data=json.loads(json_path.read_text(encoding='utf-8'))
    entry=data['frames'][key]['frame']
    return atlas.crop((entry['x'],entry['y'],entry['x']+entry['w'],entry['y']+entry['h']))


def put_contain(canvas: Image.Image, image: Image.Image, box, alpha=255):
    x1,y1,x2,y2=box
    bw,bh=x2-x1,y2-y1
    ratio=min(bw/image.width,bh/image.height)
    im=image.resize((max(1,round(image.width*ratio)),max(1,round(image.height*ratio))),Image.Resampling.LANCZOS)
    if alpha<255:
        a=im.getchannel('A').point(lambda p:p*alpha//255)
        im.putalpha(a)
    canvas.alpha_composite(im,(x1+(bw-im.width)//2,y1+(bh-im.height)//2))


def draw_action_button(canvas, center, radius, label, accent, icon=None):
    d=ImageDraw.Draw(canvas,'RGBA')
    x,y=center
    d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=(8,15,22,215),outline=(*accent,235),width=5)
    d.ellipse((x-radius+10,y-radius+10,x+radius-10,y+radius-10),fill=(16,28,37,225),outline=(255,255,255,35),width=2)
    if icon:
        put_contain(canvas,icon,(x-radius+20,y-radius+18,x+radius-20,y+radius-18))
    else:
        text(d,(x,y),label,18,(245,244,232),True,'mm')


def build_previews() -> None:
    lobby_bg=Image.open(BG_DIR/'lobby_forest_v2.webp').convert('RGBA').resize((540,960),Image.Resampling.LANCZOS)
    battle_bg=Image.open(BG_DIR/'battle_forest_v2.webp').convert('RGBA').resize((540,960),Image.Resampling.LANCZOS)
    hero=Image.open(PORTRAIT_DIR/'hero_v2.webp').convert('RGBA')
    boss=Image.open(PORTRAIT_DIR/'boss_v2.webp').convert('RGBA')
    player=extract_frame(LIVE1/'atlases/player/player_live_v1.webp', LIVE1/'atlases/player/player_live_v1.json','knight_00')
    monster=extract_frame(LIVE1/'atlases/monsters/monsters_live_v1.webp', LIVE1/'atlases/monsters/monsters_live_v1.json','monster_brute_idle_00')

    # lobby
    c=lobby_bg.copy(); d=ImageDraw.Draw(c,'RGBA')
    d.rectangle((0,0,540,960),fill=(1,5,9,25))
    panel(d,(18,18,522,102),GOLD,(5,12,18,220),24,2)
    text(d,(36,37),'LUMERIFT',30,GOLD_LIGHT,True,display=True)
    text(d,(38,72),'균열의 계승자  ·  안개숲 전초기지',13,(154,198,190))
    panel(d,(389,31,505,88),TEAL,(7,20,24,215),18,2)
    text(d,(405,43),'전투력',10,(150,170,173),True)
    text(d,(405,61),'12,480',22,GOLD_LIGHT,True)
    put_contain(c,hero,(8,104,375,735),alpha=245)
    # mission card
    panel(d,(314,160,522,525),GOLD,(6,14,20,210),28,2)
    text(d,(336,188),'오늘의 작전',13,GOLD_LIGHT,True)
    text(d,(336,220),'안개숲 균열',22,(245,246,239),True)
    text(d,(336,258),'1-7  ·  심연의 전령',13,(146,187,181))
    d.line((336,286,500,286),fill=(*GOLD,90),width=2)
    for i,(lbl,val,col) in enumerate([('진행', '7 / 10', TEAL_LIGHT),('퀘스트','2 수령 가능',GOLD_LIGHT),('장비','영웅 등급', (199,129,235))]):
        y=316+i*66
        text(d,(336,y),lbl,11,(132,151,158),True)
        text(d,(336,y+20),val,18,col,True)
    # primary action
    panel(d,(30,712,510,784),TEAL,(7,28,29,235),24,3)
    text(d,(270,749),'균열 작전 시작',22,(245,246,239),True,'mm')
    # bottom dock
    panel(d,(18,806,522,930),GOLD,(4,10,15,230),26,2)
    labels=['작전','장비','퀘스트','도감','설정']
    for i,label in enumerate(labels):
        x=68+i*101
        color=TEAL if i==0 else (105,121,132)
        d.ellipse((x-24,826,x+24,874),fill=(10,20,27,230),outline=(*color,220),width=3)
        text(d,(x,898),label,12,(235,239,234),True,'mm')
    c.save(PREVIEWS/'v1.2.0_lobby_preview.webp','WEBP',quality=92,method=5)

    # battle
    c=battle_bg.copy(); d=ImageDraw.Draw(c,'RGBA')
    # compact top hud
    panel(d,(16,16,280,92),TEAL,(5,13,19,215),22,2)
    text(d,(34,30),'Lv.18  아리아',14,(241,243,235),True)
    d.rounded_rectangle((34,56,242,74),radius=9,fill=(5,11,16,230),outline=(255,255,255,35),width=1)
    d.rounded_rectangle((36,58,204,72),radius=7,fill=(*TEAL,235))
    text(d,(250,61),'86%',11,(224,237,230),True,'mm')
    panel(d,(300,18,522,74),GOLD,(6,14,20,210),19,2)
    text(d,(318,31),'WAVE 3 / 3',12,(160,183,184),True)
    text(d,(500,31),'적 4',12,GOLD_LIGHT,True,'ra')
    # boss bar
    panel(d,(48,104,520,170),RED,(8,12,18,225),22,2)
    put_contain(c,boss,(54,109,110,165))
    text(d,(122,117),'심연의 전령',15,(245,240,236),True)
    text(d,(490,117),'PHASE 2',11,(225,131,145),True,'ra')
    d.rounded_rectangle((122,143,492,157),radius=7,fill=(4,8,12,230))
    d.rounded_rectangle((124,145,416,155),radius=5,fill=(*RED,235))
    # actors
    put_contain(c,player,(185,440,345,655))
    put_contain(c,monster,(72,390,205,555))
    put_contain(c,monster,(358,390,500,560),alpha=215)
    d.ellipse((238,642,322,668),fill=(0,0,0,80))
    # objective chip
    panel(d,(178,190,362,230),GOLD,(5,12,18,180),16,1)
    text(d,(270,210),'18 COMBO',14,GOLD_LIGHT,True,'mm')
    # controls
    d.ellipse((24,780,164,920),fill=(8,16,22,135),outline=(*TEAL,150),width=4)
    d.ellipse((72,828,116,872),fill=(*TEAL,115))
    draw_action_button(c,(472,842),61,'공격',TEAL)
    draw_action_button(c,(378,858),46,'크래시',GOLD)
    draw_action_button(c,(292,884),42,'노바',PURPLE)
    draw_action_button(c,(205,838),38,'회피',(120,148,170))
    c.save(PREVIEWS/'v1.2.0_battle_preview.webp','WEBP',quality=92,method=5)

    # inventory
    c=lobby_bg.filter(ImageFilter.GaussianBlur(6)).copy(); d=ImageDraw.Draw(c,'RGBA'); d.rectangle((0,0,540,960),fill=(2,7,11,175))
    panel(d,(18,18,522,104),GOLD,(5,12,18,235),24,2)
    text(d,(34,33),'장비 보관소',26,GOLD_LIGHT,True)
    text(d,(36,72),'전투력 12,480  ·  골드 18,240',13,(154,191,185))
    panel(d,(18,126,340,824),GOLD,(5,12,18,230),26,2)
    panel(d,(354,126,522,824),TEAL,(5,12,18,230),26,2)
    for row in range(4):
        for col in range(3):
            x=36+col*96; y=178+row*116
            accent=[(119,139,153),(65,151,211),(166,91,211)][(row+col)%3]
            d.rounded_rectangle((x,y,x+78,y+78),radius=17,fill=(8,15,22,235),outline=(*accent,230),width=4)
            d.rounded_rectangle((x+9,y+9,x+69,y+69),radius=12,outline=(255,255,255,35),width=1)
            text(d,(x+39,y+90),f'+{row+col+1}',12,(226,231,224),True,'mm')
    text(d,(372,152),'선택 장비',12,(143,169,168),True)
    text(d,(372,184),'균열검',24,GOLD_LIGHT,True)
    d.rounded_rectangle((388,228,488,328),radius=22,fill=(8,15,22,235),outline=(*GOLD,235),width=4)
    text(d,(438,278),'검',34,GOLD_LIGHT,True,'mm')
    for i,(lbl,val) in enumerate([('전투력','+420'),('공격','+88'),('치명타','+6%'),('강화','7 / 10')]):
        y=362+i*62
        text(d,(372,y),lbl,11,(132,151,158),True)
        text(d,(372,y+19),val,18,(238,242,235),True)
    panel(d,(372,646,504,700),TEAL,(6,26,28,235),18,2); text(d,(438,673),'장착',17,(245,246,239),True,'mm')
    panel(d,(372,714,504,768),GOLD,(21,17,9,235),18,2); text(d,(438,741),'강화',17,GOLD_LIGHT,True,'mm')
    panel(d,(18,844,522,930),GOLD,(4,10,15,235),26,2)
    text(d,(50,886),'전체',14,TEAL_LIGHT,True,'mm'); text(d,(160,886),'무기',14,(210,216,210),True,'mm'); text(d,(270,886),'방어구',14,(210,216,210),True,'mm'); text(d,(400,886),'장신구',14,(210,216,210),True,'mm')
    c.save(PREVIEWS/'v1.2.0_inventory_preview.webp','WEBP',quality=92,method=5)

    # stage select
    c=lobby_bg.copy(); d=ImageDraw.Draw(c,'RGBA'); d.rectangle((0,0,540,960),fill=(2,7,11,120))
    panel(d,(18,18,522,104),GOLD,(5,12,18,225),24,2)
    text(d,(34,34),'안개숲 작전도',26,GOLD_LIGHT,True)
    text(d,(36,72),'CHAPTER 1  ·  진행 7 / 10',13,(154,191,185))
    # path
    points=[(95,220),(235,280),(392,240),(428,390),(270,450),(110,510),(170,650),(350,700),(430,820)]
    for a,b in zip(points,points[1:]): d.line((*a,*b),fill=(*GOLD,100),width=5)
    for i,(x,y) in enumerate(points):
        bossnode=i==len(points)-1
        clr=RED if bossnode else (TEAL if i<=6 else (105,121,132))
        d.ellipse((x-34,y-34,x+34,y+34),fill=(7,14,20,235),outline=(*clr,235),width=5)
        text(d,(x,y),('B' if bossnode else str(i+1)),18,(245,244,235),True,'mm')
    panel(d,(18,760,330,930),GOLD,(5,12,18,225),24,2)
    text(d,(36,784),'1-7  심연의 전령',20,GOLD_LIGHT,True)
    text(d,(36,822),'권장 전투력 11,800',13,(168,192,188))
    text(d,(36,852),'최초 보상  영웅 장비 · 1,200G',13,(224,229,221))
    panel(d,(350,842,522,930),TEAL,(6,26,28,235),23,3)
    text(d,(436,886),'도전 시작',18,(245,246,239),True,'mm')
    c.save(PREVIEWS/'v1.2.0_stage_preview.webp','WEBP',quality=92,method=5)

    # result
    c=battle_bg.filter(ImageFilter.GaussianBlur(4)).copy(); d=ImageDraw.Draw(c,'RGBA'); d.rectangle((0,0,540,960),fill=(2,6,10,160))
    text(d,(270,78),'균열 안정화',31,GOLD_LIGHT,True,'mm',True)
    text(d,(270,116),'1-7 심연의 전령 · 최초 클리어',13,(161,196,190),True,'mm')
    d.ellipse((190,160,350,320),fill=(7,14,20,235),outline=(*GOLD_LIGHT,245),width=7)
    d.ellipse((206,176,334,304),outline=(255,255,255,45),width=2)
    text(d,(270,240),'S',86,GOLD_LIGHT,True,'mm',True)
    for i,(lbl,val) in enumerate([('처치','18'),('최대 콤보','24'),('전투 시간','54초')]):
        x=34+i*169
        panel(d,(x,352,x+150,430),TEAL,(5,14,20,220),18,2)
        text(d,(x+16,368),lbl,11,(137,158,160),True)
        text(d,(x+16,391),val,23,(241,244,236),True)
    panel(d,(30,462,510,688),GOLD,(5,12,18,225),26,2)
    text(d,(54,490),'전투 보상',18,GOLD_LIGHT,True)
    text(d,(54,530),'경험치  +340',16,(238,242,235),True)
    text(d,(300,530),'골드  +605',16,(238,242,235),True)
    d.line((54,570,486,570),fill=(*GOLD,90),width=2)
    text(d,(54,592),'영웅 장비',12,(154,190,184),True)
    d.rounded_rectangle((54,620,120,686),radius=14,fill=(8,15,22,235),outline=(*PURPLE,235),width=4)
    text(d,(87,653),'검',24,(226,195,245),True,'mm')
    panel(d,(30,742,248,810),GOLD,(16,14,8,235),22,2); text(d,(139,776),'재도전',18,GOLD_LIGHT,True,'mm')
    panel(d,(292,742,510,810),TEAL,(5,26,28,235),22,2); text(d,(401,776),'다음 스테이지',18,(245,246,239),True,'mm')
    panel(d,(30,834,510,906),GOLD,(5,12,18,230),22,2); text(d,(270,870),'거점으로 복귀',17,(235,239,232),True,'mm')
    c.save(PREVIEWS/'v1.2.0_result_preview.webp','WEBP',quality=92,method=5)


def main() -> None:
    build_ui_atlas()
    color_grade_background(LIVE1/'backgrounds/lobby_forest_live_v1.webp', BG_DIR/'lobby_forest_v2.webp', True)
    color_grade_background(LIVE1/'backgrounds/battle_forest_live_v1.webp', BG_DIR/'battle_forest_v2.webp', False)
    crop_portrait(LIVE1/'portraits/hero_live_v1.webp', PORTRAIT_DIR/'hero_v2.webp', False)
    crop_portrait(LIVE1/'portraits/boss_harbinger_live_v1.webp', PORTRAIT_DIR/'boss_v2.webp', True)
    build_previews()
    print('PASS visual overhaul assets v1.2.0')


if __name__ == '__main__':
    main()

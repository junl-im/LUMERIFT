from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/live/v17/atlases'
SOURCE = ROOT / 'art_source/lumerift_owned/premium_parts_v17'
FRAME = 128
S = 4
HI = FRAME * S
DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']


def rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip('#')
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4)) + (alpha,)


def canvas() -> Image.Image:
    return Image.new('RGBA', (HI, HI), (0, 0, 0, 0))


def finish(image: Image.Image) -> Image.Image:
    return image.resize((FRAME, FRAME), Image.Resampling.LANCZOS)


def add_glow(base: Image.Image, layer: Image.Image, radius: float = 7, opacity: float = .7) -> None:
    blur = layer.filter(ImageFilter.GaussianBlur(max(1, round(radius * S))))
    if opacity < 1:
        blur.putalpha(blur.getchannel('A').point(lambda p: round(p * opacity)))
    base.alpha_composite(blur)


def direction_vector(direction: str) -> tuple[float, float]:
    index = DIRECTIONS.index(direction)
    angle = -math.pi / 2 + index * math.pi / 4
    return math.cos(angle), math.sin(angle)


def player_direction_part(direction: str, kind: str) -> Image.Image:
    vx, vy = direction_vector(direction)
    side = -1 if vx < -0.15 else 1
    frontal = max(0.45, 1 - abs(vx) * 0.35)
    back_view = max(0, -vy)
    front_view = max(0, vy)
    img = canvas(); layer = canvas(); d = ImageDraw.Draw(layer)
    blue = '#6477e8'; violet = '#8d6cff'; cyan = '#72f5df'; gold = '#f0d49a'
    cx, cy = 64, 67

    if kind == 'hair':
        strands = 7
        for i in range(strands):
            t = (i - (strands - 1) / 2) / 3
            x = cx + t * 9 * frontal + vx * 4
            top = 34 + abs(t) * 2 - front_view * 2
            end_x = x - side * (3 + abs(t) * 2) - vx * 4
            end_y = 67 + back_view * (10 + abs(t) * 5) + front_view * 2
            d.line((x*S, top*S, end_x*S, end_y*S), fill=rgba('#20294f', 235), width=(4 + (i % 2))*S)
            d.line(((x+side)*S, top*S, (end_x+side)*S, (end_y-3)*S), fill=rgba(blue, 115), width=S)
        d.arc(((42+vx*4)*S, 31*S, (86+vx*4)*S, 66*S), 190, 350, fill=rgba(gold, 105), width=S)
    elif kind == 'armor':
        shoulder_y = 59 + front_view * 2
        left = [(64-10*frontal, 55), (64-31*frontal+vx*5, shoulder_y), (64-23*frontal+vx*4, 78), (64-8*frontal, 72)]
        right = [(64+10*frontal, 55), (64+31*frontal+vx*5, shoulder_y), (64+23*frontal+vx*4, 78), (64+8*frontal, 72)]
        for pts, color in ((left, '#313b69'), (right, '#3e4778')):
            d.polygon([(x*S,y*S) for x,y in pts], fill=rgba(color, 218), outline=rgba(gold, 235))
        chest = [(53+vx*3,61),(64+vx*5,54),(75+vx*3,61),(72+vx*2,94),(64,101),(56+vx*2,94)]
        d.polygon([(x*S,y*S) for x,y in chest], fill=rgba('#2c345d', 225), outline=rgba(gold, 215))
        d.line(((53+vx*3)*S,68*S,(64+vx*3)*S,82*S,(75+vx*3)*S,68*S), fill=rgba(violet, 190), width=2*S)
    elif kind == 'cape':
        width = 20 * frontal + back_view * 5
        sway = -vx * (7 + back_view * 5)
        points = [(64-width+sway, 53), (64-8+sway, 49), (64+sway, 58), (64+8+sway,49), (64+width+sway,53), (64+width*1.15+sway,115), (64+sway,124), (64-width*1.12+sway,115)]
        d.polygon([(x*S,y*S) for x,y in points], fill=rgba('#29305f', 195), outline=rgba(gold, 205))
        for i in range(4):
            x = 64-width*.65+i*(width*1.3/3)+sway
            d.line((x*S,58*S,(x-vx*6)*S,116*S), fill=rgba(blue, 80), width=2*S)
        d.line(((64+sway)*S,62*S,(64+sway)*S,119*S), fill=rgba(cyan, 115), width=S)
    else:
        face_x = cx + vx * 5
        visible = 0.35 + front_view * .65 + (1-abs(vy))*.3
        d.ellipse(((face_x-15*frontal)*S, 36*S, (face_x+15*frontal)*S, 65*S), outline=rgba('#cbd7ff', round(120*visible)), width=2*S)
        diamond = [(face_x,39),(face_x+5*frontal,48),(face_x,58),(face_x-5*frontal,48)]
        d.polygon([(x*S,y*S) for x,y in diamond], fill=rgba(violet, round(210*visible)), outline=rgba(gold, round(240*visible)))
        eye_x = face_x + side * 5 * frontal
        d.line(((eye_x-3)*S,52*S,(eye_x+3)*S,52*S), fill=rgba(cyan, round(220*visible)), width=2*S)

    add_glow(img, layer, 5 if kind != 'face' else 8, .55)
    img.alpha_composite(layer)
    return finish(img)


VARIANT_COLORS = {
    'void': ('#513483', '#9c70ff', '#6ef5df'),
    'frost': ('#245d7f', '#63c9f4', '#e2fbff'),
    'inferno': ('#783123', '#ee6e4d', '#ffd38d'),
    'boss': ('#3f285e', '#b477ff', '#f1d28e'),
}


def monster_body_part(variant: str, kind: str) -> Image.Image:
    base, accent, core = VARIANT_COLORS[variant]
    boss = variant == 'boss'
    img = canvas(); layer = canvas(); d = ImageDraw.Draw(layer)
    cx, cy = 64, 70
    if kind == 'headplate':
        pts=[(33,62),(42,41),(55,47),(64,29 if boss else 36),(73,47),(87,40),(96,62),(77,72),(64,66),(51,72)]
        d.polygon([(x*S,y*S) for x,y in pts], fill=rgba(base,225), outline=rgba(accent,240))
        for side in (-1,1):
            d.polygon([((64+side*13)*S,50*S),((64+side*25)*S,34*S),((64+side*21)*S,58*S)], fill=rgba(accent,195), outline=rgba(core,180))
        d.line((48*S,60*S,80*S,60*S), fill=rgba(core,200), width=2*S)
    elif kind == 'torso':
        pts=[(39,48),(64,37),(89,48),(99,76),(84,105),(64,112),(44,105),(29,76)]
        d.polygon([(x*S,y*S) for x,y in pts], fill=rgba(base,220), outline=rgba(accent,235))
        d.polygon([(64*S,48*S),(78*S,68*S),(64*S,94*S),(50*S,68*S)], fill=rgba(accent,120), outline=rgba(core,220))
        for i in range(3):
            d.arc(((39+i*5)*S,(51+i*4)*S,(89-i*5)*S,(101-i*4)*S),190,350,fill=rgba('#f2d59a',100+i*30),width=S)
    elif kind == 'forelegs':
        for side in (-1,1):
            x=64+side*22
            d.polygon([(x*S,54*S),(x+side*16*S,78*S),(x+side*12*S,111*S),(x-side*3*S,99*S),(x-side*8*S,67*S)], fill=rgba(base,220), outline=rgba(accent,230))
            for c in range(3):
                tip=x+side*(12+c*7)
                d.polygon([(tip*S,105*S),(tip+side*8*S,(116+c)*S),(tip-side*2*S,111*S)], fill=rgba(core,205))
    elif kind == 'hindlegs':
        for side in (-1,1):
            x=64+side*27
            d.polygon([(x*S,45*S),(x+side*15*S,65*S),(x+side*22*S,101*S),(x+side*4*S,112*S),(x-side*9*S,80*S)], fill=rgba(base,215), outline=rgba(accent,225))
            d.line((x*S,56*S,(x+side*13)*S,88*S), fill=rgba(core,145), width=2*S)
    elif kind == 'dorsal':
        count=7 if boss else 5
        for i in range(count):
            t=i/(count-1)
            x=35+t*58
            h=18+(1-abs(t-.5)*2)*(28 if boss else 21)
            d.polygon([((x-7)*S,72*S),(x*S,(72-h)*S),((x+7)*S,72*S),(x*S,80*S)], fill=rgba(accent,200), outline=rgba(core,180))
        d.arc((27*S,55*S,101*S,103*S),185,355,fill=rgba('#f0d59a',150),width=2*S)
    else:
        d.arc((8*S,45*S,120*S,127*S),150,340,fill=rgba(base,225),width=(12 if boss else 9)*S)
        d.arc((12*S,49*S,116*S,123*S),150,340,fill=rgba(accent,190),width=3*S)
        d.polygon([(100*S,84*S),(119*S,72*S),(112*S,95*S)], fill=rgba(core,210), outline=rgba('#ffffff',140))
    add_glow(img, layer, 8 if boss else 6, .62)
    img.alpha_composite(layer)
    return finish(img)


def core_frame(state: str, index: int, count: int) -> Image.Image:
    p = 0 if count <= 1 else index/(count-1)
    img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer); cx=64; cy=64
    if state == 'shielded':
        for ring in range(3):
            r=27+ring*9+math.sin(p*math.tau+ring)*2
            d.ellipse(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S), outline=rgba('#83f5df' if ring%2==0 else '#f1d69a',180-ring*25), width=(3-ring//2)*S)
        for i in range(8):
            a=math.tau*i/8+p*.35
            d.line(((cx+math.cos(a)*23)*S,(cy+math.sin(a)*23)*S,(cx+math.cos(a)*53)*S,(cy+math.sin(a)*53)*S), fill=rgba('#9b80ff',145), width=2*S)
    elif state == 'fractured':
        d.ellipse((35*S,35*S,93*S,93*S), fill=rgba('#8057dc',175), outline=rgba('#f2d59b',235), width=3*S)
        for i,a in enumerate([-2.55,-1.65,-.75,.15,1.05,2.15]):
            wobble=math.sin(p*math.tau+i)*.12
            d.line((cx*S,cy*S,(cx+math.cos(a+wobble)*(42+i%2*8))*S,(cy+math.sin(a+wobble)*(42+i%2*8))*S), fill=rgba('#ffffff',220), width=(2+(i%2))*S)
    elif state == 'shattered':
        for i in range(12):
            a=math.tau*i/12 + p*.42
            r=18+p*(28+(i%3)*8)
            x=cx+math.cos(a)*r; y=cy+math.sin(a)*r
            size=7+(i%3)*2
            d.polygon([(x*S,(y-size)*S),((x+size)*S,y*S),(x*S,(y+size)*S),((x-size)*S,y*S)], fill=rgba('#b07cff',round(230*(1-p*.55))), outline=rgba('#f6dfa7',190))
        d.ellipse(((cx-(18-8*p))*S,(cy-(18-8*p))*S,(cx+(18-8*p))*S,(cy+(18-8*p))*S), fill=rgba('#ffffff',round(170*(1-p))))
    elif state == 'regenerating':
        for i in range(12):
            a=math.tau*i/12-p*.5
            r=54-p*(30+(i%2)*6)
            x=cx+math.cos(a)*r; y=cy+math.sin(a)*r
            d.line((x*S,y*S,cx*S,cy*S),fill=rgba('#73f3df',125),width=2*S)
            d.ellipse(((x-4)*S,(y-4)*S,(x+4)*S,(y+4)*S),fill=rgba('#ac80ff',180))
        r=10+p*18
        d.ellipse(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S), fill=rgba('#8f70f0',150+round(p*65)), outline=rgba('#f4d89b',220), width=2*S)
    else:
        for i in range(16):
            a=math.tau*i/16+p*.6
            inner=18; outer=48+(i%2)*11+math.sin(p*math.tau+i)*3
            d.line(((cx+math.cos(a)*inner)*S,(cy+math.sin(a)*inner)*S,(cx+math.cos(a)*outer)*S,(cy+math.sin(a)*outer)*S),fill=rgba('#ffd67c' if i%2 else '#b77dff',220),width=(2+i%3)*S)
        r=20+math.sin(p*math.tau)*3
        d.ellipse(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S),fill=rgba('#b582ff',205),outline=rgba('#fff0b8',245),width=3*S)
    add_glow(img,layer,12,.95); img.alpha_composite(layer); return finish(img)


def ui_icon(kind: str) -> Image.Image:
    colors = {
        'wardrobe':('#8b72ff','#f1d69a'),'compare':('#68e6df','#ffffff'),'preset':('#ad7aff','#f6dba2'),'cloud':('#5ac7ef','#dff8ff'),
        'recovery':('#6ee4b5','#effff9'),'audit':('#d19cff','#f1d69a'),'search':('#8bb3ff','#ffffff'),'lock':('#f0b85f','#fff0bc'),
        'health':('#ef657c','#ffd6df'),'shield':('#69b7f5','#e8f7ff'),'haste':('#76efd5','#ffffff'),'power':('#f2a15f','#ffe3ae'),
        'quest':('#d9a35f','#fff0bd'),'mail':('#77bce7','#ffffff'),'ranking':('#f3c85e','#fff3b5'),'guild':('#9c7cff','#e6ddff'),
        'skillcard':('#8a75ff','#f0d69a'),'equipment':('#6fe5d2','#f1d69a'),'bosswarn':('#f06c5b','#ffe0b5'),'core':('#c17aff','#f1d69a'),
        'android':('#6cd492','#eaffef'),'ios':('#d2d8e6','#ffffff'),'timeline':('#7c9fff','#e7edff'),'merge':('#bd85ff','#f1d69a'),
    }
    base, accent = colors[kind]
    img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer)
    d.rounded_rectangle((10*S,10*S,118*S,118*S),radius=23*S,fill=rgba('#0d1528',232),outline=rgba(accent,215),width=3*S)
    d.rounded_rectangle((18*S,18*S,110*S,110*S),radius=17*S,outline=rgba(base,170),width=2*S)
    cx=64; cy=64
    if kind in {'wardrobe','equipment'}:
        d.polygon([(cx*S,28*S),(91*S,43*S),(85*S,96*S),(cx*S,108*S),(43*S,96*S),(37*S,43*S)],fill=rgba(base,175),outline=rgba(accent,235))
        d.line((cx*S,34*S,cx*S,100*S),fill=rgba('#ffffff',110),width=S)
    elif kind == 'compare':
        for side in (-1,1):
            x=cx+side*23
            d.polygon([(x*S,35*S),((x+side*18)*S,64*S),(x*S,93*S),((x-side*12)*S,64*S)],fill=rgba(base,165),outline=rgba(accent,225))
        d.line((48*S,64*S,80*S,64*S),fill=rgba('#ffffff',200),width=3*S)
    elif kind in {'preset','timeline'}:
        for i in range(3):
            y=42+i*21; d.line((34*S,y*S,94*S,y*S),fill=rgba(base if i%2==0 else accent,210),width=4*S); d.ellipse(((31+i*18)*S,(y-6)*S,(43+i*18)*S,(y+6)*S),fill=rgba(accent,220))
    elif kind == 'cloud':
        d.ellipse((30*S,55*S,67*S,86*S),fill=rgba(base,175)); d.ellipse((48*S,39*S,88*S,83*S),fill=rgba(base,190)); d.ellipse((70*S,55*S,101*S,86*S),fill=rgba(base,175)); d.rectangle((39*S,65*S,92*S,87*S),fill=rgba(base,185)); d.line((64*S,83*S,64*S,102*S),fill=rgba(accent,230),width=4*S)
    elif kind == 'recovery':
        d.arc((31*S,31*S,97*S,97*S),35,315,fill=rgba(base,230),width=7*S); d.polygon([(31*S,55*S),(28*S,32*S),(51*S,39*S)],fill=rgba(accent,220)); d.line((64*S,45*S,64*S,66*S,80*S,76*S),fill=rgba(accent,210),width=4*S)
    elif kind in {'audit','quest','mail'}:
        d.rounded_rectangle((36*S,29*S,92*S,101*S),radius=7*S,fill=rgba(base,145),outline=rgba(accent,230),width=3*S)
        if kind == 'mail':
            d.line((38*S,39*S,64*S,66*S,90*S,39*S),fill=rgba(accent,230),width=3*S)
        else:
            for i in range(3): d.line((45*S,(47+i*16)*S,83*S,(47+i*16)*S),fill=rgba(accent,210),width=3*S)
    elif kind == 'search':
        d.ellipse((34*S,32*S,79*S,77*S),outline=rgba(base,230),width=7*S); d.line((75*S,73*S,98*S,96*S),fill=rgba(accent,230),width=7*S)
    elif kind == 'lock':
        d.rounded_rectangle((36*S,57*S,92*S,101*S),radius=7*S,fill=rgba(base,180),outline=rgba(accent,230),width=3*S); d.arc((45*S,29*S,83*S,72*S),180,360,fill=rgba(accent,230),width=6*S)
    elif kind in {'health','shield','haste','power'}:
        if kind == 'health':
            d.polygon([(64*S,100*S),(31*S,64*S),(38*S,39*S),(64*S,51*S),(90*S,39*S),(97*S,64*S)],fill=rgba(base,205),outline=rgba(accent,220))
        elif kind == 'shield':
            d.polygon([(64*S,28*S),(96*S,42*S),(89*S,88*S),(64*S,106*S),(39*S,88*S),(32*S,42*S)],fill=rgba(base,175),outline=rgba(accent,230))
        elif kind == 'haste':
            for off in (-12,0,12): d.line((35*S,(52+off/2)*S,95*S,(36+off/2)*S),fill=rgba(base,230),width=5*S)
        else:
            for i in range(10):
                a=math.tau*i/10; d.line((cx*S,cy*S,(cx+math.cos(a)*42)*S,(cy+math.sin(a)*42)*S),fill=rgba(base if i%2==0 else accent,220),width=4*S)
    elif kind in {'ranking','guild'}:
        if kind == 'ranking':
            d.polygon([(64*S,28*S),(75*S,51*S),(101*S,54*S),(82*S,72*S),(88*S,99*S),(64*S,85*S),(40*S,99*S),(46*S,72*S),(27*S,54*S),(53*S,51*S)],fill=rgba(base,190),outline=rgba(accent,230))
        else:
            d.polygon([(64*S,29*S),(96*S,46*S),(89*S,92*S),(64*S,105*S),(39*S,92*S),(32*S,46*S)],fill=rgba(base,165),outline=rgba(accent,230)); d.line((48*S,76*S,64*S,46*S,80*S,76*S),fill=rgba(accent,230),width=4*S)
    elif kind in {'skillcard','bosswarn','core'}:
        for i in range(12):
            a=math.tau*i/12; d.line((cx*S,cy*S,(cx+math.cos(a)*43)*S,(cy+math.sin(a)*43)*S),fill=rgba(base if i%2==0 else accent,215),width=3*S)
        d.ellipse((48*S,48*S,80*S,80*S),fill=rgba(base,190),outline=rgba(accent,240),width=2*S)
    elif kind in {'android','ios'}:
        if kind == 'android':
            d.rounded_rectangle((38*S,43*S,90*S,94*S),radius=10*S,fill=rgba(base,190),outline=rgba(accent,225),width=3*S); d.line((44*S,40*S,36*S,28*S),fill=rgba(accent,220),width=3*S); d.line((84*S,40*S,92*S,28*S),fill=rgba(accent,220),width=3*S)
        else:
            d.ellipse((39*S,42*S,89*S,99*S),fill=rgba(base,180),outline=rgba(accent,230),width=3*S); d.ellipse((67*S,26*S,79*S,42*S),fill=rgba(accent,220))
    elif kind == 'merge':
        d.line((32*S,39*S,58*S,64*S,32*S,89*S),fill=rgba(base,230),width=6*S); d.line((96*S,39*S,70*S,64*S,96*S,89*S),fill=rgba(accent,230),width=6*S); d.ellipse((56*S,54*S,72*S,70*S),fill=rgba('#ffffff',200))
    add_glow(img,layer,8,.58); img.alpha_composite(layer); return finish(img)


def write_atlas(group: str, name: str, frames: list[tuple[str, Image.Image]], cols: int, animations: dict[str, list[str]] | None = None) -> tuple[Path, Path]:
    rows=math.ceil(len(frames)/cols)
    atlas=Image.new('RGBA',(cols*FRAME,rows*FRAME),(0,0,0,0)); data={}
    for idx,(key,image) in enumerate(frames):
        x=(idx%cols)*FRAME; y=(idx//cols)*FRAME; atlas.alpha_composite(image,(x,y))
        data[key]={'frame':{'x':x,'y':y,'w':FRAME,'h':FRAME},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':FRAME,'h':FRAME},'sourceSize':{'w':FRAME,'h':FRAME},'anchor':{'x':0.5,'y':0.5}}
    out=OUT/group; out.mkdir(parents=True,exist_ok=True)
    image_path=out/f'{name}.webp'; json_path=out/f'{name}.json'
    atlas.save(image_path,'WEBP',lossless=True,method=6)
    payload={'frames':data,'animations':animations or {k:[k] for k,_ in frames},'meta':{'app':'LUMERIFT premium parts v17 raster pipeline','version':'1.11.33','image':image_path.name,'format':'RGBA8888','size':{'w':atlas.width,'h':atlas.height},'scale':'1','source':'Premium Art Direction v2; direction-aware production overlays','usage':'runtime overlay; v16 and established body Atlases remain fallback'}}
    json_path.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return image_path,json_path


def main() -> None:
    player=[]
    for direction in DIRECTIONS:
        for part in ['hair','armor','cape','face']:
            player.append((f'premium.pose.v17.player.{direction}.{part}',player_direction_part(direction,part)))
    monster=[]
    for variant in ['void','frost','inferno','boss']:
        for part in ['headplate','torso','forelegs','hindlegs','dorsal','tailtip']:
            monster.append((f'premium.body.v17.monster.{variant}.{part}',monster_body_part(variant,part)))
    core=[]; animations={}
    for state,count in [('shielded',4),('fractured',4),('shattered',6),('regenerating',6),('overdrive',4)]:
        keys=[]
        for index in range(count):
            key=f'premium.core.v17.{state}.{index}'; keys.append(key); core.append((key,core_frame(state,index,count)))
        animations[f'premium.core.v17.{state}']=keys
    ui_kinds=['wardrobe','compare','preset','cloud','recovery','audit','search','lock','health','shield','haste','power','quest','mail','ranking','guild','skillcard','equipment','bosswarn','core','android','ios','timeline','merge']
    ui=[(f'premium.ui.v17.{kind}',ui_icon(kind)) for kind in ui_kinds]
    paths=[]
    paths += list(write_atlas('player','player_direction_parts_v17',player,8))
    paths += list(write_atlas('monsters','monster_body_parts_v17',monster,6))
    paths += list(write_atlas('effects','boss_core_fx_v17',core,6,animations))
    paths += list(write_atlas('ui','premium_ui_icons_v17',ui,6))
    SOURCE.mkdir(parents=True,exist_ok=True)
    for path in paths[::2]:
        (SOURCE/(path.stem+'_master.webp')).write_bytes(path.read_bytes())
    (SOURCE/'README.md').write_text(
        '# Premium Parts v17 Source Masters\n\n'
        '- 8방향 플레이어 피벗·가림 전용 파츠 32프레임.\n'
        '- 엘리트 3종·보스 전신 확장 파츠 24프레임.\n'
        '- 보스 코어 24프레임과 Premium UI 24프레임.\n'
        '- 기존 v16과 본체 Atlas는 안전 폴백으로 유지한다.\n'
        '- 최종 8방향 수작업 전신 본체 완료를 의미하지 않는다.\n',encoding='utf-8')
    for path in paths:
        print(path.relative_to(ROOT), path.stat().st_size)


if __name__ == '__main__':
    main()

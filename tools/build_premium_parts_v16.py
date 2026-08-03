from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/live/v16/atlases'
SOURCE = ROOT / 'art_source/lumerift_owned/premium_parts_v16'
S = 4
FRAME = 128
HI = FRAME * S


def rgba(hex_value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_value.lstrip('#')
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4)) + (alpha,)


def frame_canvas() -> Image.Image:
    return Image.new('RGBA', (HI, HI), (0, 0, 0, 0))


def glow(base: Image.Image, source: Image.Image, radius: int = 12, opacity: float = 0.75) -> None:
    blurred = source.filter(ImageFilter.GaussianBlur(radius * S))
    if opacity < 1:
        alpha = blurred.getchannel('A').point(lambda p: int(p * opacity))
        blurred.putalpha(alpha)
    base.alpha_composite(blurred)


def draw_polygon_layer(points: list[tuple[float, float]], fill: tuple[int, int, int, int], outline: tuple[int, int, int, int], width: float = 1.5) -> Image.Image:
    layer = frame_canvas()
    d = ImageDraw.Draw(layer)
    pts = [(round(x*S), round(y*S)) for x, y in points]
    d.polygon(pts, fill=fill)
    d.line(pts + [pts[0]], fill=outline, width=max(1, round(width*S)), joint='curve')
    return layer


def radial_rune(cx: float, cy: float, radius: float, color: str, gold: str = '#f1d69a', spokes: int = 8, inner: float = 0.45) -> Image.Image:
    layer = frame_canvas()
    d = ImageDraw.Draw(layer)
    c = rgba(color, 220)
    g = rgba(gold, 190)
    box = ((cx-radius)*S, (cy-radius)*S, (cx+radius)*S, (cy+radius)*S)
    d.ellipse(box, outline=c, width=2*S)
    r2 = radius * inner
    d.ellipse(((cx-r2)*S, (cy-r2)*S, (cx+r2)*S, (cy+r2)*S), outline=g, width=S)
    for i in range(spokes):
        a = math.tau * i / spokes
        p1 = (cx + math.cos(a)*r2, cy + math.sin(a)*r2)
        p2 = (cx + math.cos(a)*radius, cy + math.sin(a)*radius)
        d.line((p1[0]*S, p1[1]*S, p2[0]*S, p2[1]*S), fill=c if i % 2 == 0 else g, width=S)
    diamond = [(cx, cy-radius*0.55), (cx+radius*0.32, cy), (cx, cy+radius*0.55), (cx-radius*0.32, cy)]
    d.polygon([(x*S, y*S) for x,y in diamond], fill=rgba(color, 105), outline=rgba('#ffffff', 145))
    return layer


def finish(img: Image.Image) -> Image.Image:
    return img.resize((FRAME, FRAME), Image.Resampling.LANCZOS)


def player_hair_back() -> Image.Image:
    img = frame_canvas(); layer = frame_canvas(); d = ImageDraw.Draw(layer)
    for i, x in enumerate([44, 50, 56, 63, 70, 77, 84]):
        d.line((x*S, 34*S, (x-8+(i%3)*4)*S, (78+(i%2)*8)*S), fill=rgba('#20294f', 215), width=(4+(i%2))*S)
        d.line(((x+1)*S, 35*S, (x-5+(i%3)*4)*S, (70+(i%2)*8)*S), fill=rgba('#6572d5', 110), width=1*S)
    glow(img, layer, 4, .45); img.alpha_composite(layer); return finish(img)


def player_hair_front() -> Image.Image:
    img = frame_canvas(); layer = frame_canvas(); d = ImageDraw.Draw(layer)
    strands = [(43,39,56,67),(52,34,61,69),(62,32,64,66),(73,34,68,69),(83,39,73,66)]
    for i,(x1,y1,x2,y2) in enumerate(strands):
        d.line((x1*S,y1*S,x2*S,y2*S), fill=rgba('#252d5a',230), width=(5 if i==2 else 4)*S)
        d.line(((x1+1)*S,y1*S,(x2+1)*S,(y2-3)*S), fill=rgba('#8c95ef',110), width=S)
    glow(img, layer, 3, .35); img.alpha_composite(layer); return finish(img)


def player_face_crest() -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    pts=[(64,39),(69,48),(64,57),(59,48)]
    d.polygon([(x*S,y*S) for x,y in pts], fill=rgba('#8f7cff',205), outline=rgba('#f5dda4',245))
    d.line((64*S,39*S,64*S,57*S), fill=rgba('#ffffff',170), width=S)
    glow(img, layer, 7, .8); img.alpha_composite(layer); return finish(img)


def player_shoulders() -> Image.Image:
    img=frame_canvas()
    for side in (-1,1):
        sx=64+side*23
        pts=[(sx-side*2,57),(sx+side*20,62),(sx+side*16,79),(sx+side*3,74),(sx-side*6,63)]
        layer=draw_polygon_layer(pts, rgba('#39436f',205), rgba('#f0d69a',230),2)
        glow(img,layer,5,.38); img.alpha_composite(layer)
        d=ImageDraw.Draw(img); d.line((sx*S,60*S,(sx+side*12)*S,72*S),fill=rgba('#7c6cff',170),width=S)
    return finish(img)


def player_chest() -> Image.Image:
    img=frame_canvas(); layer=draw_polygon_layer([(49,61),(64,54),(79,61),(75,93),(64,101),(53,93)],rgba('#30395e',220),rgba('#e9d49b',235),2)
    d=ImageDraw.Draw(layer)
    d.line((50*S,69*S,64*S,82*S,78*S,69*S),fill=rgba('#776cff',205),width=2*S)
    d.line((64*S,57*S,64*S,98*S),fill=rgba('#ffffff',100),width=S)
    glow(img,layer,5,.42); img.alpha_composite(layer); return finish(img)


def player_cape_fabric() -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    pts=[(44,54),(53,50),(64,58),(75,50),(84,54),(90,116),(65,124),(38,116)]
    d.polygon([(x*S,y*S) for x,y in pts],fill=rgba('#29305f',185))
    for i in range(5):
        x=45+i*9
        d.line((x*S,58*S,(x-4+(i%2)*5)*S,116*S),fill=rgba('#7068cc',70),width=2*S)
    glow(img,layer,5,.25); img.alpha_composite(layer); return finish(img)


def player_cape_edge() -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    d.line((44*S,54*S,38*S,116*S,65*S,124*S,90*S,116*S,84*S,54*S),fill=rgba('#e7d39b',230),width=2*S,joint='curve')
    d.line((65*S,124*S,65*S,70*S),fill=rgba('#7cf7e2',150),width=S)
    glow(img,layer,6,.55); img.alpha_composite(layer); return finish(img)


def player_rune_core() -> Image.Image:
    img=frame_canvas(); r=radial_rune(64,77,18,'#83f5df',spokes=6); glow(img,r,9,.85); img.alpha_composite(r); return finish(img)


def weapon(kind: str) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    if kind=='blade':
        pts=[(33,79),(88,48),(101,48),(91,60),(39,88)]
        d.polygon([(x*S,y*S) for x,y in pts],fill=rgba('#dbe6f3',210),outline=rgba('#78f0df',230))
        d.line((38*S,85*S,92*S,53*S),fill=rgba('#ffffff',180),width=S)
        d.line((27*S,83*S,42*S,91*S),fill=rgba('#f0d79c',235),width=4*S)
    elif kind=='greatblade':
        pts=[(24,87),(76,45),(104,43),(92,67),(42,99)]
        d.polygon([(x*S,y*S) for x,y in pts],fill=rgba('#7980b8',220),outline=rgba('#f0d79c',235))
        d.line((31*S,91*S,91*S,50*S),fill=rgba('#ffffff',160),width=2*S)
        d.line((22*S,80*S,44*S,99*S),fill=rgba('#8d77ff',220),width=5*S)
    else:
        d.line((18*S,92*S,98*S,42*S),fill=rgba('#b9c7dc',235),width=4*S)
        pts=[(91,37),(112,31),(104,52),(93,58)]
        d.polygon([(x*S,y*S) for x,y in pts],fill=rgba('#7f75ff',220),outline=rgba('#9affec',240))
        d.ellipse((17*S,86*S,29*S,98*S),fill=rgba('#f0d79c',220))
    glow(img,layer,7,.65); img.alpha_composite(layer); return finish(img)


def player_impact() -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    for i in range(9):
        a=-0.85+i*0.18; r1=26; r2=62+(i%3)*8
        d.line(((64+math.cos(a)*r1)*S,(70+math.sin(a)*r1)*S,(64+math.cos(a)*r2)*S,(70+math.sin(a)*r2)*S),fill=rgba('#8ff9ea' if i%2==0 else '#ae8cff',160),width=(2+(i%2))*S)
    glow(img,layer,9,.8); img.alpha_composite(layer); return finish(img)


def player_aura(mode: str) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    color={'back':'#665bd7','front':'#83f5df','overdrive':'#f4d68e','guard':'#95aaff'}[mode]
    for i in range(3):
        r=25+i*10
        d.ellipse(((64-r)*S,(72-r)*S,(64+r)*S,(72+r)*S),outline=rgba(color,130-i*25),width=(3-i)*S)
    if mode=='overdrive':
        for i in range(12):
            a=math.tau*i/12; d.line(((64+math.cos(a)*35)*S,(72+math.sin(a)*35)*S,(64+math.cos(a)*59)*S,(72+math.sin(a)*59)*S),fill=rgba(color,150),width=2*S)
    if mode=='guard':
        d.polygon([(64*S,25*S),(106*S,54*S),(91*S,112*S),(37*S,112*S),(22*S,54*S)],outline=rgba(color,170),width=2*S)
    glow(img,layer,10,.8); img.alpha_composite(layer); return finish(img)


def monster_crest(color: str, accent: str, count: int) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    for i in range(count):
        t=0 if count==1 else i/(count-1); x=35+t*58; height=22+(1-abs(t-.5)*2)*24
        pts=[(x-7,58),(x,58-height),(x+7,58),(x,67)]
        d.polygon([(a*S,b*S) for a,b in pts],fill=rgba(color,210),outline=rgba(accent,235))
    d.arc((31*S,44*S,97*S,92*S),185,355,fill=rgba('#f0d59a',180),width=2*S)
    glow(img,layer,8,.65); img.alpha_composite(layer); return finish(img)


def monster_core(color: str, accent: str, spokes: int) -> Image.Image:
    img=frame_canvas(); r=radial_rune(64,70,25,color,accent,spokes=spokes,inner=.42); glow(img,r,12,.95); img.alpha_composite(r); return finish(img)


def monster_claw(color: str, accent: str) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    for side in (-1,1):
        base=64+side*10
        for i in range(3):
            pts=[(base+side*i*7,77+i*3),(base+side*(19+i*8),94+i*4),(base+side*(12+i*6),78+i*2)]
            d.polygon([(x*S,y*S) for x,y in pts],fill=rgba(color,205),outline=rgba(accent,230))
    glow(img,layer,7,.6); img.alpha_composite(layer); return finish(img)


def monster_mane(color: str, accent: str) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    for side in (-1,1):
        for i in range(5):
            y=48+i*10; x=64+side*(25+i*5)
            pts=[(64+side*12,y),(x,y-12),(64+side*22,y+8)]
            d.polygon([(a*S,b*S) for a,b in pts],fill=rgba(color,150),outline=rgba(accent,210))
    glow(img,layer,8,.6); img.alpha_composite(layer); return finish(img)


def monster_tail(color: str, accent: str) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    d.arc((10*S,52*S,118*S,130*S),160,338,fill=rgba(color,200),width=8*S)
    d.arc((14*S,56*S,115*S,126*S),160,338,fill=rgba(accent,165),width=2*S)
    glow(img,layer,7,.48); img.alpha_composite(layer); return finish(img)


def monster_aura(color: str, overdrive: bool=False) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    for i in range(4):
        r=30+i*9
        d.ellipse(((64-r)*S,(70-r)*S,(64+r)*S,(70+r)*S),outline=rgba(color,130-i*20),width=2*S)
    spikes=14 if overdrive else 8
    for i in range(spikes):
        a=math.tau*i/spikes; inner=40; outer=58+(i%2)*8
        d.line(((64+math.cos(a)*inner)*S,(70+math.sin(a)*inner)*S,(64+math.cos(a)*outer)*S,(70+math.sin(a)*outer)*S),fill=rgba(color,155),width=2*S)
    glow(img,layer,11,.85); img.alpha_composite(layer); return finish(img)


def core_fx(kind: str, phase: int = 0) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    cx,cy=64,64
    if kind=='shielded':
        r=29; d.ellipse(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S),outline=rgba('#f0d69b',220),width=3*S); d.ellipse(((cx-22)*S,(cy-22)*S,(cx+22)*S,(cy+22)*S),outline=rgba('#8ef7e3',190),width=2*S)
    elif kind=='fractured':
        r=24; d.ellipse(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S),outline=rgba('#a884ff',225),width=3*S)
        for a in [-2.4,-1.5,-.5,.4,1.4,2.5]:
            d.line((cx*S,cy*S,(cx+math.cos(a)*36)*S,(cy+math.sin(a)*36)*S),fill=rgba('#ffffff',190),width=2*S)
    elif kind=='shatter':
        p=phase/3; r=18+28*p
        for i in range(8):
            a=math.tau*i/8+phase*.1; x=cx+math.cos(a)*r; y=cy+math.sin(a)*r
            pts=[(x,y),(x+math.cos(a+.7)*8,y+math.sin(a+.7)*8),(x+math.cos(a-.5)*6,y+math.sin(a-.5)*6)]
            d.polygon([(u*S,v*S) for u,v in pts],fill=rgba('#9b7cff',210-int(p*90)),outline=rgba('#ffffff',160))
    elif kind=='reform':
        p=(phase+1)/4; r=42-20*p
        for i in range(8):
            a=math.tau*i/8-phase*.12; x=cx+math.cos(a)*r; y=cy+math.sin(a)*r
            d.line((x*S,y*S,cx*S,cy*S),fill=rgba('#84f6df',130),width=2*S)
        d.ellipse(((cx-16*p)*S,(cy-16*p)*S,(cx+16*p)*S,(cy+16*p)*S),fill=rgba('#8f76ff',int(120+100*p)),outline=rgba('#f0d69b',200))
    else:
        for i in range(12):
            a=math.tau*i/12+phase*.08; inner=21; outer=50+(i%2)*8
            d.line(((cx+math.cos(a)*inner)*S,(cy+math.sin(a)*inner)*S,(cx+math.cos(a)*outer)*S,(cy+math.sin(a)*outer)*S),fill=rgba('#ffd87f' if i%2 else '#b57cff',210),width=3*S)
        d.ellipse(((cx-19)*S,(cy-19)*S,(cx+19)*S,(cy+19)*S),fill=rgba('#b784ff',190),outline=rgba('#fff0bd',245),width=2*S)
    glow(img,layer,12,.95); img.alpha_composite(layer); return finish(img)


def ui_icon(kind: str) -> Image.Image:
    img=frame_canvas(); layer=frame_canvas(); d=ImageDraw.Draw(layer)
    palette={
        'common':('#8ea4ae','#d8e5e8'),'rare':('#49c5ff','#b8ecff'),'epic':('#9b63ff','#e0c5ff'),'legendary':('#f1bd54','#fff0b4'),
        'slash':('#75f1de','#ffffff'),'charge':('#8c7cff','#d9d0ff'),'burst':('#e16bff','#ffd8ff'),'summon':('#6ed9b5','#d6fff1'),'corebreak':('#ff9368','#ffe0bb'),
        'skill_attack':('#76f0df','#eafffb'),'skill_crash':('#9f7cff','#eee9ff'),'skill_nova':('#e78bff','#fff0ff'),
        'weapon':('#90f1df','#f3d79a'),'armor':('#8ca5e8','#f3d79a'),'accessory':('#cf8cff','#f3d79a'),'phase':('#ffbd70','#ffffff'),
    }
    base,accent=palette[kind]
    d.rounded_rectangle((12*S,12*S,116*S,116*S),radius=22*S,fill=rgba('#10182c',225),outline=rgba(accent,210),width=3*S)
    d.rounded_rectangle((19*S,19*S,109*S,109*S),radius=16*S,outline=rgba(base,160),width=2*S)
    if kind in {'common','rare','epic','legendary'}:
        count={'common':1,'rare':2,'epic':3,'legendary':4}[kind]
        for i in range(count):
            a=math.tau*i/max(1,count)-math.pi/2; x=64+math.cos(a)*20; y=64+math.sin(a)*20
            pts=[(x,y-14),(x+11,y),(x,y+14),(x-11,y)]
            d.polygon([(u*S,v*S) for u,v in pts],fill=rgba(base,190),outline=rgba(accent,230))
    elif kind=='slash':
        for off in (-12,0,12): d.arc(((22+off)*S,18*S,(110+off)*S,106*S),205,330,fill=rgba(base,230),width=5*S)
    elif kind=='charge':
        d.polygon([(25*S,64*S),(75*S,30*S),(110*S,64*S),(75*S,98*S)],fill=rgba(base,175),outline=rgba(accent,235))
        d.line((25*S,64*S,110*S,64*S),fill=rgba('#ffffff',200),width=3*S)
    elif kind=='burst':
        for i in range(12):
            a=math.tau*i/12; d.line((64*S,64*S,(64+math.cos(a)*43)*S,(64+math.sin(a)*43)*S),fill=rgba(base if i%2==0 else accent,215),width=3*S)
    elif kind=='summon':
        r=31; d.ellipse(((64-r)*S,(64-r)*S,(64+r)*S,(64+r)*S),outline=rgba(base,230),width=4*S)
        for i in range(6):
            a=math.tau*i/6; d.line((64*S,64*S,(64+math.cos(a)*r)*S,(64+math.sin(a)*r)*S),fill=rgba(accent,190),width=2*S)
    elif kind=='corebreak':
        d.ellipse((38*S,38*S,90*S,90*S),fill=rgba(base,150),outline=rgba(accent,240),width=3*S)
        for a in [-2.5,-1.2,-.2,.9,2.1]: d.line((64*S,64*S,(64+math.cos(a)*43)*S,(64+math.sin(a)*43)*S),fill=rgba('#ffffff',215),width=3*S)
    elif kind.startswith('skill_'):
        shape=kind.split('_')[1]
        if shape=='attack':
            d.polygon([(30*S,88*S),(91*S,32*S),(103*S,38*S),(42*S,96*S)],fill=rgba(base,205),outline=rgba(accent,235))
        elif shape=='crash':
            d.polygon([(64*S,24*S),(98*S,62*S),(78*S,104*S),(50*S,82*S),(29*S,62*S)],fill=rgba(base,175),outline=rgba(accent,235))
        else:
            for i in range(10):
                a=math.tau*i/10; d.line((64*S,64*S,(64+math.cos(a)*45)*S,(64+math.sin(a)*45)*S),fill=rgba(base if i%2 else accent,220),width=4*S)
    elif kind=='weapon':
        d.line((32*S,91*S,96*S,35*S),fill=rgba(base,230),width=8*S); d.line((28*S,82*S,45*S,99*S),fill=rgba(accent,230),width=5*S)
    elif kind=='armor':
        d.polygon([(64*S,29*S),(96*S,44*S),(89*S,94*S),(64*S,108*S),(39*S,94*S),(32*S,44*S)],fill=rgba(base,180),outline=rgba(accent,230))
    elif kind=='accessory':
        d.ellipse((35*S,35*S,93*S,93*S),outline=rgba(base,230),width=6*S); d.polygon([(64*S,41*S),(82*S,64*S),(64*S,87*S),(46*S,64*S)],fill=rgba(accent,190))
    elif kind=='phase':
        for i in range(3): d.arc(((24+i*10)*S,(24+i*10)*S,(104-i*10)*S,(104-i*10)*S),20+i*35,300+i*20,fill=rgba(base if i%2==0 else accent,220),width=4*S)
    glow(img,layer,8,.55); img.alpha_composite(layer); return finish(img)


def write_atlas(group: str, name: str, frames: list[tuple[str, Image.Image]], cols: int, animations: dict[str, list[str]] | None = None) -> tuple[Path, Path]:
    rows=math.ceil(len(frames)/cols)
    atlas=Image.new('RGBA',(cols*FRAME,rows*FRAME),(0,0,0,0))
    data_frames={}
    for idx,(key,img) in enumerate(frames):
        x=(idx%cols)*FRAME; y=(idx//cols)*FRAME; atlas.alpha_composite(img,(x,y))
        data_frames[key]={
            'frame':{'x':x,'y':y,'w':FRAME,'h':FRAME},'rotated':False,'trimmed':False,
            'spriteSourceSize':{'x':0,'y':0,'w':FRAME,'h':FRAME},'sourceSize':{'w':FRAME,'h':FRAME},'anchor':{'x':0.5,'y':0.5},
        }
    out_dir=OUT/group; out_dir.mkdir(parents=True,exist_ok=True)
    image_path=out_dir/f'{name}.webp'; json_path=out_dir/f'{name}.json'
    atlas.save(image_path,'WEBP',lossless=True,method=6)
    anim=animations or {key:[key] for key,_ in frames}
    payload={'frames':data_frames,'animations':anim,'meta':{
        'app':'LUMERIFT premium parts v16 raster pipeline','version':'1.11.32','image':image_path.name,'format':'RGBA8888',
        'size':{'w':atlas.width,'h':atlas.height},'scale':'1','source':'Premium Art Direction v2; purpose-built transparent runtime overlays',
        'usage':'runtime overlay / UI; existing v10/v11/v4 body Atlases remain fallback',
    }}
    json_path.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return image_path,json_path


def main() -> None:
    player=[
        ('premium.parts.player.hair.back',player_hair_back()),('premium.parts.player.hair.front',player_hair_front()),
        ('premium.parts.player.face.crest',player_face_crest()),('premium.parts.player.armor.shoulders',player_shoulders()),
        ('premium.parts.player.armor.chest',player_chest()),('premium.parts.player.cape.fabric',player_cape_fabric()),
        ('premium.parts.player.cape.edge',player_cape_edge()),('premium.parts.player.rune.core',player_rune_core()),
        ('premium.parts.player.weapon.blade',weapon('blade')),('premium.parts.player.weapon.greatblade',weapon('greatblade')),
        ('premium.parts.player.weapon.riftlance',weapon('riftlance')),('premium.parts.player.weapon.impact',player_impact()),
        ('premium.parts.player.aura.back',player_aura('back')),('premium.parts.player.aura.front',player_aura('front')),
        ('premium.parts.player.aura.overdrive',player_aura('overdrive')),('premium.parts.player.guard',player_aura('guard')),
    ]
    monster=[
        ('premium.parts.monster.void.crest',monster_crest('#6f50d8','#b89cff',5)),('premium.parts.monster.void.core',monster_core('#73f7e1','#f0d59a',6)),('premium.parts.monster.void.claw',monster_claw('#6f50d8','#a9fbec')),
        ('premium.parts.monster.frost.crest',monster_crest('#54b8e9','#d6f7ff',4)),('premium.parts.monster.frost.core',monster_core('#65e6ff','#ffffff',8)),('premium.parts.monster.frost.claw',monster_claw('#4caee2','#d6f7ff')),
        ('premium.parts.monster.inferno.crest',monster_crest('#dc5f42','#ffd89a',5)),('premium.parts.monster.inferno.core',monster_core('#ff8a5e','#ffe3a5',7)),('premium.parts.monster.inferno.claw',monster_claw('#d85843','#ffd89a')),
        ('premium.parts.monster.boss.crown',monster_crest('#6b3e9b','#f0d59a',7)),('premium.parts.monster.boss.core',monster_core('#c783ff','#f5d58f',10)),('premium.parts.monster.boss.claw',monster_claw('#7243a8','#f0d59a')),
        ('premium.parts.monster.boss.mane',monster_mane('#6a3f9b','#c99aff')),('premium.parts.monster.boss.tail',monster_tail('#5b337f','#c68cff')),
        ('premium.parts.monster.boss.aura',monster_aura('#9d72ff')),('premium.parts.monster.boss.overdrive',monster_aura('#ffd47c',True)),
    ]
    core=[('premium.core.shielded',core_fx('shielded')),('premium.core.fractured',core_fx('fractured'))]
    core += [(f'premium.core.shatter.{i}',core_fx('shatter',i)) for i in range(4)]
    core += [(f'premium.core.reform.{i}',core_fx('reform',i)) for i in range(4)]
    core += [(f'premium.core.overdrive.{i}',core_fx('overdrive',i)) for i in range(2)]
    core_animations={
        'premium.core.shielded':['premium.core.shielded'],
        'premium.core.fractured':['premium.core.fractured'],
        'premium.core.shattered':[f'premium.core.shatter.{i}' for i in range(4)],
        'premium.core.regenerating':[f'premium.core.reform.{i}' for i in range(4)],
        'premium.core.overdrive':[f'premium.core.overdrive.{i}' for i in range(2)],
    }
    ui_kinds=['skill_attack','skill_crash','skill_nova','common','rare','epic','legendary','slash','charge','burst','summon','corebreak','weapon','armor','accessory','phase']
    ui=[(f'premium.ui.v16.{k.replace("_", ".")}',ui_icon(k)) for k in ui_kinds]
    paths=[]
    paths += write_atlas('player','player_parts_v16',player,4)
    paths += write_atlas('monsters','monster_parts_v16',monster,4)
    paths += write_atlas('effects','boss_core_fx_v16',core,4,core_animations)
    paths += write_atlas('ui','premium_ui_icons_v16',ui,4)
    SOURCE.mkdir(parents=True,exist_ok=True)
    for path in paths[::2]:
        target=SOURCE/(path.stem+'_master.webp')
        target.write_bytes(path.read_bytes())
    (SOURCE/'README.md').write_text(
        '# Premium Parts v16 Source Masters\n\n'
        '- 2026-08-03 제작용 투명 WebP 마스터.\n'
        '- Premium Art Direction v2의 팔레트·금속·룬·크리스털 언어를 반영한 런타임 합성 파츠다.\n'
        '- 최종 수작업 본체 프레임 전체 교체가 아니라 기존 Atlas 위에 합성하는 첫 래스터 파츠 배치다.\n'
        '- PNG/WebP 정책 및 모바일 용량 예산을 준수한다.\n',encoding='utf-8')
    for path in paths:
        print(path.relative_to(ROOT), path.stat().st_size)

if __name__=='__main__':
    main()

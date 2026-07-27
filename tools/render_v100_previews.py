from __future__ import annotations
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'public/assets/live/v1'
OUT=ROOT/'docs/previews'
OUT.mkdir(parents=True,exist_ok=True)
FONT='/usr/share/fonts/truetype/nanum/NanumSquareR.ttf'
FONT_B='/usr/share/fonts/truetype/nanum/NanumSquareB.ttf'

def f(size,bold=False): return ImageFont.truetype(FONT_B if bold else FONT,size)

def rr(d,box,r,fill,outline=None,w=1): d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=w)

def panel(d,box,accent=(216,187,106),alpha=235):
    rr(d,box,18,(7,14,22,alpha),accent,2)
    x1,y1,x2,y2=box
    rr(d,(x1+5,y1+5,x2-5,y2-5),14,(14,26,37,165),(72,215,192,85),1)

def button(d,box,label,primary=False):
    color=(18,104,91,245) if primary else (19,32,45,235)
    rr(d,box,14,color,(219,188,101,230),2)
    x1,y1,x2,y2=box
    bbox=d.textbbox((0,0),label,font=f(16,True));tw=bbox[2]-bbox[0];th=bbox[3]-bbox[1]
    d.text(((x1+x2-tw)/2,(y1+y2-th)/2-2),label,font=f(16,True),fill=(242,245,240))

def extract(atlas_path,json_path,name):
    im=Image.open(atlas_path).convert('RGBA'); data=json.loads(Path(json_path).read_text())
    fr=data['frames'][name]['frame']; return im.crop((fr['x'],fr['y'],fr['x']+fr['w'],fr['y']+fr['h']))

def lobby():
    bg=Image.open(ASSETS/'backgrounds/lobby_forest_live_v1.webp').convert('RGBA').resize((540,960),Image.Resampling.LANCZOS)
    ov=Image.new('RGBA',bg.size,(0,0,0,0));d=ImageDraw.Draw(ov)
    panel(d,(16,18,524,128));
    d.text((32,30),'LUMERIFT',font=f(31,True),fill=(241,223,170))
    d.text((33,75),'균열의 계승자 · 루멘 전초기지',font=f(13,True),fill=(174,221,210))
    panel(d,(340,38,506,104));d.text((356,49),'전투력',font=f(11,True),fill=(150,170,170));d.text((355,68),'12,480',font=f(25,True),fill=(255,215,120))
    panel(d,(18,148,336,596));
    portrait=Image.open(ASSETS/'portraits/hero_live_v1.webp').convert('RGBA').resize((294,392),Image.Resampling.LANCZOS)
    ov.alpha_composite(portrait,(30,160))
    panel(d,(32,522,322,582));d.text((115,531),'아리아',font=f(23,True),fill=(255,229,170));d.text((114,560),'Lv.18 · 균열 추적자',font=f(12,True),fill=(191,218,212))
    panel(d,(346,148,522,596));d.text((366,169),'FIELD STATUS',font=f(13,True),fill=(229,213,159))
    rows=[('POWER','12,480',(255,215,120)),('ATTACK','+326',(255,155,123)),('DEFENSE','+214',(130,214,255)),('MAX HP','+1,280',(114,228,189)),('STAGE','7 / 10',(200,180,255)),('QUEST','2 READY',(255,215,120))]
    for i,(lab,val,col) in enumerate(rows):
        y=220+i*51;d.text((366,y),lab,font=f(10,True),fill=(137,160,157));d.text((366,y+17),val,font=f(18,True),fill=col)
    button(d,(20,620,520,684),'균열 작전 개시',True)
    button(d,(20,700,262,754),'장비·인벤토리');button(d,(278,700,520,754),'퀘스트 보상 2',True)
    button(d,(20,770,262,820),'FPS · 자동');button(d,(278,770,520,820),'그래픽 · 고품질')
    button(d,(20,836,520,884),'아트 보관소 · 라이선스 및 교체 현황')
    d.text((87,902),'CHAPTER 1 · 안개숲 균열',font=f(11,True),fill=(145,170,165))
    out=Image.alpha_composite(bg,ov);out.save(OUT/'v1.0.0_lobby_preview.webp','WEBP',quality=92,method=4)

def battle():
    bg=Image.open(ASSETS/'backgrounds/battle_forest_live_v1.webp').convert('RGBA').resize((540,960),Image.Resampling.LANCZOS)
    ov=Image.new('RGBA',bg.size,(0,0,0,0));d=ImageDraw.Draw(ov)
    panel(d,(14,14,526,112));d.text((28,25),'1-7 · 안개숲 균열',font=f(18,True),fill=(240,245,241))
    rr(d,(28,63,248,86),11,(12,20,28,245),(255,255,255,30),1);rr(d,(30,65,213,84),9,(61,218,160,255));d.text((36,66),'HP 1,640 / 1,920',font=f(12,True),fill=(244,248,245))
    d.text((320,28),'WAVE 3 / 3',font=f(14,True),fill=(105,238,207));d.text((330,58),'ENEMY 4',font=f(14,True),fill=(245,245,240));d.text((342,84),'18 COMBO',font=f(13,True),fill=(255,211,111))
    panel(d,(14,120,526,178));
    boss=Image.open(ASSETS/'portraits/boss_harbinger_live_v1.webp').convert('RGBA').resize((46,46),Image.Resampling.LANCZOS);ov.alpha_composite(boss,(24,126))
    d.text((86,130),'심연의 전령 · PHASE 2',font=f(14,True),fill=(245,236,230));rr(d,(86,148,502,161),7,(16,20,29,245));rr(d,(86,148,397,161),7,(228,77,102,255))
    # Actors
    pa=ASSETS/'atlases/player/player_live_v1.webp';pj=ASSETS/'atlases/player/player_live_v1.json'
    ma=ASSETS/'atlases/monsters/monsters_live_v1.webp';mj=ASSETS/'atlases/monsters/monsters_live_v1.json'
    hero=extract(pa,pj,'knight_04').resize((144,144),Image.Resampling.LANCZOS);ov.alpha_composite(hero,(198,520))
    actors=[('monster_crawler_idle_00',(60,400),92),('monster_brute_idle_00',(365,430),118),('monster_warden_idle_00',(90,610),128),('boss_harbinger_idle_00',(335,580),155)]
    for name,(x,y),size in actors:
        sp=extract(ma,mj,name).resize((size,size),Image.Resampling.LANCZOS);ov.alpha_composite(sp,(x,y))
    # VFX / telegraphs
    d.ellipse((300,525,480,655),fill=(210,46,91,25),outline=(255,93,126,180),width=4)
    d.arc((155,510,390,700),210,330,fill=(92,244,211,210),width=7)
    # joystick and action controls
    d.ellipse((22,806,154,938),fill=(9,18,28,150),outline=(86,231,204,130),width=3);d.ellipse((63,847,113,897),fill=(25,117,102,210),outline=(245,236,195,120),width=2)
    for cx,cy,r,label,primary in [(205,835,37,'회피',False),(285,884,41,'노바',False),(374,860,46,'크래시',False),(475,846,58,'공격',True)]:
        fill=(25,111,96,235) if primary else (33,35,69,235);d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=fill,outline=(226,191,102,230),width=3)
        bb=d.textbbox((0,0),label,font=f(14,True));d.text((cx-(bb[2]-bb[0])/2,cy-(bb[3]-bb[1])/2-2),label,font=f(14,True),fill=(248,246,238))
    out=Image.alpha_composite(bg,ov);out.save(OUT/'v1.0.0_battle_preview.webp','WEBP',quality=92,method=4)

if __name__=='__main__':
    lobby();battle();print('PASS rendered v1.0.0 previews')

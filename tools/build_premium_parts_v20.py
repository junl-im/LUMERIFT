from __future__ import annotations

import json
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/live/v20/atlases'
SOURCE = ROOT / 'art_source/lumerift_owned/premium_parts_v20'
FRAME = 96
S = 2
HI = FRAME * S
DIRECTIONS = ['n','ne','e','se','s','sw','w','nw']
WEAPONS = ['blade','greatblade','riftlance']
WEAPON_PHASES = ['anticipation','contact','sustain','recover','follow-through']
MONSTER_VARIANTS = ['void','frost','inferno','boss']
MONSTER_STATES = ['hit','down']
CORE_EVENTS = ['collision','dissolve','reverse-regenerate']
STATUS_KINDS = ['burn','slow','void','shock','bleed','barrier','haste','weaken']
SUPPORT_UI = ['mobile-verify','recovery','audit','cloud','merge','undo','compare','search','pin','export','import','timeline','hash','device','warning','approved']


def rgba(value: str, alpha: int = 255):
    value = value.lstrip('#')
    return tuple(int(value[i:i+2],16) for i in (0,2,4)) + (alpha,)

def canvas(): return Image.new('RGBA',(HI,HI),(0,0,0,0))
def finish(image): return image.resize((FRAME,FRAME),Image.Resampling.LANCZOS)

def glow(base, layer, radius=7, opacity=.72):
    blur=layer.filter(ImageFilter.GaussianBlur(max(1,round(radius*S))))
    if opacity < 1:
        blur.putalpha(blur.getchannel('A').point(lambda p: round(p*opacity)))
    base.alpha_composite(blur)

def dvec(direction):
    idx=DIRECTIONS.index(direction); angle=-math.pi/2+idx*math.pi/4
    return math.cos(angle), math.sin(angle)

WEAPON_COLORS={
    'blade':('#6ff3e0','#dffcff','#7d8cff'),
    'greatblade':('#c08cff','#fff0c8','#7c58b9'),
    'riftlance':('#70b8ff','#e7fbff','#8d6dff'),
}

def weapon_phase_frame(weapon,direction,phase):
    vx,vy=dvec(direction); p=WEAPON_PHASES.index(phase); side=-1 if vx<-.15 else 1
    accent,core,shadow=WEAPON_COLORS[weapon]
    img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer,'RGBA')
    cx=48+vx*4; cy=52+vy*2
    phase_power=[.55,1,.92,.66,.42][p]
    phase_alpha=[190,250,238,210,165][p]
    # compact armored torso and hair mass to make the weapon phase readable in isolation
    d.polygon([((cx-16)*S,(cy-12)*S),(cx*S,(cy-21)*S),((cx+16)*S,(cy-12)*S),((cx+13)*S,(cy+17)*S),(cx*S,(cy+23)*S),((cx-13)*S,(cy+17)*S)],fill=rgba('#29345c',160),outline=rgba('#e1c98f',210))
    for strand in range(5):
        sx=cx+(strand-2)*3; d.line((sx*S,(cy-29)*S,(sx-side*(4+p))*S,(cy-12+p)*S),fill=rgba('#5a67b5',150),width=2*S)
    # weapon-specific silhouette and staged motion
    if weapon=='blade':
        length=40+[0,9,12,5,-2][p]; width=3
        angle=-.55+side*[ -.22,.15,.58,.78,.92][p]
        ex=cx+math.cos(angle)*length*side; ey=cy+math.sin(angle)*length
        d.line((cx*S,cy*S,ex*S,ey*S),fill=rgba(core,phase_alpha),width=width*S)
        d.line((cx*S,cy*S,(ex+side*7)*S,(ey-3)*S),fill=rgba(accent,phase_alpha),width=2*S)
        for echo in range(3):
            r=25+echo*7+p*3
            d.arc(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S),-70+side*p*9,55+side*p*12,fill=rgba(accent,120-echo*20),width=(3-echo//2)*S)
    elif weapon=='greatblade':
        length=48+[0,5,11,7,1][p]; bladew=8+[0,1,3,2,0][p]
        angle=-.85+side*[-.1,.18,.48,.72,.9][p]
        ex=cx+math.cos(angle)*length*side; ey=cy+math.sin(angle)*length
        nx=-math.sin(angle)*bladew; ny=math.cos(angle)*bladew
        d.polygon([(cx*S,cy*S),((ex+nx)*S,(ey+ny)*S),((ex+side*9)*S,ey*S),((ex-nx)*S,(ey-ny)*S)],fill=rgba(shadow,190),outline=rgba(core,phase_alpha),width=2*S)
        d.arc(((cx-42-p*3)*S,(cy-42-p*3)*S,(cx+42+p*3)*S,(cy+42+p*3)*S),-110,35+p*15,fill=rgba(accent,155),width=(5+p//2)*S)
    else:
        length=58+[0,10,18,12,4][p]; angle=-.1+vy*.08
        ex=cx+side*length; ey=cy+vy*7+[5,0,-2,2,5][p]
        d.line((cx*S,cy*S,ex*S,ey*S),fill=rgba(core,phase_alpha),width=4*S)
        d.polygon([((ex-side*4)*S,(ey-8)*S),((ex+side*13)*S,ey*S),((ex-side*4)*S,(ey+8)*S),((ex+side*1)*S,ey*S)],fill=rgba(accent,235),outline=rgba(core,250))
        for echo in range(3):
            y=ey+(echo-1)*7
            d.line(((cx-side*(8+echo*3))*S,y*S,(ex-side*(3+echo*5))*S,y*S),fill=rgba(accent,130-echo*22),width=2*S)
    # phase ring markers for interpolation readability
    ring=13+p*3
    d.ellipse(((cx-ring)*S,(cy-ring)*S,(cx+ring)*S,(cy+ring)*S),outline=rgba(accent,int(phase_alpha*.42)),width=2*S)
    glow(img,layer,8+p*.8,.75*phase_power); img.alpha_composite(layer); return finish(img)

VARIANT_COLORS={
 'void':('#352760','#9b72ff','#6ff3df'), 'frost':('#214f72','#6bcaf5','#e6fbff'),
 'inferno':('#6f3025','#ef714f','#ffd38e'), 'boss':('#392551','#ba7dff','#efd29a')}

def monster_damage_frame(variant,direction,state,index):
    base,accent,core=VARIANT_COLORS[variant]; vx,vy=dvec(direction); side=-1 if vx<-.12 else 1
    boss=variant=='boss'; img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer,'RGBA')
    p=index; cx=48+vx*4; cy=53+(8 if state=='down' else 0)
    squash=(.72 if state=='down' else .92)-(p*.08 if state=='down' else 0)
    alpha=235 if state=='hit' else 205
    # body mass
    rx=(31 if boss else 27)*(1.16 if state=='down' else 1); ry=(23 if boss else 20)*squash
    d.ellipse(((cx-rx)*S,(cy-ry)*S,(cx+rx)*S,(cy+ry)*S),fill=rgba(base,175),outline=rgba(accent,alpha),width=3*S)
    # head and directional jaw
    hx=cx+side*(10+5*p); hy=cy-(18 if state=='hit' else 8)
    d.polygon([((hx-13)*S,(hy+4)*S),(hx*S,(hy-17-p*2)*S),((hx+13)*S,(hy+4)*S),(hx*S,(hy+12)*S)],fill=rgba(base,210),outline=rgba(core,alpha))
    # eight-direction limb layout
    for limb in range(4):
        a=math.tau*limb/4+math.atan2(vy,vx)*.28
        reach=(23+limb%2*5)*(1.25 if state=='down' else 1)
        startx=cx+math.cos(a)*11; starty=cy+math.sin(a)*8
        endx=cx+math.cos(a)*reach; endy=cy+math.sin(a)*reach*(.55 if state=='down' else 1)
        d.line((startx*S,starty*S,endx*S,endy*S),fill=rgba(accent,alpha),width=(6 if boss else 5)*S)
        for claw in range(3):
            d.line((endx*S,endy*S,(endx+math.cos(a+(claw-1)*.24)*10)*S,(endy+math.sin(a+(claw-1)*.24)*10)*S),fill=rgba(core,alpha),width=2*S)
    # hit crack / down dust
    if state=='hit':
        for ray in range(7 if boss else 5):
            a=math.tau*ray/(7 if boss else 5)+p*.25
            d.line(((cx+math.cos(a)*18)*S,(cy+math.sin(a)*15)*S,(cx+math.cos(a)*(35+p*5))*S,(cy+math.sin(a)*(31+p*5))*S),fill=rgba(core,180),width=2*S)
    else:
        for dust in range(7):
            x=cx+(dust-3)*9+side*p*2; r=4+(dust%3)
            d.ellipse(((x-r)*S,(cy+18-r)*S,(x+r)*S,(cy+18+r)*S),fill=rgba(accent,80+dust*10))
    glow(img,layer,7 if boss else 5,.68); img.alpha_composite(layer); return finish(img)

def core_event_frame(event,index,count=8):
    p=index/(count-1); img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer,'RGBA'); cx=cy=48
    color={'collision':'#ffd58f','dissolve':'#b784ff','reverse-regenerate':'#6ff4df'}[event]
    if event=='collision':
        radius=15+p*20
        d.ellipse(((cx-radius)*S,(cy-radius)*S,(cx+radius)*S,(cy+radius)*S),outline=rgba(color,230-int(p*80)),width=4*S)
        for i in range(12):
            a=math.tau*i/12+p*.7; inner=10+p*8; outer=28+p*(24+i%3*4)
            d.line(((cx+math.cos(a)*inner)*S,(cy+math.sin(a)*inner)*S,(cx+math.cos(a)*outer)*S,(cy+math.sin(a)*outer)*S),fill=rgba('#ffffff' if i%3==0 else color,220-int(p*90)),width=(2+i%3)*S)
    elif event=='dissolve':
        for i in range(18):
            a=math.tau*i/18+i*.09; radius=11+p*(31+(i%4)*3)
            size=max(1,5-int(p*4)+(i%2))
            x=cx+math.cos(a)*radius; y=cy+math.sin(a)*radius
            d.polygon([((x-size)*S,y*S),(x*S,(y-size*1.5)*S),((x+size)*S,y*S),(x*S,(y+size*1.5)*S)],fill=rgba(color,220-int(p*150)))
    else:
        radius=45-p*29
        for i in range(14):
            a=math.tau*i/14-p*.85; x=cx+math.cos(a)*radius; y=cy+math.sin(a)*radius
            d.line((x*S,y*S,(cx+math.cos(a)*12)*S,(cy+math.sin(a)*12)*S),fill=rgba(color,110+int(p*120)),width=(2+i%3)*S)
        r=7+p*10; d.ellipse(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S),fill=rgba('#6d55b8',80+int(p*100)),outline=rgba(color,220))
    glow(img,layer,9,.8); img.alpha_composite(layer); return finish(img)

STATUS_COLORS={'burn':'#ff8056','slow':'#72d8ff','void':'#a879ff','shock':'#ffe580','bleed':'#ff5d7b','barrier':'#7ff5df','haste':'#f7d98f','weaken':'#9e8bb8'}
def status_frame(kind,index):
    p=index/3; img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer,'RGBA'); cx=cy=48; color=STATUS_COLORS[kind]
    if kind in {'burn','shock','bleed'}:
        for i in range(8):
            a=math.tau*i/8+p*.6; inner=10+i%3*2; outer=28+p*15+i%2*5
            d.line(((cx+math.cos(a)*inner)*S,(cy+math.sin(a)*inner)*S,(cx+math.cos(a)*outer)*S,(cy+math.sin(a)*outer)*S),fill=rgba(color,210-i*10),width=(2+i%3)*S)
    elif kind in {'slow','void','weaken'}:
        for ring in range(3):
            r=12+ring*9+p*5; d.arc(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S),20+ring*30+p*50,300+ring*20+p*70,fill=rgba(color,220-ring*45),width=(4-ring)*S)
    else:
        points=8 if kind=='barrier' else 6
        for i in range(points):
            a=math.tau*i/points+p*.4; r=25+math.sin(p*math.tau+i)*3
            x=cx+math.cos(a)*r; y=cy+math.sin(a)*r
            d.polygon([((x-4)*S,y*S),(x*S,(y-7)*S),((x+4)*S,y*S),(x*S,(y+7)*S)],fill=rgba(color,190),outline=rgba('#ffffff',150))
    d.ellipse(((cx-11)*S,(cy-11)*S,(cx+11)*S,(cy+11)*S),outline=rgba(color,210),width=3*S)
    glow(img,layer,8,.78); img.alpha_composite(layer); return finish(img)

def ui_frame(kind,index):
    img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer,'RGBA'); cx=cy=48
    gold='#e5c788'; cyan='#6ff3df'; violet='#9b78ff'
    color=cyan if kind in {'mobile-verify','hash','device','approved','cloud'} else violet if kind in {'recovery','audit','merge','undo','compare','timeline'} else gold
    d.rounded_rectangle((15*S,15*S,81*S,81*S),radius=14*S,fill=rgba('#111a2d',225),outline=rgba(gold,210),width=2*S)
    d.polygon([(48*S,20*S),(75*S,48*S),(48*S,76*S),(21*S,48*S)],outline=rgba(color,190))
    if kind in {'mobile-verify','device'}:
        d.rounded_rectangle((34*S,25*S,62*S,70*S),radius=5*S,outline=rgba(color,240),width=3*S); d.line((42*S,62*S,48*S,67*S,58*S,55*S),fill=rgba('#ffffff',230),width=3*S)
    elif kind in {'recovery','undo','timeline'}:
        d.arc((27*S,27*S,69*S,69*S),40,325,fill=rgba(color,240),width=4*S); d.polygon([(27*S,29*S),(39*S,28*S),(31*S,39*S)],fill=rgba(color,230))
    elif kind in {'audit','hash'}:
        for row in range(3): d.line((32*S,(35+row*11)*S,62*S,(35+row*11)*S),fill=rgba(color,220),width=3*S)
        d.ellipse((25*S,30*S,31*S,36*S),fill=rgba('#ffffff',220)); d.ellipse((25*S,41*S,31*S,47*S),fill=rgba('#ffffff',220)); d.ellipse((25*S,52*S,31*S,58*S),fill=rgba('#ffffff',220))
    elif kind in {'cloud','export','import'}:
        d.ellipse((28*S,38*S,65*S,61*S),fill=rgba(color,110),outline=rgba(color,240),width=3*S); d.line((48*S,56*S,48*S,34*S),fill=rgba('#ffffff',230),width=3*S); d.polygon([(41*S,41*S),(48*S,32*S),(55*S,41*S)],fill=rgba('#ffffff',230))
    elif kind in {'merge','compare'}:
        d.line((29*S,33*S,65*S,63*S),fill=rgba(color,230),width=4*S); d.line((65*S,33*S,29*S,63*S),fill=rgba('#ffffff',190),width=3*S)
    elif kind in {'search'}:
        d.ellipse((28*S,28*S,55*S,55*S),outline=rgba(color,240),width=4*S); d.line((53*S,53*S,67*S,67*S),fill=rgba(color,240),width=5*S)
    elif kind in {'pin'}:
        d.polygon([(48*S,27*S),(61*S,42*S),(53*S,47*S),(55*S,65*S),(48*S,58*S),(41*S,65*S),(43*S,47*S),(35*S,42*S)],fill=rgba(color,210),outline=rgba('#ffffff',180))
    elif kind in {'warning'}:
        d.polygon([(48*S,25*S),(69*S,66*S),(27*S,66*S)],fill=rgba('#ffb45f',150),outline=rgba('#ffffff',210)); d.line((48*S,38*S,48*S,54*S),fill=rgba('#ffffff',230),width=4*S); d.ellipse((46*S,59*S,50*S,63*S),fill=rgba('#ffffff',230))
    else:
        d.line((32*S,49*S,43*S,60*S,66*S,35*S),fill=rgba(color,245),width=5*S)
    glow(img,layer,6,.55); img.alpha_composite(layer); return finish(img)

def write_atlas(group,name,frames,cols,animations):
    rows=math.ceil(len(frames)/cols); atlas=Image.new('RGBA',(cols*FRAME,rows*FRAME),(0,0,0,0)); data={}
    for idx,(key,image) in enumerate(frames):
        x=(idx%cols)*FRAME; y=(idx//cols)*FRAME; atlas.alpha_composite(image,(x,y))
        data[key]={'frame':{'x':x,'y':y,'w':FRAME,'h':FRAME},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':FRAME,'h':FRAME},'sourceSize':{'w':FRAME,'h':FRAME},'anchor':{'x':.5,'y':.5}}
    out=OUT/group; out.mkdir(parents=True,exist_ok=True); image_path=out/f'{name}.webp'; json_path=out/f'{name}.json'
    atlas.save(image_path,'WEBP',lossless=False,quality=76,method=4)
    payload={'frames':data,'animations':animations,'meta':{'app':'LUMERIFT premium runtime v20','version':'1.11.36','image':image_path.name,'format':'RGBA8888','size':{'w':atlas.width,'h':atlas.height},'scale':'1','source':'Premium Art Direction v2; optimized supersampled procedural raster overlays','usage':'runtime overlay; v19 and established body Atlases remain fallback'}}
    json_path.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); return image_path,json_path

def write_contract(path,payload):
    path.parent.mkdir(parents=True,exist_ok=True); path.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def main():
    player=[]; player_anims={}
    for weapon in WEAPONS:
        for direction in DIRECTIONS:
            keys=[]
            for phase in WEAPON_PHASES:
                key=f'premium.weapon.v20.player.{weapon}.{direction}.{phase}'; player.append((key,weapon_phase_frame(weapon,direction,phase))); keys.append(key)
            player_anims[f'premium.weapon.v20.player.{weapon}.{direction}']=keys
    monster=[]; monster_anims={}
    for variant in MONSTER_VARIANTS:
        for direction in DIRECTIONS:
            for state in MONSTER_STATES:
                keys=[]
                for index in range(2):
                    key=f'premium.damage.v20.monster.{variant}.{direction}.{state}.{index}'; monster.append((key,monster_damage_frame(variant,direction,state,index))); keys.append(key)
                monster_anims[f'premium.damage.v20.monster.{variant}.{direction}.{state}']=keys
    core=[]; core_anims={}
    for event in CORE_EVENTS:
        keys=[]
        for index in range(8):
            key=f'premium.core.v20.{event}.{index}'; core.append((key,core_event_frame(event,index))); keys.append(key)
        core_anims[f'premium.core.v20.{event}']=keys
    status=[]; status_anims={}
    for kind in STATUS_KINDS:
        keys=[]
        for index in range(4):
            key=f'premium.status.v20.{kind}.{index}'; status.append((key,status_frame(kind,index))); keys.append(key)
        status_anims[f'premium.status.v20.{kind}']=keys
    ui=[]; ui_anims={}
    for index,kind in enumerate(SUPPORT_UI):
        key=f'premium.ui.v20.{kind}'; ui.append((key,ui_frame(kind,index))); ui_anims[key]=[key]
    paths=[]
    paths += list(write_atlas('player','player_weapon_phases_v20',player,8,player_anims))
    paths += list(write_atlas('monsters','monster_damage_parts_v20',monster,8,monster_anims))
    paths += list(write_atlas('effects','boss_core_events_v20',core,8,core_anims))
    paths += list(write_atlas('effects','status_vfx_v20',status,8,status_anims))
    paths += list(write_atlas('ui','premium_support_ui_v20',ui,8,ui_anims))
    prod=ROOT/'public/assets/live/v20/production'
    write_contract(prod/'PLAYER_WEAPON_PHASES_V20.json',{'schema':'lumerift-player-weapon-phases-v20','version':'1.11.36','weapons':WEAPONS,'directions':8,'phases':WEAPON_PHASES,'frames':len(player),'animations':len(player_anims),'attackFootprintChanged':False,'finalFullBodyHandPaintedAtlasComplete':False,'fallback':['v19','v18','v17','v16','established-body']})
    write_contract(prod/'MONSTER_DAMAGE_PARTS_V20.json',{'schema':'lumerift-monster-damage-parts-v20','version':'1.11.36','variants':MONSTER_VARIANTS,'directions':8,'states':MONSTER_STATES,'frames':len(monster),'animations':len(monster_anims),'gameplayTimingChanged':False,'finalFullBodyHandPaintedAtlasComplete':False,'fallback':['v19','v18','v17','v16','established-body']})
    write_contract(prod/'BOSS_CORE_EVENTS_V20.json',{'schema':'lumerift-boss-core-events-v20','version':'1.11.36','events':CORE_EVENTS,'frames':len(core),'animations':len(core_anims),'attackFootprintChanged':False,'reverseRegeneration':True,'fallback':['v19','v18','v17','v16']})
    write_contract(prod/'STATUS_VFX_V20.json',{'schema':'lumerift-status-vfx-v20','version':'1.11.36','effects':STATUS_KINDS,'frames':len(status),'animations':len(status_anims),'gameplayDataChanged':False,'adaptiveBudgetPreserved':True,'fallback':['v19','v4']})
    write_contract(prod/'PREMIUM_SUPPORT_UI_V20.json',{'schema':'lumerift-premium-support-ui-v20','version':'1.11.36','icons':SUPPORT_UI,'frames':len(ui),'animations':len(ui_anims),'screens':['mobile-calibration','appearance-recovery','appearance-audit','cloud-conflict'],'initialBundleRequired':False,'fallback':['v18','v17','v16']})
    SOURCE.mkdir(parents=True,exist_ok=True)
    for path in paths[::2]: (SOURCE/(path.stem+'_master.webp')).write_bytes(path.read_bytes())
    (SOURCE/'README.md').write_text('# Premium Runtime v20 Source Masters\n\n- Weapon-specific five-phase player overlays.\n- Eight-direction monster hit/down overlays.\n- Boss core collision, dissolve, reverse-regenerate loops.\n- Status VFX and support UI icon Atlases.\n- v19 and established body Atlases remain fallback.\n- Final hand-painted full-body Atlas is still pending.\n',encoding='utf-8')
    for p in paths: print(p.relative_to(ROOT),p.stat().st_size)

if __name__=='__main__': main()

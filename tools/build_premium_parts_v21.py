from __future__ import annotations

import json
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/live/v21/atlases'
SOURCE = ROOT / 'art_source/lumerift_owned/premium_parts_v21'
FRAME = 96
S = 2
HI = FRAME * S
DIRECTIONS = ['n','ne','e','se','s','sw','w','nw']
WEAPONS = ['blade','greatblade','riftlance']
MONSTER_VARIANTS = ['void','frost','inferno','boss']
RECOVERY_STATES = ['stagger','rise','recover']
STATUS_KINDS = ['burn','slow','void','shock','bleed','barrier','haste','weaken']
STATUS_EVENTS = ['stack','cleanse','immune']
SUPPORT_UI = ['stack','cleanse','immune','status-hud','interpolate','combo','stagger','rise','recover','evidence','capture','audit-filter','timeline','diff','restore','verified']


def rgba(value: str, alpha: int = 255):
    value = value.lstrip('#')
    return tuple(int(value[i:i+2],16) for i in (0,2,4)) + (alpha,)

def canvas():
    return Image.new('RGBA',(HI,HI),(0,0,0,0))

def finish(image):
    return image.resize((FRAME,FRAME),Image.Resampling.LANCZOS)

def glow(base, layer, radius=7, opacity=.72):
    blur = layer.filter(ImageFilter.GaussianBlur(max(1, round(radius*S))))
    if opacity < 1:
        blur.putalpha(blur.getchannel('A').point(lambda p: round(p*opacity)))
    base.alpha_composite(blur)

def dvec(direction):
    idx = DIRECTIONS.index(direction)
    angle = -math.pi/2 + idx*math.pi/4
    return math.cos(angle), math.sin(angle)

WEAPON_COLORS = {
    'blade':('#70f4df','#eefeff','#7387ff'),
    'greatblade':('#c595ff','#fff0c8','#744aa4'),
    'riftlance':('#78c7ff','#eaffff','#8a6cff'),
}


def interpolation_frame(weapon, direction, index):
    vx, vy = dvec(direction)
    p = index / 7
    side = -1 if vx < -.12 else 1
    accent, core, shadow = WEAPON_COLORS[weapon]
    img = canvas(); layer = canvas(); d = ImageDraw.Draw(layer,'RGBA')
    cx = 48 + vx*4; cy = 52 + vy*2
    # body anchor with layered shoulders and cape sweep
    d.polygon([((cx-15)*S,(cy-12)*S),(cx*S,(cy-23)*S),((cx+15)*S,(cy-12)*S),((cx+13)*S,(cy+18)*S),(cx*S,(cy+23)*S),((cx-13)*S,(cy+18)*S)], fill=rgba('#27335a',175), outline=rgba('#e7d09b',220))
    cape_swing = math.sin(p*math.pi)*8*side
    d.polygon([((cx-8)*S,(cy+6)*S),((cx-24-cape_swing)*S,(cy+32)*S),((cx+2-cape_swing*.25)*S,(cy+26)*S)], fill=rgba('#342f67',140), outline=rgba(accent,145))
    for strand in range(5):
        sx = cx + (strand-2)*3
        d.line((sx*S,(cy-28)*S,(sx-side*(3+round(p*5)))*S,(cy-12+round(p*3))*S), fill=rgba('#6571bb',150), width=2*S)
    # continuous interpolation arc
    easing = .5 - .5*math.cos(p*math.pi)
    if weapon == 'blade':
        angle = -1.05 + side*(1.92*easing)
        length = 43 + math.sin(p*math.pi)*11
        ex = cx + math.cos(angle)*length*side; ey = cy + math.sin(angle)*length
        d.line((cx*S,cy*S,ex*S,ey*S), fill=rgba(core,245), width=3*S)
        d.line(((cx+side*2)*S,(cy-2)*S,(ex+side*7)*S,(ey-3)*S), fill=rgba(accent,220), width=2*S)
        for echo in range(4):
            r = 24 + echo*7 + math.sin(p*math.pi)*8
            start = -115 + p*95 - echo*3
            end = start + 85 + p*55
            d.arc(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S), start, end, fill=rgba(accent,145-echo*22), width=(4-echo//2)*S)
    elif weapon == 'greatblade':
        angle = -1.22 + side*(1.6*easing)
        length = 49 + math.sin(p*math.pi)*10
        blade_w = 8 + math.sin(p*math.pi)*5
        ex = cx + math.cos(angle)*length*side; ey = cy + math.sin(angle)*length
        nx = -math.sin(angle)*blade_w; ny = math.cos(angle)*blade_w
        d.polygon([(cx*S,cy*S),((ex+nx)*S,(ey+ny)*S),((ex+side*10)*S,ey*S),((ex-nx)*S,(ey-ny)*S)], fill=rgba(shadow,205), outline=rgba(core,245), width=2*S)
        d.arc(((cx-48)*S,(cy-48)*S,(cx+48)*S,(cy+48)*S), -145+p*75, 10+p*100, fill=rgba(accent,175), width=7*S)
        for shard in range(5):
            a = -1.8 + shard*.42 + p*.6
            r = 33 + shard*3
            x = cx + math.cos(a)*r; y = cy + math.sin(a)*r
            d.polygon([((x-3)*S,y*S),(x*S,(y-7)*S),((x+3)*S,y*S),(x*S,(y+7)*S)], fill=rgba(core,120+shard*18))
    else:
        angle = -.18 + vy*.08 + math.sin((p-.5)*math.pi)*.08
        length = 55 + easing*24
        ex = cx + side*length; ey = cy + vy*7 + math.sin(p*math.pi)*-5
        d.line((cx*S,cy*S,ex*S,ey*S), fill=rgba(core,245), width=4*S)
        d.polygon([((ex-side*5)*S,(ey-9)*S),((ex+side*15)*S,ey*S),((ex-side*5)*S,(ey+9)*S),((ex+side*2)*S,ey*S)], fill=rgba(accent,240), outline=rgba(core,255))
        for echo in range(5):
            y = ey + (echo-2)*6
            trail = 23 + echo*4 + round(p*18)
            d.line(((cx-side*(7+echo*2))*S,y*S,(ex-side*trail)*S,y*S), fill=rgba(accent,155-echo*18), width=2*S)
    ring = 12 + int(math.sin(p*math.pi)*8)
    d.ellipse(((cx-ring)*S,(cy-ring)*S,(cx+ring)*S,(cy+ring)*S), outline=rgba(accent,100+int(100*math.sin(p*math.pi))), width=2*S)
    glow(img,layer,8+math.sin(p*math.pi)*2,.76); img.alpha_composite(layer); return finish(img)

VARIANT_COLORS = {
    'void':('#34245e','#9e72ff','#6ef2df'),
    'frost':('#1f4e72','#70cff5','#e8fcff'),
    'inferno':('#6e2d25','#ef714f','#ffd28e'),
    'boss':('#3a2452','#bd81ff','#f0d39c'),
}


def recovery_frame(variant, direction, state, index):
    base, accent, core = VARIANT_COLORS[variant]
    vx, vy = dvec(direction); side = -1 if vx < -.12 else 1
    boss = variant == 'boss'; p = index
    img = canvas(); layer = canvas(); d = ImageDraw.Draw(layer,'RGBA')
    cx = 48 + vx*4; cy = 52 + (7 if state == 'stagger' else 4 if state == 'rise' else 0)
    state_factor = {'stagger': .78, 'rise': .9, 'recover': 1.0}[state]
    body_rx = (32 if boss else 28) * (1.1 if state == 'stagger' else 1)
    body_ry = (22 if boss else 19) * state_factor
    d.ellipse(((cx-body_rx)*S,(cy-body_ry)*S,(cx+body_rx)*S,(cy+body_ry)*S), fill=rgba(base,185), outline=rgba(accent,235), width=3*S)
    hx = cx + side*(10 + (2-index)*3 if state == 'stagger' else 8)
    hy = cy - (10 if state == 'stagger' else 17 if state == 'rise' else 20)
    d.polygon([((hx-13)*S,(hy+5)*S),(hx*S,(hy-17-index*2)*S),((hx+13)*S,(hy+5)*S),(hx*S,(hy+12)*S)], fill=rgba(base,220), outline=rgba(core,240))
    # limbs articulate from collapsed to neutral
    lift = {'stagger': .35, 'rise': .7, 'recover': 1}[state] + index*.08
    for limb in range(4):
        a = math.tau*limb/4 + math.atan2(vy,vx)*.22
        reach = (25 + (limb%2)*4) * lift
        sx = cx + math.cos(a)*10; sy = cy + math.sin(a)*7
        ex = cx + math.cos(a)*reach; ey = cy + math.sin(a)*reach*(.55 if state == 'stagger' else 1)
        d.line((sx*S,sy*S,ex*S,ey*S), fill=rgba(accent,220), width=(6 if boss else 5)*S)
        for claw in range(3):
            d.line((ex*S,ey*S,(ex+math.cos(a+(claw-1)*.25)*9)*S,(ey+math.sin(a+(claw-1)*.25)*9)*S), fill=rgba(core,220), width=2*S)
    # state accents
    if state == 'stagger':
        for ray in range(6):
            a = math.tau*ray/6 + index*.25
            d.line(((cx+math.cos(a)*14)*S,(cy+math.sin(a)*12)*S,(cx+math.cos(a)*(31+index*5))*S,(cy+math.sin(a)*(27+index*5))*S), fill=rgba(core,170), width=2*S)
    elif state == 'rise':
        for shard in range(7):
            x = cx + (shard-3)*8; y = cy+19-index*3
            d.line((x*S,(y+7)*S,x*S,(y-4-shard%3*3)*S), fill=rgba(accent,120+shard*12), width=2*S)
    else:
        r = 34+index*3
        d.arc(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S), 195, 345, fill=rgba(core,150), width=3*S)
    glow(img,layer,7 if boss else 5,.7); img.alpha_composite(layer); return finish(img)

STATUS_COLORS = {'burn':'#ff8056','slow':'#72d8ff','void':'#a879ff','shock':'#ffe580','bleed':'#ff5d7b','barrier':'#7ff5df','haste':'#f7d98f','weaken':'#9e8bb8'}


def status_lifecycle_frame(kind, event, index):
    p = index/3; color = STATUS_COLORS[kind]
    img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer,'RGBA'); cx=cy=48
    if event == 'stack':
        count = index + 1
        for ring in range(count):
            r = 13 + ring*9
            d.ellipse(((cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S), outline=rgba(color,230-ring*35), width=(4-ring//2)*S)
        d.polygon([(48*S,23*S),(64*S,48*S),(48*S,73*S),(32*S,48*S)], fill=rgba(color,90), outline=rgba('#ffffff',215))
    elif event == 'cleanse':
        for ray in range(12):
            a=math.tau*ray/12-p*.5; inner=8+p*8; outer=38-p*13
            d.line(((cx+math.cos(a)*inner)*S,(cy+math.sin(a)*inner)*S,(cx+math.cos(a)*outer)*S,(cy+math.sin(a)*outer)*S), fill=rgba(color,220-int(p*100)), width=3*S)
        d.arc((25*S,25*S,71*S,71*S),35,320,fill=rgba('#ffffff',220),width=4*S)
    else:
        r=28+p*3
        d.polygon([(48*S,(48-r)*S),((48+r)*S,48*S),(48*S,(48+r)*S),((48-r)*S,48*S)], fill=rgba('#1a2038',190), outline=rgba(color,240), width=3*S)
        d.line((33*S,33*S,63*S,63*S),fill=rgba('#ffffff',230),width=5*S)
        d.line((63*S,33*S,33*S,63*S),fill=rgba('#ffffff',230),width=5*S)
    glow(img,layer,8,.82); img.alpha_composite(layer); return finish(img)


def support_ui_frame(kind):
    img=canvas(); layer=canvas(); d=ImageDraw.Draw(layer,'RGBA'); cx=cy=48
    gold='#e8cb8f'; cyan='#70f3df'; violet='#9e7bff'; warning='#ffb461'
    color = warning if kind in {'immune','stagger'} else cyan if kind in {'cleanse','verified','capture','evidence'} else violet if kind in {'stack','restore','timeline','diff'} else gold
    d.rounded_rectangle((15*S,15*S,81*S,81*S), radius=14*S, fill=rgba('#10192b',230), outline=rgba(gold,215), width=2*S)
    d.polygon([(48*S,20*S),(76*S,48*S),(48*S,76*S),(20*S,48*S)], outline=rgba(color,205))
    if kind == 'stack':
        for r in (10,17,24): d.ellipse(((48-r)*S,(48-r)*S,(48+r)*S,(48+r)*S), outline=rgba(color,230-r*3), width=3*S)
    elif kind in {'cleanse','restore'}:
        d.arc((28*S,28*S,68*S,68*S),30,330,fill=rgba(color,240),width=4*S); d.polygon([(29*S,29*S),(41*S,29*S),(32*S,40*S)],fill=rgba(color,230))
    elif kind == 'immune':
        d.polygon([(48*S,25*S),(68*S,36*S),(64*S,62*S),(48*S,71*S),(32*S,62*S),(28*S,36*S)],fill=rgba(color,105),outline=rgba('#ffffff',220)); d.line((36*S,36*S,60*S,60*S),fill=rgba('#ffffff',230),width=4*S)
    elif kind in {'status-hud','combo'}:
        for i in range(3): d.rounded_rectangle(((27+i*14)*S,36*S,(37+i*14)*S,60*S),radius=3*S,fill=rgba(color,100+i*35),outline=rgba('#ffffff',150))
    elif kind == 'interpolate':
        d.line((26*S,60*S,42*S,42*S,56*S,52*S,70*S,32*S),fill=rgba(color,240),width=4*S)
        for x,y in ((26,60),(42,42),(56,52),(70,32)): d.ellipse(((x-3)*S,(y-3)*S,(x+3)*S,(y+3)*S),fill=rgba('#ffffff',220))
    elif kind in {'stagger','rise','recover'}:
        offset={'stagger':8,'rise':0,'recover':-6}[kind]
        d.ellipse((38*S,(27+offset)*S,58*S,(47+offset)*S),fill=rgba(color,185)); d.line((48*S,(45+offset)*S,48*S,(65+offset)*S),fill=rgba(color,230),width=5*S)
    elif kind in {'evidence','capture','verified'}:
        d.rounded_rectangle((29*S,28*S,67*S,65*S),radius=5*S,outline=rgba(color,240),width=3*S); d.ellipse((39*S,38*S,57*S,56*S),outline=rgba('#ffffff',220),width=3*S)
        if kind=='verified': d.line((36*S,58*S,45*S,66*S,62*S,48*S),fill=rgba('#ffffff',230),width=4*S)
    elif kind in {'audit-filter','timeline','diff'}:
        for row in range(3): d.line((31*S,(35+row*11)*S,65*S,(35+row*11)*S),fill=rgba(color,220),width=3*S)
        if kind=='diff': d.line((35*S,31*S,61*S,65*S),fill=rgba('#ffffff',180),width=3*S)
    else:
        d.line((33*S,49*S,44*S,60*S,65*S,36*S),fill=rgba(color,245),width=5*S)
    glow(img,layer,6,.58); img.alpha_composite(layer); return finish(img)


def write_atlas(group,name,frames,cols,animations):
    rows=math.ceil(len(frames)/cols)
    atlas=Image.new('RGBA',(cols*FRAME,rows*FRAME),(0,0,0,0)); data={}
    for idx,(key,image) in enumerate(frames):
        x=(idx%cols)*FRAME; y=(idx//cols)*FRAME; atlas.alpha_composite(image,(x,y))
        data[key]={'frame':{'x':x,'y':y,'w':FRAME,'h':FRAME},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':FRAME,'h':FRAME},'sourceSize':{'w':FRAME,'h':FRAME},'anchor':{'x':.5,'y':.5}}
    out=OUT/group; out.mkdir(parents=True,exist_ok=True)
    image_path=out/f'{name}.webp'; json_path=out/f'{name}.json'
    atlas.save(image_path,'WEBP',lossless=False,quality=76,method=4)
    payload={'frames':data,'animations':animations,'meta':{'app':'LUMERIFT premium runtime v21','version':'1.11.37','image':image_path.name,'format':'RGBA8888','size':{'w':atlas.width,'h':atlas.height},'scale':'1','source':'Premium Art Direction v2; supersampled procedural raster overlays','usage':'runtime overlay; v20 and established body Atlases remain fallback'}}
    json_path.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return image_path,json_path


def write_contract(path,payload):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


def main():
    player=[]; player_anims={}
    for weapon in WEAPONS:
        for direction in DIRECTIONS:
            keys=[]
            for index in range(8):
                key=f'premium.interpolate.v21.player.{weapon}.{direction}.{index}'
                player.append((key,interpolation_frame(weapon,direction,index))); keys.append(key)
            player_anims[f'premium.interpolate.v21.player.{weapon}.{direction}']=keys

    monster=[]; monster_anims={}
    for variant in MONSTER_VARIANTS:
        for direction in DIRECTIONS:
            for state in RECOVERY_STATES:
                keys=[]
                for index in range(2):
                    key=f'premium.recovery.v21.monster.{variant}.{direction}.{state}.{index}'
                    monster.append((key,recovery_frame(variant,direction,state,index))); keys.append(key)
                monster_anims[f'premium.recovery.v21.monster.{variant}.{direction}.{state}']=keys

    status=[]; status_anims={}
    for kind in STATUS_KINDS:
        for event in STATUS_EVENTS:
            keys=[]
            for index in range(4):
                key=f'premium.status.v21.{kind}.{event}.{index}'
                status.append((key,status_lifecycle_frame(kind,event,index))); keys.append(key)
            status_anims[f'premium.status.v21.{kind}.{event}']=keys

    ui=[]; ui_anims={}
    for kind in SUPPORT_UI:
        key=f'premium.ui.v21.{kind}'; ui.append((key,support_ui_frame(kind))); ui_anims[key]=[key]

    paths=[]
    paths += list(write_atlas('player','player_weapon_interpolation_v21',player,8,player_anims))
    paths += list(write_atlas('monsters','monster_recovery_parts_v21',monster,8,monster_anims))
    paths += list(write_atlas('effects','status_lifecycle_v21',status,8,status_anims))
    paths += list(write_atlas('ui','premium_support_ui_v21',ui,8,ui_anims))

    prod=ROOT/'public/assets/live/v21/production'
    write_contract(prod/'PLAYER_WEAPON_INTERPOLATION_V21.json',{'schema':'lumerift-player-weapon-interpolation-v21','version':'1.11.37','weapons':WEAPONS,'directions':8,'framesPerAnimation':8,'frames':len(player),'animations':len(player_anims),'attackFootprintChanged':False,'finalFullBodyHandPaintedAtlasComplete':False,'fallback':['v20','v19','v18','v17','v16','established-body']})
    write_contract(prod/'MONSTER_RECOVERY_PARTS_V21.json',{'schema':'lumerift-monster-recovery-parts-v21','version':'1.11.37','variants':MONSTER_VARIANTS,'directions':8,'states':RECOVERY_STATES,'frames':len(monster),'animations':len(monster_anims),'gameplayTimingChanged':False,'finalFullBodyHandPaintedAtlasComplete':False,'fallback':['v20','v19','v18','v17','v16','established-body']})
    write_contract(prod/'STATUS_LIFECYCLE_V21.json',{'schema':'lumerift-status-lifecycle-v21','version':'1.11.37','effects':STATUS_KINDS,'events':STATUS_EVENTS,'frames':len(status),'animations':len(status_anims),'statusGameplayChanged':False,'fallback':['v20','v19','v4']})
    write_contract(prod/'PREMIUM_SUPPORT_UI_V21.json',{'schema':'lumerift-premium-support-ui-v21','version':'1.11.37','icons':SUPPORT_UI,'frames':len(ui),'animations':len(ui_anims),'screens':['mobile-calibration','appearance-recovery','appearance-audit','cloud-conflict','battle-status'],'initialBundleRequired':False,'fallback':['v20','v18','v17','v16']})

    SOURCE.mkdir(parents=True,exist_ok=True)
    for path in paths[::2]:
        (SOURCE/(path.stem+'_master.webp')).write_bytes(path.read_bytes())
    (SOURCE/'README.md').write_text('# Premium Runtime v21 Source Masters\n\n- 8-frame weapon interpolation overlays for three weapon families.\n- Eight-direction monster stagger, rise, and recover overlays.\n- Status stack, cleanse, and immunity lifecycle VFX.\n- Support UI v21 icons for status and verification workflows.\n- v20 and established body Atlases remain fallback.\n- Final hand-painted full-body Atlas is still pending.\n',encoding='utf-8')
    for path in paths:
        print(path.relative_to(ROOT),path.stat().st_size)

if __name__=='__main__':
    main()

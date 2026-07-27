from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import json, math, random, subprocess, shutil

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ROOT = PROJECT_ROOT / 'public/assets'


def save_atlas(folder, image_name, json_name, frames, animations, image):
    folder.mkdir(parents=True, exist_ok=True)
    image.save(folder / image_name, 'WEBP', quality=88, method=6, lossless=True)
    data = {
        'frames': frames,
        'animations': animations,
        'meta': {
            'app': 'LUMERIFT internal atlas generator',
            'version': '1.0',
            'image': image_name,
            'format': 'RGBA8888',
            'size': {'w': image.width, 'h': image.height},
            'scale': '1'
        }
    }
    (folder / json_name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


def frame_meta(x, y, w, h):
    return {
        'frame': {'x': x, 'y': y, 'w': w, 'h': h},
        'rotated': False,
        'trimmed': False,
        'spriteSourceSize': {'x': 0, 'y': 0, 'w': w, 'h': h},
        'sourceSize': {'w': w, 'h': h},
        'anchor': {'x': 0.5, 'y': 0.76}
    }


def draw_player_frame(size, direction_index, state, frame_index):
    im = Image.new('RGBA', (size, size), (0,0,0,0))
    d = ImageDraw.Draw(im)
    cx, cy = size//2, int(size*0.60)
    angle = direction_index * math.pi/4 - math.pi/2
    dx, dy = math.cos(angle), math.sin(angle)
    bob = 0
    if state == 'run': bob = [-2, 1, 0][frame_index % 3]
    if state.startswith('attack'): bob = [0, -1, 1][frame_index % 3]
    if state.startswith('skill'): bob = [1, -2, 0][frame_index % 3]
    if state == 'dodge': bob = [2, 0, -2][frame_index % 3]
    cy += bob
    # shadow
    d.ellipse((cx-15, cy+13, cx+15, cy+20), fill=(5,8,15,90))
    # cape/back glow
    glow = (86,230,191,110) if state.startswith('skill') else (127,140,255,80)
    d.ellipse((cx-14-int(dx*2), cy-23-int(dy*2), cx+14-int(dx*2), cy+11-int(dy*2)), fill=glow)
    # body armor
    body = [(cx-9,cy-9),(cx+9,cy-9),(cx+12,cy+10),(cx,cy+17),(cx-12,cy+10)]
    d.polygon(body, fill=(82,96,156,255), outline=(184,198,255,255))
    d.line((cx,cy-8,cx,cy+13), fill=(85,230,191,230), width=2)
    # head
    hx, hy = cx+int(dx*2), cy-19+int(dy*2)
    d.ellipse((hx-7,hy-7,hx+7,hy+7), fill=(231,218,204,255), outline=(244,247,255,255))
    # hair directional wedge
    d.polygon([(hx-7,hy-5),(hx+6,hy-8),(hx-int(dx*5),hy-13)], fill=(26,33,55,255))
    # eye/light toward direction
    ex, ey = hx+int(dx*4), hy+int(dy*3)
    d.ellipse((ex-1,ey-1,ex+2,ey+2), fill=(85,230,191,255))
    # legs
    stride = 4 if state == 'run' and frame_index != 1 else 1
    d.line((cx-4,cy+12,cx-5-int(dx*stride),cy+24-int(dy*stride)), fill=(33,42,70,255), width=5)
    d.line((cx+4,cy+12,cx+5+int(dx*stride),cy+24+int(dy*stride)), fill=(33,42,70,255), width=5)
    # weapon orientation and action swing
    swing = 0
    if state.startswith('attack'): swing = (-0.8,0.1,0.8)[frame_index%3]
    if state.startswith('skill'): swing = (-1.0,0.2,1.1)[frame_index%3]
    wx_dir = math.cos(angle+swing); wy_dir = math.sin(angle+swing)
    length = 25 if state not in ('hit','death') else 17
    sx, sy = cx+int(wx_dir*6), cy-2+int(wy_dir*6)
    ex2, ey2 = cx+int(wx_dir*length), cy-2+int(wy_dir*length)
    d.line((sx,sy,ex2,ey2), fill=(248,251,255,255), width=4)
    d.line((ex2,ey2,cx+int(wx_dir*(length+5)),cy-2+int(wy_dir*(length+5))), fill=(85,230,191,220), width=2)
    # state-specific accent
    if state.startswith('skill'):
        r = 13 + frame_index*5
        d.arc((cx-r,cy-r,cx+r,cy+r), start=30+direction_index*45, end=270+direction_index*45, fill=(166,173,255,230), width=3)
    elif state == 'hit':
        d.line((cx-16,cy-24,cx+16,cy+12), fill=(255,111,134,220), width=3)
    elif state == 'death':
        im = im.rotate(18 + frame_index*12, resample=Image.Resampling.BICUBIC, center=(cx,cy), expand=False)
    elif state == 'dodge':
        for i in range(3):
            ox = int(-dx*(8+i*5)); oy = int(-dy*(8+i*5))
            d.line((cx+ox-5,cy+oy,cx+ox+5,cy+oy), fill=(166,173,255,120-i*25), width=2)
    return im


def make_player_atlas():
    dirs = ['n','ne','e','se','s','sw','w','nw']
    states = ['idle','run','attack1','attack2','attack3','skill1','skill2','hit','death','dodge']
    size=48; cols=16; total=len(dirs)*len(states)*3; rows=math.ceil(total/cols)
    atlas=Image.new('RGBA',(cols*size,rows*size),(0,0,0,0))
    frames={}; anim={}; idx=0
    for st in states:
        for di,dr in enumerate(dirs):
            names=[]
            for fi in range(3):
                x=(idx%cols)*size; y=(idx//cols)*size
                frame=draw_player_frame(size,di,st,fi)
                atlas.alpha_composite(frame,(x,y))
                name=f'player_{st}_{dr}_{fi}'
                frames[name]=frame_meta(x,y,size,size)
                names.append(name); idx+=1
            anim[f'player.{st}.{dr}']=names
    save_atlas(ROOT/'atlases/player','player_v1.webp','player_v1.json',frames,anim,atlas)


def draw_monster_frame(size, rank, state, frame_index):
    im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im)
    cx,cy=size//2,int(size*.60)
    palette={
      'normal':((68,153,124,255),(157,246,204,255)),
      'elite':((113,87,176,255),(211,170,255,255)),
      'boss':((145,67,88,255),(255,206,106,255))
    }
    body, accent=palette[rank]
    scale={'normal':18,'elite':22,'boss':27}[rank]
    pulse=[0,2,-1][frame_index%3]
    if state=='move': cy += [-2,1,0][frame_index%3]
    d.ellipse((cx-scale-3,cy+scale*.55,cx+scale+3,cy+scale*.86),fill=(5,8,15,100))
    # aura
    if rank!='normal': d.ellipse((cx-scale-7,cy-scale-7,cx+scale+7,cy+scale+7),outline=accent,width=3)
    d.ellipse((cx-scale-pulse,cy-scale-pulse,cx+scale+pulse,cy+scale+pulse),fill=body,outline=accent,width=2)
    # horns
    if rank in ('elite','boss'):
      d.polygon([(cx-scale+4,cy-scale+4),(cx-scale-8,cy-scale-15),(cx-5,cy-scale+2)],fill=accent)
      d.polygon([(cx+scale-4,cy-scale+4),(cx+scale+8,cy-scale-15),(cx+5,cy-scale+2)],fill=accent)
    # eyes
    eye_y=cy-5
    d.ellipse((cx-10,eye_y-2,cx-5,eye_y+3),fill=(255,255,255,255))
    d.ellipse((cx+5,eye_y-2,cx+10,eye_y+3),fill=(255,255,255,255))
    d.ellipse((cx-8,eye_y,cx-6,eye_y+2),fill=accent)
    d.ellipse((cx+7,eye_y,cx+9,eye_y+2),fill=accent)
    if state in ('attack','roar'):
      d.arc((cx-10,cy,cx+10,cy+13),0,180,fill=(255,255,255,255),width=3)
      r=scale+8+frame_index*3
      d.arc((cx-r,cy-r,cx+r,cy+r),20,300,fill=accent,width=3)
    elif state=='hit':
      d.line((cx-scale,cy-scale,cx+scale,cy+scale),fill=(255,111,134,255),width=4)
    elif state=='die':
      im=im.rotate(frame_index*18,resample=Image.Resampling.BICUBIC,center=(cx,cy),expand=False)
    return im


def make_monster_atlas():
    ranks=['normal','elite','boss']; states=['idle','move','attack','hit','die','roar']; size=64; cols=12
    total=len(ranks)*len(states)*3; rows=math.ceil(total/cols)
    atlas=Image.new('RGBA',(cols*size,rows*size),(0,0,0,0)); frames={}; anim={}; idx=0
    for rank in ranks:
      for st in states:
        names=[]
        for fi in range(3):
          x=(idx%cols)*size; y=(idx//cols)*size
          atlas.alpha_composite(draw_monster_frame(size,rank,st,fi),(x,y))
          name=f'monster_{rank}_{st}_{fi}'; frames[name]=frame_meta(x,y,size,size); names.append(name); idx+=1
        anim[f'monster.{rank}.{st}']=names
    save_atlas(ROOT/'atlases/monsters','monster_common_v1.webp','monster_common_v1.json',frames,anim,atlas)


def make_ui_atlas():
    cell=96; cols=4; rows=3
    atlas=Image.new('RGBA',(cols*cell,rows*cell),(0,0,0,0)); frames={}; animations={}
    names=['panel','button_primary','button_secondary','button_danger','slot','slot_rare','slot_heroic','skill_frame','hp_fill','tab_active','badge','dialog']
    for idx,name in enumerate(names):
      x=(idx%cols)*cell; y=(idx//cols)*cell
      tile=Image.new('RGBA',(cell,cell),(0,0,0,0)); d=ImageDraw.Draw(tile)
      if name=='panel' or name=='dialog':
        d.rounded_rectangle((2,2,93,93),radius=22,fill=(18,26,43,235),outline=(166,173,255,80),width=3)
        d.rounded_rectangle((9,9,86,86),radius=16,outline=(85,230,191,42),width=2)
      elif name.startswith('button'):
        color={'button_primary':(92,108,222,245),'button_secondary':(28,42,68,245),'button_danger':(180,61,85,245)}[name]
        d.rounded_rectangle((2,8,93,87),radius=20,fill=color,outline=(255,255,255,45),width=3)
        d.rounded_rectangle((8,14,87,80),radius=15,outline=(255,255,255,25),width=2)
      elif name.startswith('slot'):
        color=(127,140,255,180)
        if name=='slot_rare': color=(85,230,191,205)
        if name=='slot_heroic': color=(211,170,255,215)
        d.rounded_rectangle((7,7,89,89),radius=17,fill=(12,18,31,235),outline=color,width=5)
        d.rounded_rectangle((14,14,82,82),radius=12,outline=(255,255,255,25),width=2)
      elif name=='skill_frame':
        d.ellipse((7,7,89,89),fill=(18,26,43,245),outline=(166,173,255,230),width=5)
        d.ellipse((17,17,79,79),outline=(85,230,191,130),width=3)
      elif name=='hp_fill':
        d.rounded_rectangle((3,30,93,66),radius=17,fill=(72,209,151,255),outline=(255,255,255,60),width=2)
      elif name=='tab_active':
        d.rounded_rectangle((3,19,93,78),radius=16,fill=(127,140,255,220),outline=(255,255,255,55),width=2)
      elif name=='badge':
        d.ellipse((17,17,79,79),fill=(255,111,134,250),outline=(255,255,255,80),width=3)
      tile=tile.filter(ImageFilter.GaussianBlur(0.15))
      atlas.alpha_composite(tile,(x,y)); frames[name]=frame_meta(x,y,cell,cell)
    save_atlas(ROOT/'atlases/ui','ui_skin_v1.webp','ui_skin_v1.json',frames,animations,atlas)


def make_map():
    w,h=540,960
    im=Image.new('RGBA',(w,h),(7,14,24,255)); d=ImageDraw.Draw(im)
    # layered vertical gradient
    for y in range(h):
      t=y/(h-1)
      c=(int(7+8*t),int(14+24*t),int(24+24*t),255)
      d.line((0,y,w,y),fill=c)
    random.seed(42)
    for i in range(70):
      x=random.randint(-30,w+30); y=random.randint(120,820); r=random.randint(15,75)
      color=(20,76+random.randint(0,30),66+random.randint(0,35),random.randint(20,60))
      d.ellipse((x-r,y-r,x+r,y+r),fill=color)
    # path
    path=[(230,960),(180,790),(300,650),(205,500),(325,340),(245,180),(270,70)]
    d.line(path,fill=(74,78,91,140),width=150,joint='curve')
    d.line(path,fill=(132,136,142,50),width=105,joint='curve')
    # rift circles
    for radius,alpha in [(95,30),(62,55),(32,100)]:
      d.ellipse((270-radius,440-radius,270+radius,440+radius),outline=(127,140,255,alpha),width=5)
    d.ellipse((252,422,288,458),fill=(85,230,191,120))
    # foreground rocks/trees
    for i in range(20):
      x=random.randint(0,w); y=random.randint(180,780); r=random.randint(10,30)
      d.polygon([(x,y-r*2),(x-r,y+r),(x+r,y+r)],fill=(18,54,49,170))
    im=im.filter(ImageFilter.GaussianBlur(0.35))
    folder=ROOT/'maps/chapter1'; folder.mkdir(parents=True,exist_ok=True)
    im.save(folder/'forest_rift_v1.webp','WEBP',quality=78,method=6)



def make_effects_atlas():
    names = ['slash', 'nova', 'hit', 'explosion', 'dodge']
    size = 96
    frames = {}
    animations = {}
    atlas = Image.new('RGBA', (size * 5, size * len(names)), (0, 0, 0, 0))
    palette = {
        'slash': (121, 238, 213, 255),
        'nova': (178, 151, 255, 255),
        'hit': (255, 233, 151, 255),
        'explosion': (255, 121, 110, 255),
        'dodge': (136, 176, 255, 255),
    }
    for row, effect in enumerate(names):
        animation_names = []
        for frame_index in range(5):
            tile = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            d = ImageDraw.Draw(tile)
            cx = cy = size // 2
            color = palette[effect]
            progress = (frame_index + 1) / 5
            alpha = max(30, 255 - frame_index * 40)
            c = (color[0], color[1], color[2], alpha)
            if effect == 'slash':
                box = (10 + frame_index * 2, 12 + frame_index * 2, 86 - frame_index * 2, 84 - frame_index * 2)
                d.arc(box, 205, 340, fill=c, width=max(3, 13 - frame_index * 2))
                d.arc((20, 18, 90, 88), 210, 330, fill=(255,255,255,max(20,alpha-60)), width=3)
            elif effect == 'nova':
                radius = 10 + frame_index * 8
                d.ellipse((cx-radius, cy-radius, cx+radius, cy+radius), outline=c, width=max(2, 9-frame_index))
                for angle in range(0, 360, 45):
                    rad = math.radians(angle)
                    r1 = radius * .4
                    r2 = radius * 1.25
                    d.line((cx+math.cos(rad)*r1, cy+math.sin(rad)*r1, cx+math.cos(rad)*r2, cy+math.sin(rad)*r2), fill=c, width=3)
            elif effect == 'hit':
                radius = 8 + frame_index * 6
                for angle in range(0, 360, 60):
                    rad = math.radians(angle + frame_index * 8)
                    d.line((cx, cy, cx+math.cos(rad)*radius, cy+math.sin(rad)*radius), fill=c, width=max(2, 7-frame_index))
                d.ellipse((cx-8,cy-8,cx+8,cy+8), fill=(255,255,255,alpha))
            elif effect == 'explosion':
                radius = 12 + frame_index * 8
                d.ellipse((cx-radius,cy-radius,cx+radius,cy+radius), fill=(color[0],color[1],color[2],max(10,alpha//3)), outline=c, width=max(2,7-frame_index))
                d.ellipse((cx-radius//2,cy-radius//2,cx+radius//2,cy+radius//2), fill=(255,220,132,max(20,alpha-40)))
            else:
                offset = frame_index * 7
                for trail in range(4):
                    x = cx - offset - trail * 9
                    d.ellipse((x-12, cy-22+trail*2, x+12, cy+22-trail*2), outline=(color[0],color[1],color[2],max(20,alpha-trail*40)), width=4)
            x = frame_index * size
            y = row * size
            atlas.alpha_composite(tile.filter(ImageFilter.GaussianBlur(0.25)), (x, y))
            name = f'effect_{effect}_{frame_index}'
            frames[name] = frame_meta(x, y, size, size)
            animation_names.append(name)
        animations[f'effect.{effect}'] = animation_names
    save_atlas(ROOT/'atlases/effects', 'combat_effects_v1.webp', 'combat_effects_v1.json', frames, animations, atlas)


def make_equipment_atlas():
    item_ids = [
        'weapon_rift_blade_common', 'armor_scout_common', 'accessory_lumen_common',
        'weapon_rift_blade_rare', 'armor_warden_rare', 'accessory_core_rare',
        'weapon_heir_heroic', 'armor_harbinger_heroic', 'accessory_rift_heroic',
    ]
    grades = ['common'] * 3 + ['rare'] * 3 + ['heroic'] * 3
    size = 80
    atlas = Image.new('RGBA', (size * 3, size * 3), (0, 0, 0, 0))
    frames = {}
    grade_colors = {
        'common': (184, 198, 220, 255),
        'rare': (85, 230, 191, 255),
        'heroic': (205, 151, 255, 255),
    }
    for index, item_id in enumerate(item_ids):
        tile = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(tile)
        grade = grades[index]
        color = grade_colors[grade]
        d.rounded_rectangle((4,4,75,75), radius=16, fill=(12,18,31,235), outline=color, width=4)
        kind = index % 3
        if kind == 0:
            d.polygon([(39,10),(48,20),(43,54),(36,67),(32,52)], fill=(242,248,255,255), outline=color)
            d.rectangle((27,55,50,61), fill=color)
            d.line((28,64,50,42), fill=(255,255,255,170), width=3)
        elif kind == 1:
            d.polygon([(24,18),(40,11),(56,18),(60,47),(40,66),(20,47)], fill=(67,79,126,255), outline=color)
            d.line((40,15,40,61), fill=color, width=3)
            d.arc((26,27,54,55), 20, 160, fill=(255,255,255,150), width=3)
        else:
            d.ellipse((19,19,61,61), fill=(30,45,72,255), outline=color, width=4)
            d.polygon([(40,17),(49,36),(63,40),(49,46),(40,64),(31,46),(17,40),(31,34)], fill=(color[0],color[1],color[2],180))
            d.ellipse((34,34,46,46), fill=(245,250,255,255))
        x = (index % 3) * size
        y = (index // 3) * size
        atlas.alpha_composite(tile, (x, y))
        frames[f'item.{item_id}'] = frame_meta(x, y, size, size)
    save_atlas(ROOT/'atlases/items', 'equipment_icons_v1.webp', 'equipment_icons_v1.json', frames, {}, atlas)


def make_audio():
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        print('ffmpeg not found: image atlases generated, audio generation skipped')
        return
    targets = [
        (ROOT/'audio/ui/click_v1.ogg', ['-f','lavfi','-i','sine=frequency=880:duration=0.07','-filter:a','volume=0.18,afade=t=out:st=0.03:d=0.04','-c:a','libvorbis','-q:a','2']),
        (ROOT/'audio/combat/slash_v1.ogg', ['-f','lavfi','-i','sine=frequency=220:duration=0.16','-filter:a','volume=0.22,afade=t=out:st=0.08:d=0.08','-c:a','libvorbis','-q:a','2']),
        (ROOT/'audio/combat/hit_v1.ogg', ['-f','lavfi','-i','anoisesrc=color=brown:duration=0.18:amplitude=0.4','-filter:a','highpass=f=180,lowpass=f=1800,volume=0.22,afade=t=out:st=0.08:d=0.1','-c:a','libvorbis','-q:a','2']),
        (ROOT/'audio/combat/skill_v1.ogg', ['-f','lavfi','-i','sine=frequency=540:duration=0.30','-filter:a','volume=0.18,afade=t=out:st=0.12:d=0.18','-c:a','libvorbis','-q:a','2']),
        (ROOT/'audio/combat/dodge_v1.ogg', ['-f','lavfi','-i','anoisesrc=color=white:duration=0.14:amplitude=0.15','-filter:a','highpass=f=900,lowpass=f=4200,volume=0.16,afade=t=out:st=0.05:d=0.09','-c:a','libvorbis','-q:a','2']),
    ]
    for target, args in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([ffmpeg,'-hide_banner','-loglevel','error',*args,str(target),'-y'], check=True)
    bgm = ROOT/'audio/bgm/forest_rift_loop_v1.opus'
    bgm.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        ffmpeg,'-hide_banner','-loglevel','error',
        '-f','lavfi','-i','sine=frequency=110:duration=12',
        '-f','lavfi','-i','sine=frequency=165:duration=12',
        '-filter_complex','[0:a]volume=0.035[a0];[1:a]volume=0.022[a1];[a0][a1]amix=inputs=2,lowpass=f=900,afade=t=in:st=0:d=1.5,afade=t=out:st=10.5:d=1.5',
        '-c:a','libopus','-b:a','32k',str(bgm),'-y'
    ], check=True)


def make_manifest():
    bundles = {
        'core-ui': [
            'atlases/ui/ui_skin_v1.json',
            'atlases/ui/ui_skin_v1.webp',
            'audio/ui/click_v1.ogg',
        ],
        'equipment-ui': [
            'atlases/items/equipment_icons_v1.json',
            'atlases/items/equipment_icons_v1.webp',
        ],
        'lobby-character': [
            'atlases/player/player_v1.json',
            'atlases/player/player_v1.webp',
            'atlases/items/equipment_icons_v1.json',
            'atlases/items/equipment_icons_v1.webp',
        ],
        'battle-chapter-1': [
            'atlases/player/player_v1.json',
            'atlases/player/player_v1.webp',
            'atlases/monsters/monster_common_v1.json',
            'atlases/monsters/monster_common_v1.webp',
            'atlases/effects/combat_effects_v1.json',
            'atlases/effects/combat_effects_v1.webp',
            'atlases/items/equipment_icons_v1.json',
            'atlases/items/equipment_icons_v1.webp',
            'maps/chapter1/forest_rift_v1.webp',
            'audio/combat/slash_v1.ogg',
            'audio/combat/hit_v1.ogg',
            'audio/combat/skill_v1.ogg',
            'audio/combat/dodge_v1.ogg',
            'audio/bgm/forest_rift_loop_v1.opus',
        ],
    }
    manifest = {'version': 2, 'game': 'LUMERIFT', 'bundles': {}}
    for bundle_id, files in bundles.items():
        manifest['bundles'][bundle_id] = {
            'files': files,
            'bytes': sum((ROOT / file).stat().st_size for file in files),
        }
    (ROOT / 'ASSET_MANIFEST.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8'
    )

make_player_atlas(); make_monster_atlas(); make_ui_atlas(); make_effects_atlas(); make_equipment_atlas(); make_map(); make_audio(); make_manifest()
print('generated runtime assets')

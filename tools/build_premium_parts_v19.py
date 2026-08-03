from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/live/v19/atlases'
SOURCE = ROOT / 'art_source/lumerift_owned/premium_parts_v19'
FRAME = 96
S = 2
HI = FRAME * S
DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
PLAYER_ACTIONS = ['attack', 'dodge', 'skill']
PLAYER_PHASES = ['contact', 'sustain', 'recover']
MONSTER_VARIANTS = ['void', 'frost', 'inferno', 'boss']
MONSTER_DIRECTIONS = ['front', 'side', 'back', 'three-quarter']
MONSTER_PHASES = ['telegraph', 'impact', 'recover']
CORE_COUNTS = {'shielded': 6, 'fractured': 6, 'shattered': 8, 'regenerating': 8, 'overdrive': 8}
VFX_KINDS = ['slash', 'hit', 'nova', 'explosion', 'dodge', 'ultimate']


def rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip('#')
    return tuple(int(value[i:i+2], 16) for i in (0, 2, 4)) + (alpha,)


def canvas() -> Image.Image:
    return Image.new('RGBA', (HI, HI), (0, 0, 0, 0))


def finish(image: Image.Image) -> Image.Image:
    return image.resize((FRAME, FRAME), Image.Resampling.LANCZOS)


def glow(base: Image.Image, layer: Image.Image, radius: float = 7, opacity: float = .7) -> None:
    blur = layer.filter(ImageFilter.GaussianBlur(max(1, round(radius * S))))
    if opacity < 1:
        blur.putalpha(blur.getchannel('A').point(lambda p: round(p * opacity)))
    base.alpha_composite(blur)


def dvec(direction: str) -> tuple[float, float]:
    idx = DIRECTIONS.index(direction)
    angle = -math.pi / 2 + idx * math.pi / 4
    return math.cos(angle), math.sin(angle)


def player_phase_frame(direction: str, action: str, phase: str) -> Image.Image:
    vx, vy = dvec(direction)
    phase_index = PLAYER_PHASES.index(phase)
    side = -1 if vx < -0.15 else 1
    front = max(0.32, 1 - abs(vx) * 0.34)
    img = canvas(); layer = canvas(); draw = ImageDraw.Draw(layer)
    cx, cy = 48 + vx * 4, 53 + vy * 2
    gold = '#f1d69a'; cyan = '#74f4df'; violet = '#9b78ff'; silver = '#e8f0ff'
    motion = [0.72, 1.0, 0.54][phase_index]
    fade = [235, 250, 180][phase_index]

    # Face/hair motion marker.
    head_x = cx + side * (2 + phase_index)
    draw.ellipse(((head_x-10*front)*S, (cy-27)*S, (head_x+10*front)*S, (cy-8)*S), outline=rgba(silver, int(fade*.52)), width=2*S)
    for strand in range(5):
        t = strand - 2
        sx = head_x + t * 3.2 * front
        ex = sx - side * (4 + phase_index * 2) - vx * 4
        ey = cy - 7 + abs(t) * 1.8 + phase_index * 2
        draw.line((sx*S, (cy-29+abs(t))*S, ex*S, ey*S), fill=rgba('#5965b8', int(fade*.78)), width=(2 + strand % 2)*S)

    # Armor and cape weight.
    shoulder = 16 + (4 if action == 'attack' else 2)
    draw.polygon([((cx-shoulder*front)*S,(cy-12)*S),(cx*S,(cy-19)*S),((cx+shoulder*front)*S,(cy-12)*S),((cx+12*front)*S,(cy+15)*S),(cx*S,(cy+20)*S),((cx-12*front)*S,(cy+15)*S)], fill=rgba('#30385f', int(fade*.72)), outline=rgba(gold, int(fade*.9)))
    cape_sway = -vx * (10 + phase_index*4) - side * (5 if action == 'dodge' else 1)
    draw.polygon([((cx-12+cape_sway)*S,(cy-11)*S),((cx+12+cape_sway)*S,(cy-11)*S),((cx+17+cape_sway)*S,(cy+39)*S),((cx+cape_sway)*S,(cy+45)*S),((cx-19+cape_sway)*S,(cy+38)*S)], fill=rgba('#2b315e', int(fade*.52)), outline=rgba(violet, int(fade*.64)))

    if action == 'attack':
        arc = 29 + phase_index * 5
        start = -1.25 + side * .12
        end = .95 + side * .12
        draw.arc(((cx-arc)*S,(cy-arc)*S,(cx+arc)*S,(cy+arc)*S), math.degrees(start), math.degrees(end), fill=rgba(cyan, fade), width=(3 + phase_index)*S)
        draw.line((cx*S,cy*S,(cx+side*(31+phase_index*7))*S,(cy-12+phase_index*4)*S), fill=rgba(silver, fade), width=3*S)
        for echo in range(3):
            off = echo * 5 + phase_index * 2
            draw.arc(((cx-arc-off)*S,(cy-arc-off)*S,(cx+arc+off)*S,(cy+arc+off)*S), -70, 52, fill=rgba(violet, int(fade*(.58-echo*.12))), width=2*S)
    elif action == 'dodge':
        for trail in range(5):
            y = cy - 16 + trail * 8
            length = 23 + phase_index * 10 + trail * 2
            draw.line(((cx-side*6)*S,y*S,(cx-side*length)*S,(y+vy*6)*S), fill=rgba(cyan if trail%2==0 else violet, int(fade*(.72-trail*.08))), width=(3 if trail==2 else 2)*S)
        draw.ellipse(((cx-24)*S,(cy-28)*S,(cx+24)*S,(cy+30)*S), outline=rgba(silver, int(fade*.35)), width=2*S)
    else:
        radius = 18 + phase_index * 6
        for spoke in range(10):
            angle = math.tau*spoke/10 + phase_index*.15
            inner = radius*.45
            outer = radius*(1.2 if spoke%2==0 else .95)
            draw.line(((cx+math.cos(angle)*inner)*S,(cy+math.sin(angle)*inner)*S,(cx+math.cos(angle)*outer)*S,(cy+math.sin(angle)*outer)*S), fill=rgba(gold if spoke%2 else violet, int(fade*.82)), width=2*S)
        draw.ellipse(((cx-radius)*S,(cy-radius)*S,(cx+radius)*S,(cy+radius)*S), outline=rgba(cyan, fade), width=3*S)
        draw.ellipse(((cx-8)*S,(cy-8)*S,(cx+8)*S,(cy+8)*S), fill=rgba(violet, int(fade*.82)), outline=rgba(silver, fade), width=2*S)

    glow(img, layer, 7 + phase_index*2, .72*motion)
    img.alpha_composite(layer)
    return finish(img)


VARIANT_COLORS = {
    'void': ('#4b347d', '#9d72ff', '#6ff5df'),
    'frost': ('#245c7c', '#69c9f5', '#e4fbff'),
    'inferno': ('#733126', '#ef714f', '#ffd38d'),
    'boss': ('#3d285c', '#b778ff', '#f1d28e'),
}


def monster_direction_frame(variant: str, direction: str, phase: str) -> Image.Image:
    base, accent, core = VARIANT_COLORS[variant]
    phase_index = MONSTER_PHASES.index(phase)
    direction_index = MONSTER_DIRECTIONS.index(direction)
    boss = variant == 'boss'
    side_sign = -1 if direction == 'side' else 1
    front_scale = {'front':1.0,'three-quarter':.9,'side':.72,'back':.84}[direction]
    img = canvas(); layer = canvas(); draw = ImageDraw.Draw(layer)
    cx, cy = 48 + (8 if direction == 'side' else 0), 53
    alpha = [210, 248, 185][phase_index]

    # Head / crown.
    crown_count = 7 if boss else 5
    for i in range(crown_count):
        t = 0 if crown_count == 1 else i/(crown_count-1)
        x = cx + (t-.5)*44*front_scale
        h = 14 + (1-abs(t-.5)*2)*(18 if boss else 12) + phase_index*2
        draw.polygon([((x-5)*S,(cy-18)*S),(x*S,(cy-18-h)*S),((x+5)*S,(cy-18)*S),(x*S,(cy-11)*S)], fill=rgba(accent, alpha), outline=rgba(core, int(alpha*.9)))

    # Torso.
    width = 28*front_scale + (5 if boss else 0)
    draw.polygon([((cx-width)*S,(cy-8)*S),(cx*S,(cy-20)*S),((cx+width)*S,(cy-8)*S),((cx+width+8)*S,(cy+18)*S),((cx+18)*S,(cy+33)*S),(cx*S,(cy+38)*S),((cx-18)*S,(cy+33)*S),((cx-width-8)*S,(cy+18)*S)], fill=rgba(base, int(alpha*.78)), outline=rgba(accent, alpha))
    draw.polygon([(cx*S,(cy-9)*S),((cx+12*front_scale)*S,(cy+5)*S),(cx*S,(cy+21)*S),((cx-12*front_scale)*S,(cy+5)*S)], fill=rgba(accent, int(alpha*.5)), outline=rgba(core, alpha))

    # Directional limbs.
    limb_shift = [0, 7, 3][phase_index]
    for side in (-1,1):
        x = cx + side*(18*front_scale)
        reach = 21 + (phase_index == 1)*13 + (phase_index == 2)*5
        draw.line((x*S,(cy+8)*S,(x+side*reach*side_sign)*S,(cy+31+limb_shift)*S), fill=rgba(base, alpha), width=(8 if boss else 6)*S)
        draw.line(((x+side*reach*side_sign)*S,(cy+31+limb_shift)*S,(x+side*(reach+10)*side_sign)*S,(cy+40+phase_index*3)*S), fill=rgba(accent, int(alpha*.82)), width=3*S)
        for claw in range(3):
            tipx = x + side*(reach+9+claw*5)*side_sign
            tipy = cy+40+phase_index*3+claw*2
            draw.line((tipx*S,tipy*S,(tipx+side*8*side_sign)*S,(tipy+7)*S), fill=rgba(core, alpha), width=2*S)

    # Tail and direction cue.
    tail_dir = -1 if direction in {'front','three-quarter'} else 1
    draw.arc((5*S,(cy-2)*S,91*S,(cy+57)*S), 145 if tail_dir<0 else 205, 335 if tail_dir<0 else 395, fill=rgba(accent, int(alpha*.72)), width=(7 if boss else 5)*S)

    if phase == 'telegraph':
        draw.ellipse(((cx-37)*S,(cy-35)*S,(cx+37)*S,(cy+39)*S), outline=rgba(core, 175), width=3*S)
    elif phase == 'impact':
        for ray in range(10 if boss else 8):
            angle = math.tau*ray/(10 if boss else 8)
            draw.line(((cx+math.cos(angle)*20)*S,(cy+math.sin(angle)*20)*S,(cx+math.cos(angle)*48)*S,(cy+math.sin(angle)*48)*S), fill=rgba(core if ray%2 else accent, int(alpha*.72)), width=2*S)
    else:
        draw.arc(((cx-31)*S,(cy-28)*S,(cx+31)*S,(cy+34)*S), 15, 300, fill=rgba(accent, 120), width=2*S)

    glow(img, layer, 8 if boss else 6, .7)
    img.alpha_composite(layer)
    return finish(img)


def boss_core_frame(state: str, index: int, count: int) -> Image.Image:
    p = 0 if count <= 1 else index/(count-1)
    img = canvas(); layer = canvas(); draw = ImageDraw.Draw(layer)
    cx = cy = 48
    palette = {'shielded':'#72f3df','fractured':'#a67cff','shattered':'#bd83ff','regenerating':'#75f5df','overdrive':'#ffd17e'}
    color = palette[state]
    ring = 17 + math.sin(p*math.tau)*2
    if state in {'shielded','fractured','overdrive'}:
        draw.ellipse(((cx-ring)*S,(cy-ring)*S,(cx+ring)*S,(cy+ring)*S), fill=rgba('#5d4aa8', 110 if state!='overdrive' else 175), outline=rgba(color,235), width=3*S)
    trail_count = 12 if state in {'shattered','regenerating'} else 10
    for i in range(trail_count):
        angle = math.tau*i/trail_count + p*(.9 if state=='overdrive' else .45)
        if state == 'shattered':
            radius = 13 + p*(25+(i%3)*5)
            previous = max(8, radius-12)
        elif state == 'regenerating':
            radius = 42 - p*(23+(i%2)*4)
            previous = min(47, radius+13)
        else:
            radius = 23 + (i%2)*7 + math.sin(p*math.tau+i)*3
            previous = 13
        x1, y1 = cx+math.cos(angle)*previous, cy+math.sin(angle)*previous
        x2, y2 = cx+math.cos(angle)*radius, cy+math.sin(angle)*radius
        draw.line((x1*S,y1*S,x2*S,y2*S), fill=rgba(color if i%2==0 else '#ffffff', 205), width=(2+(i%3))*S)
        if state in {'shattered','regenerating'}:
            size = 3+(i%3)
            draw.polygon([(x2*S,(y2-size)*S),((x2+size)*S,y2*S),(x2*S,(y2+size)*S),((x2-size)*S,y2*S)], fill=rgba('#9f78ff', 210), outline=rgba('#f3d9a2',180))
    if state == 'fractured':
        for a in [-2.4,-1.55,-.7,.15,1.1,2.2]:
            draw.line((cx*S,cy*S,(cx+math.cos(a+p*.1)*31)*S,(cy+math.sin(a+p*.1)*31)*S), fill=rgba('#ffffff',220), width=2*S)
    glow(img, layer, 11, .95)
    img.alpha_composite(layer)
    return finish(img)


def premium_vfx_frame(kind: str, frame: int) -> Image.Image:
    p = frame/3
    img = canvas(); layer = canvas(); draw = ImageDraw.Draw(layer)
    cx = cy = 48
    colors = {'slash':'#78f3df','hit':'#ffffff','nova':'#ac82ff','explosion':'#ffae66','dodge':'#70ead6','ultimate':'#f2d27d'}
    color = colors[kind]
    if kind == 'slash':
        for band in range(4):
            radius = 22 + p*24 + band*4
            draw.arc(((cx-radius)*S,(cy-radius)*S,(cx+radius)*S,(cy+radius)*S), -70+band*6, 55+band*4, fill=rgba(color if band else '#ffffff', 220-band*35), width=(2+band)*S)
    elif kind == 'hit':
        for ray in range(12):
            angle = math.tau*ray/12 + p*.22
            inner = 5+p*8; outer = 18+p*28+(ray%3)*4
            draw.line(((cx+math.cos(angle)*inner)*S,(cy+math.sin(angle)*inner)*S,(cx+math.cos(angle)*outer)*S,(cy+math.sin(angle)*outer)*S), fill=rgba(color if ray%2==0 else '#88f3df', 220), width=(2+ray%2)*S)
    elif kind in {'nova','explosion','ultimate'}:
        rings = 3 if kind=='ultimate' else 2
        for ring_index in range(rings):
            radius = 12+p*(28+ring_index*8)
            draw.ellipse(((cx-radius)*S,(cy-radius)*S,(cx+radius)*S,(cy+radius)*S), outline=rgba(color if ring_index else '#ffffff', 215-ring_index*35), width=(4-ring_index)*S)
        spokes = 16 if kind=='ultimate' else 10
        for ray in range(spokes):
            angle = math.tau*ray/spokes + p*.4
            draw.line(((cx+math.cos(angle)*12)*S,(cy+math.sin(angle)*12)*S,(cx+math.cos(angle)*(32+p*16))*S,(cy+math.sin(angle)*(32+p*16))*S), fill=rgba(color if ray%2 else '#ffffff',170), width=2*S)
    else:
        for band in range(6):
            y = cy-20+band*8
            draw.line(((cx-5-p*8)*S,y*S,(cx-25-p*30-band*2)*S,(y+band%2*3)*S), fill=rgba(color if band%2 else '#ffffff',210-band*18), width=(2 if band%2 else 3)*S)
    glow(img, layer, 10 if kind in {'nova','explosion','ultimate'} else 7, .85)
    img.alpha_composite(layer)
    return finish(img)


def write_atlas(group: str, name: str, frames: list[tuple[str, Image.Image]], cols: int, animations: dict[str, list[str]]) -> tuple[Path, Path]:
    rows = math.ceil(len(frames)/cols)
    atlas = Image.new('RGBA', (cols*FRAME, rows*FRAME), (0,0,0,0))
    data: dict[str, dict] = {}
    for idx, (key, image) in enumerate(frames):
        x = (idx%cols)*FRAME; y=(idx//cols)*FRAME
        atlas.alpha_composite(image, (x,y))
        data[key] = {'frame':{'x':x,'y':y,'w':FRAME,'h':FRAME},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':FRAME,'h':FRAME},'sourceSize':{'w':FRAME,'h':FRAME},'anchor':{'x':.5,'y':.5}}
    out = OUT/group; out.mkdir(parents=True, exist_ok=True)
    image_path = out/f'{name}.webp'; json_path = out/f'{name}.json'
    atlas.save(image_path, 'WEBP', lossless=False, quality=82, method=2)
    payload = {'frames':data,'animations':animations,'meta':{'app':'LUMERIFT premium runtime v19','version':'1.11.35','image':image_path.name,'format':'RGBA8888','size':{'w':atlas.width,'h':atlas.height},'scale':'1','source':'Premium Art Direction v2; supersampled procedural production overlays','usage':'runtime overlay; v18 and established body Atlases remain fallback'}}
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return image_path, json_path


def main() -> None:
    player: list[tuple[str, Image.Image]] = []; player_anims: dict[str,list[str]] = {}
    for action in PLAYER_ACTIONS:
        for phase in PLAYER_PHASES:
            for direction in DIRECTIONS:
                key=f'premium.phase.v19.player.{direction}.{action}.{phase}'
                player.append((key, player_phase_frame(direction, action, phase)))
                player_anims.setdefault(f'premium.phase.v19.player.{direction}.{action}', []).append(key)

    monster: list[tuple[str, Image.Image]] = []; monster_anims: dict[str,list[str]] = {}
    for variant in MONSTER_VARIANTS:
        for phase in MONSTER_PHASES:
            for direction in MONSTER_DIRECTIONS:
                key=f'premium.limb.v19.monster.{variant}.{direction}.{phase}'
                monster.append((key, monster_direction_frame(variant, direction, phase)))
                monster_anims[key]=[key]

    core: list[tuple[str, Image.Image]] = []; core_anims: dict[str,list[str]] = {}
    for state,count in CORE_COUNTS.items():
        keys=[]
        for index in range(count):
            key=f'premium.core.v19.{state}.{index}'
            core.append((key,boss_core_frame(state,index,count))); keys.append(key)
        core_anims[f'premium.core.v19.{state}']=keys

    vfx: list[tuple[str, Image.Image]] = []; vfx_anims: dict[str,list[str]] = {}
    for kind in VFX_KINDS:
        keys=[]
        for index in range(4):
            key=f'premium.vfx.v19.{kind}.{index}'
            vfx.append((key,premium_vfx_frame(kind,index))); keys.append(key)
        vfx_anims[f'premium.vfx.v19.{kind}']=keys

    paths=[]
    paths += list(write_atlas('player','player_action_phases_v19',player,8,player_anims))
    paths += list(write_atlas('monsters','monster_direction_limb_v19',monster,8,monster_anims))
    paths += list(write_atlas('effects','boss_core_trails_v19',core,8,core_anims))
    paths += list(write_atlas('effects','premium_combat_vfx_v19',vfx,8,vfx_anims))

    SOURCE.mkdir(parents=True, exist_ok=True)
    for path in paths[::2]:
        (SOURCE/(path.stem+'_master.webp')).write_bytes(path.read_bytes())
    (SOURCE/'README.md').write_text(
        '# Premium Runtime v19 Source Masters\n\n'
        '- Player contact/sustain/recover action overlays: 72 frames / 24 animations.\n'
        '- Elite and boss directional head/limb overlays: 48 frames.\n'
        '- Boss core continuous trail loops: 36 frames / 5 animations.\n'
        '- Premium combat VFX: 24 frames / 6 animations.\n'
        '- v18 and established body Atlases remain fallback.\n'
        '- Final hand-painted full-body Atlas is still pending.\n', encoding='utf-8')
    for path in paths:
        print(path.relative_to(ROOT), path.stat().st_size)


if __name__ == '__main__':
    main()

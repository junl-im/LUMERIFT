from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/previews'
OUT.mkdir(parents=True,exist_ok=True)
player_img=Image.open(ROOT/'public/assets/live/v4/atlases/player/player_live_v4.webp').convert('RGBA')
player_json=json.loads((ROOT/'public/assets/live/v4/atlases/player/player_live_v4.json').read_text())
monster_img=Image.open(ROOT/'public/assets/live/v4/atlases/monsters/monsters_live_v4.webp').convert('RGBA')
monster_json=json.loads((ROOT/'public/assets/live/v4/atlases/monsters/monsters_live_v4.json').read_text())

def frame(image,data,name):
    f=data['frames'][name]['frame']
    return image.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']))

def place(base,sprite,x,y,scale):
    s=sprite.resize((int(sprite.width*scale),int(sprite.height*scale)),Image.Resampling.LANCZOS)
    base.alpha_composite(s,(int(x-s.width/2),int(y-s.height*0.82)))

def preview(bg_name,monster_names,out_name,accent):
    base=Image.open(ROOT/'public/assets/live/v4/backgrounds'/bg_name).convert('RGBA')
    glow=Image.new('RGBA',base.size,(0,0,0,0)); d=ImageDraw.Draw(glow,'RGBA')
    d.ellipse((70,410,470,760),outline=(*accent,90),width=4)
    d.ellipse((120,450,420,720),outline=(*accent,45),width=2)
    glow=glow.filter(ImageFilter.GaussianBlur(2)); base=Image.alpha_composite(base,glow)
    player=frame(player_img,player_json,'knight_00')
    place(base,player,270,705,0.74)
    positions=[(145,455,0.66),(385,470,0.70),(270,340,0.78)]
    for name,pos in zip(monster_names,positions): place(base,frame(monster_img,monster_json,name),*pos)
    # Compact HUD mock, no text: visual composition only.
    hud=Image.new('RGBA',base.size,(0,0,0,0)); hd=ImageDraw.Draw(hud,'RGBA')
    hd.rounded_rectangle((18,18,280,92),18,fill=(5,12,17,205),outline=(232,199,126,110),width=2)
    hd.rounded_rectangle((35,58,245,74),8,fill=(3,7,10,230))
    hd.rounded_rectangle((35,58,211,74),8,fill=(86,205,188,235))
    hd.rounded_rectangle((310,20,522,78),16,fill=(5,12,17,205),outline=(*accent,95),width=2)
    for cx,cy,r in [(476,835,57),(385,858,46),(294,884,41),(205,842,36)]:
        hd.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(5,12,17,220),outline=(*accent,150),width=4)
    base=Image.alpha_composite(base,hud)
    base.convert('RGB').save(OUT/out_name,'WEBP',quality=90,method=4)
    return base.convert('RGB')

images=[
preview('forest_approach_v4.webp',['monster_crawler_idle_00','monster_wisp_idle_00'],'v1.7.0_stage_approach_preview.webp',(114,222,209)),
preview('forest_ruins_v4.webp',['monster_brute_idle_00','monster_spitter_idle_00'],'v1.7.0_stage_ruins_preview.webp',(240,189,103)),
preview('forest_depths_v4.webp',['monster_shade_idle_00','monster_warden_idle_00','monster_mender_idle_00'],'v1.7.0_stage_depths_preview.webp',(185,111,244)),
preview('rift_core_v4.webp',['boss_harbinger_idle_00'],'v1.7.0_stage_boss_preview.webp',(255,83,103)),
]
contact=Image.new('RGB',(1080,1920),(3,7,10))
for idx,img in enumerate(images):
    contact.paste(img.resize((540,960),Image.Resampling.LANCZOS),((idx%2)*540,(idx//2)*960))
contact.save(OUT/'v1.7.0_art_unification_contact.webp','WEBP',quality=89,method=4)
print('generated',len(images)+1,'previews')

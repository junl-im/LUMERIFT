from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'previews'
OUT.mkdir(parents=True, exist_ok=True)
FONT_REG = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
FONT_BOLD = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'

def font(size: int, bold: bool = False):
    path = FONT_BOLD if bold else FONT_REG
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()

def cover(path: Path, size=(540, 960), dark=0.42):
    im = Image.open(path).convert('RGBA').resize(size, Image.Resampling.LANCZOS)
    overlay = Image.new('RGBA', size, (3, 8, 13, int(255 * dark)))
    return Image.alpha_composite(im, overlay)

def panel(draw, box, fill=(10, 20, 28, 222), outline=(205, 168, 91, 120), radius=18, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def title(draw, eyebrow, main, sub):
    draw.text((28, 34), eyebrow, font=font(14, True), fill=(111, 224, 201))
    draw.text((28, 60), main, font=font(31, True), fill=(246, 228, 179))
    draw.text((28, 106), sub, font=font(14), fill=(177, 194, 204))

def save(im, name):
    im.convert('RGB').save(OUT / name, 'WEBP', quality=90, method=4)

# Boss combat preview
im = cover(ROOT/'public/assets/live/v4/backgrounds/rift_core_v4.webp', dark=0.26)
d = ImageDraw.Draw(im, 'RGBA')
title(d, 'BOSS COMBAT · v1.8.0', '심연 폭주 · PHASE III', '보이는 위험 범위와 실제 판정이 같은 기하 데이터를 사용합니다.')
# cinematic band
panel(d, (18, 196, 522, 426), fill=(3, 8, 14, 236), outline=(255, 111, 134, 190), radius=14, width=3)
boss = Image.open(ROOT/'public/assets/live/v4/portraits/boss_phase_3_v4.webp').convert('RGBA').resize((204, 204), Image.Resampling.LANCZOS)
im.alpha_composite(boss, (36, 211))
d.text((257, 237), 'BOSS PHASE 3', font=font(15, True), fill=(255, 207, 107))
d.text((257, 274), '심연 폭주', font=font(28, True), fill=(255, 112, 136))
d.multiline_text((257, 322), '오라 3중\n카메라 줌 1.18×\nHit Stop · Shake', font=font(14), fill=(221, 230, 234), spacing=8)
# exact wedge telegraph
origin=(270, 658); radius=198
poly=[origin]
import math
for i in range(25):
    a=-math.pi/4 + (math.pi/2)*i/24
    poly.append((origin[0]+math.cos(a)*radius, origin[1]+math.sin(a)*radius))
poly.append(origin)
d.polygon(poly, fill=(255, 91, 115, 60))
d.line(poly, fill=(255, 111, 134, 230), width=5, joint='curve')
d.ellipse((origin[0]-18,origin[1]-18,origin[0]+18,origin[1]+18), fill=(111,224,201,240))
d.text((32, 848), 'AttackFootprint', font=font(18, True), fill=(111,224,201))
d.text((32, 882), '경고 · 충돌 · 타격 잔상이 같은 원점/방향/사거리/반각을 공유', font=font(12), fill=(210,220,225))
save(im, 'v1.8.0_boss_combat_preview.webp')

# Recovery preview
im = cover(ROOT/'public/assets/live/v4/backgrounds/lobby_forest_v4.webp', dark=0.55)
d = ImageDraw.Draw(im, 'RGBA')
title(d, 'CLOUD SAVE · v1.8.0', '저장 복구 지점', '덮어쓰기 위험 작업 전 로컬 상태를 UID별 최대 5개 보관합니다.')
panel(d,(24,154,516,236),fill=(8,17,24,230),outline=(111,224,201,130))
d.text((42,174),'복구 지점 3 / 5',font=font(18,True),fill=(242,213,138))
d.text((42,207),'현재 상태 백업 · 브라우저 로컬 보관',font=font(12),fill=(174,193,203))
rows=[('클라우드 다운로드 전','Lv.12 · Stage 8 · Gold 12,450','07.28 09:18'),('자동 병합 전','Lv.11 · Stage 7 · Gold 10,230','07.28 08:42'),('로그아웃 전','Lv.10 · Stage 6 · Gold 8,910','07.27 22:15')]
for i,(reason,summary,dt) in enumerate(rows):
    y=258+i*152
    panel(d,(24,y,516,y+132),fill=(10,20,28,230),outline=(205,168,91,120 if i else 190))
    d.text((42,y+18),reason,font=font(16,True),fill=(244,218,157) if i==0 else (229,236,238))
    d.text((42,y+53),summary,font=font(13),fill=(174,193,203))
    d.text((42,y+82),dt,font=font(11),fill=(124,148,160))
    d.rounded_rectangle((392,y+18,488,y+60),radius=10,fill=(31,94,86,230),outline=(111,224,201,180),width=2)
    d.text((422,y+28),'복원',font=font(12,True),fill=(238,247,244))
    d.rounded_rectangle((392,y+72,488,y+112),radius=10,fill=(91,35,47,220),outline=(255,111,134,150),width=2)
    d.text((422,y+81),'삭제',font=font(12,True),fill=(255,224,229))
d.text((28, 894), '※ 브라우저 데이터 삭제 시 로컬 복구 지점도 삭제됩니다.', font=font(11), fill=(177,194,204))
save(im, 'v1.8.0_recovery_preview.webp')

# Season ranking preview
im = cover(ROOT/'public/assets/live/v4/backgrounds/lobby_forest_v4.webp', dark=0.62)
d = ImageDraw.Draw(im, 'RGBA')
title(d, 'RANKING · v1.8.0', '균열 시즌 1', 'UTC 월요일 기준 28일 시즌 · 실시간 리스너 없이 스냅샷 조회')
for x,label,active in [(28,'전체',False),(197,'주간',False),(366,'시즌',True)]:
    d.rounded_rectangle((x,154,x+146,212),radius=13,fill=(29,91,83,240) if active else (12,25,34,230),outline=(111,224,201,200) if active else (117,137,147,100),width=2)
    d.text((x+51,172),label,font=font(15,True),fill=(244,226,176) if active else (185,200,207))
panel(d,(24,234,516,832),fill=(7,15,22,232),outline=(205,168,91,150))
d.text((42,255),'2026.07.06 – 2026.08.02',font=font(14,True),fill=(242,213,138))
d.rounded_rectangle((350,248,492,286),radius=12,fill=(31,94,86,230),outline=(111,224,201,150),width=2)
d.text((374,258),'MY RANK #7',font=font(12,True),fill=(236,247,243))
rankings=[('1','RiftWolf','ST 10','42,180'),('2','루멘검사','ST 10','40,960'),('3','Ashen','ST 9','37,430'),('7','계승자','ST 8','31,240'),('8','Mistborn','ST 8','30,880'),('9','NOVA','ST 7','28,110')]
for i,(rank,name,stage,score) in enumerate(rankings):
    y=310+i*76
    selected=rank=='7'
    d.rounded_rectangle((38,y,502,y+58),radius=12,fill=(27,60,60,230) if selected else (12,24,32,220),outline=(111,224,201,180) if selected else (118,138,148,80),width=2)
    d.text((54,y+17),f'#{rank}',font=font(14,True),fill=(242,213,138) if int(rank)<=3 else (172,190,199))
    d.text((108,y+17),name,font=font(14,True if selected else False),fill=(245,224,169) if selected else (228,235,238))
    d.text((318,y+19),stage,font=font(12),fill=(166,185,195))
    d.text((422,y+17),score,font=font(13,True),fill=(111,224,201))
d.text((38, 798), 'Firestore 스냅샷 · 시즌 ID S01_2026-07-06', font=font(11), fill=(147,168,179))
save(im, 'v1.8.0_season_ranking_preview.webp')

# Contact sheet
names=['v1.8.0_boss_combat_preview.webp','v1.8.0_recovery_preview.webp','v1.8.0_season_ranking_preview.webp']
contact=Image.new('RGB',(1620,960),(4,8,12))
for i,name in enumerate(names):
    contact.paste(Image.open(OUT/name).convert('RGB'),(i*540,0))
contact.save(OUT/'v1.8.0_feature_contact.webp','WEBP',quality=90,method=4)
print('PASS v1.8.0 previews generated')

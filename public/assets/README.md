# LUMERIFT Runtime Assets

게임 런타임 이미지는 PNG/WebP만 허용한다. SVG 및 런타임 SVG 생성은 금지한다.

## v0.7.0 번들

- `atlases/ui`: 앱 공통 NineSlice UI 스킨
- `atlases/player`: 8방향 플레이어 전투 애니메이션
- `atlases/monsters`: 일반·정예·보스 공통 애니메이션
- `atlases/effects`: Slash·Nova·Hit·Explosion·Dodge VFX
- `atlases/items`: 장비 9종 아이콘
- `maps/chapter1`: Chapter 1 WebP 전투 배경
- `audio/ui`: OGG UI 효과음
- `audio/combat`: OGG 공격·피격·스킬·회피 효과음
- `audio/bgm`: Opus 배경 음악

시각 리소스는 최종 상용 아트가 아니라 Atlas 규격, 런타임 애니메이션, Lazy Loading과 메모리 해제를 검증하기 위한 제작 기준 에셋이다.

## v0.8.0 메가팩

- `MEGAPACK_V080_SUMMARY.json`: 분류별 제작 수량과 단계
- `atlases/items/mega_items_v1.*`: 160개 아이템
- `atlases/skills/skill_icons_v1.*`: 80개 스킬
- `atlases/status/status_icons_v1.*`: 48개 상태 효과
- `atlases/ui/ui_icons_v2.*`: 96개 UI 아이콘
- `atlases/bestiary/bestiary_portraits_v1.*`: 48개 도감 초상
- `atlases/npc/npc_portraits_v1.*`: 32개 NPC 초상
- `atlases/environment/environment_props_v1.*`: 120개 환경 오브젝트
- `atlases/effects/effects_mega_v1.*`: 24개 VFX 애니메이션
- `atlases/emblems/emblems_v1.*`: 64개 문장
- `atlases/tutorial/tutorial_glyphs_v1.*`: 40개 튜토리얼 글리프

현재 메가팩은 최종 상용 원화가 아닌 production-structure 단계다.

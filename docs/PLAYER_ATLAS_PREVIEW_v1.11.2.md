# 플레이어 전용 런타임 Atlas 미리보기 v1.11.2

## 목적

v1.11.1의 LUMERIFT 소유 8방향 모션 블록아웃을 PixiJS 8 Spritesheet 계약으로 변환해 실제 런타임에서 선택적으로 검수한다.

## 적용 방식

- 기본값: `detail` — 기존 고급 플레이어 원화 유지
- 선택값: `owned-preview` — LUMERIFT 소유 기하형 모션 미리보기
- 설정 화면에서 선택하며 다음 전투부터 적용한다.
- `player-owned-preview` 번들로 Lazy Loading한다.
- `core-ui`와 기본 `battle-chapter-1` 번들에는 포함하지 않는다.

## Atlas 계약

- 이미지: `public/assets/live/v6/atlases/player/player_owned_motion_v6.webp`
- JSON: `public/assets/live/v6/atlases/player/player_owned_motion_v6.json`
- 128 프레임, 80 애니메이션 키
- 방향: S, SE, E, NE, N, NW, W, SW
- 런타임 상태: idle, run, attack1~3, skill1~2, hit, death, dodge
- 실제 서쪽 방향 프레임을 사용하므로 미러링을 끈다.

## 품질 제한

이 Atlas는 방향·피벗·전환·모바일 식별성을 검수하기 위한 1차 런타임 승격본이다. 최종 수작업 캐릭터 원화나 상용 완성 애니메이션으로 보고하지 않는다.

# Premium Directional Body v1.11.19

## 목적

v1.11.18까지의 캐릭터는 기존 본체 위에 프리미엄 FX와 장비 재질을 합성했다. v1.11.19는 기본 전투 경로를 전용 제작 파이프라인으로 생성한 8방향 본체 Atlas v10으로 교체한다.

## 런타임 자산

- `public/assets/live/v10/atlases/player/player_premium_body_v10.webp`
- `public/assets/live/v10/atlases/player/player_premium_body_v10.json`
- 8방향 × 10상태
- 648프레임, 80애니메이션
- `player.<state>.<direction>` 키 계약 유지

## 제작 원본

- `art_source/lumerift_original/v1.11.19/character/player_premium_body_v10_master.png`
- `art_source/lumerift_original/v1.11.19/character/player_premium_body_v10_spec.json`
- `tools/build_premium_character_v119.py`

본 Atlas는 기존 재배포 가능 플레이어 자산을 기반으로 방향 실루엣, 갑주 윤곽, 망토, 룬, 무기 에너지를 재가공한 production-candidate 파생물이다. 최종 수작업 AAA 원화 승인본으로 기록하지 않는다.

## 호환성

- 레거시 v4 플레이어 Atlas는 비상 fallback과 라이선스 근거를 위해 유지한다.
- Player Save v4, 이동 벡터, 충돌, 피해 판정, `AttackFootprint`는 변경하지 않는다.
- v6/v7 원화 후보는 설정에서 선택 가능한 Lazy Loading 경로로 유지한다.

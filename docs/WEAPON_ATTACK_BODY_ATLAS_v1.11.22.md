# Weapon Attack Body Atlas v1.11.22

## 구성

- 런타임 WebP: `public/assets/live/v11/atlases/player/player_weapon_attack_body_v11.webp`
- 런타임 JSON: `public/assets/live/v11/atlases/player/player_weapon_attack_body_v11.json`
- 모바일 제작용 PNG 마스터: `art_source/lumerift_original/v1.11.22/character/player_weapon_attack_body_v11_master.png`
- 제작 규격: `art_source/lumerift_original/v1.11.22/character/player_weapon_attack_body_v11_spec.json`
- 재생성 도구: `tools/generate_weapon_attack_atlas_v11.py`

## 런타임 계약

- 무기 계열: 균열검 `blade`, 대검 `greatblade`, 균열 장창 `riftlance`
- 공격: `attack1`, `attack2`, `attack3`
- 방향: 북·북동·동·남동·남·남서·서·북서
- 애니메이션당 6프레임
- 총 432프레임·72애니메이션
- 키: `weapon_body.<family>.<attack>.<direction>`

`WeaponBodyAttackFrames`는 공격 포즈에서 v11 전용 Atlas를 먼저 조회한다. Atlas가 없거나 대체 플레이어 원화를 선택한 경우 기존 v10 본체 프레임 레시피를 사용한다.

## 제작 상태

본 자산은 `player_premium_body_v10`을 기반으로 무기 계열별 실루엣·접촉광·타격 프레임을 합성한 production-candidate 파생 자산이다. 최종 수작업 캐릭터 원화 또는 최종 상용 애니메이션으로 주장하지 않는다.
- 전체 public 런타임 자산은 10.58MB로 15MB 상한 이내이며, 초기 core-ui 로드와 전투 전용 Lazy Loading을 분리한다.

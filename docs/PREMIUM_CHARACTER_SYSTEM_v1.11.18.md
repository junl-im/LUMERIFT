# Premium Character System v1.11.18

## 목적
기존 플레이어 본체 Atlas를 유지하면서 캐릭터 실루엣과 재질 표현을 고급화한다. 전투 판정·이동·저장 데이터는 변경하지 않는다.

## 런타임 자산
- `public/assets/live/v9/atlases/player/player_character_fx_v9.webp`
- `public/assets/live/v9/atlases/player/player_character_fx_v9.json`

Atlas는 8방향과 4상태를 조합한 32프레임으로 구성한다.

- 방향: N, NE, E, SE, S, SW, W, NW
- 상태: idle, attack, skill, dodge
- 표현: 망토 실루엣, 머리카락 보조선, 갑주 하이라이트, 가슴 룬, 무기 에너지, 상태별 잔상

## 합성 순서
1. 발밑 오라와 그림자
2. 캐릭터 FX 후면 레이어
3. 기존 플레이어 본체 Atlas
4. v1.11.17 프리미엄 재질 오버레이
5. 캐릭터 FX 전면 가산 레이어
6. 공격 궤적과 모션 악센트

본체 Atlas를 교체하지 않으므로 기존 8방향 애니메이션 키와 서쪽 미러링 정책을 유지한다.

## 상태 프로필
`CharacterStateMaterialProfile`이 공격·스킬·회피·일반 상태를 v9 FX 행으로 변환한다. Overdrive와 Drive 비율은 투명도와 크기에만 영향을 주며 전투 수치에는 영향을 주지 않는다.

## 제한
실제 Android·iOS 기기에서 작은 화면 발광 강도와 겹침 여부는 별도 캡처 검수가 필요하다.

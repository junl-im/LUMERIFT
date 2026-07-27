# Asset Bible

## 허용 포맷

- PNG: 마스터 또는 투명 품질이 중요한 리소스
- WebP: 실제 런타임 기본 리소스
- JSON: Atlas와 데이터
- OGG: 효과음
- Opus: 배경음

## 금지

- SVG / SVGZ
- JPG / GIF / BMP / TIFF 게임 리소스
- PSD 직접 배포
- AI 생성 원본 무검수 사용

## 기본 파이프라인

PSD → PNG Master → WebP → Atlas → 실기기 확인

## Atlas 경계

- 캐릭터
- 지역별 몬스터
- 지역별 보스
- 공통 UI
- 로비 UI
- 전투 UI
- 속성별 스킬
- 지역별 맵
- 아이템

## 캐릭터

MVP는 8방향이다. 몸과 기본 의상을 통합하고 무기 레이어를 우선 분리한다. 얼굴 세부 레이어는 로비에서만 사용한다.

## 최종 검수

- 시점
- 조명
- 비율
- 손과 무기
- 알파 경계
- 축소 가독성
- Atlas Bleeding
- 실제 기기 메모리

## v0.6.0 런타임 Atlas 규격

플레이어 애니메이션 키는 `player.{state}.{direction}`으로 고정한다.

- 상태: idle, run, attack1, attack2, attack3, skill1, skill2, hit, death, dodge
- 방향: n, ne, e, se, s, sw, w, nw
- 각 상태·방향은 최소 3프레임

몬스터 애니메이션 키는 `monster.{rank}.{state}`로 고정한다.

- 등급: normal, elite, boss
- 상태: idle, move, attack, hit, die, roar

v0.6.0 제작 기준 이미지는 최종 상용 아트가 아니며, 향후 최종 에셋 교체 시에도 파일 경로와 애니메이션 키 계약을 유지한다.


## v0.7.0 VFX·장비 Atlas 규격

- 전투 VFX 키: `effect.slash`, `effect.nova`, `effect.hit`, `effect.explosion`, `effect.dodge`
- 장비 아이콘 키: `item.<itemId>`
- 장비 9종은 무기·방어구·장신구 데이터 ID와 1:1로 대응한다.
- VFX와 장비 Atlas는 전투 번들에 포함하며 장비 Atlas는 인벤토리·로비용 독립 번들도 제공한다.
- 최종 아트 교체 시 JSON 키, 프레임 경계와 파일 경로를 유지한다.

## v0.8.0 메가팩 계약

- 메가팩은 재생성 가능한 `production-structure` 자산이다.
- 총 10개 신규 Atlas와 830개 이상의 신규 프레임을 제공한다.
- 최종 상용 아트 교체 시 파일 경로와 프레임 키를 유지한다.
- `tools/generate_asset_megapack_v080.py`가 원본 생성 규칙이다.
- 대규모 Atlas는 초기 다운로드에 직접 포함하지 않고 별도 Bundle로 Lazy Loading한다.

# 런타임 에셋 시스템

## 번들

### core-ui

- UI Sprite Atlas
- UI 클릭 효과음
- 앱 실행 동안 유지

### battle-chapter-1

- 플레이어 Sprite Atlas
- 일반·정예·보스 공통 Monster Atlas
- Chapter 1 WebP 배경
- 전투 진입 시 Lazy Loading
- 전투 종료 시 참조 카운트 감소 및 자동 해제

## 애니메이션 키 규칙

플레이어:

`player.{state}.{direction}`

방향은 `n`, `ne`, `e`, `se`, `s`, `sw`, `w`, `nw`를 사용한다.

몬스터:

`monster.{rank}.{state}`

등급은 `normal`, `elite`, `boss`를 사용한다.

## 오디오 규칙

- UI·전투 효과음: OGG
- 배경 음악: Opus
- 첫 사용자 입력 이후 AudioContext 활성화
- 동일 음원은 템플릿을 캐시하고 효과음은 cloneNode로 동시 재생
- 씬 종료 시 BGM과 전투 효과음 캐시 해제

## 금지 사항

- SVG 및 런타임 SVG 생성
- JPG·GIF·BMP·TIFF 사용
- Scene 내부에서 Asset URL 임의 조합
- 해제하지 않는 지역·전투 전용 번들
- 전체 월드 리소스 선로딩


## v0.7.0 로딩·준비·해제 흐름

1. Scene이 필요한 Bundle을 진행률 콜백과 함께 요청한다.
2. AssetManager가 URL 단위로 로딩하고 참조 수를 증가시킨다.
3. 전투 Atlas의 대표 Texture를 화면 밖 Sprite로 2프레임 유지해 GPU 준비를 유도한다.
4. Scene 종료 시 음원 캐시와 Bundle 참조를 해제한다.
5. 참조 수가 0이 된 URL만 Pixi Assets에서 unload한다.

로비, 인벤토리와 전투가 같은 장비 Atlas를 사용할 때 참조 카운트로 중복 해제를 방지한다.

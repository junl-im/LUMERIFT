# Performance Budget

## 목표

- 기본 60FPS
- 절전 30FPS
- 초기 dist 15MB 이하
- 동일 스테이지 반복 시 메모리 지속 증가 없음

## 자동 검사

- `npm run validate:assets`
- `npm run validate:bundle`

## 프로파일링 항목

- 평균 FPS와 1% low
- 긴 Task
- Draw Call
- Texture GPU Memory
- JS Heap
- 씬 전환 전후 메모리
- 첫 입력 가능 시간
- 초기 다운로드 전송량

## 품질 단계

High:
- 60FPS
- 파티클 전체
- DPR 최대 2

Medium:
- 60FPS 목표
- 파티클 감소
- 배경 애니메이션 감소

Low:
- 30FPS
- 파티클과 후처리 최소
- 내부 렌더 해상도 하향

## v0.6.0 리소스 수명 정책

- `core-ui`: 앱 수명 동안 유지
- `battle-chapter-1`: BattleScene 수명 동안 유지
- 배경 음악: 전투 종료 시 정지
- 전투 효과음 캐시: 전투 종료 시 제거
- Atlas JSON과 Texture: AssetManager 참조 수가 0이 되면 unload

`npm run report:assets`로 초기 입력 예산과 확장자별 용량을 확인한다.


## v0.7.0 전투 품질 자동 축소

- `particleMultiplier`로 짧은 Hit VFX 생성 빈도를 단계별 제한한다.
- `backgroundAnimationRate`로 로비 오라와 전투 배경 회전을 조절한다.
- 저사양 모드에서는 배경 애니메이션을 중단하고 파티클 밀도를 약 36% 수준으로 낮춘다.
- 판정, 피해량, 쿨다운과 보스 페이즈 로직은 품질 설정의 영향을 받지 않는다.
- Atlas 첫 텍스처를 화면 밖에 짧게 배치하여 전투 시작 직후 GPU 업로드 지연을 완화한다.

## v0.8.0 대규모 자산 정책

- 전체 자산 소스가 증가해도 초기 로드 대상은 core-ui와 현재 씬 필수 번들로 제한한다.
- 에셋 보관소는 진입 시 전용 메가팩 번들을 로드하고 이탈 시 참조를 해제한다.
- 지역 배경은 챕터 단위 Bundle로 분리한다.
- `report:inventory`와 `report:assets`를 함께 실행해 총량과 초기 예산을 분리 관리한다.

## v0.9.0 고용량 원본·런타임 분리

- 고해상도 PNG 원본 약 458.36MiB는 `art_source`에 보관하며 Vite 배포에서 제외한다.
- 런타임 품질팩 약 12.31MiB는 10개 카테고리 번들로 분리한다.
- 에셋 품질 보관소는 한 번에 하나의 카테고리만 로드한다.
- 카테고리 이동 시 이전 번들을 해제해 GPU·브라우저 메모리 누적을 방지한다.
- 초기 부트·로그인·로비 번들에는 신규 품질팩을 포함하지 않아 초기 15MB 목표를 유지한다.

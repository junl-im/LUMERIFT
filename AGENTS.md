# LUMERIFT 작업자 절대 규칙

이 파일은 사람·AI·자동화 작업자가 프로젝트를 이어받을 때 가장 먼저 읽는 진입점이다.

## 시작 전 필수 순서

1. `docs/MASTER_BIBLE.md`를 읽는다.
2. `docs/HANDOFF_MASTER.md`를 읽는다.
3. `HANDOFF_STATE.json`에서 현재 버전, 완료·진행·예정 상태를 확인한다.
4. `docs/HANDOFF_LOG.md`의 마지막 릴리스 기록을 확인한다.
5. 기존 기능·파일을 임의로 삭제하거나 축소하지 않는다.

## 종료 전 필수 순서

모든 기능 패치와 에셋 패치는 아래 파일을 반드시 갱신한다.

- `HANDOFF_STATE.json`
- `docs/HANDOFF_MASTER.md`
- `docs/HANDOFF_LOG.md`
- `docs/CHANGELOG.md`
- `docs/ROADMAP.md`
- `RELEASE_MANIFEST.json`
- `README.md`

그리고 `npm run validate:handoff`와 전체 검증을 실행한다.

## 절대 고정 조건

- 게임명: **LUMERIFT: 균열의 계승자**
- Vite + TypeScript + PixiJS 8 + Firebase
- GitHub Pages 배포
- 모바일 웹 우선, 세로형 9:16, 2.5D 쿼터뷰
- PNG/WebP만 허용, SVG·런타임 SVG 생성 금지
- 기본 60FPS, 절전 30FPS
- 초기 다운로드 15MB 이하 목표
- Texture Atlas, Lazy Loading, Object Pool 우선
- 최종 상용 아트 교체 시에도 런타임 키와 경로 계약 유지
- MVP 완료 전 실시간 MMO·PvP·길드전·거래소·글로벌 채팅 추가 금지

## 릴리스 보고 형식

사용자에게 결과를 전달할 때 반드시 다음 순서를 지킨다.

1. 결과
2. 전체 통합 ZIP
3. 덮어쓰기용 패치 ZIP
4. 다음 업데이트 내용

## 패치 정책

- 전체 통합 ZIP은 신규 설치와 전체 교체용이다.
- 패치 ZIP은 v0.1.0 기준 누적 패치로 유지한다.
- 최신 직전 버전에도 덮어쓰기 가능한지 대조 검증한다.
- 삭제 대상은 `PATCH_DELETE_LIST.txt`에 기록한다.
- 패치 적용 결과는 전체 통합본과 파일 해시가 일치해야 한다.

## 문서 우선순위

충돌 시 우선순위는 다음과 같다.

1. `docs/MASTER_BIBLE.md`
2. `AGENTS.md`
3. `docs/HANDOFF_MASTER.md`
4. `HANDOFF_STATE.json`
5. 시스템별 세부 문서
6. 소스 코드 주석

## 에셋 단계 표기

현재 자동 생성 에셋은 제작 규격과 런타임 검증용이다. 최종 상용 원화로 주장하지 않는다. 모든 신규 자산은 다음 중 하나로 표시한다.

- `prototype`: 임시 기능 검증
- `production-structure`: 경로·Atlas·성능 계약 검증 완료
- `final-candidate`: 수작업 검수와 상용 후보
- `final-approved`: 최종 승인

# LUMERIFT 인수인계 누적 로그

이 문서는 삭제하지 않고 릴리스별로 계속 추가한다.

## v0.1.0

- Vite + TypeScript + PixiJS 8 기반 프로젝트 생성
- Boot → Login → Lobby → Battle → Result 기본 흐름
- GitHub Pages와 Firebase 연결 계층 구성

## v0.2.0 ~ v0.4.0

- 전투 상태기계, 3연속 공격, 스킬, 회피
- 몬스터·정예·보스 FSM과 장비·인벤토리
- 저장 데이터 마이그레이션 기반

## v0.5.0

- 1-1~1-10 스테이지
- 메인·일일 퀘스트와 튜토리얼
- 최초·반복 보상, 해금, 저장 데이터 v3

## v0.6.0

- 8방향 플레이어 Sprite Atlas
- 몬스터·UI·장비 런타임 Atlas
- OGG·Opus 오디오와 리소스 해제

## v0.7.0

- 모바일 조이스틱과 원형 쿨다운 HUD
- 보스 3페이즈와 VFX Pool
- 로비 애니메이션, 씬 페이드, 품질 자동 축소

## v0.8.0

- 총 1,174 Atlas 프레임과 127 애니메이션으로 자산 기반 확대
- 아이템·스킬·상태·UI·도감·NPC·환경·VFX·배지·튜토리얼 메가팩
- 5개 지역 15개 배경, 8개 로딩 아트, 3개 브랜드 자산
- 신규 오디오 36개
- 에셋 보관소 런타임 갤러리
- `AGENTS.md`, `HANDOFF_STATE.json`, `HANDOFF_MASTER.md`, `HANDOFF_LOG.md` 도입
- 인수인계 자동 검증을 릴리스 필수 조건으로 고정

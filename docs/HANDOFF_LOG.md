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

## v0.9.0

- v0.8 에셋이 기술 구조 검증에는 적합하지만 시각 품질·용량 기준에는 부족했음을 공식 기록
- 신규 품질 Atlas 26개, 1,300프레임, 32 VFX 애니메이션 추가
- 영웅 8, 보스 12, NPC 16 초상 후보 추가
- 아이템 384, 스킬 160, 환경 오브젝트 240, UI 96 추가
- 5개 지역 키아트 10종과 전투 배경 15종 추가
- 런타임 WebP 12.31MiB와 고해상도 PNG 원본 458.36MiB 분리
- 에셋 품질 보관소를 분류별 Lazy Loading 구조로 변경
- `production-candidate-procedural` 품질 단계 도입
- `validate:art` 품질·용량·과장 보고 방지 검사 추가
- Firebase 운영 기반을 v0.10.0으로 이동


## v0.9.1

- GitHub Actions에서 발생한 `vite.config.ts TS2769` 원인 확인
- Vite 8 비호환 `manualChunks` 객체 형식을 함수 형식으로 교체
- checkout/setup-node를 v5, configure-pages를 v6, upload-pages-artifact를 v4로 갱신
- CI Node.js를 24로 변경
- `validate:config` 추가 및 typecheck 조기 실행 적용

## v1.0.0

- 기존 절차형 자산이 실제 게임용 품질 기대를 충족하지 못했음을 기록하고 기본 런타임에서 제외
- CC0·CC BY·CC BY-SA·CC BY 4.0 공개 라이선스 원본 8개 그룹 확보
- 실제 판타지 배경·영웅 초상·보스 초상을 로비와 전투에 연결
- Isometric Knight 플레이어 Atlas와 FLARE 몬스터 8종 Atlas 연결
- 몬스터별 Idle·Move·Attack·Hit·Die·Roar 애니메이션 키 적용
- 금속·유리 질감 NineSlice UI 18종과 로비·보스 HUD 리빌드
- 제3자 출처·라이선스·가공 범위 문서 및 NOTICE 추가
- `validate:liveart`와 로비·전투 미리보기 추가
- 품질 단계를 `production-candidate-open-art-pass`로 정의
- 누적 45 Atlas·2,828프레임·305애니메이션으로 갱신

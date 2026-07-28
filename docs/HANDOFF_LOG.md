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
- 런타임 WebP 12.31MB와 고해상도 PNG 원본 458.36MB 분리
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


## 2026-07-27 · v1.0.1

- v1.0.0의 약 480MB 원본·레거시 보관 자산을 기본 배포본에서 제외했다.
- 에셋 보관소를 실사용 4개 범주로 축소했다.
- 런타임 매니페스트와 Atlas 검증을 활성 자산 기준으로 재작성했다.
- MB 표기 규칙과 패치 삭제 자동화 규칙을 추가했다.

## 2026-07-27 · v1.0.2

- GitHub Actions typecheck에서 발견된 BattleActorView TS6133 오류를 복구했다.
- `_deltaSeconds`로 의도적 미사용을 명시하고 불필요한 `combat` 선언을 제거했다.
- 다음 작업은 v1.1.0 인벤토리·스테이지·결과 UI 2차 리빌드다.


## 2026-07-27 · v1.0.3

- v1.0.2 전체본의 과도한 축소 문제 확인
- 누락된 고해상도 원본·공개 원본·레거시 제작 후보 자산 복원
- 전체 통합본은 모든 프로젝트 자산을 보존한다는 절대 규칙 추가
- 경량본은 RUNTIME/DEPLOY 별도 패키지로만 제공하도록 변경
- 다음 작업은 v1.1.0 UI·아트 2차 리빌드

## 2026-07-27 · v1.1.0

- 모바일 웹게임에 불필요한 LUMERIFT 소유 원본 초고해상도를 용도별 제작 해상도로 축소했다.
- art_source 전체 용량을 약 76.46MB로 조정했고 제3자 공개 원본은 원형을 보존했다.
- 인벤토리·스테이지 선택·전투 결과 화면을 기존 실사용 UI Atlas 기반으로 2차 리빌드했다.
- BAT 파일은 필수가 아닌 Windows 선택 도구로 확정했다.
- `docs/SOURCE_ART_POLICY.md`, `scripts/validate-source-art.mjs`, `tools/optimize_source_art.py`를 추가했다.

## 2026-07-27 · v1.2.0

- 모든 UI와 그래픽을 기능 단위가 아니라 화면 구조 단위로 재점검했다.
- 로비·전투·인벤토리·스테이지·결과 화면을 공통 Obsidian·Gold·Teal 체계로 재구성했다.
- 플레이어와 몬스터 기본 Atlas에 공통 색·대비·윤곽 보정을 적용했다.
- 전투 HP 바의 표시 좌표와 실제 갱신 좌표 불일치를 수정했다.
- Visual Audit, 5개 미리보기, 시각 계약 자동 검사를 릴리스 기준에 추가했다.
- 독점 최종 원화가 아니라는 제한을 유지하고 다음 작업을 전용 8방향 아트 제작으로 지정했다.

## 2026-07-27 · v1.3.0

- 공지·출석·우편·쿠폰 통합 운영실 추가
- 로비 소식 메뉴와 알림 개수 연결
- 운영 UI WebP Atlas 12프레임 및 모바일 제작용 원본 추가
- 주간 출석, 우편 개별·일괄 수령, 쿠폰 만료·중복 검증 구현
- Player Save v4와 v1~v3 자동 마이그레이션 적용
- 퀘스트 카드에 공통 패널·상태 배지·진행 바 적용
- Safe Area·동적 뷰포트·가상 키보드 높이 대응
- 운영 화면 미리보기 4종과 운영·모바일 자동 검사 추가
- 다음 작업은 Firebase 원격 운영·Cloud Save·전용 캐릭터 아트다.
- LUMERIFT 전용 8방향 플레이어·Chapter 1 몬스터의 셀 크기, 피벗, 색·광원, 모션 프레임 계약을 `docs/ART_DIRECTION_v1.3.0.md`로 확정했다.

## 2026-07-27 · v1.4.0

- Firebase project `lumerift-8db07` Web Config를 소스 기본값으로 연결했다.
- 익명·Google·이메일 로그인과 익명 계정 승격을 구현했다.
- 로그인 세션 복원, IndexedDB Firestore 캐시, 로컬 우선 Cloud Save 재시도 대기열을 추가했다.
- 원격 공지 조회·15분 캐시·내장 공지 폴백을 추가했다.
- App Check 선택 초기화, Analytics 지연 초기화, Emulator 연결을 추가했다.
- 사용자 UID 격리와 쿠폰 경로 차단을 포함한 Firestore Rules 및 복합 Indexes를 작성했다.
- 무료 Spark 단계에서는 쿠폰·고가치 우편·서버 시간 출석을 클라이언트 최종 승인하지 않는 원칙을 확정했다.

## v1.4.1

- Firebase Rules·Indexes 배포 스크립트 누락 복구
- `--only firestore` 공식 부분 배포 방식으로 통일
- 로컬 프로젝트 루트 및 package.json 버전 확인 절차 추가

## 2026-07-27 · v1.4.2

- 사용자 결정에 따라 Firebase App Check를 완전히 비활성화했다.
- 런타임 import, reCAPTCHA 키 환경변수, GitHub Actions Secret 주입을 제거했다.
- `validate:firebase`가 App Check 코드 재도입을 자동으로 차단하도록 변경했다.
- Authentication·Firestore·Cloud Save·Analytics는 유지한다.


## 2026-07-27 · v1.5.0

- 계정 및 Cloud Save 관리 화면 추가
- 익명 계정 Google·이메일 연결 UI 추가
- 이메일 인증 메일, 비밀번호 재설정, 로그아웃 추가
- 로컬·클라우드 저장 원본 비교, 충돌 표시, 수동 업로드·다운로드 추가
- Cloud Save 상태 구독, 마지막 성공 시각, 대기열 개수 표시 추가
- 전체·주간 랭킹과 내 순위 집계 추가
- weeklyRankings 보안 규칙과 복합 색인 추가
- Firebase Emulator 기반 권한 테스트 스크립트 추가
- App Check 비활성화 결정 유지
- 다음 작업은 랭킹 시즌 UI, 저장 복구 이력, 독점 플레이어·몬스터 아트다.

## 2026-07-27 · v1.6.0

- public/assets 209개 실파일과 빈 파일 4개를 전수 분석했다.
- 실제 런타임 매니페스트와 필수 검증·라이선스 파일 27개·3.90MB만 public에 유지했다.
- 레거시·품질 후보·미사용 지역 자산 182개·19.70MB를 전체 통합본의 art_source/runtime_archive로 이동했다.
- 활성 6 Atlas·412프레임·151애니메이션과 보관 43 Atlas·2,794프레임·300애니메이션을 분리 기록했다.
- SHA-256 레지스트리, 이동 계획, idempotent 이동 스크립트, public 배포 예산 검사를 추가했다.
- Firebase 계정·Cloud Save·랭킹과 App Check 비활성화 상태는 변경하지 않았다.


## 2026-07-27 · v1.7.0

- 플레이어·몬스터 실사용 Atlas에 공통 외곽선·림라이트·종별 팔레트 적용
- VFX 5종을 8프레임·총 40프레임으로 교체
- Chapter 1 전투 배경 4단계와 StageVisualProfile 적용
- 보스 3페이즈 초상 전환 적용
- 기존 v2 실사용 아트와 VFX 10개 파일을 v1.7 런타임 아카이브로 이동
- 미리보기 5종·아트 계약 검증·패치 이동 검증 추가

## 2026-07-28 · v1.8.0

- AttackFootprint 기반 경고·충돌·타격 범위 동기화
- 보스 3페이즈 전환 시네마틱·오라·줌·흔들림
- Cloud Save 로컬 복구 지점과 복구 화면
- 28일 시즌 랭킹·Firestore 규칙·색인
- App Check 비활성화 유지


## 2026-07-28 · v1.8.1

- GitHub Actions에서 확인된 `src/ui/VirtualJoystick.ts(41,18)` TS2345 오류를 수정했다.
- PixiJS 8 가이드 선 렌더링을 `moveTo/lineTo` 후 `stroke({...})` 방식으로 통일했다.
- `validate:source`에 객체형 `lineStyle()` 회귀 차단 검사를 추가했다.
- 게임 기능·에셋·Firebase 규칙은 변경하지 않았다.

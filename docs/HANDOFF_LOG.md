## 2026-07-30 · v1.11.16
- 최근 자동 전투 결과를 Player Save와 분리된 로컬 기록으로 최대 18건 저장
- 프리셋 연구소에서 자동 전투 기록 분석 화면 진입 및 성과 비교
- 보스 회피 JSON v2 HUD 아이콘·단계별 색상·안전 이동 안내 연결
- 8방향별 공격 자세·무기 궤적 프로필과 VFX 차등화
- v1.11.11·v1.11.14·v1.11.15 누적 검증기 호환성 보강

- v1.11.11 hotfix: 가상 조이스틱 기본 반전 제거 및 화면 기준 이동 복구

- 2026-07-29: v1.11.10 초초 대규모 디자인·에셋 리뉴얼 패치 적용
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

## 2026-07-28 · v1.9.0

- 첫 실행 Boot·타이틀·로그인 화면을 LUMERIFT 전용 시작 흐름으로 교체
- v5 Luminous UI Atlas 30프레임과 아이콘 Atlas 30프레임 추가
- 공통 UiSkin·UiTheme·UiButton·SceneChrome 적용
- 로비를 캐릭터·출석·이벤트·퀘스트·전투 시작·8개 메뉴 구조로 재구성
- 전투 하단 컨트롤 도크 추가 및 v1.8 판정 계약 유지
- 구형 v2 UI 2개 파일을 v1.9 런타임 아카이브로 무손실 이동
- UI 시스템 문서·시각 감사·개념 시안 5종·자동 검증 추가
- App Check 비활성화와 Firebase Auth·Cloud Save 계약 유지


## 2026-07-28 · v1.10.0

- visualViewport 높이·너비·오프셋·배율과 플랫폼·포인터·reduced motion 상태 동기화
- 주소창·회전·pageshow·가상 키보드 변화의 requestAnimationFrame 기반 레이아웃 복구
- 저메모리·저코어 기기 캔버스 해상도 1.5배 상한
- 공통 최소 48×48 논리 픽셀 터치 판정과 pointer cancel 복구
- 스테이지·퀘스트·결과·운영 화면 전용 상태·보상·행동 아이콘 및 마이크로 인터랙션
- 브라우저 기본 쿠폰 prompt를 Safe Area·모바일 키보드 대응 전용 오버레이로 교체
- 신규 런타임 이미지 없이 기존 v5 Atlas 재사용
- App Check 비활성화, Firebase 및 v1.8 전투 판정 계약 유지
- 정적 모바일 QA와 디자인 접촉 시트 완료, 물리 단말 FPS·발열 계측은 v1.10.1로 이관


## 2026-07-28 · v1.10.1

- 평균 FPS·1% Low·긴 프레임·추세 기반 실제 단말 QA JSON 추가
- full·balanced·safe 자동 품질 상한과 canvas resolution 조정 추가
- 색상 보조·고대비·큰 HUD·연출 완화 설정과 전투 상태 기호 추가
- 현재 저장·복구 지점·28일 시즌 요약 JSON 저장/복원 추가
- UID 불일치 복원 차단과 가져오기 전 자동 복구 지점 생성
- 외부 스프라이트 트레이싱 없는 8방향 플레이어 실루엣 블록아웃 추가
- 실제 Android·iOS 계측값은 완료로 주장하지 않고 v1.10.2 로그 보정으로 이관
- App Check 비활성화와 기존 Firebase·전투 판정 유지

### 2026-07-28 · v1.10.1 CI 버전 정합성 핫픽스

- v1.10.0용 누적 CI 핫픽스가 v1.10.1 `package.json`을 덮어써 package 버전만 1.10.0으로 회귀한 원인을 확인했다.
- `package.json`을 1.10.1로 복구하고 `preverify`, `validate:mobile:v111`을 함께 유지했다.
- `validate-release-version.mjs`를 추가하고 `verify` 초반에 실행하여 버전·스크립트 회귀를 빠르게 차단한다.
- 최종 보고 형식을 작업 내역, 전체/패치 ZIP, 다음 예정 내역의 3단계로 고정했다.



## 2026-07-28 · v1.11.0

- Rift Drive 0~100, D~SS 스타일 체인, 7초 Overdrive 구현
- 공격 적중 후 스킬·회피 캔슬과 정밀 회피 보상·쿨다운 가속 추가
- 5개 행동 데이터에 impact tier·Drive·콤보 입력 창 계약 추가
- 프레임 압력 기반 전투 이펙트·곡선·레이어·데미지 텍스트 예산 적용
- Drive·스타일 HUD, 스킬 충전 링, 다층 타격광과 전장 깊이 표현 추가
- 공통 패널·배지·진행 바 시각 깊이 개선
- 신규 런타임 이미지 없이 기존 Atlas를 재사용하여 초기 다운로드 예산 유지
- 실제 단말 성능·온도·배터리 검수는 v1.11.1로 이관


## 2026-07-28 · v1.11.1

- 3단계 기기 보정 프로필과 AdaptivePerformance·CombatRenderBudget 공통 임계값 연결
- 기존 8방향 Atlas 기반 공격 선행 동작·스킬 궤적·회피 잔상·Drive 오라 연결
- 보스 장판에 예고·위험·회피 단계, 패턴명·기호·시간 눈금 추가
- 모바일 전투 버튼 단일 pointerId 소유권과 중복 탭 방지 추가
- LUMERIFT 소유 8방향 걷기·공격·피격·회피 제작용 블록아웃 원본 추가
- 물리 단말 온도·배터리·GPU 메모리는 완료로 주장하지 않고 v1.11.2로 이관

## 2026-07-28 · v1.11.2

- LUMERIFT 소유 8방향 걷기·공격·피격·회피 블록아웃을 128프레임·80애니메이션 PixiJS Atlas로 선택형 런타임 승격했다.
- 기존 고급 플레이어 원화를 기본값으로 유지하고 전용 Atlas는 Lazy Loading과 자동 폴백을 적용했다.
- 설정에 캐릭터 원화 선택과 실기기 QA 기록 시작·종료·JSON 저장을 추가했다.
- 3초 간격 성능·뷰포트 세션과 지원 브라우저 배터리 요약을 Device QA JSON v2에 포함했다.
- 표면 온도와 GPU 메모리는 물리 측정 전까지 null로 유지한다.


## 2026-07-29 · v1.11.3

- QA 세션 후처리를 JSON v3 자동 분석으로 확장
- 전용 도색 후보는 선택형 Lazy Loading으로 연결하고 기본 고급 원화 유지
- 진동·ARIA live region·다층 음향을 전투 피드백에 연결
- 물리 단말 온도·GPU 메모리와 최종 수작업 원화는 v1.11.4로 이관


## 2026-07-29 · v1.11.4
- 가상 조이스틱 방향 반전 보정과 사용자 순환 교정 추가
- 캐릭터 그림자·포커스 링·실루엣 glow 강화
- 공통 UI 팔레트와 패널 대비 개선
- ASSET_REGISTRY 1.11.4 재생성 및 v1.11.3 누적 검증의 상위 버전 호환 수정

## v1.11.5

- 웹툰형 클린 UI 패널·버튼·조이스틱 장식 보강
- HERO CUT / HYPE METER / ATTACK VECTOR 기반 전투 HUD 대정리
- 방향 검수용 텔레메트리와 공격 방향 VFX 화살표 보강
- CRIT/BURN/HIT 플로팅 텍스트와 CHAIN/CRITICAL 히트 배너 추가
- v1.11.5 릴리스 버전·문서·검증 체계 갱신

- v1.11.5 CI hotfix: 3초 QA 표본의 신뢰도 시간/개수 기준 정렬 및 경계 테스트 추가


## 2026-07-29 · v1.11.6
- PlayerActorView에 smoothedFacing, directionRibbon, stepHighlights를 추가해 8방향 이동 전환을 부드럽게 만들었다.
- PlayerMotionDirector의 moving 모션을 강화해 보행 리듬과 미세 회전이 더 자연스럽게 보이도록 조정했다.
- 패치/전체본 아카이브명과 릴리스 버전 계약을 v1.11.6으로 갱신했다.


## 2026-07-29 · v1.11.7
- AutoTargetController·AutoBattleController·CombatAssistController를 추가했다.
- 전투 HUD에 TARGET/AUTO 토글, LOCK SIGNAL, 타겟 링과 연결선을 추가했다.
- 첫 시작부터 Boot/Login/Lobby/공통 씬 UI를 통일된 인터페이스로 리뉴얼했다.


## 2026-07-29 · v1.11.8
- 모든 주요 화면 공통 디자인 체계 재구성
- CombatAssist v2 저장 설정과 v1 마이그레이션 추가
- 기기 프리셋을 자동 타겟·자동 전투 판단에 연결


## 2026-07-29 · v1.11.9
- CombatAssistController 저장 스키마를 v3로 올리고 고급 자동 설정을 추가했다.
- AutoTargetController가 점수 분해와 선정 이유를 반환하도록 확장했다.
- AutoBattleController에 HP 조건·보스 회피 정책·행동 이유 라벨을 추가했다.
- BattleHudSafeArea와 DirectionalAttackPose를 추가했다.

- 2026-07-29: v1.11.11 자동 전투 세션 로그·보스 패턴별 회피·복합 스킬·플랫폼 Safe Area 적용

## 2026-07-30 · v1.11.15

- 보스 회피 규칙을 `src/data/boss-dodge-rules.json` 버전형 데이터로 분리했다.
- 게임 데이터 검증이 실제 보스 패턴 ID와 회피 규칙의 1:1 참조를 확인한다.
- 자동 전투 세부 설정을 3개 사용자 슬롯에 저장·복원·초기화할 수 있다.
- 설정 화면에 자동 전투 프리셋 연구소를 연결했다.
- 전투 결과의 공격·스킬·회피·수동 개입 통계로 공격형·균형형·보존형 적합도를 비교한다.
- v1.11.9·v1.11.11 누적 검증기의 표시 문구와 TypeScript 하드코딩 의존을 제거했다.
- App Check 비활성, Player Save v4, AttackFootprint 공유 판정, 화면 기준 조이스틱 이동을 유지했다.

## 2026-07-31 · v1.11.18
- 캐릭터 상태·방향별 보조 FX Atlas v9 추가
- 장비 등급별 전투 재질과 로비·인벤토리 미리보기 연결
- v1.11.18 누적 검증기와 릴리스 메타데이터 갱신

# HANDOFF MASTER v1.11.29

# LUMERIFT 통합 인수인계 문서

**현재 버전:** v1.11.29
**갱신일:** 2026-08-03  
**상태:** Premium Art Direction v2 기반 캐릭터 중심 런타임 제작 1차 완료

## 1. 프로젝트 목적

LUMERIFT는 모바일 브라우저에서 빠르고 아름답게 실행되는 세로형 2.5D 액션 RPG다. MMORPG 기능보다 전투 손맛, 빠른 로딩, 성장 루프, 안정적인 모바일 성능을 먼저 완성한다.

## 2. 현재 구현 범위

- Vite·TypeScript·PixiJS 8·Firebase 계층
- Boot·Login·Lobby·Stage Select·Battle·Result·Inventory·Quest·Operations·Account·Ranking·Asset Gallery
- 3연속 공격, 스킬 2종, 회피, 상태 이상, 보스 3페이즈
- 10개 스테이지, 메인·일일 퀘스트, 장비·강화·인벤토리, 저장 v4
- 모바일 조이스틱, 쿨다운 HUD, 씬 페이드, 60·30FPS 및 품질 자동 축소
- Texture Atlas, Lazy Loading, Object Pool, 리소스 해제
- Vite 8 함수형 manualChunks와 Node.js 24 CI 기준

## 3. v1.0.0 실제 게임용 아트 패스

기본 로비와 전투가 `public/assets/live/v1`을 사용한다.

- 실제 판타지 로비·전투 배경 2종
- 실제 영웅·보스 초상 2종
- 실제 플레이어 전투 Atlas 1개·68프레임·80애니메이션 키
- 실제 몬스터 Atlas 1개·268프레임·8종·66애니메이션 키
- 실사용 NineSlice UI Atlas 1개·18프레임
- 런타임 실사용 아트 약 4.06MB
- 공개 원본 20개·약 21.11MB
- 누적 전체 45 Atlas·2,828프레임·305애니메이션

## 4. 품질 단계

### v1.11.8 릴리스 포인트

- RIFT INTERFACE 전 화면 공통 디자인
- 자동 타겟 우선순위 5종
- 자동 스킬/회피/보스전 제한
- 즉응형/균형형/안정형 실기기 프리셋



현재 단계는 `production-candidate-auto-combat-interface-renewal`다.

### v1.11.7 릴리스 포인트

- 자동 타겟팅 기본 ON, 자동 전투 기본 OFF
- 수동 입력 우선과 텔레그래프 회피 우선순위 적용
- Boot·Login·Lobby·SceneChrome·Battle 인터페이스 리뉴얼


- 명시적 재배포 라이선스가 있는 실제 게임 원본을 사용한다.
- 로비·전투 기본 화면과 캐릭터·몬스터 렌더링에 실제 연결되어 있다.
- 기존 절차형 자산은 기본 화면에서 빠지고 레거시 보관소로만 남는다.
- LUMERIFT 전용 독점 원화나 최종 아트 디렉터 승인 단계는 아니다.
- 플레이어는 공개된 단일 연속 시트를 기존 8방향 논리 계약에 매핑하므로 전용 8방향 제작이 필요하다.
- 여러 공개 원본의 비율과 화풍을 완전히 통일하는 2차 아트 디렉션이 필요하다.

### v1.11.9 릴리스 포인트

- 자동 타겟 점수·자동 행동 이유 HUD
- HP 조건형 스킬·보스 회피 정책·수동 복귀 지연
- 모바일 전투 Safe Area 자동 보정
- 8방향 공격 포즈·스트라이크 실루엣 강화

### v1.11.12 릴리스 포인트

- 로비 커맨드 허브 브리핑/퀵 액션 가독성 강화
- 에셋 보관소 품질 태그·감수 포인트·모바일 제작용 마스터 안내 강화
- 결과 화면 전술 요약과 다음 추천 행동 UX 개선
- v1.11.11 자동 전투·Safe Area·조이스틱 방향 계약 유지


### v1.11.13 릴리스 포인트

- 로비 퀘스트/운영/스토리 상태 기반 NEXT BEST ACTION
- 설정 변경 인라인 피드백 배너
- 결과 화면 ResultActionPlan 순수 로직과 compact subtitle 정렬
- 에셋 분류별 QUALITY 점수·MOBILE ROLE·감수 기준
- v1.11.10~v1.11.12 계약 및 조이스틱 화면 기준 이동 유지


### v1.11.14 릴리스 포인트

- 공격형·균형형·보존형 자동 전투 프리셋과 사용자 설정 전환
- 프리셋별 Drive·스킬·거리 유지 판단 튜닝
- 보스 위협 HUD의 자동 회피 준비/수동 회피 안내 분리
- 모바일 우측 액션 버튼 손가락 가림 감소
- 결과 화면에 실제 사용 자동 전투 프리셋 기록

### v1.11.15 릴리스 포인트

- 보스 회피 규칙 JSON 데이터 분리와 보스 패턴 참조 검사
- 자동 전투 사용자 프리셋 3개 저장 슬롯과 프리셋 연구소
- 전투 결과 기반 세 프리셋 적합도 비교와 추천
- v1.11.9·v1.11.11 누적 검증의 문구/하드코딩 의존 제거



### v1.11.20 릴리스 포인트

- 캐릭터·코스튬 아틀리에와 v10 본체 8개 전투 포즈 실시간 미리보기
- 염색·포즈 로컬 외형 슬롯 3개 저장·불러오기·초기화
- 균열검·대검·균열 장창별 공격 준비·사거리·공격각·타격 정지 차등화
- Player Save v4와 외형 슬롯 저장소 분리
- 기존 v10 본체·v4 fallback·AttackFootprint·App Check 비활성 정책 유지

### v1.11.19 릴리스 포인트

- 기본 전투 플레이어를 648프레임·80애니메이션의 v10 Atlas로 전환
- 장비 등급 기반 균열검·대검·균열 장창 실루엣
- 4종 로컬 염색 프리셋과 세트 조화 로비 표시
- v4 플레이어 Atlas 비상 fallback 및 v6/v7 Lazy Loading 후보 보존
- Player Save v4·AttackFootprint·App Check 비활성 정책 유지

## 5. 라이선스

- `docs/THIRD_PARTY_ASSETS.md`
- `public/assets/live/v1/licenses/ASSET_LICENSES.json`
- `public/assets/live/v1/licenses/NOTICE.txt`

CC BY·CC BY-SA 자산의 제작자 표시를 제거하지 않는다. CC BY-SA 파생 Atlas는 동일 라이선스 조건을 유지한다.

## 6. 런타임 사용 원칙

- `art_source`는 전체 통합본에 보관하되 `public` 밖에 두어 GitHub Pages에는 배포하지 않는다.
- 라이브 자산은 `live/v1` 분류별 번들로 필요한 씬에서만 로드한다.
- 로비 종료·전투 종료 시 참조 카운트 기반으로 텍스처를 해제한다.
- 초기 부트 번들에는 대형 몬스터 Atlas를 포함하지 않는다.
- 최종 전용 원화로 교체할 때 기존 프레임 키 계약을 유지한다.

## 7. 다음 작업 우선순위

1. 자동 타겟 우선순위·자동 전투 세부 옵션
2. 전투 HUD safe area·소형 화면 정렬
3. 캐릭터 8방향 공격 성공 프레임·타격 포즈 검수
4. 보스 말풍선형 위험 아이콘과 패턴 강조 개선
5. Android Chrome·iOS Safari 자동 전투 장시간 검증

## 8. 작업 시작 체크리스트

- `AGENTS.md`, `HANDOFF_STATE.json`, 최근 HANDOFF_LOG 확인
- 신규 외부 자산의 라이선스와 재배포 권한 확인
- 기본 런타임 화면에 실제 연결되는지 확인
- PNG/WebP·Atlas·15MB·Lazy Loading 규칙 확인
- 품질 단계와 보고 문구 일치 확인

## 9. 작업 종료 체크리스트

- 코드·에셋·라이선스·인수인계 자동 검증
- 미리보기 갱신
- 전체본과 패치본 대조
- 문서·로드맵·변경 기록 갱신
- SHA-256와 ZIP 무결성 확인
- 결과 보고 순서 준수

## 10. 알려진 제한

- 공개 라이선스 아트 패스이며 독점 IP 최종 원화가 아니다.
- 실제 npm 의존성 설치와 Vite production build는 Registry 사용 가능한 환경에서 최종 실행한다.
- 실기기 GPU 메모리·FPS 측정이 아직 필요하다.


## v1.0.1 배포 최적화 기준선

- 기본 배포본에서 `art_source`, v0.8 메가팩, v0.9 절차형 품질팩, 미사용 챕터 자산을 제거했다.
- 실제 런타임 자산과 검증·라이선스·인수인계 문서만 유지한다.
- 용량 보고는 MB로 통일한다.
- 원본 재가공이 필요한 경우 원출처와 `docs/THIRD_PARTY_ASSETS.md` 기록을 사용한다.

## v1.0.2 빌드 복구 기준선

- BattleActorView의 TS6133 미사용 선언 오류를 수정했다.
- 현재 GitHub 저장소가 v1.0.0이면 v1.0.2 패치를 적용하고 정리 스크립트를 실행한다.
- 다음 기능 개발은 v1.1.0 UI 2차 리빌드에서 계속한다.


## v1.0.3 전체 자산 보존 복구 기준선

- v1.0.2는 경량 런타임 프로젝트였으므로 전체 통합본 명칭 사용이 잘못되었다.
- 전체 통합 ZIP에는 `art_source` 79개와 레거시·품질 후보 런타임 자산을 모두 복원한다.
- 기본 게임은 계속 `public/assets/live/v1`을 사용하며 복원된 레거시 자산을 자동 로드하지 않는다.
- 초기 다운로드 15MB 제한과 전체 프로젝트 약 523MB 보관 용량은 별도 지표다.
- 경량본은 향후 `RUNTIME` 또는 `DEPLOY`라는 별도 이름으로만 제공한다.

## v1.1.0 모바일 원본·UI 기준선

- 전체 통합본은 모바일 제작용 원본을 포함하며 불필요한 초고해상도·비압축 PNG를 보존하지 않는다.
- LUMERIFT 소유 원본은 `docs/SOURCE_ART_POLICY.md`의 해상도와 용량 예산을 따른다.
- 공개 라이선스 제3자 원본은 라이선스와 재가공 근거 보존을 위해 원형 유지가 가능하다.
- BAT 파일은 Windows 편의용이며 npm 명령과 GitHub Actions가 공식 실행 기준이다.
- 인벤토리·스테이지 선택·결과 화면은 `src/ui/PremiumUi.ts`의 공통 프리미엄 UI 구성요소를 사용한다.

## v1.2.0 UI·그래픽 Visual Reset 기준선

- 기존 대시보드형 패널 반복과 네온 테두리 중심 화면을 폐기했다.
- 공통 색 역할은 흑청색 배경, 금색 보상, 청록색 상호작용, 적색 위험으로 고정한다.
- 기본 AssetCatalog는 `public/assets/live/v2`의 UI·배경·초상·배우 보정 Atlas를 사용한다.
- 인벤토리는 아이콘 그리드, 스테이지는 노드 경로, 결과는 등급·보상 중심 구조를 사용한다.
- 화면 완료는 런타임 연결·미리보기·시각 감사·자동 검사까지 통과해야 한다.
- 공개 원본 통합 패스는 최종 독점 원화가 아니며 품질 단계는 `production-candidate-open-art-pass`를 유지한다.

## v1.3.0 운영 UI·저장 v4 기준선

- 로비 하단에 `소식` 메뉴를 추가하고 미확인 공지·오늘 출석·미수령 우편 개수를 표시한다.
- `OperationsScene`은 공지·출석·우편·쿠폰 네 탭을 공통 Obsidian·Gold·Teal 체계로 제공한다.
- `PlayerProfile.saveVersion`은 4이며 `operations`에 출석 주기, 공지 읽음, 우편 수령, 쿠폰 사용 이력을 저장한다.
- v1~v3 저장 데이터는 로드 시 v4로 자동 마이그레이션한다.
- 운영 보상은 실제 골드와 인벤토리에 반영하며 중복 수령을 방지한다.
- 운영 Atlas는 `public/assets/live/v3/atlases/operations`에서 화면 진입 시 Lazy Loading한다.
- 모바일 레이아웃은 Safe Area, `100dvh`, `visualViewport`, 가상 키보드 오프셋을 사용한다.
- 현재 운영 데이터는 로컬 정적 데이터이며 Firebase 원격 운영과 서버 보상 검증은 다음 단계다.

## v1.4.0 Firebase Authentication·Cloud Save 기준선

- 공개 URL은 `https://junl-im.github.io/LUMERIFT/`다.
- Firebase project ID는 `lumerift-8db07`이며 npm `firebase@12.16.0` modular API를 사용한다.
- 익명·Google·이메일 인증을 지원하고 익명 계정은 `linkWithPopup` 또는 `linkWithCredential`로 승격한다.
- Auth는 browser local persistence를 사용하며 앱 시작 시 세션을 복원한다.
- Firestore는 IndexedDB persistent local cache와 multi-tab manager를 사용하고 실패 시 메모리 캐시로 전환한다.
- Cloud Save는 로컬 저장을 먼저 완료한 뒤 원격 저장하며 실패 데이터는 localStorage 대기열에 보존한다.
- 공지는 Firestore에서 읽고 15분 캐시하며 실패 시 내장 공지로 폴백한다.
- Firestore Rules는 사용자 UID 격리, 공개 공지 읽기, 클라이언트 쿠폰 차단, 기본 거부를 적용한다.
- App Check는 환경변수 사이트 키가 있을 때만 초기화하며 metrics 확인 전 enforcement를 켜지 않는다.
- 상세 콘솔 설정과 배포 순서는 `docs/FIREBASE_SETUP_v1.4.0.md`에 기록한다.

## v1.4.1

- Firebase Rules·Indexes 배포 스크립트 누락 복구
- `--only firestore` 공식 부분 배포 방식으로 통일
- 로컬 프로젝트 루트 및 package.json 버전 확인 절차 추가

## v1.4.2 Firebase App Check 비활성화 기준선

- Firebase App Check SDK와 reCAPTCHA provider 초기화를 제거했다.
- `.env`, GitHub Actions, 런타임 코드에서 App Check 사이트 키를 사용하지 않는다.
- Firebase Console의 Firestore·Authentication enforcement를 켜지 않는다.
- 익명·Google·이메일 Authentication, Firestore Cloud Save, 오프라인 캐시와 Analytics는 그대로 유지한다.
- App Check 재도입은 사용자의 명시적 승인 후 별도 버전에서만 허용한다.


## v1.5.0 계정·Cloud Save·랭킹 기준선

- 로비 하단 계정 버튼은 현재 Cloud Save 상태를 `CLOUD/SYNC/OK/OFFLINE/ERROR`로 표시한다.
- `AccountScene`은 로그인 제공자, UID, 이메일 인증, 계정 연결, 비밀번호 재설정, 로그아웃을 제공한다.
- `ResilientPlayerRepository.inspect()`는 로컬과 Firestore 원본을 분리 조회하며 저장 시각 차이가 2초를 넘으면 충돌로 표시한다.
- 자동 로드는 최신 `updatedAt`을 선택하지만 사용자는 로컬→클라우드 또는 클라우드→로컬 방향을 수동 실행할 수 있다.
- 전체 랭킹은 `rankings/{uid}`, 주간 랭킹은 `weeklyRankings/{weekKey}_{uid}`를 사용한다.
- 주간 키는 UTC 월요일 날짜이며 화면은 상위 12명과 count 집계 기반 내 순위를 표시한다.
- 랭킹 화면은 실시간 리스너를 사용하지 않는다.
- Firestore Emulator 테스트는 본인 저장, 타 UID 차단, 본인 랭킹 쓰기, 공개 랭킹 읽기, 쿠폰 차단을 검사한다.
- App Check는 계속 비활성화한다.

## v1.6.0 추가 에셋 정리 기준선

- 현재 버전은 v1.6.0이며 public 배포와 전체 통합본 보관을 분리했다.
- `public/assets`에는 27개·3.90MB의 활성 런타임·필수 요약·라이선스만 남는다.
- 레거시·품질 후보·미사용 지역 자산 182개·19.70MB는 `art_source/runtime_archive/v1.6.0/public/assets`에 원경로 구조로 보존한다.
- 활성 자산은 6 Atlas·412프레임·151애니메이션, 보관 자산은 43 Atlas·2,794프레임·300애니메이션이다.
- 전체 통합본은 총 49 Atlas·3,206프레임·451애니메이션과 모바일 제작용 원본을 계속 포함한다.
- `asset_registry/ASSET_REGISTRY.json`과 `RELOCATION_PLAN_v1.6.0.json`이 자산 위치·크기·해시의 기준이다.
- 후속 작업은 보관 자산을 public 원위치로 복사하지 말고 검수 후 새 런타임 버전 경로에 등록한다.


## v1.7.0 실사용 아트 통일 기준선

- 현재 플레이어·몬스터·VFX 기본 경로는 `public/assets/live/v4`다.
- 플레이어 68프레임, 몬스터 8종 268프레임, VFX 40프레임을 모바일 판독 기준으로 재보정했다.
- Stage 1~10은 `approach`, `ruins`, `depths`, `core` 4개 전투 배경 티어를 사용한다.
- 보스 HUD 초상은 페이즈 1·2·3에 맞춰 자동 교체한다.
- v2 실사용 아트와 기존 VFX는 `art_source/runtime_archive/v1.7.0`에 SHA-256과 함께 보존한다.
- 품질 단계는 `production-candidate-unified-art-pass`이며 독점 최종 원화가 아니다.
- 후속 작업은 실제 모바일 명암 QA와 전용 실루엣 원화 교체다.

## v1.8.0 보스 전투·복구·시즌 기준선

- 공격 경고·충돌·타격 표시에는 `AttackFootprint` 단일 기하 계산을 사용한다.
- 보스 진입과 페이즈 전환은 3개 프레젠테이션 프로필을 사용하며 연출 중 전투를 잠시 정지한다.
- Cloud Save 위험 작업 전 UID별 로컬 복구 지점을 최대 5개 유지한다.
- 랭킹은 전체·주간·28일 시즌을 제공하며 `seasonRankings/{seasonId}_{uid}` 소유권을 규칙으로 강제한다.
- App Check는 비활성화 상태를 유지한다.


## v1.8.1 PixiJS 8 빌드 기준선

- `Graphics.lineStyle({ ... })` 객체 호출을 사용하지 않는다.
- 선 경로는 `moveTo/lineTo`로 작성하고 `stroke({ color, alpha, width })`로 마감한다.
- `VirtualJoystick`의 십자 가이드 호출 형식은 `validate:source`가 고정한다.
- v1.8.0 전투·복구·시즌·Firebase·에셋 계약은 그대로 유지한다.

## v1.9.0 첫 시작 화면·전체 UI 기준선

- `public/assets/live/v5/atlases/ui/ui_luminous_v5.json`: 공통 패널·버튼·탭·슬롯·HUD 30프레임
- `public/assets/live/v5/atlases/ui/ui_icons_v5.json`: 로그인·재화·메뉴·운영·계정 아이콘 30프레임
- `public/assets/live/v5/backgrounds/title_screen_v5.webp`: 실제 타이틀 화면 배경
- `UiSkin`은 v5 Atlas와 타이틀 배경을 로드하고 NineSlice를 생성한다.
- `UiTheme`은 아이콘·재화 칩·메뉴 타일·구분선을 생성한다.
- `UiButton`은 아이콘·부제·정렬을 지원하며 기존 호출과 호환한다.
- `SceneChrome`은 스테이지·결과·인벤토리·퀘스트·운영·계정 장면의 공통 상단 구조다.
- Login은 세션 자동 건너뛰기를 하지 않고 타이틀에서 사용자가 게임 시작을 선택한다.
- Lobby는 재화, 캐릭터, 출석, 이벤트, 일일 퀘스트, 전투 시작, 8개 메뉴, 하단 내비게이션 구조다.
- 구형 v2 UI는 `art_source/runtime_archive/v1.9.0`에 보존한다.
- 디자인 시안은 문서용이며 실제 런타임 완료 판정은 코드 연결과 자동 검사를 기준으로 한다.


## v1.10.0 실기기 대응 UI·세부 화면 2차 기준선

- `MobileViewportController`는 `visualViewport`의 width·height·offsetTop·offsetLeft·scale과 가상 키보드 상태를 CSS 변수 및 루트 데이터 속성으로 동기화한다.
- 주소창 변화, 화면 회전, `pageshow`, 포커스 복귀, visibility 변경은 requestAnimationFrame 단위로 레이아웃을 재계산한다.
- `UiMotion.bindPressFeedback`는 공통 눌림 상태, pointer cancel·outside 복구, reduced motion, 최소 48×48 논리 픽셀 터치 영역을 담당한다.
- 4GB 이하 메모리 또는 4코어 이하 기기는 PixiJS 캔버스 resolution 상한을 1.5로 제한한다.
- 스테이지·퀘스트·결과·운영 화면은 상태·보상·행동 아이콘과 저강도 마이크로 인터랙션을 사용한다.
- 쿠폰 입력은 `window.prompt`를 사용하지 않고 Safe Area·가상 키보드·16px 입력 폰트를 지원하는 DOM 오버레이를 사용한다.
- 신규 런타임 이미지를 추가하지 않고 기존 v5 아이콘 Atlas를 재사용한다.
- v1.8 AttackFootprint, Firebase Auth·Firestore·Cloud Save·랭킹 및 App Check 비활성화 계약은 유지한다.
- `v1.10.0_mobile_qa_contact.webp`는 디자인 QA 시뮬레이션이며 실제 물리 기기 캡처가 아니다.
- Android Chrome·iOS Safari 실제 FPS·발열·GPU 메모리 계측과 최종 실기기 승인은 v1.10.1 잔여 작업이다.


## v1.10.1 계측 기반·접근성·복구 이식성 기준선

- `PerformanceMonitor`는 평균 FPS, 1% Low, 33.34ms·50ms 초과 프레임 비율과 최근 추세를 계산한다.
- `AdaptivePerformanceController`는 여러 측정 구간의 저하를 확인한 뒤 full·balanced·safe 순서로 그래픽 상한, AUTO FPS, canvas resolution을 조정한다.
- `SettingsScene`은 색상 보조·고대비·큰 HUD·연출 완화와 실제 단말 QA JSON 저장을 제공한다.
- 기기 QA의 `estimatedPressure`는 프레임 추세 기반 추정값이며 실제 온도 센서값으로 보고하지 않는다.
- 전투 HUD는 플레이어 정상 `♥`, 위험 `▲`, 보스 `◆` 기호와 서로 다른 색을 동시에 사용한다.
- `lumerift-recovery-archive-v1`은 현재 Player Save v4, 최대 5개 복구 지점, 28일 시즌 요약을 포함한다.
- JSON 가져오기는 현재 로그인 UID와 일치해야 하며 적용 전에 `pre-json-import` 복구 지점을 만든다.
- 전용 플레이어 8방향 블록아웃은 `art_source/lumerift_original/v1.10.1/player`에 보존하며 아직 런타임 Atlas로 사용하지 않는다.
- App Check 비활성화와 Firebase Auth·Firestore·Cloud Save·랭킹·AttackFootprint 계약은 유지한다.
- 실제 Android·iOS 기기 로그와 표면 온도 수집은 v1.10.2 보정 작업으로 남는다.


## v1.11.0 전투·그래픽 강화 기준선

- `CombatMomentumController`가 Rift Drive, D~SS 스타일 체인과 Overdrive를 관리한다.
- 공격 적중 후 스킬·회피 캔슬과 정밀 회피 보상은 PlayerCombatController의 상태 계약을 따른다.
- 모든 전투 행동은 impactTier·driveGain·driveCost·comboWindow를 데이터로 가진다.
- `CombatRenderBudget`은 게임 판정과 분리하여 이펙트·곡선·레이어·텍스트 비용만 자동 축소한다.
- 전투 HUD는 Drive·등급·체인 배율과 스킬 충전 상태를 표시한다.
- UI 깊이 표현은 기존 Atlas 위에 프로그램 렌더링으로 추가하며 신규 런타임 이미지를 요구하지 않는다.
- App Check 비활성화, Firebase 저장·랭킹, Player Save v4와 AttackFootprint 단일 판정 계약은 유지한다.
- 실제 Android·iOS 장시간 성능·발열·배터리 승인은 v1.11.1 물리 단말 계측으로 남는다.


## v1.11.1 실기기 전투 보정 기반·전용 모션 기준선

- DeviceCalibration은 entry·balanced·performance 3단계로 FPS·1% Low·긴 프레임·회복 임계값과 렌더 편향을 제공한다.
- PlayerMotionDirector는 기존 8방향 Atlas에 상태 진행률 기반 선행 동작·압축·회피 잔상·Drive 오라를 적용한다.
- BossTelegraphLanguage는 예고·위험·회피 단계와 패턴명·기호·타이밍 눈금을 제공하며 실제 판정은 AttackFootprint를 유지한다.
- TouchActionGate는 전투 버튼의 단일 포인터 소유권과 중복 탭 차단을 담당한다.
- v1.11.1 모션 마스터는 LUMERIFT 소유 제작용 블록아웃이며 최종 런타임 원화로 보고하지 않는다.
- 실제 기기 온도·배터리·GPU 메모리는 물리 단말에서 별도 기록해야 한다.

## v1.11.2 선택형 전용 플레이어 Atlas·QA 세션

- `public/assets/live/v6/atlases/player/player_owned_motion_v6.*`는 LUMERIFT 소유 8방향 모션 블록아웃의 선택형 런타임 승격본이다.
- 기본 플레이어는 기존 고급 v4 Atlas이며 설정에서 `owned-preview`를 선택할 때만 별도 번들을 Lazy Loading한다.
- `PlayerArtVariantController`가 선택을 보존하고 `BattleScene`은 로딩 실패 시 기본 Atlas로 복구한다.
- `DeviceQaSessionRecorder`는 3초 간격으로 FPS·1% Low·긴 프레임·P99·품질 단계·뷰포트·화면 상태를 기록한다.
- QA JSON v2는 지원 브라우저 배터리 값을 포함할 수 있지만 표면 온도와 GPU 메모리는 null로 유지한다.
- v1.11.2 전용 Atlas는 최종 수작업 캐릭터 원화가 아니다.


## v1.11.3 QA 자동 분석·전투 접근성·도색 후보

- 현재 버전: v1.11.3
- QA JSON 스키마: `lumerift-device-qa-v3`
- 플레이어 원화 선택: `detail`, `owned-preview`, `owned-painted`
- 도색 후보는 기본값이 아니며 별도 Lazy Loading과 실패 복구를 유지한다.
- 진동·전투 낭독·다층 음향은 프레젠테이션 계층이며 전투 판정을 변경하지 않는다.
- 실제 단말 표면 온도·GPU 메모리와 최종 원화 승인 결과를 완료로 주장하지 않는다.


## v1.11.4 입력 방향 보정·UI 정리·캐릭터 polish

- 가상 조이스틱의 체감 방향 역전 문제에 대응해 기본값을 `reverse` 보정으로 설정했다.
- 설정 화면에서 화면 기준·반전·좌우 반전·상하 반전을 순환 선택할 수 있다.
- 보정은 터치 가상 조이스틱에만 적용하며 키보드와 포인터 이동 규칙은 유지한다.
- 플레이어 그림자·발밑 포커스 링·실루엣 glow·오버드라이브 tint를 추가했다.
- 공통 배경·패널·텍스트 대비를 밝게 조정해 칙칙함과 정보 혼잡을 줄였다.
- ASSET_REGISTRY는 릴리스마다 `npm run asset:registry`로 재생성해 manifest와 버전·용량·해시를 일치시킨다.
- v1.11.3 누적 검증은 이후 버전에서도 보존 계약을 검사하도록 1.11.3 이상을 허용한다.

## v1.11.12
- 자동 전투 세션 로그와 결과 화면 AUTO ASSIST REPORT
- 보스 패턴별 회피 방향·시점 데이터
- HP·Drive·타겟 HP 복합 스킬 판단
- iOS·Android 전투 HUD Safe Area 보정

- v1.11.12 이동 방향 핫픽스: 실제 이동 벡터와 8방향 표시를 화면 좌표 기준으로 복구


### v1.11.16 릴리스 포인트
- 최근 자동 전투 18건 로컬 기록 및 프리셋 성과 비교
- 보스 회피 JSON v2 시각 메타데이터
- 8방향 공격/무기 궤적 차등 프로필


### v1.11.17 릴리스 포인트
- 프리미엄 영웅 초상 v8
- 8방향 캐릭터 재질광 오버레이


### v1.11.18 릴리스 포인트
- 8방향·4상태 캐릭터 FX Atlas v9
- 장비 등급별 재질광·룬·무기 궤적 동기화
- 로비·인벤토리 장비 외형 미리보기
- Player Save v4·AttackFootprint·App Check 비활성 계약 유지

## v1.11.21 캐릭터 스튜디오 8방향 비교·무기 본체 프레임

- `CharacterWardrobeController`는 방향·코스튬·갑주/망토/룬 채널·비교 슬롯·최근 프리셋을 로컬 저장한다.
- v1.11.20 슬롯은 방향 남, 정찰대 강철 세트, BASE 채널로 자동 마이그레이션한다.
- `CharacterWardrobeScene`은 현재 장비와 교체 후보를 같은 조건으로 좌우 동시 렌더링한다.
- `WeaponBodyAttackFrames`는 검·대검·장창별 기존 v10 본체 프레임 순서와 속도를 분리한다.
- `WeaponMotionProfile`과 `PlayerMotionDirector`는 무기별 선행·접촉·회수·전진·회전 값을 공유한다.
- `CharacterDisplayCalibration`은 Android Chrome·iOS Safari 캡처 준비용 기준을 제공하되 물리 캡처 승인 전 상태를 `pending-physical-capture`로 유지한다.
- Player Save v4, Firebase App Check 비활성, AttackFootprint, PNG/WebP, 15MB 초기 예산 계약은 변경하지 않는다.

## v1.11.22 무기 공격 Atlas·외형 프리셋 보관소

- `player_weapon_attack_body_v11`은 3개 무기 계열·3개 공격·8방향·6프레임으로 구성된 432프레임·72애니메이션 Atlas다.
- 공격 상태에서는 전용 Atlas를 우선 사용하고 로딩 실패·대체 원화 선택 시 v10 프레임 레시피로 복구한다.
- 아틀리에의 파트 집중 보기와 확대는 미리보기 표현만 변경하며 장비 데이터와 전투 판정을 변경하지 않는다.
- 외형 프리셋의 이름·즐겨찾기·JSON 보관소는 로컬 표시 설정이며 Player Save v4·Cloud Save와 분리한다.
- 전용 공격 Atlas는 v10 파생 production-candidate이며 최종 수작업 원화로 보고하지 않는다.
- Android Chrome·iOS Safari 캡처 승인 전 `CharacterDisplayCalibration.captureStatus`는 `pending-physical-capture`를 유지한다.

## v1.11.23 독립 장비 레이어·프리셋 인덱스·캡처 승인 흐름

- `CharacterEquipmentLayerView`는 갑주·망토·룬을 프로그램 도형 레이어로 분리한다.
- `BattleActorView`와 `CharacterWardrobeScene`은 동일한 레이어 구현을 사용한다.
- `CharacterWardrobeController`는 정렬 모드, 검색어, 3개 슬롯 고정 상태를 로컬 저장한다.
- 외형 Archive v2는 `lockedSlots`를 포함하고 v1 Archive 가져오기를 지원한다.
- `CharacterDisplayCalibrationStore`는 물리 캡처 증빙 조건을 충족한 승인 JSON만 저장한다.
- 승인 JSON이 없는 플랫폼은 `pending-physical-capture`를 유지한다.
- `CharacterAppearanceCloudSync`는 manual-opt-in 봉투·UID 가드·경로 계약만 제공한다.
- Player Save v4, AttackFootprint, Firebase App Check 비활성 정책은 변경하지 않는다.


## v1.11.24 외형 Firestore 동기화·장비 마스크·프레임 정렬

- 외형 Cloud 문서는 `users/{uid}/settings/characterAppearance`를 사용한다.
- 사용자가 `manual-opt-in`을 켜기 전에는 원격 읽기·쓰기를 하지 않는다.
- Archive revision을 비교해 한쪽 변경만 자동 반영하고 양쪽 변경은 충돌로 중지한다.
- 업로드 실패 데이터는 로컬 재시도 큐에 보존한다.
- 원격 가져오기는 고정 슬롯을 로컬 우선으로 병합한 뒤 통합본을 재업로드한다.
- Archive v3는 `slotOrder`를 포함하고 v1·v2 JSON을 가져온다.
- 아이템별 갑주·망토·룬 프로그램 마스크와 무기별 공격 프레임 보정은 표현 계층이다.
- Player Save v4, AttackFootprint, App Check 비활성 정책은 변경하지 않는다.

## v1.11.25 외형 충돌 선택 병합·복구 지점

- `CharacterAppearanceConflictResolver`는 슬롯 1·2·3, 슬롯 순서, 고정 상태, 최근 프리셋의 6개 범주를 독립적으로 비교·병합한다.
- 슬롯 선택은 로컬·Cloud·최신 중 하나이며 로컬 고정 슬롯은 항상 로컬 내용을 유지한다.
- 최근 프리셋 선택 병합은 동일 외형을 중복 제거하고 즐겨찾기와 의미 있는 이름을 보존한다.
- 선택 병합 적용 전 `pre-conflict-merge` 복구 지점을 생성한다.
- `CharacterAppearanceRecoveryStore`는 계정 UID별 최대 5개 외형 Archive v3 복구 지점을 저장한다.
- 복구 적용 전 현재 상태를 `pre-recovery-restore`로 다시 저장하며 복구 후 Cloud에 자동 업로드하지 않는다.
- 복구 묶음 JSON은 현재 UID와 일치할 때만 가져온다.
- Player Save v4, AttackFootprint, App Check 비활성, PNG/WebP, 초기 15MB 예산 계약은 변경하지 않는다.

## v1.11.26 외형 3열 병합 미리보기·30분 Undo·복구 v2

- `CharacterAppearanceConflictPreviewScene`은 로컬·Cloud·RESULT 캐릭터를 동일한 Pixi 렌더 계약으로 나란히 표시한다.
- `simulateCharacterAppearanceMerge`는 슬롯별 요청 출처, 실제 적용 출처, 로컬 고정 보호, 변경 필드와 최종 Archive를 반환한다.
- `CharacterAppearanceMergeCoordinator`는 적용 전 일반 복구 지점과 30분 Undo 지점을 함께 생성한다.
- `CharacterAppearanceUndoStore`는 UID별 1개·30분·1회 사용 정책을 적용한다.
- `CharacterAppearanceRecoveryStore` v2는 이름·고정·검색을 지원하고 고정 3개와 최근 5개를 보존한다.
- v1 복구 Archive와 지점은 v2로 자동 마이그레이션한다.
- Player Save v4, AttackFootprint, App Check 비활성, PNG/WebP, 초기 15MB 예산 계약은 변경하지 않는다.

## v1.11.27 외형 복구 차이·감사 기록

- 복구 지점 두 개를 실제 캐릭터 카드로 비교하고 슬롯별 변경 필드를 확인한다.
- Archive diff는 슬롯·순서·고정·최근 프리셋 차이를 포함한다.
- 감사 기록은 사용자 UID별 최대 100건이며 게임 진행 저장과 분리한다.
- 선택 복구 지점 관련 차이와 감사 기록을 단일 JSON으로 내보낼 수 있다.
- 실제 캡처·최종 원화·정상 npm 빌드는 미완료 상태를 유지한다.

## v1.11.28 Premium Art Direction v2

- 승인 기준: `public/assets/live/v12/art-direction/ART_DIRECTION_V12.json`
- 제작 마스터: `art_source/lumerift_original/v1.11.28/art-direction`
- 런타임 감수본은 에셋 보관소에서만 Lazy Loading한다.
- 캐릭터·몬스터·UI·스킬 VFX·장비는 `PremiumArtDirection.ts` 품질 게이트를 따른다.
- 모바일 판독성 80점 미만은 총점과 관계없이 승인하지 않는다.
- 현재 이미지는 제작 방향 승인 자료이며 기존 전투 Atlas의 최종 교체 완료를 의미하지 않는다.


## v1.11.29 릴리스 포인트

- 플레이어에 금속 트림·얼굴 크레스트·흉부 룬·망토 윤곽 디테일 레이어를 실제 연결했다.
- 검·대검·균열 장창 3계열, 8방향, 10행동, 6레이어의 최종 제작 규격을 고정했다.
- 엘리트·보스에 왕관형 크리스털·약점 코어·발톱 실루엣을 연결했다.
- 엘리트 3종과 보스 1종, 총 936프레임의 차기 Atlas 계획을 등록했다.
- 기존 VFX Atlas 위에 충격 등급별 룬을 합성하고 모든 공통 패널·버튼에 Premium UI Frame v3를 적용했다.
- 신규 런타임 이미지는 없고 초기 자산 번들 증가도 0 bytes다.
- 실제 수작업 본체·장비 파츠 Atlas, 물리 단말 캡처, 실제 npm 빌드는 미완료다.

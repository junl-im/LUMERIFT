## v1.11.20 - 2026-07-31

### Added
- 캐릭터·코스튬 아틀리에와 8개 전투 포즈 실시간 미리보기
- 염색·포즈 로컬 외형 슬롯 3개
- 균열검·대검·균열 장창별 무기 모션 프로필

### Changed
- 로비 캐릭터·영웅 메뉴를 아틀리에 화면으로 연결
- 전투 진입 시 장착 무기 계열에 맞춰 공격·스킬 타이밍과 사거리를 조정
- v1.11.19 누적 검증기의 현재 버전 문구 고정을 제거

### Known limitations
- 무기 계열별 전용 수작업 공격 Atlas는 아직 제작 후보 단계다.
- Android·iOS 물리 기기 크기·발광 강도 승인은 아직 수행하지 않았다.

## v1.11.19 - 2026-07-31

### Added
- 프리미엄 8방향 플레이어 본체 Atlas v10: 648프레임·80애니메이션
- 4종 캐릭터 염색 프리셋과 로컬 저장
- 균열검·대검·균열 장창 무기 실루엣
- 장비 세트 조화 및 로비 미리보기 정보

### Changed
- 기본 전투 플레이어 경로를 v4에서 v10으로 전환
- 새 본체 크기에 맞춰 기본 전투 캐릭터 스케일 조정
- 설정 캐릭터 항목을 본체와 염색으로 분리

### Known limitations
- 신규 본체는 기존 라이선스 자산 기반 production-candidate 파생 Atlas이며 수작업 최종 원화는 아니다.
- Android·iOS 물리 기기에서 크기·발광 강도는 아직 최종 승인하지 않았다.

## v1.11.18 - 2026-07-31

### Added
- 8방향·4상태 캐릭터 보조 FX Atlas v9
- 장비 등급별 재질 프로필과 장비 미리보기 Atlas
- 로비·인벤토리 장비 외형 미리보기

### Changed
- 전투 캐릭터의 재질광·룬·무기 궤적을 장착 장비 등급과 동기화
- 공격·스킬·회피 상태에 맞춰 망토·머리카락·갑주 보조 실루엣 전환

### Known limitations
- 본체 모션 Atlas 자체는 기존 v4/v6/v7 자산을 유지하며 v9는 합성 보조 레이어다.
- Android·iOS 물리 기기에서 발광 강도와 작은 화면 가독성은 아직 최종 승인하지 않았다.

## v1.11.17
- 프리미엄 영웅 초상과 8방향 재질광 오버레이 추가

## v1.11.16 - 2026-07-30

### Added
- 최근 자동 전투 기록 저장소와 분석 화면
- 보스 HUD JSON 시각 메타데이터
- 8방향 무기 궤적 프로필

### Changed
- 프리셋 연구소에서 최근 전투 기록 분석 화면으로 진입
- 보스 위협 HUD가 패턴별 안전 이동 안내와 색상을 사용

## v1.11.15 - 2026-07-30

### Added
- 버전형 JSON 보스 회피 규칙 카탈로그
- 자동 전투 사용자 프리셋 3개 슬롯과 프리셋 연구소
- 전투 결과 기반 공격형·균형형·보존형 적합도 비교

### Changed
- 게임 데이터 검증에 보스 패턴/회피 규칙 참조 검사 추가
- v1.11.9·v1.11.11 누적 검증을 이후 버전 호환 방식으로 보강

### Known limitations
- 프리셋 적합도는 단일 클라이언트 세션 기반 UX 권장값이며 서버 경쟁 점수가 아니다.
- 실제 Android·iOS 캡처 기반 HUD 미세 조정은 아직 수행하지 않았다.

## v1.11.14 - 2026-07-30

### Added
- 공격형·균형형·보존형 자동 전투 전략 프리셋
- 보스 위험 단계별 위협 HUD와 자동 회피 상태 안내
- 결과 화면 자동 전투 프리셋 기록

### Changed
- Combat Assist 저장 규격 v4 및 v3 자동 마이그레이션
- 우측 전투 액션 버튼 간격과 Safe Area 보정
- v1.11.9 누적 검증기를 문구 고정 대신 기능 계약 검사로 완화

## v1.11.13 - 2026-07-30

### Added
- 로비 `NEXT BEST ACTION` 상황 기반 추천
- 설정 변경 인라인 피드백 배너
- 에셋 분류별 QUALITY 점수와 MOBILE ROLE
- LobbyNextAction·ResultActionPlan 순수 로직 테스트

### Changed
- 결과 화면 추천 행동과 주 버튼 목적을 동일 로직으로 통합
- 작은 버튼 부제목 세로 정렬과 줄 간격 개선
- PROJECT_HANDOFF 중복 내용을 정리하고 릴리스 경로 최신화

### Known limitations
- Android Chrome·iOS Safari 실제 캡처 기반 미세 정렬은 아직 수행하지 않았다.
- 전체 npm verify와 Vite production build는 의존성이 있는 CI에서 최종 확인한다.

## v1.11.12
- 로비 커맨드 허브 정보 위계 재정리와 브리핑 가독성 개선
- 에셋 보관소 품질 태그·감수 포인트·모바일 제작용 마스터 안내 추가
- 결과 화면 전술 요약·추천 행동 UX 개선

- v1.11.12 hotfix: 가상 조이스틱 기본 반전 제거 및 화면 기준 이동 복구
## v1.11.10
- 웹툰형 인터페이스 크롬·코믹 태그·피처 마키 추가
- 로비 브리핑 카드와 에셋 보관소 안내 리뉴얼

# Changelog

## v1.11.0 - 2026-07-28

### Added

- Rift Drive 0~100, D~SS 스타일 체인과 7초 Overdrive
- 적중 확인형 스킬·회피 캔슬과 정밀 회피 보상
- 전투 행동별 impact tier·Drive 획득/비용·콤보 입력 창 데이터
- 그래픽 품질·프레임 압력 기반 CombatRenderBudget
- Drive·스타일 HUD, 스킬 충전 링과 다층 타격광
- v1.11.0 전투·그래픽 회귀 검사

### Changed

- 전투 VFX가 런타임 품질 프로필과 impact tier를 사용하도록 변경
- 공통 UI 패널·배지·진행 바에 깊이·하이라이트·눈금 표현 추가
- 로비와 설정 진단에 FPS·적응형 품질·렌더 예산 상태 추가
- 신규 런타임 이미지 없이 기존 Atlas와 프로그램 렌더링으로 그래픽 강화

### Known limitations

- 실제 Android·iOS 장시간 전투 FPS·온도·배터리·GPU 메모리는 아직 계측하지 않았다.
- 전용 플레이어 최종 8방향 애니메이션 원화는 다음 단계다.

## v1.10.1 - 2026-07-28

### Added

- 실제 기기에서 FPS·1% Low·긴 프레임·visualViewport·렌더 상태를 저장하는 Device QA JSON
- 프레임 추세 기반 full·balanced·safe 자동 품질 단계
- 색상 보조·고대비·큰 HUD·연출 완화 설정 화면
- 전투 HP·위험·보스 상태의 색상과 기호 중복 표현
- 시즌 스냅샷·현재 저장·최대 5개 복구 지점 JSON 내보내기/가져오기
- LUMERIFT 전용 플레이어 8방향 실루엣 블록아웃 원본

### Changed

- AUTO FPS와 그래픽 품질에 자동 상한을 적용하고 캔버스 resolution을 단계 조정
- JSON 복원 전 자동 복구 지점 생성과 UID 일치 검증 추가
- 타이틀·로비 설정 버튼을 통합 설정 화면으로 연결
- App Check 비활성화와 기존 Firebase·AttackFootprint 계약 유지

### Known limitations

- 실제 Android·iOS 기기 QA JSON과 표면 온도는 아직 수집하지 않았다.
- 8방향 실루엣은 제작 블록아웃이며 최종 런타임 애니메이션 Atlas가 아니다.

## v1.10.0 - 2026-07-28

### Added

- visualViewport offset·scale, 플랫폼·포인터·reduced motion 동기화
- 공통 48px 터치 판정과 눌림 취소 복구 모듈
- Safe Area·가상 키보드 대응 쿠폰 입력 오버레이
- 스테이지·퀘스트·결과·운영 화면의 상태·보상·행동 아이콘 및 마이크로 인터랙션
- v1.10 모바일 UI 자동 검사와 디자인 QA 접촉 시트

### Changed

- 키보드 열림 시 게임 호스트의 높이 중복 차감 제거
- 저메모리·저코어 기기의 렌더 해상도 상한을 1.5로 제한
- 브라우저 자동 글자 확대와 iOS 고정 뷰포트 대응 강화
- App Check 비활성화와 기존 Firebase·전투 계약 유지

### Known limitations

- 디자인 QA 접촉 시트는 물리 단말 런타임 캡처가 아니다.
- 실제 Android Chrome·iOS Safari FPS·발열·GPU 메모리 최종 계측은 v1.10.1에서 수행한다.

## v1.5.0 - 2026-07-27

### Added

- 계정·Cloud Save 관리 화면과 동기화 상태 표시
- 익명 계정 Google/이메일 연결, 이메일 인증, 비밀번호 재설정, 로그아웃
- 로컬·클라우드 저장 비교, 충돌 표시, 수동 업로드·다운로드
- 전체·주간 랭킹, 상위 목록, 내 순위 집계
- weeklyRankings Rules·Indexes와 Firebase Emulator 권한 테스트
- 계정·랭킹 화면 미리보기

### Changed

- 로비 하단에서 계정과 Cloud Save 상태를 바로 확인하도록 변경
- 랭킹 스키마에 level과 UTC 월요일 weekKey 추가
- App Check 비활성화 정책 유지

### Known limitations

- 클라이언트 계산 랭킹은 서버 권위 점수가 아니므로 경쟁 보상에 사용하지 않는다.
- npm Registry 제한 환경에서는 실제 Firebase Emulator와 Vite 빌드를 사용자 환경에서 최종 확인한다.

## v0.9.1 - 2026-07-27

### Fixed

- Vite 8 타입 검사에서 `manualChunks` 객체 별칭이 `ManualChunksFunction`과 충돌하던 TS2769 오류 수정
- `manualChunks(id)` 함수로 PixiJS와 Firebase 청크 분리 유지

### Changed

- GitHub Actions를 Node.js 24 호환 메이저 버전으로 갱신
- 전체 검증 시작 시 빌드 설정과 TypeScript를 먼저 검사하도록 순서 변경
- 버전을 v0.9.1로 갱신

## v0.9.0 - 2026-07-27

### Added

- 26개 신규 품질 Atlas와 1,300개 프레임
- 영웅·보스·NPC 초상 후보 36종
- 아이템 384종, 스킬 160종, 환경 오브젝트 240종
- VFX 32세트·384프레임, UI 프레임 96종
- 지역 키아트 10종과 전투 배경 15종
- 고해상도 PNG 원본 458.36MB
- 분류별 Lazy Loading 에셋 품질 보관소
- 아트 품질 단계 및 진실성 자동 검사

### Changed

- 버전을 v0.9.0으로 갱신
- v0.8 메가팩을 구조 검증팩으로 재분류
- 에셋 상태를 `production-candidate-procedural`로 명확히 표기
- Firebase 운영 기반을 v0.10.0으로 이동

### Known limitations

- 신규 자산은 절차형 고해상도 제작 후보이며 최종 수작업 상용 원화가 아니다.
- 고해상도 PNG 원본은 합성 마스터이며 레이어 PSD 원본은 후속 제작 대상이다.

## v0.8.0 - 2026-07-27

### Added

- 10개 신규 Atlas와 대규모 제작 기준 에셋 메가팩
- 아이템·스킬·상태·UI·도감·NPC·환경·VFX·배지·튜토리얼 자산
- 5개 지역 15개 배경, 8개 로딩 아트, 3개 브랜드 자산
- UI·전투·환경 신규 오디오 36개
- 런타임 에셋 보관소 갤러리
- 인수인계 마스터, 누적 로그, 기계 판독 상태 파일
- 인수인계 자동 검증과 에셋 인벤토리 검사

### Changed

- 버전을 v0.8.0으로 갱신
- Phase 8을 에셋 기반 확장으로 변경하고 온라인 운영 기반을 v0.9.0으로 이동
- 모든 릴리스에 인수인계 파일 갱신을 의무화

### Known limitations

- 대규모 자동 생성 자산은 최종 상용 원화가 아니다.
- npm Registry 제한 환경에서는 프로덕션 빌드를 별도 PC에서 검증해야 한다.

## v0.7.0 - 2026-07-27

### Added

- Dead Zone 보정 모바일 가상 조이스틱
- 공격·스킬·회피 원형 쿨다운 표시
- Slash·Nova·Hit·Explosion·Dodge WebP VFX Atlas
- AnimatedSprite 전투 VFX Object Pool
- 보스 등장 시네마틱과 HP 65%·30% 페이즈 전환
- 장비 9종 WebP 아이콘 Atlas
- 인벤토리 장비 아이콘과 장착 무기 레이어
- 로비 캐릭터 AnimatedSprite
- 씬 전환 페이드와 입력 차단
- 번들 로딩 진행률과 텍스처 GPU 준비 단계
- 스킬·회피 OGG 효과음

### Changed

- 저사양 품질에서 파티클 생성 빈도와 배경 애니메이션을 축소
- 보스 페이즈에 따라 이동 속도·공격력·패턴 시작점을 강화
- 전투 리소스 번들에 VFX·장비·신규 음원을 포함
- 버전을 v0.7.0으로 갱신

### Verification

- 6개 Atlas, 342개 프레임, 103개 애니메이션 검사 통과
- 4개 번들, 23개 파일, 505,417 bytes Manifest 검사 통과
- 초기 다운로드 입력 추정 약 303.0 KB로 15MB 예산 통과
- 외부 모듈 스텁 기반 Strict TypeScript 의미 검사 통과
- 보스 페이즈와 Object Pool 런타임 회귀 통과

### Known limitations

- 제작 기준 시각·음향 에셋이며 최종 상용 아트는 아니다.
- npm Registry 제한으로 실제 패키지 타입 검사, Vitest 전체 실행과 Vite 빌드는 사용자 환경에서 확인해야 한다.

## v0.6.0 - 2026-07-27

- WebP 기반 플레이어 8방향 Sprite Atlas 적용
- Attack 1~3, Skill 1~2, Hit, Death, Dodge 애니메이션 상태 연결
- 일반·정예·보스 공통 Monster Atlas 적용
- Chapter 1 WebP 배경 적용
- PNG/WebP UI Atlas와 NineSlice 패널·버튼 적용
- OGG 효과음과 Opus BGM 구조 적용
- Asset bundle 참조 카운트와 BattleScene 종료 해제 적용
- 전체 Atlas·애니메이션 참조 검사 확장
- 15MB 초기 다운로드 예산 보고 추가

## v0.5.0 - 2026-07-27

### Added

- 1-1부터 1-10까지 MVP 스테이지 10개
- 스테이지 선택 작전도와 잠금·해금
- 권장 전투력, 최초 클리어 보상, 반복 보상
- 스테이지 최고 기록과 클리어 횟수
- 일반 몬스터 5종, 정예 2종, 보스 1종
- 메인 퀘스트 6종과 일일 퀘스트 3종
- 스테이지·처치·강화·아이템 획득 조건 추적
- 퀘스트 선행 조건과 보상 수령
- 1-1 이동·공격·스킬·회피·처치 튜토리얼
- 스테이지 구간별 아레나 색상 변형
- 저장 데이터 v3와 v1·v2 마이그레이션
- 스테이지·퀘스트·마이그레이션 회귀 테스트

### Changed

- 로비 전투 버튼을 스테이지 선택으로 변경
- 전투 승리 시 다음 스테이지 해금과 최초 보상 처리
- 결과 화면에 다음 스테이지와 작전도 이동 추가
- 장비 강화가 메인·일일 퀘스트 통계에 반영
- 버전을 v0.5.0으로 갱신

### Known limitations

- 스테이지 배경은 최종 타일 아트가 아닌 시스템 검증용 변형이다.
- 최종 캐릭터·몬스터 Sprite Atlas와 사운드는 v0.6 대상이다.
- 실제 Vite 빌드와 브라우저 실기동은 사용자 환경에서 최종 확인해야 한다.

## v0.4.0 - 2026-07-27

### Added

- 장비 JSON 9종과 Item Schema
- 무기·방어구·장신구 3부위
- 일반·희귀·영웅 3등급
- 저장 데이터 v2 인벤토리·장착 구조
- v1 저장 데이터 자동 마이그레이션
- 스타터 장비 3종과 자동 장착
- 인벤토리 화면
- 부위 필터와 전투력·등급·최근 정렬
- 장착·해제·강화·잠금·개별 판매
- 일반 등급 일괄 판매
- 장비 능력치와 전투력 계산
- 장비 능력치의 실제 전투 반영
- 스테이지 장비 드롭 테이블
- 결과 화면 장비 보상 표시
- 아이템·저장 마이그레이션 회귀 테스트
- 장비 시스템 문서

### Changed

- 플레이어 기본 저장 골드를 강화 테스트 가능한 900으로 조정
- Firestore와 LocalStorage Repository가 저장 v2를 사용하도록 변경
- 로비에 전투력과 장비 보너스 표시
- 전투 진입 시 저장 장비로 최종 전투 능력치 계산
- 버전을 v0.4.0으로 갱신

### Known limitations

- 인벤토리 UI는 기능 검증용 Pixi UI이며 최종 Glass UI가 아니다.
- 장비 아이콘과 캐릭터 외형 교체는 아직 연결되지 않았다.
- 강화 실패, 초월, 각성, 세트 효과는 MVP 이후다.
- 실제 Vite 빌드와 브라우저 실기동은 사용자 환경에서 최종 확인해야 한다.

## v0.3.0 - 2026-07-27

### Added

- 액션·플레이어·몬스터·스테이지 JSON 데이터
- 문서용 JSON Schema 4종
- 런타임 `GameDataRegistry` 검증 및 상호 참조 검사
- 3단계 웨이브 진행 시스템
- 정예 몬스터 `균열 감시자`와 2개 패턴
- 보스 `심연의 전령`과 3개 순환 패턴
- 공격 Telegraph와 보스 전용 체력바
- 화상 지속 피해와 둔화 이동 감소
- 정예·보스 상태 이상 지속시간 저항
- 전투 일시정지 및 거점 복귀
- 고품질·균형·절전 그래픽 품질 설정
- 전투 표시 계층 `BattleActorView`
- PNG 원본, WebP Atlas, JSON 프레임 샘플
- 게임 데이터와 Atlas 전용 검증 스크립트
- 데이터 및 Atlas 제작 문서
- 데이터·상태 이상·품질 설정 회귀 테스트

### Changed

- 전투 수치와 적 배치를 `BattleScene` 하드코딩에서 JSON으로 이전
- `MonsterController`를 Telegraph·패턴 순환·상태 이상 지원 FSM으로 확장
- 전투 결과 보상을 스테이지 JSON에서 읽도록 변경
- 로비에 데이터 검증 상태와 그래픽 품질 버튼 추가
- 버전을 v0.3.0으로 갱신

### Known limitations

- 캐릭터와 몬스터 본체는 여전히 시스템 검증용 Pixi Graphics다.
- Atlas 샘플은 파이프라인 검증용이며 최종 게임 아트가 아니다.
- 실제 OGG/Opus 사운드와 방향별 Sprite Animation은 아직 적용되지 않았다.
- 생성 환경의 npm Registry 제한으로 실제 Vite 빌드와 브라우저 실기동은 사용자 환경에서 최종 확인한다.

## v0.2.0 - 2026-07-27

### Added

- 게임 공식 작업명 `LUMERIFT: 균열의 계승자`
- 플레이어 전투 상태기계
- 3연속 기본 공격과 콤보 입력 예약
- 스킬 2종: 루멘 크래시, 리프트 노바
- 회피 이동, 무적 프레임, 회피 쿨다운
- 전방 부채꼴 및 원형 공격 판정
- 몬스터 추적·공격·피격·사망 FSM
- 몬스터 공격과 플레이어 HP/패배 흐름
- Camera Shake, Zoom Pulse, Hit Stop
- Object Pool 기반 전투 범위 이펙트
- 전투 결과 통계와 보상 저장
- 전투 기하, 상태기계, 몬스터 FSM, 보상 테스트
- 전투 시스템 및 릴리스 패키징 문서

### Changed

- 패키지 이름을 `lumerift-web-rpg`로 변경
- 버전을 v0.2.0으로 갱신
- 부트, 로그인, 로비, 결과 화면의 브랜드 문구 변경
- LocalStorage 키를 `lumerift.*`로 변경하고 기존 `rpg.*` 읽기 호환 유지
- 전투 테스트 씬을 실제 플레이 가능한 프로토타입으로 전면 교체

### Known limitations

- 현재 캐릭터와 몬스터는 시스템 검증용 Pixi Graphics다.
- 최종 PNG/WebP Sprite Atlas와 OGG/Opus 사운드는 아직 적용되지 않았다.
- 생성 환경의 npm Registry 연결 제한으로 실제 의존성 설치와 브라우저 실기동은 별도 환경에서 확인해야 한다.

## v0.1.0 - 2026-07-27

### Added

- 통합 개발 바이블 저장
- Vite + TypeScript + PixiJS 8 + Firebase 프로젝트 골격
- Boot, Login, Lobby, Battle, Result 씬
- 반응형 9:16 캔버스 및 Safe Area
- 키보드와 터치 이동 테스트
- 공격, 스킬, 적 처치, 결과 흐름
- Object Pool 기반 데미지 숫자
- 게스트 로컬 모드 및 Firebase 로그인 진입점
- 로컬/Firestore Player Repository
- FPS 계측과 60/30/Auto 모드
- SVG 금지와 PNG/WebP 정책 자동 검사
- 15MB 번들 예산 검사
- GitHub Actions 검증과 Pages 배포

## v1.0.0 - 2026-07-27

### Added

- 실제 공개 라이선스 게임 아트 기본 런타임 팩
- 플레이어 68프레임 Atlas와 기존 8방향 상태 키 연결
- 몬스터 8종·268프레임·종별 애니메이션
- 실사용 NineSlice UI 18종
- 실제 로비·전투 배경, 영웅·보스 초상
- 제3자 에셋 출처·라이선스·NOTICE
- 실사용 아트 검증 스크립트와 로비·전투 미리보기

### Changed

- 로비와 전투 기본 AssetCatalog 경로를 `assets/live/v1`로 변경
- 원형·절차형 몬스터 표시와 임의 tint를 실제 종별 스프라이트로 교체
- 기존 v0.9 절차형 자산을 레거시 갤러리로 이동
- 품질 단계를 `production-candidate-open-art-pass`로 변경
- 버전을 v1.0.0으로 갱신

### Known limitations

- 실제 게임용 공개 원본이지만 LUMERIFT 독점 최종 원화는 아니다.
- 플레이어는 전용 8방향 원화가 아니라 단일 연속 시트의 논리 매핑을 사용한다.
- 여러 공개 원본의 화풍·비율 통일과 실기기 검수가 추가로 필요하다.


## v1.0.1

- 배포본 용량 최적화
- 고해상도 원본·절차형 레거시·미사용 자산 제외
- 실사용 에셋 보관소로 축소
- MB 단위 보고 통일
- 삭제 목록·정리 스크립트 추가

## v1.0.2

- BattleActorView의 TS6133 미사용 매개변수·지역 변수 오류 수정
- v1.0.1 런타임 전용 최적화와 MB 표기 기준 유지
- 인수인계·릴리스 매니페스트 v1.0.2 갱신


## v1.0.3

### Fixed

- v1.0.2 경량 프로젝트를 전체 통합본으로 잘못 분류한 문제 수정
- `art_source` 고해상도 원본 79개와 레거시 보관 자산 복원
- 초기 15MB 다운로드 예산을 전체 런타임 자산 제한으로 잘못 적용하던 검사 수정

### Added

- 전체 자산 보존 자동 검사 `validate:archive`
- 전체 통합본과 선택적 경량 런타임 패키지의 명확한 구분
- 십진 단위 MB 보고 규칙 강화

## v1.1.0

- LUMERIFT 소유 제작 원본에 모바일 제작용 최대 해상도 적용
- PNG 재압축으로 art_source 약 502.76MB → 약 76.46MB 절감
- 공개 라이선스 제3자 원본은 출처 보존을 위해 원본 상태 유지
- `validate:sourceart` 자동 검사와 원본 120MB 예산 추가
- 인벤토리 UI에 등급 프레임·장착 배지·강화 진행률·요약 카드 적용
- 스테이지 선택 UI에 진행률·경로선·선택 배지·준비도 적용
- 결과 UI에 등급 메달·전투 통계·금속 보상 패널 적용
- BAT 파일을 선택적 Windows 편의 도구로 명시

## v1.2.0

### Changed

- 공통 UI를 Obsidian·Gold·Teal 디자인 시스템으로 교체
- 로비·전투 HUD·인벤토리·스테이지 선택·결과 화면 전면 재구성
- 플레이어·몬스터·배경·초상 기본 경로를 `live/v2`로 전환
- 전투 HP·보스 HP 갱신 좌표를 새 HUD와 일치하도록 수정

### Added

- `docs/VISUAL_AUDIT_v1.2.0.md`
- 주요 화면 미리보기 5종
- v1.2 UI·실사용 아트 자동 계약 검사
- 배우 Atlas 공통 대비·윤곽 보정 제작 도구

### Known limitations

- 캐릭터와 몬스터는 LUMERIFT 전용 독점 최종 원화가 아니다.
- 실기기 Safe Area·폰트·GPU 메모리 검수가 필요하다.

## v1.3.0

### Added

- 공지·출석·우편·쿠폰 통합 `OperationsScene`
- 운영·보상 아이콘 WebP Atlas 12종
- 주간 출석 보상과 우편 개별·일괄 수령
- 쿠폰 만료·중복 사용 검증
- Player Save v4 운영 상태
- Safe Area·동적 뷰포트·가상 키보드 레이아웃 컨트롤러
- 운영 화면 미리보기 4종
- `validate:operations`, `validate:mobile`

### Changed

- 로비 하단 탐색을 5개 메뉴로 확장하고 소식 알림 개수 표시
- 퀘스트 카드를 공통 금속 패널·상태 배지·진행 바로 통일
- 운영 보상이 실제 골드·인벤토리에 반영되도록 변경

### Known limitations

- 운영 원본 데이터와 보상 검증은 아직 로컬이며 Firebase·Cloud Functions 전환이 필요하다.
- 플레이어·몬스터 독점 최종 원화 제작은 계속 필요하다.

## v1.4.0 - 2026-07-27

- Firebase npm modular SDK 실제 프로젝트 연결
- 익명·Google·이메일 Authentication 및 계정 연결
- Firestore 오프라인 캐시와 resilient Cloud Save
- 원격 공지 캐시 및 폴백
- Firestore Security Rules·Indexes·Emulator
- Analytics·App Check 선택 초기화

## v1.4.1

- Firebase Rules·Indexes 배포 스크립트 누락 복구
- `--only firestore` 공식 부분 배포 방식으로 통일
- 로컬 프로젝트 루트 및 package.json 버전 확인 절차 추가

## v1.4.2 - 2026-07-27

### Changed

- Firebase App Check 런타임 초기화 완전 제거
- reCAPTCHA 사이트 키 환경변수와 GitHub Actions Secret 주입 제거
- Firebase Console enforcement 비활성화 정책 확정
- App Check 재도입 방지 검증 추가

### Unchanged

- 익명·Google·이메일 Authentication
- Firestore Cloud Save·오프라인 캐시
- 원격 공지와 Analytics


## v1.6.0 - 2026-07-27

### Added

- 전체 public 에셋 해시·분류 레지스트리
- v1.5.0 → v1.6.0 무손실 자산 이동 계획과 적용 스크립트
- public 잔존 파일·보관 해시·런타임 참조·6MB 예산 검사
- 활성/보관/원본 자산 분리 보고서

### Changed

- GitHub Pages 배포 대상 `public/assets`를 23.60MB에서 3.90MB로 정리
- 구버전·품질 후보·미사용 지역 자산 182개·19.70MB를 `art_source/runtime_archive/v1.6.0`으로 이동
- Atlas 보고를 활성 6개와 보관 43개로 분리
- 전체 49 Atlas·3,206프레임·451애니메이션 보존

### Removed

- 내용이 없는 `.gitkeep` 4개

### Unchanged

- 게임 UI·전투·계정·Cloud Save·랭킹 동작
- Firebase App Check 비활성화 결정
- 모바일 제작용 원본과 제3자 라이선스 보존


## v1.7.0 - 2026-07-27

### Added
- Chapter 1 4단계 전투 배경과 StageVisualProfile
- 보스 3페이즈 초상
- v1.7 VFX 40프레임 Atlas
- 아트 통일 미리보기 5종과 `ART_UNIFICATION_v1.7.0.md`

### Changed
- 플레이어·몬스터 기본 Atlas를 live/v4로 교체
- 로비 배경·영웅 초상 기본 경로를 live/v4로 교체
- 활성 public 자산 예산을 8MB 이내로 재설정

### Archived
- v2 플레이어·몬스터·배경·초상과 기존 combat VFX를 runtime_archive/v1.7.0으로 이동

## v1.8.0 - 2026-07-28

### Added
- 보스 3페이즈 시네마틱 프레젠테이션
- Cloud Save 복구 지점 최대 5개
- 전체·주간·28일 시즌 랭킹

### Changed
- 공격 경고·실제 판정·타격 표시를 공통 AttackFootprint로 통합
- seasonRankings 보안 규칙과 복합 색인 추가

### Security
- App Check 비활성화 유지, UID 소유권 규칙 유지


## v1.8.1 - 2026-07-28

### Fixed
- VirtualJoystick의 PixiJS 8 비호환 객체형 lineStyle 호출을 stroke 경로 호출로 교체
- GitHub Actions TypeScript TS2345 빌드 실패 복구

### Added
- VirtualJoystick 객체형 lineStyle 재도입 방지 소스 검사

### Unchanged
- v1.8.0 게임 기능·Firebase·에셋

## v1.9.0 - 2026-07-28

### Added
- LUMERIFT 타이틀·로그인 시작 화면
- Luminous UI Atlas 30프레임과 공통 아이콘 30프레임
- `UiTheme` 공통 아이콘·재화 칩·메뉴 타일·구분선
- 전체 UI 시스템 문서와 v1.9 시각 감사

### Changed
- Boot, Login, Lobby 전면 리빌드
- 공통 `UiButton`, `SceneChrome`, NineSlice 패널 체계 강화
- Battle 하단 조작부를 공통 컨트롤 도크로 정리
- 문서용 시안을 모바일 검토 WebP로 최적화

### Archived
- `ui_obsidian_v2` JSON/WebP를 runtime_archive/v1.9.0으로 이동

### Unchanged
- v1.8 보스 판정·복구 지점·시즌 랭킹
- Firebase App Check 비활성화


## v1.11.1 - 2026-07-28

### Added
- entry·balanced·performance 기기 보정과 전투 렌더 편향
- 플레이어 모션 디렉터, 회피 잔상, Drive 오라
- 보스 장판 3단계 위험 언어와 패턴 시간 눈금
- 단일 포인터 전투 입력 게이트
- 8방향 4동작 제작용 모션 블록아웃

### Changed
- 적응형 품질 임계값과 렌더 예산을 기기 등급에 연결
- Device QA JSON에 보정 등급과 선정 근거 추가

### Unchanged
- 신규 런타임 이미지, 저장 스키마, Firebase, AttackFootprint

## v1.11.2

- 선택형 LUMERIFT 소유 플레이어 런타임 Atlas 128프레임·80애니메이션 추가
- 기본 고급 원화 유지, Lazy Loading 및 로딩 실패 자동 복구
- 플레이어 원화 선택 localStorage 설정 추가
- 3초 간격 실기기 QA 세션과 Device QA JSON v2 추가
- 배터리 지원 여부·시작·종료값과 화면 방향·visibility·품질 변경 요약 추가
- v1.11.2 전용 자산·세션·런타임 연결 검증 추가


## v1.11.3

- Device QA JSON v3와 안정성 점수·신뢰도·권장 FPS/그래픽 자동 분석 추가
- 선택형 LUMERIFT 전용 플레이어 도색 후보 v7 Atlas 추가
- 전투 진동·화면 낭독 접근성 설정과 보스/정밀 회피/저체력 피드백 연결
- 공격·치명타·스킬·회피·Overdrive 다층 음향 디렉터 추가
- v1.11.3 누적 검증과 릴리스 정합성 검사 추가


## v1.11.4
- 가상 조이스틱 방향 반전 보정과 사용자 순환 교정 추가
- 캐릭터 그림자·포커스 링·실루엣 glow 강화
- 공통 UI 팔레트와 패널 대비 개선
- ASSET_REGISTRY 1.11.4 재생성 및 v1.11.3 누적 검증의 상위 버전 호환 수정


## v1.11.5
- 웹툰형 클린 UI 패널·버튼·조이스틱 장식 보강
- HERO CUT / HYPE METER / ATTACK VECTOR 중심의 전투 HUD 재정리
- 공격 방향 VFX 화살표, CHAIN·CRITICAL 배너, CRIT/BURN/HIT 플로팅 텍스트 추가
- v1.11.5 누적 검증과 릴리스 버전 체계 갱신

- v1.11.5 CI hotfix: 3초 QA 표본의 신뢰도 시간/개수 기준 정렬 및 경계 테스트 추가


## v1.11.6 - 2026-07-29
- 캐릭터 8방향 이동 스무딩과 자연스러운 보행 리듬을 적용했다.
- 방향 리본, 발자국 하이라이트, 실루엣 보조 광택을 추가해 이동 그래픽 디테일을 높였다.
- Graphics 기반 polish로 구현해 신규 대용량 자산 없이 기존 자산 정책을 유지했다.


## v1.11.7 - 2026-07-29
- 자동 타겟팅 기본 ON과 선택형 자동 전투 기본 OFF를 추가했다.
- 수동 입력 우선·텔레그래프 회피·거리 조절·스킬·콤보 자동 판단을 적용했다.
- Boot·Login·Lobby·SceneChrome·Battle의 인터페이스 언어를 리뉴얼했다.


## v1.11.8 - 2026-07-29
- 초대규모 RIFT INTERFACE 리뉴얼 적용
- 자동 타겟 우선순위·자동 스킬·자동 회피·보스전 제한 추가
- 실기기 반응 프리셋 3종 추가


## v1.11.9 - 2026-07-29
- 자동 타겟 점수·선정 이유와 자동 전투 행동 이유를 HUD에 표시했다.
- HP 조건형 자동 스킬, 보스 회피 정책, 수동 복귀 지연 설정을 추가했다.
- 작은 화면·키보드용 전투 Safe Area 레이아웃을 추가했다.
- 8방향 공격 포즈와 스트라이크 실루엣을 강화했다.

## v1.11.12
- AUTO ASSIST REPORT 및 전투 세션 통계 추가
- 보스 패턴별 자동 회피 규칙 추가
- HP·Drive·타겟 HP 복합 자동 스킬 판단 추가
- iOS·Android Safe Area 보정 추가

## v1.11.21 - 2026-07-31

### Added
- 캐릭터 스튜디오 8방향 수동 회전
- 무기·방어구·장신구 현재/교체 후 외형 동시 비교
- 검·대검·장창별 본체 공격 프레임 레시피와 접촉 타이밍
- 장비 세트 코스튬 3종과 갑주·망토·룬 세부 염색 채널
- 최근 외형 프리셋 최대 5개 빠른 적용
- Android Chrome·iOS Safari 캡처 준비용 캐릭터 표시 보정

### Changed
- 로비·전투가 캐릭터 스튜디오의 코스튬·세부 염색 상태를 공유
- v1.11.20 로컬 외형 슬롯을 방향·코스튬·채널 기본값으로 자동 마이그레이션
- 무기별 모션 타이밍을 본체 프레임·프레젠테이션·전투 행동 복사본에 통합

### Known limitations
- 실제 Android Chrome·iOS Safari 물리 기기 캡처와 성능·발열 측정은 수행하지 않았다.
- 전용 공격 본체 프레임은 기존 v10 Atlas 재구성이며 신규 수작업 Atlas가 아니다.

## v1.11.22 - 2026-07-31

### Added
- 검·대검·균열 장창 전용 공격 본체 Atlas v11 432프레임·72애니메이션
- 무기·갑주·망토·룬 파트 집중 보기와 3단계 확대
- 외형 프리셋 이름·즐겨찾기·삭제·JSON 내보내기/가져오기
- 외형 프리셋 관리 전용 화면

### Changed
- 공격 포즈에서 v11 전용 Atlas 우선, v10 프레임 레시피 폴백
- v1.11.21 외형 데이터에 ID·이름·즐겨찾기 기본값 자동 마이그레이션

### Known limitations
- 공격 Atlas는 v10 본체 파생 제작 후보이며 최종 수작업 원화가 아니다.
- Android/iOS 물리 캡처 승인은 대기 상태다.

## v1.11.23 - 2026-07-31

- 갑주·망토·룬 독립 프로그램 런타임 레이어를 전투·아틀리에에 연결했다.
- 외형 프리셋 정렬·검색과 3개 슬롯 고정 보호를 추가했다.
- 외형 JSON Archive를 v2로 확장하고 v1 가져오기 하위 호환을 유지했다.
- Android Chrome·iOS Safari 실기기 캡처 승인 템플릿과 증빙 검증 흐름을 추가했다.
- 승인 JSON이 있는 플랫폼만 로컬 `capture-verified` 보정값을 사용한다.
- 선택형 외형 Cloud Save 봉투·UID 가드·문서 경로 계약을 설계했다.
- 외부 npm DNS 불가로 실제 Vitest·Vite production build는 수행하지 못했다.


## v1.11.24 - 2026-07-31

- 사용자 동의 기반 외형 프리셋 Firestore 실제 읽기·쓰기를 연결했다.
- revision 비교, 충돌 중지, 실패 업로드 재시도 큐, 고정 슬롯 병합을 추가했다.
- 외형 Archive v3와 슬롯 순서 변경을 추가하고 v1·v2 가져오기를 유지했다.
- 갑주·망토·룬 아이템 계열별 프로그램 마스크를 추가했다.
- 검·대검·균열 장창 공격 본체 프레임 정렬 보정을 추가했다.
- Firestore Rules와 emulator 테스트 계약을 확장했다.

## v1.11.25 - 2026-07-31

- 외형 슬롯 3개·슬롯 순서·고정 상태·최근 프리셋을 각각 선택하는 Cloud 충돌 비교 화면 추가
- 슬롯별 로컬·Cloud·최신 선택과 고정 슬롯 강제 보호 추가
- 최근 외형 프리셋 중복 제거·즐겨찾기 보존·최신 우선 선택 병합 추가
- Cloud 업로드·충돌 병합·복구 적용 전 외형 Archive 자동 복구 지점 추가
- UID별 최대 5개 복구 지점과 JSON 내보내기·가져오기 추가
- 외형 Archive 전체 교체 API와 선택 병합 실행 하네스 추가
- 신규 런타임 이미지 없이 기존 자산 예산 유지

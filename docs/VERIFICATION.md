# Verification Report

검증일: 2026-07-27  
대상: LUMERIFT v0.7.0

## 통과한 자동 검증

- JSON 전체 파싱
- 액션·플레이어·몬스터·아이템·스테이지·퀘스트 상호 참조
- 스테이지 10개와 순서·이전 스테이지 검증
- 일반 5종·정예 2종·보스 1종 수량 검증
- 최초 보상과 드롭 아이템 참조
- 메인·일일 퀘스트 조건과 선행 퀘스트 참조
- Atlas 이미지와 프레임 범위
- 상대 import 경로
- SVG/SVGZ 및 금지 이미지 포맷 검사
- 임시 외부 모듈 스텁 기반 TypeScript strict 의미 검사
- 최초·반복 클리어, 다음 스테이지 해금 회귀
- 퀘스트 진행과 보상 중복 방지 회귀
- 장비 강화 통계 회귀
- 저장 v2 → v3 마이그레이션 회귀
- Node 검증 스크립트 구문

## 런타임 로직 검증 결과

```text
PASS runtime progression: stages, first clear, repeat clear, quests, upgrades, v3 migration
```

## 생성 환경 제한

npm Registry 응답이 제한 시간 내 완료되지 않아 실제 의존성 설치가 완료되지 않았다. 다음 항목은 사용자 네트워크 환경에서 최종 확인한다.

- 실제 PixiJS/Firebase/Vite 패키지 타입 검사
- Vitest 전체 실행
- Vite production build
- 브라우저 실기동
- package-lock.json 생성

## 사용자 환경 검증

```bash
npm install
npm run verify
npm run dev
```

확인 순서:

1. 로비에서 스테이지 선택 진입
2. 1-1 튜토리얼 진행 또는 건너뛰기
3. 최초 클리어 보너스와 1-2 해금
4. 1-1 재도전 시 최초 보상 미지급
5. 메인 퀘스트 보상 수령과 다음 퀘스트 개방
6. 장비 강화 후 퀘스트 진행도 반영
7. 재접속 후 스테이지·퀘스트·장비 유지


## v0.6.0 추가 검증

- 전체 4개 Atlas, 308 프레임, 98 애니메이션 참조 검사
- PNG/WebP 및 SVG 금지 검사
- TypeScript strict 의미 검사
- 초기 로딩 입력 15MB 예산 검사
- 전체 ZIP과 누적 패치 파일 무결성 검사

## v0.7.0 추가 검증

- PNG/WebP·OGG·Opus 파일 정책과 시그니처 검사 통과
- 6개 Atlas, 342개 프레임, 103개 애니메이션 검사 통과
- 플레이어 8방향·10상태와 몬스터 등급별 상태 키 검사 통과
- 장비 9종 및 VFX 5종 필수 프레임 검사 통과
- 4개 에셋 번들, 23개 파일, 505,417 bytes Manifest 검사 통과
- 초기 다운로드 입력 추정 303.0 KB / 15 MB 예산 통과
- 상대 import 및 외부 모듈 스텁 기반 Strict TypeScript 의미 검사 통과
- 보스 2·3페이즈 임계값과 Object Pool 재사용 회귀 통과

실제 npm 패키지 기반 `npm run verify`는 Registry 접근 가능한 사용자 환경에서 최종 실행한다.

## v0.8.0 추가 검증

- 16개 Atlas, 1,174프레임, 127애니메이션 검사
- 메가팩 분류별 필수 수량 검사
- 13개 Asset Manifest Bundle 실파일·바이트 검사
- AGENTS와 4개 인수인계 핵심 파일 검사
- package, brand, release, handoff, asset manifest 버전 일치 검사
- 에셋 보관소 상대 import와 번들 경로 검사

## v0.9.0 추가 검증

- `scripts/validate-art-quality.mjs`
  - 품질 단계 `production-candidate-procedural`
  - 신규 Atlas 26개·프레임 1,300개·애니메이션 32개
  - 런타임 품질팩 10MB 이상
  - 원본 PNG 300MB 이상
  - 원본·런타임 합계 350MB 이상
  - 품질 단계와 과장 보고 방지 문구
- 누적 Atlas 기대치: 42개, 2,474프레임, 159애니메이션
- ASSET_MANIFEST 품질 카테고리 번들 경로·바이트 검사
- 에셋 품질 보관소 상대 import와 분류별 Lazy Loading 계약 검사


## v0.9.1 빌드 복구 검증

- `validate:config`: 객체형 manualChunks 재도입 방지
- `tsc -b`: Vite 설정 포함 Strict TypeScript 검사
- `vite build`: PixiJS/Firebase 함수형 청크 분할 확인
- GitHub Actions: Node.js 24 및 최신 호환 메이저 확인

## v1.0.0 실사용 아트 검증

- 라이브 Atlas 3개·354프레임·146애니메이션
- 몬스터 8종별 6개 상태 애니메이션 계약
- 기본 AssetCatalog이 실제 라이브 아트 경로를 가리키는지 검사
- 로비·전투·영웅·보스·UI 필수 파일 검사
- 제3자 라이선스 8개 그룹과 NOTICE·문서 검사
- 누적 45 Atlas·2,828프레임·305애니메이션 검사
- 초기 입력 추정 약 491KB / 15MB 검사


## v1.0.1 검증 추가

- `art_source` 및 레거시 품질팩의 기본 배포본 잔존 여부 검사
- 활성 런타임 Atlas만 검사
- 전체 런타임 자산과 초기 입력 용량을 MB로 보고
- 삭제 적용 후 전체본과 파일 해시 일치 검사

## v1.0.2 검증 추가

- `BattleActorView.update`의 의도적 미사용 시간 매개변수는 `_deltaSeconds`로 표기한다.
- 사용하지 않는 구조 분해·지역 변수는 릴리스 전에 제거한다.
- CI의 `typecheck`가 에셋 검사보다 먼저 실행되어 TypeScript 회귀를 빠르게 차단한다.


## v1.0.3 전체 자산 보존 검증

- `art_source` 파일 79개 이상
- `art_source` 합계 450MB 이상
- v0.8·v0.9 레거시 Atlas와 품질 후보 자산 존재
- 기본 AssetCatalog은 레거시 품질팩을 참조하지 않음
- 전체 프로젝트 보관 용량과 초기 다운로드 15MB를 별도 검사
- 사용자 보고 단위는 십진 MB

## v1.1.0 모바일 원본·UI 검증

- `validate:sourceart`: 79개, 76.46MB, 소유 원본 54.33MB 통과
- `validate:archive`: 전체 원본·레거시 보관 자산 통과
- Atlas: 45개·2,828프레임·305애니메이션 통과
- 활성 런타임: 4.26MB 통과
- 초기 입력 예상: 0.35MB / 15MB 통과
- 인벤토리·스테이지 선택·결과 UI TypeScript 구문 및 상대 import 검사 통과
- npm Registry 응답 제한으로 실제 의존성 기반 typecheck·Vitest·Vite build는 GitHub Actions에서 최종 확인 필요

## v1.2.0 시각 리셋 검증

- v2 UI·플레이어·몬스터·배경·초상 파일 존재
- 로비·전투·인벤토리·스테이지·결과 코드 마커 검사
- HP·보스 HP 갱신 좌표와 새 HUD 좌표 일치
- 5개 화면 미리보기 존재
- 대체 Strict TypeScript 검사 통과
- 실제 npm 의존성 기반 최종 빌드는 Registry 사용 가능한 CI에서 확인

## v1.3.0 운영·모바일 검증

- `validate:operations`: 운영 Atlas 12프레임, 4개 화면, 저장 v4, 로비 연결 검사
- `validate:mobile`: viewport-fit, Safe Area, 100dvh, visualViewport, 키보드 오프셋 검사
- 운영 로직 테스트: 출석 중복 방지, 주간 주기, 우편 일괄 수령, 쿠폰 중복 방지
- 대체 Strict TypeScript 검사 통과
- 누적 Atlas 49개·3,206프레임·451애니메이션 검사
- 초기 입력 예상 0.61MB / 15MB 검사
- 실제 npm 의존성 기반 최종 빌드는 Registry 사용 가능한 CI에서 확인

## v1.4.2 Firebase App Check 비활성화 검증

- FirebaseGateway에 `firebase/app-check` import가 없음
- App Check 초기화 함수와 reCAPTCHA provider가 없음
- `.env.example`에 App Check 사이트 키가 없음
- GitHub Pages·Verify Workflow에 App Check Secret 주입이 없음
- 익명·Google·이메일 Auth와 Firestore 오프라인 캐시 계약 유지
- `validate:firebase`가 App Check 재도입을 실패 처리
- 대체 Strict TypeScript 검사 통과

## v1.5.0 검증

- `npm run validate:account`: 계정 연결·Cloud Save 충돌·수동 동기화·랭킹 계약 검사
- `npm run firebase:test:rules`: Auth·Firestore Emulator 권한 검사
- 대체 Strict TypeScript 검사에서 신규 소스 오류 0건
- 전체·주간 랭킹 색인 및 App Check 비활성화 계약 확인

## v1.6.0 검증

- `validate:asset-cleanup`: public 허용 목록, 6MB 예산, 이동 자산 해시, 소스 참조를 검사한다.
- `report:asset-cleanup`: 활성·보관·원본 용량을 분리해 보고한다.
- `report:inventory`: 활성 6 Atlas와 보관 43 Atlas, 총 49 Atlas를 확인한다.
- `validate:archive`: 이동 후에도 전체 통합본 보관 자산이 존재하는지 확인한다.
- v1.5.0 패치 적용 검증에서는 오버레이 후 `asset:relocate`를 실행하고 v1.6.0 전체본과 전체 파일 해시를 비교한다.


## v1.7.0 추가 검증

- active Atlas 6개·427프레임·151애니메이션 검사
- 전체 보존 52 Atlas·3,582프레임·602애니메이션 검사
- v1.7 실사용 아트 15개·약 4.67MB 검사
- Chapter 1 배경 4티어와 보스 초상 3페이즈 계약 검사
- StageVisualProfile 순수 로직 테스트 추가
- v1.6·v1.7 relocation plan 전체 SHA-256 검사
- v1.6.0 패치 적용 후 전체본 파일 일치 검사

## v1.8.0 추가 검증

- `npm run validate:combat`
- `npm run validate:account`
- 순수 로직 JavaScript 실행: 정확한 공격 범위, 보스 3페이즈, 복구 5개, 28일 시즌
- Firestore Emulator: 다른 UID의 시즌 랭킹 쓰기 차단


## v1.8.1 추가 검증

- `VirtualJoystick.ts`에 객체형 `.lineStyle({`가 없는지 검사
- 십자 가이드 경로 뒤 `.stroke({ color: COLORS.primaryBright, alpha: 0.1, width: 2 })` 존재 검사
- `npm run typecheck`와 `npm run build`로 GitHub Actions TS2345 재현 여부 확인

## v1.9.0 추가 검증

- `validate:ui`: 타이틀, 로그인, 로비, 공통 스킨, 전투 컨트롤, 기존 주요 화면 계약
- `validate:atlas`: 활성 7 Atlas·457프레임·151애니메이션
- `validate:asset-cleanup`: 구형 v2 UI 아카이브 이동과 public 8MB 예산
- `validate:sourceart`: 모바일 제작용 원본 120MB 상한
- 패치 검증: v1.8.1 + v1.9.0 패치 + `asset:relocate` 결과를 전체본과 SHA-256 비교


## v1.10.1 추가 검증

- `npm run validate:mobile:v111`
- 변경 TypeScript 전수 구문 변환 검사
- 자산 레지스트리에 v1.10.1 실루엣 원본·규격 JSON 포함
- v1.10.0 + 패치 결과와 전체 v1.10.1 파일 해시 비교
- 물리 단말 FPS·표면 온도는 자동 검증 통과 항목으로 간주하지 않음


## v1.11.0 추가 검증

- `npm run validate:upgrade:v111`: Rift Drive, D~SS 스타일, 정밀 회피, 적응형 렌더 예산과 UI 깊이 계약
- `npm run validate:data`: 5개 행동의 impactTier·driveGain·driveCost·comboWindow 검증
- TypeScript 프로젝트 검사: 변경된 앱 소스의 엄격 타입 검사
- 순수 런타임 하네스: Drive 소비·스타일 등급·렌더 예산 축소·공격 후 캔슬·쿨다운 감소
- 자산 보고: 신규 런타임 이미지 0개, 초기 입력 추정치 15MB 이하
- 패치 검증: v1.10.1 + v1.11.0 패치 결과와 전체본 전체 파일 SHA-256 비교
- 물리 단말 FPS·온도·배터리·GPU 메모리는 자동 통과 항목으로 간주하지 않는다.

## v1.11.2 검증

- `validate:upgrade:v1112`는 128프레임·80애니메이션·8방향·10상태를 검사한다.
- 선택형 Atlas가 기본 초기 번들에 포함되지 않고 별도 Lazy Loading 번들에만 등록됐는지 검사한다.
- 원화 선택 저장, 전투 자동 폴백, 실제 방향 미러링 정책을 검사한다.
- Device QA JSON v2와 3초 세션, 배터리 선택 기록, 온도·GPU null 정책을 검사한다.


## v1.11.3 검증

- v1.11.3 누적 정적 검사
- QA 분석 순수 로직 하네스
- 진동 스로틀 순수 로직 하네스
- 전투 음향 큐 레이어 순수 로직 하네스
- TypeScript 구문 파싱
- 전체·패치 ZIP CRC 및 패치 적용 SHA-256 대조
- 물리 단말 계측과 네트워크 의존 npm 전체 빌드는 별도 기록

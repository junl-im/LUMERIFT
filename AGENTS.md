# LUMERIFT 작업자 절대 규칙

이 파일은 사람·AI·자동화 작업자가 프로젝트를 이어받을 때 가장 먼저 읽는 진입점이다.

## 시작 전 필수 순서

1. `docs/MASTER_BIBLE.md`를 읽는다.
2. `docs/HANDOFF_MASTER.md`를 읽는다.
3. `HANDOFF_STATE.json`에서 현재 버전, 완료·진행·예정 상태를 확인한다.
4. `docs/HANDOFF_LOG.md`의 마지막 릴리스 기록을 확인한다.
5. 기존 기능·파일을 근거와 인수인계 기록 없이 임의로 삭제하거나 축소하지 않는다.

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
- 패치 ZIP은 사용자가 마지막으로 받은 직전 배포 버전 기준으로 제공한다. 필요 시 별도 누적 패치를 추가한다.
- 기준 버전에 덮어쓴 결과가 전체 통합본과 일치하는지 대조 검증한다.
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

## 에셋 단계 및 품질 진실성 규칙

에셋 규모·용량·프레임 수와 시각적 완성도는 별개다. 구조용 자산을 최종급으로 보고하지 않는다.

모든 신규 자산은 다음 중 하나로 표시한다.

- `prototype`: 임시 기능 검증
- `production-structure`: 경로·Atlas·성능 계약 검증
- `production-candidate-procedural`: 고해상도 절차형 제작 후보. 외부 아트 디렉션과 수작업 리터칭 전에는 final 또는 AAA라고 부르지 않는다.
- `production-candidate-open-art-pass`: 명시적 재배포 라이선스가 있는 실제 게임용 공개 원본을 기본 런타임에 적용한 단계. 독점 원화·최종 세계관 통일 전에는 final 또는 AAA라고 부르지 않는다.
- `final-candidate`: 수작업 원화·리터칭·모바일 실기기 검수를 통과한 상용 후보
- `final-approved`: 아트 디렉터 승인, 저작권 확인, 성능 QA까지 완료한 최종 자산

### 필수 보고 항목

에셋 릴리스는 반드시 다음을 기록한다.

- 런타임 자산 용량과 원본 보관 자산 용량
- Atlas 수, 프레임 수, 애니메이션 수
- 해상도와 포맷
- 현재 품질 단계
- 최종 상용 원화 여부
- Lazy Loading 및 초기 15MB 예산 영향

`production-candidate-procedural` 이하 자산을 최종급으로 보고하지 않는다. 자동 생성 수량만으로 고품질·AAA·최종 완성을 주장하지 않는다.


## Vite 8 빌드 규칙

- `build.rollupOptions.output.manualChunks`는 반드시 함수 형식으로 작성한다.
- 객체 별칭 형식은 TS2769 재발 원인이므로 금지한다.
- CI는 Node.js 24 호환 GitHub Actions 메이저를 사용한다.

## 실사용 에셋 완료 판정

- 실제 로비·전투·인벤토리 등 런타임 화면에 기본 연결되어야 완료로 기록한다.
- 외부 에셋은 제작자, 라이선스, 원본 이름, 가공 범위를 `docs/THIRD_PARTY_ASSETS.md`와 기계 판독 JSON에 기록한다.
- 여러 출처를 혼합한 공개 에셋 패스는 독점 IP 아트 또는 최종 AAA 아트로 표현하지 않는다.
- 기본 경로에서 빠진 기존 절차형 자산은 레거시 보관소로만 유지한다.

## 배포 용량 및 표기 규칙

- 사용자 보고의 파일 용량은 십진 단위 `MB`로 표기한다. `MiB`는 기술 참고가 꼭 필요한 경우에만 병기한다.
- **전체 통합 ZIP에는 코드·문서·런타임 자산·모바일 제작용 원본·라이선스·레거시 보관 자산을 모두 포함한다.**
- 전체 통합 ZIP에서 원본이나 기존 자산을 근거 없이 삭제하지 않는다. 단, 모바일 제작 품질에 영향이 없는 과도한 해상도·비압축 원본은 문서화된 규격에 따라 최적화할 수 있다.
- 경량 실행본이 필요하면 `LUMERIFT_RUNTIME_...zip` 또는 `LUMERIFT_DEPLOY_...zip`으로 별도 제공하며 전체 통합본이라고 부르지 않는다.
- 초기 다운로드 15MB 기준은 최초 로드 번들에만 적용하며 전체 프로젝트·전체 자산 용량과 혼동하지 않는다.
- `art_source`는 전체 통합본에 보존하지만 `public` 밖에 두어 GitHub Pages 배포와 초기 다운로드에는 포함하지 않는다. LUMERIFT 소유 원본은 `docs/SOURCE_ART_POLICY.md`의 모바일 제작용 상한을 따른다.
- 레거시 제작 후보 자산은 전체 통합본에 보존하되 기본 `AssetCatalog`에서 참조하지 않는다.
- 모든 릴리스에서 `npm run validate:archive`로 원본·보관 자산 누락 여부를 검사한다.

## BAT 파일 정책

- `INSTALL_AND_START.bat`와 `VERIFY.bat`는 Windows 편의용 선택 도구다.
- npm 명령과 GitHub Actions가 공식 기준이며 BAT 파일이 없어도 빌드·검증·배포가 가능해야 한다.
- BAT 내부 버전·Node 요구 조건은 현재 릴리스와 일치시킨다.

## UI·그래픽 완료 판정

- 화면을 기능만 연결한 상태로 완료 처리하지 않는다.
- 로비·전투·인벤토리·스테이지·결과 등 주요 화면은 런타임 연결, 미리보기, 시각 감사 문서, 자동 검사까지 있어야 완료다.
- 대시보드형 텍스트 패널 반복, 동일 사각 버튼 반복, 서로 다른 화풍의 무분별한 혼합을 금지한다.
- 정보 우선순위, 터치 영역, Safe Area, 전투 가시 영역, 명도 대비를 검수한다.
- 공개 원본 색보정은 통일 패스일 뿐 독점 최종 원화 제작으로 보고하지 않는다.

## 운영 보상·저장 규칙

- 공지·출석·우편·쿠폰의 읽음·수령·사용 이력은 `PlayerProfile.operations`에 저장한다.
- 로컬 개발 모드에서도 동일 보상을 두 번 지급하지 않는다.
- 온라인 운영 전환 시 출석 날짜, 쿠폰 유효성, 우편 첨부 보상은 서버 시간과 Cloud Functions에서 재검증한다.
- 운영 화면 완료 판정에는 런타임 연결, 저장 마이그레이션, 중복 방지, 미리보기, 자동 검사가 모두 필요하다.

## Firebase 고정 규칙

- Web Config는 공개 식별자이므로 소스에 포함할 수 있지만 서비스 계정 JSON, Admin SDK 비공개 키, reCAPTCHA secret은 절대 커밋하지 않는다.
- Firebase 클라이언트 SDK는 npm modular API를 사용하고 CDN script 방식과 compat API를 혼용하지 않는다.
- 모든 Firestore 경로는 기본 거부이며 사용자 데이터는 `request.auth.uid`로 소유권을 확인한다.
- 쿠폰, 고가치 우편, 서버 출석 보상은 클라이언트 계산만으로 최종 승인하지 않는다.
- 규칙 변경 시 `npm run validate:firebase`와 Emulator 권한 테스트를 수행하고 인수인계 파일을 갱신한다.
- Spark 무료 할당량을 보호하기 위해 공지 캐시, 저장 쓰기 최소화, 무제한 실시간 리스너 금지를 유지한다.

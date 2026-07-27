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

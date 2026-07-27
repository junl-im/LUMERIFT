# LUMERIFT 통합 인수인계 문서

**현재 버전:** v0.9.1  
**갱신일:** 2026-07-27  
**상태:** 대규모 에셋 디자인·해상도·품질 기반 개선 완료

## 1. 프로젝트 목적

LUMERIFT는 모바일 브라우저에서 빠르고 아름답게 실행되는 세로형 2.5D 액션 RPG다. 처음부터 MMORPG를 구현하지 않고 전투 손맛, 빠른 로딩, 성장 루프, 확장 가능한 데이터 구조를 먼저 완성한다.

## 2. 현재 완료 범위

- Vite, TypeScript, PixiJS 8, Firebase 연결 계층
- Boot, Login, Lobby, Stage Select, Battle, Result, Inventory, Quest, Asset Gallery
- 이동, 3연속 공격, 스킬 2종, 회피, 상태 이상, 보스 3페이즈
- 스테이지 10개, 메인·일일 퀘스트, 장비·강화·인벤토리
- 로컬 저장과 Firestore Repository 분리, 저장 데이터 v3
- Atlas, Lazy Loading, Object Pool, 60·30FPS, 품질 자동 조절
- v0.8 구조팩 1,174프레임·127애니메이션
- v0.9 품질팩 26 Atlas·1,300프레임·32애니메이션
- 누적 2,474 Atlas 프레임·159애니메이션

## 3. v0.9.0 에셋 품질팩

- 영웅 초상 8종
- 보스 초상 12종
- NPC 초상 16종
- 장비·아이템 아이콘 384종
- 스킬 아이콘 160종
- 환경 오브젝트 240종
- VFX 32세트·384프레임
- 프리미엄 UI 프레임 96종
- 5개 지역 키아트 10종
- 5개 지역 전투 배경 15종
- 런타임 WebP 약 12.31MiB
- 고해상도 PNG 원본 약 458.36MiB

## 4. 품질 단계

현재 단계는 `production-candidate-procedural`이다.

의미:

- 경로, Atlas, 해상도, 용량, Lazy Loading 계약을 실제 자산으로 검증했다.
- v0.8의 소형 구조용 자산보다 디테일과 해상도가 크게 향상됐다.
- 절차형 기반이므로 손·얼굴·재질·구도·세계관 일관성에 수작업 리터칭이 필요하다.
- `final-candidate` 또는 `final-approved`로 표현해서는 안 된다.

## 5. 런타임 사용 원칙

- `art_source`는 보관용이며 배포하지 않는다.
- `public/assets/atlases/quality`와 `public/assets/loading/quality`, `public/assets/maps/quality`만 런타임 후보이다.
- 에셋 품질 보관소는 카테고리별 번들만 로드하고 이동 시 이전 번들을 해제한다.
- 초기 부트 번들에는 품질팩을 포함하지 않는다.
- 최종 원화 교체 시 `quality.*` 프레임 키를 유지한다.

## 6. 다음 작업 우선순위

1. Firebase 인증과 게스트 → Google 계정 승격
2. Cloud Save 충돌 해결, 재시도 큐, 데이터 버전 관리
3. 공지, 7일 출석, 우편, 쿠폰, 랭킹
4. 영웅·보스·NPC 수작업 리터칭과 `final-candidate` 승격
5. Chapter 1 배경과 UI를 실제 전투·로비에 단계적으로 적용
6. Android Chrome·iOS Safari 실기기 성능 검증

## 7. 작업 시작 체크리스트

- `AGENTS.md` 확인
- `HANDOFF_STATE.json` 버전·품질 단계 확인
- 최근 `HANDOFF_LOG.md` 확인
- 신규 자산이 PNG/WebP인지 확인
- `art_source`와 런타임 자산을 구분
- 최종급 표현이 품질 단계와 일치하는지 확인

## 8. 작업 종료 체크리스트

- 코드·에셋·품질 단계 자동 검증
- 전체본과 누적 패치 대조
- 문서·상태·로드맵 갱신
- SHA-256 계산
- 결과 보고 순서 준수

## 9. 알려진 제한

- v0.9 자산은 최종 수작업 상용 원화가 아니다.
- 고해상도 PNG 원본은 편집 레이어가 없는 합성 마스터다. 추후 PSD 또는 레이어 원본으로 교체한다.
- Firebase 실제 운영 연결은 v0.10.0으로 이동했다.
- npm Registry 제한 환경에서는 Vite 최종 빌드를 별도 PC에서 확인해야 한다.


## v0.9.1 빌드 복구 기준

- Vite 8의 `manualChunks`는 함수 형식만 사용한다.
- PixiJS는 `pixi`, Firebase 및 `@firebase` 모듈은 `firebase` 청크로 분리한다.
- GitHub Actions 실행 Node는 24를 사용한다.
- 빌드 설정 검증과 TypeScript 검사는 전체 에셋 검증보다 먼저 실패하도록 배치한다.

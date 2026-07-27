# LUMERIFT 통합 인수인계 문서

**현재 버전:** v0.8.0  
**갱신일:** 2026-07-27  
**상태:** 대규모 에셋 기반 확장 완료

## 1. 프로젝트 목적

LUMERIFT는 모바일 브라우저에서 빠르고 아름답게 실행되는 세로형 2.5D 액션 RPG다. 처음부터 MMORPG를 구현하지 않고, 전투 손맛·빠른 로딩·성장 루프·확장 가능한 데이터 구조를 먼저 완성한다.

## 2. 현재 완료 범위

- 실행 기반: Vite, TypeScript, PixiJS 8, Firebase 연결 계층
- 화면: Boot, Login, Lobby, Stage Select, Battle, Result, Inventory, Quest, Asset Gallery
- 전투: 이동, 3연속 공격, 스킬 2종, 회피, 피격, 상태 이상, 보스 3페이즈
- 콘텐츠: 스테이지 10개, 일반·정예·보스, 메인·일일 퀘스트
- 성장: 장비, 강화, 장착, 잠금, 판매, 전투력 반영
- 저장: 로컬 저장과 Firestore Repository 분리, 저장 데이터 v3
- 최적화: Atlas, Lazy Loading, Object Pool, 60·30FPS, 품질 자동 조절
- 에셋: 16개 Atlas, 총 1,174 프레임, 127 애니메이션
- 대규모 자산: 아이템 160, 스킬 80, UI 96, 환경 120, 도감 48, NPC 32 등

## 3. v0.8.0 신규 핵심

### 에셋 메가팩

- 아이템 160종
- 스킬 아이콘 80종
- 상태 효과 48종
- UI 아이콘 96종
- 몬스터 도감 초상 48종
- NPC 초상 32종
- 환경 오브젝트 120종
- VFX 24세트, 144프레임
- 문장·배지 64종
- 튜토리얼 글리프 40종
- 5개 지역, 총 15개 전투 배경
- 로딩 키아트 8종
- 브랜드 마크 3종
- 신규 UI 사운드 12종, 전투 사운드 16종, 환경 루프 8종

### 인수인계 체계

- `AGENTS.md`: 모든 작업자의 절대 실행 규칙
- `HANDOFF_STATE.json`: 자동화가 읽을 수 있는 현재 상태
- `docs/HANDOFF_MASTER.md`: 전체 상태와 설계 인수인계
- `docs/HANDOFF_LOG.md`: 릴리스별 누적 기록
- `scripts/validate-handoff.mjs`: 버전·필수 문서·상태 무결성 검사

## 4. 에셋 사용 원칙

현재 생성 자산의 단계는 `production-structure`다. 런타임 경로, Atlas 규격, 메모리, Lazy Loading 구조를 검증하는 자산이며 최종 상용 원화는 아니다.

최종 아트 교체 시 다음 키를 유지한다.

- `mega_item.*`
- `skill.*`
- `status.*`
- `ui.icon.*`
- `bestiary.*`
- `npc.portrait.*`
- `prop.*`
- `effect.mega.*`
- `emblem.*`
- `tutorial.glyph.*`

## 5. 다음 작업 우선순위

1. Firebase 인증 연결과 게스트 → Google 계정 승격
2. Cloud Save 충돌 해결, 재시도 큐, 데이터 버전 관리
3. 공지, 7일 출석, 우편, 쿠폰, 랭킹
4. 캐릭터·몬스터 최종 상용 후보 아트 교체
5. 모바일 실기기 빌드·메모리·발열·FPS 검증

## 6. 작업 시작 체크리스트

- `AGENTS.md` 확인
- `HANDOFF_STATE.json` 버전 확인
- 최근 `HANDOFF_LOG.md` 확인
- 기존 ZIP 또는 최신 전체본 기준 확인
- 범위가 MVP 규칙을 위반하지 않는지 확인
- 신규 에셋이 PNG/WebP인지 확인

## 7. 작업 종료 체크리스트

- 코드·에셋 자동 검증
- 전체본과 누적 패치 대조
- 문서·상태·로드맵 갱신
- SHA-256 계산
- 결과 보고 순서 준수

## 8. 알려진 제한

- 자동 생성 에셋은 최종 상용 원화가 아니다.
- Firebase 실제 운영 연결은 다음 단계다.
- npm Registry가 제한된 환경에서는 Vite 최종 빌드를 별도 PC에서 확인해야 한다.

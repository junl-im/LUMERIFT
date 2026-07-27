# LUMERIFT v0.8.0 패치 노트

## 대규모 에셋 자산

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
- 5개 지역, 총 15개 배경
- 로딩 키아트 8종
- 브랜드 마크 3종
- 신규 오디오 36종

전체 Atlas 기준은 16개, 1,174프레임, 127애니메이션이다.

## 런타임

- 에셋 보관소 화면 추가
- 메가팩 전용 Lazy Loading Bundle 추가
- 분류·페이지 방식으로 Atlas 자산 직접 검수
- 메가팩 용량과 프레임 수 자동 검사

## 인수인계

- `AGENTS.md`
- `PROJECT_HANDOFF.md`
- `HANDOFF_STATE.json`
- `docs/HANDOFF_MASTER.md`
- `docs/HANDOFF_LOG.md`
- `scripts/validate-handoff.mjs`

모든 후속 릴리스는 위 문서를 갱신하지 않으면 검증을 통과할 수 없다.

## 주의

자동 생성 에셋은 최종 상용 원화가 아니다. 경로, Atlas, 키, 메모리, Lazy Loading 계약을 검증하는 `production-structure` 단계 자산이다.

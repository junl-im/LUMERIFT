# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.5
**상태:** 웹툰형 UI 리디자인·전투 HUD 재정리·방향/타격 피드백 polish 완료
- 이번 릴리스 핵심: 웹툰형 클린 UI / 전투 HUD 리빌드 / 공격 방향·타격감 시각 강화

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/WEBTOON_UI_DIRECTION_v1.11.5.md`
5. `docs/COMBAT_HUD_REWORK_v1.11.5.md`
6. `docs/HIT_FEEDBACK_DIRECTION_REVIEW_v1.11.5.md`
7. `docs/PATCH_NOTES_v1.11.5.md`

## 현재 상태

- 웹툰형 감성은 신규 외부 아트 추가 없이 기존 런타임 UI 자산과 Graphics 레이어를 조합해 구현한다.
- 전투 HUD는 정보 밀도를 낮추고 읽기 순서를 정리하며, 상단 카드/중앙 피드백/하단 입력 도크 구조를 유지한다.
- ATTACK VECTOR 패널은 이동/공격 방향 검수 보조용이며 판정 로직 자체는 변경하지 않는다.
- CRIT/BURN/HIT 플로팅 텍스트와 CHAIN/CRITICAL 배너는 표현 계층이며 피해 계산식은 변경하지 않는다.
- Firebase App Check는 비활성화 상태이며 저장·랭킹·AttackFootprint 계약은 유지한다.

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.5.zip`
- 패치: `LUMERIFT_PATCH_v1.11.4_to_v1.11.5.zip`
- 기준 패치: v1.11.4 프로젝트 최상위에 덮어쓰기
- 삭제/이동: 없음

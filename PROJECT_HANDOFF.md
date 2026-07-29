# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.7
**상태:** 자동 타겟팅·선택형 자동 전투·첫 시작 인터페이스 리뉴얼 완료
- 이번 릴리스 핵심: 자동 타겟 / 자동 전투 / Boot→Battle UI 언어 통일

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/AUTO_TARGET_AUTO_BATTLE_v1.11.7.md`
5. `docs/FULL_INTERFACE_RENEWAL_v1.11.7.md`
6. `docs/PATCH_NOTES_v1.11.7.md`

## 현재 상태

- 자동 타겟은 기본 ON이고 자동 전투는 기본 OFF다.
- 자동 전투를 켜면 자동 타겟도 함께 켜진다.
- 수동 이동 입력과 수동 버튼 입력이 자동 행동보다 우선한다.
- 자동 전투는 위험 텔레그래프 회피, 접근 거리 조절, 스킬 사용, 기본 콤보 순으로 동작한다.
- Boot·Login·Lobby·공통 SceneChrome을 동일한 인터페이스 모티프로 리뉴얼했다.
- Firebase App Check 비활성화, Player Save v4, 기존 전투 판정·AttackFootprint 계약은 유지한다.

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.7.zip`
- 패치: `LUMERIFT_PATCH_v1.11.6_to_v1.11.7.zip`
- 기준 패치: v1.11.6 프로젝트 최상위에 덮어쓰기
- 삭제/이동: 없음

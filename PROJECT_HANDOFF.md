# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.4
**상태:** 입력 방향 보정·UI 정리·캐릭터 polish 적용 완료
- 이번 릴리스 핵심: 입력 방향 보정·UI 정리·캐릭터 polish

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/DEVICE_QA_ANALYSIS_v1.11.4.md`
5. `docs/PLAYER_PAINTED_CANDIDATE_v1.11.4.md`
6. `docs/COMBAT_ACCESSIBILITY_FEEDBACK_v1.11.4.md`
7. `docs/COMBAT_AUDIO_LAYERS_v1.11.4.md`

## 현재 상태

- 기존 고급 플레이어 원화는 기본값 `detail`로 유지한다.
- `owned-preview`와 `owned-painted`는 별도 Lazy Loading 선택형 검수 경로다.
- 도색 후보는 128프레임·80애니메이션이며 실패 시 기본 원화로 복구한다.
- QA JSON v3는 FPS 표본을 자동 분석하지만 실제 온도·GPU 메모리를 추정하지 않는다.
- 진동과 전투 낭독은 접근성 설정에서 각각 끌 수 있다.
- 다층 음향은 기존 OGG를 재사용하며 독립 효과음 제작은 미완료다.
- Firebase App Check는 비활성화 상태이며 저장·랭킹·AttackFootprint 계약은 유지한다.

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.4.zip`
- 패치: `LUMERIFT_PATCH_v1.11.3_to_v1.11.4.zip`
- 기준 패치: v1.11.3 프로젝트 최상위에 덮어쓰기
- 삭제/이동: 없음
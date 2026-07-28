# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.0
**상태:** Rift Drive·D~SS 스타일·적응형 전투 렌더 예산·공통 UI 깊이 강화 완료

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/COMBAT_GRAPHICS_UPGRADE_v1.11.0.md`
5. `docs/MOBILE_DEVICE_QA_v1.10.1.md`

## v1.11.0 현재 상태

- 5개 전투 행동은 impact tier, Drive 획득·비용, 콤보 입력 창을 데이터로 가진다.
- 적중·치명타·처치·정밀 회피가 Rift Drive와 D~SS 전투 등급에 반영된다.
- 공격 적중 뒤 스킬·회피 캔슬이 가능하며 정밀 회피는 쿨다운을 가속한다.
- CombatRenderBudget이 그래픽 품질과 프레임 압력에 맞춰 VFX와 데미지 텍스트 비용을 제한한다.
- 전투 HUD와 공통 UI는 기존 Atlas에 프로그램 하이라이트·그림자·링을 더한다.
- 신규 런타임 이미지는 없으며 Firebase App Check는 비활성화 상태다.

## 미완료

- Android·iOS 물리 기기 전투 FPS·발열·배터리·GPU 메모리 표본
- 수집 로그 기반 렌더 예산 임계값 보정
- 플레이어 8방향 최종 걷기·공격·피격·회피 원화와 Atlas 연결
- 스킬별 전용 VFX·음향 레이어 최종 아트 패스

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.0.zip`
- 패치: `LUMERIFT_PATCH_v1.10.1_to_v1.11.0.zip`
- 기준 패치: v1.10.1 프로젝트 최상위에 덮어쓰기
- 삭제/이동: 없음

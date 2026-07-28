# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.1  
**상태:** 기기 등급 보정·8방향 모션 프레젠테이션·보스 위험 장판 언어·모바일 입력 중복 방지 완료

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/COMBAT_MOTION_QA_v1.11.1.md`
5. `docs/COMBAT_GRAPHICS_UPGRADE_v1.11.0.md`

## v1.11.1 현재 상태

- DeviceCalibration이 메모리·코어·DPR·터치 특성으로 entry·balanced·performance 등급을 선택한다.
- AdaptivePerformanceController와 CombatRenderBudget이 같은 보정 프로필을 공유한다.
- PlayerMotionDirector가 기존 8방향 Atlas에 선행 동작·압축·스킬 궤적·회피 잔상·Drive 오라를 적용한다.
- BossTelegraphLanguage가 예고·위험·회피 단계, 패턴명·기호·시간 눈금을 제공한다.
- TouchActionGate가 멀티터치 중복 실행과 취소 후 고착을 방지한다.
- 신규 제작용 8방향 모션 마스터는 아직 런타임 최종 원화가 아니다.
- Firebase App Check는 비활성화 상태이며 저장·랭킹·AttackFootprint 계약은 유지한다.

## 미완료

- Android·iOS 물리 단말 장시간 FPS·온도·배터리·GPU 메모리 표본
- 표본 기반 DeviceCalibration 임계값 최종 조정
- 전용 플레이어 최종 수작업 프레임과 런타임 Atlas 승격
- 스킬별 독립 음향과 모바일 E2E

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.1.zip`
- 패치: `LUMERIFT_PATCH_v1.11.0_to_v1.11.1.zip`
- 기준 패치: v1.11.0 프로젝트 최상위에 덮어쓰기
- 삭제/이동: 없음

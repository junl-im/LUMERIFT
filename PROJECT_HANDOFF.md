# PROJECT HANDOFF v1.11.10

# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.9
**상태:** 초대규모 인터페이스 리뉴얼·자동 기능 세부 설정·실기기 전투 보정 완료

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/AUTO_COMBAT_DIAGNOSTICS_v1.11.9.md`
5. `docs/MOBILE_SAFE_AREA_v1.11.9.md`
6. `docs/DIRECTIONAL_ATTACK_POSE_v1.11.9.md`
4. `docs/MEGA_INTERFACE_RENEWAL_v1.11.8.md`
5. `docs/COMBAT_ASSIST_TUNING_v1.11.8.md`
6. `docs/PATCH_NOTES_v1.11.8.md`

## 현재 상태

- 모든 주요 화면은 공통 `RIFT INTERFACE` 디자인 언어를 사용한다.
- 자동 타겟은 기본 ON, 자동 전투는 기본 OFF다.
- 자동 타겟 우선순위·자동 스킬·자동 회피·보스전 제한·기기 반응 프리셋을 개별 저장한다.
- 기존 v1 저장값은 v2 자동 보조 설정으로 마이그레이션한다.
- 수동 조이스틱·키보드·버튼 입력은 자동 행동보다 우선한다.
- Firebase App Check 비활성, Player Save v4, AttackFootprint 계약을 유지한다.

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.9.zip`
- 패치: `LUMERIFT_PATCH_v1.11.8_to_v1.11.9.zip`
- 기준 패치: v1.11.8 프로젝트 최상위에 덮어쓰기
- 삭제/이동: 없음

## v1.11.11
자동 전투 세션 로그·보스 회피 규칙·복합 스킬 판단·플랫폼 Safe Area가 연결됐다.

# PROJECT HANDOFF v1.11.17

# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.17  
**상태:** 최근 자동 전투 기록·8방향 무기 궤적·보스 HUD 데이터 v2 완료

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/BOSS_DODGE_DATA_v1.11.15.md`
5. `docs/AUTO_PRESET_VAULT_v1.11.15.md`
6. `docs/AUTO_PRESET_PERFORMANCE_v1.11.15.md`
7. `docs/PATCH_NOTES_v1.11.15.md`

## 현재 상태

- 보스 회피 규칙은 버전형 JSON 데이터 카탈로그에서 로드한다.
- 자동 전투 세부 설정은 3개 사용자 슬롯에 저장·복원할 수 있다.
- 결과 화면은 한 전투의 자동 전투 기록으로 세 프리셋 적합도를 비교한다.
- 자동 타겟 기본 ON, 자동 전투 기본 OFF, 수동 입력 우선 계약을 유지한다.
- Firebase App Check 비활성, Player Save v4, AttackFootprint 계약을 유지한다.

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.16.zip`
- 최상위 덮어쓰기 패치: `LUMERIFT_PATCH_v1.11.15_to_v1.11.16_ROOT_OVERWRITE.zip`
- 기준 버전: v1.11.15
- 삭제/이동: 없음

## 검증 원칙

- 과거 검증기는 특정 화면 문구가 아니라 실제 기능·데이터 계약을 검사한다.
- 전체본과 패치 적용본을 파일별 SHA-256으로 대조한다.
- 실제 실행하지 않은 npm 전체 빌드·실기기 검사는 완료로 기록하지 않는다.


## v1.11.16
- 자동 전투 세션 기록 저장소와 분석 화면 연결
- 보스 HUD 데이터 v2 및 8방향 무기 궤적 프로필 연결


## v1.11.17
프리미엄 영웅 초상과 8방향 재질광 오버레이를 적용했다.

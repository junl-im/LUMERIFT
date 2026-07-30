# PROJECT HANDOFF v1.11.14

# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.14  
**상태:** 자동 전투 전략 프리셋·보스 위협 HUD·손가락 가림 보정 완료

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/CONTEXTUAL_UX_FLOW_v1.11.13.md`
5. `docs/ASSET_QUALITY_MATRIX_v1.11.13.md`
6. `docs/PATCH_NOTES_v1.11.13.md`

## 현재 상태

- 로비는 퀘스트 보상, 운영 알림, 스토리 진행도를 기준으로 다음 행동을 추천한다.
- 설정 변경 후 인라인 피드백이 표시된다.
- 결과 화면의 성과/추천 행동은 순수 로직 모듈로 분리됐다.
- 에셋 보관소는 분류별 QUALITY 점수와 MOBILE ROLE을 표시한다.
- 자동 타겟 기본 ON, 자동 전투 기본 OFF, 수동 입력 우선 계약을 유지한다.
- Firebase App Check 비활성, Player Save v4, AttackFootprint 계약을 유지한다.

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.14.zip`
- 최상위 덮어쓰기 패치: `LUMERIFT_PATCH_v1.11.13_to_v1.11.14_ROOT_OVERWRITE.zip`
- 기준 버전: v1.11.13
- 삭제/이동: 없음

## 검증 원칙

- 과거 검증기는 특정 화면 문구보다 실제 기능 계약을 검사한다.
- 전체본과 패치 적용본을 파일별 SHA-256으로 대조한다.
- 실제 실행하지 않은 빌드·실기기 검사는 완료로 기록하지 않는다.


## v1.11.14
자동 전투 전략 프리셋, 보스 위협 HUD, 결과 프리셋 기록, 모바일 액션 버튼 간격 보정을 적용했다.

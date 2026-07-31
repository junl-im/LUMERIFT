# PROJECT HANDOFF v1.11.21

# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.21  
**상태:** 캐릭터 스튜디오 8방향 비교·무기 본체 프레임·세부 염색·캡처 준비 보정 완료

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/CHARACTER_STUDIO_v1.11.21.md`
5. `docs/WEAPON_BODY_ATTACK_FRAMES_v1.11.21.md`
6. `docs/MOBILE_CHARACTER_CAPTURE_CALIBRATION_v1.11.21.md`
7. `docs/PATCH_NOTES_v1.11.21.md`

## 현재 상태

- 캐릭터 스튜디오는 8방향, 8개 포즈, 3개 비교 슬롯, 3개 코스튬, 3개 세부 염색 채널을 공유한다.
- 현재 장비와 교체 후보는 같은 방향·포즈·염색 조건에서 동시 렌더링한다.
- 검·대검·장창은 기존 v10 프레임을 계열별 레시피로 재구성하고 접촉 타이밍을 분리한다.
- 최근 프리셋은 최대 5개이며 기존 v1.11.20 슬롯을 자동 마이그레이션한다.
- 모바일 보정은 캡처 준비용 기준이며 실제 Android/iOS 물리 기기 승인 상태는 대기다.
- Firebase App Check 비활성, Player Save v4, AttackFootprint 계약을 유지한다.

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.21.zip`
- 최상위 덮어쓰기 패치: `LUMERIFT_PATCH_v1.11.20_to_v1.11.21_ROOT_OVERWRITE.zip`
- 기준 버전: v1.11.20
- 삭제/이동: 없음

## 검증 원칙

- 전체본과 패치 적용본을 파일별 SHA-256으로 대조한다.
- 전용 본체 프레임은 기존 Atlas 재구성임을 유지하고 신규 수작업 원화 완성으로 주장하지 않는다.
- 실제 실행하지 않은 의존성 기반 빌드와 물리 기기 캡처는 완료로 기록하지 않는다.

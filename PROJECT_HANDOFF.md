# PROJECT HANDOFF v1.11.18

# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.11.18  
**상태:** 캐릭터 본체 FX·장비 재질 동기화·외형 미리보기 완료

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/PREMIUM_CHARACTER_SYSTEM_v1.11.18.md`
5. `docs/EQUIPMENT_VISUAL_SYNC_v1.11.18.md`
6. `docs/PATCH_NOTES_v1.11.18.md`
7. `docs/NEXT_UPDATE_v1.11.19.md`

## 현재 상태

- 기존 플레이어 본체 위에 8방향·4상태 캐릭터 FX Atlas v9를 후면·전면 레이어로 합성한다.
- 장착 무기·방어구·장신구 등급이 갑주 광원·룬·오라·무기 궤적 색상에 반영된다.
- 로비와 인벤토리에서 실제 장착/선택 장비의 재질 미리보기를 제공한다.
- 자동 타겟 기본 ON, 자동 전투 기본 OFF, 수동 입력 우선 계약을 유지한다.
- Firebase App Check 비활성, Player Save v4, AttackFootprint 계약을 유지한다.

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.11.18.zip`
- 최상위 덮어쓰기 패치: `LUMERIFT_PATCH_v1.11.17_to_v1.11.18_ROOT_OVERWRITE.zip`
- 기준 버전: v1.11.17
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


## v1.11.18
- 8방향·4상태 캐릭터 FX Atlas v9 연결
- 장비 등급별 재질·룬·무기 궤적 색상 동기화
- 로비·인벤토리 외형 미리보기 연결

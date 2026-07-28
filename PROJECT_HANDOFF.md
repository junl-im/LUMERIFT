# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.10.0
**공개 주소:** https://junl-im.github.io/LUMERIFT/
**Firebase 프로젝트:** `lumerift-8db07`

## 작업 시작 전 필독

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/MOBILE_QA_v1.10.0.md`
5. `docs/UI_SYSTEM_v1.10.0.md`
6. `docs/VISUAL_AUDIT_v1.10.0.md`
7. `docs/BOSS_COMBAT_v1.8.0.md`
8. `docs/SAVE_RECOVERY_v1.8.0.md`
9. `docs/RANKING_SEASON_v1.8.0.md`
10. `docs/ROADMAP.md`

## v1.10.0 현재 상태

- v1.9.0 Luminous v5 UI 시스템과 모든 기존 Firebase·전투·저장 계약을 유지한다.
- `MobileViewportController`가 시각 뷰포트의 너비·높이·오프셋·배율, 키보드 상태, 플랫폼, 포인터 유형과 reduced motion 상태를 동기화한다.
- `UiMotion.bindPressFeedback`가 공통 눌림·해제·취소와 최소 48 논리 픽셀 터치 영역을 담당한다.
- 저메모리 또는 4코어 이하 기기의 Pixi 캔버스 해상도는 최대 1.5배로 제한한다.
- 스테이지·퀘스트·결과·운영 화면은 상태·보상·행동을 기존 v5 아이콘으로 중복 표현하고 약한 펄스 피드백을 사용한다.
- 쿠폰 입력은 `window.prompt` 대신 Safe Area·가상 키보드·접근성 레이블을 지원하는 DOM 오버레이를 사용한다.
- v1.8 AttackFootprint 전투 판정, Auth·Firestore·Cloud Save·랭킹 데이터 구조는 변경하지 않았다.
- Firebase App Check는 사용자 결정에 따라 계속 비활성화한다.

## 자산 기준선

- 신규 런타임 이미지: 없음
- 활성 public: 37개·4.98MB
- 활성 Atlas: 7개
- 보관 런타임: 194개·23.47MB
- 전체 보존: 54 Atlas·3,642프레임·602애니메이션
- 모바일 제작용 `art_source`: 277개·100.93MB
- 초기 로딩 예상 입력: 기존 v1.9.0과 동일, 15MB 예산 유지

## 검증 상태

- 변경 TypeScript 파일 구문 검사 완료
- 모바일 뷰포트·터치·쿠폰 입력·4개 세부 화면 계약 검사 추가
- 기존 UI·에셋·아카이브·인수인계 정적 검사 유지
- 물리 Android Chrome·iOS Safari 런타임 캡처와 FPS·발열·GPU 메모리 계측은 아직 미완료

## 다음 작업 기준

- v1.10.1에서 실제 Android Chrome·iOS Safari 360~430px 폭 단말 계측 로그를 반영한다.
- 개념 접촉 시트는 방향 참고용이며 실제 런타임 또는 물리 단말 캡처로 주장하지 않는다.
- LUMERIFT 전용 플레이어 8방향 실루엣 원화 1차 제작을 계속한다.
- 시즌 종료 기록과 복구 지점 JSON 내보내기·가져오기를 후속 구현한다.

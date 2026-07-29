# LUMERIFT: 균열의 계승자 v1.11.8

모바일 웹 우선 9:16 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이다.

## v1.11.8 핵심
- 초대규모 인터페이스 리뉴얼: Boot·Login·Lobby·Stage·Inventory·Quest·Settings·Battle·Result까지 공통 RIFT INTERFACE 디자인 적용
- 웹툰형 패널 컷, 이중 프레임, 하프톤, 챕터 레일, 코너 스탬프, 전투 사이드 피드 추가
- 자동 타겟 세부 우선순위 5종: 균형·가까운 적·보스/엘리트·낮은 HP·공격 예고
- 자동 전투 세부 옵션: 자동 스킬·자동 회피·보스전 전체/타겟만/금지
- 실기기 전투 보정 3종: 즉응형·균형형·안정형
- 기존 저장·랭킹·판정·AttackFootprint·App Check 비활성 정책 유지

## 실행·검증

```bash
npm install
npm run verify
npm run dev
```

## 우선 문서

- `AGENTS.md`
- `HANDOFF_STATE.json`
- `docs/HANDOFF_MASTER.md`
- `docs/MEGA_INTERFACE_RENEWAL_v1.11.8.md`
- `docs/COMBAT_ASSIST_TUNING_v1.11.8.md`
- `docs/PATCH_NOTES_v1.11.8.md`
- `docs/AUTO_TARGET_AUTO_BATTLE_v1.11.7.md`
- `docs/EIGHT_DIRECTION_POLISH_v1.11.6.md`

실기기 장시간 FPS·온도·배터리·GPU 메모리는 실제 측정 전까지 완료로 기록하지 않는다.

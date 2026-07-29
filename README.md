# LUMERIFT: 균열의 계승자 v1.11.7

모바일 웹 우선 9:16 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이다.

## v1.11.7 핵심
- 자동 타겟팅 기본 ON: 거리·전방·보스·엘리트·텔레그래프·잔여 HP를 종합해 적을 안정적으로 고른다.
- 자동 전투 선택형 OFF: 사용자가 켰을 때만 위험 회피→거리 조절→스킬→콤보 공격을 수행한다.
- 수동 우선: 조이스틱·키보드·직접 버튼 입력이 들어오면 자동 이동과 자동 행동을 즉시 양보한다.
- 첫 시작 인터페이스 리뉴얼: Boot·Login·Lobby·SceneChrome 공통 씬을 새로운 UI 언어로 통일한다.
- 전투 HUD에 TARGET / AUTO 토글, LOCK SIGNAL 패널, 타겟 링과 연결선을 추가한다.

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
- `docs/AUTO_TARGET_AUTO_BATTLE_v1.11.7.md`
- `docs/FULL_INTERFACE_RENEWAL_v1.11.7.md`
- `docs/PATCH_NOTES_v1.11.7.md`
- `docs/EIGHT_DIRECTION_POLISH_v1.11.6.md`
- `docs/PATCH_NOTES_v1.11.6.md`
- `docs/WEBTOON_UI_DIRECTION_v1.11.5.md`
- `docs/COMBAT_HUD_REWORK_v1.11.5.md`
- `docs/HIT_FEEDBACK_DIRECTION_REVIEW_v1.11.5.md`
- `docs/PATCH_NOTES_v1.11.5.md`
- `docs/COMBAT_ACCESSIBILITY_FEEDBACK_v1.11.4.md`

자동 전투는 접근성·편의 기능이며 서버 권위 전투나 랭킹 점수 자동 생성으로 사용하지 않는다. 물리 단말 장시간 성능·배터리·온도는 별도 실기기 검수가 필요하다.

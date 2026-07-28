# LUMERIFT: 균열의 계승자 v1.8.1

모바일 웹 우선 세로형 2.5D 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이며 GitHub Pages에 배포한다.

## v1.8.1 긴급 빌드 수정

- `VirtualJoystick.ts`의 PixiJS 8 비호환 객체형 `lineStyle({...})` 호출 제거
- 십자 가이드 경로를 `moveTo/lineTo` 후 `stroke({...})`로 렌더링
- 같은 오류가 다시 들어오면 `validate:source`가 실패하도록 회귀 검사 추가
- v1.8.0 보스 전투·복구·시즌 랭킹·에셋·Firebase 기능은 변경 없음

## v1.8.0 기능

- 공격 경고·피격 판정·타격 표시를 동일한 `AttackFootprint` 계산으로 통합
- 보스 3페이즈 전용 진입 연출·오라·카메라 줌·흔들림
- 성공 타격 기반 Hit Stop·카메라 Shake·Pulse Zoom 유지 및 검증
- Cloud Save 위험 작업 전 로컬 복구 지점 최대 5개
- 복구 지점 생성·복원·삭제 화면
- 전체·주간·28일 시즌 랭킹
- `seasonRankings` Firestore 규칙과 복합 색인
- Firebase App Check 비활성화 유지

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run validate:combat
npm run validate:account
npm run verify
```

## Firebase 규칙 배포

```bash
npm run firebase:check
npm run firebase:deploy:rules
```

## 핵심 문서

- `AGENTS.md`
- `HANDOFF_STATE.json`
- `docs/HANDOFF_MASTER.md`
- `docs/BOSS_COMBAT_v1.8.0.md`
- `docs/SAVE_RECOVERY_v1.8.0.md`
- `docs/RANKING_SEASON_v1.8.0.md`
- `docs/PATCH_NOTES_v1.8.0.md`
- `docs/PATCH_NOTES_v1.8.1.md`

BAT 파일은 Windows 편의용 선택 도구이며 npm 명령과 GitHub Actions가 공식 기준이다.

# LUMERIFT: 균열의 계승자 v1.11.3

모바일 웹 우선 9:16 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이다.

## v1.11.3 핵심

- Device QA JSON v3: 세션 점수, 신뢰도, 권장 FPS·그래픽, 문제·강점 자동 분석
- 선택형 `owned-painted` LUMERIFT 전용 플레이어 도색 후보 Atlas
- 기존 고급 플레이어 Atlas 기본값 및 Lazy Loading 실패 복구 유지
- 전투 진동 피드백과 polite/assertive 화면 낭독
- 기존 OGG를 이용한 공격·치명타·스킬·회피·Overdrive 다층 음향
- Firebase App Check 비활성화, Player Save v4, AttackFootprint 계약 유지

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
- `docs/DEVICE_QA_ANALYSIS_v1.11.3.md`
- `docs/PLAYER_PAINTED_CANDIDATE_v1.11.3.md`
- `docs/COMBAT_ACCESSIBILITY_FEEDBACK_v1.11.3.md`
- `docs/COMBAT_AUDIO_LAYERS_v1.11.3.md`
- `docs/MOBILE_COMBAT_E2E_v1.11.3.md`

물리 단말 온도·GPU 메모리·장시간 배터리 결과와 전용 플레이어 최종 수작업 원화는 아직 완료로 기록하지 않는다.

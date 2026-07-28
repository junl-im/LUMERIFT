# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.8.0  
**공개 주소:** https://junl-im.github.io/LUMERIFT/  
**Firebase 프로젝트:** `lumerift-8db07`

## 작업 시작 전 필독

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/BOSS_COMBAT_v1.8.0.md`
5. `docs/SAVE_RECOVERY_v1.8.0.md`
6. `docs/RANKING_SEASON_v1.8.0.md`
7. `docs/ART_UNIFICATION_v1.7.0.md`
8. `docs/ASSET_CLEANUP_v1.6.0.md`
9. `docs/ROADMAP.md`

## v1.8.0 현재 상태

- 공격 경고·실제 판정·타격 표시가 `AttackFootprint` 단일 계산을 공유한다.
- 보스는 1·2·3페이즈 진입 시 전용 타이틀·오라·줌·흔들림 연출을 사용한다.
- Cloud Save 위험 작업 전 로컬 복구 지점을 UID별 최대 5개 보존한다.
- 랭킹은 전체·주간·UTC 월요일 기준 28일 시즌 보드를 제공한다.
- 플레이어·몬스터·VFX는 v1.7의 `public/assets/live/v4`를 유지한다.
- 현재 품질 단계는 `production-candidate-unified-art-pass`이며 독점 최종 원화가 아니다.
- Firebase App Check는 비활성화하며 Auth·Firestore Rules를 보안 경계로 유지한다.

후속 작업은 실기기 보스 연출 성능, 전용 실루엣 원화, 시즌 종료 기록과 복구 이력 강화다.

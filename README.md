# LUMERIFT: 균열의 계승자 v1.11.17

모바일 웹 우선 9:16 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이다.

## v1.11.9 핵심
- 자동 타겟 점수·선정 이유와 자동 전투 행동 이유를 전투 HUD에 실시간 표시
- HP 조건형 자동 스킬, 보스 회피 정책, 수동 조작 후 자동 복귀 지연 설정 추가
- 작은 화면·소프트 키보드 상황에서 조이스틱·전투 버튼 Safe Area 자동 보정
- 8방향 공격 포즈와 방향별 스트라이크 실루엣 강화
- 기존 대규모 RIFT INTERFACE·자동 타겟·자동 전투·접근성 계약 유지

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
- `docs/AUTO_COMBAT_DIAGNOSTICS_v1.11.9.md`
- `docs/MOBILE_SAFE_AREA_v1.11.9.md`
- `docs/DIRECTIONAL_ATTACK_POSE_v1.11.9.md`
- `docs/PATCH_NOTES_v1.11.9.md`
- `docs/NEXT_UPDATE_v1.11.10.md`
- `docs/MEGA_INTERFACE_RENEWAL_v1.11.8.md`
- `docs/COMBAT_ASSIST_TUNING_v1.11.8.md`
- `docs/PATCH_NOTES_v1.11.8.md`
- `docs/AUTO_TARGET_AUTO_BATTLE_v1.11.7.md`
- `docs/EIGHT_DIRECTION_POLISH_v1.11.6.md`

실기기 장시간 FPS·온도·배터리·GPU 메모리는 실제 측정 전까지 완료로 기록하지 않는다.


## v1.11.10 핵심 업데이트
- 웹툰형 코믹 태그·피처 마키·잉크 라인 기반 UI 크롬 리뉴얼
- 로비 리뉴얼 브리핑 카드와 에셋 보관소 production-line 안내 추가
- 관련 문서: `docs/INTERFACE_RENEWAL_v1.11.10.md`, `docs/ASSET_RENEWAL_v1.11.10.md`, `docs/PATCH_NOTES_v1.11.10.md`


## v1.11.11 핵심 업데이트
- 자동 전투 세션 로그와 결과 화면 `AUTO ASSIST REPORT`
- 타겟 전환·공격·스킬·회피·수동 개입 통계
- 심연 절단·심연 폭발·추적 균열 패턴별 회피 시점과 방향 규칙
- HP·Drive·타겟 잔여 HP 복합 자동 스킬 판단
- iOS·Android visualViewport 기반 전투 HUD Safe Area 보정
- 관련 문서: `docs/AUTO_COMBAT_SESSION_REPORT_v1.11.11.md`, `docs/BOSS_DODGE_RULES_v1.11.11.md`, `docs/COMPOSITE_AUTO_SKILL_v1.11.11.md`, `docs/MOBILE_PLATFORM_SAFE_AREA_v1.11.11.md`
- 캐릭터 이동 방향 핫픽스: `docs/MOVEMENT_DIRECTION_HOTFIX_v1.11.11.md`

## v1.11.12 핵심 업데이트
- 로비 커맨드 허브의 정보 우선순위와 브리핑 문구 재정리
- 에셋 보관소에 분류별 품질 태그·감수 포인트·모바일 제작용 마스터 안내 추가
- 결과 화면에 전술 요약·성과 분류·다음 추천 행동 표시
- 공통 SceneChrome 헤더와 마키 문구를 v1.11.12 기준으로 재정비
- 관련 문서: `docs/UI_UX_RENEWAL_v1.11.12.md`, `docs/ASSET_AUDIT_v1.11.12.md`, `docs/PATCH_NOTES_v1.11.12.md`

## v1.11.13 핵심 업데이트
- 퀘스트 보상·운영 알림·스토리 진행 상태를 분석해 로비에 `NEXT BEST ACTION` 표시
- 설정 변경 후 적용 결과를 즉시 보여주는 인라인 피드백 배너 추가
- 결과 화면 성과 평가와 다음 행동 추천을 `ResultActionPlan` 순수 로직으로 분리
- 에셋 보관소에 분류별 `QUALITY` 점수와 `MOBILE ROLE` 표시
- 작은 결과 버튼의 부제목 줄 간격·세로 정렬 개선
- 관련 문서: `docs/CONTEXTUAL_UX_FLOW_v1.11.13.md`, `docs/ASSET_QUALITY_MATRIX_v1.11.13.md`, `docs/PATCH_NOTES_v1.11.13.md`

## v1.11.14 핵심 업데이트
- 공격형·균형형·보존형 자동 전투 프리셋과 세부 조정 시 `사용자 설정` 전환
- 프리셋별 Drive·스킬·거리 유지 판단 튜닝 및 v3 → v4 설정 마이그레이션
- 보스 예고·위험·즉시 회피 단계별 위협 HUD와 자동 회피 준비 상태 표시
- 모바일 우측 액션 버튼 간격을 넓혀 손가락 가림과 오입력 가능성 감소
- 결과 화면 `AUTO ASSIST REPORT`에 실제 사용 프리셋 기록
- 관련 문서: `docs/AUTO_BATTLE_STRATEGY_PRESETS_v1.11.14.md`, `docs/BOSS_THREAT_HUD_v1.11.14.md`, `docs/FINGER_CLEARANCE_CONTROLS_v1.11.14.md`, `docs/PATCH_NOTES_v1.11.14.md`


## v1.11.15 핵심 업데이트
- 보스 회피 규칙을 `src/data/boss-dodge-rules.json` 버전형 데이터로 분리
- 사용자 자동 전투 프리셋 3개 슬롯 저장·불러오기·초기화
- 설정 화면에서 자동 전투 프리셋 연구소 진입
- 결과 화면에서 공격형·균형형·보존형 적합도 비교와 추천 표시
- 관련 문서: `docs/BOSS_DODGE_DATA_v1.11.15.md`, `docs/AUTO_PRESET_VAULT_v1.11.15.md`, `docs/AUTO_PRESET_PERFORMANCE_v1.11.15.md`, `docs/PATCH_NOTES_v1.11.15.md`


## v1.11.16 핵심 업데이트
- 최근 자동 전투 결과를 로컬에 최대 18건 저장하고 프리셋 연구소에서 기록 분석 화면으로 확인
- 공격형·균형형·보존형 평균 적합도·실사용 횟수·승리·평균 시간·수동 개입 비교
- 보스 회피 JSON v2에 HUD 아이콘·단계별 색상·안전 이동 안내 추가
- 8방향별 공격 자세와 무기 궤적 길이·폭·오프셋·잔상 수 차등화
- 관련 문서: `docs/AUTO_COMBAT_HISTORY_v1.11.16.md`, `docs/DIRECTIONAL_WEAPON_TRAILS_v1.11.16.md`, `docs/BOSS_HUD_DATA_v1.11.16.md`, `docs/PATCH_NOTES_v1.11.16.md`


## v1.11.17 핵심 업데이트
- 프리미엄 영웅 초상 `hero_premium_v8.webp` 적용
- 8방향 갑주·문양·무기 에너지 오버레이 Atlas 추가
- 로비와 전투 캐릭터의 청록·골드 재질 언어 통일
- 관련 문서: `docs/PREMIUM_CHARACTER_ART_v1.11.17.md`, `docs/PATCH_NOTES_v1.11.17.md`

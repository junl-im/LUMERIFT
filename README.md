# LUMERIFT: 균열의 계승자 v1.11.28

모바일 웹 우선 9:16 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이다.

## v1.11.9 핵심
- 자동 타겟 점수·선정 이유와 자동 전투 행동 이유를 전투 HUD에 실시간 표시
- HP 조건형 자동 스킬, 보스 회피 정책, 수동 조작 후 자동 복귀 지연 설정 추가
- 작은 화면·소프트 키보드 상황에서 조이스틱·전투 버튼 Safe Area 자동 보정
- 8방향 공격 포즈와 방향별 스트라이크 실루엣 강화
- 기존 대규모 RIFT INTERFACE·자동 타겟·자동 전투·접근성 계약 유지


## v1.11.28 핵심 업데이트
- 승인 캐릭터·몬스터 쇼케이스를 차기 전체 아트 제작 기준선으로 확정
- 캐릭터·몬스터·UI·스킬 VFX·장비 5개 도메인 Premium Art Direction v2 품질 게이트
- 에셋 보관소 첫 분류에서 2개 승인 기준 이미지 Lazy Loading 비교
- 941×1672 WebP 감수본과 재가공용 고품질 제작 마스터 분리
- 초기 다운로드 번들 증가 0 bytes, Player Save v4·AttackFootprint·App Check 비활성 유지
- 관련 문서: `docs/PREMIUM_ART_DIRECTION_v1.11.28.md`, `docs/PATCH_NOTES_v1.11.28.md`, `docs/NEXT_UPDATE_v1.11.29.md`

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




## v1.11.20 핵심 업데이트
- 캐릭터·코스튬 아틀리에에서 v10 본체의 대기·이동·3연격·스킬·회피 포즈 실시간 미리보기
- 염색과 미리보기 포즈를 저장하는 로컬 외형 슬롯 3개
- 균열검·대검·균열 장창별 공격 준비·사거리·공격각·타격 정지 프로필
- 로비 캐릭터·영웅 메뉴와 장비 보관소를 하나의 외형 관리 흐름으로 연결
- 관련 문서: `docs/CHARACTER_WARDROBE_v1.11.20.md`, `docs/WEAPON_MOTION_PROFILES_v1.11.20.md`, `docs/PATCH_NOTES_v1.11.20.md`

## v1.11.19 핵심 업데이트
- 기본 전투 캐릭터를 648프레임·80애니메이션의 프리미엄 8방향 본체 Atlas v10으로 교체
- 균열검·대검·균열 장창 무기 실루엣과 장비 세트 조화 표시 추가
- 계승자 골드·균열 애저·심연 바이올렛·월광 실버 염색 프리셋 추가
- v4 플레이어 Atlas는 비상 fallback으로 보존하고 Player Save v4·AttackFootprint 계약 유지
- 관련 문서: `docs/PREMIUM_DIRECTIONAL_BODY_v1.11.19.md`, `docs/CHARACTER_DYE_AND_WEAPON_VISUALS_v1.11.19.md`, `docs/PATCH_NOTES_v1.11.19.md`

## v1.11.18 핵심 업데이트
- 8방향·4상태 캐릭터 보조 FX Atlas v9 추가
- 망토·머리카락·갑주·무기 에너지를 방향과 전투 상태에 맞춰 합성
- 장착 장비 등급에 따라 전투 재질광·룬·무기 궤적 색상을 동기화
- 로비와 인벤토리에 무기·방어구·장신구 외형 미리보기 추가
- 관련 문서: `docs/PREMIUM_CHARACTER_SYSTEM_v1.11.18.md`, `docs/EQUIPMENT_VISUAL_SYNC_v1.11.18.md`, `docs/PATCH_NOTES_v1.11.18.md`

## v1.11.17 핵심 업데이트
- 프리미엄 영웅 초상 `hero_premium_v8.webp` 적용
- 8방향 갑주·문양·무기 에너지 오버레이 Atlas 추가
- 로비와 전투 캐릭터의 청록·골드 재질 언어 통일
- 관련 문서: `docs/PREMIUM_CHARACTER_ART_v1.11.17.md`, `docs/PATCH_NOTES_v1.11.17.md`

## v1.11.21 핵심 업데이트
- 캐릭터 스튜디오에서 8방향 수동 회전과 현재·교체 후 외형 동시 비교
- 무기·방어구·장신구 슬롯별 교체 후보와 세트 코스튬 3종 미리보기
- 균열검·대검·균열 장창별 본체 공격 프레임·접촉 타이밍 분리
- 갑주·망토·룬 세부 염색 채널과 최근 외형 프리셋 빠른 적용
- Android Chrome·iOS Safari 캡처 준비용 캐릭터 크기·발광 기준 프로필
- 관련 문서: `docs/CHARACTER_STUDIO_v1.11.21.md`, `docs/WEAPON_BODY_ATTACK_FRAMES_v1.11.21.md`, `docs/MOBILE_CHARACTER_CAPTURE_CALIBRATION_v1.11.21.md`, `docs/PATCH_NOTES_v1.11.21.md`

실제 Android/iOS 물리 기기 캡처가 확보되기 전에는 보정 프로필을 최종 승인값으로 기록하지 않는다.


## v1.11.22 핵심 업데이트
- 검·대검·균열 장창 전용 공격 본체 Atlas v11: 432프레임·72애니메이션
- 공격 포즈 전용 Atlas 우선 사용과 기존 v10 안전 폴백
- 무기·갑주·망토·룬 파트 집중 보기와 FIT/CLOSE/DETAIL 확대
- 외형 프리셋 이름 변경·즐겨찾기·삭제·JSON 백업/복원
- 관련 문서: `docs/WEAPON_ATTACK_BODY_ATLAS_v1.11.22.md`, `docs/APPEARANCE_PRESET_VAULT_v1.11.22.md`, `docs/PATCH_NOTES_v1.11.22.md`

실제 Android/iOS 물리 기기 캡처와 정상 의존성 기반 빌드는 검증 전까지 완료로 기록하지 않는다.

## v1.11.23 핵심 업데이트

- 갑주·망토·룬 독립 프로그램 런타임 레이어를 전투와 캐릭터 아틀리에에 연결
- 외형 프리셋 최근 수정·즐겨찾기·이름순 정렬과 이름·세트·방향·포즈 검색
- 외형 슬롯 3개 고정 보호와 Archive v2 JSON 병합
- Android Chrome·iOS Safari 실기기 캡처 승인 템플릿·증빙 검증·가져오기
- 선택형 외형 Cloud Save manual-opt-in 봉투·UID 가드 설계
- 물리 단말 캡처와 Firestore 실제 동기화는 아직 완료로 기록하지 않음

관련 문서: `docs/PATCH_NOTES_v1.11.23.md`, `docs/CHARACTER_APPEARANCE_CLOUD_SAVE_DESIGN_v1.11.23.md`, `docs/NEXT_UPDATE_v1.11.24.md`


## v1.11.24 핵심 업데이트

- 사용자 명시 동의 기반 외형 프리셋 Firestore 읽기·쓰기
- revision 비교, 양쪽 변경 충돌 중지, 실패 업로드 재시도 큐
- 외형 Archive v3 슬롯 순서 변경과 고정 슬롯 로컬 우선 병합
- 갑주·망토·룬 아이템 계열별 프로그램 마스크
- 검·대검·균열 장창 공격 본체 프레임 정렬 보정
- 관련 문서: `docs/PATCH_NOTES_v1.11.24.md`, `docs/CHARACTER_APPEARANCE_CLOUD_SAVE_v1.11.24.md`, `docs/NEXT_UPDATE_v1.11.25.md`

실제 물리 기기 캡처와 최종 수작업 공격·장비 원화는 완료로 기록하지 않는다.


## v1.11.25 핵심 업데이트

- 외형 슬롯 1·2·3, 슬롯 순서, 고정 상태, 최근 프리셋을 각각 선택하는 Cloud 충돌 비교·병합
- 로컬·Cloud·최신 슬롯 선택과 로컬 고정 슬롯 강제 보호
- 최근 프리셋 중복 제거·즐겨찾기 보존·최신 우선 병합
- Cloud 작업 전 자동 외형 복구 지점과 수동 백업·복원·JSON 내보내기/가져오기
- 계정 UID별 최대 5개 복구 지점과 다른 UID 복구 JSON 차단
- 관련 문서: `docs/PATCH_NOTES_v1.11.25.md`, `docs/CHARACTER_APPEARANCE_CONFLICT_RESOLUTION_v1.11.25.md`, `docs/CHARACTER_APPEARANCE_RECOVERY_v1.11.25.md`

실제 Android/iOS 물리 기기 캡처와 최종 수작업 공격·장비 원화는 완료로 기록하지 않는다.

## v1.11.26 핵심 업데이트

- 로컬·Cloud·RESULT 외형을 실제 캐릭터 3열 미리보기로 비교
- 슬롯별 병합 결과와 변경 필드를 저장 전에 시뮬레이션
- 병합 직전 외형을 30분 동안 보존하는 1회 실행 취소
- 복구 지점 이름 변경·검색·고정과 v1 → v2 자동 마이그레이션
- 계정별 고정 3개와 최근 5개, 총 8개 복구 지점
- 관련 문서: `docs/PATCH_NOTES_v1.11.26.md`, `docs/CHARACTER_APPEARANCE_VISUAL_MERGE_PREVIEW_v1.11.26.md`, `docs/CHARACTER_APPEARANCE_MERGE_UNDO_v1.11.26.md`, `docs/CHARACTER_APPEARANCE_RECOVERY_V2_v1.11.26.md`

실제 Android/iOS 물리 기기 캡처와 최종 수작업 공격·장비 원화는 완료로 기록하지 않는다.

## v1.11.27 핵심 업데이트

- 외형 복구 지점 POINT A·POINT B 실제 캐릭터 2열 비교
- 슬롯·염색·코스튬·방향·포즈·고정·순서·최근 프리셋 차이 계산
- UID별 최대 100건 외형 감사 기록
- 복구 차이와 관련 감사 기록 JSON 내보내기
- Cloud 동기화·충돌 병합·30분 Undo 감사 추적
- 관련 문서: `docs/PATCH_NOTES_v1.11.27.md`, `docs/CHARACTER_APPEARANCE_RECOVERY_DIFF_AUDIT_v1.11.27.md`, `docs/NEXT_UPDATE_v1.11.28.md`

실제 Android/iOS 물리 기기 캡처와 최종 수작업 공격·장비 원화는 완료로 기록하지 않는다.

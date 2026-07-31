# Character Appearance Recovery v1.11.25

외형 복구 지점은 일반 Player Profile 복구와 분리된 로컬 저장소다.

- 스키마: `lumerift-character-appearance-recovery-point-v1`
- 묶음 스키마: `lumerift-character-appearance-recovery-archive-v1`
- 최대 보관 수: 계정 UID별 5개
- 자동 생성 시점: Cloud 업로드 전, 충돌 병합 전, 복구 적용 전
- 수동 생성: 외형 복구 화면의 현재 상태 수동 백업
- 복구 적용: 현재 상태를 먼저 다시 백업한 후 선택 Archive를 전체 교체
- Cloud 동작: 복구 직후 자동 업로드하지 않음
- UID 보호: 내보낸 묶음의 `ownerUid`와 현재 로그인 UID가 다르면 가져오기 거부

복구 지점은 외형 슬롯, 슬롯 순서, 고정 상태, 최근 프리셋만 포함하며 게임 진행도와 보상 데이터는 포함하지 않는다.

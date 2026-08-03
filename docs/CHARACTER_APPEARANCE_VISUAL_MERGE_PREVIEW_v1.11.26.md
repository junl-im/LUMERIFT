# 외형 충돌 시각 병합 미리보기 v1.11.26

`CharacterAppearanceConflictPreviewScene`은 로컬·Cloud·RESULT 세 개의 `CharacterAppearanceSnapshotCard`를 렌더링한다.

- 세 카드 모두 실제 플레이어 Atlas와 공통 `CharacterEquipmentLayerView`를 사용한다.
- RESULT 카드는 `simulateCharacterAppearanceMerge`가 생성한 Archive만 사용한다.
- 슬롯 1·2·3을 이동하며 요청 출처, 고정 슬롯 보호, 변경 필드를 확인할 수 있다.
- 미리보기는 저장을 수행하지 않으며 최종 적용 버튼에서만 병합·Cloud 저장을 실행한다.

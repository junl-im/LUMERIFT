# 외형 병합 실행 취소 v1.11.26

- 저장 스키마: `lumerift-character-appearance-merge-undo-v1`
- 범위: 로그인 UID별 1개
- 유효 시간: 30분
- 소비 방식: 1회 사용 후 즉시 삭제
- 보존 데이터: 병합 직전 Character Appearance Archive v3와 병합 revision

만료된 지점은 조회 시 제거한다. 다른 UID에서는 볼 수 없고, 잘못된 revision이나 Archive는 로드하지 않는다. Undo 적용 전 현재 상태를 `pre-merge-undo` 일반 복구 지점으로 다시 저장한다.

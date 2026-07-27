# LUMERIFT v1.0.2 패치 노트

## 빌드 복구

GitHub Actions의 `tsc -b --pretty false`에서 발생한 다음 오류를 수정했다.

- `BattleActorView.ts`: 사용하지 않는 `deltaSeconds` 매개변수
- `BattleActorView.ts`: 사용하지 않는 `combat` 지역 변수

매개변수는 호출 계약을 유지하기 위해 `_deltaSeconds`로 변경하고, 불필요한 지역 변수는 제거했다.

## 유지 사항

- Vite 8 함수형 `manualChunks`
- Node.js 24 CI
- 십진 단위 MB 보고
- 런타임 전용 최적화 배포본
- 인수인계 파일 누적 갱신

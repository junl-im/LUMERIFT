# LUMERIFT v0.9.1 빌드 복구 패치

## 원인

Vite 8.1.5의 번들 출력 타입에서 `manualChunks` 객체 별칭 형식이 허용되지 않아 TypeScript TS2769가 발생했다.

## 수정

- `manualChunks`를 모듈 ID 기반 함수로 변경
- PixiJS와 Firebase 청크 분리 유지
- GitHub Actions Node.js 24 전환
- 빌드 설정 사전 검사 추가
- TypeScript 검사를 전체 검증 초반으로 이동

## 호환성

- 긴급 최소 패치는 v0.8.0 및 v0.9.0에 적용 가능
- 전체 v0.9.1은 v0.9.0의 모든 에셋과 기능을 포함

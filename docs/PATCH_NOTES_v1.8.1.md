# PATCH NOTES v1.8.1

## Fixed

- `src/ui/VirtualJoystick.ts`의 객체형 `lineStyle({...})` 호출 때문에 PixiJS 8.19.0 타입 검사에서 발생한 TS2345 오류를 수정했다.
- 십자 가이드 선은 `moveTo/lineTo` 경로 작성 후 `stroke({...})`를 호출한다.

## Regression guard

- `scripts/check-source-imports.mjs`가 `VirtualJoystick`에 객체형 `lineStyle()`가 다시 들어오면 실패한다.

## Unchanged

- v1.8.0 전투·보스·복구·시즌 랭킹
- Firebase Authentication·Firestore·Analytics
- Firebase App Check 비활성화
- 전체 런타임·원본·라이선스·보관 자산

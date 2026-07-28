# PATCH NOTES v1.6.0

## 추가 에셋 정리

- `public/assets` 전수 참조 분석
- 활성 런타임 27개·3.90MB만 GitHub Pages 배포 대상으로 유지
- 레거시·품질 후보·미사용 지역 자산 182개·19.70MB를 전체 통합본 보관소로 이동
- 빈 `.gitkeep` 4개 제거
- 전체 49 Atlas·3,206프레임·451애니메이션 보존

## 신규 도구

- `asset_registry/ASSET_REGISTRY.json`
- `asset_registry/RELOCATION_PLAN_v1.6.0.json`
- `npm run asset:relocate`
- `npm run asset:registry`
- `npm run validate:asset-cleanup`
- `npm run report:asset-cleanup`

## 적용 주의

v1.5.0에 패치 파일을 덮어쓴 뒤 `npm run asset:relocate`를 한 번 실행해야 기존 public 보관 자산이 새 보관 경로로 이동한다. 명령은 반복 실행해도 안전하도록 설계했다.

## 변경하지 않은 기능

- 전투·UI·저장 데이터
- Firebase Authentication·Cloud Save·랭킹
- Firestore Rules·Indexes
- App Check 비활성화 정책

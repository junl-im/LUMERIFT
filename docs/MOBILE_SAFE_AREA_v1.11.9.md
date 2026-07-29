# v1.11.9 모바일 전투 Safe Area

## 적용
- `MobileViewportController`의 실제 visual viewport 크기와 키보드 높이를 사용합니다.
- 폭 375px 이하, 높이 720px 이하, 소프트 키보드가 열린 경우를 compact 레이아웃으로 처리합니다.
- 조이스틱과 공격·스킬·회피 버튼을 자동 축소하고 위쪽으로 들어 올립니다.
- 상단 자동 타겟·자동 전투 버튼도 viewport offset을 반영합니다.

## 목적
- 작은 Android 화면과 iOS Safari 주소창 변화에서 버튼이 잘리거나 너무 아래에 붙는 현상을 줄입니다.
- 큰 HUD 접근성 옵션에서도 버튼이 화면 밖으로 나가지 않도록 축소 범위를 제한합니다.

## 미검증
- 실제 iPhone Dynamic Island와 Android 제조사별 제스처 바는 실기기 스크린샷 검수가 추가로 필요합니다.

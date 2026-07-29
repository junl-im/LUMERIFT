# MOBILE_PLATFORM_SAFE_AREA_v1.11.11

## 변경
`MobileViewportMetrics`에 선택적 플랫폼 정보를 포함하고 전투 HUD 계산에서 사용한다.

- iOS: 하단 홈 인디케이터 체감을 고려해 추가 14px 리프트
- Android: 브라우저 내비게이션 영역을 고려해 추가 7px 리프트
- visualViewport `offsetLeft`를 전투 버튼 수평 인셋에 반영
- 기존 소형 화면·짧은 화면·키보드 보정과 중복되지 않도록 단일 계산에서 처리

실기기 캡처와 장시간 성능 결과는 실제 측정 전까지 완료로 기록하지 않는다.

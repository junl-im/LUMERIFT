# Character Capture Evidence SHA-256 v2

승인 패키지는 JSON 1개와 실제 캡처 이미지 2개 이상으로 구성한다.

적용 조건:
1. 플랫폼이 Android Chrome 또는 iOS Safari다.
2. JSON의 파일명과 선택한 이미지 파일명이 일치한다.
3. SHA-256, 바이트 수, 픽셀 크기가 모두 일치한다.
4. 검토자, 촬영 시각, viewport, DPR, 승인 플래그가 유효하다.

하나라도 불일치하면 `capture-verified`로 전환하지 않는다. App Check 비활성 정책은 유지한다.

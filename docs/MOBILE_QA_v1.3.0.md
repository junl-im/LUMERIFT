# 모바일 레이아웃 QA v1.3.0

## 적용 사항

- `viewport-fit=cover`
- CSS `env(safe-area-inset-*)`
- `100dvh`와 구형 브라우저 폴백
- `window.visualViewport` 기반 주소창·가상 키보드 높이 반영
- 세로형 540×960 논리 해상도 유지
- 가로형 소형 터치 기기 안내 화면

## 자동 검사

`npm run validate:mobile`

검사 항목:

- viewport 메타 태그
- Safe Area CSS
- 동적 뷰포트 변수
- 가상 키보드 오프셋
- 컨트롤러 시작·정리
- 9:16 운영 화면 미리보기

## 남은 실기기 항목

- iPhone Safari 노치·홈 인디케이터
- Android Chrome 주소창 축소·확장
- 삼성 인터넷 폰트 크기
- 저사양 WebGL 텍스처 메모리
- 30·60FPS 발열과 배터리

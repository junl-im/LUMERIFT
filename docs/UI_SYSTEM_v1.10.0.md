# LUMERIFT UI SYSTEM v1.10.0

## v1.9.0 유지 항목

- Luminous v5 패널·아이콘 Atlas
- `UiSkin`, `UiTheme`, `UiButton`, `SceneChrome`
- 540×960 세로형 논리 해상도
- PNG/WebP 전용, SVG 금지
- Obsidian·Gold·Teal 색 체계

## v1.10.0 확장

### 공통 입력

`UiMotion.bindPressFeedback`가 공통 눌림, 취소, 외부 해제, 최소 터치 영역, reduced motion 처리를 담당한다. 시각 버튼의 높이가 44 미만이어도 실제 판정은 48 논리 픽셀 이상이다.

### 모바일 뷰포트

`MobileViewportController`가 visual viewport offset과 scale을 포함해 CSS 변수로 전달한다. `#app`은 시각 뷰포트에 고정되고 Safe Area는 내부 패딩으로 반영된다.

### 스테이지

노드 상태를 텍스트만으로 전달하지 않고 잠금·완료·일반·정예·보스 아이콘으로 중복 표현한다. 선택 노드는 저강도 펄스로 강조하고 상세 카드에는 권장 전투력 충족 여부를 표시한다.

### 퀘스트

퀘스트 상태, 골드·경험치 보상, 수령 가능 상태를 아이콘과 색으로 구분한다. 완료 후 미수령 패널은 약한 펄스로 행동 우선순위를 안내한다.

### 결과

메달과 등급은 진입 시 짧게 확대되며 reduced motion 설정에서는 공통 눌림 축소를 사용하지 않는다. 보상과 다음 행동은 아이콘을 병기한다.

### 운영

공지·출석·우편·쿠폰 탭에 처리할 항목 수를 표시한다. 쿠폰은 DOM 전용 오버레이를 사용해 모바일 키보드와 접근성 레이블을 지원한다.

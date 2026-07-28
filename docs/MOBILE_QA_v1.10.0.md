# 모바일 UI QA v1.10.0

## 적용 범위

v1.10.0은 Android Chrome·Samsung Internet·iOS Safari에서 흔히 발생하는 주소창, 노치, 홈 인디케이터, 가상 키보드, 자동 글자 확대, 고 DPI GPU 메모리 문제를 코드 단계에서 방어한다.

## 자동 검증 항목

- `visualViewport.width/height/offsetTop/offsetLeft/scale`
- `viewport-fit=cover`와 네 방향 Safe Area
- `100dvh` 및 구형 브라우저 폴백
- 키보드 열림 기준 80px과 게임 입력 차단
- iOS·Android 플랫폼 데이터 속성
- coarse pointer·reduced motion 데이터 속성
- 최소 48×48 논리 픽셀 터치 판정
- 4GB 이하 메모리 또는 4코어 이하 기기의 렌더 해상도 1.5배 상한
- 쿠폰 입력 16px 폰트·대문자 정규화·키보드 안전 영역

## 기기별 수동 체크리스트

| 구분 | 확인 항목 | 합격 기준 |
|---|---|---|
| iPhone Safari | 노치·홈 인디케이터 | 상단 제목과 하단 버튼이 Safe Area 안쪽에 위치 |
| iPhone Safari | 주소창 축소·확장 | 캔버스 비율과 터치 좌표가 유지됨 |
| iPhone Safari | 쿠폰 키보드 | 입력 카드가 키보드에 가려지지 않음 |
| Android Chrome | 주소창 변화 | 화면 점프와 이중 높이 차감이 없음 |
| Samsung Internet | 글자 크기 | 시스템 글자 확대 상태에서도 버튼·입력창 겹침 없음 |
| 저사양 Android | 30/60FPS | 자동 모드가 장시간 저프레임에서 30FPS로 안정화 |
| 모든 터치 기기 | 작은 버튼 | 실제 터치 판정은 최소 48 논리 픽셀 |

## 이번 환경에서 확인한 범위

- TypeScript 구문 검사
- 파일 기반 UI 계약 검사
- 모바일 뷰포트·터치·입력 오버레이 정적 검증
- 9:16 디자인 QA 접촉 시트 생성

`docs/previews/v1.10.0_mobile_qa_contact.webp`는 디자인 QA 시뮬레이션이며 물리 기기 런타임 캡처가 아니다. Android Chrome·iOS Safari 물리 기기의 FPS·발열·GPU 메모리 최종 계측은 배포 후 실제 단말에서 수행해야 한다.

# LUMERIFT v1.10.0 패치 노트

## 실기기 대응 UI QA 보강

- `visualViewport`의 높이뿐 아니라 offset·scale을 CSS 변수로 동기화합니다.
- iOS·Android·데스크톱 플랫폼, coarse pointer, reduced motion 상태를 루트 데이터 속성으로 기록합니다.
- 주소창 축소·확장, 화면 회전, pageshow, 포커스 복귀 시 레이아웃을 requestAnimationFrame 단위로 재계산합니다.
- 가상 키보드가 열린 상태에서 게임 캔버스의 중복 높이 차감을 제거했습니다.
- 저메모리 또는 4코어 이하 기기에서는 캔버스 해상도 상한을 1.5배로 제한해 GPU 메모리 급증을 줄입니다.
- 브라우저 자동 글자 확대를 100%로 고정하고 iOS Safe Area·고정 뷰포트·스크롤 바운스를 보강했습니다.

## 공통 터치 피드백

- `UiMotion.bindPressFeedback`를 추가했습니다.
- 공통 버튼·메뉴·스테이지 노드·운영 탭은 최소 48×48 논리 픽셀 터치 영역을 사용합니다.
- pointer cancel·outside·reduced motion 상황에서도 눌림 상태가 남지 않도록 복구합니다.

## 세부 화면 2차 개선

- 스테이지: 잠금·완료·일반·정예·보스 상태 아이콘, 선택 펄스, 전투력 준비도 문구를 추가했습니다.
- 퀘스트: 상태 아이콘, 골드·경험치 보상 아이콘, 수령 가능 패널 펄스, 44px 행동 버튼을 적용했습니다.
- 결과: 등급 메달 등장 애니메이션, 전투 지표·보상·행동 아이콘을 추가했습니다.
- 운영: 탭별 미확인 개수, 현재 섹션 상태 요약, 44px 수령 버튼을 적용했습니다.
- 쿠폰: `window.prompt`를 제거하고 Safe Area·가상 키보드 대응 전용 입력 오버레이로 교체했습니다.

## 호환성

- App Check는 계속 비활성화 상태입니다.
- Firebase Auth·Firestore·Cloud Save·랭킹·기존 보상 로직은 변경하지 않았습니다.
- v1.8 AttackFootprint 전투 판정 계약은 변경하지 않았습니다.

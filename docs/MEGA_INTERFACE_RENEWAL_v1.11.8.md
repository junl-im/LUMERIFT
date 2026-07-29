# v1.11.8 초대규모 인터페이스 리뉴얼

## 범위
- Boot, Login, Lobby, Stage, Inventory, Quest, Operations, Account, Ranking, Settings, Battle, Result
- 공통 `InterfaceChrome`, `SceneChrome`, `UiSkin`, `UiButton`, `UiTheme` 계층 리뉴얼

## 디자인 언어
- 웹툰 컷을 연상시키는 대각 프레임과 챕터 레일
- 이중 외곽 프레임과 코너 브래킷
- 하프톤 도트와 저밀도 스캔 라인
- 청록/금색 이중 포인트
- 패널 명령 레일과 버튼 상태 도트
- 전투 화면 좌우 `COMBAT FEED / RIFT SIGNAL` 사이드 마커

## 성능 원칙
- 신규 대용량 런타임 이미지를 추가하지 않는다.
- 기존 Atlas와 PixiJS Graphics를 재사용한다.
- UI 장식은 충돌·공격·AI·저장 로직과 분리한다.

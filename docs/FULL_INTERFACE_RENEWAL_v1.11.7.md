# v1.11.7 첫 시작 전체 인터페이스 리뉴얼

## 적용 범위
- Boot: FIRST AWAKENING 카드, 공통 인터페이스 배경, 새 진행 표시 구조
- Login: ACCOUNT GATE 카드, 실제 보이는 로그인/게스트/설정 버튼으로 교체
- Lobby: COMMAND HUB 스탬프와 공통 인터페이스 배경 적용
- SceneChrome: 스테이지·인벤토리·퀘스트·설정·결과 등 공통 씬에 UI RENEWAL 배경 적용
- Battle: TARGET / AUTO 토글, LOCK SIGNAL 패널, 타겟 링/연결선 적용

## 공통 디자인 언어
- 어두운 바탕 위 청록·금색 포인트
- 웹툰 컷 같은 대각선 절단선과 카드 스탬프
- 얇은 도트 패턴과 하단 UI 레일
- 기존 glass panel과 NineSlice 자산을 유지해 용량 증가를 방지

## 성능 정책
- 신규 대용량 런타임 이미지를 추가하지 않는다.
- Graphics 기반 장식을 사용하고 기존 Atlas/Lazy Loading 계약을 유지한다.
- 초기 다운로드 15MB 예산과 public/assets 8MB 배포 예산을 유지한다.

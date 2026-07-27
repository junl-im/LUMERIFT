# LUMERIFT v1.3.0 운영 UI 기준

## 목적

공지·출석·우편·쿠폰을 로비와 분리된 운영실 화면에서 동일한 Obsidian·Gold·Teal 디자인 체계로 제공한다. 단순 텍스트 목록이 아니라 실제 런타임 보상 수령과 저장 이력을 연결한다.

## 화면 구성

- 공지: 중요·일반 공지, 읽음 상태, 게시일, 상세 내용
- 출석: 월요일 시작 7일 주기, 오늘 보상 1회 수령, 주간 진행률
- 우편: 발신자·만료일·첨부 보상, 개별·일괄 수령
- 쿠폰: 코드 입력, 만료·중복 사용 검증, 계정 저장
- 퀘스트: 공통 패널, 상태 배지, 진행 바, 보상 영역으로 v1.2 체계에 통합

## 저장 데이터 v4

`PlayerProfile.operations`에 다음을 저장한다.

- `attendanceCycleKey`
- `attendanceClaims`
- `noticeReads`
- `mailClaims`
- `redeemedCoupons`

v1~v3 저장 데이터는 읽을 때 v4로 자동 마이그레이션한다.

## 런타임 자산

- `public/assets/live/v3/atlases/operations/operations_ui_v3.webp`
- 160×160 프레임 12개
- 공지·출석·우편·쿠폰·보상·상태 아이콘
- 운영 화면 진입 시 Lazy Loading, 종료 시 참조 해제

## 품질 판정

현재 운영 UI는 실제 게임 화면에 연결된 `production-candidate-open-art-pass`다. 독점 최종 원화가 아니므로 `final-approved`로 기록하지 않는다.

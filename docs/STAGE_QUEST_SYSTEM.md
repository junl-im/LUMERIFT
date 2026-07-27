# Stage and Quest System v0.5

## 스테이지

- 챕터 1은 `stage_001`부터 `stage_010`까지 고정한다.
- `order`가 저장 데이터의 `highestStage` 이하인 스테이지만 입장할 수 있다.
- 승리 시 다음 순서가 해금되며, 최초 보상은 `firstClearReceived`로 중복 지급을 막는다.
- 각 스테이지는 클리어 횟수와 최고 기록을 저장한다.
- 1-5, 1-7, 1-9는 정예 중심, 1-10은 보스 스테이지다.

## 퀘스트

- 메인 퀘스트는 선행 보상을 수령해야 다음 퀘스트가 개방된다.
- 일일 퀘스트는 UTC 날짜가 변경되면 진행 통계와 수령 상태를 초기화한다.
- 조건은 스테이지 지정 클리어, 임의 스테이지 클리어, 몬스터 처치, 장비 강화, 장비 획득을 지원한다.
- 보상 수령은 불변 PlayerProfile을 반환하고 즉시 Repository에 저장한다.

## 저장 데이터 v3

- `stageProgress`
- `questClaims`
- `dailyQuestDate`
- `dailyQuestClaims`
- `statistics`
- `dailyStatistics`
- `tutorial`

v1과 v2 데이터는 장비를 유지한 상태로 v3 필드를 자동 생성한다.

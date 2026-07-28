# LUMERIFT v1.5.0 랭킹

## 보드

- 전체 랭킹: `rankings/{uid}`
- 주간 랭킹: `weeklyRankings/{YYYY-MM-DD}_{uid}`
- 주간 기준: UTC 월요일

## 점수

현재 MVP 점수는 클라이언트에서 계산된 전투력이며 다음 필드를 저장한다.

- uid
- nickname
- score
- stage
- level
- weekKey(주간만)
- updatedAt(serverTimestamp)

## 읽기 비용

실시간 리스너를 사용하지 않는다. 랭킹 화면 진입 시 다음만 수행한다.

- 상위 12명 스냅샷 1회
- 내 순위 계산용 count 집계 최대 2회

전체 및 주간 랭킹은 공개 읽기이며 쓰기는 인증된 본인 UID 문서만 허용한다.

## 보안 한계

Spark 클라이언트 MVP에서는 점수 계산을 완전하게 신뢰할 수 없다. 경쟁성 보상이나 시즌 보상은 Admin SDK, Cloud Run 또는 Cloud Functions 기반 서버 검증 전에는 지급하지 않는다.

# Boss Dodge Data v1.11.15

보스 회피 규칙을 `src/data/boss-dodge-rules.json`으로 분리했다.

- 데이터 버전: 1
- 기본 fallback 규칙 1개
- 심연 절단·심연 폭발·추적 균열 규칙 3개
- triggerProgress, critical, directionMode, reason을 데이터로 관리
- `validate-game-data.mjs`가 실제 보스 패턴 ID와 회피 규칙의 1:1 참조를 검사
- 런타임은 잘못된 값이 들어와도 안전한 기본 규칙으로 정규화

텔레그래프와 실제 타격 판정은 기존 `AttackFootprint` 공유 계약을 유지한다.

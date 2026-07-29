# BOSS_DODGE_RULES_v1.11.11

## 패턴 규칙
- `boss_cleave` 심연 절단: 54% 진행 시 측면 회피
- `boss_nova` 심연 폭발: 46% 진행 시 보스 반대 방향으로 범위 이탈
- `boss_rupture` 추적 균열: 66% 진행 시 대각선 회피

`critical-only` 정책에서는 치명 패턴인 심연 폭발과 추적 균열을 우선 회피한다.
알 수 없는 보스 패턴은 기존 `boss-critical-evade` 안전 규칙으로 폴백한다.

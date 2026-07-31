# LUMERIFT v1.11.22 Patch Notes

## 추가

- 검·대검·균열 장창 전용 공격 본체 Atlas v11
- 432프레임·72애니메이션의 8방향 3연격
- 무기·갑주·망토·룬 파트 집중 보기
- FIT/CLOSE/DETAIL 3단계 확대 비교
- 외형 프리셋 보관소
- 프리셋 이름 변경·즐겨찾기·삭제
- 외형 슬롯·최근 프리셋 JSON 백업·복원

## 변경

- 공격 포즈는 v11 전용 Atlas를 우선 사용하고 실패 시 v10 프레임 레시피로 복구한다.
- 즐겨찾기 프리셋은 최근 목록 상단에 유지한다.
- v1.11.21 프리셋은 이름·식별자·즐겨찾기 기본값을 자동 보완한다.

## 유지

- Player Save v4
- AttackFootprint 단일 판정
- Firebase App Check 비활성
- PNG/WebP 자산 정책
- 초기 다운로드 15MB 예산

## 제한사항

- 전용 공격 Atlas는 v10 본체 파생 제작 후보이며 최종 수작업 원화가 아니다.
- Android Chrome·iOS Safari 실제 물리 기기 캡처·온도·GPU 메모리 측정은 수행하지 않았다.
- 현재 실행 환경의 패키지 레지스트리에 `@types/node@26.1.1`이 없어 실제 의존성 설치 기반 Vitest·Vite 빌드는 수행하지 못했다.
- 전체 public 런타임 자산은 10.58MB로 15MB 상한 이내이며, 초기 core-ui 로드와 전투 전용 Lazy Loading을 분리한다.

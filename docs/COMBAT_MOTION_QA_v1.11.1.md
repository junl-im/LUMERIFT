# LUMERIFT v1.11.1 전투 모션·실기기 QA 기준

## 런타임 모션

현재 플레이어 기본 이미지는 `public/assets/live/v4/atlases/player`의 68프레임·8방향 계약을 유지한다. `PlayerMotionDirector`는 이미지 교체 없이 상태 진행률을 사용해 공격 선행 동작, 스킬 상승, 회피 압축, 피격 흔들림, Drive 오라와 잔상을 동기화한다.

## 제작용 전용 원본

`art_source/lumerift_original/v1.11.1/player/player_motion_8dir_blockout_master.png`는 8방향 × 걷기·공격·피격·회피 × 4프레임 구조다. 이는 방향·피벗·동작 곡선을 검증하는 제작용 블록아웃이며 최종 런타임 원화가 아니다.

## 기기 보정

- entry: 장시간 안정 우선, 전투 렌더 편향 0.82
- balanced: 표준 품질과 안정성, 편향 1.00
- performance: 고성능 확장, 편향 1.08

등급은 메모리·논리 코어·DPR·터치 환경을 사용한다. 브라우저 힌트이므로 실제 온도·배터리·GPU 메모리 측정을 대신하지 않는다.

## 보스 위험 장판

장판은 색상 외에도 `◎` 또는 `◢`, 패턴명, 예고·위험·회피 단계와 시간 눈금을 제공한다. 보이는 경고와 실제 판정은 계속 동일한 AttackFootprint를 사용한다.

## 모바일 입력

각 전투 버튼은 한 번에 하나의 pointerId만 소유한다. `pointercancel`과 외부 해제를 복구하며 짧은 간격의 중복 탭 실행을 차단한다.

## 물리 단말 체크리스트

- Android Chrome·Samsung Internet·iOS Safari 세로 360~430px
- 20분 전투 평균 FPS·1% Low·33ms/50ms 긴 프레임
- 배터리 감소율과 표면 온도 수동 기록
- 보스 장판 기호·텍스트·판정 일치
- 멀티터치 중 공격·스킬·회피 중복 실행 없음

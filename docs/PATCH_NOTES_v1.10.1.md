# LUMERIFT v1.10.1 패치 노트

## 추가

- 실제 단말에서 FPS·1% Low·긴 프레임·뷰포트·렌더 상태를 저장하는 기기 QA JSON
- 지속 성능 저하 기반 `full / balanced / safe` 자동 품질 단계
- 색상 보조·고대비·큰 HUD·연출 완화 설정 화면
- 전투 HP·위험·보스 상태의 색상과 기호 중복 표현
- 시즌 스냅샷·현재 저장·복구 지점 JSON 내보내기/가져오기
- LUMERIFT 전용 8방향 플레이어 실루엣 블록아웃 원본

## 유지

- Firebase App Check 비활성화
- Player Save v4와 기존 Cloud Save 충돌 정책
- v1.8 AttackFootprint 기반 경고·피격 판정
- PNG/WebP 전용 이미지 정책과 15MB 초기 로드 예산

## 제한

현재 환경에서는 Android·iPhone 물리 기기에서 직접 FPS·표면 온도·GPU 메모리를 측정하지 못했다. v1.10.1은 실제 단말이 자체 QA JSON을 생성할 수 있는 계측 기반을 제공하며, 수집 로그를 이용한 임계값 보정은 v1.10.2에서 수행한다.

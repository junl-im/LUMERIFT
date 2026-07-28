# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.10.1  
**상태:** 실기기 계측 기반·접근성 HUD·시즌/복구 JSON·전용 실루엣 블록아웃 완료

## 우선 확인

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/MOBILE_DEVICE_QA_v1.10.1.md`
5. `docs/ACCESSIBILITY_v1.10.1.md`
6. `docs/RECOVERY_ARCHIVE_v1.10.1.md`
7. `docs/PLAYER_SILHOUETTE_v1.10.1.md`

## v1.10.1 현재 상태

- v1.10.0 visualViewport·Safe Area·48px 터치 계약을 유지한다.
- PerformanceMonitor가 평균 FPS, 1% Low, 긴 프레임 비율, 추세를 기록한다.
- AdaptivePerformanceController가 그래픽 상한, AUTO FPS, 캔버스 resolution을 단계 조정한다.
- 설정 화면에서 기기 QA JSON과 접근성 옵션을 제공한다.
- 복구 화면에서 UID 검증형 시즌/복구 JSON을 저장·복원한다.
- 전용 플레이어 8방향 원본은 블록아웃 단계이며 런타임 Atlas로 교체하지 않았다.
- Firebase App Check는 초기화·키·enforcement 모두 비활성화 상태다.

## 미완료

- Android Chrome·Samsung Internet·iOS Safari 물리 기기 QA JSON 수집
- 표면 온도와 제조사 GPU/메모리 진단값 병행 기록
- 수집 로그를 이용한 자동 단계 임계값 보정
- 플레이어 8방향 걷기·공격·피격·회피 최종 프레임 제작 및 런타임 연결

## 릴리스

- 전체본: `LUMERIFT_FULL_v1.10.1.zip`
- 패치: `LUMERIFT_PATCH_v1.10.0_to_v1.10.1.zip`
- 기준 패치: v1.10.0에 덮어쓰기
- 삭제/이동: 없음

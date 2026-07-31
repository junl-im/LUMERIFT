# 선택형 외형 프리셋 Cloud Save 설계 — v1.11.23

## 기본 원칙

- 기본값은 로컬 저장이며 자동 업로드하지 않는다.
- 사용자가 명시적으로 동기화를 선택한 경우에만 `manual-opt-in` 봉투를 생성한다.
- 경로는 `users/{uid}/settings/characterAppearance`로 사용자 UID에 격리한다.
- 다른 UID의 봉투는 가져오지 않는다.
- Player Save v4와 분리된 설정 데이터로 유지한다.
- 고정된 로컬 슬롯은 원격 병합 시 로컬 값을 우선한다.

## 현재 구현 범위

- Cloud Save 봉투 생성·검증·UID 가드
- 문서 경로 계약
- 외형 Archive v2 포함

## 미연결 범위

- Firestore 실제 읽기·쓰기 UI
- 충돌 선택 화면
- 서버 시간 기반 revision 확정
- 오프라인 재시도 큐

App Check는 기존 결정대로 사용하지 않는다. 실제 연결 단계에서는 Firebase Authentication과 Firestore Security Rules를 보호 경계로 사용한다.

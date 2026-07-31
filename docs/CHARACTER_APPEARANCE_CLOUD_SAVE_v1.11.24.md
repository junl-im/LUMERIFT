# Character Appearance Cloud Save v1.11.24

## 경로와 동의

- 문서: `users/{uid}/settings/characterAppearance`
- 동기화 모드: `manual-opt-in`
- 동의 전 원격 읽기·쓰기 없음
- 사용자 UID와 문서 owner UID가 다르면 거부

## revision과 충돌

Archive v3의 정규화 JSON을 FNV-1a로 해시해 `appearance-xxxxxxxx` revision을 만든다.

- 동일: 현재 상태
- 로컬만 변경: Cloud 업로드
- 원격만 변경: 가져오기 후보 표시
- 양쪽 변경: 충돌 중지
- 업로드 실패: 로컬 재시도 큐

## 병합

Cloud Archive를 가져올 때 현재 로컬의 고정 슬롯은 교체하지 않는다. 병합 후 새 통합 Archive를 Cloud에 다시 저장한다.

## 보안

Firestore Rules는 owner UID, v2 봉투, Archive v3, revision 형식, 서버 타임스탬프를 확인한다. App Check는 프로젝트 정책에 따라 비활성이다.

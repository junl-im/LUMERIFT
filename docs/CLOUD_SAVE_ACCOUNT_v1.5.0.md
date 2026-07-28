# LUMERIFT v1.5.0 계정·Cloud Save 관리

## 화면 진입

로비 하단의 `계정 · CLOUD/OK/OFFLINE/ERROR` 버튼으로 `AccountScene`에 진입한다.

## 계정 기능

- 익명 계정: Google 또는 이메일 자격 증명 연결
- Google 계정: 로그인 제공자와 이메일 표시
- 이메일 계정: 인증 메일 발송, 인증 상태 새로고침, 비밀번호 재설정 메일
- 모든 계정: 로그아웃, UID 축약 표시

익명 계정 연결은 Firebase `linkWithPopup` 또는 `linkWithCredential`을 사용해 UID를 유지한다.

## Cloud Save 상태

`ResilientPlayerRepository`는 다음 상태를 제공한다.

- `idle`: 동기화 대기
- `syncing`: Firestore 읽기/쓰기 진행
- `synced`: 최근 동기화 성공
- `offline`: 네트워크 없음, 로컬 저장 유지
- `error`: 원격 실패, localStorage 재시도 대기열 보존

## 충돌 비교

`inspect(uid)`가 로컬과 Firestore 원본을 동시에 읽고 다음을 비교한다.

- `updatedAt`
- 레벨
- 최고 스테이지
- 골드

저장 시각 차이가 2초를 넘으면 충돌 표시를 활성화한다. 자동 로드는 최신 `updatedAt`을 선택하지만 계정 화면에서는 사용자가 다음 방향을 수동 실행할 수 있다.

- 로컬 → 클라우드
- 클라우드 → 로컬

Cloud Save는 골드나 전투 결과의 서버 권위 검증이 아니라 계정별 진행 백업이다. 클라이언트 조작 방지는 별도 서버 검증이 필요하다.

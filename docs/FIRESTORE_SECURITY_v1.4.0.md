# Firestore 보안 규칙 설명 v1.4.0

## 보호 범위

- 사용자 프로필은 로그인한 사용자가 자기 UID 문서만 읽고 쓸 수 있다.
- 다른 사용자 프로필 목록 조회는 금지한다.
- 공지와 게임 설정은 공개 읽기, 클라이언트 쓰기 금지다.
- 우편은 클라이언트가 생성·삭제할 수 없으며, 수령 여부 필드만 변경할 수 있다.
- 쿠폰 원문과 쿠폰 사용 기록은 클라이언트 접근을 전부 금지한다.
- 명시되지 않은 모든 경로는 기본 거부한다.

## 중요한 한계

Firestore Rules는 사용자의 UID와 데이터 형식·범위는 검사할 수 있지만, 클라이언트가 계산한 골드·경험치·전투 결과가 실제 플레이 결과인지 완전히 증명하지 못한다. 현재 프로필은 클라이언트 권한형 MVP이므로 치팅 방어가 필요한 보상은 서버에서 검증해야 한다.

Spark 무료 요금제에서 Cloud Functions 기반 보상 검증을 바로 운영하기 어렵다면 다음 순서를 사용한다.

1. 일반 진행 저장만 `users/{uid}`에 허용
2. 쿠폰은 로컬 데모 상태로 유지하고 Firestore 경로는 차단
3. 우편은 Firebase Console에서 관리자 수동 생성
4. 유료 전환 시 Admin SDK 기반 Cloud Run 또는 Cloud Functions에서 보상 지급
5. 서버 지급 완료 후 프로필 직접 골드 수정 권한을 더 강하게 제한

## 배포 전 확인

- Firebase Console Rules 탭에 테스트 모드 규칙이 남아 있지 않은지 확인
- `allow read, write: if true`가 없는지 확인
- 규칙 배포 후 익명·Google·이메일 계정 각각으로 자기 문서만 접근 가능한지 확인
- 다른 UID 문서 접근이 `permission-denied`인지 확인

## v1.5.0 랭킹 추가

- `rankings/{uid}`는 공개 읽기, 본인 UID만 제한 필드 쓰기를 허용한다.
- `weeklyRankings/{weekKey}_{uid}`는 공개 읽기이며 문서 ID와 데이터의 `weekKey`, 인증 UID 일치를 강제한다.
- 클라이언트 랭킹은 표시용 MVP이며 서버 검증 보상에는 사용하지 않는다.
- 실제 권한은 `npm run firebase:test:rules`로 Local Emulator Suite에서 검사한다.

## v1.8.0 추가 규칙

`seasonRankings/{entryId}`는 공개 읽기와 본인 쓰기만 허용한다. `entryId == seasonId + '_' + request.auth.uid`를 강제하며 시즌 ID·점수·스테이지·레벨 범위를 검사한다.


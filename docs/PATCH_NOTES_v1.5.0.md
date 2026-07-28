# PATCH NOTES v1.5.0

## Added

- 계정 및 Cloud Save 관리 화면
- 익명 계정 Google/이메일 연결 UI
- 이메일 인증 메일, 비밀번호 재설정, 로그아웃
- 로컬·클라우드 저장 비교와 충돌 표시
- 수동 업로드·다운로드
- Cloud Save 상태 구독과 마지막 동기화 정보
- 전체·주간 랭킹 및 내 순위 집계
- Firestore Emulator 권한 테스트
- 계정·랭킹 화면 미리보기

## Changed

- 로비 하단에 계정/Cloud 상태 버튼 추가
- Firestore 랭킹 스키마에 level과 주간 보드 추가
- Rules와 Indexes를 v1.5.0 계약으로 갱신
- App Check 비활성화 결정을 유지

## Known limitations

- 랭킹 점수는 클라이언트 계산형 MVP이며 서버 권위 검증 전까지 경쟁 보상에 사용하지 않는다.
- 실제 Firebase Emulator 테스트는 firebase-tools와 npm 의존성이 설치된 환경에서 실행해야 한다.

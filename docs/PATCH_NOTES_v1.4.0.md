# LUMERIFT v1.4.0 패치 노트

- Firebase npm modular SDK를 실제 프로젝트 `lumerift-8db07`에 연결
- 익명·Google·이메일 회원가입/로그인 지원
- 익명 계정의 Google/이메일 계정 연결로 UID 유지
- 로그인 세션 브라우저 영구 저장과 자동 복원
- Firestore IndexedDB 다중 탭 오프라인 캐시
- 로컬 우선 Cloud Save와 실패 재시도 대기열
- 로컬/클라우드 저장 중 최신 `updatedAt` 자동 선택
- Firestore 원격 공지와 15분 캐시, 내장 공지 폴백
- Analytics 지원 환경 지연 초기화
- App Check 환경변수 연결 지점 추가
- Firestore 보안 규칙·복합 색인·Emulator 설정 추가
- Firebase 자동 검증 스크립트와 배포 명령 추가

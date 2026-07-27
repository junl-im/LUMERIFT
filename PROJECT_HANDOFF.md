# LUMERIFT 프로젝트 인수인계

**현재 버전:** v1.4.1  
**공개 주소:** https://junl-im.github.io/LUMERIFT/  
**Firebase 프로젝트:** `lumerift-8db07`

## 작업 시작 전 필독

1. `AGENTS.md`
2. `HANDOFF_STATE.json`
3. `docs/HANDOFF_MASTER.md`
4. `docs/FIREBASE_SETUP_v1.4.0.md`
5. `docs/FIRESTORE_SECURITY_v1.4.0.md`
6. `docs/ROADMAP.md`

## v1.4.1 현재 상태

- npm `firebase@12.16.0` modular SDK 사용
- 익명·Google·이메일 로그인과 익명 계정 연결 완료
- Firestore 사용자 프로필 Cloud Save와 IndexedDB 오프라인 캐시 완료
- 로컬 우선 저장 및 실패 재시도 대기열 완료
- 원격 공지 조회·캐시·내장 공지 폴백 완료
- Firestore Rules·Indexes·Emulator 구성 완료
- 쿠폰·고가치 보상은 서버 검증 전까지 로컬 데모 상태

모든 후속 릴리스는 Firebase 규칙 변경과 데이터 경로 변경을 `HANDOFF_STATE.json`과 `docs/HANDOFF_LOG.md`에 기록해야 합니다.

## v1.4.1 긴급 수정

- `npm run firebase:deploy:rules` 누락 문제 복구
- 공식 배포 명령: `npx firebase-tools deploy --only firestore --project lumerift-8db07`
- 현재 폴더의 `package.json`이 갱신되지 않으면 패치를 프로젝트 루트에 다시 덮어쓴다.

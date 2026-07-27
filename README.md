# LUMERIFT: 균열의 계승자 v1.4.1

세로형 9:16 모바일 웹 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase modular SDK 기반입니다.

## v1.4.1 긴급 수정

- Firebase Rules·Indexes 배포 npm 스크립트 복구
- 최신 CLI 공식 형식 `--only firestore`로 배포 명령 통일
- `firebase:check`, `firebase:deploy:firestore` 명령 추가

## v1.4.0 핵심 변경

- Firebase 프로젝트 `lumerift-8db07` npm 연결
- 익명·Google·이메일 인증
- 익명 계정의 Google/이메일 계정 연결
- 브라우저 로그인 세션 자동 복원
- IndexedDB 기반 Firestore 오프라인 캐시
- 로컬 우선 Cloud Save와 실패 재시도 대기열
- Firestore 원격 공지와 15분 캐시
- Analytics 선택 초기화와 App Check 연결 지점
- Firestore 보안 규칙·복합 색인·Emulator 설정

## 실행

```bash
npm install
npm run validate:firebase
npm run verify
npm run dev
```

Firebase Console 설정과 규칙 배포는 `docs/FIREBASE_SETUP_v1.4.0.md`를 먼저 확인합니다.

## Firestore 배포

```bash
npm run firebase:check
npm run firebase:deploy:rules
```

스크립트가 보이지 않으면 프로젝트 루트의 `package.json`이 v1.4.1인지 확인합니다.

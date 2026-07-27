# LUMERIFT: 균열의 계승자 v1.4.2

세로형 9:16 모바일 웹 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase modular SDK 기반입니다.

## v1.4.2 변경

- Firebase App Check 런타임 초기화 제거
- reCAPTCHA 사이트 키 환경변수 제거
- GitHub Actions App Check Secret 주입 제거
- Firebase Console enforcement 비활성화 기준 고정
- Authentication·Firestore Cloud Save·오프라인 캐시·Analytics 유지
- App Check 재도입 방지 자동 검사 추가

## Firebase 유지 기능

- 익명·Google·이메일 인증
- 익명 계정의 Google/이메일 계정 연결
- 브라우저 로그인 세션 자동 복원
- IndexedDB 기반 Firestore 오프라인 캐시
- 로컬 우선 Cloud Save와 실패 재시도 대기열
- Firestore 원격 공지와 15분 캐시
- Analytics 선택 초기화
- Firestore 보안 규칙·복합 색인·Emulator 설정

## 실행

```bash
npm install
npm run validate:firebase
npm run verify
npm run dev
```

Firebase Console 설정과 규칙 배포는 `docs/FIREBASE_SETUP_v1.4.2.md`를 확인합니다.

## Firestore 배포

```bash
npm run firebase:check
npm run firebase:deploy:rules
```

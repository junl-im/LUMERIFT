# LUMERIFT Firebase 설정 가이드 v1.4.2

## 적용 프로젝트

- Firebase project ID: `lumerift-8db07`
- 공개 게임 주소: `https://junl-im.github.io/LUMERIFT/`
- SDK: npm `firebase@12.16.0` modular API
- Hosting: GitHub Pages

## Firebase Console 필수 체크

1. Authentication > Sign-in method
   - Anonymous: Enabled
   - Email/Password: Enabled
   - Google: Enabled
2. Authentication > Settings > Authorized domains
   - `junl-im.github.io`
   - 로컬 개발 시 `localhost`
3. Firestore Database
   - Production mode
   - 저장소의 `firestore.rules`와 `firestore.indexes.json` 배포
4. Analytics
   - 선택 사항이며 지원되는 프로덕션 브라우저에서만 지연 초기화
5. App Check
   - **사용하지 않음**
   - reCAPTCHA 키를 만들거나 입력하지 않음
   - GitHub Secret `VITE_FIREBASE_APPCHECK_SITE_KEY`를 만들지 않음
   - Firestore와 Authentication enforcement를 켜지 않음

이미 GitHub에 `VITE_FIREBASE_APPCHECK_SITE_KEY` Secret을 만들었다면 삭제해도 된다. 이미 Firebase Console에 App Check 앱을 등록했더라도 enforcement가 꺼져 있으면 Auth와 Firestore 사용에는 영향이 없다.

## 규칙·색인 배포

```bash
npx firebase-tools login
npm run firebase:check
npm run firebase:deploy:rules
```

직접 명령:

```bash
npx firebase-tools deploy --only firestore --project lumerift-8db07
```

## 로컬 Emulator

```bash
# .env.local
VITE_FIREBASE_USE_EMULATORS=true

npm run firebase:emulators
npm run dev
```

## 보안 경계

App Check가 비활성화되어 있으므로 현재 보호 경계는 다음과 같다.

- Firebase Authentication 사용자 UID
- `firestore.rules`의 사용자 소유권 검사
- 기본 거부 규칙
- 클라이언트 쿠폰 경로 차단
- 공지 읽기 캐시와 Cloud Save 쓰기 최소화

쿠폰·고가치 우편·서버 출석처럼 조작 방지가 필요한 보상은 클라이언트만으로 최종 승인하지 않는다.

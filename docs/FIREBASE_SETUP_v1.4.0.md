# LUMERIFT Firebase 설정 가이드 v1.4.0

## 적용 프로젝트

- Firebase project ID: `lumerift-8db07`
- 공개 게임 주소: `https://junl-im.github.io/LUMERIFT/`
- SDK: npm `firebase@12.16.0` modular API
- Hosting: GitHub Pages 유지

Firebase Web Config는 비밀키가 아니며 런타임 연결 식별자다. 프로젝트 기본값은 `src/services/firebase/firebaseConfig.ts`에 포함되어 있다. 다른 프로젝트로 교체할 때만 `.env` 값으로 덮어쓴다.

## Firebase Console 필수 체크

1. Authentication > Sign-in method
   - Anonymous: Enabled
   - Email/Password: Enabled
   - Google: Enabled
2. Authentication > Settings > Authorized domains
   - `junl-im.github.io`
   - 로컬 개발 시 `localhost`
3. Firestore Database
   - Production mode로 생성
   - 규칙은 저장소의 `firestore.rules`를 배포
   - 색인은 `firestore.indexes.json`을 배포
4. Analytics
   - 선택 사항. 프로덕션 빌드와 지원 브라우저에서만 지연 초기화된다.
5. App Check
   - reCAPTCHA v3 또는 Enterprise로 Web 앱 등록
   - 사이트 키를 GitHub Actions 환경변수 또는 `.env`의 `VITE_FIREBASE_APPCHECK_SITE_KEY`에 설정
   - 처음에는 enforcement를 끄고 metrics를 관찰한 뒤 Firestore/Auth 순서로 적용

## 규칙·색인 배포

```bash
npx firebase-tools login
npm run firebase:deploy:rules
```

GitHub Pages 배포 자체는 기존 GitHub Actions를 계속 사용한다. Firebase Hosting은 필수가 아니다.

## 로컬 Emulator

```bash
# .env.local
VITE_FIREBASE_USE_EMULATORS=true

npm run firebase:emulators
npm run dev
```

Emulator UI는 `http://127.0.0.1:4000`이다.

## Firestore 권장 데이터

```text
users/{uid}                 플레이어 프로필과 Cloud Save
notices/{noticeId}          공개 공지, 관리자만 작성
users/{uid}/mail/{mailId}   서버/관리자가 생성한 우편
users/{uid}/attendance/...  서버 검증 출석 기록
rankings/{uid}              공개 랭킹 요약
coupons/...                 클라이언트 접근 금지
```

## 공지 문서 예시

```json
{
  "title": "안개숲 업데이트",
  "summary": "Chapter 1 밸런스가 조정되었습니다.",
  "body": "상세 공지 내용",
  "published": true,
  "important": true,
  "publishedAt": "Firestore Timestamp",
  "startsAt": "Firestore Timestamp (선택)",
  "endsAt": "Firestore Timestamp (선택)"
}
```

게임은 원격 공지를 15분간 로컬 캐시하며, 네트워크 실패 시 캐시 또는 내장 공지를 사용한다.

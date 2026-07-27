# LUMERIFT v1.4.2 패치 노트

## 목적

사용자 결정에 따라 Firebase App Check만 완전히 비활성화하고 Authentication과 Firestore 기능은 유지한다.

## 변경

- `FirebaseGateway`의 App Check 초기화 제거
- `firebaseConfig`의 App Check 사이트 키 읽기 제거
- `.env.example`의 App Check 키 제거
- GitHub Pages·Verify Workflow의 App Check Secret 주입 제거
- `validate:firebase`가 App Check 재도입을 오류로 처리하도록 변경
- Firebase Console enforcement 비활성화 규칙을 인수인계에 고정

## 유지 기능

- 익명·Google·이메일 로그인
- 익명 계정 연결
- Firestore Cloud Save
- IndexedDB 오프라인 캐시
- 원격 공지 캐시
- Analytics
- Firestore Rules·Indexes

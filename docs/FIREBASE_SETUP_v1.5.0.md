# Firebase 설정 v1.5.0

프로젝트: `lumerift-8db07`
공개 URL: `https://junl-im.github.io/LUMERIFT/`
App Check: 비활성화 유지

## 배포

```bat
cd /d D:\K-city-webgame\LUMERIFT
npm run firebase:check
npm run firebase:deploy:rules
```

위 명령은 `firestore.rules`와 `firestore.indexes.json`을 함께 배포한다.

## v1.5.0 신규 색인

- 전체 랭킹 stage/score 정렬
- 주간 랭킹 weekKey/stage/score 정렬
- 내 순위 집계용 주간 복합 색인

색인 생성은 배포 직후 몇 분이 걸릴 수 있다. 그동안 랭킹 화면에 색인 준비 오류가 표시될 수 있다.

## 로컬 권한 테스트

```bat
npm run firebase:test:rules
```

Local Emulator Suite에서 아래를 검사한다.

- 본인 프로필 생성/읽기 허용
- 다른 UID 프로필 읽기 거부
- 다른 UID 랭킹 쓰기 거부
- 본인 전체/주간 랭킹 쓰기 허용
- 쿠폰 클라이언트 읽기 거부
- 랭킹 공개 읽기 허용

## Console 확인

Authentication 승인 도메인에 `junl-im.github.io`와 `localhost`를 유지한다. App Check enforcement는 켜지 않는다.

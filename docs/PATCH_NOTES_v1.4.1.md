# LUMERIFT v1.4.1 패치 노트

## 목적

Firebase Rules와 Indexes 배포 시 `npm error Missing script: firebase:deploy:rules`가 발생하는 로컬 구성 누락을 복구한다.

## 수정

- `firebase:deploy:rules` 스크립트 복구
- `firebase:deploy:firestore` 별칭 추가
- `firebase:check` 프로젝트 접근 확인 명령 추가
- Firebase CLI 공식 부분 배포 방식인 `--only firestore` 사용
- Rules와 Indexes를 한 번에 배포

## 직접 실행 명령

```bash
npx firebase-tools deploy --only firestore --project lumerift-8db07
```

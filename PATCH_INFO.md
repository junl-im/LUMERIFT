# LUMERIFT v1.10.1 PATCH

- 기준 버전: v1.10.0
- 대상 버전: v1.10.1
- 적용 방식: 프로젝트 최상위에 덮어쓰기
- 직접 삭제 파일: 없음
- 자동 정리: preverify가 이동 전 public 자산과 `.gitkeep`을 안전하게 제거

패치 적용 후 다음을 실행한다.

```bash
npm install
npm run verify
```

`verify` 시작 시 릴리스 버전 정합성을 먼저 검사하고, 실제 단말에서는 설정 화면에서 1분 이상 플레이 후 `기기 QA JSON 저장`을 실행한다.

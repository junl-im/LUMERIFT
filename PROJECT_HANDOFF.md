# LUMERIFT 프로젝트 인수인계 시작점

새 작업자는 다음 순서로 읽는다.

1. `AGENTS.md`
2. `docs/MASTER_BIBLE.md`
3. `docs/HANDOFF_MASTER.md`
4. `HANDOFF_STATE.json`
5. `docs/HANDOFF_LOG.md` 마지막 항목

현재 기준 버전은 **v0.9.1**이다. v0.8.0 구조 검증 에셋 위에 약 470.67MiB 규모의 원본·런타임 품질 자산 체계를 추가했다.

중요: v0.9.0 시각 자산 단계는 `production-candidate-procedural`이다. 최종 상용 원화 또는 최종 AAA 자산으로 표현하지 않는다.

모든 작업 종료 전에는 인수인계 파일과 릴리스 문서를 갱신하고 다음을 실행한다.

```bash
npm run validate:handoff
npm run validate:art
npm run verify
```


## v0.9.1 빌드 인수인계

- `vite.config.ts`의 `manualChunks`는 반드시 함수 형식으로 유지한다.
- 객체 형식 `{ pixi: [...], firebase: [...] }`은 Vite 8 타입 검사에서 TS2769를 발생시킨다.
- GitHub Actions는 Node.js 24와 checkout/setup-node v5, configure-pages v6, upload-pages-artifact v4를 기준으로 한다.
- 작업 시작 후 가장 먼저 `npm run validate:config`와 `npm run typecheck`를 실행한다.

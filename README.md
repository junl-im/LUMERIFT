# LUMERIFT: 균열의 계승자 v1.10.0

모바일 웹 우선 세로형 2.5D 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이며 GitHub Pages에 배포한다.

공개 주소: https://junl-im.github.io/LUMERIFT/

## v1.10.0 실기기 UI QA·세부 화면 2차 개선

- `visualViewport` 높이·너비·오프셋·배율을 동기화해 iOS Safari와 Android Chrome 주소창 변화에 대응
- Safe Area, 가상 키보드, 화면 회전, 페이지 복귀 시 레이아웃 재계산 보강
- 저메모리·저코어 기기의 캔버스 해상도 상한을 1.5배로 제한
- 공통 버튼·메뉴·스테이지 노드·운영 탭에 최소 48×48 논리 픽셀 터치 판정 적용
- 스테이지·퀘스트·결과·운영 화면의 전용 상태 아이콘과 저강도 마이크로 인터랙션 추가
- 쿠폰 입력을 브라우저 기본 팝업에서 Safe Area·모바일 키보드 대응 전용 오버레이로 교체
- Firebase App Check 비활성화와 v1.8 AttackFootprint 전투 판정 계약 유지

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run validate:mobile:v110
npm run validate:ui
npm run validate:assets
npm run validate:handoff
npm run verify
```

## Firebase 규칙 배포

v1.10.0은 Firestore 규칙을 변경하지 않는다. 재배포가 필요할 때만 다음을 사용한다.

```bash
npm run firebase:check
npm run firebase:deploy:rules
```

## 패치 적용

v1.9.0 프로젝트 최상위에 패치 ZIP의 내용을 덮어쓴다. 삭제 또는 자산 이동 대상은 없다.

```bash
npm install
npm run verify
```

## 핵심 문서

- `AGENTS.md`
- `HANDOFF_STATE.json`
- `docs/HANDOFF_MASTER.md`
- `docs/MOBILE_QA_v1.10.0.md`
- `docs/UI_SYSTEM_v1.10.0.md`
- `docs/VISUAL_AUDIT_v1.10.0.md`
- `docs/PATCH_NOTES_v1.10.0.md`

`docs/previews/v1.10.0_mobile_qa_contact.webp`는 디자인 QA 시뮬레이션이며 물리 기기 런타임 캡처가 아니다. Android Chrome·iOS Safari 실제 단말 FPS·발열·GPU 메모리 계측은 v1.10.1에서 수행한다.

BAT 파일은 Windows 편의용 선택 도구이며 npm 명령과 GitHub Actions가 공식 기준이다.

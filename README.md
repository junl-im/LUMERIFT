# LUMERIFT: 균열의 계승자 v1.11.0

모바일 웹 우선 세로형 2.5D 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이며 GitHub Pages에 배포한다.

공개 주소: https://junl-im.github.io/LUMERIFT/

## v1.11.0 전투·그래픽 시스템 강화

- 적중·치명타·처치·정밀 회피로 상승하는 Rift Drive 0~100 게이지
- D·C·B·A·S·SS 전투 등급과 체인 배율, 7초 Overdrive 상태
- 공격 적중 후 스킬·회피 캔슬과 정밀 회피 쿨다운 가속
- 스킬별 Drive 비용·획득량·impact tier·콤보 입력 창 데이터화
- 그래픽 품질과 실시간 프레임 압력에 따른 전투 이펙트·곡선·레이어 자동 예산화
- 스킬 충전 링, 강화 준비 펄스, Drive·스타일 HUD와 다층 타격광
- 공통 패널 하이라이트·그림자·코너 악센트와 진행 바 눈금
- 로비·설정에서 FPS·적응형 품질·전투 렌더 예산 상태 확인
- 신규 런타임 이미지 없이 기존 Atlas와 프로그램 렌더링으로 초기 다운로드 유지

## 유지된 핵심 계약

- Firebase App Check 비활성화
- Firebase Auth·Firestore Cloud Save·랭킹·Player Save v4 유지
- AttackFootprint를 텔레그래프와 실제 판정의 단일 기준으로 유지
- PNG/WebP만 허용하고 SVG 금지
- 모바일 9:16·Safe Area·48px 터치·접근성 상태 기호 유지

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run validate:release
npm run validate:upgrade:v111
npm run validate:handoff
npm run verify
```

## 패치 적용

v1.10.1 프로젝트 최상위에 패치 ZIP의 내용을 덮어쓴다.

```bash
npm install
npm run verify
```

## 핵심 문서

- `AGENTS.md`
- `HANDOFF_STATE.json`
- `docs/HANDOFF_MASTER.md`
- `docs/COMBAT_GRAPHICS_UPGRADE_v1.11.0.md`
- `docs/MOBILE_DEVICE_QA_v1.10.1.md`
- `docs/ACCESSIBILITY_v1.10.1.md`
- `docs/RECOVERY_ARCHIVE_v1.10.1.md`

실제 Android·iOS의 FPS·표면 온도·배터리·GPU 메모리 최종 승인은 물리 단말 계측이 필요하다. BAT 파일은 Windows 편의용이며 npm 명령과 GitHub Actions가 공식 기준이다.

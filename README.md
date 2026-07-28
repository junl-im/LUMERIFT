# LUMERIFT: 균열의 계승자 v1.11.1

모바일 웹 우선 세로형 2.5D 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이며 GitHub Pages에 배포한다.

공개 주소: https://junl-im.github.io/LUMERIFT/

## v1.11.1 실기기 전투 보정 기반·전용 모션 1차

- entry·balanced·performance 기기 보정 등급과 독립 FPS·1% Low·긴 프레임 기준
- 기존 8방향 런타임 Atlas에 공격 선행 동작·스킬 궤적·회피 잔상·Drive 오라 연결
- 보스 장판 예고·위험·회피 3단계와 패턴명·기호·타이밍 눈금
- impact tier별 프로그램 광선·원호·폭발 링과 적응형 렌더 예산 연동
- 전투 버튼 단일 포인터 소유권·pointercancel·중복 탭 억제
- Device QA JSON에 기기 보정 등급과 CombatRenderBudget 편향값 기록
- LUMERIFT 소유 8방향 걷기·공격·피격·회피 제작용 블록아웃 마스터 추가
- 신규 런타임 이미지 없이 현재 초기 다운로드 예산 유지

## 유지된 핵심 계약

- Firebase App Check 비활성화
- Firebase Auth·Firestore Cloud Save·랭킹·Player Save v4 유지
- AttackFootprint를 텔레그래프와 실제 판정의 단일 기준으로 유지
- PNG/WebP만 허용하고 SVG 금지
- 모바일 9:16·Safe Area·48px 터치·접근성 상태 기호 유지

## 실행 및 검증

```bash
npm install
npm run verify
```

## 패치 적용

v1.11.0 프로젝트 최상위에 패치 ZIP의 내용을 덮어쓴다.

## 핵심 문서

- `AGENTS.md`
- `HANDOFF_STATE.json`
- `docs/HANDOFF_MASTER.md`
- `docs/COMBAT_MOTION_QA_v1.11.1.md`
- `docs/COMBAT_GRAPHICS_UPGRADE_v1.11.0.md`
- `docs/MOBILE_DEVICE_QA_v1.10.1.md`

기기 보정값은 브라우저 하드웨어 힌트와 프레임 로그 기반이다. 실제 Android·iOS의 표면 온도·배터리·GPU 메모리 최종 승인은 물리 단말 계측이 필요하다.

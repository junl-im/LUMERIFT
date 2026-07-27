# LUMERIFT: 균열의 계승자 v1.0.0

Vite + TypeScript + PixiJS 8 + Firebase 기반 세로형 모바일 웹 액션 RPG입니다.

## v1.0.0 실제 게임용 비주얼 리빌드

이번 버전은 수량 중심 절차형 자산을 기본 화면에서 제외하고, 명시적 재배포 라이선스가 있는 실제 게임용 원본을 로비와 전투의 기본 런타임에 연결했습니다.

- 실제 판타지 배경과 영웅 초상을 적용한 로비
- 실제 Isometric Knight 플레이어 전투 Atlas
- 오크·거미·웨어베어·트롤 기반 종별 몬스터 8종
- 각 몬스터의 Idle·Move·Attack·Hit·Die·Roar 계약
- 실제 보스 초상과 보스 HUD
- 금속·유리 질감 NineSlice UI 18종
- 제3자 저작자·라이선스·가공 내역 보존
- 기존 v0.9 절차형 품질팩은 레거시 에셋 보관소로 분리

현재 품질 단계는 `production-candidate-open-art-pass`입니다. 실제 게임에 사용 가능한 공개 라이선스 원본을 연결했지만 LUMERIFT 전용 독점 원화나 최종 상용 원화가 아니다. 최종 세계관 통일, 전용 8방향 플레이어 모션, 실기기 아트 QA를 거쳐야 `final-candidate` 이상으로 승격합니다.

## 미리보기

- `docs/previews/v1.0.0_lobby_preview.webp`
- `docs/previews/v1.0.0_battle_preview.webp`

## 현재 플레이 흐름

```text
Boot → Login → Live-art Lobby
→ Inventory / Quest / Stage Select / Art Gallery
→ Stage 1-1 ~ 1-10 → Live sprite Combat
→ Boss Phase 1·2·3 → Reward → Growth
```

## 에셋과 라이선스

- 런타임 기본 자산: `public/assets/live/v1`
- 공개 원본 보관: `art_source/open_art/v1.0.0`
- 라이선스 문서: `docs/THIRD_PARTY_ASSETS.md`
- 기계 판독 라이선스: `public/assets/live/v1/licenses/ASSET_LICENSES.json`
- `art_source`는 GitHub Pages 배포 결과물에 포함하지 않습니다.

## 작업자 인수인계

프로젝트를 이어받는 사람이나 AI는 다음 순서로 확인합니다.

1. `AGENTS.md`
2. `docs/HANDOFF_MASTER.md`
3. `HANDOFF_STATE.json`
4. `docs/HANDOFF_LOG.md`
5. `docs/MASTER_BIBLE.md`

모든 릴리스에서 위 인수인계 파일을 갱신해야 하며 `npm run validate:handoff`가 이를 검사합니다.

## 실행

Windows에서는 `INSTALL_AND_START.bat`를 실행합니다.

```bash
npm install
copy .env.example .env.local
npm run verify
npm run dev
```

Firebase가 없어도 로컬 게스트 모드로 실행됩니다.

## 조작

| 기능 | 키보드 | 모바일 |
|---|---|---|
| 이동 | WASD / 방향키 | 좌측 가상 조이스틱 |
| 기본 공격 | J / Z / Enter | 공격 버튼 |
| 스킬 1 | K / X | 크래시 버튼 |
| 스킬 2 | L / C | 노바 버튼 |
| 회피 | Space / Shift | 회피 버튼 |
| 일시정지 | P / Esc | 우측 상단 버튼 |

## 검증

```bash
npm run validate:config
npm run validate:liveart
npm run validate:handoff
npm run report:inventory
npm run verify
```

SVG 금지, 데이터 상호 참조, Atlas, 실사용 라이선스, 기본 런타임 연결, 인수인계 상태, 상대 import, TypeScript, 테스트, Vite 빌드와 15MB 초기 예산을 검사합니다.

## 에셋 재생성

```bash
python tools/build_live_art_v100.py
python tools/render_v100_previews.py
```

기존 절차형 생성기는 레거시 보관소 유지·회귀 테스트 목적으로만 사용합니다.

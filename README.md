# LUMERIFT: 균열의 계승자 v0.8.0

Vite + TypeScript + PixiJS 8 + Firebase 기반 세로형 모바일 웹 액션 RPG입니다.

## v0.8.0 핵심 결과

- 총 16개 Atlas, 1,174 프레임, 127 애니메이션
- 아이템 160종, 스킬 80종, 상태 효과 48종
- UI 아이콘 96종, 몬스터 도감 48종, NPC 초상 32종
- 환경 오브젝트 120종, VFX 24세트, 배지 64종
- 튜토리얼 글리프 40종
- 5개 지역, 총 15개 전투 배경
- 로딩 키아트 8종과 브랜드 자산 3종
- UI 12종, 전투 16종, 환경 8종의 신규 오디오
- 런타임 에셋 보관소 갤러리
- 영구 인수인계 문서와 자동 검증 체계

## 현재 플레이 흐름

```text
Boot → Login → Animated Lobby
→ Asset Gallery / Inventory / Quest / Stage Select
→ Stage 1-1 ~ 1-10 → Mobile Combat HUD
→ Boss Phase 1·2·3 → Reward → Growth
```

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
npm run validate:handoff
npm run report:inventory
npm run verify
```

SVG 금지, 데이터 상호 참조, Atlas, 인수인계 상태, 상대 import, TypeScript, 테스트, Vite 빌드와 15MB 예산을 검사합니다.

## 에셋 생성

```bash
python tools/generate_runtime_assets.py
python tools/generate_asset_megapack_v080.py
```

현재 자동 생성 캐릭터·몬스터·아이콘·배경은 최종 상용 원화가 아니라 `production-structure` 단계의 제작 규격·런타임 검증 자산입니다.

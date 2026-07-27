# LUMERIFT: 균열의 계승자 v0.9.1

Vite + TypeScript + PixiJS 8 + Firebase 기반 세로형 모바일 웹 액션 RPG입니다.


## v0.9.1 빌드 복구 핫픽스

- Vite 8에서 허용되지 않는 `manualChunks` 객체 별칭 형식을 함수 형식으로 교체
- PixiJS와 Firebase 청크 분리 유지
- GitHub Actions를 Node.js 24 기준으로 갱신
- `validate:config`와 조기 `typecheck`로 동일 오류를 전체 검증 초반에 차단

## v0.9.0 핵심 결과

- v0.8 구조 검증팩을 유지하면서 신규 품질팩 추가
- 신규 Atlas 26개, 프레임 1,300개, VFX 애니메이션 32개
- 누적 Atlas 프레임 2,474개, 애니메이션 159개
- 영웅 초상 8종, 보스 초상 12종, NPC 초상 16종
- 장비·아이템 아이콘 384종, 스킬 아이콘 160종
- 환경 오브젝트 240종, 프리미엄 UI 프레임 96종
- VFX 32세트·384프레임
- 5개 지역 키아트 10종, 전투 배경 15종
- 런타임 WebP 품질 자산 약 12.31MiB
- 보관용 고해상도 PNG 원본 약 458.36MiB
- 분류별 Lazy Loading 에셋 품질 보관소
- 품질 단계와 과장 보고 방지 자동 검사

v0.9.0 자산은 `production-candidate-procedural` 단계입니다. 기존보다 해상도·디테일·규모가 크게 향상됐지만 **최종 상용 원화가 아니다**. 외부 아트 디렉션, 수작업 리터칭, 저작권 확인, 모바일 실기기 검수를 거쳐야 `final-candidate` 이상으로 승격할 수 있습니다.

## 현재 플레이 흐름

```text
Boot → Login → Animated Lobby
→ Quality Asset Gallery / Inventory / Quest / Stage Select
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
npm run validate:art
npm run report:inventory
npm run verify
```

SVG 금지, 데이터 상호 참조, Atlas, 품질 단계, 원본·런타임 용량, 인수인계 상태, 상대 import, TypeScript, 테스트, Vite 빌드와 15MB 초기 예산을 검사합니다.

## 에셋 재생성

```bash
python tools/generate_runtime_assets.py
python tools/generate_asset_megapack_v080.py
python tools/generate_asset_qualitypack_v090.py
```

- `public/assets`: 게임 런타임 배포 자산
- `art_source/v0.9.0`: 보관·후속 리터칭용 고해상도 PNG 원본
- `art_source`는 GitHub Pages 배포 결과물에 포함하지 않습니다.

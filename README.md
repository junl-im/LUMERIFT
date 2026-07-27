# LUMERIFT: 균열의 계승자 v1.0.3

Vite + TypeScript + PixiJS 8 + Firebase 기반 세로형 모바일 웹 액션 RPG입니다.

## v1.0.3 전체 자산 보존 복구

v1.0.2는 실행용 경량 배포본에 가까웠으며, 이를 전체 통합 ZIP으로 제공한 것은 잘못이었습니다. v1.0.3은 v1.0.0의 모든 고해상도 원본과 레거시 보관 자산을 복원하면서 v1.0.2의 TypeScript 빌드 수정은 그대로 유지합니다.

전체 통합본 포함 범위:

- 현재 소스 코드·문서·설정·검증 도구
- 실제 로비·전투 런타임 아트와 음원
- `art_source` 고해상도 원본과 공개 원본
- v0.8·v0.9 대규모 절차형 제작 후보 및 레거시 Atlas
- 라이선스·NOTICE·인수인계 기록

중요한 구분:

- **전체 통합 ZIP:** 개발·인수인계·재가공에 필요한 모든 파일 포함
- **초기 다운로드 15MB 목표:** 사용자가 게임을 처음 열 때 로드되는 핵심 번들 기준
- 원본과 레거시 자산은 GitHub Pages 초기 로딩에 포함되지 않으며 기본 AssetCatalog에서도 사용하지 않음

사용자 보고 용량은 십진 단위 **MB**로 통일합니다.

## 현재 품질 단계

`production-candidate-open-art-pass`

실제 게임용 공개 라이선스 원본을 기본 화면에 적용한 단계이며, LUMERIFT 전용 독점 원화나 최종 상용 원화는 아닙니다.

## 에셋과 라이선스

- 런타임 자산: `public/assets`
- 라이선스 문서: `docs/THIRD_PARTY_ASSETS.md`
- 기계 판독 라이선스: `public/assets/live/v1/licenses/ASSET_LICENSES.json`
- 고해상도 원본은 전체 통합 ZIP의 `art_source`에 포함되며 GitHub Pages 배포 대상에서는 제외됩니다.

## 작업자 인수인계

1. `AGENTS.md`
2. `docs/HANDOFF_MASTER.md`
3. `HANDOFF_STATE.json`
4. `docs/HANDOFF_LOG.md`
5. `docs/MASTER_BIBLE.md`

## 실행

```bash
npm install
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
npm run validate:art
npm run validate:liveart
npm run validate:handoff
npm run report:inventory
npm run verify
```

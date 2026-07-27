# LUMERIFT v1.0.0 제3자 에셋 및 라이선스

> v1.0.1 기본 통합 ZIP에는 고해상도 원본 파일을 포함하지 않습니다. 아래 기록과 런타임 파생 자산·라이선스 고지는 유지됩니다. 원본 재가공 시 기재된 원출처에서 다시 확보합니다.

이 문서는 v1.0.0의 기본 로비·전투 화면에 실제 적용된 외부 공개 에셋의 출처, 라이선스, 가공 범위를 기록한다. 원본과 가공본을 제거하거나 배포할 때도 이 문서를 함께 유지한다.

## 품질 단계

- 현재 단계: `production-candidate-open-art-pass`
- 의미: 명시적인 재배포 라이선스가 있는 실제 게임용 원본을 선별하고, 모바일 화면·Atlas·알파 경계·색상·용량에 맞게 가공하여 기본 런타임에 연결한 상용 후보 전 단계
- 제한: LUMERIFT 전용으로 새로 그린 독점 원화나 최종 아트 디렉터 승인 자산은 아니다. `final-candidate` 또는 `final-approved`로 보고하지 않는다.

## 적용 자산

| 자산 그룹 | 제작자·기여자 | 라이선스 | LUMERIFT 사용 위치 | 원본 보관 경로 |
|---|---|---|---|---|
| Fantasy RPG Background | AliHamieh | CC0 1.0 | 로비·챕터 1 전투 배경 | `art_source/open_art/v1.0.0/backgrounds/` |
| Character Portrait | zonked | CC0 1.0 | 로비 영웅 초상 | `art_source/open_art/v1.0.0/portraits/hero_portrait.png` |
| Isometric Knight NPC | VWolfdog, Clint Bellanger Base Human Mesh 기반 | CC BY 3.0 | 플레이어 전투 스프라이트 | `art_source/open_art/v1.0.0/characters/` |
| Orc FLARE sprite sheets | johndh, Clint Bellanger | CC BY-SA 3.0 | 일반·정예 몬스터 | `art_source/open_art/v1.0.0/monsters/orc_*.png` |
| Werebear FLARE sprite sheet | johndh, Clint Bellanger | CC BY-SA 3.0 | 정예 몬스터 | `art_source/open_art/v1.0.0/monsters/werebear_*.png` |
| Spider FLARE sprite sheets | Wciow, John.d.h 및 FLARE 기여자 | CC BY-SA 3.0 | 일반 몬스터 | `art_source/open_art/v1.0.0/monsters/spider*.png` |
| FLARE Model - Troll | VWolfdog, Clint Bellanger Base Human Mesh 기반 | CC BY 3.0 | 챕터 1 보스 | `art_source/open_art/v1.0.0/monsters/troll.png` |
| QuestQuest illustrations | Justin Nichol | CC BY 4.0 | 보스·도감 초상 후보 | `art_source/open_art/v1.0.0/portraits/` |

상세 기계 판독 기록은 `public/assets/live/v1/licenses/ASSET_LICENSES.json`에 있다.

## 가공 내역

- 원본 스프라이트시트를 모바일 GPU 텍스처 크기에 맞춰 재패킹
- 프레임 이름을 기존 런타임 계약에 맞게 매핑
- 배경 크롭·명암·색상 그레이딩 및 9:16 화면 대응
- 초상 알파 경계와 인게임 축소 가독성 보정
- UI용 PNG/WebP NineSlice 스킨 제작
- 런타임 WebP 변환과 분류별 Lazy Loading 적용

## 공유 라이선스 주의

CC BY-SA 3.0 원본에서 파생된 몬스터 Atlas는 동일 라이선스 조건과 저작자 표시를 유지해야 한다. 배포물에서 `NOTICE.txt`, `ASSET_LICENSES.json`, 이 문서를 삭제하지 않는다.

## 교체 정책

향후 LUMERIFT 전용 원화로 교체할 때에도 `player.{state}.{direction}`, `monster.{monsterId}.{state}`, UI NineSlice 프레임 키를 유지한다. 교체된 제3자 자산이 더 이상 배포되지 않을 때만 해당 저작자 표시를 제거할 수 있다.

## 원본 페이지

- Fantasy RPG Background: https://opengameart.org/content/fantasy-rpg-background
- Character Portrait: https://opengameart.org/content/character-portrait
- Isometric Knight NPC: https://lpc.opengameart.org/content/isometric-knight-npc
- Orc FLARE sprite sheets: https://opengameart.org/content/orc-flare-sprite-sheets
- Werebear FLARE sprite sheets: https://opengameart.org/content/werebear-flare-sprite-sheets
- Spider FLARE sprite sheets: https://opengameart.org/content/spider-flare-sprite-sheets
- FLARE Model - Troll: https://opengameart.org/content/flare-model-troll
- QuestQuest: https://github.com/JustinNichol/questquest

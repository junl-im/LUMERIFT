# Appearance Preset Vault v1.11.22

## 기능

- 최근 외형 프리셋 최대 5개
- 프리셋 이름 변경, 즐겨찾기, 최근 목록 삭제
- 즐겨찾기 프리셋 상단 유지
- 3개 외형 슬롯과 최근 프리셋 통합 JSON 내보내기·가져오기
- v1.11.21 프리셋의 `id`, `name`, `favorite` 자동 보완
- 무기·갑주·망토·룬 집중 보기와 FIT 100%, CLOSE 120%, DETAIL 142% 확대

## 저장 경계

외형 프리셋은 `lumerift.characterWardrobe.v1` 로컬 저장소만 사용한다. Player Save v4, 장비 UID, 능력치, 보상, 랭킹, Cloud Save 스키마를 변경하지 않는다.

내보내기 JSON 계약:

- `schemaVersion: 1`
- `game: LUMERIFT`
- `kind: character-appearance-presets`
- `slots`: 1~3번 외형 슬롯
- `presets`: 최근 외형 목록

잘못된 스키마의 JSON은 가져오지 않으며 기존 외형 데이터는 유지한다.

# Equipment Visual Sync v1.11.18

## 개요
장착한 무기·방어구·장신구의 등급을 전투 캐릭터 재질과 UI 미리보기에 반영한다.

## 등급 언어
- Common: Steel — 회청색 금속과 옅은 청록 룬
- Rare: Rift Blue — 청록·시안 계열 균열광
- Heroic: Heir Gold — 보라색 에너지와 금색 계승자 룬

## 런타임 모듈
- `CharacterEquipmentVisualProfile.ts`
- `CharacterStateMaterialProfile.ts`
- `player_character_fx_v9.*`
- `equipment_material_v9.*`

## 화면 연결
- 전투: 갑주 광원·룬·무기 궤적 색상
- 로비: 장착 무기·방어구·장신구 3종 미리보기
- 인벤토리: 선택 장비의 슬롯·등급 재질 배경

## 저장 계약
외형은 현재 장착 장비를 매번 계산해 표시한다. Player Save v4에 새로운 필드를 추가하지 않는다.

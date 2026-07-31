# Character Wardrobe v1.11.20

## 목적

캐릭터 본체, 장착 장비, 염색, 무기 실루엣과 전투 포즈를 하나의 화면에서 확인하고 로컬 외형 슬롯에 저장한다.

## 런타임 화면

- `src/scenes/CharacterWardrobeScene.ts`
- 로비 메뉴 `캐릭터` 및 하단 `영웅`에서 진입
- 프리미엄 v10 본체 Atlas의 대기·이동·3연격·스킬·회피 프레임을 실제 AnimatedSprite로 재생
- 장착 장비 세트 조화, 재질 등급, 무기 실루엣과 모션 프로필 표시

## 외형 슬롯

- 저장소 키: `lumerift.characterWardrobe.v1`
- SLOT 1~3
- 저장 항목: 염색 프리셋, 미리보기 포즈, 저장 시각
- Player Save v4와 분리된 로컬 표시 설정
- 장비·레벨·보상·전투 진행 데이터는 저장하거나 변경하지 않음

## 고정 계약

- Firebase App Check 비활성
- Player Save v4 유지
- v10 본체 Atlas 및 v4 fallback 보존
- 실제 전투 판정과 `AttackFootprint` 변경 없음

# LUMERIFT v1.11.31 Patch Notes

## Premium HUD Art v15
- 승인된 캐릭터·몬스터 비주얼 기준에서 파생한 512×256 WebP Atlas를 추가했다.
- 128×128 셀 8개를 전투 버튼, 보스 코어 HUD, 인벤토리 장식에 적용했다.
- 본 Atlas는 UI 전용이며 플레이어·몬스터 본체 스프라이트 교체로 간주하지 않는다.

## Boss Core Lifecycle
- 보호, 균열, 파괴, 재생, 폭주 상태를 보스 체력과 페이즈 전환에 연결했다.
- 보스 본체와 HUD가 동일한 `lumerift-boss-core-lifecycle-v1` 계약을 사용한다.
- 전투 판정과 `AttackFootprint`는 변경하지 않는다.

## Capture Evidence v2
- Android Chrome·iOS Safari 승인 JSON과 실제 캡처 이미지 파일을 함께 선택한다.
- 파일명, SHA-256, 바이트, 픽셀 크기가 모두 일치할 때만 승인 자료를 적용한다.
- 실제 검증 자료가 없으므로 이번 릴리스의 물리 기기 승인 상태는 계속 대기다.

## 미완료
- 최종 수작업 플레이어·몬스터 파츠 Atlas는 아직 제작 인수인계 단계다.
- 정상 npm 저장소를 사용하는 Vitest·Vite production build는 수행하지 못했다.

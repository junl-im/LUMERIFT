# PROJECT HANDOFF v1.11.32

**현재 버전:** v1.11.32  
**기준:** 모바일 웹 9:16 · Premium Art Direction v2 · App Check 비활성

## 완료
- 플레이어 얼굴·헤어·갑주·망토·룬·검·대검·장창 투명 WebP 파츠 16프레임 합성
- Void·Frost·Inferno 엘리트와 Abyssal 보스 투명 WebP 파츠 16프레임 합성
- 보스 코어 5상태 12프레임 FX Atlas 적용
- 스킬·등급·보스 패턴·장비 Premium UI Icons 16프레임 적용
- 전투·캐릭터 스튜디오·인벤토리 v16 우선 로딩과 기존 v15·프로그램형 레이어 폴백

## 미완료
- 8방향 전체 전신·공격 수작업 플레이어·몬스터 Atlas
- Android Chrome·iOS Safari 검증된 물리 기기 승인 패키지
- 실제 npm 의존성 기반 Vitest·Vite production build

## 고정 규칙
- v16 파츠는 기존 본체 위 합성용 첫 래스터 배치이며 최종 전신 Atlas로 표현하지 않는다.
- 보스 코어 FX와 UI 아이콘은 표현 계층이며 `AttackFootprint`, 피해량, 저장 스키마를 변경하지 않는다.
- v16 로딩 실패 시 기존 v10/v11/v4 본체, Premium HUD v15, 프로그램 레이어로 폴백한다.
- Player Save v4와 Firebase App Check 비활성 상태를 유지한다.

## 배포
- 전체본: `LUMERIFT_FULL_v1.11.32.zip`
- 패치: `LUMERIFT_PATCH_v1.11.31_to_v1.11.32_ROOT_OVERWRITE.zip`

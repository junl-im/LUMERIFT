# LUMERIFT v0.6.0 패치 노트

## 핵심 목표

전투 프로토타입의 도형 표현을 실제 PNG/WebP 기반 런타임 에셋 파이프라인으로 전환하고, 씬 단위 로딩·해제와 오디오 캐시를 적용한다.

## 적용 내용

- 플레이어 WebP Sprite Atlas 1종
- 플레이어 8방향 애니메이션
- Idle, Run, Attack 1~3, Skill 1~2, Hit, Death, Dodge 상태 연결
- 일반·정예·보스 공통 몬스터 WebP Atlas
- 몬스터 Idle, Move, Attack, Hit, Die, Roar 상태 연결
- Chapter 1 WebP 전투 배경
- UI WebP Atlas와 PixiJS NineSliceSprite 패널·버튼
- OGG UI·공격·피격 효과음
- Opus 전투 배경 음악
- 브라우저 오디오 잠금 해제와 캐시·중지·해제 처리
- AssetManager 번들 참조 카운트
- BattleScene 종료 시 전투 Atlas·맵 Texture 자동 해제
- 전체 Atlas 프레임과 애니메이션 참조 자동 검사
- 초기 다운로드 15MB 예산 보고 스크립트
- ASSET_MANIFEST.json 추가

## 리소스 성격

v0.6.0에 포함된 캐릭터와 몬스터 이미지는 최종 상용 아트가 아니라 런타임 규격과 동작 검증을 위한 제작 기준 에셋이다. 파일 형식, 방향, 상태 이름, Atlas 구조와 해제 흐름은 이후 최종 아트에도 그대로 유지한다.

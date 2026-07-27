# LUMERIFT 통합 인수인계 문서

**현재 버전:** v1.0.0  
**갱신일:** 2026-07-27  
**상태:** 실제 게임용 공개 라이선스 아트의 기본 런타임 적용 완료

## 1. 프로젝트 목적

LUMERIFT는 모바일 브라우저에서 빠르고 아름답게 실행되는 세로형 2.5D 액션 RPG다. MMORPG 기능보다 전투 손맛, 빠른 로딩, 성장 루프, 안정적인 모바일 성능을 먼저 완성한다.

## 2. 현재 구현 범위

- Vite·TypeScript·PixiJS 8·Firebase 계층
- Boot·Login·Lobby·Stage Select·Battle·Result·Inventory·Quest·Asset Gallery
- 3연속 공격, 스킬 2종, 회피, 상태 이상, 보스 3페이즈
- 10개 스테이지, 메인·일일 퀘스트, 장비·강화·인벤토리, 저장 v3
- 모바일 조이스틱, 쿨다운 HUD, 씬 페이드, 60·30FPS 및 품질 자동 축소
- Texture Atlas, Lazy Loading, Object Pool, 리소스 해제
- Vite 8 함수형 manualChunks와 Node.js 24 CI 기준

## 3. v1.0.0 실제 게임용 아트 패스

기본 로비와 전투가 `public/assets/live/v1`을 사용한다.

- 실제 판타지 로비·전투 배경 2종
- 실제 영웅·보스 초상 2종
- 실제 플레이어 전투 Atlas 1개·68프레임·80애니메이션 키
- 실제 몬스터 Atlas 1개·268프레임·8종·66애니메이션 키
- 실사용 NineSlice UI Atlas 1개·18프레임
- 런타임 실사용 아트 약 4.06MiB
- 공개 원본 20개·약 21.11MiB
- 누적 전체 45 Atlas·2,828프레임·305애니메이션

## 4. 품질 단계

현재 단계는 `production-candidate-open-art-pass`다.

- 명시적 재배포 라이선스가 있는 실제 게임 원본을 사용한다.
- 로비·전투 기본 화면과 캐릭터·몬스터 렌더링에 실제 연결되어 있다.
- 기존 절차형 자산은 기본 화면에서 빠지고 레거시 보관소로만 남는다.
- LUMERIFT 전용 독점 원화나 최종 아트 디렉터 승인 단계는 아니다.
- 플레이어는 공개된 단일 연속 시트를 기존 8방향 논리 계약에 매핑하므로 전용 8방향 제작이 필요하다.
- 여러 공개 원본의 비율과 화풍을 완전히 통일하는 2차 아트 디렉션이 필요하다.

## 5. 라이선스

- `docs/THIRD_PARTY_ASSETS.md`
- `public/assets/live/v1/licenses/ASSET_LICENSES.json`
- `public/assets/live/v1/licenses/NOTICE.txt`

CC BY·CC BY-SA 자산의 제작자 표시를 제거하지 않는다. CC BY-SA 파생 Atlas는 동일 라이선스 조건을 유지한다.

## 6. 런타임 사용 원칙

- `art_source`는 보관용이며 배포하지 않는다.
- 라이브 자산은 `live/v1` 분류별 번들로 필요한 씬에서만 로드한다.
- 로비 종료·전투 종료 시 참조 카운트 기반으로 텍스처를 해제한다.
- 초기 부트 번들에는 대형 몬스터 Atlas를 포함하지 않는다.
- 최종 전용 원화로 교체할 때 기존 프레임 키 계약을 유지한다.

## 7. 다음 작업 우선순위

1. LUMERIFT 전용 플레이어 8방향 원화·모션
2. Chapter 1 몬스터·보스의 세계관 통일 리디자인
3. 인벤토리·스테이지 선택·결과 화면 실사용 UI 2차 리빌드
4. Android Chrome·iOS Safari 실기기 성능 검증
5. Firebase 인증·Cloud Save·공지·출석·우편·쿠폰·랭킹

## 8. 작업 시작 체크리스트

- `AGENTS.md`, `HANDOFF_STATE.json`, 최근 HANDOFF_LOG 확인
- 신규 외부 자산의 라이선스와 재배포 권한 확인
- 기본 런타임 화면에 실제 연결되는지 확인
- PNG/WebP·Atlas·15MB·Lazy Loading 규칙 확인
- 품질 단계와 보고 문구 일치 확인

## 9. 작업 종료 체크리스트

- 코드·에셋·라이선스·인수인계 자동 검증
- 미리보기 갱신
- 전체본과 패치본 대조
- 문서·로드맵·변경 기록 갱신
- SHA-256와 ZIP 무결성 확인
- 결과 보고 순서 준수

## 10. 알려진 제한

- 공개 라이선스 아트 패스이며 독점 IP 최종 원화가 아니다.
- 실제 npm 의존성 설치와 Vite production build는 Registry 사용 가능한 환경에서 최종 실행한다.
- 실기기 GPU 메모리·FPS 측정이 아직 필요하다.

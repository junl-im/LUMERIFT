# Roadmap

## 완료: Phase 1 기술 기반 v0.1

- [x] Vite + TypeScript + PixiJS 8 + Firebase
- [x] 모바일 9:16, Safe Area
- [x] Scene, Input, Asset, Audio, FPS, Pool
- [x] GitHub Actions와 Pages
- [x] SVG 금지와 15MB 검사

## 완료: Phase 2 전투 프로토타입 v0.2

- [x] 플레이어 상태기계
- [x] 3연속 공격, 스킬 2종, 회피
- [x] 몬스터 FSM
- [x] Camera Shake, Zoom, Hit Stop

## 완료: Phase 3 데이터·웨이브·보스 v0.3

- [x] JSON 전투 데이터와 런타임 검증
- [x] 정예·보스·상태 이상·그래픽 품질
- [x] PNG/WebP Atlas 샘플

## 완료: Phase 4 장비·성장 루프 v0.4

- [x] 장비 9종과 인벤토리
- [x] 장착·강화·잠금·판매
- [x] 전투력과 전투 능력치 반영
- [x] 저장 v1 → v2

## 완료: Phase 5 스테이지·퀘스트 v0.5

- [x] 스테이지 10개와 잠금·해금
- [x] 최초·반복 보상과 최고 기록
- [x] 일반 5종·정예 2종·보스 1종
- [x] 메인·일일 퀘스트와 튜토리얼
- [x] 저장 v2 → v3

## 완료: Phase 6 런타임 아트·오디오 기반 v0.6

- [x] 플레이어 8방향 Sprite Atlas
- [x] 몬스터 등급별 Sprite Atlas
- [x] WebP 맵과 NineSlice UI
- [x] OGG/Opus 오디오
- [x] 씬 번들 Lazy Loading과 자동 해제
- [x] Atlas·초기 용량 자동 검증

## 완료: Phase 7 전투 연출·모바일 UI v0.7

- [x] Dead Zone 가상 조이스틱
- [x] 원형 스킬·회피 쿨다운 HUD
- [x] 공격·스킬·피격·폭발·회피 VFX Atlas
- [x] VFX Object Pool
- [x] 보스 등장과 3단계 페이즈 연출
- [x] 장비 아이콘 Atlas와 인벤토리 연결
- [x] 로비 AnimatedSprite와 장착 무기 레이어
- [x] 씬 페이드와 로딩 진행률
- [x] 텍스처 GPU 준비 단계
- [x] 저사양 파티클·배경 자동 축소

## 완료: Phase 8 대규모 에셋·인수인계 기반 v0.8

- [x] 총 1,174 Atlas 프레임과 127 애니메이션
- [x] 아이템·스킬·상태·UI·도감·NPC 대규모 자산
- [x] 환경 오브젝트, 지역 배경, 로딩 키아트
- [x] VFX·문장·튜토리얼·오디오 메가팩
- [x] 런타임 에셋 보관소 갤러리
- [x] AGENTS와 인수인계 마스터·로그·상태 파일
- [x] 인수인계·에셋 인벤토리 자동 검증

## 완료: Phase 9 에셋 디자인·품질 확장 v0.9

- [x] 신규 품질 Atlas 26개·1,300프레임
- [x] 영웅·보스·NPC 고해상도 초상 후보
- [x] 아이템 384·스킬 160·환경 240·UI 96
- [x] VFX 32세트·384프레임
- [x] 지역 키아트 10종·전투 배경 15종
- [x] 런타임 WebP와 고해상도 PNG 원본 분리
- [x] 분류별 Lazy Loading 품질 보관소
- [x] 품질 단계·용량·진실성 자동 검증

## 다음: Phase 10 온라인 운영 기반 v0.10

- [ ] 게스트 계정과 Google 계정 연결 흐름
- [ ] Cloud Save 충돌 해결과 저장 재시도 큐
- [ ] 공지사항 화면과 운영 데이터 캐시
- [ ] 7일 출석과 서버 시간 검증
- [ ] 우편함과 보상 일괄 수령
- [ ] 쿠폰 검증 Cloud Function 계약
- [ ] 주간·전체 랭킹 Repository와 모의 서버
- [ ] Firestore Security Rules 강화
- [ ] 오프라인·재접속 오류 안내
- [ ] 저장 데이터 백업·복구 로그

## 환경 검증 잔여

- [ ] 실제 package-lock.json
- [ ] Vite production build
- [ ] Android Chrome
- [ ] iOS Safari
- [ ] Firebase Console 프로젝트 연결


## 긴급 완료: v0.9.1

- Vite 8 빌드 설정 TS2769 복구
- GitHub Actions Node.js 24 전환
- 빌드 설정 회귀 방지 검사 추가

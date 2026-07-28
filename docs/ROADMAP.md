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

## 완료: Phase 10 실제 게임용 비주얼 리빌드 v1.0

- [x] 실제 공개 라이선스 게임 원본을 기본 로비·전투에 연결
- [x] 플레이어 실전 Sprite Atlas 적용
- [x] 일반·정예·보스 몬스터 8종 실제 시트 적용
- [x] 종별 Idle·Move·Attack·Hit·Die·Roar 키 적용
- [x] 실제 배경·영웅·보스 초상 적용
- [x] 실사용 NineSlice UI 18종과 로비·보스 HUD 리빌드
- [x] 라이선스·NOTICE·원본 보관 체계
- [x] 라이브 아트 자동 검사와 미리보기

## 다음: Phase 11 전용 아트 통일·온라인 기반 v1.1

- [ ] LUMERIFT 전용 플레이어 8방향 원화와 모션
- [ ] Chapter 1 몬스터·보스 세계관 통일 리디자인
- [ ] 인벤토리·스테이지 선택·결과 화면 UI 2차 리빌드
- [ ] 실제 모바일 GPU 메모리·FPS 검증
- [ ] 게스트 → Google 계정 연결
- [ ] Cloud Save·공지·출석·우편·쿠폰·랭킹


## v1.0.1 완료

- 실행에 필요한 자산 중심으로 배포본 정리
- 원본 보관과 런타임 배포 분리
- 다음 단계는 인벤토리·스테이지·퀘스트 UI의 실사용 아트 통일이다.

## 긴급 완료: v1.0.2

- [x] BattleActorView 미사용 선언 TS6133 복구
- [x] v1.0.1 최적화 배포 기준 유지
- [x] 다음 v1.1.0 UI 2차 리빌드 기준선 확정


## 긴급 완료: v1.0.3 전체 자산 보존 복구

- [x] v1.0.0 전체 원본과 보관 자산 복원
- [x] v1.0.2 TypeScript 빌드 수정 유지
- [x] 전체 통합본·경량 런타임 패키지 명칭 분리
- [x] `validate:archive` 자동 검사 추가
- [x] 초기 다운로드와 전체 프로젝트 용량 기준 분리
- [ ] v1.1.0 인벤토리·장비·스테이지 선택 UI 리빌드 계속

## 완료: v1.1.0 모바일 원본 최적화 및 UI 2차 리빌드

- [x] 원본 용도별 해상도 상한
- [x] PNG 재압축과 원본 용량 예산
- [x] 인벤토리 UI 2차 리빌드
- [x] 스테이지 선택 UI 2차 리빌드
- [x] 결과 화면 UI 2차 리빌드
- [x] BAT 선택 도구 정책
- [x] source art 자동 검증

## 다음: v1.2.0 운영 UI 및 독점 아트 규격

- [ ] 퀘스트·공지·출석·우편·쿠폰 공통 UI
- [ ] 독점 플레이어 8방향 원화 규격과 제작 샘플
- [ ] Chapter 1 몬스터·보스 통일 화풍 리디자인
- [ ] 실기기 WebGL 메모리·FPS 측정

## 완료: v1.2.0 UI·그래픽 Visual Reset

- [x] 전체 화면 시각 감사
- [x] 공통 디자인 시스템 v2
- [x] 로비·전투 HUD 재구성
- [x] 인벤토리 3×4 아이콘 그리드
- [x] 스테이지 노드·경로 화면
- [x] 결과 등급·보상 중심 화면
- [x] 배우 Atlas 공통 색·윤곽 패스
- [x] 5개 미리보기·시각 자동 검사

## 다음: v1.3.0 운영 UI·전용 아트 샘플

- [ ] 퀘스트·공지·출석·우편·쿠폰 공통 UI
- [ ] 전용 플레이어 8방향 원화 샘플
- [ ] 일반 몬스터·정예·보스 동일 화풍 샘플
- [ ] Android·iOS 실기기 시각·성능 QA

## 완료: v1.3.0 운영 UI·저장 v4·모바일 레이아웃

- [x] 공지·출석·우편·쿠폰 공통 UI
- [x] 로비 소식 메뉴와 알림 개수
- [x] Player Save v4 운영 이력
- [x] 주간 출석과 중복 수령 방지
- [x] 우편 개별·일괄 수령
- [x] 쿠폰 만료·중복 사용 검증
- [x] 퀘스트 카드 공통 디자인 적용
- [x] Safe Area·100dvh·visualViewport 대응
- [x] 운영 UI 미리보기·자동 검사

## 다음: v1.4.0 Firebase 운영·Cloud Save

- [ ] Firebase 원격 공지·우편 데이터
- [ ] 서버 시간 기반 출석
- [ ] Cloud Functions 쿠폰·보상 검증
- [ ] 게스트 → Google 계정 연결
- [ ] 로컬·클라우드 저장 충돌 비교
- [ ] 저장 실패 재시도 큐
- [ ] Android·iOS 실기기 QA
- [ ] LUMERIFT 전용 플레이어·몬스터 아트 제작

## v1.5.0 계획

- Firebase Console 배포 결과와 실제 권한 테스트 반영
- Cloud Save 충돌 비교·선택 UI
- 주간·전체 랭킹과 내 순위
- 서버 검증 우편·출석·쿠폰 백엔드 설계
- App Check는 v1.4.2에서 비활성화하며 사용자 재승인 전까지 재도입하지 않음
- LUMERIFT 전용 플레이어·몬스터 아트 제작 계속

## 완료: v1.4.2 App Check 비활성화

- [x] App Check SDK 초기화 제거
- [x] reCAPTCHA 환경변수 제거
- [x] GitHub Actions Secret 주입 제거
- [x] Console enforcement 비활성화 규칙 고정
- [x] Auth·Firestore·Cloud Save 유지


## 완료: v1.5.0 계정·Cloud Save·랭킹

- [x] 계정 제공자·UID·이메일 인증 상태 화면
- [x] 익명 계정 Google·이메일 연결
- [x] 인증 메일·비밀번호 재설정·로그아웃
- [x] 로컬·클라우드 저장 비교와 충돌 표시
- [x] 수동 Cloud Save 업로드·다운로드
- [x] 동기화 상태·마지막 성공 시각·대기열 표시
- [x] 전체·주간 랭킹과 내 순위
- [x] Firestore Rules·Indexes 갱신
- [x] Emulator 권한 테스트 자동화

## 다음: v1.6.0 시즌·복구·운영 안정화

- [ ] 랭킹 시즌 ID와 시즌 종료 스냅샷
- [ ] Cloud Save 동기화 이력과 복구 포인트
- [ ] 계정 전환 전 미동기화 경고
- [ ] Firestore 쓰기 횟수 절감용 변경 감지
- [ ] 원격 공지 관리자 입력 템플릿
- [ ] Android Chrome·iOS Safari 실제 계정/팝업 테스트
- [ ] LUMERIFT 전용 플레이어·몬스터 아트 제작 계속

## 완료: v1.6.0 추가 에셋 정리

- [x] public/assets 전수 참조 분석
- [x] 활성 런타임과 보관 자산 분리
- [x] 미사용 182개·19.70MB를 public 밖으로 이동
- [x] 전체 통합본 자산·라이선스 보존
- [x] SHA-256 자산 레지스트리와 이동 계획
- [x] public 6MB 예산·잔존 참조 자동 검사
- [x] 패치용 idempotent 이동 스크립트

## 다음: v1.7.0 아트 통일·시즌 안정화

- [ ] LUMERIFT 전용 플레이어 8방향 제작 샘플
- [ ] Chapter 1 일반·정예·보스 동일 화풍 재설계
- [ ] 랭킹 시즌 ID와 종료 스냅샷
- [ ] Cloud Save 복구 포인트와 동기화 이력
- [ ] Android·iOS 실기기 계정·WebGL QA


## 완료: v1.7.0 실사용 아트 통일 1차

- 플레이어·몬스터 공통 명암·윤곽·림라이트
- VFX 5종 40프레임
- Chapter 1 배경 4단계
- 보스 초상 3페이즈
- 이전 v2 런타임 아트 보존 이동

## 다음: v1.8.0 전용 실루엣·시즌·복구 기반

- LUMERIFT 전용 플레이어 8방향 실루엣 원화
- 일반 5종·정예 2종·보스 1종 전용 형태 리디자인
- 보스 3페이즈 전신 변화
- 랭킹 시즌 ID·시즌 기록
- Cloud Save 복구 포인트·동기화 이력
- Android Chrome·iOS Safari 실기기 QA

## 완료: v1.8.0 보스 전투·복구·시즌

- 경고 범위와 실제 피격 판정 동기화
- 보스 3페이즈 전환 연출
- Cloud Save 복구 지점
- 28일 시즌 랭킹

## 다음: v1.9.0 실기기 안정화·전용 실루엣 1차

- 모바일 보스 연출 성능 측정
- 시즌 종료 기록과 복구 이력
- LUMERIFT 전용 플레이어 실루엣 1차


## 완료: v1.8.1 PixiJS 8 빌드 핫픽스

- [x] VirtualJoystick 객체형 lineStyle 제거
- [x] PixiJS 8 stroke 경로 방식 적용
- [x] 소스 회귀 검사 추가
- [x] v1.8.0 기능·에셋 무변경 유지

## 다음: v1.9.0 전체 UI 리빌드

- [ ] 첫 시작·로그인 화면 상용 수준 리빌드
- [ ] 로비·전투·인벤토리·스테이지·결과 화면 공통 디자인 시스템
- [ ] 계정·Cloud Save·복구·랭킹 화면 통합 스타일
- [ ] 실기기 Safe Area·터치 영역·폰트·FPS 검증

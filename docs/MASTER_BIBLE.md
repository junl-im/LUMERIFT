# LUMERIFT: 균열의 계승자

## AAA급 모바일 웹 액션 RPG 통합 개발 바이블

- 게임 작업명: LUMERIFT / 루메리프트
- 부제: 균열의 계승자
- 문서 버전: v0.4
- 프로젝트 단계: 장비·인벤토리·강화 성장 루프 완료
- 플랫폼: 모바일 웹 우선, 데스크톱 웹 지원
- 화면: 세로형 9:16
- 기술: Vite + TypeScript + PixiJS 8 + Firebase
- 배포: GitHub Pages
- 에셋: PNG/WebP 전용, SVG 금지
- 최우선 가치: 전투 손맛, 빠른 로딩, 고품질 아트, 모바일 안정성

## 1. 핵심 목표

처음부터 대규모 MMORPG를 만들지 않는다. 먼저 가볍고 빠르고 아름다우며 반복 플레이가 재미있는 AAA급 모바일 웹 액션 RPG MVP를 완성한다.

핵심 루프:

`로그인 → 캐릭터 선택 → 전투 → 보상 → 장비 → 성장 → 다음 스테이지 → 저장`


### v0.4 구현 상태

- 저장 데이터 v2와 v1 자동 마이그레이션
- 장비 9종과 무기·방어구·장신구 3부위
- 일반·희귀·영웅 3등급
- 장착·해제·강화·잠금·개별 판매·일괄 판매
- 전투력과 장비 능력치 계산
- 장비 능력치의 실제 전투 반영
- 스테이지 드롭 테이블과 결과 보상 저장
- 인벤토리 필터·정렬·페이지 이동

## 2. 절대 개발 규칙

1. 모바일 웹 우선, 데스크톱은 확장 지원한다.
2. TypeScript를 기본으로 사용한다.
3. 게임 로직, 렌더링, UI, 저장, 네트워크 계층을 분리한다.
4. SVG 파일과 런타임 SVG 생성을 금지한다.
5. 최종 이미지 리소스는 PNG 또는 WebP로 제공한다.
6. PSD 원본 → PNG 마스터 → WebP → Atlas → 게임 적용 흐름을 지킨다.
7. 기본 60FPS, 절전 30FPS, 자동 전환을 지원한다.
8. 반복 생성 객체는 Object Pool을 적용한다.
9. 맵과 지역 리소스는 Lazy Loading한다.
10. 초기 다운로드는 15MB 이하를 목표로 한다.
11. 기능 수보다 전투 반응성, 로딩, 안정성을 우선한다.
12. 모든 변경은 CHANGELOG와 DECISIONS에 기록한다.

## 3. MVP 확정 범위

### 계정과 저장

- 게스트 로그인
- Google 로그인
- 게스트 계정 전환 구조
- 닉네임
- Firebase Cloud Save
- 로컬 개발 저장소 대체 구현

### 플레이어

- 캐릭터 1종
- 레벨과 경험치
- 무기 표현
- 기본 능력치
- 그림자

### 필수 플레이어 모션

- Idle, Walk, Run
- Attack1, Attack2, Attack3
- Skill1, Skill2
- Hit, Death, Victory, Spawn
- Roll 또는 Dash

### 전투

- 이동, 기본 공격, 연속 공격
- 스킬 2종
- 회피 또는 대시
- 피격, 넉백, 치명타
- 상태 이상 2종
- 데미지 숫자
- 일반 적 및 보스 체력 표시
- 자동 타겟 보조
- 일시정지
- Hit Stop, Shake, 제한적 Slow Motion

### 몬스터

- 일반 5종
- 정예 2종
- 보스 1종
- 일반 몬스터 공통 모션: Idle, Move, Attack, Hit, Die
- 보스 패턴 최소 3종

### 맵과 스테이지

- 지역 1개
- 일반 스테이지 10개
- 보스 스테이지 1개
- TileMap, Collision, Trigger, NPC, Portal, Spawn
- 스테이지별 보상과 난이도 상승

### 성장과 아이템

- 무기, 방어구, 장신구
- MVP 등급: 일반, 희귀, 영웅
- 후속 규격: 전설, 신화
- 장비 강화, 판매, 잠금
- 인벤토리 필터, 정렬, 즐겨찾기 규격, 일괄 판매
- 스킬 레벨
- 스테이지 해금

### 퀘스트와 운영

- 메인 퀘스트
- 일일 퀘스트
- 자동 추적
- 보상 수령
- 7일 출석
- 우편
- 공지
- 쿠폰
- 전체·주간 랭킹

## 4. MVP 제외 범위

구조만 고려하고 실제 구현은 출시 이후로 미룬다.

- 실시간 오픈월드
- 대규모 동시 전투
- 실시간 파티
- PvP
- 길드전
- 글로벌·길드·파티·귓속말 채팅
- 유저 거래와 경매장
- 펫 탑승·자동전투
- 초월·각성·승급·합성
- 대규모 제작 시스템
- 시즌 패스 결제
- 광고 Reward·Interstitial·Banner
- Apple·Naver·Kakao 로그인
- 수백 종 몬스터와 다대륙 월드

## 5. 기술 계층

```text
Presentation
├─ Pixi Scene
├─ HUD / Menu UI
└─ Animation

Game
├─ Combat / Character / Monster
├─ Skill / Quest / Inventory
└─ Stage / Progression

Core
├─ Scene / Event / State
├─ Input / Audio / Camera / Time
├─ Asset / Cache
└─ Object Pool / Performance

Data
├─ Static JSON/TS Data
├─ Player Save
├─ Local Cache
└─ Firebase Repository

Infrastructure
├─ Firebase
├─ GitHub Pages
├─ CI/CD
├─ Logging
└─ Analytics
```

화면과 게임 객체에서 Firestore를 직접 호출하지 않는다. Repository와 Service를 통한다.

## 6. 씬 흐름

```text
BootScene
→ LoginScene
→ LobbyScene
→ StageSelectScene
→ BattleScene
→ ResultScene
→ LobbyScene
```

현재 기술 기반에서는 StageSelectScene을 생략하고 로비에서 전투 테스트로 직접 연결한다. 콘텐츠 단계에서 정식 추가한다.

## 7. 렌더링과 해상도

- 기준 디자인: 540 × 960 논리 좌표
- 아트 마스터: 1080 × 1920 기준
- WebGL 우선
- GPU Rendering
- Batch Rendering
- Texture Atlas
- Instancing은 실제 성능 이점이 검증되는 대상에 적용
- GPU Particle
- Offscreen Canvas는 브라우저 호환성과 실측 이점 확인 후 적용
- Safe Area, 노치, 홈 인디케이터 대응
- 데스크톱에서는 중앙 세로 레이아웃

기능을 무조건 적용하지 않는다. 성능 계측 결과가 개선을 증명해야 한다.

## 8. 성능 예산

- 초기 다운로드: 15MB 이하 목표
- 기본: 60FPS
- 절전: 30FPS
- 전투 중 동기 대용량 로딩 금지
- 같은 스테이지 반복 시 메모리 증가 금지
- 씬 종료 시 지역 Atlas와 오디오 해제
- Draw Call은 Atlas와 정렬로 최소화
- 긴 JavaScript Task 방지

풀링 우선 대상:

- 데미지 숫자
- 투사체
- 공격·스킬·피격 이펙트
- 파티클
- 드롭 아이템
- 상태 아이콘
- 임시 알림

## 9. 이미지와 Atlas

```text
PSD 원본
→ 레이어 정리
→ PNG 마스터
→ WebP 변환
→ Atlas 패킹
→ JSON 메타데이터
→ 게임 적용
→ 실기기 검수
```

Atlas 분류 예:

- atlas_character_player_01.webp
- atlas_monster_forest_01.webp
- atlas_boss_forest_01.webp
- atlas_ui_common.webp
- atlas_ui_lobby.webp
- atlas_ui_battle.webp
- atlas_skill_fire.webp
- atlas_map_forest_01.webp
- atlas_items_equipment_01.webp

모든 리소스를 하나의 대형 Atlas로 합치지 않는다.

## 10. 캐릭터 아트 규격

분리 가능 레이어:

- 몸, 머리, 얼굴, 머리카락
- 무기, 보조 무기, 망토, 액세서리
- 그림자, 상태 이펙트

MVP 최적화 원칙:

- 몸과 기본 의상은 통합 애니메이션 시트
- 무기만 별도 레이어 우선
- 얼굴 세부 파츠는 로비 연출에서만 분리
- 전투 중 통합 스프라이트 우선
- 방향은 8방향 기본
- 11방향은 MVP 이후 검토

## 11. 애니메이션 데이터

판정을 프레임 번호에 하드코딩하지 않는다. 애니메이션 이벤트 데이터로 사운드, 히트박스, 카메라, 이펙트를 연결한다.

## 12. 전투 설계

전투 순서:

`입력 → 행동 가능 확인 → 애니메이션 → 공격 이벤트 → 히트박스 → 충돌 → 피해 → 피격 → 연출 → 상태 전환`

기본 능력치:

- HP
- Attack
- Defense
- Critical Rate
- Critical Damage
- Move Speed
- Attack Speed
- Skill Cooldown Reduction

MVP 상태 이상:

- 화상
- 빙결 또는 둔화

타격감 요소:

- Hit Stop
- 피격 플래시
- 넉백
- 데미지 숫자
- 타격음
- 카메라 흔들림
- 잔상과 먼지
- 강력 스킬 및 보스 처치 슬로 모션

## 13. 카메라

- Follow
- Zoom
- Shake
- Slow Motion
- Hit Stop
- 맵 경계 제한
- 보스 등장 및 처치 연출

흔들림 프리셋: tiny, small, medium, large, boss

## 14. AI

일반 몬스터 FSM:

`Spawn → Idle → Search → Move → Attack → Cooldown → Hit/Move/Attack → Die`

보스는 FSM과 패턴 선택기를 결합한다. Behavior Tree는 복잡한 보스와 NPC부터 도입한다.

## 15. 데이터 기반 시스템

JSON 또는 타입 안전한 TS 데이터로 관리한다.

- Skill: Cooldown, Damage, Effect, Range, Animation, Sound
- Map: TileMap, Collision, Trigger, NPC, Portal, Spawn
- Quest: 조건, 보상, 다음 퀘스트
- Item: 등급, 부위, 능력치, 강화
- Stage: 적 구성, 보상, 해금 조건

새로운 몬스터와 스킬은 핵심 코드를 수정하지 않고 데이터 추가로 생성 가능해야 한다.

## 16. UI/UX

- Glass 스타일
- 가독성 우선
- 9Slice 기반
- 하단 중심 한 손 조작
- 터치 영역 확대
- 과도한 상시 애니메이션 금지
- 확인 없는 중요 재화 소모 금지
- 전투 HUD: HP, 보스 HP, 조이스틱, 공격, 스킬, 회피, 일시정지

## 17. 사운드

- 효과음: OGG
- 배경음: Opus 우선, 필요 시 호환 포맷 제공
- BGM / SFX / UI / Voice / Ambient 분리
- 최초 사용자 입력 후 AudioContext 활성화
- 지역별 Lazy Loading과 해제

## 18. Firebase

사용 예정:

- Authentication
- Firestore
- Cloud Functions
- Cloud Storage
- Messaging
- Analytics
- 운영 설정

Firestore 예시:

```text
users/{uid}
users/{uid}/characters/{characterId}
users/{uid}/inventory/{itemUid}
users/{uid}/quests/{questId}
users/{uid}/mail/{mailId}
rankings/{seasonId}/players/{uid}
gameConfig/current
notices/{noticeId}
coupons/{couponId}
```

정적 게임 데이터 전체를 Firestore에서 매번 읽지 않는다.

서버 검증 대상:

- 랭킹
- 쿠폰
- 우편 보상
- 중요 재화
- 출석과 시즌 보상
- 비정상 클리어 기록

## 19. 에셋 제작 초안

- 월드 타일셋: 숲, 사막, 설원, 화산, 도시
- 플레이어 직업별 모션
- 일반·정예·보스 몬스터
- 무기·방어구·장신구 아이콘
- 스킬 이펙트
- UI 아이콘, 버튼, 패널, 팝업
- NPC 일러스트
- 배경 오브젝트
- 비, 눈, 안개
- 폭발, 마법진, 버프, 디버프
- 로딩, 로고, 튜토리얼

MVP에서는 지역 1개, 플레이어 1종, 일반 5종, 정예 2종, 보스 1종으로 제한한다.

## 20. AI 아트 검수

생성 이미지를 바로 사용하지 않는다.

- 형태 오류
- 손과 무기 연결
- 시점과 조명
- 캐릭터 비율
- 배경 제거와 알파 경계
- 색상 보정
- 파츠 분리
- 축소 가독성
- 저작권과 유사성

모든 캐릭터와 몬스터는 동일한 아트 바이블을 따른다.

## 21. CI/CD

`feature → Pull Request → Asset Validation → Type Check → Unit Test → Build → Bundle Budget → main → GitHub Pages`

자동 검사:

- TypeScript 오류
- 테스트 실패
- SVG
- 금지 이미지 포맷
- 대형 단일 이미지
- 잘못된 JSON
- 누락 경로
- 초기 번들 15MB 초과

## 22. 실기기 테스트

- 저사양·중급·고급 Android
- 구형·최신 iPhone
- 태블릿
- Windows Chrome/Edge
- macOS Safari

검증:

- 장시간 플레이
- 백그라운드 복귀
- 네트워크 중단
- WebGL 컨텍스트 손실
- 저장 실패
- 브라우저 메모리 부족

## 23. 개발 단계

1. 기술 기반
2. 전투 프로토타입
3. 데이터 기반 구조
4. MVP 콘텐츠
5. Firebase 연동
6. 최종 아트 교체
7. 최적화
8. 출시 준비

## 24. 출시 통과 기준

- 로그인부터 저장까지 전체 루프 정상
- 10개 스테이지와 보스 완료 가능
- 장비, 강화, 퀘스트 정상
- 재접속 데이터 복구
- 랭킹, 우편, 출석 정상
- 프레임과 메모리 안정
- 임시 이미지 제거
- 터치 및 UI 잘림 없음
- 네트워크와 저장 실패 복구

## 25. 후속 우선순위

1순위: 캐릭터, 지역, 몬스터, 장비, 스킬, 일일 던전, 업적, 도감

2순위: 시즌, 30일 출석, 패스, 이벤트 던전, 펫 수집, 제작, 세트 효과

3순위: 길드, 길드 랭킹, 비동기 친구, 지원 캐릭터, 보스 경쟁

4순위: 채팅, 파티, 협동 보스, PvP

## 26. 최종 원칙

먼저 작지만 완성도 높은 게임을 만든다. 전투 손맛, 성장 체감, 빠른 시작, 모바일 반복 안정성이 완성되기 전에는 대규모 온라인 기능을 추가하지 않는다.

## 현재 구현 기준선: v0.9.1

- 챕터 1 스테이지 10개, 퀘스트, 장비, 저장 v3가 구현되었다.
- 8방향 플레이어와 몬스터·UI·장비·VFX Atlas가 런타임에 연결되었다.
- 모바일 조이스틱, 쿨다운 HUD, 보스 3페이즈, 품질 자동 축소가 적용되었다.
- v0.8 구조 검증팩 1,174프레임·127애니메이션을 유지한다.
- v0.9 품질팩 26 Atlas·1,300프레임·32애니메이션을 추가했다.
- 누적 Atlas는 2,474프레임·159애니메이션이다.
- 고해상도 PNG 원본 약 458.36MB와 런타임 WebP 약 12.31MB를 분리한다.
- 품질팩은 `production-candidate-procedural`이며 최종 상용 원화가 아니다.
- 모든 후속 작업은 `AGENTS.md`와 인수인계 파일을 먼저 읽고 반드시 갱신한다.
- 다음 우선순위는 Firebase 인증, Cloud Save, 공지, 출석, 우편, 쿠폰, 랭킹이다.


### v0.9.1 빌드 규칙

- Vite 8 `manualChunks`는 함수 형식만 허용한다.
- 빌드 설정 검증과 TypeScript 검사를 릴리스 검증 초반에 수행한다.
- GitHub Actions는 Node.js 24 호환 액션 버전을 사용한다.

## 현재 구현 기준선: v1.0.0

- 기본 로비·전투는 `assets/live/v1` 실제 공개 라이선스 게임 아트를 사용한다.
- 플레이어·몬스터·배경·초상·NineSlice UI가 실제 런타임에 연결되었다.
- 기존 절차형 v0.8·v0.9 자산은 레거시 보관소에서만 유지한다.
- 현재 품질 단계는 `production-candidate-open-art-pass`이며 독점 최종 상용 원화가 아니다.
- 제3자 자산은 라이선스, 제작자 표시, 가공 내역을 배포물과 함께 유지한다.
- 다음 아트 기준선은 LUMERIFT 전용 8방향 플레이어와 Chapter 1 통일 원화다.

## 모바일 제작용 원본 보존 규칙

- 전체 통합본에는 재가공 가능한 모바일 제작용 원본을 포함한다.
- LUMERIFT 소유 원본은 화면 용도별 최대 해상도와 PNG 압축 예산을 적용한다.
- 제3자 공개 원본은 라이선스와 가공 재현을 위해 원본 상태로 보관할 수 있다.
- 원본 용량은 런타임 초기 다운로드 예산과 별도로 관리한다.

## v1.2 시각 시스템 고정 규칙

- UI는 흑청색 Obsidian 바탕, 금색 보상, 청록색 행동, 적색 위험의 역할 체계를 따른다.
- 화면은 핵심 행동 1개와 보조 행동을 분리하고 동일 사각 버튼을 무분별하게 반복하지 않는다.
- 전투 HUD는 전투 가시 영역을 침범하지 않도록 상단과 하단 가장자리에 압축한다.
- 인벤토리는 텍스트 목록이 아니라 이미지 슬롯을 기본으로 한다.
- 화면 완료 전 미리보기와 Visual Audit을 작성하고 자동 계약 검사를 통과한다.

## v1.3 운영 시스템 고정 규칙

- 운영 화면은 공지·출석·우편·쿠폰을 동일한 디자인과 저장 계약으로 제공한다.
- 운영 보상의 읽음·수령·사용 이력은 Player Save v4에 저장한다.
- 로컬 보상도 중복 지급을 방지하며 온라인 전환 시 서버에서 다시 검증한다.
- 출석 주기는 UTC 월요일 시작 7일 기준이며 서버 시간 전환이 가능한 함수 구조를 유지한다.
- 운영 자산은 별도 Atlas와 Lazy Loading으로 초기 부트 번들에 포함하지 않는다.
- 모바일 화면은 Safe Area와 동적 뷰포트를 기본으로 한다.

## Firebase 운영 원칙 v1.4.0

LUMERIFT 웹 클라이언트는 npm modular Firebase SDK만 사용한다. 인증은 익명·Google·이메일을 제공하며 익명 진행 데이터는 계정 연결 방식으로 UID를 보존한다. Firestore는 사용자 UID별 문서 격리와 기본 거부 규칙을 유지한다. 클라이언트가 임의 조작 가능한 보상은 MVP 저장과 서버 검증 보상을 구분하며, 쿠폰과 고가치 지급은 Admin 환경 도입 전까지 원격 최종 지급으로 전환하지 않는다.

## v1.5.0 계정·Cloud Save·랭킹 운영 기준

- 계정 화면은 인증 제공자, UID, 이메일 인증 상태, Cloud Save 상태를 한 화면에서 관리한다.
- 자동 저장은 로컬 우선이며 Firestore 실패 시 재시도 대기열을 유지한다.
- 저장 충돌은 로컬·클라우드 요약과 방향이 명확한 수동 버튼으로 해결한다.
- 전체·주간 랭킹은 화면 진입 스냅샷만 사용하고 무제한 실시간 리스너를 금지한다.
- 랭킹은 클라이언트 표시용 MVP이며 서버 권위 검증 전에는 경쟁 보상을 지급하지 않는다.
- App Check는 사용자 재승인 전까지 비활성화한다.

## v1.6.0 에셋 배포·보관 기준

- GitHub Pages가 복사하는 `public/assets`에는 현재 게임에서 도달 가능한 런타임 자산만 둔다.
- 레거시·미사용·품질 후보 자산은 삭제하지 않고 `art_source/runtime_archive`로 이동한다.
- 활성 public과 전체 통합본 보관 자산은 서로 다른 용량 지표로 보고한다.
- 이동 자산은 원래 경로와 SHA-256을 기록해 복원 가능성을 유지한다.
- 보관 자산은 AssetCatalog에서 직접 참조하지 않는다.
- public 자산은 6MB 이내를 현재 운영 예산으로 두며 초기 로딩 15MB 기준은 별도로 유지한다.


## v1.7.0 Chapter 1 아트 통일 원칙

- 전투 아트는 플레이어를 청록·금색 기준점으로 두고 몬스터는 종별 색상을 유지한다.
- 모든 192px 전투 프레임은 어두운 배경에서 읽히는 외곽선과 림라이트를 가진다.
- 스테이지 배경은 4단계로 상승하며 전투 판정 영역보다 장식이 강해지지 않는다.
- 보스 페이즈는 초상·오라·VFX 색으로 위험도 상승을 전달한다.
- 공개 원본 기반 통일 패스는 최종 독점 원화로 보고하지 않는다.

## v1.8.0 전투 판정·복구·시즌 원칙

- 보이는 공격 경고와 실제 판정은 반드시 동일한 기하 데이터에서 생성한다.
- 카메라 흔들림과 Hit Stop은 실제 적중 후에만 실행한다.
- Cloud Save 덮어쓰기 전 로컬 복구 가능성을 확보한다.
- 클라이언트 랭킹은 표시용이며 보상 검증은 서버 기능 도입 전까지 금지한다.


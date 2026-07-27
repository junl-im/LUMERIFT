# Firebase Schema Draft

대상 저장 버전: v2

## Authentication

- Guest
- Google
- Apple/Naver/Kakao는 이후

## 현재 PlayerProfile v2

개발 단계에서는 한 사용자 문서 안에 프로필과 소규모 인벤토리를 함께 저장한다.

```text
users/{uid}
├─ saveVersion: 2
├─ nickname
├─ level
├─ exp
├─ gold
├─ highestStage
├─ inventory
│  └─ {itemUid}
│     ├─ uid
│     ├─ itemId
│     ├─ level
│     ├─ locked
│     └─ acquiredAt
├─ equipped
│  ├─ weapon: itemUid | null
│  ├─ armor: itemUid | null
│  └─ accessory: itemUid | null
└─ updatedAt
```

저장 v1 데이터는 읽을 때 v2로 자동 변환하며, 스타터 장비는 인벤토리가 비어 있을 때 한 번만 생성한다.

## 목표 Firestore 분리 구조

사용자 수와 인벤토리 크기가 증가하면 다음 구조로 분리한다.

```text
users/{uid}
users/{uid}/characters/{characterId}
users/{uid}/inventory/{itemUid}
users/{uid}/quests/{questId}
users/{uid}/mail/{mailId}
rankings/{seasonId}/players/{uid}
notices/{noticeId}
coupons/{couponId}
gameConfig/current
```

## 무결성 규칙

- `equipped`에는 같은 사용자의 `inventory`에 존재하는 UID만 저장한다.
- 아이템 부위와 장착 슬롯이 일치해야 한다.
- 잠금 여부와 강화 단계는 서버 저장값을 기준으로 한다.
- 정적 아이템 기본 능력치는 클라이언트 빌드 데이터에서 읽는다.
- 중요 재화·고등급 보상·강화 결과는 운영 단계에서 Cloud Function 검증으로 전환한다.

## 보안

- 본인 데이터만 읽기/쓰기
- 운영 데이터 일반 사용자 쓰기 금지
- 랭킹, 쿠폰, 우편, 중요 재화는 Cloud Function 검증
- 관리자 권한은 Custom Claims
- 서비스 계정 키는 절대 클라이언트에 포함하지 않음

## 비용 원칙

- 불필요한 실시간 Listener 금지
- 페이지네이션
- 로컬 캐시
- 정적 게임 데이터는 빌드 파일
- 읽기/쓰기 계측
- 인벤토리 증가 시 서브컬렉션 전환

## Player Save v3

`users/{uid}`에 기존 프로필·인벤토리와 함께 다음 필드를 저장한다.

- `stageProgress/{stageId}` 성격의 맵: 클리어 횟수, 최고 기록, 최초 보상 수령
- `questClaims`: 메인 퀘스트 수령 상태
- `dailyQuestDate`, `dailyQuestClaims`: 일일 초기화와 수령 상태
- `statistics`, `dailyStatistics`: 처치·클리어·강화·장비 획득 누계
- `tutorial`: 완료 또는 건너뛰기 상태

Cloud Functions 도입 시 일일 날짜와 중요 보상 지급은 서버 시간을 기준으로 재검증한다.

## Player Save v4 · 운영 상태

`users/{uid}`에 다음 운영 상태를 추가한다.

```text
operations
├─ attendanceCycleKey
├─ attendanceClaims: number[]
├─ noticeReads: { [noticeId]: timestamp }
├─ mailClaims: { [mailId]: timestamp }
└─ redeemedCoupons: { [code]: timestamp }
```

현재 v1.3.0은 로컬 정적 운영 데이터로 동작한다. Firebase 운영 전환 시 공지·우편·쿠폰 원본과 보상 지급은 읽기 전용 컬렉션 및 Cloud Functions에서 검증한다.

# LUMERIFT v1.11.24 Patch Notes

## 외형 프리셋 Firestore 동기화

- 사용자가 명시적으로 동의한 뒤에만 `users/{uid}/settings/characterAppearance`를 읽고 쓴다.
- 로컬 Archive와 Cloud Archive의 결정적 revision을 비교한다.
- 한쪽만 변경된 경우 해당 방향으로 반영하고, 양쪽이 모두 변경된 경우 자동 덮어쓰지 않고 충돌 상태로 중지한다.
- 업로드 실패 봉투는 로컬 재시도 큐에 보존한다.
- Cloud 가져오기 시 고정 슬롯은 로컬 값을 우선 보존하고 병합 통합본을 다시 업로드한다.

## Archive v3·슬롯 순서

- 외형 슬롯 표시 순서를 좌우로 변경할 수 있다.
- Archive v3에 `slotOrder`를 포함한다.
- v1·v2 Archive 가져오기 하위 호환을 유지한다.
- 슬롯 고정 보호는 수동 저장과 Cloud 병합 모두에서 유지된다.

## 장비 마스크·공격 프레임 보정

- 갑주·망토·룬을 장착 아이템 계열별 프로그램 마스크로 분리한다.
- 검은 손목 정렬, 대검은 무게 중심, 균열 장창은 찌르기 축을 중심으로 공격 본체 프레임을 보정한다.
- 신규 런타임 이미지는 추가하지 않았다.
- 이 보정은 최종 수작업 원화가 아니라 기존 v11 Atlas의 표현 보정이다.

## 유지 계약

- Player Save v4 유지
- AttackFootprint 단일 판정 유지
- Firebase App Check 비활성 유지
- 실제 물리 기기 캡처 없이는 전역 `capture-verified` 승인 금지

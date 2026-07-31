# Weapon Body Frame Correction v1.11.24

기존 v11 공격 본체 Atlas를 무기 계열별로 미세 정렬한다.

- 검: blade-hand-tune — 손목과 타격축 정렬
- 대검: greatblade-weight-tune — 무게 중심과 회수 구간 보정
- 균열 장창: riftlance-thrust-tune — 찌르기 축과 전진 정렬

보정값은 프레임 인덱스와 8방향에 따라 위치·회전·스케일·장비 레이어 지연을 조절한다. AttackFootprint와 피해 판정은 변경하지 않는다.

이는 신규 수작업 공격 원화가 아니라 기존 production-candidate Atlas의 정렬 보정이다.

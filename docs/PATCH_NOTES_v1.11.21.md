# LUMERIFT v1.11.21 Patch Notes

## 추가

- 캐릭터 스튜디오 8방향 수동 회전
- 무기·방어구·장신구 슬롯별 현재/교체 후 외형 동시 비교
- 균열검·대검·균열 장창별 본체 공격 프레임 레시피
- 콤보 단계별 선행·접촉·회수·전진·회전 타이밍 분리
- 장비 세트 코스튬 3종과 갑주·망토·룬 세부 염색 채널
- 최근 외형 프리셋 최대 5개 빠른 적용
- Android Chrome·iOS Safari 캡처 준비용 크기·발광 프로필

## 변경

- 로비와 전투가 캐릭터 스튜디오의 코스튬·세부 염색 상태를 공통 사용한다.
- 기존 v1.11.20 외형 슬롯을 방향·코스튬·채널 기본값으로 하위 호환한다.
- 무기 계열 모션이 본체 프레임, PlayerMotionDirector, 전투 행동 복사본에 동일하게 반영된다.

## 유지

- Player Save v4
- Firebase App Check 비활성
- `AttackFootprint` 공유 판정
- PNG/WebP 이미지 정책과 초기 다운로드 15MB 예산
- v10 본체 Atlas와 v4 fallback

## 제한

- Android Chrome·iOS Safari 실제 물리 기기 캡처·FPS·온도·배터리·GPU 메모리 측정은 수행하지 않았다.
- 전용 본체 공격 프레임은 기존 v10 Atlas 프레임 재구성으로, 신규 수작업 공격 Atlas 완성을 의미하지 않는다.

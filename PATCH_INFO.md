# LUMERIFT v0.9.1 → v1.0.0 덮어쓰기 패치

이 패치는 v0.9.1 프로젝트를 v1.0.0 실제 게임용 비주얼 리빌드 상태로 갱신한다.

## 적용

1. 기존 프로젝트를 백업한다.
2. ZIP의 파일을 프로젝트 루트에 모두 풀어 덮어쓴다.
3. `PATCH_DELETE_LIST.txt`의 파일을 삭제한다. 이번 버전은 삭제 대상이 없다.
4. `npm install`
5. `npm run validate:liveart`
6. `npm run verify`
7. `npm run dev`

## 주요 변경

- 실제 공개 라이선스 플레이어·몬스터·배경·초상 적용
- 로비·전투 HUD와 NineSlice UI 리빌드
- 제3자 라이선스·NOTICE·원본 보관 추가
- 실사용 아트 자동 검증·미리보기 추가

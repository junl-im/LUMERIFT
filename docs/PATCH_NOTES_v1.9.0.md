# PATCH NOTES v1.9.0

## 첫 시작 화면부터 전체 UI 통일

- 전용 LUMERIFT 타이틀/로그인 화면 적용
- Google·이메일·익명 로그인 흐름을 타이틀 화면에서 연결
- Luminous UI Atlas 30프레임과 아이콘 Atlas 30프레임 추가
- 공통 NineSlice 패널, 아이콘 버튼, 메뉴 타일, 재화 칩, 장면 헤더 추가
- 로비의 캐릭터·출석·이벤트·일일 퀘스트·전투 시작·8개 메뉴 구조 재설계
- 전투 하단 컨트롤 도크와 안내 문구 추가
- 스테이지·결과·인벤토리·운영·계정 화면에 공통 시각 체계 적용
- 구형 v2 Obsidian UI 2개 파일을 v1.9.0 런타임 아카이브로 이동
- App Check 비활성화, Firebase Auth/Firestore/Analytics 유지

## 적용 기준

v1.8.1 프로젝트에 패치를 덮어쓴 뒤 `npm run asset:relocate`를 실행한다. 이동 스크립트는 기존 v2 UI를 삭제하지 않고 `art_source/runtime_archive/v1.9.0`으로 보존한다.

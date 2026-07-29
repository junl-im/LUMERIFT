# INTERFACE_RENEWAL_v1.11.10

## 목표
- 전 화면 공통 인상을 더 웹툰형·세련된 톤으로 정리
- 너무 밋밋한 패널 인상을 줄이고 강조 카드/코믹 태그/잉크 라인으로 시선 흐름을 명확화
- 기존 9:16 모바일 구조와 48px 터치 규칙은 유지

## 적용 사항
1. `InterfaceChrome`에 `createFeatureMarquee`와 `createComicTag` 추가
2. `SceneChrome` 상단 헤더에 LIVE RENEWAL 태그와 WEBTOON CLEAN 피처 카드 추가
3. `UiTheme` 타일에 리본/베벨 라인 추가
4. `LobbyScene`에 리뉴얼 브리핑 카드와 스타일 업 태그 추가
5. `AssetGalleryScene`에 production-line 안내와 룩 가이드 추가

## 원칙
- 새 리뉴얼은 PNG/WebP 런타임 정책을 유지한다.
- 장식 그래픽은 가능한 한 프로그램 렌더링으로 처리한다.
- 과도한 애니메이션보다 가독성과 터치 사용성을 우선한다.

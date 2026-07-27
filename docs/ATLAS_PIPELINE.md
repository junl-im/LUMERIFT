# 임시 PNG/WebP Atlas 파이프라인

이 폴더는 최종 아트가 아닌 파이프라인 검증용 샘플이다.

## 구성

- `tools/atlas-source/sample_actor_source.png`: 투명 PNG 마스터 예시
- `public/assets/sample-atlas/sample_actor.webp`: 게임 배포용 WebP Atlas
- `public/assets/sample-atlas/sample_actor.json`: PixiJS 호환 프레임 메타데이터
- `scripts/validate-atlas.mjs`: 이미지 파일, 프레임 좌표, PNG/WebP 정책 검사

## 실제 에셋 교체 순서

1. PSD 원본에서 PNG 마스터 출력
2. 투명 경계와 프레임 크기 정리
3. WebP 무손실 또는 고품질 변환
4. 기능·지역 단위 Atlas 패킹
5. JSON 메타데이터 생성
6. `npm run validate:atlas`
7. 모바일 실기기에서 축소 가독성과 메모리 확인

SVG, JPG, GIF는 게임 에셋으로 사용할 수 없다.

## v0.6.0 자동 검사

`npm run validate:atlas`는 다음을 검사한다.

- 모든 Atlas JSON의 이미지 파일 존재
- PNG/WebP 형식
- 프레임 좌표와 Atlas 경계
- 애니메이션 프레임 참조
- 플레이어 10상태 × 8방향 필수 키
- 몬스터 3등급 × 6상태 필수 키
- UI 필수 NineSlice 프레임

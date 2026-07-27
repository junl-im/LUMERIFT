# v0.9.0 에셋 제작 파이프라인

```text
절차형 콘셉트 생성
→ 고해상도 PNG 합성 마스터
→ 아트 디렉션 검수 후보
→ 720/512/384/192/128 런타임 크기 변환
→ WebP 고품질 인코딩
→ 카테고리별 Atlas 분할
→ JSON 프레임·애니메이션 메타데이터
→ Lazy Loading 번들 등록
→ 자동 좌표·포맷·용량·품질 단계 검사
→ 모바일 실기기 검수
→ 수작업 리터칭 후 final-candidate 승격
```

## 디렉터리

- `art_source/v0.9.0`: 보관용 PNG 합성 마스터
- `public/assets/atlases/quality`: 아이콘·초상·환경·VFX·UI Atlas
- `public/assets/loading/quality`: 세로형 지역 키아트
- `public/assets/maps/quality`: 세로형 전투 배경
- `public/assets/QUALITYPACK_V090_SUMMARY.json`: 기계 판독 인벤토리

## 배포 제한

`art_source`는 Vite public 폴더 밖에 있으므로 GitHub Pages 배포 결과에 포함되지 않는다. 전체 소스 ZIP과 패치 ZIP에는 후속 제작을 위해 포함한다.

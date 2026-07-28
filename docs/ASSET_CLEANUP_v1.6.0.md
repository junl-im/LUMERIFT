# LUMERIFT v1.6.0 추가 에셋 정리 보고서

## 목적

전체 통합본의 원본·라이선스·레거시 자산은 보존하면서 GitHub Pages의 `public`에는 현재 게임에서 실제로 사용하는 자산만 남긴다.

## 정리 전

- `public/assets`: 209개 실파일과 4개 빈 자리표시 파일, 약 23.60MB
- 활성 매니페스트 자산: 약 3.89MB
- 구버전·품질 후보·미사용 지역 자산이 GitHub Pages 배포에 함께 포함됨
- 전체 통합본 보존과 웹 배포 대상이 같은 폴더에 섞여 있었음

## 정리 후

- `public/assets`: 27개, 3.90MB
- 활성 Atlas: 6개, 412프레임, 151애니메이션
- `art_source/runtime_archive/v1.6.0/public/assets`: 182개, 19.70MB
- 보관 Atlas: 43개, 2,794프레임, 300애니메이션
- 전체 보존 합계: 49 Atlas, 3,206프레임, 451애니메이션
- 제거된 빈 `.gitkeep`: 4개

## 이동 대상

| 분류 | 파일 | 용량 | 처리 |
|---|---:|---:|---|
| 구버전·품질 후보 Atlas | 78 | 11.69MB | 보관소 이동 |
| v1 구버전 라이브 아트 | 10 | 4.25MB | 보관소 이동, 라이선스는 public 유지 |
| 미사용 지역 맵 | 31 | 2.19MB | 보관소 이동 |
| 미사용 로딩 키아트 | 18 | 1.33MB | 보관소 이동 |
| 미사용 UI·전투·환경 음원 | 36 | 0.18MB | 보관소 이동 |
| 브랜드·샘플·요약 파일 | 9 | 0.04MB | 보관소 이동 |

## 현재 public에 남기는 기준

- `ASSET_MANIFEST.json`의 번들 파일
- 실사용 아트·운영 UI 검증 요약
- v2 UI·플레이어·몬스터·배경·초상
- v3 운영 UI Atlas
- 현재 전투 VFX·장비 아이콘·효과음·BGM
- CC BY·CC BY-SA 배포 고지에 필요한 라이선스 파일

## 자동화

- `npm run asset:registry`: 자산 해시·크기·분류 레지스트리 재생성
- `npm run asset:relocate`: v1.5.0의 보관 전용 public 자산을 보관소로 이동
- `npm run validate:asset-cleanup`: public 잔존·해시·참조·6MB 예산 검사
- `npm run report:asset-cleanup`: 활성/보관/원본 용량 보고

## 복원 가능성

모든 이동 파일은 원래 public 상대 경로, 새 보관 경로, 바이트, SHA-256을 `asset_registry/RELOCATION_PLAN_v1.6.0.json`에 기록한다. 향후 실제 콘텐츠에 재사용할 때 검수 후 새 런타임 경로로 복원한다.

## 품질 판정

이번 작업은 그래픽 품질을 높인 업데이트가 아니라 자산 수명주기와 배포 구조를 정리한 업데이트다. 기존 `production-candidate-open-art-pass` 품질 단계는 변경하지 않는다.

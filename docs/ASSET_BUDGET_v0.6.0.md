# v0.6.0 에셋 예산 보고

## 현재 제작 기준 리소스

- 플레이어 Atlas JSON/WebP: 약 157KB
- 몬스터 Atlas JSON/WebP: 약 49KB
- UI Atlas JSON/WebP: 약 8KB
- Chapter 1 배경 WebP: 약 32KB
- OGG/Opus 오디오: 약 45KB

## 초기 로딩 추정 입력

UI Atlas, UI 효과음, TypeScript 소스 기준 약 273KB다. 실제 배포 크기는 Vite 빌드 결과와 압축 전송을 기준으로 다시 측정한다.

## 15MB 정책

- UI와 로그인·로비에 필요한 최소 리소스만 초기 번들에 포함
- 플레이어·몬스터·맵·전투 BGM은 스테이지 진입 시 로드
- 스테이지 종료 시 전투 번들 해제
- 신규 지역은 별도 번들로 분리

# LUMERIFT: 균열의 계승자 v1.2.0

Vite + TypeScript + PixiJS 8 + Firebase 기반 세로형 모바일 웹 액션 RPG입니다.

## v1.2.0 핵심 변경

### UI·그래픽 전면 점검

기존 화면은 기능은 동작했지만 대시보드형 패널 반복, 과도한 네온 테두리, 서로 다른 화풍의 배경·캐릭터·UI 충돌이 있었습니다. v1.2.0은 기능 추가보다 시각 구조를 먼저 재정비했습니다.

- 공통 Obsidian·Gold·Teal 디자인 시스템
- 로비 정보 계층과 하단 탐색 재구성
- 전투 HUD 압축 및 HP 게이지 좌표 정합성 수정
- 인벤토리 3×4 아이템 그리드
- 일반·정예·보스·잠금 스테이지 노드
- 결과 등급·통계·보상 중심 재배치
- 플레이어·몬스터 Atlas 공통 대비·윤곽 보정
- 로비·전투 배경과 초상 v2 색감 통일
- 5개 주요 화면 미리보기와 자동 시각 계약 검사

세부 판정은 `docs/VISUAL_AUDIT_v1.2.0.md`를 확인합니다.

## 현재 품질 단계

`production-candidate-open-art-pass`

UI 구조와 명암 체계는 크게 개선됐지만, 캐릭터와 몬스터가 LUMERIFT 전용 독점 원화는 아니므로 `final-approved`로 기록하지 않습니다.

## 전체 패키지 정책

- FULL ZIP: 코드·문서·런타임 자산·모바일 제작용 원본·라이선스·레거시 보관 자산 포함
- 경량본은 필요할 때만 RUNTIME 또는 DEPLOY 이름으로 별도 제공
- 용량 보고는 십진 단위 MB 사용
- 초기 다운로드 15MB 목표는 전체 프로젝트 용량이 아니라 최초 로드 번들 기준

## BAT 파일

- `INSTALL_AND_START.bat`와 `VERIFY.bat`는 Windows 편의용 선택 도구입니다.
- npm 명령과 GitHub Actions가 공식 기준이며 BAT 파일이 없어도 빌드·검증·배포할 수 있습니다.

## 실행

```bash
npm install
npm run verify
npm run dev
```

Firebase가 없어도 로컬 게스트 모드로 실행됩니다.

## 주요 검증

```bash
npm run validate:ui
npm run validate:liveart
npm run validate:sourceart
npm run validate:archive
npm run validate:handoff
npm run verify
```

## 작업자 인수인계

1. `AGENTS.md`
2. `docs/HANDOFF_MASTER.md`
3. `HANDOFF_STATE.json`
4. `docs/HANDOFF_LOG.md`
5. `docs/MASTER_BIBLE.md`

# LUMERIFT v1.0.3 패치 노트

## 목적

v1.0.2에서 전체 통합본으로 잘못 제외된 원본·보관 자산을 모두 복원한다.

## 복원 항목

- `art_source` 고해상도 원본과 공개 원본 79개
- v0.8 메가팩 보관 자산
- v0.9 품질 후보 Atlas·배경·키아트·음원
- 에셋 생성·가공 보조 도구

## 유지 항목

- v1.0.2 TypeScript TS6133 수정
- Vite 8 함수형 manualChunks
- Node.js 24 CI
- 기본 live/v1 런타임 아트

## 패키지 규칙

전체 통합 ZIP은 모든 원본과 보관 자산을 포함한다. 경량본은 별도 RUNTIME/DEPLOY 패키지로만 제공한다.

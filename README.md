# LUMERIFT: 균열의 계승자 v1.10.1

모바일 웹 우선 세로형 2.5D 액션 RPG. Vite + TypeScript + PixiJS 8 + Firebase 기반이며 GitHub Pages에 배포한다.

공개 주소: https://junl-im.github.io/LUMERIFT/

## v1.10.1 물리 단말 계측 기반·접근성 보강

- 평균 FPS·1% Low·긴 프레임·뷰포트·렌더 상태를 실제 기기에서 JSON으로 저장
- 지속적인 프레임 저하에 따라 `full / balanced / safe` 자동 품질 제한 적용
- AUTO 모드에서 resolution·파티클 품질·30/60FPS를 보수적으로 단계 조정
- 표준·색상 보조·고대비 전투 팔레트와 `♥ / ▲ / ◆` 상태 기호 추가
- 큰 HUD와 카메라 연출 완화 설정 추가
- 현재 저장·최대 5개 복구 지점·28일 시즌 요약 JSON 내보내기/가져오기
- UID 불일치 가져오기 차단과 JSON 복원 전 자동 안전 백업
- LUMERIFT 전용 플레이어 8방향 실루엣 블록아웃 원본 추가
- Firebase App Check 비활성화와 v1.8 AttackFootprint 판정 유지

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run validate:mobile:v110
npm run validate:mobile:v111
npm run validate:handoff
npm run verify
```

## 패치 적용

v1.10.0 프로젝트 최상위에 패치 ZIP의 내용을 덮어쓴다. 삭제 또는 자산 이동 대상은 없다.

```bash
npm install
npm run verify
```

## 핵심 문서

- `AGENTS.md`
- `HANDOFF_STATE.json`
- `docs/HANDOFF_MASTER.md`
- `docs/MOBILE_DEVICE_QA_v1.10.1.md`
- `docs/ACCESSIBILITY_v1.10.1.md`
- `docs/RECOVERY_ARCHIVE_v1.10.1.md`
- `docs/PLAYER_SILHOUETTE_v1.10.1.md`
- `docs/PATCH_NOTES_v1.10.1.md`

`docs/previews/v1.10.1_player_silhouette_contact.webp`는 제작 블록아웃 접촉 시트이며 실제 런타임 또는 물리 단말 캡처가 아니다. 실제 Android·iOS 기기의 FPS·표면 온도·GPU 메모리 최종 승인은 기기 QA JSON과 수동 계측이 필요하다.

BAT 파일은 Windows 편의용 선택 도구이며 npm 명령과 GitHub Actions가 공식 기준이다.

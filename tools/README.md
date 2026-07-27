# Asset tools

`generate_runtime_assets.py`는 v0.7.0 제작 기준 WebP 캐릭터·몬스터·UI·VFX·장비 Atlas, Chapter 1 배경과 테스트용 OGG/Opus 음원을 재생성한다.

필요 도구:

- Python 3
- Pillow
- ffmpeg: 오디오를 다시 만들 때만 필요

실행:

```bash
python tools/generate_runtime_assets.py
npm run validate:assets
npm run validate:atlas
npm run validate:manifest
```

생성 이미지는 런타임 규격 검증용이며 최종 상용 아트가 아니다.

## v0.8.0 메가팩 재생성

```bash
python tools/generate_asset_megapack_v080.py
```

이 스크립트는 아이템, 스킬, 상태, UI, 도감, NPC, 환경, VFX, 문장, 튜토리얼, 지역 배경, 로딩 키아트, 브랜드, 오디오를 재생성한다. 생성 후 반드시 아래를 실행한다.

```bash
npm run validate:assets
npm run validate:atlas
npm run validate:manifest
npm run report:inventory
```

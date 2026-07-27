# Release Packaging Policy

모든 향후 버전은 다음 두 파일을 함께 제공한다.

## 전체 통합 ZIP

- 현재 버전의 모든 코드, 문서, 설정을 포함한다.
- 새로 설치하거나 전체 교체할 때 사용한다.
- ZIP 내부 최상위 폴더명은 `lumerift`로 고정한다.

예시:

```text
LUMERIFT_FULL_v0.7.0.zip
└─ lumerift/
```

## 덮어쓰기용 패치 ZIP

- 기준 배포 버전 이후 변경·추가된 파일만 포함한다.
- 기존 프로젝트 루트에서 압축을 풀어 덮어쓴다.
- ZIP에는 별도의 상위 폴더를 넣지 않는다.
- 삭제가 필요한 파일은 `PATCH_DELETE_LIST.txt`에 기록한다.
- 사용자가 중간 버전을 받지 않은 경우 마지막으로 전달된 버전부터 최신 버전까지 누적 패치를 제공한다.

예시:

```text
LUMERIFT_PATCH_v0.1.0_to_v0.7.0.zip
├─ src/
├─ docs/
├─ package.json
├─ PATCH_MANIFEST.json
├─ PATCH_DELETE_LIST.txt
└─ PATCH_README.txt
```

## 패치 검증

릴리스 전 다음을 확인한다.

1. 기준 버전 복사본에 패치를 덮어쓴다.
2. `PATCH_DELETE_LIST.txt`의 파일을 제거한다.
3. 패치 메타 파일을 제외한다.
4. 패치 적용 결과와 전체 통합본을 파일 단위로 비교한다.
5. 두 ZIP 모두 압축 무결성 검사를 통과해야 한다.

## 결과 보고 순서

1. 결과
2. 전체 통합 ZIP
3. 덮어쓰기용 패치 ZIP
4. 다음 업데이트 내용

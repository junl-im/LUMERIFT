import type { VerifiedCharacterCaptureFile } from '../performance/CharacterDisplayCalibrationStore';

export interface CharacterCaptureEvidencePackage {
  readonly jsonValue: unknown;
  readonly verifiedFiles: readonly VerifiedCharacterCaptureFile[];
}


export function openCharacterCaptureFiles(): Promise<readonly VerifiedCharacterCaptureFile[] | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp';
    input.style.display = 'none';
    document.body.appendChild(input);
    const cleanup = (): void => input.remove();
    input.addEventListener('change', async () => {
      const selected = Array.from(input.files ?? []).filter(isImageFile);
      if (selected.length === 0) {
        cleanup();
        resolve(null);
        return;
      }
      if (selected.length < 2) {
        cleanup();
        reject(new Error('실제 캡처 이미지 2개 이상을 선택하세요.'));
        return;
      }
      try {
        const verified = await Promise.all(selected.map(verifyCaptureFile));
        cleanup();
        resolve(verified);
      } catch (error: unknown) {
        cleanup();
        reject(error instanceof Error ? error : new Error('캡처 파일 SHA-256 생성에 실패했습니다.'));
      }
    }, { once: true });
    input.addEventListener('cancel', () => {
      cleanup();
      resolve(null);
    }, { once: true });
    input.click();
  });
}

export function openCharacterCaptureEvidencePackage(): Promise<CharacterCaptureEvidencePackage | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'application/json,.json,image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp';
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = (): void => input.remove();
    input.addEventListener('change', async () => {
      const selected = Array.from(input.files ?? []);
      if (selected.length === 0) {
        cleanup();
        resolve(null);
        return;
      }
      try {
        const jsonFiles = selected.filter(isJsonFile);
        const imageFiles = selected.filter(isImageFile);
        if (jsonFiles.length !== 1) throw new Error('승인 JSON 파일을 정확히 1개 선택하세요.');
        if (imageFiles.length < 2) throw new Error('승인 JSON과 함께 실제 캡처 이미지 2개 이상을 선택하세요.');
        const jsonFile = jsonFiles[0];
        if (!jsonFile) throw new Error('승인 JSON 파일을 찾지 못했습니다.');
        const jsonValue = JSON.parse(await jsonFile.text()) as unknown;
        const verifiedFiles = await Promise.all(imageFiles.map(verifyCaptureFile));
        cleanup();
        resolve({ jsonValue, verifiedFiles });
      } catch (error: unknown) {
        cleanup();
        reject(error instanceof Error ? error : new Error('캡처 증빙 패키지를 검증하지 못했습니다.'));
      }
    }, { once: true });
    input.addEventListener('cancel', () => {
      cleanup();
      resolve(null);
    }, { once: true });
    input.click();
  });
}

async function verifyCaptureFile(file: File): Promise<VerifiedCharacterCaptureFile> {
  if (!globalThis.crypto?.subtle) throw new Error('이 브라우저는 SHA-256 파일 검증을 지원하지 않습니다.');
  const bytes = await file.arrayBuffer();
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const sha256 = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
  const dimensions = await readImageDimensions(file);
  return {
    fileName: file.name,
    sha256,
    bytes: file.size,
    widthPx: dimensions.width,
    heightPx: dimensions.height,
  };
}

async function readImageDimensions(file: File): Promise<{ readonly width: number; readonly height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dimensions);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} 이미지 크기를 읽지 못했습니다.`));
    };
    image.src = url;
  });
}

function isJsonFile(file: File): boolean {
  return file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
}

function isImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/.test(name);
}

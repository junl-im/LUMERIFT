export function downloadJson(filename: string, value: unknown): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return;
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sanitizeFilename(filename);
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function openJsonFile(): Promise<unknown | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = (): void => input.remove();
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) {
        cleanup();
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as unknown;
        cleanup();
        resolve(parsed);
      } catch (error: unknown) {
        cleanup();
        reject(error instanceof Error ? error : new Error('JSON 파일을 읽지 못했습니다.'));
      }
    }, { once: true });
    input.addEventListener('cancel', () => {
      cleanup();
      resolve(null);
    }, { once: true });
    input.click();
  });
}

function sanitizeFilename(value: string): string {
  const cleaned = value.replace(/[\\/:*?"<>|]+/g, '_').trim();
  return cleaned.endsWith('.json') ? cleaned : `${cleaned || 'lumerift-data'}.json`;
}

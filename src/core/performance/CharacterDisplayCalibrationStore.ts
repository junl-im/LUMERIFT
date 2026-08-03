import { STORAGE_KEYS } from '../../app/brand';
import type { CharacterDisplayCalibration, CharacterDisplayPlatform } from './CharacterDisplayCalibration';

export type PhysicalCapturePlatform = Extract<CharacterDisplayPlatform, 'android-chrome' | 'ios-safari'>;

export interface CharacterCaptureScreenshotEvidence {
  readonly fileName: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly widthPx: number;
  readonly heightPx: number;
}

export interface VerifiedCharacterCaptureFile extends CharacterCaptureScreenshotEvidence {}

export interface CharacterDisplayCaptureEvidence {
  readonly schema: 'lumerift-character-display-capture-v2';
  readonly platform: PhysicalCapturePlatform;
  readonly approved: true;
  readonly reviewer: string;
  readonly capturedAt: string;
  readonly viewportCss: { readonly width: number; readonly height: number };
  readonly devicePixelRatio: number;
  readonly screenshots: readonly CharacterCaptureScreenshotEvidence[];
  readonly integrity: {
    readonly algorithm: 'SHA-256';
    readonly verifiedAt: string;
    readonly fileCount: number;
  };
  readonly notes: string;
  readonly calibration: {
    readonly studioScale: number;
    readonly battleScale: number;
    readonly auraMultiplier: number;
    readonly overlayMultiplier: number;
  };
}

export type CharacterDisplayCaptureTemplate = Omit<CharacterDisplayCaptureEvidence, 'approved' | 'integrity'> & {
  readonly approved: false;
};

interface CharacterDisplayCaptureState {
  readonly schemaVersion: 2;
  readonly approvals: Partial<Record<PhysicalCapturePlatform, CharacterDisplayCaptureEvidence>>;
}

const EMPTY_STATE: CharacterDisplayCaptureState = { schemaVersion: 2, approvals: {} };
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export function createCharacterDisplayCaptureTemplate(
  platform: PhysicalCapturePlatform,
  profile: CharacterDisplayCalibration,
): CharacterDisplayCaptureTemplate {
  const viewportCss = platform === 'android-chrome'
    ? { width: 412, height: 915 }
    : { width: 390, height: 844 };
  return {
    schema: 'lumerift-character-display-capture-v2',
    platform,
    approved: false,
    reviewer: '',
    capturedAt: new Date().toISOString(),
    viewportCss,
    devicePixelRatio: platform === 'android-chrome' ? 2.625 : 3,
    screenshots: [
      { fileName: 'studio-before.png', sha256: '', bytes: 0, widthPx: 0, heightPx: 0 },
      { fileName: 'battle-before.png', sha256: '', bytes: 0, widthPx: 0, heightPx: 0 },
    ],
    notes: '실제 캡처 파일을 함께 선택해 SHA-256을 검증한 뒤 approved=true와 검토 정보를 입력하세요.',
    calibration: {
      studioScale: profile.studioScale,
      battleScale: profile.battleScale,
      auraMultiplier: profile.auraMultiplier,
      overlayMultiplier: profile.overlayMultiplier,
    },
  };
}

export function importCharacterDisplayCaptureEvidence(
  value: unknown,
  verifiedFiles: readonly VerifiedCharacterCaptureFile[],
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage(),
): CharacterDisplayCaptureEvidence | undefined {
  const evidence = parseIncomingEvidence(value, verifiedFiles);
  if (!evidence) return undefined;
  const state = loadState(storage?.getItem(STORAGE_KEYS.characterDisplayCalibration));
  const next: CharacterDisplayCaptureState = {
    schemaVersion: 2,
    approvals: { ...state.approvals, [evidence.platform]: evidence },
  };
  storage?.setItem(STORAGE_KEYS.characterDisplayCalibration, JSON.stringify(next));
  return evidence;
}

export function loadCharacterDisplayCaptureEvidence(
  platform: PhysicalCapturePlatform,
  storage: Pick<Storage, 'getItem'> | undefined = getStorage(),
): CharacterDisplayCaptureEvidence | undefined {
  return loadState(storage?.getItem(STORAGE_KEYS.characterDisplayCalibration)).approvals[platform];
}

export function clearCharacterDisplayCaptureEvidence(
  platform: PhysicalCapturePlatform,
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage(),
): void {
  const state = loadState(storage?.getItem(STORAGE_KEYS.characterDisplayCalibration));
  const approvals = { ...state.approvals };
  delete approvals[platform];
  storage?.setItem(STORAGE_KEYS.characterDisplayCalibration, JSON.stringify({ schemaVersion: 2, approvals }));
}

export function captureEvidenceToCalibration(
  evidence: CharacterDisplayCaptureEvidence,
  baseline: CharacterDisplayCalibration,
): CharacterDisplayCalibration {
  return {
    ...baseline,
    ...evidence.calibration,
    captureStatus: 'capture-verified',
    baseline: `${evidence.viewportCss.width}x${evidence.viewportCss.height} CSS px · DPR ${evidence.devicePixelRatio} · SHA-256 ${evidence.screenshots.length}개 · ${evidence.reviewer} 승인`,
  };
}

function parseIncomingEvidence(
  value: unknown,
  verifiedFiles: readonly VerifiedCharacterCaptureFile[],
): CharacterDisplayCaptureEvidence | undefined {
  const record = parseCommonEvidence(value);
  if (!record) return undefined;
  if (verifiedFiles.length < 2 || !screenshotsMatchFiles(record.screenshots, verifiedFiles)) return undefined;
  return {
    ...record,
    integrity: {
      algorithm: 'SHA-256',
      verifiedAt: new Date().toISOString(),
      fileCount: verifiedFiles.length,
    },
  };
}

function parseStoredEvidence(value: unknown): CharacterDisplayCaptureEvidence | undefined {
  const record = parseCommonEvidence(value);
  if (!record || !value || typeof value !== 'object') return undefined;
  const integrity = (value as Partial<CharacterDisplayCaptureEvidence>).integrity;
  if (!integrity || integrity.algorithm !== 'SHA-256') return undefined;
  if (typeof integrity.verifiedAt !== 'string' || Number.isNaN(Date.parse(integrity.verifiedAt))) return undefined;
  if (!Number.isInteger(integrity.fileCount) || integrity.fileCount !== record.screenshots.length) return undefined;
  return {
    ...record,
    integrity: {
      algorithm: 'SHA-256',
      verifiedAt: new Date(integrity.verifiedAt).toISOString(),
      fileCount: integrity.fileCount,
    },
  };
}

function parseCommonEvidence(
  value: unknown,
): Omit<CharacterDisplayCaptureEvidence, 'integrity'> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterDisplayCaptureEvidence>;
  if (record.schema !== 'lumerift-character-display-capture-v2') return undefined;
  if (record.platform !== 'android-chrome' && record.platform !== 'ios-safari') return undefined;
  if (record.approved !== true) return undefined;
  if (typeof record.reviewer !== 'string' || record.reviewer.trim().length < 2) return undefined;
  if (typeof record.capturedAt !== 'string' || Number.isNaN(Date.parse(record.capturedAt))) return undefined;
  if (!record.viewportCss || !isFiniteNumber(record.viewportCss.width) || !isFiniteNumber(record.viewportCss.height)) return undefined;
  if (record.viewportCss.width < 280 || record.viewportCss.width > 900 || record.viewportCss.height < 500 || record.viewportCss.height > 1600) return undefined;
  if (!isFiniteNumber(record.devicePixelRatio) || record.devicePixelRatio < 1 || record.devicePixelRatio > 5) return undefined;
  const screenshots = parseScreenshots(record.screenshots);
  if (!screenshots) return undefined;
  const calibration = record.calibration;
  if (!calibration) return undefined;
  if (!inRange(calibration.studioScale, 0.75, 1.15)) return undefined;
  if (!inRange(calibration.battleScale, 0.75, 1.15)) return undefined;
  if (!inRange(calibration.auraMultiplier, 0.5, 1.2)) return undefined;
  if (!inRange(calibration.overlayMultiplier, 0.5, 1.2)) return undefined;
  return {
    schema: 'lumerift-character-display-capture-v2',
    platform: record.platform,
    approved: true,
    reviewer: record.reviewer.trim().slice(0, 40),
    capturedAt: new Date(record.capturedAt).toISOString(),
    viewportCss: {
      width: Math.round(record.viewportCss.width),
      height: Math.round(record.viewportCss.height),
    },
    devicePixelRatio: Number(record.devicePixelRatio.toFixed(3)),
    screenshots,
    notes: typeof record.notes === 'string' ? record.notes.trim().slice(0, 500) : '',
    calibration: {
      studioScale: Number(calibration.studioScale.toFixed(3)),
      battleScale: Number(calibration.battleScale.toFixed(3)),
      auraMultiplier: Number(calibration.auraMultiplier.toFixed(3)),
      overlayMultiplier: Number(calibration.overlayMultiplier.toFixed(3)),
    },
  };
}

function parseScreenshots(value: unknown): readonly CharacterCaptureScreenshotEvidence[] | undefined {
  if (!Array.isArray(value) || value.length < 2 || value.length > 8) return undefined;
  const result: CharacterCaptureScreenshotEvidence[] = [];
  const names = new Set<string>();
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return undefined;
    const record = entry as Partial<CharacterCaptureScreenshotEvidence>;
    const fileName = typeof record.fileName === 'string' ? record.fileName.trim().slice(0, 120) : '';
    const sha256 = typeof record.sha256 === 'string' ? record.sha256.trim().toLowerCase() : '';
    if (!fileName || names.has(fileName.toLowerCase()) || !SHA256_PATTERN.test(sha256)) return undefined;
    if (!Number.isInteger(record.bytes) || (record.bytes ?? 0) < 1024 || (record.bytes ?? 0) > 40_000_000) return undefined;
    if (!Number.isInteger(record.widthPx) || !Number.isInteger(record.heightPx)) return undefined;
    if ((record.widthPx ?? 0) < 320 || (record.widthPx ?? 0) > 5000 || (record.heightPx ?? 0) < 500 || (record.heightPx ?? 0) > 8000) return undefined;
    names.add(fileName.toLowerCase());
    result.push({
      fileName,
      sha256,
      bytes: record.bytes as number,
      widthPx: record.widthPx as number,
      heightPx: record.heightPx as number,
    });
  }
  return result;
}

function screenshotsMatchFiles(
  screenshots: readonly CharacterCaptureScreenshotEvidence[],
  files: readonly VerifiedCharacterCaptureFile[],
): boolean {
  if (screenshots.length !== files.length) return false;
  const byName = new Map(files.map((file) => [file.fileName.toLowerCase(), file]));
  return screenshots.every((screenshot) => {
    const file = byName.get(screenshot.fileName.toLowerCase());
    return Boolean(file)
      && file?.sha256.toLowerCase() === screenshot.sha256
      && file.bytes === screenshot.bytes
      && file.widthPx === screenshot.widthPx
      && file.heightPx === screenshot.heightPx;
  });
}

function loadState(raw: string | null | undefined): CharacterDisplayCaptureState {
  if (!raw) return EMPTY_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<CharacterDisplayCaptureState>;
    if (parsed.schemaVersion !== 2 || !parsed.approvals || typeof parsed.approvals !== 'object') return EMPTY_STATE;
    const android = parseStoredEvidence(parsed.approvals['android-chrome']);
    const ios = parseStoredEvidence(parsed.approvals['ios-safari']);
    return {
      schemaVersion: 2,
      approvals: {
        ...(android ? { 'android-chrome': android } : {}),
        ...(ios ? { 'ios-safari': ios } : {}),
      },
    };
  } catch {
    return EMPTY_STATE;
  }
}

function inRange(value: unknown, minimum: number, maximum: number): value is number {
  return isFiniteNumber(value) && value >= minimum && value <= maximum;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

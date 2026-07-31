import { STORAGE_KEYS } from '../../app/brand';
import type { CharacterDisplayCalibration, CharacterDisplayPlatform } from './CharacterDisplayCalibration';

export type PhysicalCapturePlatform = Extract<CharacterDisplayPlatform, 'android-chrome' | 'ios-safari'>;

export interface CharacterDisplayCaptureEvidence {
  readonly schema: 'lumerift-character-display-capture-v1';
  readonly platform: PhysicalCapturePlatform;
  readonly approved: true;
  readonly reviewer: string;
  readonly capturedAt: string;
  readonly viewportCss: { readonly width: number; readonly height: number };
  readonly devicePixelRatio: number;
  readonly screenshotRefs: readonly string[];
  readonly notes: string;
  readonly calibration: {
    readonly studioScale: number;
    readonly battleScale: number;
    readonly auraMultiplier: number;
    readonly overlayMultiplier: number;
  };
}

interface CharacterDisplayCaptureState {
  readonly schemaVersion: 1;
  readonly approvals: Partial<Record<PhysicalCapturePlatform, CharacterDisplayCaptureEvidence>>;
}

const EMPTY_STATE: CharacterDisplayCaptureState = { schemaVersion: 1, approvals: {} };

export function createCharacterDisplayCaptureTemplate(
  platform: PhysicalCapturePlatform,
  profile: CharacterDisplayCalibration,
): Omit<CharacterDisplayCaptureEvidence, 'approved'> & { readonly approved: false } {
  const viewportCss = platform === 'android-chrome'
    ? { width: 412, height: 915 }
    : { width: 390, height: 844 };
  return {
    schema: 'lumerift-character-display-capture-v1',
    platform,
    approved: false,
    reviewer: '',
    capturedAt: new Date().toISOString(),
    viewportCss,
    devicePixelRatio: platform === 'android-chrome' ? 2.625 : 3,
    screenshotRefs: ['studio-before.png', 'battle-before.png'],
    notes: '실제 물리 단말 캡처를 비교한 뒤 approved=true, reviewer, screenshotRefs와 보정값을 입력하세요.',
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
  storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage(),
): CharacterDisplayCaptureEvidence | undefined {
  const evidence = parseEvidence(value);
  if (!evidence) return undefined;
  const state = loadState(storage?.getItem(STORAGE_KEYS.characterDisplayCalibration));
  const next: CharacterDisplayCaptureState = {
    schemaVersion: 1,
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
  storage?.setItem(STORAGE_KEYS.characterDisplayCalibration, JSON.stringify({ schemaVersion: 1, approvals }));
}

export function captureEvidenceToCalibration(
  evidence: CharacterDisplayCaptureEvidence,
  baseline: CharacterDisplayCalibration,
): CharacterDisplayCalibration {
  return {
    ...baseline,
    ...evidence.calibration,
    captureStatus: 'capture-verified',
    baseline: `${evidence.viewportCss.width}x${evidence.viewportCss.height} CSS px · DPR ${evidence.devicePixelRatio} · ${evidence.reviewer} 승인`,
  };
}

function parseEvidence(value: unknown): CharacterDisplayCaptureEvidence | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterDisplayCaptureEvidence>;
  if (record.schema !== 'lumerift-character-display-capture-v1') return undefined;
  if (record.platform !== 'android-chrome' && record.platform !== 'ios-safari') return undefined;
  if (record.approved !== true) return undefined;
  if (typeof record.reviewer !== 'string' || record.reviewer.trim().length < 2) return undefined;
  if (typeof record.capturedAt !== 'string' || Number.isNaN(Date.parse(record.capturedAt))) return undefined;
  if (!record.viewportCss || !isFiniteNumber(record.viewportCss.width) || !isFiniteNumber(record.viewportCss.height)) return undefined;
  if (record.viewportCss.width < 280 || record.viewportCss.width > 900 || record.viewportCss.height < 500 || record.viewportCss.height > 1600) return undefined;
  if (!isFiniteNumber(record.devicePixelRatio) || record.devicePixelRatio < 1 || record.devicePixelRatio > 5) return undefined;
  if (!Array.isArray(record.screenshotRefs) || record.screenshotRefs.filter((entry) => typeof entry === 'string' && entry.trim()).length < 2) return undefined;
  const calibration = record.calibration;
  if (!calibration) return undefined;
  if (!inRange(calibration.studioScale, 0.75, 1.15)) return undefined;
  if (!inRange(calibration.battleScale, 0.75, 1.15)) return undefined;
  if (!inRange(calibration.auraMultiplier, 0.5, 1.2)) return undefined;
  if (!inRange(calibration.overlayMultiplier, 0.5, 1.2)) return undefined;
  return {
    schema: 'lumerift-character-display-capture-v1',
    platform: record.platform,
    approved: true,
    reviewer: record.reviewer.trim().slice(0, 40),
    capturedAt: new Date(record.capturedAt).toISOString(),
    viewportCss: {
      width: Math.round(record.viewportCss.width),
      height: Math.round(record.viewportCss.height),
    },
    devicePixelRatio: Number(record.devicePixelRatio.toFixed(3)),
    screenshotRefs: record.screenshotRefs
      .filter((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()))
      .map((entry) => entry.trim().slice(0, 120))
      .slice(0, 8),
    notes: typeof record.notes === 'string' ? record.notes.trim().slice(0, 500) : '',
    calibration: {
      studioScale: Number(calibration.studioScale.toFixed(3)),
      battleScale: Number(calibration.battleScale.toFixed(3)),
      auraMultiplier: Number(calibration.auraMultiplier.toFixed(3)),
      overlayMultiplier: Number(calibration.overlayMultiplier.toFixed(3)),
    },
  };
}

function loadState(raw: string | null | undefined): CharacterDisplayCaptureState {
  if (!raw) return EMPTY_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<CharacterDisplayCaptureState>;
    if (parsed.schemaVersion !== 1 || !parsed.approvals || typeof parsed.approvals !== 'object') return EMPTY_STATE;
    const android = parseEvidence(parsed.approvals['android-chrome']);
    const ios = parseEvidence(parsed.approvals['ios-safari']);
    return {
      schemaVersion: 1,
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

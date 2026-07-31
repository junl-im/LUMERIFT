import { captureEvidenceToCalibration, loadCharacterDisplayCaptureEvidence } from './CharacterDisplayCalibrationStore';

export type CharacterDisplayPlatform = 'android-chrome' | 'ios-safari' | 'generic-mobile' | 'desktop';

export interface CharacterDisplayCalibration {
  readonly platform: CharacterDisplayPlatform;
  readonly label: string;
  readonly studioScale: number;
  readonly battleScale: number;
  readonly auraMultiplier: number;
  readonly overlayMultiplier: number;
  readonly captureStatus: 'pending-physical-capture' | 'capture-verified';
  readonly baseline: string;
}

const PROFILES: Readonly<Record<CharacterDisplayPlatform, CharacterDisplayCalibration>> = {
  'android-chrome': {
    platform: 'android-chrome',
    label: 'Android Chrome',
    studioScale: 0.96,
    battleScale: 0.98,
    auraMultiplier: 0.9,
    overlayMultiplier: 0.92,
    captureStatus: 'pending-physical-capture',
    baseline: '412x915 CSS px · DPR 2.625 QA target',
  },
  'ios-safari': {
    platform: 'ios-safari',
    label: 'iOS Safari',
    studioScale: 0.93,
    battleScale: 0.96,
    auraMultiplier: 0.82,
    overlayMultiplier: 0.86,
    captureStatus: 'pending-physical-capture',
    baseline: '390x844 CSS px · DPR 3 QA target',
  },
  'generic-mobile': {
    platform: 'generic-mobile',
    label: '모바일 공통',
    studioScale: 0.95,
    battleScale: 0.97,
    auraMultiplier: 0.88,
    overlayMultiplier: 0.9,
    captureStatus: 'pending-physical-capture',
    baseline: '9:16 mobile QA target',
  },
  desktop: {
    platform: 'desktop',
    label: 'Desktop',
    studioScale: 1,
    battleScale: 1,
    auraMultiplier: 1,
    overlayMultiplier: 1,
    captureStatus: 'pending-physical-capture',
    baseline: '540x960 design canvas',
  },
};

export function resolveCharacterDisplayCalibration(
  userAgent = browserUserAgent(),
  storage: Pick<Storage, 'getItem'> | undefined = getStorage(),
): CharacterDisplayCalibration {
  const platform = resolveCharacterDisplayPlatform(userAgent);
  const baseline = PROFILES[platform];
  if (platform !== 'android-chrome' && platform !== 'ios-safari') return baseline;
  const evidence = loadCharacterDisplayCaptureEvidence(platform, storage);
  return evidence ? captureEvidenceToCalibration(evidence, baseline) : baseline;
}

export function resolveCharacterDisplayPlatform(userAgent = browserUserAgent()): CharacterDisplayPlatform {
  const normalized = userAgent.toLowerCase();
  const ios = /iphone|ipad|ipod/.test(normalized);
  const android = normalized.includes('android');
  const chrome = /chrome|crios/.test(normalized) && !normalized.includes('edg');
  const safari = normalized.includes('safari') && !normalized.includes('chrome') && !normalized.includes('crios');
  if (ios && safari) return 'ios-safari';
  if (android && chrome) return 'android-chrome';
  if (ios || android || normalized.includes('mobile')) return 'generic-mobile';
  return 'desktop';
}

export function characterCalibrationStatusLabel(profile: CharacterDisplayCalibration): string {
  return profile.captureStatus === 'capture-verified' ? 'CAPTURE VERIFIED' : 'CAPTURE PENDING';
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function browserUserAgent(): string {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent;
}

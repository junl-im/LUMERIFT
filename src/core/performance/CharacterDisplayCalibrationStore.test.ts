import { describe, expect, it } from 'vitest';
import { resolveCharacterDisplayCalibration } from './CharacterDisplayCalibration';
import {
  createCharacterDisplayCaptureTemplate,
  importCharacterDisplayCaptureEvidence,
  loadCharacterDisplayCaptureEvidence,
} from './CharacterDisplayCalibrationStore';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

const androidUa = 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36';

describe('CharacterDisplayCalibrationStore', () => {
  it('rejects an unapproved template and accepts evidence with physical capture references', () => {
    const storage = new MemoryStorage();
    const baseline = resolveCharacterDisplayCalibration(androidUa, storage);
    const template = createCharacterDisplayCaptureTemplate('android-chrome', baseline);
    expect(importCharacterDisplayCaptureEvidence(template, storage)).toBeUndefined();

    const approved = {
      ...template,
      approved: true as const,
      reviewer: 'QA Kim',
      screenshotRefs: ['studio-android.png', 'battle-android.png'],
      calibration: { ...template.calibration, studioScale: 0.94, auraMultiplier: 0.86 },
    };
    expect(importCharacterDisplayCaptureEvidence(approved, storage)?.reviewer).toBe('QA Kim');
    expect(loadCharacterDisplayCaptureEvidence('android-chrome', storage)?.screenshotRefs).toHaveLength(2);
    expect(resolveCharacterDisplayCalibration(androidUa, storage)).toMatchObject({
      captureStatus: 'capture-verified',
      studioScale: 0.94,
      auraMultiplier: 0.86,
    });
  });
});

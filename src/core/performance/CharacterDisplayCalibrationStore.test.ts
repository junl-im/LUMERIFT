import { describe, expect, it } from 'vitest';
import { resolveCharacterDisplayCalibration } from './CharacterDisplayCalibration';
import {
  createCharacterDisplayCaptureTemplate,
  importCharacterDisplayCaptureEvidence,
  loadCharacterDisplayCaptureEvidence,
  type VerifiedCharacterCaptureFile,
} from './CharacterDisplayCalibrationStore';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

const androidUa = 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36';
const screenshots: readonly VerifiedCharacterCaptureFile[] = [
  { fileName: 'studio-android.png', sha256: 'a'.repeat(64), bytes: 240_000, widthPx: 1080, heightPx: 2400 },
  { fileName: 'battle-android.png', sha256: 'b'.repeat(64), bytes: 260_000, widthPx: 1080, heightPx: 2400 },
];

describe('CharacterDisplayCalibrationStore', () => {
  it('requires approved evidence and exact selected-file SHA-256 matches', () => {
    const storage = new MemoryStorage();
    const baseline = resolveCharacterDisplayCalibration(androidUa, storage);
    const template = createCharacterDisplayCaptureTemplate('android-chrome', baseline);
    expect(importCharacterDisplayCaptureEvidence(template, screenshots, storage)).toBeUndefined();

    const approved = {
      ...template,
      approved: true as const,
      reviewer: 'QA Kim',
      screenshots,
      calibration: { ...template.calibration, studioScale: 0.94, auraMultiplier: 0.86 },
    };
    expect(importCharacterDisplayCaptureEvidence(approved, [], storage)).toBeUndefined();
    expect(importCharacterDisplayCaptureEvidence(approved, screenshots, storage)?.reviewer).toBe('QA Kim');
    expect(loadCharacterDisplayCaptureEvidence('android-chrome', storage)?.screenshots).toHaveLength(2);
    expect(resolveCharacterDisplayCalibration(androidUa, storage)).toMatchObject({
      captureStatus: 'capture-verified',
      studioScale: 0.94,
      auraMultiplier: 0.86,
    });
  });

  it('rejects a file whose bytes do not match the approved manifest', () => {
    const storage = new MemoryStorage();
    const baseline = resolveCharacterDisplayCalibration(androidUa, storage);
    const template = createCharacterDisplayCaptureTemplate('android-chrome', baseline);
    const approved = { ...template, approved: true as const, reviewer: 'QA Kim', screenshots };
    const mismatched = [{ ...screenshots[0]!, bytes: 1 }, screenshots[1]!] as const;
    expect(importCharacterDisplayCaptureEvidence(approved, mismatched, storage)).toBeUndefined();
  });
});

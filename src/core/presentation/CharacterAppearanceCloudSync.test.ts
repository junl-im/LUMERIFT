import { describe, expect, it } from 'vitest';
import { CharacterWardrobeController } from './CharacterWardrobeController';
import {
  characterAppearanceArchiveRevision,
  characterAppearanceCloudPath,
  compareCharacterAppearanceRevisions,
  createCharacterAppearanceCloudEnvelope,
  parseCharacterAppearanceCloudEnvelope,
} from './CharacterAppearanceCloudSync';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('CharacterAppearanceCloudSync', () => {
  it('creates a manual opt-in owner-scoped envelope and rejects another uid', () => {
    const wardrobe = new CharacterWardrobeController(new MemoryStorage());
    wardrobe.rememberCurrentPreset('heir-gold', 100);
    const archive = wardrobe.exportPresetArchive(200);
    const envelope = createCharacterAppearanceCloudEnvelope('user-a', archive, 300);
    expect(characterAppearanceCloudPath('user-a')).toBe('users/user-a/settings/characterAppearance');
    expect(envelope.schema).toBe('lumerift-character-appearance-cloud-v2');
    expect(envelope.revision).toBe(characterAppearanceArchiveRevision(archive));
    expect(parseCharacterAppearanceCloudEnvelope(envelope, 'user-a')?.revision).toBe(envelope.revision);
    expect(parseCharacterAppearanceCloudEnvelope(envelope, 'user-b')).toBeUndefined();
  });

  it('detects one-sided changes and true divergence from the last synced revision', () => {
    expect(compareCharacterAppearanceRevisions('appearance-00000001', 'appearance-00000001', 'appearance-00000001')).toBe('identical');
    expect(compareCharacterAppearanceRevisions('appearance-00000002', 'appearance-00000001', 'appearance-00000001')).toBe('local-only-change');
    expect(compareCharacterAppearanceRevisions('appearance-00000001', 'appearance-00000002', 'appearance-00000001')).toBe('remote-only-change');
    expect(compareCharacterAppearanceRevisions('appearance-00000002', 'appearance-00000003', 'appearance-00000001')).toBe('diverged');
    expect(compareCharacterAppearanceRevisions('appearance-00000002', 'appearance-00000003')).toBe('first-sync-conflict');
  });

  it('rejects an envelope whose archive was modified without a matching revision', () => {
    const wardrobe = new CharacterWardrobeController(new MemoryStorage());
    const envelope = createCharacterAppearanceCloudEnvelope('user-a', wardrobe.exportPresetArchive(100), 200);
    const tampered = { ...envelope, archive: { ...envelope.archive, slotOrder: [3, 2, 1] } };
    expect(parseCharacterAppearanceCloudEnvelope(tampered, 'user-a')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { CharacterWardrobeController } from '../../core/presentation/CharacterWardrobeController';
import { createCharacterAppearanceCloudEnvelope, type CharacterAppearanceCloudEnvelope } from '../../core/presentation/CharacterAppearanceCloudSync';
import type { CharacterAppearanceCloudRepository } from '../../repositories/CharacterAppearanceCloudRepository';
import { CharacterAppearanceCloudService } from './CharacterAppearanceCloudService';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

class MemoryCloudRepository implements CharacterAppearanceCloudRepository {
  public readonly available = true;
  public remote?: CharacterAppearanceCloudEnvelope;
  public failSave = false;
  public async load(): Promise<CharacterAppearanceCloudEnvelope | undefined> { return this.remote; }
  public async save(envelope: CharacterAppearanceCloudEnvelope): Promise<void> {
    if (this.failSave) throw new Error('offline');
    this.remote = envelope;
  }
}

describe('CharacterAppearanceCloudService', () => {
  it('requires opt-in and performs a first manual upload', async () => {
    const repository = new MemoryCloudRepository();
    const service = new CharacterAppearanceCloudService(repository, new MemoryStorage());
    const wardrobe = new CharacterWardrobeController(new MemoryStorage());
    expect((await service.sync('user-a', wardrobe.exportPresetArchive(), 10)).status).toBe('opt-in-required');
    service.setOptIn('user-a', true);
    const result = await service.sync('user-a', wardrobe.exportPresetArchive(), 20);
    expect(result.status).toBe('uploaded');
    expect(repository.remote?.ownerUid).toBe('user-a');
  });

  it('stops on divergence and exposes the remote candidate for manual recovery', async () => {
    const repository = new MemoryCloudRepository();
    const service = new CharacterAppearanceCloudService(repository, new MemoryStorage());
    const local = new CharacterWardrobeController(new MemoryStorage());
    service.setOptIn('user-a', true);
    await service.sync('user-a', local.exportPresetArchive(), 100);

    local.rememberCurrentPreset('heir-gold', 200);
    const remoteWardrobe = new CharacterWardrobeController(new MemoryStorage());
    remoteWardrobe.rememberCurrentPreset('rift-azure', 300);
    repository.remote = createCharacterAppearanceCloudEnvelope('user-a', remoteWardrobe.exportPresetArchive(), 400);

    const result = await service.sync('user-a', local.exportPresetArchive(), 500);
    expect(result.status).toBe('conflict');
    expect(service.state('user-a').conflict?.remote.revision).toBe(repository.remote.revision);
  });

  it('keeps a failed upload in a local retry queue', async () => {
    const repository = new MemoryCloudRepository();
    repository.failSave = true;
    const service = new CharacterAppearanceCloudService(repository, new MemoryStorage());
    const wardrobe = new CharacterWardrobeController(new MemoryStorage());
    service.setOptIn('user-a', true);
    const result = await service.upload('user-a', wardrobe.exportPresetArchive(), 100);
    expect(result.status).toBe('queued');
    expect(service.state('user-a').pendingEnvelope?.ownerUid).toBe('user-a');
  });
  it('creates an automatic recovery point before an upload', async () => {
    const repository = new MemoryCloudRepository();
    const service = new CharacterAppearanceCloudService(repository, new MemoryStorage());
    const wardrobe = new CharacterWardrobeController(new MemoryStorage());
    service.setOptIn('user-a', true);
    await service.upload('user-a', wardrobe.exportPresetArchive(), 100);
    expect(service.recoveryPoints('user-a')[0]?.reason).toBe('pre-cloud-upload');
  });

});

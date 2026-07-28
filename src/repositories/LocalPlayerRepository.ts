import { STORAGE_KEYS } from '../app/brand';
import { migratePlayerProfile, type PlayerProfile, type PlayerRepository } from './PlayerRepository';

export class LocalPlayerRepository implements PlayerRepository {
  public async load(uid: string): Promise<PlayerProfile | null> {
    const key = this.key(uid);
    const legacyKey = `rpg.profile.${uid}`;
    const value = localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
    if (!value) return null;

    try {
      const profile = migratePlayerProfile(JSON.parse(value), uid);
      localStorage.setItem(key, JSON.stringify(profile));
      return profile;
    } catch {
      localStorage.removeItem(key);
      localStorage.removeItem(legacyKey);
      return null;
    }
  }

  public async save(profile: PlayerProfile): Promise<void> {
    localStorage.setItem(this.key(profile.uid), JSON.stringify(profile));
  }

  private key(uid: string): string {
    return `${STORAGE_KEYS.profilePrefix}.${uid}`;
  }
}

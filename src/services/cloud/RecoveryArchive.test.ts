import { describe, expect, it } from 'vitest';
import { createDefaultProfile } from '../../repositories/PlayerRepository';
import { createRecoveryArchive, parseRecoveryArchive } from './RecoveryArchive';
import type { SaveRecoveryPoint } from './SaveRecoveryStore';

describe('RecoveryArchive', () => {
  it('round-trips the current profile, recovery points, and season snapshot', () => {
    const profile = createDefaultProfile('uid-a', '계승자');
    profile.level = 12;
    profile.highestStage = 7;
    profile.statistics.stagesCleared = 6;
    const point: SaveRecoveryPoint = {
      id: 'point-1', uid: profile.uid, reason: 'manual', createdAt: 1000,
      profile: { ...profile, updatedAt: 900 },
    };
    const archive = createRecoveryArchive(profile, [point], Date.parse('2026-07-28T00:00:00Z'));
    const parsed = parseRecoveryArchive(JSON.parse(JSON.stringify(archive)), profile.uid);
    expect(parsed.archive.profile.level).toBe(12);
    expect(parsed.archive.seasonSnapshot.seasonId).toBe('S01_2026-07-06');
    expect(parsed.importedRecoveryPoints).toHaveLength(1);
  });

  it('rejects a different account uid', () => {
    const profile = createDefaultProfile('uid-a', '계승자');
    const archive = createRecoveryArchive(profile, []);
    expect(() => parseRecoveryArchive(archive, 'uid-b')).toThrow(/UID/);
  });
});

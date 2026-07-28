import type { PlayerProfile } from '../../repositories/PlayerRepository';
import type { CloudSaveInspection } from './CloudSaveTypes';

export function compareProfiles(
  localProfile: PlayerProfile | null,
  cloudProfile: PlayerProfile | null,
): CloudSaveInspection['newest'] {
  if (!localProfile && !cloudProfile) return 'none';
  if (localProfile && !cloudProfile) return 'local';
  if (!localProfile && cloudProfile) return 'cloud';
  if (!localProfile || !cloudProfile) return 'none';
  if (localProfile.updatedAt === cloudProfile.updatedAt) return 'same';
  return localProfile.updatedAt > cloudProfile.updatedAt ? 'local' : 'cloud';
}

export function chooseNewest(
  localProfile: PlayerProfile | null,
  cloudProfile: PlayerProfile | null,
): PlayerProfile | null {
  const newest = compareProfiles(localProfile, cloudProfile);
  if (newest === 'local') return localProfile;
  if (newest === 'cloud') return cloudProfile;
  return localProfile ?? cloudProfile;
}

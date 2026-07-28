import { describe, expect, it } from 'vitest';
import { chooseNewest, compareProfiles } from '../services/cloud/cloudSaveLogic';
import { createDefaultProfile } from './PlayerRepository';

describe('cloud save comparison', () => {
  it('selects the profile with the newest client update timestamp', () => {
    const local = { ...createDefaultProfile('u', 'local'), updatedAt: 200 };
    const cloud = { ...createDefaultProfile('u', 'cloud'), updatedAt: 100 };
    expect(compareProfiles(local, cloud)).toBe('local');
    expect(chooseNewest(local, cloud)?.nickname).toBe('local');
  });

  it('handles missing sources without discarding the remaining save', () => {
    const cloud = { ...createDefaultProfile('u', 'cloud'), updatedAt: 100 };
    expect(compareProfiles(null, cloud)).toBe('cloud');
    expect(chooseNewest(null, cloud)).toBe(cloud);
  });
});

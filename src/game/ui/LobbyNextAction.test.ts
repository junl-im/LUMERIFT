import { describe, expect, it } from 'vitest';
import { resolveLobbyNextAction } from './LobbyNextAction';

describe('resolveLobbyNextAction', () => {
  it('prioritizes claimable rewards before alerts and story progress', () => {
    expect(resolveLobbyNextAction({ claimableQuests: 2, operationAlerts: 3, clearedStages: 4, totalStages: 10 }).id).toBe('claim-quest');
  });

  it('recommends story progress when no rewards or alerts remain', () => {
    expect(resolveLobbyNextAction({ claimableQuests: 0, operationAlerts: 0, clearedStages: 4, totalStages: 10 }).id).toBe('continue-story');
  });
});

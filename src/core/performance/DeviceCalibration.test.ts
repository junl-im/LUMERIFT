import { describe, expect, it } from 'vitest';
import { resolveDeviceCalibration } from './DeviceCalibration';

describe('resolveDeviceCalibration', () => {
  it('classifies constrained mobile hardware as entry tier', () => {
    const profile = resolveDeviceCalibration({ deviceMemory: 3, hardwareConcurrency: 4, devicePixelRatio: 3, touchPoints: 5 });
    expect(profile.tier).toBe('entry');
    expect(profile.thresholds.combatRenderBias).toBeLessThan(1);
  });

  it('classifies strong hardware as performance tier', () => {
    const profile = resolveDeviceCalibration({ deviceMemory: 8, hardwareConcurrency: 8, devicePixelRatio: 2, touchPoints: 5 });
    expect(profile.tier).toBe('performance');
    expect(profile.thresholds.degradeToSafeWindows).toBeGreaterThan(6);
  });
});

import { describe, expect, it } from 'vitest';
import { STATUS_LIFECYCLE_V21_SCHEMA, premiumStatusLifecycleKeyV21 } from './StatusLifecycleV21';

describe('StatusLifecycleV21', () => {
  it('maps supported gameplay statuses without changing combat data', () => {
    expect(STATUS_LIFECYCLE_V21_SCHEMA).toBe('lumerift-status-lifecycle-v21');
    expect(premiumStatusLifecycleKeyV21('burn')).toBe('burn');
    expect(premiumStatusLifecycleKeyV21('slow')).toBe('slow');
  });
});

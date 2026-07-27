import { describe, expect, it } from 'vitest';
import { createDefaultProfile } from '../../repositories/PlayerRepository';
import { attendanceCycleKey, claimAllMail, claimAttendance, redeemCoupon } from './operationsLogic';

describe('operations logic', () => {
  it('claims the current attendance day only once', () => {
    const date = new Date('2026-07-27T12:00:00Z');
    const profile = createDefaultProfile('u1', '계승자');
    const first = claimAttendance(profile, date);
    expect(first.changed).toBe(true);
    expect(first.profile.operations.attendanceClaims).toEqual([1]);
    expect(claimAttendance(first.profile, date).changed).toBe(false);
  });

  it('resets weekly attendance claims when the cycle changes', () => {
    expect(attendanceCycleKey(new Date('2026-07-27T00:00:00Z'))).toBe('2026-07-27');
    expect(attendanceCycleKey(new Date('2026-08-03T00:00:00Z'))).toBe('2026-08-03');
  });

  it('claims mail rewards and prevents duplicate coupon use', () => {
    const profile = createDefaultProfile('u2', '계승자');
    const mail = claimAllMail(profile, new Date('2026-07-27T00:00:00Z').getTime());
    expect(mail.changed).toBe(true);
    expect(mail.profile.gold).toBeGreaterThan(profile.gold);
    const coupon = redeemCoupon(mail.profile, 'lumerift13', new Date('2026-07-27T00:00:00Z').getTime());
    expect(coupon.changed).toBe(true);
    expect(redeemCoupon(coupon.profile, 'LUMERIFT13').changed).toBe(false);
  });
});

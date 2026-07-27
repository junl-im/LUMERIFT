import type { PlayerProfile } from '../../repositories/PlayerRepository';
import { ATTENDANCE_REWARDS, COUPONS, MAILS, NOTICES } from './operationsData';
import type { OperationReward, PlayerOperationsState } from './operationsTypes';

export interface OperationResult {
  readonly profile: PlayerProfile;
  readonly changed: boolean;
  readonly message: string;
}

export function createDefaultOperationsState(date = new Date()): PlayerOperationsState {
  return {
    attendanceCycleKey: attendanceCycleKey(date),
    attendanceClaims: [],
    noticeReads: {},
    mailClaims: {},
    redeemedCoupons: {},
  };
}

export function normalizeOperationsState(value: unknown, date = new Date()): PlayerOperationsState {
  const fallback = createDefaultOperationsState(date);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  const raw = value as Record<string, unknown>;
  const cycle = typeof raw.attendanceCycleKey === 'string' ? raw.attendanceCycleKey : fallback.attendanceCycleKey;
  return {
    attendanceCycleKey: cycle === fallback.attendanceCycleKey ? cycle : fallback.attendanceCycleKey,
    attendanceClaims: cycle === fallback.attendanceCycleKey ? parseClaimDays(raw.attendanceClaims) : [],
    noticeReads: parseTimestampMap(raw.noticeReads),
    mailClaims: parseTimestampMap(raw.mailClaims),
    redeemedCoupons: parseTimestampMap(raw.redeemedCoupons),
  };
}

export function attendanceCycleKey(date = new Date()): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = (utc.getUTCDay() + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - weekday);
  return utc.toISOString().slice(0, 10);
}

export function attendanceDay(date = new Date()): number {
  return ((date.getUTCDay() + 6) % 7) + 1;
}

export function claimAttendance(profile: PlayerProfile, date = new Date()): OperationResult {
  const state = normalizeOperationsState(profile.operations, date);
  const day = attendanceDay(date);
  if (state.attendanceClaims.includes(day)) return { profile, changed: false, message: '오늘 출석 보상은 이미 수령했습니다.' };
  const definition = ATTENDANCE_REWARDS.find((entry) => entry.day === day);
  if (!definition) return { profile, changed: false, message: '출석 보상 정보를 찾을 수 없습니다.' };
  const next = applyReward(profile, definition.reward, `attendance-${state.attendanceCycleKey}-${day}`);
  next.operations = { ...state, attendanceClaims: [...state.attendanceClaims, day].sort((a, b) => a - b) };
  return { profile: next, changed: true, message: `${day}일차 출석 보상을 수령했습니다.` };
}

export function markNoticeRead(profile: PlayerProfile, noticeId: string, now = Date.now()): OperationResult {
  if (!noticeId.trim()) return { profile, changed: false, message: '공지 정보를 찾을 수 없습니다.' };
  if (profile.operations.noticeReads[noticeId]) return { profile, changed: false, message: '이미 확인한 공지입니다.' };
  const next = cloneProfile(profile);
  next.operations.noticeReads[noticeId] = now;
  return { profile: next, changed: true, message: '공지를 확인했습니다.' };
}

export function claimMail(profile: PlayerProfile, mailId: string, now = Date.now()): OperationResult {
  const mail = MAILS.find((entry) => entry.id === mailId);
  if (!mail) return { profile, changed: false, message: '우편을 찾을 수 없습니다.' };
  if (profile.operations.mailClaims[mailId]) return { profile, changed: false, message: '이미 수령한 우편입니다.' };
  if (new Date(mail.expiresAt).getTime() < now) return { profile, changed: false, message: '만료된 우편입니다.' };
  const next = applyReward(profile, mail.reward, `mail-${mailId}`);
  next.operations.mailClaims[mailId] = now;
  return { profile: next, changed: true, message: `${mail.title} 보상을 수령했습니다.` };
}

export function claimAllMail(profile: PlayerProfile, now = Date.now()): OperationResult {
  let current = profile;
  let count = 0;
  for (const mail of MAILS) {
    const result = claimMail(current, mail.id, now);
    if (result.changed) {
      current = result.profile;
      count += 1;
    }
  }
  return { profile: current, changed: count > 0, message: count > 0 ? `우편 ${count}개를 모두 수령했습니다.` : '수령 가능한 우편이 없습니다.' };
}

export function redeemCoupon(profile: PlayerProfile, rawCode: string, now = Date.now()): OperationResult {
  const code = rawCode.trim().toUpperCase();
  const coupon = COUPONS.find((entry) => entry.code === code);
  if (!coupon) return { profile, changed: false, message: '유효하지 않은 쿠폰 코드입니다.' };
  if (profile.operations.redeemedCoupons[code]) return { profile, changed: false, message: '이미 사용한 쿠폰입니다.' };
  if (new Date(coupon.expiresAt).getTime() < now) return { profile, changed: false, message: '사용 기간이 종료된 쿠폰입니다.' };
  const next = applyReward(profile, coupon.reward, `coupon-${code}`);
  next.operations.redeemedCoupons[code] = now;
  return { profile: next, changed: true, message: `${coupon.title} 보상을 수령했습니다.` };
}

export function operationNotificationCount(profile: PlayerProfile, date = new Date()): number {
  const state = normalizeOperationsState(profile.operations, date);
  const unread = NOTICES.filter((notice) => !state.noticeReads[notice.id]).length;
  const mail = MAILS.filter((entry) => !state.mailClaims[entry.id] && new Date(entry.expiresAt).getTime() >= date.getTime()).length;
  const attendance = state.attendanceClaims.includes(attendanceDay(date)) ? 0 : 1;
  return unread + mail + attendance;
}

function applyReward(profile: PlayerProfile, reward: OperationReward, source: string): PlayerProfile {
  const next = cloneProfile(profile);
  next.gold += reward.gold;
  reward.itemIds.forEach((itemId, index) => {
    const uid = `${source}-${itemId}-${next.statistics.itemsObtained + index + 1}`;
    next.inventory[uid] = { uid, itemId, level: 0, locked: false, acquiredAt: Date.now() };
  });
  next.statistics.itemsObtained += reward.itemIds.length;
  next.dailyStatistics.itemsObtained += reward.itemIds.length;
  next.updatedAt = Date.now();
  return next;
}

function cloneProfile(profile: PlayerProfile): PlayerProfile {
  return {
    ...profile,
    inventory: { ...profile.inventory },
    equipped: { ...profile.equipped },
    stageProgress: { ...profile.stageProgress },
    questClaims: { ...profile.questClaims },
    dailyQuestClaims: { ...profile.dailyQuestClaims },
    statistics: { ...profile.statistics },
    dailyStatistics: { ...profile.dailyStatistics },
    tutorial: { ...profile.tutorial },
    operations: {
      attendanceCycleKey: profile.operations.attendanceCycleKey,
      attendanceClaims: [...profile.operations.attendanceClaims],
      noticeReads: { ...profile.operations.noticeReads },
      mailClaims: { ...profile.operations.mailClaims },
      redeemedCoupons: { ...profile.operations.redeemedCoupons },
    },
  };
}

function parseClaimDays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry): entry is number => Number.isInteger(entry) && entry >= 1 && entry <= 7))].sort((a, b) => a - b);
}

function parseTimestampMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, number> = {};
  for (const [key, timestamp] of Object.entries(value as Record<string, unknown>)) {
    if (typeof timestamp === 'number' && Number.isFinite(timestamp) && timestamp >= 0) result[key] = timestamp;
  }
  return result;
}

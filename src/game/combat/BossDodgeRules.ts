import bossDodgeRuleData from '../../data/boss-dodge-rules.json';
import { normalize, type Vec2 } from './geometry';

export type BossDodgeDirectionMode = 'perpendicular' | 'away' | 'diagonal';

export interface BossDodgeRule {
  readonly patternId: string;
  readonly label: string;
  readonly triggerProgress: number;
  readonly critical: boolean;
  readonly directionMode: BossDodgeDirectionMode;
  readonly reason: string;
  readonly hudIcon: string;
  readonly warningColor: number;
  readonly dangerColor: number;
  readonly criticalColor: number;
  readonly safeMoveLabel: string;
}

interface BossDodgeRuleDocument {
  readonly version: number;
  readonly defaultRule: BossDodgeRule;
  readonly patterns: readonly BossDodgeRule[];
}

const FALLBACK_RULE: BossDodgeRule = {
  patternId: 'unknown',
  label: '보스 패턴',
  triggerProgress: 0.72,
  critical: true,
  directionMode: 'perpendicular',
  reason: 'boss-critical-evade',
  hudIcon: '◇',
  warningColor: 0xffcc00,
  dangerColor: 0xff934a,
  criticalColor: 0xff3759,
  safeMoveLabel: '측면 안전 경로 확보',
};

const DOCUMENT = normalizeRuleDocument(bossDodgeRuleData);
const RULES = new Map(DOCUMENT.patterns.map((rule) => [rule.patternId, rule] as const));

export const BOSS_DODGE_RULE_VERSION = DOCUMENT.version;

export function bossDodgeRuleCatalog(): readonly BossDodgeRule[] {
  return DOCUMENT.patterns;
}

export function resolveBossDodgeRule(patternId: string | undefined): BossDodgeRule {
  return patternId ? (RULES.get(patternId) ?? DOCUMENT.defaultRule) : DOCUMENT.defaultRule;
}

export function resolveBossDodgeDirection(rule: BossDodgeRule, targetDirection: Vec2): Vec2 {
  const facing = normalize(targetDirection, { x: 0, y: -1 });
  if (rule.directionMode === 'away') {
    return { x: -facing.x, y: -facing.y };
  }
  if (rule.directionMode === 'diagonal') {
    return normalize({
      x: -facing.x - facing.y * 0.72,
      y: -facing.y + facing.x * 0.72,
    }, { x: 1, y: 0 });
  }
  return normalize({ x: -facing.y, y: facing.x }, { x: 1, y: 0 });
}

export function bossDodgeReasonLabel(reason: string): string {
  const matched = DOCUMENT.patterns.find((rule) => rule.reason === reason);
  if (matched) return `${matched.label} ${directionLabel(matched.directionMode)}`;
  return '보스 치명 패턴 회피';
}

function normalizeRuleDocument(value: unknown): BossDodgeRuleDocument {
  if (!isRecord(value)) return { version: 1, defaultRule: FALLBACK_RULE, patterns: [] };
  const version = typeof value.version === 'number' && Number.isFinite(value.version)
    ? Math.max(1, Math.floor(value.version))
    : 1;
  const defaultRule = normalizeRule(value.defaultRule) ?? FALLBACK_RULE;
  const patterns = Array.isArray(value.patterns)
    ? value.patterns.map(normalizeRule).filter((rule): rule is BossDodgeRule => rule !== undefined)
    : [];
  return { version, defaultRule, patterns };
}

function normalizeRule(value: unknown): BossDodgeRule | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.patternId !== 'string' || value.patternId.length === 0) return undefined;
  if (typeof value.label !== 'string' || value.label.length === 0) return undefined;
  if (typeof value.reason !== 'string' || value.reason.length === 0) return undefined;
  if (typeof value.critical !== 'boolean') return undefined;
  if (!isDirectionMode(value.directionMode)) return undefined;
  if (typeof value.triggerProgress !== 'number' || !Number.isFinite(value.triggerProgress)) return undefined;
  if (typeof value.hudIcon !== 'string' || value.hudIcon.length === 0) return undefined;
  if (typeof value.safeMoveLabel !== 'string' || value.safeMoveLabel.length === 0) return undefined;
  if (!isColor(value.warningColor) || !isColor(value.dangerColor) || !isColor(value.criticalColor)) return undefined;
  return {
    patternId: value.patternId,
    label: value.label,
    triggerProgress: Math.max(0, Math.min(1, value.triggerProgress)),
    critical: value.critical,
    directionMode: value.directionMode,
    reason: value.reason,
    hudIcon: value.hudIcon,
    warningColor: value.warningColor,
    dangerColor: value.dangerColor,
    criticalColor: value.criticalColor,
    safeMoveLabel: value.safeMoveLabel,
  };
}

function isColor(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xffffff;
}

function isDirectionMode(value: unknown): value is BossDodgeDirectionMode {
  return value === 'perpendicular' || value === 'away' || value === 'diagonal';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function directionLabel(mode: BossDodgeDirectionMode): string {
  if (mode === 'away') return '범위 이탈';
  if (mode === 'diagonal') return '대각 회피';
  return '측면 회피';
}

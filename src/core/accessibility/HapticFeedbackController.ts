export type HapticCue =
  | 'ui'
  | 'attack'
  | 'critical'
  | 'skill'
  | 'dodge'
  | 'perfectDodge'
  | 'damage'
  | 'bossWarning'
  | 'bossCritical'
  | 'overdrive';

export type VibrateFunction = (pattern: number | readonly number[]) => boolean;

const PATTERNS: Readonly<Record<HapticCue, readonly number[]>> = {
  ui: [8],
  attack: [10],
  critical: [14, 26, 20],
  skill: [18, 22, 28],
  dodge: [10, 18, 10],
  perfectDodge: [12, 18, 12, 32, 24],
  damage: [34],
  bossWarning: [18, 70, 18],
  bossCritical: [26, 42, 26, 42, 34],
  overdrive: [18, 20, 24, 20, 40],
};

const MIN_INTERVAL_MS: Readonly<Partial<Record<HapticCue, number>>> = {
  attack: 80,
  critical: 110,
  damage: 180,
  bossWarning: 700,
  bossCritical: 550,
};

export class HapticFeedbackController {
  private readonly lastPlayedAt = new Map<HapticCue, number>();

  public constructor(
    private readonly vibrate: VibrateFunction | undefined = resolveVibrate(),
    private readonly now: () => number = () => Date.now(),
  ) {}

  public get supported(): boolean {
    return typeof this.vibrate === 'function';
  }

  public pulse(cue: HapticCue, enabled = true): boolean {
    if (!enabled || !this.vibrate) return false;
    const now = this.now();
    const last = this.lastPlayedAt.get(cue) ?? Number.NEGATIVE_INFINITY;
    const interval = MIN_INTERVAL_MS[cue] ?? 40;
    if (now - last < interval) return false;
    this.lastPlayedAt.set(cue, now);
    try {
      return this.vibrate([...PATTERNS[cue]]);
    } catch {
      return false;
    }
  }

  public cancel(): void {
    try {
      this.vibrate?.(0);
    } catch {
      // Vibration is optional and must never break the game loop.
    }
  }
}

function resolveVibrate(): VibrateFunction | undefined {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return undefined;
  return (pattern) => navigator.vibrate(pattern as number[]);
}

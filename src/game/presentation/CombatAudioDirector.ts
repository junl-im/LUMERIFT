import type { AudioManager, AudioLayer } from '../../core/audio/AudioManager';
import type { CombatActionConfig, CombatImpactTier } from '../combat/combatData';

export interface CombatAudioPaths {
  readonly slash: string;
  readonly hit: string;
  readonly skill: string;
  readonly dodge: string;
}

export type CombatAudioCue =
  | { readonly kind: 'swing'; readonly comboStep: number }
  | { readonly kind: 'impact'; readonly tier: CombatImpactTier; readonly critical: boolean; readonly hitCount: number }
  | { readonly kind: 'skill'; readonly slot: 'skill1' | 'skill2'; readonly empowered: boolean }
  | { readonly kind: 'dodge'; readonly perfect: boolean }
  | { readonly kind: 'damage'; readonly boss: boolean }
  | { readonly kind: 'overdrive' };

export class CombatAudioDirector {
  public constructor(
    private readonly audio: AudioManager,
    private readonly paths: CombatAudioPaths,
  ) {}

  public play(cue: CombatAudioCue): void {
    void this.audio.playLayered(resolveCombatAudioLayers(this.paths, cue));
  }

  public playActionSwing(action: CombatActionConfig, comboStep: number): void {
    if (action.kind === 'basic') this.play({ kind: 'swing', comboStep });
    else this.play({ kind: 'skill', slot: action.kind, empowered: false });
  }
}

export function resolveCombatAudioLayers(paths: CombatAudioPaths, cue: CombatAudioCue): readonly AudioLayer[] {
  if (cue.kind === 'swing') {
    const step = Math.max(0, Math.min(2, cue.comboStep));
    return [{ url: paths.slash, category: 'sfx', volumeScale: 0.7 + step * 0.08, playbackRate: 0.96 + step * 0.045 }];
  }
  if (cue.kind === 'impact') {
    const tierGain = cue.tier === 'ultimate' ? 1 : cue.tier === 'heavy' ? 0.88 : 0.68;
    const layers: AudioLayer[] = [
      { url: paths.hit, category: 'sfx', volumeScale: Math.min(1, tierGain + cue.hitCount * 0.025), playbackRate: cue.critical ? 1.1 : 0.98 },
    ];
    if (cue.critical || cue.tier !== 'light') {
      layers.push({ url: paths.hit, category: 'sfx', volumeScale: cue.critical ? 0.48 : 0.32, playbackRate: cue.tier === 'ultimate' ? 0.72 : 0.82, delayMs: 18 });
    }
    return layers;
  }
  if (cue.kind === 'skill') {
    return [
      { url: paths.skill, category: 'sfx', volumeScale: cue.empowered ? 1 : 0.82, playbackRate: cue.slot === 'skill2' ? 0.84 : 1.04 },
      { url: paths.slash, category: 'sfx', volumeScale: cue.empowered ? 0.56 : 0.38, playbackRate: cue.slot === 'skill2' ? 0.72 : 1.14, delayMs: 24 },
    ];
  }
  if (cue.kind === 'dodge') {
    return cue.perfect
      ? [
          { url: paths.dodge, category: 'sfx', volumeScale: 0.88, playbackRate: 1.08 },
          { url: paths.hit, category: 'sfx', volumeScale: 0.4, playbackRate: 1.34, delayMs: 42 },
        ]
      : [{ url: paths.dodge, category: 'sfx', volumeScale: 0.72, playbackRate: 1.02 }];
  }
  if (cue.kind === 'damage') {
    return [{ url: paths.hit, category: 'sfx', volumeScale: cue.boss ? 0.9 : 0.68, playbackRate: cue.boss ? 0.7 : 0.84 }];
  }
  return [
    { url: paths.skill, category: 'sfx', volumeScale: 0.95, playbackRate: 0.74 },
    { url: paths.dodge, category: 'sfx', volumeScale: 0.55, playbackRate: 1.24, delayMs: 54 },
    { url: paths.hit, category: 'sfx', volumeScale: 0.42, playbackRate: 1.42, delayMs: 116 },
  ];
}

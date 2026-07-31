import { STORAGE_KEYS } from '../../app/brand';
import type { EquipmentSlot } from '../../game/items/itemTypes';
import { DIRECTION_IDS, type DirectionId } from '../../game/presentation/direction';
import type { CharacterDyePreset } from './CharacterDyeController';

export type CharacterShowcasePose = 'idle' | 'run' | 'attack1' | 'attack2' | 'attack3' | 'skill1' | 'skill2' | 'dodge';
export type CharacterWardrobeSlotId = 1 | 2 | 3;
export type CharacterCostumeSet = 'scout-steel' | 'warden-rift' | 'harbinger-heir';
export type CharacterDyeChannel = 'primary' | 'secondary' | 'rune';
export type CharacterDyeChannelLevel = 0 | 1 | 2;

export interface CharacterDyeChannels {
  readonly primary: CharacterDyeChannelLevel;
  readonly secondary: CharacterDyeChannelLevel;
  readonly rune: CharacterDyeChannelLevel;
}

export interface CharacterAppearancePreset {
  readonly dyePreset: CharacterDyePreset;
  readonly pose: CharacterShowcasePose;
  readonly direction: DirectionId;
  readonly costumeSet: CharacterCostumeSet;
  readonly dyeChannels: CharacterDyeChannels;
  readonly savedAt: number;
}

export type CharacterWardrobeSlot = CharacterAppearancePreset;

export interface CharacterWardrobeState {
  readonly selectedSlot: CharacterWardrobeSlotId;
  readonly pose: CharacterShowcasePose;
  readonly direction: DirectionId;
  readonly costumeSet: CharacterCostumeSet;
  readonly dyeChannels: CharacterDyeChannels;
  readonly comparisonSlot: EquipmentSlot;
  readonly comparisonIndexes: Readonly<Record<EquipmentSlot, number>>;
  readonly slots: Readonly<Record<CharacterWardrobeSlotId, CharacterWardrobeSlot | undefined>>;
  readonly recentPresets: readonly CharacterAppearancePreset[];
}

const POSE_ORDER: readonly CharacterShowcasePose[] = ['idle', 'run', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'dodge'];
const DIRECTION_ORDER: readonly DirectionId[] = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];
const COSTUME_ORDER: readonly CharacterCostumeSet[] = ['scout-steel', 'warden-rift', 'harbinger-heir'];
const COMPARISON_SLOT_ORDER: readonly EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
const DEFAULT_DYE_CHANNELS: CharacterDyeChannels = { primary: 1, secondary: 1, rune: 1 };
const MAX_RECENT_PRESETS = 5;

const DEFAULT_STATE: CharacterWardrobeState = {
  selectedSlot: 1,
  pose: 'idle',
  direction: 's',
  costumeSet: 'scout-steel',
  dyeChannels: DEFAULT_DYE_CHANNELS,
  comparisonSlot: 'weapon',
  comparisonIndexes: { weapon: 0, armor: 0, accessory: 0 },
  slots: { 1: undefined, 2: undefined, 3: undefined },
  recentPresets: [],
};

export class CharacterWardrobeController {
  private state: CharacterWardrobeState;

  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {
    this.state = loadState(storage?.getItem(STORAGE_KEYS.characterWardrobe));
  }

  public get current(): CharacterWardrobeState {
    return this.state;
  }

  public cyclePose(): CharacterShowcasePose {
    const index = POSE_ORDER.indexOf(this.state.pose);
    const pose = POSE_ORDER[(index + 1) % POSE_ORDER.length] ?? 'idle';
    this.commit({ ...this.state, pose });
    return pose;
  }

  public setPose(pose: CharacterShowcasePose): void {
    this.commit({ ...this.state, pose });
  }

  public rotateDirection(step: -1 | 1): DirectionId {
    const index = DIRECTION_ORDER.indexOf(this.state.direction);
    const direction = DIRECTION_ORDER[(index + step + DIRECTION_ORDER.length) % DIRECTION_ORDER.length] ?? 's';
    this.commit({ ...this.state, direction });
    return direction;
  }

  public setDirection(direction: DirectionId): void {
    this.commit({ ...this.state, direction });
  }

  public cycleCostumeSet(): CharacterCostumeSet {
    const index = COSTUME_ORDER.indexOf(this.state.costumeSet);
    const costumeSet = COSTUME_ORDER[(index + 1) % COSTUME_ORDER.length] ?? 'scout-steel';
    this.commit({ ...this.state, costumeSet });
    return costumeSet;
  }

  public cycleDyeChannel(channel: CharacterDyeChannel): CharacterDyeChannelLevel {
    const current = this.state.dyeChannels[channel];
    const next = ((current + 1) % 3) as CharacterDyeChannelLevel;
    this.commit({
      ...this.state,
      dyeChannels: { ...this.state.dyeChannels, [channel]: next },
    });
    return next;
  }

  public cycleComparisonSlot(): EquipmentSlot {
    const index = COMPARISON_SLOT_ORDER.indexOf(this.state.comparisonSlot);
    const comparisonSlot = COMPARISON_SLOT_ORDER[(index + 1) % COMPARISON_SLOT_ORDER.length] ?? 'weapon';
    this.commit({ ...this.state, comparisonSlot });
    return comparisonSlot;
  }

  public setComparisonSlot(slot: EquipmentSlot): void {
    this.commit({ ...this.state, comparisonSlot: slot });
  }

  public cycleComparisonCandidate(candidateCount: number): number {
    const count = Math.max(1, Math.floor(candidateCount));
    const slot = this.state.comparisonSlot;
    const next = (this.state.comparisonIndexes[slot] + 1) % count;
    this.commit({
      ...this.state,
      comparisonIndexes: { ...this.state.comparisonIndexes, [slot]: next },
    });
    return next;
  }

  public selectSlot(slot: CharacterWardrobeSlotId): void {
    this.commit({ ...this.state, selectedSlot: slot });
  }

  public saveSelectedSlot(dyePreset: CharacterDyePreset, now = Date.now()): CharacterWardrobeSlot {
    const slot = this.createPreset(dyePreset, now);
    this.commit({
      ...this.state,
      slots: { ...this.state.slots, [this.state.selectedSlot]: slot },
      recentPresets: mergeRecentPreset(slot, this.state.recentPresets),
    });
    return slot;
  }

  public rememberCurrentPreset(dyePreset: CharacterDyePreset, now = Date.now()): CharacterAppearancePreset {
    const preset = this.createPreset(dyePreset, now);
    this.commit({ ...this.state, recentPresets: mergeRecentPreset(preset, this.state.recentPresets) });
    return preset;
  }

  public loadSelectedSlot(): CharacterWardrobeSlot | undefined {
    const slot = this.state.slots[this.state.selectedSlot];
    if (!slot) return undefined;
    this.applyPreset(slot, true);
    return slot;
  }

  public applyRecentPreset(index = 0): CharacterAppearancePreset | undefined {
    const preset = this.state.recentPresets[index];
    if (!preset) return undefined;
    this.applyPreset(preset, true);
    return preset;
  }

  public clearSelectedSlot(): void {
    this.commit({
      ...this.state,
      slots: { ...this.state.slots, [this.state.selectedSlot]: undefined },
    });
  }

  private createPreset(dyePreset: CharacterDyePreset, savedAt: number): CharacterAppearancePreset {
    return {
      dyePreset,
      pose: this.state.pose,
      direction: this.state.direction,
      costumeSet: this.state.costumeSet,
      dyeChannels: { ...this.state.dyeChannels },
      savedAt,
    };
  }

  private applyPreset(preset: CharacterAppearancePreset, remember: boolean): void {
    this.commit({
      ...this.state,
      pose: preset.pose,
      direction: preset.direction,
      costumeSet: preset.costumeSet,
      dyeChannels: { ...preset.dyeChannels },
      recentPresets: remember ? mergeRecentPreset(preset, this.state.recentPresets) : this.state.recentPresets,
    });
  }

  private commit(state: CharacterWardrobeState): void {
    this.state = state;
    this.storage?.setItem(STORAGE_KEYS.characterWardrobe, JSON.stringify(state));
  }
}

export function characterShowcasePoseLabel(pose: CharacterShowcasePose): string {
  if (pose === 'run') return '이동';
  if (pose === 'attack1') return '공격 1';
  if (pose === 'attack2') return '공격 2';
  if (pose === 'attack3') return '공격 3';
  if (pose === 'skill1') return '스킬 1';
  if (pose === 'skill2') return '스킬 2';
  if (pose === 'dodge') return '회피';
  return '대기';
}

export function characterDirectionLabel(direction: DirectionId): string {
  const labels: Readonly<Record<DirectionId, string>> = {
    n: '북', ne: '북동', e: '동', se: '남동', s: '남', sw: '남서', w: '서', nw: '북서',
  };
  return labels[direction];
}

export function characterCostumeSetLabel(value: CharacterCostumeSet): string {
  if (value === 'warden-rift') return '감시자 균열 세트';
  if (value === 'harbinger-heir') return '전령 계승 세트';
  return '정찰대 강철 세트';
}

export function characterDyeChannelLabel(channel: CharacterDyeChannel, level: CharacterDyeChannelLevel): string {
  const channelLabel = channel === 'primary' ? '갑주' : channel === 'secondary' ? '망토' : '룬';
  const levelLabel = level === 0 ? 'DARK' : level === 2 ? 'BRIGHT' : 'BASE';
  return `${channelLabel} ${levelLabel}`;
}

export function equipmentSlotLabel(slot: EquipmentSlot): string {
  if (slot === 'armor') return '방어구';
  if (slot === 'accessory') return '장신구';
  return '무기';
}

export function characterShowcaseAnimationKey(pose: CharacterShowcasePose, direction: DirectionId = 's'): string {
  return `player.${pose}.${direction}`;
}

export function wardrobeSlotUpdatedLabel(slot: CharacterWardrobeSlot | undefined): string {
  if (!slot) return 'EMPTY';
  const date = new Date(slot.savedAt);
  return `${characterShowcasePoseLabel(slot.pose)} · ${characterDirectionLabel(slot.direction)} · ${date.toLocaleDateString('ko-KR')}`;
}

export function recentPresetUpdatedLabel(preset: CharacterAppearancePreset | undefined): string {
  if (!preset) return '최근 프리셋 없음';
  return `${characterCostumeSetLabel(preset.costumeSet)} · ${characterDirectionLabel(preset.direction)}`;
}

function loadState(raw: string | null | undefined): CharacterWardrobeState {
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<CharacterWardrobeState>;
    const selectedSlot = isSlotId(parsed.selectedSlot) ? parsed.selectedSlot : 1;
    const pose = isPose(parsed.pose) ? parsed.pose : 'idle';
    const direction = isDirection(parsed.direction) ? parsed.direction : 's';
    const costumeSet = isCostumeSet(parsed.costumeSet) ? parsed.costumeSet : 'scout-steel';
    const dyeChannels = parseDyeChannels(parsed.dyeChannels);
    const comparisonSlot = isEquipmentSlot(parsed.comparisonSlot) ? parsed.comparisonSlot : 'weapon';
    const comparisonIndexes = parseComparisonIndexes(parsed.comparisonIndexes);
    const parsedSlots = parsed.slots ?? {};
    const recentPresets = Array.isArray(parsed.recentPresets)
      ? parsed.recentPresets.map(parseSlot).filter((value): value is CharacterAppearancePreset => Boolean(value)).slice(0, MAX_RECENT_PRESETS)
      : [];
    return {
      selectedSlot,
      pose,
      direction,
      costumeSet,
      dyeChannels,
      comparisonSlot,
      comparisonIndexes,
      slots: {
        1: parseSlot((parsedSlots as Record<number, unknown>)[1]),
        2: parseSlot((parsedSlots as Record<number, unknown>)[2]),
        3: parseSlot((parsedSlots as Record<number, unknown>)[3]),
      },
      recentPresets,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function parseSlot(value: unknown): CharacterWardrobeSlot | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterAppearancePreset>;
  if (!isDyePreset(record.dyePreset) || !isPose(record.pose) || typeof record.savedAt !== 'number') return undefined;
  return {
    dyePreset: record.dyePreset,
    pose: record.pose,
    direction: isDirection(record.direction) ? record.direction : 's',
    costumeSet: isCostumeSet(record.costumeSet) ? record.costumeSet : 'scout-steel',
    dyeChannels: parseDyeChannels(record.dyeChannels),
    savedAt: record.savedAt,
  };
}

function parseDyeChannels(value: unknown): CharacterDyeChannels {
  if (!value || typeof value !== 'object') return DEFAULT_DYE_CHANNELS;
  const record = value as Partial<CharacterDyeChannels>;
  return {
    primary: isDyeChannelLevel(record.primary) ? record.primary : 1,
    secondary: isDyeChannelLevel(record.secondary) ? record.secondary : 1,
    rune: isDyeChannelLevel(record.rune) ? record.rune : 1,
  };
}

function parseComparisonIndexes(value: unknown): Readonly<Record<EquipmentSlot, number>> {
  if (!value || typeof value !== 'object') return { weapon: 0, armor: 0, accessory: 0 };
  const record = value as Partial<Record<EquipmentSlot, unknown>>;
  return {
    weapon: finiteIndex(record.weapon),
    armor: finiteIndex(record.armor),
    accessory: finiteIndex(record.accessory),
  };
}

function finiteIndex(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

function mergeRecentPreset(
  preset: CharacterAppearancePreset,
  current: readonly CharacterAppearancePreset[],
): readonly CharacterAppearancePreset[] {
  const signature = presetSignature(preset);
  return [preset, ...current.filter((entry) => presetSignature(entry) !== signature)].slice(0, MAX_RECENT_PRESETS);
}

function presetSignature(preset: CharacterAppearancePreset): string {
  return [
    preset.dyePreset,
    preset.pose,
    preset.direction,
    preset.costumeSet,
    preset.dyeChannels.primary,
    preset.dyeChannels.secondary,
    preset.dyeChannels.rune,
  ].join('|');
}

function isSlotId(value: unknown): value is CharacterWardrobeSlotId {
  return value === 1 || value === 2 || value === 3;
}

function isPose(value: unknown): value is CharacterShowcasePose {
  return POSE_ORDER.includes(value as CharacterShowcasePose);
}

function isDirection(value: unknown): value is DirectionId {
  return DIRECTION_IDS.includes(value as DirectionId);
}

function isCostumeSet(value: unknown): value is CharacterCostumeSet {
  return COSTUME_ORDER.includes(value as CharacterCostumeSet);
}

function isDyeChannelLevel(value: unknown): value is CharacterDyeChannelLevel {
  return value === 0 || value === 1 || value === 2;
}

function isEquipmentSlot(value: unknown): value is EquipmentSlot {
  return value === 'weapon' || value === 'armor' || value === 'accessory';
}

function isDyePreset(value: unknown): value is CharacterDyePreset {
  return value === 'heir-gold' || value === 'rift-azure' || value === 'abyss-violet' || value === 'moon-silver';
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

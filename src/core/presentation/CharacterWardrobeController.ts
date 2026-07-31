import { STORAGE_KEYS } from '../../app/brand';
import type { EquipmentSlot } from '../../game/items/itemTypes';
import { DIRECTION_IDS, type DirectionId } from '../../game/presentation/direction';
import type { CharacterDyePreset } from './CharacterDyeController';

export type CharacterShowcasePose = 'idle' | 'run' | 'attack1' | 'attack2' | 'attack3' | 'skill1' | 'skill2' | 'dodge';
export type CharacterWardrobeSlotId = 1 | 2 | 3;
export type CharacterCostumeSet = 'scout-steel' | 'warden-rift' | 'harbinger-heir';
export type CharacterDyeChannel = 'primary' | 'secondary' | 'rune';
export type CharacterDyeChannelLevel = 0 | 1 | 2;
export type CharacterAppearanceFocusPart = 'full' | 'weapon' | 'armor' | 'cape' | 'rune';
export type CharacterPreviewZoom = 'fit' | 'close' | 'detail';
export type CharacterPresetSort = 'updated' | 'name' | 'favorite';

export interface CharacterDyeChannels {
  readonly primary: CharacterDyeChannelLevel;
  readonly secondary: CharacterDyeChannelLevel;
  readonly rune: CharacterDyeChannelLevel;
}

export interface CharacterAppearancePreset {
  readonly id: string;
  readonly name: string;
  readonly favorite: boolean;
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
  readonly focusPart: CharacterAppearanceFocusPart;
  readonly previewZoom: CharacterPreviewZoom;
  readonly selectedRecentIndex: number;
  readonly presetSort: CharacterPresetSort;
  readonly presetQuery: string;
  readonly slotOrder: readonly CharacterWardrobeSlotId[];
  readonly lockedSlots: Readonly<Record<CharacterWardrobeSlotId, boolean>>;
  readonly slots: Readonly<Record<CharacterWardrobeSlotId, CharacterWardrobeSlot | undefined>>;
  readonly recentPresets: readonly CharacterAppearancePreset[];
}

export interface CharacterWardrobeArchive {
  readonly schemaVersion: 3;
  readonly game: 'LUMERIFT';
  readonly kind: 'character-appearance-presets';
  readonly exportedAt: number;
  readonly slotOrder: readonly CharacterWardrobeSlotId[];
  readonly lockedSlots: Readonly<Record<CharacterWardrobeSlotId, boolean>>;
  readonly slots: Readonly<Record<CharacterWardrobeSlotId, CharacterWardrobeSlot | undefined>>;
  readonly presets: readonly CharacterAppearancePreset[];
}

const POSE_ORDER: readonly CharacterShowcasePose[] = ['idle', 'run', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'dodge'];
const DIRECTION_ORDER: readonly DirectionId[] = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];
const COSTUME_ORDER: readonly CharacterCostumeSet[] = ['scout-steel', 'warden-rift', 'harbinger-heir'];
const COMPARISON_SLOT_ORDER: readonly EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
const FOCUS_ORDER: readonly CharacterAppearanceFocusPart[] = ['full', 'weapon', 'armor', 'cape', 'rune'];
const ZOOM_ORDER: readonly CharacterPreviewZoom[] = ['fit', 'close', 'detail'];
const PRESET_SORT_ORDER: readonly CharacterPresetSort[] = ['updated', 'favorite', 'name'];
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
  focusPart: 'full',
  previewZoom: 'fit',
  selectedRecentIndex: 0,
  presetSort: 'updated',
  presetQuery: '',
  slotOrder: [1, 2, 3],
  lockedSlots: { 1: false, 2: false, 3: false },
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

  public cycleFocusPart(): CharacterAppearanceFocusPart {
    const index = FOCUS_ORDER.indexOf(this.state.focusPart);
    const focusPart = FOCUS_ORDER[(index + 1) % FOCUS_ORDER.length] ?? 'full';
    this.commit({ ...this.state, focusPart });
    return focusPart;
  }

  public cyclePreviewZoom(): CharacterPreviewZoom {
    const index = ZOOM_ORDER.indexOf(this.state.previewZoom);
    const previewZoom = ZOOM_ORDER[(index + 1) % ZOOM_ORDER.length] ?? 'fit';
    this.commit({ ...this.state, previewZoom });
    return previewZoom;
  }

  public cyclePresetSort(): CharacterPresetSort {
    const index = PRESET_SORT_ORDER.indexOf(this.state.presetSort);
    const presetSort = PRESET_SORT_ORDER[(index + 1) % PRESET_SORT_ORDER.length] ?? 'updated';
    this.commit({ ...this.state, presetSort });
    return presetSort;
  }

  public setPresetQuery(query: string): string {
    const presetQuery = normalizePresetQuery(query);
    this.commit({ ...this.state, presetQuery });
    return presetQuery;
  }

  public moveSelectedSlot(step: -1 | 1): readonly CharacterWardrobeSlotId[] {
    const order = [...this.state.slotOrder];
    const index = order.indexOf(this.state.selectedSlot);
    const target = Math.max(0, Math.min(order.length - 1, index + step));
    if (index === target) return this.state.slotOrder;
    const [selected] = order.splice(index, 1);
    if (selected === undefined) return this.state.slotOrder;
    order.splice(target, 0, selected);
    this.commit({ ...this.state, slotOrder: order });
    return order;
  }

  public toggleSlotLock(slot = this.state.selectedSlot): boolean {
    const locked = !this.state.lockedSlots[slot];
    this.commit({
      ...this.state,
      lockedSlots: { ...this.state.lockedSlots, [slot]: locked },
    });
    return locked;
  }

  public isSlotLocked(slot = this.state.selectedSlot): boolean {
    return this.state.lockedSlots[slot];
  }

  public selectSlot(slot: CharacterWardrobeSlotId): void {
    this.commit({ ...this.state, selectedSlot: slot });
  }

  public saveSelectedSlot(dyePreset: CharacterDyePreset, now = Date.now()): CharacterWardrobeSlot {
    if (this.state.lockedSlots[this.state.selectedSlot]) throw new Error(`외형 슬롯 ${this.state.selectedSlot}은 고정되어 있습니다.`);
    const previous = this.state.slots[this.state.selectedSlot];
    const slot = this.createPreset(
      dyePreset,
      now,
      previous?.name ?? `외형 슬롯 ${this.state.selectedSlot}`,
      previous?.favorite ?? false,
      previous?.id,
    );
    this.commit({
      ...this.state,
      slots: { ...this.state.slots, [this.state.selectedSlot]: slot },
      recentPresets: mergeRecentPreset(slot, this.state.recentPresets),
      selectedRecentIndex: 0,
    });
    return slot;
  }

  public rememberCurrentPreset(dyePreset: CharacterDyePreset, now = Date.now()): CharacterAppearancePreset {
    const preset = this.createPreset(dyePreset, now, '최근 외형', false);
    this.commit({
      ...this.state,
      recentPresets: mergeRecentPreset(preset, this.state.recentPresets),
      selectedRecentIndex: 0,
    });
    return preset;
  }

  public loadSelectedSlot(): CharacterWardrobeSlot | undefined {
    const slot = this.state.slots[this.state.selectedSlot];
    if (!slot) return undefined;
    this.applyPreset(slot, true);
    return slot;
  }

  public applyRecentPreset(index = this.state.selectedRecentIndex): CharacterAppearancePreset | undefined {
    const preset = this.state.recentPresets[index];
    if (!preset) return undefined;
    this.applyPreset(preset, true);
    return preset;
  }

  public selectRecentPreset(index: number): CharacterAppearancePreset | undefined {
    if (!this.state.recentPresets.length) return undefined;
    const safe = clampIndex(index, this.state.recentPresets.length);
    this.commit({ ...this.state, selectedRecentIndex: safe });
    return this.state.recentPresets[safe];
  }

  public cycleRecentPreset(step: -1 | 1): CharacterAppearancePreset | undefined {
    if (!this.state.recentPresets.length) return undefined;
    const next = (this.state.selectedRecentIndex + step + this.state.recentPresets.length) % this.state.recentPresets.length;
    this.commit({ ...this.state, selectedRecentIndex: next });
    return this.state.recentPresets[next];
  }

  public renameRecentPreset(index: number, name: string): CharacterAppearancePreset | undefined {
    const preset = this.state.recentPresets[index];
    if (!preset) return undefined;
    const normalized = normalizePresetName(name, preset.name);
    const updated = { ...preset, name: normalized };
    const recentPresets = this.state.recentPresets.map((entry, entryIndex) => entryIndex === index ? updated : entry);
    const slots = mapMatchingSlots(this.state.slots, preset.id, (slot) => ({ ...slot, name: normalized }));
    this.commit({ ...this.state, recentPresets, slots });
    return updated;
  }

  public toggleRecentFavorite(index: number): CharacterAppearancePreset | undefined {
    const preset = this.state.recentPresets[index];
    if (!preset) return undefined;
    const updated = { ...preset, favorite: !preset.favorite };
    const recentPresets = this.state.recentPresets.map((entry, entryIndex) => entryIndex === index ? updated : entry);
    const slots = mapMatchingSlots(this.state.slots, preset.id, (slot) => ({ ...slot, favorite: updated.favorite }));
    this.commit({ ...this.state, recentPresets, slots });
    return updated;
  }

  public deleteRecentPreset(index: number): CharacterAppearancePreset | undefined {
    const preset = this.state.recentPresets[index];
    if (!preset) return undefined;
    const recentPresets = this.state.recentPresets.filter((_, entryIndex) => entryIndex !== index);
    this.commit({
      ...this.state,
      recentPresets,
      selectedRecentIndex: clampIndex(this.state.selectedRecentIndex, recentPresets.length),
    });
    return preset;
  }

  public exportPresetArchive(now = Date.now()): CharacterWardrobeArchive {
    return {
      schemaVersion: 3,
      game: 'LUMERIFT',
      kind: 'character-appearance-presets',
      exportedAt: now,
      slotOrder: [...this.state.slotOrder],
      lockedSlots: { ...this.state.lockedSlots },
      slots: { ...this.state.slots },
      presets: [...this.state.recentPresets],
    };
  }

  public importPresetArchive(value: unknown): number {
    const archive = parseArchive(value);
    if (!archive) return 0;
    const merged = archive.presets.reduce(
      (current, preset) => mergeRecentPreset(preset, current),
      this.state.recentPresets,
    );
    const slots = {
      1: this.state.lockedSlots[1] ? this.state.slots[1] : archive.slots[1] ?? this.state.slots[1],
      2: this.state.lockedSlots[2] ? this.state.slots[2] : archive.slots[2] ?? this.state.slots[2],
      3: this.state.lockedSlots[3] ? this.state.slots[3] : archive.slots[3] ?? this.state.slots[3],
    };
    const lockedSlots = {
      1: this.state.lockedSlots[1] || archive.lockedSlots[1],
      2: this.state.lockedSlots[2] || archive.lockedSlots[2],
      3: this.state.lockedSlots[3] || archive.lockedSlots[3],
    };
    this.commit({
      ...this.state,
      slots,
      slotOrder: archive.slotOrder,
      lockedSlots,
      recentPresets: merged,
      selectedRecentIndex: 0,
    });
    return archive.presets.length + ([archive.slots[1], archive.slots[2], archive.slots[3]].filter(Boolean).length);
  }

  public replacePresetArchive(value: unknown): number {
    const archive = parseArchive(value);
    if (!archive) return 0;
    this.commit({
      ...this.state,
      slotOrder: [...archive.slotOrder],
      lockedSlots: { ...archive.lockedSlots },
      slots: { 1: archive.slots[1], 2: archive.slots[2], 3: archive.slots[3] },
      recentPresets: [...archive.presets],
      selectedRecentIndex: 0,
    });
    return archive.presets.length + ([archive.slots[1], archive.slots[2], archive.slots[3]].filter(Boolean).length);
  }

  public clearSelectedSlot(): void {
    if (this.state.lockedSlots[this.state.selectedSlot]) return;
    this.commit({
      ...this.state,
      slots: { ...this.state.slots, [this.state.selectedSlot]: undefined },
    });
  }

  private createPreset(
    dyePreset: CharacterDyePreset,
    savedAt: number,
    name: string,
    favorite: boolean,
    id = createPresetId(savedAt, this.state),
  ): CharacterAppearancePreset {
    return {
      id,
      name: normalizePresetName(name, '외형 프리셋'),
      favorite,
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
      selectedRecentIndex: remember ? 0 : this.state.selectedRecentIndex,
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

export function characterAppearanceFocusLabel(value: CharacterAppearanceFocusPart): string {
  if (value === 'weapon') return '무기 확대';
  if (value === 'armor') return '갑주 확대';
  if (value === 'cape') return '망토 확대';
  if (value === 'rune') return '룬 확대';
  return '전신 비교';
}

export function characterPreviewZoomLabel(value: CharacterPreviewZoom): string {
  if (value === 'close') return 'CLOSE 120%';
  if (value === 'detail') return 'DETAIL 142%';
  return 'FIT 100%';
}

export function characterPreviewZoomMultiplier(value: CharacterPreviewZoom): number {
  if (value === 'close') return 1.2;
  if (value === 'detail') return 1.42;
  return 1;
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
  return `${slot.favorite ? '★ ' : ''}${slot.name} · ${characterShowcasePoseLabel(slot.pose)} · ${characterDirectionLabel(slot.direction)} · ${date.toLocaleDateString('ko-KR')}`;
}

export function recentPresetUpdatedLabel(preset: CharacterAppearancePreset | undefined): string {
  if (!preset) return '최근 프리셋 없음';
  return `${preset.favorite ? '★ ' : ''}${preset.name} · ${characterCostumeSetLabel(preset.costumeSet)} · ${characterDirectionLabel(preset.direction)}`;
}

export function characterPresetSortLabel(value: CharacterPresetSort): string {
  if (value === 'favorite') return '즐겨찾기 우선';
  if (value === 'name') return '이름순';
  return '최근 수정순';
}

export function visibleCharacterAppearancePresets(
  state: Pick<CharacterWardrobeState, 'recentPresets' | 'presetSort' | 'presetQuery'>,
): readonly { readonly preset: CharacterAppearancePreset; readonly sourceIndex: number }[] {
  const query = normalizePresetQuery(state.presetQuery).toLocaleLowerCase('ko-KR');
  const entries = state.recentPresets
    .map((preset, sourceIndex) => ({ preset, sourceIndex }))
    .filter(({ preset }) => {
      if (!query) return true;
      const haystack = [
        preset.name,
        characterCostumeSetLabel(preset.costumeSet),
        characterDirectionLabel(preset.direction),
        characterShowcasePoseLabel(preset.pose),
      ].join(' ').toLocaleLowerCase('ko-KR');
      return haystack.includes(query);
    });
  return entries.sort((left, right) => {
    if (state.presetSort === 'name') {
      return left.preset.name.localeCompare(right.preset.name, 'ko-KR') || right.preset.savedAt - left.preset.savedAt;
    }
    if (state.presetSort === 'favorite') {
      return Number(right.preset.favorite) - Number(left.preset.favorite) || right.preset.savedAt - left.preset.savedAt;
    }
    return right.preset.savedAt - left.preset.savedAt || Number(right.preset.favorite) - Number(left.preset.favorite);
  });
}

export function wardrobeArchiveFilename(now = Date.now()): string {
  return `LUMERIFT_APPEARANCE_PRESETS_${new Date(now).toISOString().replace(/[:.]/g, '-')}.json`;
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
    const focusPart = isFocusPart(parsed.focusPart) ? parsed.focusPart : 'full';
    const previewZoom = isPreviewZoom(parsed.previewZoom) ? parsed.previewZoom : 'fit';
    const parsedSlots = parsed.slots ?? {};
    const recentPresets = Array.isArray(parsed.recentPresets)
      ? parsed.recentPresets.map(parseSlot).filter((value): value is CharacterAppearancePreset => Boolean(value)).slice(0, MAX_RECENT_PRESETS)
      : [];
    const selectedRecentIndex = clampIndex(finiteIndex(parsed.selectedRecentIndex), recentPresets.length);
    const presetSort = isPresetSort(parsed.presetSort) ? parsed.presetSort : 'updated';
    const presetQuery = normalizePresetQuery(parsed.presetQuery);
    const slotOrder = parseSlotOrder(parsed.slotOrder);
    const lockedSlots = parseLockedSlots(parsed.lockedSlots);
    return {
      selectedSlot,
      pose,
      direction,
      costumeSet,
      dyeChannels,
      comparisonSlot,
      comparisonIndexes,
      focusPart,
      previewZoom,
      selectedRecentIndex,
      presetSort,
      presetQuery,
      slotOrder,
      lockedSlots,
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

function parseArchive(value: unknown): CharacterWardrobeArchive | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Omit<Partial<CharacterWardrobeArchive>, 'schemaVersion'> & { readonly schemaVersion?: number };
  if ((record.schemaVersion !== 1 && record.schemaVersion !== 2 && record.schemaVersion !== 3) || record.game !== 'LUMERIFT' || record.kind !== 'character-appearance-presets') return undefined;
  const rawSlots = record.slots ?? {};
  const presets = Array.isArray(record.presets)
    ? record.presets.map(parseSlot).filter((preset): preset is CharacterAppearancePreset => Boolean(preset)).slice(0, MAX_RECENT_PRESETS)
    : [];
  return {
    schemaVersion: 3,
    game: 'LUMERIFT',
    kind: 'character-appearance-presets',
    exportedAt: typeof record.exportedAt === 'number' ? record.exportedAt : Date.now(),
    slotOrder: parseSlotOrder(record.slotOrder),
    lockedSlots: parseLockedSlots(record.lockedSlots),
    slots: {
      1: parseSlot((rawSlots as Record<number, unknown>)[1]),
      2: parseSlot((rawSlots as Record<number, unknown>)[2]),
      3: parseSlot((rawSlots as Record<number, unknown>)[3]),
    },
    presets,
  };
}

function parseSlot(value: unknown): CharacterWardrobeSlot | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterAppearancePreset>;
  if (!isDyePreset(record.dyePreset) || !isPose(record.pose) || typeof record.savedAt !== 'number') return undefined;
  const direction = isDirection(record.direction) ? record.direction : 's';
  const costumeSet = isCostumeSet(record.costumeSet) ? record.costumeSet : 'scout-steel';
  const dyeChannels = parseDyeChannels(record.dyeChannels);
  return {
    id: typeof record.id === 'string' && record.id.trim() ? record.id : legacyPresetId(record.savedAt, record.dyePreset, record.pose, direction),
    name: normalizePresetName(record.name, '외형 프리셋'),
    favorite: record.favorite === true,
    dyePreset: record.dyePreset,
    pose: record.pose,
    direction,
    costumeSet,
    dyeChannels,
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

function parseSlotOrder(value: unknown): readonly CharacterWardrobeSlotId[] {
  if (!Array.isArray(value)) return [1, 2, 3];
  const order = value.filter(isSlotId);
  if (order.length !== 3 || new Set(order).size !== 3) return [1, 2, 3];
  return order;
}

function parseLockedSlots(value: unknown): Readonly<Record<CharacterWardrobeSlotId, boolean>> {
  if (!value || typeof value !== 'object') return { 1: false, 2: false, 3: false };
  const record = value as Partial<Record<CharacterWardrobeSlotId, unknown>>;
  return { 1: record[1] === true, 2: record[2] === true, 3: record[3] === true };
}

function normalizePresetQuery(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, 24);
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

function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(0, Math.min(count - 1, Math.floor(index)));
}

function mergeRecentPreset(
  preset: CharacterAppearancePreset,
  current: readonly CharacterAppearancePreset[],
): readonly CharacterAppearancePreset[] {
  const signature = presetSignature(preset);
  const existing = current.find((entry) => presetSignature(entry) === signature);
  const merged = existing
    ? {
      ...preset,
      id: existing.id,
      name: existing.name === '최근 외형' ? preset.name : existing.name,
      favorite: existing.favorite || preset.favorite,
    }
    : preset;
  const remaining = current.filter((entry) => presetSignature(entry) !== signature);
  const favorites = [merged, ...remaining].filter((entry) => entry.favorite);
  const normal = [merged, ...remaining].filter((entry) => !entry.favorite);
  return [...favorites, ...normal].slice(0, MAX_RECENT_PRESETS);
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

function createPresetId(savedAt: number, state: CharacterWardrobeState): string {
  return `appearance-${Math.floor(savedAt).toString(36)}-${state.pose}-${state.direction}-${state.costumeSet}`;
}

function legacyPresetId(savedAt: number, dyePreset: CharacterDyePreset, pose: CharacterShowcasePose, direction: DirectionId): string {
  return `appearance-${Math.floor(savedAt).toString(36)}-${dyePreset}-${pose}-${direction}`;
}

function normalizePresetName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().replace(/\s+/g, ' ').slice(0, 24);
  return normalized || fallback;
}

function mapMatchingSlots(
  slots: CharacterWardrobeState['slots'],
  id: string,
  map: (slot: CharacterWardrobeSlot) => CharacterWardrobeSlot,
): CharacterWardrobeState['slots'] {
  return {
    1: slots[1]?.id === id ? map(slots[1]) : slots[1],
    2: slots[2]?.id === id ? map(slots[2]) : slots[2],
    3: slots[3]?.id === id ? map(slots[3]) : slots[3],
  };
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

function isFocusPart(value: unknown): value is CharacterAppearanceFocusPart {
  return FOCUS_ORDER.includes(value as CharacterAppearanceFocusPart);
}

function isPreviewZoom(value: unknown): value is CharacterPreviewZoom {
  return ZOOM_ORDER.includes(value as CharacterPreviewZoom);
}

function isDyePreset(value: unknown): value is CharacterDyePreset {
  return value === 'heir-gold' || value === 'rift-azure' || value === 'abyss-violet' || value === 'moon-silver';
}

function isPresetSort(value: unknown): value is CharacterPresetSort {
  return PRESET_SORT_ORDER.includes(value as CharacterPresetSort);
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

import type {
  CharacterAppearancePreset,
  CharacterWardrobeArchive,
  CharacterWardrobeSlot,
  CharacterWardrobeSlotId,
} from './CharacterWardrobeController';

export type CharacterAppearanceMergeSource = 'local' | 'remote' | 'newer';
export type CharacterAppearanceLockMerge = 'local' | 'remote' | 'union';
export type CharacterAppearancePresetMerge = 'local' | 'remote' | 'merge';

export interface CharacterAppearanceMergePlan {
  readonly slots: Readonly<Record<CharacterWardrobeSlotId, CharacterAppearanceMergeSource>>;
  readonly slotOrder: Exclude<CharacterAppearanceMergeSource, 'newer'>;
  readonly lockedSlots: CharacterAppearanceLockMerge;
  readonly presets: CharacterAppearancePresetMerge;
}

export interface CharacterAppearanceSlotDifference {
  readonly slot: CharacterWardrobeSlotId;
  readonly status: 'identical' | 'local-only' | 'remote-only' | 'different';
  readonly changedFields: readonly string[];
  readonly localName?: string;
  readonly remoteName?: string;
  readonly localLocked: boolean;
  readonly remoteLocked: boolean;
}

export interface CharacterAppearanceConflictPreview {
  readonly slotDifferences: readonly CharacterAppearanceSlotDifference[];
  readonly slotOrderChanged: boolean;
  readonly lockedSlotsChanged: boolean;
  readonly localPresetCount: number;
  readonly remotePresetCount: number;
  readonly sharedPresetCount: number;
  readonly localOnlyPresetCount: number;
  readonly remoteOnlyPresetCount: number;
  readonly changedPresetCount: number;
  readonly totalDifferenceCount: number;
}


export interface CharacterAppearanceMergeSimulationSlot {
  readonly slot: CharacterWardrobeSlotId;
  readonly requestedSource: CharacterAppearanceMergeSource;
  readonly effectiveSource: 'local' | 'remote' | 'empty';
  readonly protectedByLocalLock: boolean;
  readonly resultName?: string;
  readonly changedFields: readonly string[];
}

export interface CharacterAppearanceMergeSimulation {
  readonly archive: CharacterWardrobeArchive;
  readonly preview: CharacterAppearanceConflictPreview;
  readonly slots: readonly CharacterAppearanceMergeSimulationSlot[];
  readonly resultPresetCount: number;
  readonly resultLockedCount: number;
  readonly resultSummary: readonly string[];
}

export const DEFAULT_CHARACTER_APPEARANCE_MERGE_PLAN: CharacterAppearanceMergePlan = {
  slots: { 1: 'newer', 2: 'newer', 3: 'newer' },
  slotOrder: 'local',
  lockedSlots: 'union',
  presets: 'merge',
};

export function previewCharacterAppearanceConflict(
  local: CharacterWardrobeArchive,
  remote: CharacterWardrobeArchive,
): CharacterAppearanceConflictPreview {
  const slotDifferences = ([1, 2, 3] as const).map((slot) => compareSlot(
    slot,
    local.slots[slot],
    remote.slots[slot],
    local.lockedSlots[slot],
    remote.lockedSlots[slot],
  ));
  const localMap = new Map(local.presets.map((preset) => [preset.id, preset]));
  const remoteMap = new Map(remote.presets.map((preset) => [preset.id, preset]));
  let sharedPresetCount = 0;
  let changedPresetCount = 0;
  for (const [id, localPreset] of localMap) {
    const remotePreset = remoteMap.get(id);
    if (!remotePreset) continue;
    sharedPresetCount += 1;
    if (!presetEquals(localPreset, remotePreset)) changedPresetCount += 1;
  }
  const localOnlyPresetCount = [...localMap.keys()].filter((id) => !remoteMap.has(id)).length;
  const remoteOnlyPresetCount = [...remoteMap.keys()].filter((id) => !localMap.has(id)).length;
  const slotOrderChanged = local.slotOrder.join('|') !== remote.slotOrder.join('|');
  const lockedSlotsChanged = ([1, 2, 3] as const).some((slot) => local.lockedSlots[slot] !== remote.lockedSlots[slot]);
  const totalDifferenceCount = slotDifferences.filter((entry) => entry.status !== 'identical').length
    + Number(slotOrderChanged)
    + Number(lockedSlotsChanged)
    + localOnlyPresetCount
    + remoteOnlyPresetCount
    + changedPresetCount;
  return {
    slotDifferences,
    slotOrderChanged,
    lockedSlotsChanged,
    localPresetCount: local.presets.length,
    remotePresetCount: remote.presets.length,
    sharedPresetCount,
    localOnlyPresetCount,
    remoteOnlyPresetCount,
    changedPresetCount,
    totalDifferenceCount,
  };
}

export function mergeCharacterAppearanceArchives(
  local: CharacterWardrobeArchive,
  remote: CharacterWardrobeArchive,
  plan: CharacterAppearanceMergePlan,
  now = Date.now(),
): CharacterWardrobeArchive {
  const slots: Record<CharacterWardrobeSlotId, CharacterWardrobeSlot | undefined> = {
    1: chooseSlot(1, local, remote, plan.slots[1]),
    2: chooseSlot(2, local, remote, plan.slots[2]),
    3: chooseSlot(3, local, remote, plan.slots[3]),
  };
  const lockedSlots = mergeLockedSlots(local, remote, plan.lockedSlots);
  return {
    schemaVersion: 3,
    game: 'LUMERIFT',
    kind: 'character-appearance-presets',
    exportedAt: Math.max(1, Math.floor(now)),
    slotOrder: [...(plan.slotOrder === 'remote' ? remote.slotOrder : local.slotOrder)],
    lockedSlots,
    slots,
    presets: mergePresets(local.presets, remote.presets, plan.presets),
  };
}

export function simulateCharacterAppearanceMerge(
  local: CharacterWardrobeArchive,
  remote: CharacterWardrobeArchive,
  plan: CharacterAppearanceMergePlan,
  now = Date.now(),
): CharacterAppearanceMergeSimulation {
  const archive = mergeCharacterAppearanceArchives(local, remote, plan, now);
  const preview = previewCharacterAppearanceConflict(local, remote);
  const slots = ([1, 2, 3] as const).map((slot): CharacterAppearanceMergeSimulationSlot => {
    const result = archive.slots[slot];
    const protectedByLocalLock = local.lockedSlots[slot];
    const requestedSource = plan.slots[slot];
    const effectiveSource = resolveEffectiveSlotSource(slot, local, remote, result, protectedByLocalLock);
    return {
      slot,
      requestedSource,
      effectiveSource,
      protectedByLocalLock,
      resultName: result?.name,
      changedFields: preview.slotDifferences.find((entry) => entry.slot === slot)?.changedFields ?? [],
    };
  });
  const resultLockedCount = ([1, 2, 3] as const).filter((slot) => archive.lockedSlots[slot]).length;
  const resultSummary = [
    `슬롯 결과 ${slots.filter((entry) => entry.effectiveSource !== 'empty').length}/3`,
    `고정 슬롯 ${resultLockedCount}/3`,
    `최근 프리셋 ${archive.presets.length}/5`,
    `순서 ${archive.slotOrder.map((slot) => `S${slot}`).join(' → ')}`,
  ];
  return {
    archive,
    preview,
    slots,
    resultPresetCount: archive.presets.length,
    resultLockedCount,
    resultSummary,
  };
}

function resolveEffectiveSlotSource(
  slot: CharacterWardrobeSlotId,
  local: CharacterWardrobeArchive,
  remote: CharacterWardrobeArchive,
  result: CharacterWardrobeSlot | undefined,
  protectedByLocalLock: boolean,
): 'local' | 'remote' | 'empty' {
  if (!result) return 'empty';
  if (protectedByLocalLock) return 'local';
  const localSlot = local.slots[slot];
  const remoteSlot = remote.slots[slot];
  if (localSlot && JSON.stringify(canonicalPreset(localSlot)) === JSON.stringify(canonicalPreset(result))) return 'local';
  if (remoteSlot && JSON.stringify(canonicalPreset(remoteSlot)) === JSON.stringify(canonicalPreset(result))) return 'remote';
  if (!localSlot && remoteSlot) return 'remote';
  return 'local';
}

export function characterAppearanceMergeSourceLabel(source: CharacterAppearanceMergeSource): string {
  if (source === 'remote') return 'CLOUD';
  if (source === 'newer') return '최신';
  return '로컬';
}

export function characterAppearanceLockMergeLabel(source: CharacterAppearanceLockMerge): string {
  if (source === 'remote') return 'CLOUD';
  if (source === 'union') return '고정 합집합';
  return '로컬';
}

export function characterAppearancePresetMergeLabel(source: CharacterAppearancePresetMerge): string {
  if (source === 'remote') return 'CLOUD';
  if (source === 'merge') return '선택 병합';
  return '로컬';
}

export function cycleCharacterAppearanceMergeSource(source: CharacterAppearanceMergeSource): CharacterAppearanceMergeSource {
  if (source === 'local') return 'remote';
  if (source === 'remote') return 'newer';
  return 'local';
}

export function cycleCharacterAppearanceLockMerge(source: CharacterAppearanceLockMerge): CharacterAppearanceLockMerge {
  if (source === 'local') return 'remote';
  if (source === 'remote') return 'union';
  return 'local';
}

export function cycleCharacterAppearancePresetMerge(source: CharacterAppearancePresetMerge): CharacterAppearancePresetMerge {
  if (source === 'local') return 'remote';
  if (source === 'remote') return 'merge';
  return 'local';
}

function chooseSlot(
  slot: CharacterWardrobeSlotId,
  local: CharacterWardrobeArchive,
  remote: CharacterWardrobeArchive,
  source: CharacterAppearanceMergeSource,
): CharacterWardrobeSlot | undefined {
  const localSlot = local.slots[slot];
  const remoteSlot = remote.slots[slot];
  if (local.lockedSlots[slot]) return cloneSlot(localSlot);
  if (source === 'local') return cloneSlot(localSlot);
  if (source === 'remote') return cloneSlot(remoteSlot);
  if (!localSlot) return cloneSlot(remoteSlot);
  if (!remoteSlot) return cloneSlot(localSlot);
  return cloneSlot(remoteSlot.savedAt > localSlot.savedAt ? remoteSlot : localSlot);
}

function mergeLockedSlots(
  local: CharacterWardrobeArchive,
  remote: CharacterWardrobeArchive,
  source: CharacterAppearanceLockMerge,
): Readonly<Record<CharacterWardrobeSlotId, boolean>> {
  if (source === 'local') return { ...local.lockedSlots };
  if (source === 'remote') return { ...remote.lockedSlots };
  return {
    1: local.lockedSlots[1] || remote.lockedSlots[1],
    2: local.lockedSlots[2] || remote.lockedSlots[2],
    3: local.lockedSlots[3] || remote.lockedSlots[3],
  };
}

function mergePresets(
  local: readonly CharacterAppearancePreset[],
  remote: readonly CharacterAppearancePreset[],
  source: CharacterAppearancePresetMerge,
): readonly CharacterAppearancePreset[] {
  if (source === 'local') return local.map(clonePreset).slice(0, 5);
  if (source === 'remote') return remote.map(clonePreset).slice(0, 5);
  const byIdentity = new Map<string, CharacterAppearancePreset>();
  for (const preset of [...local, ...remote]) {
    const identity = presetIdentity(preset);
    const current = byIdentity.get(identity);
    if (!current) {
      byIdentity.set(identity, clonePreset(preset));
      continue;
    }
    const newer = preset.savedAt > current.savedAt ? preset : current;
    byIdentity.set(identity, {
      ...clonePreset(newer),
      favorite: current.favorite || preset.favorite,
      name: choosePresetName(current, preset, newer),
    });
  }
  return [...byIdentity.values()]
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.savedAt - a.savedAt || a.name.localeCompare(b.name, 'ko'))
    .slice(0, 5);
}

function compareSlot(
  slot: CharacterWardrobeSlotId,
  local: CharacterWardrobeSlot | undefined,
  remote: CharacterWardrobeSlot | undefined,
  localLocked: boolean,
  remoteLocked: boolean,
): CharacterAppearanceSlotDifference {
  if (!local && !remote) {
    return { slot, status: 'identical', changedFields: [], localLocked, remoteLocked };
  }
  if (local && !remote) {
    return { slot, status: 'local-only', changedFields: ['preset'], localName: local.name, localLocked, remoteLocked };
  }
  if (!local && remote) {
    return { slot, status: 'remote-only', changedFields: ['preset'], remoteName: remote.name, localLocked, remoteLocked };
  }
  const localSlot = local as CharacterWardrobeSlot;
  const remoteSlot = remote as CharacterWardrobeSlot;
  const changedFields = slotChangedFields(localSlot, remoteSlot);
  return {
    slot,
    status: changedFields.length ? 'different' : 'identical',
    changedFields,
    localName: localSlot.name,
    remoteName: remoteSlot.name,
    localLocked,
    remoteLocked,
  };
}

function slotChangedFields(local: CharacterWardrobeSlot, remote: CharacterWardrobeSlot): readonly string[] {
  const fields: string[] = [];
  if (local.name !== remote.name) fields.push('name');
  if (local.favorite !== remote.favorite) fields.push('favorite');
  if (local.dyePreset !== remote.dyePreset) fields.push('dye');
  if (local.pose !== remote.pose) fields.push('pose');
  if (local.direction !== remote.direction) fields.push('direction');
  if (local.costumeSet !== remote.costumeSet) fields.push('costume');
  if (local.dyeChannels.primary !== remote.dyeChannels.primary
    || local.dyeChannels.secondary !== remote.dyeChannels.secondary
    || local.dyeChannels.rune !== remote.dyeChannels.rune) fields.push('channels');
  return fields;
}

function presetEquals(local: CharacterAppearancePreset, remote: CharacterAppearancePreset): boolean {
  return JSON.stringify(canonicalPreset(local)) === JSON.stringify(canonicalPreset(remote));
}

function canonicalPreset(preset: CharacterAppearancePreset): object {
  return {
    id: preset.id,
    name: preset.name,
    favorite: preset.favorite,
    dyePreset: preset.dyePreset,
    pose: preset.pose,
    direction: preset.direction,
    costumeSet: preset.costumeSet,
    dyeChannels: preset.dyeChannels,
    savedAt: preset.savedAt,
  };
}

function presetIdentity(preset: CharacterAppearancePreset): string {
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

function choosePresetName(
  first: CharacterAppearancePreset,
  second: CharacterAppearancePreset,
  newer: CharacterAppearancePreset,
): string {
  const meaningful = [first, second]
    .filter((preset) => preset.name !== '최근 외형')
    .sort((a, b) => b.savedAt - a.savedAt)[0];
  return meaningful?.name ?? newer.name;
}

function cloneSlot(slot: CharacterWardrobeSlot | undefined): CharacterWardrobeSlot | undefined {
  return slot ? clonePreset(slot) : undefined;
}

function clonePreset(preset: CharacterAppearancePreset): CharacterAppearancePreset {
  return { ...preset, dyeChannels: { ...preset.dyeChannels } };
}

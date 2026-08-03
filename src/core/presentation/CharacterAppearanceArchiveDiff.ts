import { characterAppearanceArchiveRevision } from './CharacterAppearanceCloudSync';
import {
  previewCharacterAppearanceConflict,
  type CharacterAppearanceSlotDifference,
} from './CharacterAppearanceConflictResolver';
import type {
  CharacterAppearancePreset,
  CharacterWardrobeArchive,
  CharacterWardrobeSlotId,
} from './CharacterWardrobeController';

export interface CharacterAppearancePresetDifference {
  readonly id: string;
  readonly status: 'left-only' | 'right-only' | 'changed';
  readonly leftName?: string;
  readonly rightName?: string;
  readonly changedFields: readonly string[];
}

export interface CharacterAppearanceArchiveDifference {
  readonly schema: 'lumerift-character-appearance-diff-v1';
  readonly createdAt: number;
  readonly leftRevision: string;
  readonly rightRevision: string;
  readonly slotDifferences: readonly CharacterAppearanceSlotDifference[];
  readonly slotOrderChanged: boolean;
  readonly leftSlotOrder: readonly CharacterWardrobeSlotId[];
  readonly rightSlotOrder: readonly CharacterWardrobeSlotId[];
  readonly lockChanges: readonly CharacterWardrobeSlotId[];
  readonly presetDifferences: readonly CharacterAppearancePresetDifference[];
  readonly summary: {
    readonly changedSlots: number;
    readonly changedLocks: number;
    readonly changedPresets: number;
    readonly totalDifferences: number;
  };
}

export function compareCharacterAppearanceArchives(
  left: CharacterWardrobeArchive,
  right: CharacterWardrobeArchive,
  now = Date.now(),
): CharacterAppearanceArchiveDifference {
  const preview = previewCharacterAppearanceConflict(left, right);
  const lockChanges = ([1, 2, 3] as const).filter((slot) => left.lockedSlots[slot] !== right.lockedSlots[slot]);
  const presetDifferences = comparePresets(left.presets, right.presets);
  const changedSlots = preview.slotDifferences.filter((entry) => entry.status !== 'identical').length;
  const totalDifferences = changedSlots
    + Number(preview.slotOrderChanged)
    + lockChanges.length
    + presetDifferences.length;
  return {
    schema: 'lumerift-character-appearance-diff-v1',
    createdAt: Math.max(1, Math.floor(now)),
    leftRevision: characterAppearanceArchiveRevision(left),
    rightRevision: characterAppearanceArchiveRevision(right),
    slotDifferences: preview.slotDifferences,
    slotOrderChanged: preview.slotOrderChanged,
    leftSlotOrder: [...left.slotOrder],
    rightSlotOrder: [...right.slotOrder],
    lockChanges,
    presetDifferences,
    summary: {
      changedSlots,
      changedLocks: lockChanges.length,
      changedPresets: presetDifferences.length,
      totalDifferences,
    },
  };
}

export function characterAppearanceDifferenceFieldLabel(value: string): string {
  const labels: Readonly<Record<string, string>> = {
    name: '이름',
    favorite: '즐겨찾기',
    dye: '염색',
    pose: '포즈',
    direction: '방향',
    costume: '세트',
    channels: '채널',
    preset: '프리셋',
    savedAt: '저장 시각',
  };
  return labels[value] ?? value;
}

function comparePresets(
  left: readonly CharacterAppearancePreset[],
  right: readonly CharacterAppearancePreset[],
): readonly CharacterAppearancePresetDifference[] {
  const leftMap = new Map(left.map((preset) => [preset.id, preset]));
  const rightMap = new Map(right.map((preset) => [preset.id, preset]));
  const ids = [...new Set([...leftMap.keys(), ...rightMap.keys()])].sort((a, b) => a.localeCompare(b));
  const differences: CharacterAppearancePresetDifference[] = [];
  for (const id of ids) {
    const leftPreset = leftMap.get(id);
    const rightPreset = rightMap.get(id);
    if (leftPreset && !rightPreset) {
      differences.push({ id, status: 'left-only', leftName: leftPreset.name, changedFields: ['preset'] });
      continue;
    }
    if (!leftPreset && rightPreset) {
      differences.push({ id, status: 'right-only', rightName: rightPreset.name, changedFields: ['preset'] });
      continue;
    }
    if (!leftPreset || !rightPreset) continue;
    const changedFields = presetChangedFields(leftPreset, rightPreset);
    if (changedFields.length) {
      differences.push({
        id,
        status: 'changed',
        leftName: leftPreset.name,
        rightName: rightPreset.name,
        changedFields,
      });
    }
  }
  return differences;
}

function presetChangedFields(left: CharacterAppearancePreset, right: CharacterAppearancePreset): readonly string[] {
  const fields: string[] = [];
  if (left.name !== right.name) fields.push('name');
  if (left.favorite !== right.favorite) fields.push('favorite');
  if (left.dyePreset !== right.dyePreset) fields.push('dye');
  if (left.pose !== right.pose) fields.push('pose');
  if (left.direction !== right.direction) fields.push('direction');
  if (left.costumeSet !== right.costumeSet) fields.push('costume');
  if (left.dyeChannels.primary !== right.dyeChannels.primary
    || left.dyeChannels.secondary !== right.dyeChannels.secondary
    || left.dyeChannels.rune !== right.dyeChannels.rune) fields.push('channels');
  if (left.savedAt !== right.savedAt) fields.push('savedAt');
  return fields;
}

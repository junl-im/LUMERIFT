import { STORAGE_KEYS } from '../../app/brand';

export type CharacterDyePreset = 'heir-gold' | 'rift-azure' | 'abyss-violet' | 'moon-silver';

export interface CharacterDyeProfile {
  readonly id: CharacterDyePreset;
  readonly label: string;
  readonly primaryColor: number;
  readonly secondaryColor: number;
  readonly runeColor: number;
  readonly weaponTrailColor: number;
  readonly tint: number;
}

const ORDER: readonly CharacterDyePreset[] = ['heir-gold', 'rift-azure', 'abyss-violet', 'moon-silver'];

const PROFILES: Readonly<Record<CharacterDyePreset, CharacterDyeProfile>> = {
  'heir-gold': {
    id: 'heir-gold',
    label: '계승자 골드',
    primaryColor: 0xc88cff,
    secondaryColor: 0xffd77c,
    runeColor: 0xffe4a5,
    weaponTrailColor: 0xffcf70,
    tint: 0xfff4dc,
  },
  'rift-azure': {
    id: 'rift-azure',
    label: '균열 애저',
    primaryColor: 0x47d9ff,
    secondaryColor: 0x72ffe5,
    runeColor: 0xb8fff4,
    weaponTrailColor: 0x5aeaff,
    tint: 0xe2ffff,
  },
  'abyss-violet': {
    id: 'abyss-violet',
    label: '심연 바이올렛',
    primaryColor: 0x9c72ff,
    secondaryColor: 0xf08cff,
    runeColor: 0xffc2ff,
    weaponTrailColor: 0xc783ff,
    tint: 0xf5e7ff,
  },
  'moon-silver': {
    id: 'moon-silver',
    label: '월광 실버',
    primaryColor: 0xaec9d7,
    secondaryColor: 0xf0f7f4,
    runeColor: 0x9ff5e8,
    weaponTrailColor: 0xd9ffff,
    tint: 0xf6ffff,
  },
};

export class CharacterDyeController {
  private value: CharacterDyePreset;

  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {
    const stored = storage?.getItem(STORAGE_KEYS.characterDyePreset);
    this.value = isCharacterDyePreset(stored) ? stored : 'heir-gold';
    this.applyDocumentState();
  }

  public get current(): CharacterDyePreset {
    return this.value;
  }

  public get profile(): CharacterDyeProfile {
    return PROFILES[this.value];
  }

  public cycle(): CharacterDyePreset {
    const index = ORDER.indexOf(this.value);
    this.set(ORDER[(index + 1) % ORDER.length] ?? 'heir-gold');
    return this.value;
  }

  public set(value: CharacterDyePreset): void {
    this.value = value;
    this.storage?.setItem(STORAGE_KEYS.characterDyePreset, value);
    this.applyDocumentState();
  }

  private applyDocumentState(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.characterDye = this.value;
  }
}

export function characterDyeLabel(value: CharacterDyePreset): string {
  return PROFILES[value].label;
}

export function resolveCharacterDyeProfile(value: CharacterDyePreset): CharacterDyeProfile {
  return PROFILES[value];
}

function isCharacterDyePreset(value: string | null | undefined): value is CharacterDyePreset {
  return value === 'heir-gold' || value === 'rift-azure' || value === 'abyss-violet' || value === 'moon-silver';
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

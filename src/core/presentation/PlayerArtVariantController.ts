import { STORAGE_KEYS } from '../../app/brand';

export type PlayerArtVariant = 'detail' | 'owned-preview' | 'owned-painted';

const ORDER: readonly PlayerArtVariant[] = ['detail', 'owned-preview', 'owned-painted'];

export class PlayerArtVariantController {
  private value: PlayerArtVariant;

  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {
    const stored = storage?.getItem(STORAGE_KEYS.playerArtVariant);
    this.value = isPlayerArtVariant(stored) ? stored : 'detail';
    this.applyDocumentState();
  }

  public get current(): PlayerArtVariant {
    return this.value;
  }

  public cycle(): PlayerArtVariant {
    const index = ORDER.indexOf(this.value);
    this.set(ORDER[(index + 1) % ORDER.length] ?? 'detail');
    return this.value;
  }

  public set(variant: PlayerArtVariant): void {
    this.value = variant;
    this.storage?.setItem(STORAGE_KEYS.playerArtVariant, variant);
    this.applyDocumentState();
  }

  private applyDocumentState(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.playerArtVariant = this.value;
  }
}

export function playerArtVariantLabel(variant: PlayerArtVariant): string {
  if (variant === 'owned-preview') return '전용 모션 미리보기';
  if (variant === 'owned-painted') return '전용 도색 후보';
  return '고급 기본 원화';
}

function isPlayerArtVariant(value: string | null | undefined): value is PlayerArtVariant {
  return value === 'detail' || value === 'owned-preview' || value === 'owned-painted';
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

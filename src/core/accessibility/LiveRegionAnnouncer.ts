export type AnnouncementPriority = 'polite' | 'assertive';

export interface AssistiveAnnouncement {
  readonly message: string;
  readonly priority?: AnnouncementPriority;
  readonly dedupeMs?: number;
}

export class LiveRegionAnnouncer {
  private readonly polite?: HTMLDivElement;
  private readonly assertive?: HTMLDivElement;
  private lastMessage = '';
  private lastAt = 0;
  private sequence = 0;

  public constructor(private readonly documentRef: Document | undefined = resolveDocument()) {
    if (!documentRef) return;
    this.polite = createRegion(documentRef, 'polite');
    this.assertive = createRegion(documentRef, 'assertive');
    documentRef.body.append(this.polite, this.assertive);
  }

  public announce(input: AssistiveAnnouncement, enabled = true): boolean {
    if (!enabled || !this.documentRef || !input.message.trim()) return false;
    const now = Date.now();
    const dedupeMs = Math.max(0, input.dedupeMs ?? 900);
    if (input.message === this.lastMessage && now - this.lastAt < dedupeMs) return false;
    this.lastMessage = input.message;
    this.lastAt = now;
    this.sequence += 1;
    const target = input.priority === 'assertive' ? this.assertive : this.polite;
    if (!target) return false;
    target.textContent = '';
    const message = input.message;
    const sequence = this.sequence;
    queueMicrotask(() => {
      if (sequence === this.sequence && target.isConnected) target.textContent = message;
    });
    return true;
  }

  public clear(): void {
    this.sequence += 1;
    if (this.polite) this.polite.textContent = '';
    if (this.assertive) this.assertive.textContent = '';
  }

  public destroy(): void {
    this.clear();
    this.polite?.remove();
    this.assertive?.remove();
  }
}

function createRegion(documentRef: Document, priority: AnnouncementPriority): HTMLDivElement {
  const region = documentRef.createElement('div');
  region.dataset.lumeriftLiveRegion = priority;
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  Object.assign(region.style, {
    position: 'fixed',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  });
  return region;
}

function resolveDocument(): Document | undefined {
  return typeof document === 'undefined' ? undefined : document;
}

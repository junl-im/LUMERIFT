type Listener<T> = (payload: T) => void;

export class EventBus<Events extends object> {
  private readonly listeners = new Map<keyof Events, Set<Listener<never>>>();

  public on<Key extends keyof Events>(event: Key, listener: Listener<Events[Key]>): () => void {
    const group = this.listeners.get(event) ?? new Set<Listener<never>>();
    group.add(listener as Listener<never>);
    this.listeners.set(event, group);
    return () => this.off(event, listener);
  }

  public off<Key extends keyof Events>(event: Key, listener: Listener<Events[Key]>): void {
    this.listeners.get(event)?.delete(listener as Listener<never>);
  }

  public emit<Key extends keyof Events>(event: Key, payload: Events[Key]): void {
    for (const listener of this.listeners.get(event) ?? []) {
      (listener as Listener<Events[Key]>)(payload);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

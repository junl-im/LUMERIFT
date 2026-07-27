export class ObjectPool<T> {
  private readonly available: T[] = [];
  private readonly active = new Set<T>();

  public constructor(
    private readonly factory: () => T,
    initialSize = 0,
  ) {
    for (let index = 0; index < initialSize; index += 1) {
      this.available.push(this.factory());
    }
  }

  public acquire(): T {
    const value = this.available.pop() ?? this.factory();
    this.active.add(value);
    return value;
  }

  public release(value: T): void {
    if (!this.active.delete(value)) {
      return;
    }
    this.available.push(value);
  }

  public releaseAll(reset?: (value: T) => void): void {
    for (const value of this.active) {
      reset?.(value);
      this.available.push(value);
    }
    this.active.clear();
  }

  public get activeCount(): number {
    return this.active.size;
  }
}

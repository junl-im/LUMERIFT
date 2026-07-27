const PREVENT_DEFAULT_CODES = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space',
]);

export class InputManager {
  private readonly pressed = new Set<string>();
  private readonly justPressed = new Set<string>();
  private canvas?: HTMLCanvasElement;

  private readonly keyDown = (event: KeyboardEvent): void => {
    if (PREVENT_DEFAULT_CODES.has(event.code)) event.preventDefault();
    if (!this.pressed.has(event.code)) this.justPressed.add(event.code);
    this.pressed.add(event.code);
  };

  private readonly keyUp = (event: KeyboardEvent): void => {
    if (PREVENT_DEFAULT_CODES.has(event.code)) event.preventDefault();
    this.pressed.delete(event.code);
  };

  private readonly blur = (): void => {
    this.pressed.clear();
    this.justPressed.clear();
  };

  private readonly focusCanvas = (): void => {
    this.canvas?.focus({ preventScroll: true });
  };

  public attach(canvas: HTMLCanvasElement): void {
    this.detach();
    this.canvas = canvas;
    canvas.tabIndex = 0;
    canvas.addEventListener('pointerdown', this.focusCanvas);
    window.addEventListener('keydown', this.keyDown, { passive: false });
    window.addEventListener('keyup', this.keyUp, { passive: false });
    window.addEventListener('blur', this.blur);
  }

  public detach(): void {
    this.canvas?.removeEventListener('pointerdown', this.focusCanvas);
    window.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('keyup', this.keyUp);
    window.removeEventListener('blur', this.blur);
    this.pressed.clear();
    this.justPressed.clear();
    this.canvas = undefined;
  }

  public getAxis(): { x: number; y: number } {
    const left = this.isDown('ArrowLeft', 'KeyA') ? 1 : 0;
    const right = this.isDown('ArrowRight', 'KeyD') ? 1 : 0;
    const up = this.isDown('ArrowUp', 'KeyW') ? 1 : 0;
    const down = this.isDown('ArrowDown', 'KeyS') ? 1 : 0;
    const x = right - left;
    const y = down - up;
    const magnitude = Math.hypot(x, y);

    return magnitude > 0 ? { x: x / magnitude, y: y / magnitude } : { x: 0, y: 0 };
  }

  public isDown(...codes: string[]): boolean {
    return codes.some((code) => this.pressed.has(code));
  }

  public consumePressed(...codes: string[]): boolean {
    const matched = codes.find((code) => this.justPressed.has(code));
    if (!matched) return false;
    for (const code of codes) this.justPressed.delete(code);
    return true;
  }
}

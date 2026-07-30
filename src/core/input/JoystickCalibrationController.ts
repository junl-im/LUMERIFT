import { STORAGE_KEYS } from '../../app/brand';
import type { Vec2 } from '../../game/combat/geometry';

export type JoystickCalibrationMode = 'screen' | 'reverse' | 'invert-x' | 'invert-y';

const ORDER: readonly JoystickCalibrationMode[] = ['screen', 'invert-x', 'invert-y', 'reverse'];

export class JoystickCalibrationController {
  private value: JoystickCalibrationMode;

  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {
    const stored = storage?.getItem(STORAGE_KEYS.joystickCalibration);
    this.value = isJoystickCalibrationMode(stored) ? stored : 'screen';
    if (!isJoystickCalibrationMode(stored)) this.storage?.setItem(STORAGE_KEYS.joystickCalibration, 'screen');
    this.applyDocumentState();
  }

  public get current(): JoystickCalibrationMode {
    return this.value;
  }

  public cycle(): JoystickCalibrationMode {
    const index = ORDER.indexOf(this.value);
    this.set(ORDER[(index + 1) % ORDER.length] ?? 'screen');
    return this.value;
  }

  public set(mode: JoystickCalibrationMode): void {
    this.value = mode;
    this.storage?.setItem(STORAGE_KEYS.joystickCalibration, mode);
    this.applyDocumentState();
  }

  public apply(axis: Vec2): Vec2 {
    return applyJoystickCalibration(axis, this.value);
  }

  private applyDocumentState(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.joystickCalibration = this.value;
  }
}

export function applyJoystickCalibration(axis: Vec2, mode: JoystickCalibrationMode): Vec2 {
  switch (mode) {
    case 'screen':
      return { x: axis.x, y: axis.y };
    case 'invert-x':
      return { x: -axis.x, y: axis.y };
    case 'invert-y':
      return { x: axis.x, y: -axis.y };
    case 'reverse':
      return { x: -axis.x, y: -axis.y };
  }
}

export function joystickCalibrationLabel(mode: JoystickCalibrationMode): string {
  if (mode === 'screen') return '화면 기준(정상)';
  if (mode === 'invert-x') return '좌우 반전';
  if (mode === 'invert-y') return '상하 반전';
  return '상하·좌우 반전';
}

function isJoystickCalibrationMode(value: string | null | undefined): value is JoystickCalibrationMode {
  return value === 'screen' || value === 'reverse' || value === 'invert-x' || value === 'invert-y';
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

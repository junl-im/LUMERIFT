import type { Container } from 'pixi.js';
import type { AppContext } from '../../app/AppContext';

export interface Scene {
  readonly view: Container;
  enter(context: AppContext): Promise<void> | void;
  exit(): Promise<void> | void;
  update(deltaSeconds: number): void;
}

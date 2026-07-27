import type { AuthService } from '../services/auth/AuthService';
import type { InputManager } from '../core/input/InputManager';
import type { PerformanceMonitor } from '../core/performance/PerformanceMonitor';
import type { FrameRateController } from '../core/performance/FrameRateController';
import type { PlayerRepository } from '../repositories/PlayerRepository';
import type { SceneManager } from '../core/scenes/SceneManager';
import type { AssetManager } from '../core/assets/AssetManager';
import type { AudioManager } from '../core/audio/AudioManager';
import type { GameDataRegistry } from '../game/data/GameDataRegistry';
import type { GraphicsQualityController } from '../core/graphics/GraphicsQualityController';
import type { OperationsContentService } from '../services/operations/OperationsContentService';

export interface AppContext {
  readonly auth: AuthService;
  readonly input: InputManager;
  readonly performance: PerformanceMonitor;
  readonly frameRate: FrameRateController;
  readonly graphicsQuality: GraphicsQualityController;
  readonly gameData: GameDataRegistry;
  readonly playerRepository: PlayerRepository;
  readonly scenes: SceneManager;
  readonly assets: AssetManager;
  readonly audio: AudioManager;
  readonly operationsContent: OperationsContentService;
}

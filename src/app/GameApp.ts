import { Application, Container } from 'pixi.js';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from './constants';
import type { AppContext } from './AppContext';
import { SceneManager } from '../core/scenes/SceneManager';
import { InputManager } from '../core/input/InputManager';
import { PerformanceMonitor } from '../core/performance/PerformanceMonitor';
import { FrameRateController } from '../core/performance/FrameRateController';
import { FirebaseGateway } from '../services/firebase/FirebaseGateway';
import { AuthService } from '../services/auth/AuthService';
import { LocalPlayerRepository } from '../repositories/LocalPlayerRepository';
import { FirestorePlayerRepository } from '../repositories/FirestorePlayerRepository';
import { ResilientPlayerRepository } from '../repositories/ResilientPlayerRepository';
import { LocalManagedPlayerRepository } from '../repositories/LocalManagedPlayerRepository';
import { BootScene } from '../scenes/BootScene';
import { AssetManager } from '../core/assets/AssetManager';
import { AudioManager } from '../core/audio/AudioManager';
import { BRAND } from './brand';
import { GameDataRegistry } from '../game/data/GameDataRegistry';
import { GraphicsQualityController } from '../core/graphics/GraphicsQualityController';
import { MobileViewportController } from '../core/layout/MobileViewportController';
import { OperationsContentService } from '../services/operations/OperationsContentService';
import { RankingService } from '../services/ranking/RankingService';

export class GameApp {
  private readonly pixi = new Application();
  private readonly gameRoot = new Container();
  private readonly input = new InputManager();
  private readonly mobileViewport = new MobileViewportController();
  private resizeObserver?: ResizeObserver;
  private assets?: AssetManager;
  private audio?: AudioManager;
  private uiPressHandler?: EventListener;

  public constructor(private readonly host: HTMLDivElement) {}

  public async start(): Promise<void> {
    this.mobileViewport.start();
    const resolution = Math.min(window.devicePixelRatio || 1, 2);

    await this.pixi.init({
      background: COLORS.background,
      resizeTo: this.host,
      autoDensity: true,
      resolution,
      antialias: true,
      preference: 'webgl',
      powerPreference: 'high-performance',
    });

    const canvas = this.pixi.canvas as HTMLCanvasElement;
    canvas.setAttribute('aria-label', `${BRAND.fullTitle} 게임 캔버스`);
    this.host.appendChild(canvas);
    this.pixi.stage.addChild(this.gameRoot);

    const performance = new PerformanceMonitor();
    const assets = new AssetManager();
    const audio = new AudioManager();
    this.assets = assets;
    this.audio = audio;
    const frameRate = new FrameRateController(this.pixi.ticker, performance);
    const graphicsQuality = new GraphicsQualityController();
    const gameData = new GameDataRegistry();
    const firebase = new FirebaseGateway();
    await firebase.initialize();

    const auth = new AuthService(firebase);
    await auth.restoreSession();
    const localPlayerRepository = new LocalPlayerRepository();
    const playerRepository = firebase.isConfigured && firebase.db
      ? new ResilientPlayerRepository(localPlayerRepository, new FirestorePlayerRepository(firebase.db))
      : new LocalManagedPlayerRepository(localPlayerRepository);

    const operationsContent = new OperationsContentService(firebase.db);
    const ranking = new RankingService(firebase.db);

    const scenes = new SceneManager(this.gameRoot, {
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
    });

    const context: AppContext = {
      auth,
      input: this.input,
      performance,
      frameRate,
      graphicsQuality,
      gameData,
      playerRepository,
      scenes,
      assets,
      audio,
      operationsContent,
      ranking,
    };

    scenes.setContext(context);
    this.input.attach(canvas);
    canvas.addEventListener('pointerdown', () => { void audio.unlock(); }, { once: true });
    this.uiPressHandler = ((event: CustomEvent<string>) => {
      const url = event.detail;
      if (typeof url === 'string') void audio.play(url, 'ui').catch(() => undefined);
    }) as EventListener;
    window.addEventListener('lumerift:ui-press', this.uiPressHandler);

    this.pixi.ticker.add((ticker: { deltaMS: number }) => {
      const deltaSeconds = Math.min(ticker.deltaMS / 1000, 0.05);
      performance.sample(ticker.deltaMS);
      frameRate.update();
      scenes.update(deltaSeconds);
    });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();

    await scenes.change(() => new BootScene());

    window.addEventListener('pagehide', () => this.destroy(), { once: true });
  }

  private resize(): void {
    const screen = this.pixi.screen;
    const scale = Math.min(screen.width / DESIGN_WIDTH, screen.height / DESIGN_HEIGHT);

    this.gameRoot.scale.set(scale);
    this.gameRoot.position.set(
      Math.round((screen.width - DESIGN_WIDTH * scale) / 2),
      Math.round((screen.height - DESIGN_HEIGHT * scale) / 2),
    );

    this.gameRoot.hitArea = {
      contains: (x: number, y: number) => x >= 0 && y >= 0 && x <= DESIGN_WIDTH && y <= DESIGN_HEIGHT,
    };
  }

  private destroy(): void {
    this.resizeObserver?.disconnect();
    this.mobileViewport.destroy();
    this.input.detach();
    if (this.uiPressHandler) window.removeEventListener('lumerift:ui-press', this.uiPressHandler);
    this.audio?.release();
    void this.assets?.unloadAll();
    this.pixi.destroy({ removeView: true }, { children: true });
  }
}

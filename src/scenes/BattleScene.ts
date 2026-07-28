import { Container, Graphics, Sprite, Text, TextStyle, type FederatedPointerEvent, type Spritesheet, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { ObjectPool } from '../core/pooling/ObjectPool';
import { ASSET_PATHS, BATTLE_CHAPTER_1_BUNDLE } from '../core/assets/AssetCatalog';
import { CombatActionButton } from '../ui/CombatActionButton';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { createRasterPanel } from '../ui/UiSkin';
import { BattleVfxSystem } from '../game/presentation/BattleVfxSystem';
import { normalizeBossPhase, resolveStageVisualProfile, type StageVisualProfile } from '../game/presentation/StageVisualProfile';
import { bossCinematicAlpha, resolveBossPhasePresentation } from '../game/presentation/BossPhaseDirector';
import type { GraphicsQualityPreset } from '../core/graphics/GraphicsQualityController';
import { PlayerCombatController } from '../game/actors/player/PlayerCombatController';
import { MonsterController } from '../game/actors/monsters/MonsterController';
import { CombatCamera } from '../game/camera/CombatCamera';
import type {
  CombatActionConfig,
  MonsterDefinition,
  PlayerCombatConfig,
  StageConfig,
} from '../game/combat/combatData';
import { calculateDamage } from '../game/combat/damage';
import {
  clampPosition,
  normalize,
  type Vec2,
} from '../game/combat/geometry';
import { buildArcPolygon, createAttackFootprint, footprintContainsCircle } from '../game/combat/attackFootprint';
import {
  createArenaDecorations,
  MonsterActorView,
  PlayerActorView,
} from '../game/presentation/BattleActorView';
import { applyStageVictory, resolveStageDrops } from '../game/progression/battleRewards';
import { buildPlayerCombatConfig, ensureStarterInventory } from '../game/items/inventoryLogic';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';
import { ResultScene, type BattleOutcome } from './ResultScene';
import type { AccessibilitySettings, CombatAccessibilityPalette } from '../core/accessibility/AccessibilityController';

interface EnemyActor {
  readonly controller: MonsterController;
  readonly presentation: MonsterActorView;
  readonly definition: MonsterDefinition;
  flashRemaining: number;
  deathElapsed: number;
  countedDead: boolean;
}

interface FloatingText {
  readonly text: Text;
  life: number;
  maxLife: number;
}

interface CombatEffect {
  readonly view: Graphics;
  life: number;
  maxLife: number;
}

const BATTLE_TOP = 160;
const BATTLE_BOTTOM = 785;

export class BattleScene implements Scene {
  public readonly view = new Container();

  private readonly world = new Container();
  private readonly hud = new Container();
  private playerPresentation?: PlayerActorView;
  private playerSheet?: Spritesheet;
  private monsterSheet?: Spritesheet;
  private effectsSheet?: Spritesheet;
  private equipmentSheet?: Spritesheet;
  private mapTexture?: Texture;
  private readonly bossPortraitTextures: Partial<Record<1 | 2 | 3, Texture>> = {};
  private bossPortraitSprite?: Sprite;
  private stageVisual?: StageVisualProfile;
  private vfx?: BattleVfxSystem;
  private ambientLayer?: Container;
  private readonly textureWarmupLayer = new Container();
  private textureWarmupFrames = 0;
  private readonly enemies: EnemyActor[] = [];
  private readonly damagePool = new ObjectPool<FloatingText>(() => ({
    text: new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.warning, fontSize: 25, fontWeight: '700' }),
    }),
    life: 0,
    maxLife: 0.7,
  }), 18);
  private readonly effectPool = new ObjectPool<CombatEffect>(() => ({
    view: new Graphics(),
    life: 0,
    maxLife: 0.25,
  }), 14);
  private readonly activeDamage = new Set<FloatingText>();
  private readonly activeEffects = new Set<CombatEffect>();

  private context?: AppContext;
  private player?: PlayerCombatController;
  private playerConfig?: PlayerCombatConfig;
  private profile?: PlayerProfile;
  private stage?: StageConfig;
  private quality?: GraphicsQualityPreset;
  private accessibility?: AccessibilitySettings;
  private combatPalette?: CombatAccessibilityPalette;
  private camera?: CombatCamera;
  private pointerTarget?: Vec2;
  private finishDelay = -1;
  private resultPending = false;
  private playerFlashRemaining = 0;
  private defeatedCount = 0;
  private maxCombo = 0;
  private elapsed = 0;
  private currentWaveIndex = 0;
  private waveSpawned = false;
  private waveTransitionRemaining = 0;
  private paused = false;
  private battleBundleLoaded = false;
  private bossCinematicRemaining = 0;
  private bossCinematicDuration = 0;
  private bossCinematicPhase = 1;

  private readonly playerHpFill = new Graphics();
  private readonly playerHpText = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.text, fontSize: 13, fontWeight: '600' }),
  });
  private readonly enemyCountText = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.text, fontSize: 15, fontWeight: '600' }),
  });
  private readonly comboText = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.warning, fontSize: 19, fontWeight: '700' }),
  });
  private readonly waveText = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.primaryBright, fontSize: 16, fontWeight: '700' }),
  });
  private readonly announcementText = new Text({
    text: '',
    style: new TextStyle({
      fill: COLORS.text,
      fontSize: 34,
      fontWeight: '700',
      align: 'center',
      dropShadow: { color: COLORS.dark, alpha: 0.8, blur: 4, distance: 2 },
    }),
  });
  private announcementRemaining = 0;

  private readonly bossCinematicLayer = new Container();
  private readonly bossCinematicBackdrop = new Graphics();
  private readonly bossCinematicAccent = new Graphics();
  private readonly bossCinematicTitle = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.text, fontSize: 31, fontWeight: '700', align: 'center', letterSpacing: 1 }),
  });
  private readonly bossCinematicSubtitle = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.muted, fontSize: 14, fontWeight: '600', align: 'center' }),
  });
  private readonly bossCinematicPhaseText = new Text({
    text: '',
    style: new TextStyle({ fill: 0xf4dca0, fontSize: 12, fontWeight: '700', align: 'center', letterSpacing: 3 }),
  });

  private readonly bossPanel = new Container();
  private readonly bossHpFill = new Graphics();
  private readonly bossNameText = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.text, fontSize: 15, fontWeight: '700' }),
  });
  private readonly pauseOverlay = new Container();
  private attackButton?: CombatActionButton;
  private skill1Button?: CombatActionButton;
  private skill2Button?: CombatActionButton;
  private dodgeButton?: CombatActionButton;
  private joystick?: VirtualJoystick;
  private pauseButton?: UiButton;
  private readonly tutorialOverlay = new Container();
  private readonly tutorialText = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.text, fontSize: 17, fontWeight: '600', align: 'center', lineHeight: 24 }),
  });
  private tutorialStep = 0;
  private tutorialEnabled = false;
  private tutorialSaved = false;
  private tutorialOrigin: Vec2 = { x: 0, y: 0 };

  public constructor(private readonly stageId = 'stage_001') {}

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    this.stage = context.gameData.getStage(this.stageId);
    this.stageVisual = resolveStageVisualProfile(this.stage.order);
    const loadingLayer = new Container();
    const loadingBackdrop = new Graphics().rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT).fill(COLORS.background);
    const loadingText = new Text({
      text: '균열 전투 리소스 로딩 중',
      style: new TextStyle({ fill: COLORS.text, fontSize: 24, fontWeight: '700' }),
    });
    loadingText.anchor.set(0.5);
    loadingText.position.set(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2 - 28);
    const loadingTrack = new Graphics()
      .roundRect(90, DESIGN_HEIGHT / 2 + 18, 360, 16, 8)
      .fill(COLORS.panelStrong);
    const loadingFill = new Graphics();
    loadingLayer.addChild(loadingBackdrop, loadingText, loadingTrack, loadingFill);
    this.view.addChild(loadingLayer);

    try {
      await context.assets.loadBundle(BATTLE_CHAPTER_1_BUNDLE, (progress) => {
        loadingText.text = `균열 전투 리소스 로딩 중 ${Math.round(progress * 100)}%`;
        loadingFill.clear()
          .roundRect(90, DESIGN_HEIGHT / 2 + 18, 360 * progress, 16, 8)
          .fill(COLORS.accent);
      });
      this.battleBundleLoaded = true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '전투 리소스를 불러오지 못했습니다.';
      loadingText.text = `리소스 로딩 실패\n${message}`;
      console.error(error);
      return;
    }

    this.playerSheet = context.assets.get<Spritesheet>(ASSET_PATHS.playerAtlas);
    this.monsterSheet = context.assets.get<Spritesheet>(ASSET_PATHS.monsterAtlas);
    this.effectsSheet = context.assets.get<Spritesheet>(ASSET_PATHS.effectsAtlas);
    this.equipmentSheet = context.assets.get<Spritesheet>(ASSET_PATHS.equipmentAtlas);
    this.mapTexture = context.assets.get<Texture>(this.resolveStageBackgroundPath());
    this.bossPortraitTextures[1] = context.assets.get<Texture>(ASSET_PATHS.bossPortraitPhase1);
    this.bossPortraitTextures[2] = context.assets.get<Texture>(ASSET_PATHS.bossPortraitPhase2);
    this.bossPortraitTextures[3] = context.assets.get<Texture>(ASSET_PATHS.bossPortraitPhase3);
    context.audio.preload(ASSET_PATHS.slash, 'sfx');
    context.audio.preload(ASSET_PATHS.hit, 'sfx');
    context.audio.preload(ASSET_PATHS.skill, 'sfx');
    context.audio.preload(ASSET_PATHS.dodge, 'sfx');
    context.audio.preload(ASSET_PATHS.forestBgm, 'bgm');
    void context.audio.playBgm(ASSET_PATHS.forestBgm).catch(() => undefined);
    this.view.removeChild(loadingLayer);
    loadingLayer.destroy({ children: true });
    this.quality = context.graphicsQuality.current;
    this.accessibility = context.accessibility.current;
    this.combatPalette = context.accessibility.palette;

    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const loaded = await context.playerRepository.load(session.uid)
      ?? createDefaultProfile(session.uid, session.displayName);
    this.profile = ensureStarterInventory(loaded, context.gameData);
    await context.playerRepository.save(this.profile);

    this.playerConfig = buildPlayerCombatConfig(
      context.gameData.player,
      this.profile,
      context.gameData,
    );
    this.player = new PlayerCombatController(this.playerConfig, this.stage.playerSpawn);
    this.tutorialOrigin = { ...this.stage.playerSpawn };
    this.tutorialEnabled = this.stage.order === 1
      && !this.profile.tutorial.completed
      && !this.profile.tutorial.skipped;
    this.camera = new CombatCamera(this.world, DESIGN_WIDTH, DESIGN_HEIGHT);
    this.waveTransitionRemaining = this.stage.waves[0]?.spawnDelay ?? 0;

    this.createWorld();
    this.vfx = new BattleVfxSystem(this.effectsSheet, this.quality);
    this.world.addChild(this.vfx.view);
    const equippedWeaponUid = this.profile.equipped.weapon;
    const equippedWeaponId = equippedWeaponUid ? this.profile.inventory[equippedWeaponUid]?.itemId : undefined;
    this.playerPresentation = new PlayerActorView(this.playerSheet, this.equipmentSheet, equippedWeaponId);
    this.world.addChild(this.playerPresentation.root);
    this.prepareTextureWarmup();
    this.createHud();
    this.createBossCinematicOverlay();
    this.createPauseOverlay();
    this.createTutorialOverlay();
    this.bindPointerMovement();

    this.view.addChild(this.world, this.hud, this.bossCinematicLayer, this.pauseOverlay, this.tutorialOverlay, this.textureWarmupLayer);
    this.updateVisuals(0);
  }

  public async exit(): Promise<void> {
    this.damagePool.releaseAll((value) => {
      value.text.parent?.removeChild(value.text);
      value.text.alpha = 1;
    });
    this.effectPool.releaseAll((value) => {
      value.view.parent?.removeChild(value.view);
      value.view.clear();
    });
    this.activeDamage.clear();
    this.activeEffects.clear();
    this.clearEnemies();
    this.vfx?.clear();
    this.joystick?.reset();
    this.textureWarmupLayer.destroy({ children: true });
    this.camera?.reset();
    this.context?.audio.stopBgm();
    this.context?.audio.release(ASSET_PATHS.slash);
    this.context?.audio.release(ASSET_PATHS.hit);
    this.context?.audio.release(ASSET_PATHS.skill);
    this.context?.audio.release(ASSET_PATHS.dodge);
    this.context?.audio.release(ASSET_PATHS.forestBgm);
    if (this.battleBundleLoaded) {
      await this.context?.assets.releaseBundle(BATTLE_CHAPTER_1_BUNDLE.id);
      this.battleBundleLoaded = false;
    }
  }

  public update(deltaSeconds: number): void {
    const context = this.context;
    const player = this.player;
    const camera = this.camera;
    if (!context || !player || !camera || this.resultPending) return;

    if (this.textureWarmupFrames > 0) {
      this.textureWarmupFrames -= 1;
      if (this.textureWarmupFrames === 0) this.textureWarmupLayer.removeChildren().forEach((child: { destroy: () => void }) => child.destroy());
    }

    if (context.input.consumePressed('Escape', 'KeyP')) this.togglePause();
    if (this.paused) return;

    this.elapsed += deltaSeconds;
    this.updateWaveFlow(deltaSeconds);

    if (this.bossCinematicRemaining > 0) {
      this.updateBossCinematic(deltaSeconds);
      this.updateWorldEffects(deltaSeconds);
      this.updateFloatingText(deltaSeconds);
      this.updateVisuals(deltaSeconds);
      const boss = this.enemies.find((enemy) => enemy.definition.combat.rank === 'boss' && enemy.controller.isAlive);
      camera.update(deltaSeconds, boss?.controller.position.x ?? player.position.x, boss?.controller.position.y ?? player.position.y);
      return;
    }

    const moveAxis = this.resolveMoveAxis();
    this.handleKeyboardActions(moveAxis);

    const scaledDelta = deltaSeconds * camera.timeScale;
    if (scaledDelta > 0) {
      player.update(scaledDelta, moveAxis);
      const clamped = clampPosition(
        player.position,
        38,
        DESIGN_WIDTH - 38,
        BATTLE_TOP + 28,
        BATTLE_BOTTOM - 28,
      );
      player.position.x = clamped.x;
      player.position.y = clamped.y;

      this.updateEnemies(scaledDelta);
      this.resolvePlayerHitEvents();
      this.updateWorldEffects(scaledDelta);
    }

    this.updateFloatingText(deltaSeconds);
    this.updateVisuals(deltaSeconds);
    this.updateTutorial();
    camera.update(deltaSeconds, player.position.x, player.position.y);
    this.updateFinishState(deltaSeconds);
  }

  private createWorld(): void {
    const quality = this.quality;
    if (!quality) return;

    if (this.mapTexture) {
      const backdrop = new Sprite(this.mapTexture);
      backdrop.width = DESIGN_WIDTH;
      backdrop.height = DESIGN_HEIGHT;
      backdrop.alpha = quality.mode === 'low' ? 0.78 : 0.96;
      this.world.addChild(backdrop);
    }

    const visual = this.stageVisual ?? resolveStageVisualProfile(this.stage?.order ?? 1);
    const arenaShade = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.dark, alpha: 0.06 + visual.corruption * 0.035 })
      .ellipse(DESIGN_WIDTH / 2, 500, 390, 560)
      .fill({ color: 0x061116, alpha: 0.18 + visual.corruption * 0.08 })
      .ellipse(DESIGN_WIDTH / 2, 510, 378, 546)
      .stroke({ color: visual.accentColor, alpha: 0.15 + visual.corruption * 0.08, width: 2 });

    const ambient = new Container();
    ambient.position.set(DESIGN_WIDTH / 2, 470);
    const ring = new Graphics()
      .ellipse(0, 0, 355, 500)
      .stroke({ color: visual.accentColor, alpha: 0.05 + visual.corruption * 0.035, width: 3 })
      .ellipse(0, 0, 260, 380)
      .stroke({ color: visual.secondaryColor, alpha: 0.03 + visual.corruption * 0.025, width: 2 });
    ambient.addChild(ring);
    this.ambientLayer = ambient;

    this.world.addChild(
      arenaShade,
      createArenaDecorations(
        Math.max(2, Math.floor(quality.worldDecorationCount * 0.45)),
        visual.decorationSeed,
        visual.accentColor,
        visual.secondaryColor,
      ),
      ambient,
    );
  }

  private createHud(): void {
    const stage = this.stage;
    if (!stage) return;

    const playerPanel = createRasterPanel(14, 14, 268, 82, 'panel_glass');
    const playerName = new Text({
      text: `♥ Lv.${this.profile?.level ?? 1}  ${this.profile?.nickname ?? '계승자'}`,
      style: new TextStyle({ fill: COLORS.text, fontSize: this.accessibility?.largeHud ? 16 : 14, fontWeight: '700' }),
    });
    playerName.position.set(30, 27);
    const hpTrack = new Graphics()
      .roundRect(30, 58, 214, 18, 9)
      .fill({ color: 0x03080c, alpha: 0.94 })
      .stroke({ color: this.combatPalette?.outline ?? 0xffffff, alpha: this.accessibility?.visionMode === 'highContrast' ? 0.78 : 0.18, width: this.accessibility?.visionMode === 'highContrast' ? 2 : 1 });
    this.playerHpText.style = new TextStyle({ fill: COLORS.text, fontSize: this.accessibility?.largeHud ? 15 : 13, fontWeight: '700' });
    this.playerHpText.anchor.set(1, 0.5);
    this.playerHpText.position.set(265, 67);

    const stagePanel = createRasterPanel(296, 14, 176, 60, 'panel_strong');
    const stageText = new Text({
      text: stage.label,
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 13, fontWeight: '700' }),
    });
    stageText.position.set(314, 27);
    this.waveText.anchor.set(0, 0);
    this.waveText.position.set(314, 50);
    this.waveText.style = new TextStyle({ fill: COLORS.muted, fontSize: 11, fontWeight: '700' });
    this.enemyCountText.anchor.set(1, 0);
    this.enemyCountText.position.set(455, 49);
    this.enemyCountText.style = new TextStyle({ fill: 0xf4dca0, fontSize: 11, fontWeight: '700' });

    this.pauseButton = new UiButton({
      label: 'Ⅱ',
      width: 50,
      height: 50,
      tone: 'secondary',
      fontSize: 17,
      onPress: () => this.togglePause(),
    });
    this.pauseButton.position.set(476, 19);

    const bossBackground = createRasterPanel(48, 106, 474, 68, 'boss_panel');
    const bossTrack = new Graphics()
      .roundRect(122, 145, 366, 13, 7)
      .fill({ color: 0x03070b, alpha: 0.95 });
    this.bossNameText.position.set(122, 119);
    this.bossNameText.style = new TextStyle({ fill: COLORS.text, fontSize: this.accessibility?.largeHud ? 16 : 14, fontWeight: '700' });
    const initialBossPortrait = this.bossPortraitTextures[1];
    this.bossPortraitSprite = initialBossPortrait ? new Sprite(initialBossPortrait) : undefined;
    if (this.bossPortraitSprite) {
      this.bossPortraitSprite.position.set(56, 112);
      this.bossPortraitSprite.width = 54;
      this.bossPortraitSprite.height = 54;
    }
    this.bossPanel.addChild(bossBackground);
    if (this.bossPortraitSprite) this.bossPanel.addChild(this.bossPortraitSprite);
    this.bossPanel.addChild(bossTrack, this.bossHpFill, this.bossNameText);
    this.bossPanel.visible = false;

    const controlDock = createRasterPanel(8, 786, 524, 166, 'panel_glass');
    const controlHint = new Text({
      text: 'MOVE        DODGE          SKILLS                ATTACK',
      style: new TextStyle({ fill: COLORS.muted, fontSize: this.accessibility?.largeHud ? 9 : 8, fontWeight: '700', letterSpacing: 0.8 }),
    });
    controlHint.position.set(30, 797);

    const comboChip = createRasterPanel(184, 186, 172, 40, 'resource_chip');
    this.comboText.anchor.set(0.5);
    this.comboText.position.set(DESIGN_WIDTH / 2, 206);
    this.comboText.style = new TextStyle({ fill: 0xf4dca0, fontSize: 15, fontWeight: '700' });

    this.joystick = new VirtualJoystick({ radius: 66, deadZone: 0.2 });
    this.joystick.position.set(88, 865);

    this.dodgeButton = new CombatActionButton({
      label: '회피',
      radius: 36,
      tone: 'secondary',
      onPress: () => this.requestDodge(this.resolveMoveAxis()),
    });
    this.dodgeButton.position.set(205, 842);

    this.skill2Button = new CombatActionButton({
      label: '노바',
      radius: 41,
      tone: 'secondary',
      onPress: () => this.requestSkill('skill2'),
    });
    this.skill2Button.position.set(294, 884);

    this.skill1Button = new CombatActionButton({
      label: '크래시',
      radius: 46,
      tone: 'secondary',
      onPress: () => this.requestSkill('skill1'),
    });
    this.skill1Button.position.set(385, 858);

    this.attackButton = new CombatActionButton({
      label: '공격',
      radius: 57,
      onPress: () => { this.player?.requestAttack(); },
    });
    this.attackButton.position.set(478, 838);

    this.announcementText.anchor.set(0.5);
    this.announcementText.position.set(DESIGN_WIDTH / 2, 330);
    this.announcementText.visible = false;

    this.hud.addChild(
      playerPanel,
      playerName,
      hpTrack,
      this.playerHpFill,
      this.playerHpText,
      stagePanel,
      stageText,
      this.waveText,
      this.enemyCountText,
      this.pauseButton,
      this.bossPanel,
      comboChip,
      controlDock,
      controlHint,
      this.comboText,
      this.joystick,
      this.dodgeButton,
      this.skill2Button,
      this.skill1Button,
      this.attackButton,
      this.announcementText,
    );
  }

  private createBossCinematicOverlay(): void {
    this.bossCinematicBackdrop
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: 0x020407, alpha: 0.72 })
      .rect(0, 250, DESIGN_WIDTH, 250)
      .fill({ color: 0x071018, alpha: 0.94 });
    this.bossCinematicAccent.position.set(DESIGN_WIDTH / 2, 375);
    this.bossCinematicTitle.anchor.set(0.5);
    this.bossCinematicTitle.position.set(DESIGN_WIDTH / 2, 350);
    this.bossCinematicSubtitle.anchor.set(0.5);
    this.bossCinematicSubtitle.position.set(DESIGN_WIDTH / 2, 399);
    this.bossCinematicPhaseText.anchor.set(0.5);
    this.bossCinematicPhaseText.position.set(DESIGN_WIDTH / 2, 307);
    this.bossCinematicLayer.addChild(
      this.bossCinematicBackdrop,
      this.bossCinematicAccent,
      this.bossCinematicPhaseText,
      this.bossCinematicTitle,
      this.bossCinematicSubtitle,
    );
    this.bossCinematicLayer.visible = false;
  }

  private startBossCinematic(enemy: EnemyActor, phase: number): void {
    const presentation = resolveBossPhasePresentation(phase);
    this.bossCinematicPhase = presentation.phase;
    this.bossCinematicDuration = presentation.cinematicSeconds;
    this.bossCinematicRemaining = presentation.cinematicSeconds;
    this.bossCinematicLayer.visible = true;
    this.bossCinematicLayer.alpha = 0;
    this.bossCinematicPhaseText.text = `BOSS PHASE ${presentation.phase}`;
    this.bossCinematicTitle.text = presentation.phase === 1 ? enemy.controller.config.name : presentation.title;
    this.bossCinematicSubtitle.text = presentation.subtitle;
    this.bossCinematicTitle.style = new TextStyle({
      fill: presentation.accentColor,
      fontSize: 31,
      fontWeight: '700',
      align: 'center',
      letterSpacing: 1,
    });
    this.bossCinematicAccent.clear();
    for (let ring = 0; ring < presentation.auraRings + 1; ring += 1) {
      this.bossCinematicAccent
        .circle(0, 0, 58 + ring * 18)
        .stroke({
          color: ring % 2 === 0 ? presentation.accentColor : presentation.secondaryColor,
          alpha: 0.28 - ring * 0.04,
          width: 3,
        });
    }
    this.camera?.pulseZoom(presentation.zoom, presentation.cinematicSeconds * 0.62);
    this.camera?.addShake(this.scaledShake(presentation.shake), Math.min(0.55, presentation.cinematicSeconds));
    this.vfx?.spawn('explosion', enemy.controller.position, 0, 1.05 + presentation.phase * 0.14);
    this.updateBossPortrait(presentation.phase);
  }

  private updateBossCinematic(deltaSeconds: number): void {
    this.bossCinematicRemaining = Math.max(0, this.bossCinematicRemaining - deltaSeconds);
    this.bossCinematicLayer.alpha = bossCinematicAlpha(this.bossCinematicRemaining, this.bossCinematicDuration);
    const presentation = resolveBossPhasePresentation(this.bossCinematicPhase);
    this.bossCinematicAccent.rotation += deltaSeconds * (0.35 + presentation.phase * 0.18);
    const pulse = 0.96 + Math.sin(this.elapsed * 10) * 0.035;
    this.bossCinematicAccent.scale.set(pulse);
    if (this.bossCinematicRemaining <= 0) {
      this.bossCinematicLayer.visible = false;
      this.bossCinematicLayer.alpha = 0;
    }
  }

  private createPauseOverlay(): void {
    const blocker = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.dark, alpha: 0.8 });
    blocker.eventMode = 'static';
    blocker.hitArea = {
      contains: (x: number, y: number) => x >= 0 && y >= 0 && x <= DESIGN_WIDTH && y <= DESIGN_HEIGHT,
    };

    const panel = createRasterPanel(66, 288, 408, 330, 'panel_gold');
    const title = new Text({
      text: '전투 일시정지',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 31, fontWeight: '700' }),
    });
    title.anchor.set(0.5);
    title.position.set(DESIGN_WIDTH / 2, 350);

    const detail = new Text({
      text: `그래픽 ${this.quality?.label ?? '균형'}  ·  진행 상황은 유지됩니다`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 14 }),
    });
    detail.anchor.set(0.5);
    detail.position.set(DESIGN_WIDTH / 2, 401);

    const resume = new UiButton({
      label: '전투 계속',
      width: 300,
      height: 62,
      onPress: () => this.togglePause(false),
    });
    resume.position.set(120, 452);

    const lobby = new UiButton({
      label: '거점 복귀',
      width: 300,
      height: 58,
      tone: 'secondary',
      onPress: async () => {
        if (!this.context) return;
        this.paused = false;
        await this.context.scenes.change(() => new LobbyScene());
      },
    });
    lobby.position.set(120, 532);

    this.pauseOverlay.addChild(blocker, panel, title, detail, resume, lobby);
    this.pauseOverlay.visible = false;
  }

  private createTutorialOverlay(): void {
    if (!this.tutorialEnabled) {
      this.tutorialOverlay.visible = false;
      return;
    }

    const panel = new Graphics()
      .roundRect(42, 185, 456, 108, 20)
      .fill({ color: COLORS.panel, alpha: 0.96 })
      .stroke({ color: COLORS.accent, alpha: 0.45, width: 2 });
    this.tutorialText.anchor.set(0.5);
    this.tutorialText.position.set(DESIGN_WIDTH / 2 - 36, 239);
    const skip = new UiButton({
      label: '건너뛰기',
      width: 105,
      height: 40,
      tone: 'secondary',
      onPress: () => { void this.skipTutorial(); },
    });
    skip.position.set(380, 218);
    this.tutorialOverlay.addChild(panel, this.tutorialText, skip);
    this.updateTutorialText();
  }

  private updateTutorial(): void {
    if (!this.tutorialEnabled || !this.player) return;
    const player = this.player;
    if (this.tutorialStep === 0) {
      const distance = Math.hypot(player.position.x - this.tutorialOrigin.x, player.position.y - this.tutorialOrigin.y);
      if (distance >= 42) this.advanceTutorial();
    } else if (this.tutorialStep === 1 && player.state === 'attacking') {
      this.advanceTutorial();
    } else if (this.tutorialStep === 2 && player.state === 'skill') {
      this.advanceTutorial();
    } else if (this.tutorialStep === 3 && player.state === 'dodging') {
      this.advanceTutorial();
    } else if (this.tutorialStep === 4 && this.defeatedCount > 0) {
      void this.completeTutorial(false);
    }
  }

  private advanceTutorial(): void {
    this.tutorialStep = Math.min(4, this.tutorialStep + 1);
    this.updateTutorialText();
  }

  private updateTutorialText(): void {
    const messages = [
      '1/5 화면을 드래그하거나 WASD로 이동하세요.',
      '2/5 공격 버튼 또는 J키로 기본 공격을 사용하세요.',
      '3/5 크래시·노바 버튼 또는 K/L키로 스킬을 사용하세요.',
      '4/5 회피 버튼 또는 Space키로 공격을 피하세요.',
      '5/5 첫 몬스터를 처치해 튜토리얼을 완료하세요.',
    ];
    this.tutorialText.text = messages[this.tutorialStep] ?? messages[4]!;
  }

  private async skipTutorial(): Promise<void> {
    if (!this.profile || !this.context) return;
    await this.completeTutorial(true);
  }

  private async completeTutorial(skipped: boolean): Promise<void> {
    if (!this.profile || !this.context || this.tutorialSaved) return;
    this.tutorialSaved = true;
    this.tutorialEnabled = false;
    this.tutorialOverlay.visible = false;
    this.profile = {
      ...this.profile,
      tutorial: skipped ? { completed: false, skipped: true } : { completed: true, skipped: false },
      updatedAt: Date.now(),
    };
    await this.context.playerRepository.save(this.profile);
  }

  private bindPointerMovement(): void {
    this.world.eventMode = 'static';
    this.world.hitArea = {
      contains: (x: number, y: number) => x >= 0 && y >= BATTLE_TOP && x <= DESIGN_WIDTH && y <= BATTLE_BOTTOM,
    };
    this.world.on('pointerdown', (event: FederatedPointerEvent) => {
      if (this.paused) return;
      const local = event.getLocalPosition(this.world);
      this.pointerTarget = { x: local.x, y: local.y };
    });
    this.world.on('pointermove', (event: FederatedPointerEvent) => {
      if (this.paused || event.buttons <= 0) return;
      const local = event.getLocalPosition(this.world);
      this.pointerTarget = { x: local.x, y: local.y };
    });
  }

  private resolveMoveAxis(): Vec2 {
    const player = this.player;
    const keyboard = this.context?.input.getAxis() ?? { x: 0, y: 0 };
    if (keyboard.x !== 0 || keyboard.y !== 0) {
      this.pointerTarget = undefined;
      return keyboard;
    }
    const joystick = this.joystick?.axis ?? { x: 0, y: 0 };
    if (joystick.x !== 0 || joystick.y !== 0) {
      this.pointerTarget = undefined;
      return joystick;
    }
    if (!player || !this.pointerTarget) return { x: 0, y: 0 };

    const offset = {
      x: this.pointerTarget.x - player.position.x,
      y: this.pointerTarget.y - player.position.y,
    };
    if (Math.hypot(offset.x, offset.y) <= 9) {
      this.pointerTarget = undefined;
      return { x: 0, y: 0 };
    }
    return normalize(offset);
  }

  private handleKeyboardActions(moveAxis: Vec2): void {
    const input = this.context?.input;
    const player = this.player;
    if (!input || !player) return;

    if (input.consumePressed('KeyJ', 'KeyZ', 'Enter')) player.requestAttack();
    if (input.consumePressed('KeyK', 'KeyX')) this.requestSkill('skill1');
    if (input.consumePressed('KeyL', 'KeyC')) this.requestSkill('skill2');
    if (input.consumePressed('Space', 'ShiftLeft', 'ShiftRight')) this.requestDodge(moveAxis);
  }

  private requestDodge(moveAxis: Vec2): void {
    const player = this.player;
    if (!player) return;
    const direction = moveAxis.x !== 0 || moveAxis.y !== 0 ? moveAxis : player.facing;
    if (!player.requestDodge(direction)) return;
    this.vfx?.spawn('dodge', player.position, Math.atan2(direction.y, direction.x), 0.9);
    void this.context?.audio.play(ASSET_PATHS.dodge, 'sfx').catch(() => undefined);
  }

  private requestSkill(slot: 'skill1' | 'skill2'): void {
    if (!this.player?.requestSkill(slot)) return;
    void this.context?.audio.play(ASSET_PATHS.skill, 'sfx').catch(() => undefined);
  }

  private updateWaveFlow(deltaSeconds: number): void {
    const stage = this.stage;
    if (!stage || this.finishDelay >= 0) return;

    if (!this.waveSpawned) {
      this.waveTransitionRemaining = Math.max(0, this.waveTransitionRemaining - deltaSeconds);
      if (this.waveTransitionRemaining <= 0) this.spawnCurrentWave();
      return;
    }

    if (this.enemies.length === 0 || this.enemies.some((enemy) => enemy.controller.isAlive)) return;

    const nextIndex = this.currentWaveIndex + 1;
    if (nextIndex >= stage.waves.length) {
      this.finishDelay = 1.1;
      return;
    }

    this.currentWaveIndex = nextIndex;
    this.waveSpawned = false;
    this.waveTransitionRemaining = stage.waves[nextIndex]?.spawnDelay ?? 0.8;
    this.announce(`WAVE ${nextIndex + 1}\n${stage.waves[nextIndex]?.label ?? ''}`, 1.1);
  }

  private spawnCurrentWave(): void {
    const stage = this.stage;
    const context = this.context;
    const quality = this.quality;
    const wave = stage?.waves[this.currentWaveIndex];
    if (!stage || !context || !quality || !wave) return;

    this.clearEnemies();

    for (const spawn of wave.enemies) {
      const definition = context.gameData.getMonster(spawn.monsterId);
      const controller = new MonsterController(definition.combat, { x: spawn.x, y: spawn.y });
      const presentation = new MonsterActorView(definition, quality, this.monsterSheet);
      this.world.addChild(presentation.root);
      this.enemies.push({
        controller,
        presentation,
        definition,
        flashRemaining: 0,
        deathElapsed: 0,
        countedDead: false,
      });
    }

    this.waveSpawned = true;
    const boss = this.enemies.find((enemy) => enemy.definition.combat.rank === 'boss');
    if (boss) this.startBossCinematic(boss, 1);
    this.announce(
      definitionLabel(this.enemies),
      this.currentWaveIndex === stage.waves.length - 1 ? 1.45 : 0.95,
    );
  }

  private clearEnemies(): void {
    for (const enemy of this.enemies) {
      enemy.presentation.root.parent?.removeChild(enemy.presentation.root);
      enemy.presentation.root.destroy({ children: true });
    }
    this.enemies.length = 0;
    this.bossPanel.visible = false;
  }

  private updateEnemies(deltaSeconds: number): void {
    const player = this.player;
    const playerConfig = this.playerConfig;
    if (!player || !playerConfig) return;

    for (const enemy of this.enemies) {
      enemy.controller.update(deltaSeconds, player.position);
      const clamped = clampPosition(
        enemy.controller.position,
        30,
        DESIGN_WIDTH - 30,
        BATTLE_TOP + 24,
        BATTLE_BOTTOM - 24,
      );
      enemy.controller.position.x = clamped.x;
      enemy.controller.position.y = clamped.y;

      for (const phaseEvent of enemy.controller.drainPhaseEvents()) {
        this.startBossCinematic(enemy, phaseEvent.phase);
      }

      for (const statusDamage of enemy.controller.drainStatusDamageEvents()) {
        this.showDamage(
          enemy.controller.position.x,
          enemy.controller.position.y - enemy.controller.config.radius - 18,
          statusDamage.damage,
          true,
          'burn',
        );
      }

      this.countDeath(enemy);

      for (const attack of enemy.controller.drainAttackEvents()) {
        this.spawnMonsterAttackEffect(attack.pattern, attack.origin, attack.facing);
        const footprint = createAttackFootprint(
          attack.pattern.shape,
          attack.origin,
          attack.facing,
          attack.pattern.range,
          attack.pattern.halfAngleRadians,
        );
        const hit = footprintContainsCircle(footprint, player.position, playerConfig.radius);
        if (!hit) continue;

        const damage = calculateDamage({
          attack: attack.damage,
          skillMultiplier: 1,
          defense: playerConfig.defense,
          critical: false,
        });
        if (!player.receiveDamage(damage)) continue;

        this.playerFlashRemaining = 0.18;
        this.vfx?.spawn('hit', player.position, 0, 0.72);
        void this.context?.audio.play(ASSET_PATHS.hit, 'sfx').catch(() => undefined);
        this.showDamage(player.position.x, player.position.y - 38, damage, true, 'player');
        this.camera?.addShake(this.scaledShake(enemy.controller.config.rank === 'boss' ? 10 : 6), 0.18);
        this.camera?.addHitStop(enemy.controller.config.rank === 'boss' ? 0.07 : 0.045);
      }
    }
  }

  private resolvePlayerHitEvents(): void {
    const player = this.player;
    const playerConfig = this.playerConfig;
    if (!player || !playerConfig) return;

    for (const event of player.drainHitEvents()) {
      this.spawnActionEffect(event.action, event.origin, event.facing);
      void this.context?.audio.play(ASSET_PATHS.slash, 'sfx').catch(() => undefined);
      let hitCount = 0;

      for (const enemy of this.enemies) {
        if (!enemy.controller.isAlive) continue;
        const footprint = createAttackFootprint(
          event.action.hitShape,
          event.origin,
          event.facing,
          event.action.range,
          event.action.halfAngleRadians,
        );
        const hit = footprintContainsCircle(footprint, enemy.controller.position, enemy.controller.config.radius);
        if (!hit) continue;

        const critical = Math.random() < (event.action.kind === 'basic' ? 0.18 : 0.26);
        const damage = calculateDamage({
          attack: playerConfig.attack,
          skillMultiplier: event.action.damageMultiplier,
          defense: enemy.controller.config.defense,
          critical,
          criticalMultiplier: 1.65,
        });
        const hitDirection = {
          x: enemy.controller.position.x - event.origin.x,
          y: enemy.controller.position.y - event.origin.y,
        };

        enemy.controller.receiveDamage(
          damage,
          hitDirection,
          event.action.kind === 'basic' ? 135 : 230,
        );

        const status = event.action.statusEffect;
        if (status && enemy.controller.isAlive && Math.random() <= status.chance) {
          enemy.controller.applyStatusEffect(status);
        }

        this.countDeath(enemy);
        enemy.flashRemaining = 0.16;
        this.vfx?.spawn('hit', enemy.controller.position, Math.atan2(event.facing.y, event.facing.x), critical ? 0.95 : 0.72);
        this.showDamage(
          enemy.controller.position.x,
          enemy.controller.position.y - enemy.controller.config.radius - 14,
          damage,
          critical,
          critical ? 'critical' : 'normal',
        );
        hitCount += 1;
      }

      if (hitCount > 0) {
        this.camera?.addShake(
          this.scaledShake(event.action.shake),
          event.action.kind === 'skill2' ? 0.28 : 0.18,
        );
        this.camera?.addHitStop(event.action.hitStop);
        this.camera?.pulseZoom(event.action.kind === 'skill2' ? 1.055 : 1.025, 0.08);
      }
    }
  }

  private spawnActionEffect(action: CombatActionConfig, origin: Vec2, facing: Vec2): void {
    const angle = Math.atan2(facing.y, facing.x);
    this.vfx?.spawn(action.kind === 'skill2' ? 'nova' : 'slash', {
      x: origin.x + facing.x * action.range * 0.42,
      y: origin.y + facing.y * action.range * 0.42,
    }, angle, action.kind === 'skill2' ? 1.35 : action.kind === 'skill1' ? 1.05 : 0.82);
    this.spawnEffect(
      action.hitShape,
      action.range,
      action.effectColor,
      origin,
      facing,
      action.halfAngleRadians,
      action.kind === 'skill2' ? 0.42 : 0.24,
    );
  }

  private spawnMonsterAttackEffect(
    pattern: MonsterDefinition['combat']['patterns'][number],
    origin: Vec2,
    facing: Vec2,
  ): void {
    this.vfx?.spawn('explosion', pattern.targetMode === 'playerLocked' ? origin : {
      x: origin.x + facing.x * pattern.range * 0.35,
      y: origin.y + facing.y * pattern.range * 0.35,
    }, Math.atan2(facing.y, facing.x), pattern.shape === 'circle' ? 1.05 : 0.72);
    this.spawnEffect(pattern.shape, pattern.range, pattern.effectColor, origin, facing, pattern.halfAngleRadians, 0.32);
  }

  private spawnEffect(
    shape: 'arc' | 'circle',
    range: number,
    color: number,
    origin: Vec2,
    facing: Vec2,
    halfAngleRadians: number,
    life: number,
  ): void {
    const quality = this.quality;
    if (!quality) return;
    const effect = this.effectPool.acquire();
    effect.life = life;
    effect.maxLife = life;
    effect.view.clear();

    const footprint = createAttackFootprint(shape, { x: 0, y: 0 }, facing, range, halfAngleRadians);
    effect.view.position.set(origin.x, origin.y);
    effect.view.rotation = 0;
    if (shape === 'circle') {
      effect.view
        .circle(0, 0, footprint.range)
        .fill({ color, alpha: 0.1 * quality.effectDensity })
        .circle(0, 0, footprint.range)
        .stroke({ color, alpha: 0.88, width: 4 + quality.effectDensity * 3 });
    } else {
      const polygon = buildArcPolygon(footprint, 24);
      const first = polygon[0];
      if (first) {
        effect.view.moveTo(first.x, first.y);
        for (const point of polygon.slice(1)) effect.view.lineTo(point.x, point.y);
        effect.view
          .fill({ color, alpha: 0.13 * quality.effectDensity })
          .stroke({ color, alpha: 0.9, width: 4 + quality.effectDensity * 3 });
      }
    }

    effect.view.alpha = 1;
    effect.view.scale.set(0.72);
    this.activeEffects.add(effect);
    this.world.addChild(effect.view);
  }

  private updateWorldEffects(deltaSeconds: number): void {
    this.vfx?.update(deltaSeconds);
    for (const effect of [...this.activeEffects]) {
      effect.life -= deltaSeconds;
      const ratio = Math.max(0, effect.life / effect.maxLife);
      effect.view.alpha = ratio;
      effect.view.scale.set(0.72 + (1 - ratio) * 0.58);
      if (effect.life > 0) continue;
      effect.view.parent?.removeChild(effect.view);
      effect.view.clear();
      this.activeEffects.delete(effect);
      this.effectPool.release(effect);
    }
  }

  private updateFloatingText(deltaSeconds: number): void {
    for (const floating of [...this.activeDamage]) {
      floating.life -= deltaSeconds;
      floating.text.y -= 52 * deltaSeconds;
      floating.text.alpha = Math.max(0, floating.life / floating.maxLife);
      if (floating.life > 0) continue;
      floating.text.parent?.removeChild(floating.text);
      this.activeDamage.delete(floating);
      this.damagePool.release(floating);
    }
  }

  private updateVisuals(deltaSeconds: number): void {
    const player = this.player;
    const stage = this.stage;
    if (!player || !stage) return;

    this.playerFlashRemaining = Math.max(0, this.playerFlashRemaining - deltaSeconds);
    if (this.ambientLayer && this.quality) {
      this.ambientLayer.rotation += deltaSeconds * 0.045 * this.quality.backgroundAnimationRate;
    }
    this.playerPresentation?.update(player, this.elapsed, this.playerFlashRemaining);

    for (const enemy of this.enemies) {
      enemy.flashRemaining = Math.max(0, enemy.flashRemaining - deltaSeconds);
      if (!enemy.controller.isAlive) enemy.deathElapsed += deltaSeconds;
      enemy.presentation.update(
        enemy.controller,
        deltaSeconds,
        enemy.flashRemaining,
        enemy.deathElapsed,
      );
    }

    const hpRatio = player.hp / player.maxHp;
    const playerHpColor = hpRatio > 0.3
      ? (this.combatPalette?.playerHp ?? COLORS.accent)
      : (this.combatPalette?.criticalHp ?? COLORS.danger);
    this.playerHpFill.clear()
      .roundRect(32, 60, 210 * hpRatio, 14, 7)
      .fill(playerHpColor)
      .stroke({ color: this.combatPalette?.outline ?? 0xffffff, alpha: this.accessibility?.visionMode === 'highContrast' ? 0.9 : 0.2, width: this.accessibility?.visionMode === 'highContrast' ? 2 : 1 });
    this.playerHpText.text = `${hpRatio <= 0.3 ? '▲' : '♥'} HP ${player.hp} / ${player.maxHp}`;

    const alive = this.enemies.filter((enemy) => enemy.controller.isAlive).length;
    this.waveText.text = `WAVE ${Math.min(this.currentWaveIndex + 1, stage.waves.length)} / ${stage.waves.length}`;
    this.enemyCountText.text = this.waveSpawned ? `남은 적 ${alive}` : '균열 반응 감지';
    this.maxCombo = Math.max(this.maxCombo, player.comboStep);
    this.comboText.text = player.comboStep > 0 ? `${player.comboStep} COMBO` : '';

    this.updateBossHud();

    this.attackButton?.setEnabled(player.state !== 'dead');
    this.attackButton?.setLabel(player.comboStep > 0 ? `공격 ${Math.min(player.comboStep + 1, 3)}` : '공격');
    this.updateCooldownButton(this.skill1Button, '크래시', player.getSkillCooldown('skill1'), player.getSkillCooldownTotal('skill1'));
    this.updateCooldownButton(this.skill2Button, '노바', player.getSkillCooldown('skill2'), player.getSkillCooldownTotal('skill2'));
    this.updateCooldownButton(this.dodgeButton, '회피', player.dodgeCooldown, player.dodgeCooldownTotal);

    this.announcementRemaining = Math.max(0, this.announcementRemaining - deltaSeconds);
    this.announcementText.visible = this.announcementRemaining > 0;
    if (this.announcementText.visible) {
      this.announcementText.alpha = Math.min(1, this.announcementRemaining * 2);
    }
  }

  private updateBossHud(): void {
    const boss = this.enemies.find((enemy) => enemy.definition.combat.rank === 'boss' && enemy.controller.isAlive);
    if (!boss) {
      this.bossPanel.visible = false;
      return;
    }

    this.bossPanel.visible = true;
    const hpRatio = boss.controller.hp / boss.controller.config.maxHp;
    this.bossNameText.text = `◆ ${boss.controller.config.name} · PHASE ${boss.controller.phase}`;
    this.updateBossPortrait(boss.controller.phase);
    this.bossHpFill.clear()
      .roundRect(124, 147, 362 * hpRatio, 9, 5)
      .fill(this.combatPalette?.bossHp ?? COLORS.danger)
      .stroke({ color: this.combatPalette?.outline ?? 0xffffff, alpha: this.accessibility?.visionMode === 'highContrast' ? 0.9 : 0.2, width: this.accessibility?.visionMode === 'highContrast' ? 2 : 1 });
  }

  private resolveStageBackgroundPath(): string {
    const tier = this.stageVisual?.tier ?? 'approach';
    if (tier === 'core') return ASSET_PATHS.riftCoreMap;
    if (tier === 'depths') return ASSET_PATHS.forestDepthsMap;
    if (tier === 'ruins') return ASSET_PATHS.forestRuinsMap;
    return ASSET_PATHS.forestApproachMap;
  }

  private updateBossPortrait(phase: number): void {
    const sprite = this.bossPortraitSprite;
    if (!sprite) return;
    const normalized = normalizeBossPhase(phase);
    const texture = this.bossPortraitTextures[normalized];
    if (texture && sprite.texture !== texture) sprite.texture = texture;
  }

  private updateCooldownButton(
    button: CombatActionButton | undefined,
    label: string,
    cooldown: number,
    total: number,
  ): void {
    if (!button) return;
    button.setEnabled(cooldown <= 0.01 && this.player?.state !== 'dead');
    button.setLabel(label);
    button.setCooldown(cooldown, total);
  }

  private updateFinishState(deltaSeconds: number): void {
    const player = this.player;
    if (!player) return;

    if (this.finishDelay < 0) {
      if (player.state === 'dead') this.finishDelay = 1.15;
      return;
    }

    this.finishDelay -= deltaSeconds;
    if (this.finishDelay > 0) return;
    void this.finishBattle(player.state !== 'dead');
  }

  private async finishBattle(victory: boolean): Promise<void> {
    if (this.resultPending || !this.context || !this.stage) return;
    this.resultPending = true;

    const baseDrops = victory ? resolveStageDrops(this.stage) : [];
    const clearSeconds = Math.max(1, Math.round(this.elapsed));
    let exp = victory ? this.stage.rewards.exp : 25;
    let gold = victory ? this.stage.rewards.gold : 0;
    let itemDrops: readonly string[] = baseDrops;
    let firstClear = false;

    if (victory) {
      const session = this.context.auth.currentSession;
      if (session) {
        const profile = this.profile
          ?? await this.context.playerRepository.load(session.uid)
          ?? createDefaultProfile(session.uid, session.displayName);
        const result = applyStageVictory(
          profile,
          this.stage,
          this.defeatedCount,
          clearSeconds,
          baseDrops,
        );
        exp = result.exp;
        gold = result.gold;
        itemDrops = result.itemIds;
        firstClear = result.firstClear;
        this.profile = result.profile;
        await this.context.playerRepository.save(result.profile);
      }
    }

    const nextStage = this.context.gameData.stagesInOrder.find((stage) => stage.order === this.stage!.order + 1);
    const outcome: BattleOutcome = {
      victory,
      stageId: this.stage.id,
      stageLabel: this.stage.label,
      nextStageId: nextStage?.id,
      firstClear,
      exp,
      gold,
      itemDrops,
      defeated: this.defeatedCount,
      maxCombo: this.maxCombo,
      clearSeconds,
    };

    await this.context.scenes.change(() => new ResultScene(outcome));
  }


  private prepareTextureWarmup(): void {
    const atlasTextures = [
      this.playerSheet ? Object.values(this.playerSheet.textures)[0] : undefined,
      this.monsterSheet ? Object.values(this.monsterSheet.textures)[0] : undefined,
      this.effectsSheet ? Object.values(this.effectsSheet.textures)[0] : undefined,
      this.equipmentSheet ? Object.values(this.equipmentSheet.textures)[0] : undefined,
      this.mapTexture,
    ].filter((texture): texture is Texture => texture !== undefined);
    atlasTextures.forEach((texture, index) => {
      const sprite = new Sprite(texture);
      sprite.position.set(-2000 - index * 10, -2000);
      sprite.alpha = 0.001;
      this.textureWarmupLayer.addChild(sprite);
    });
    this.textureWarmupFrames = atlasTextures.length > 0 ? 2 : 0;
  }

  private togglePause(force?: boolean): void {
    if (this.resultPending) return;
    this.paused = force ?? !this.paused;
    this.pauseOverlay.visible = this.paused;
    this.pointerTarget = undefined;
    this.joystick?.reset();
    this.pauseButton?.setLabel(this.paused ? '▶' : 'Ⅱ');
  }

  private announce(text: string, duration: number): void {
    this.announcementText.text = text;
    this.announcementText.visible = true;
    this.announcementText.alpha = 1;
    this.announcementRemaining = duration;
  }

  private countDeath(enemy: EnemyActor): void {
    if (enemy.controller.isAlive || enemy.countedDead) return;
    enemy.countedDead = true;
    this.defeatedCount += 1;
  }

  private scaledShake(value: number): number {
    const accessibilityScale = this.accessibility?.reduceFlash ? 0.28 : 1;
    return value * (this.quality?.cameraShakeScale ?? 1) * accessibilityScale;
  }

  private showDamage(
    x: number,
    y: number,
    amount: number,
    emphasized: boolean,
    tone: 'normal' | 'critical' | 'burn' | 'player',
  ): void {
    const floating = this.damagePool.acquire();
    floating.maxLife = emphasized ? 0.88 : 0.7;
    floating.life = floating.maxLife;
    const prefix = tone === 'burn' ? '🔥 ' : tone === 'critical' ? '✦ ' : '';
    floating.text.text = `${prefix}${amount}`;
    floating.text.style.fill = tone === 'player'
      ? (this.combatPalette?.criticalHp ?? COLORS.danger)
      : tone === 'burn'
        ? COLORS.warning
        : COLORS.text;
    floating.text.alpha = 1;
    floating.text.scale.set(emphasized ? 1.18 : 1);
    floating.text.anchor.set(0.5);
    floating.text.position.set(x, y);
    this.activeDamage.add(floating);
    this.world.addChild(floating.text);
  }
}

function definitionLabel(enemies: readonly EnemyActor[]): string {
  const boss = enemies.find((enemy) => enemy.definition.combat.rank === 'boss');
  if (boss) return `BOSS\n${boss.definition.combat.name}`;
  const elite = enemies.find((enemy) => enemy.definition.combat.rank === 'elite');
  if (elite) return `ELITE WAVE\n${elite.definition.combat.name}`;
  return 'WAVE START';
}

import { AnimatedSprite, Container, Graphics, Sprite, Text, TextStyle, type Spritesheet, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { ASSET_PATHS, LOBBY_CHARACTER_BUNDLE } from '../core/assets/AssetCatalog';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { UiButton } from '../ui/UiButton';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import {
  calculateEquipmentSummary,
  calculateTotalPower,
  ensureStarterInventory,
} from '../game/items/inventoryLogic';
import { countClaimableQuests } from '../game/quests/questLogic';
import { StageSelectScene } from './StageSelectScene';
import { QuestScene } from './QuestScene';
import { InventoryScene } from './InventoryScene';
import { AssetGalleryScene } from './AssetGalleryScene';

export class LobbyScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private profile?: PlayerProfile;
  private fpsText?: Text;
  private fpsButton?: UiButton;
  private qualityButton?: UiButton;
  private diagnosticsElapsed = 0;
  private lobbyBundleLoaded = false;
  private hero?: AnimatedSprite;
  private heroAura?: Graphics;

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');

    const loaded = await context.playerRepository.load(session.uid)
      ?? createDefaultProfile(session.uid, session.displayName);
    this.profile = ensureStarterInventory(loaded, context.gameData);
    await context.playerRepository.save(this.profile);

    await context.assets.loadBundle(LOBBY_CHARACTER_BUNDLE);
    this.lobbyBundleLoaded = true;
    const playerSheet = context.assets.get<Spritesheet>(ASSET_PATHS.playerAtlas);
    const equipmentSheet = context.assets.get<Spritesheet>(ASSET_PATHS.equipmentAtlas);

    const equipment = calculateEquipmentSummary(this.profile, context.gameData);
    const power = calculateTotalPower(context.gameData.player, this.profile, context.gameData);

    this.view.addChild(createBackground('루멘 거점', '획득한 장비를 강화하고 균열 전투에 다시 도전하세요.'));
    this.view.addChild(createPanel(30, 195, 480, 500));

    this.heroAura = new Graphics()
      .circle(DESIGN_WIDTH / 2, 360, 130)
      .fill({ color: COLORS.primary, alpha: 0.08 })
      .circle(DESIGN_WIDTH / 2, 375, 72)
      .fill({ color: COLORS.primary, alpha: 0.24 });
    this.view.addChild(this.heroAura);

    const idle = playerSheet?.animations['player.idle.s'] as Texture[] | undefined;
    if (idle && idle.length > 0) {
      this.hero = new AnimatedSprite({ textures: idle, animationSpeed: 0.1, loop: true, autoPlay: true });
      this.hero.anchor.set(0.5, 0.76);
      this.hero.scale.set(3.2);
      this.hero.position.set(DESIGN_WIDTH / 2, 455);
      this.view.addChild(this.hero);
    } else {
      const fallback = new Graphics()
        .circle(DESIGN_WIDTH / 2, 325, 34)
        .fill(COLORS.text)
        .roundRect(DESIGN_WIDTH / 2 - 46, 360, 92, 130, 35)
        .fill({ color: COLORS.primaryBright, alpha: 0.9 });
      this.view.addChild(fallback);
    }

    const weaponUid = this.profile.equipped.weapon;
    const weaponId = weaponUid ? this.profile.inventory[weaponUid]?.itemId : undefined;
    const weaponTexture = weaponId ? equipmentSheet?.textures[`item.${weaponId}`] : undefined;
    if (weaponTexture) {
      const weapon = new Sprite(weaponTexture);
      weapon.anchor.set(0.5);
      weapon.scale.set(0.62);
      weapon.rotation = -0.62;
      weapon.position.set(DESIGN_WIDTH / 2 + 78, 376);
      this.view.addChild(weapon);
    }

    const name = new Text({
      text: this.profile.nickname,
      style: new TextStyle({ fill: COLORS.text, fontSize: 28, fontWeight: '700' }),
    });
    name.anchor.set(0.5);
    name.position.set(DESIGN_WIDTH / 2, 510);

    const stats = new Text({
      text: `Lv.${this.profile.level}  ·  전투력 ${power}  ·  Gold ${this.profile.gold.toLocaleString()}`,
      style: new TextStyle({ fill: COLORS.text, fontSize: 17, fontWeight: '600' }),
    });
    stats.anchor.set(0.5);
    stats.position.set(DESIGN_WIDTH / 2, 550);

    const equipmentText = new Text({
      text: `장비 보너스  공격 +${equipment.attack}  방어 +${equipment.defense}  HP +${equipment.maxHp}`,
      style: new TextStyle({ fill: COLORS.accent, fontSize: 14 }),
    });
    equipmentText.anchor.set(0.5);
    equipmentText.position.set(DESIGN_WIDTH / 2, 585);

    const claimableQuests = countClaimableQuests(this.profile, context.gameData);
    const clearedStages = Object.values(this.profile.stageProgress).filter((entry) => entry.clearCount > 0).length;
    const dataStatus = new Text({
      text: `스테이지 ${clearedStages}/10 · 장비 ${Object.keys(this.profile.inventory).length}개 · 수령 가능 퀘스트 ${claimableQuests}개`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 14 }),
    });
    dataStatus.anchor.set(0.5);
    dataStatus.position.set(DESIGN_WIDTH / 2, 620);

    const battle = new UiButton({
      label: '스테이지 선택',
      width: 390,
      height: 60,
      onPress: async () => context.scenes.change(() => new StageSelectScene()),
    });
    battle.position.set(75, 700);

    const inventory = new UiButton({
      label: '장비·인벤토리',
      width: 188,
      height: 56,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new InventoryScene()),
    });
    inventory.position.set(75, 775);

    const quests = new UiButton({
      label: claimableQuests > 0 ? `퀘스트 (${claimableQuests})` : '퀘스트',
      width: 188,
      height: 56,
      tone: claimableQuests > 0 ? 'primary' : 'secondary',
      onPress: async () => context.scenes.change(() => new QuestScene()),
    });
    quests.position.set(277, 775);

    this.fpsButton = new UiButton({
      label: this.fpsLabel(),
      width: 188,
      height: 52,
      tone: 'secondary',
      onPress: () => {
        context.frameRate.cycleMode();
        this.fpsButton?.setLabel(this.fpsLabel());
      },
    });
    this.fpsButton.position.set(75, 846);

    this.qualityButton = new UiButton({
      label: this.qualityLabel(),
      width: 188,
      height: 52,
      tone: 'secondary',
      onPress: () => {
        context.graphicsQuality.cycle();
        this.qualityButton?.setLabel(this.qualityLabel());
      },
    });
    this.qualityButton.position.set(277, 846);

    const assetGallery = new UiButton({
      label: '에셋 품질 보관소 · v0.9',
      width: 390,
      height: 44,
      fontSize: 16,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new AssetGalleryScene()),
    });
    assetGallery.position.set(75, 906);

    this.fpsText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12 }),
    });
    this.fpsText.anchor.set(1, 1);
    this.fpsText.position.set(DESIGN_WIDTH - 12, DESIGN_HEIGHT - 6);

    this.view.addChild(
      name,
      stats,
      equipmentText,
      dataStatus,
      battle,
      inventory,
      quests,
      this.fpsButton,
      this.qualityButton,
      assetGallery,
      this.fpsText,
    );
  }

  public async exit(): Promise<void> {
    if (this.lobbyBundleLoaded) {
      await this.context?.assets.releaseBundle(LOBBY_CHARACTER_BUNDLE.id);
      this.lobbyBundleLoaded = false;
    }
  }

  public update(deltaSeconds: number): void {
    if (this.heroAura && this.context?.graphicsQuality.current.backgroundAnimationRate) {
      this.heroAura.rotation += deltaSeconds * 0.08 * this.context.graphicsQuality.current.backgroundAnimationRate;
    }

    this.diagnosticsElapsed += deltaSeconds;
    if (this.diagnosticsElapsed < 0.5 || !this.fpsText || !this.context) return;
    this.diagnosticsElapsed = 0;
    const assets = this.context.assets.diagnostics();
    const audio = this.context.audio.diagnostics();
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    const heap = memory ? ` · Heap ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(0)}MB` : '';
    this.fpsText.text = `${this.context.performance.fps} FPS · ${this.context.performance.tier} · Assets ${assets.loadedUrls}/${assets.activeBundles} · Audio ${audio.cached}${heap}`;
  }

  private fpsLabel(): string {
    const mode = this.context?.frameRate.currentMode ?? 'auto';
    return `FPS: ${mode === 'auto' ? '자동' : mode}`;
  }

  private qualityLabel(): string {
    return `그래픽: ${this.context?.graphicsQuality.current.label ?? '균형'}`;
  }
}

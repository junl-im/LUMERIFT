import { Container, Graphics, Sprite, Text, TextStyle, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { ASSET_PATHS, LOBBY_CHARACTER_BUNDLE } from '../core/assets/AssetCatalog';
import { createRasterPanel } from '../ui/UiSkin';
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
  private atmosphere?: Graphics;

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
    const backgroundTexture = context.assets.get<Texture>(ASSET_PATHS.lobbyBackground);
    const portraitTexture = context.assets.get<Texture>(ASSET_PATHS.heroPortrait);

    const equipment = calculateEquipmentSummary(this.profile, context.gameData);
    const power = calculateTotalPower(context.gameData.player, this.profile, context.gameData);
    const claimableQuests = countClaimableQuests(this.profile, context.gameData);
    const clearedStages = Object.values(this.profile.stageProgress).filter((entry) => entry.clearCount > 0).length;

    this.createBackdrop(backgroundTexture);
    this.createHeader(power);
    this.createHeroCard(portraitTexture);
    this.createStatusPanel(power, equipment, clearedStages, claimableQuests);
    this.createNavigation(context, claimableQuests);
    this.createDiagnostics();
  }

  public async exit(): Promise<void> {
    if (this.lobbyBundleLoaded) {
      await this.context?.assets.releaseBundle(LOBBY_CHARACTER_BUNDLE.id);
      this.lobbyBundleLoaded = false;
    }
  }

  public update(deltaSeconds: number): void {
    if (this.atmosphere && this.context?.graphicsQuality.current.backgroundAnimationRate) {
      this.atmosphere.rotation += deltaSeconds * 0.018 * this.context.graphicsQuality.current.backgroundAnimationRate;
      this.atmosphere.alpha = 0.65 + Math.sin(performance.now() * 0.0007) * 0.12;
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

  private createBackdrop(texture?: Texture): void {
    if (texture) {
      const backdrop = new Sprite(texture);
      backdrop.width = DESIGN_WIDTH;
      backdrop.height = DESIGN_HEIGHT;
      this.view.addChild(backdrop);
    } else {
      this.view.addChild(new Graphics().rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT).fill(COLORS.background));
    }

    const shade = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, 170)
      .fill({ color: 0x04080f, alpha: 0.46 })
      .rect(0, 570, DESIGN_WIDTH, DESIGN_HEIGHT - 570)
      .fill({ color: 0x04070d, alpha: 0.72 });
    this.atmosphere = new Graphics()
      .circle(460, 250, 170)
      .fill({ color: COLORS.accent, alpha: 0.08 })
      .circle(80, 560, 190)
      .fill({ color: COLORS.warning, alpha: 0.035 });
    this.view.addChild(shade, this.atmosphere);
  }

  private createHeader(power: number): void {
    const topBar = createRasterPanel(16, 18, DESIGN_WIDTH - 32, 112, 'panel_strong');
    const brand = new Text({
      text: 'LUMERIFT',
      style: new TextStyle({ fill: 0xf1dfaa, fontSize: 31, fontWeight: '800', letterSpacing: 4 }),
    });
    brand.position.set(32, 31);

    const chapter = new Text({
      text: '균열의 계승자 · 루멘 전초기지',
      style: new TextStyle({ fill: 0xaeddd2, fontSize: 13, fontWeight: '600', letterSpacing: 1 }),
    });
    chapter.position.set(34, 72);

    const powerChip = createRasterPanel(340, 38, 166, 66, 'resource_chip');
    const powerLabel = new Text({
      text: '전투력',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, fontWeight: '600' }),
    });
    powerLabel.position.set(357, 49);
    const powerValue = new Text({
      text: power.toLocaleString(),
      style: new TextStyle({ fill: 0xffd778, fontSize: 25, fontWeight: '800' }),
    });
    powerValue.position.set(355, 67);

    this.view.addChild(topBar, brand, chapter, powerChip, powerLabel, powerValue);
  }

  private createHeroCard(texture?: Texture): void {
    const frame = createRasterPanel(18, 148, 318, 448, 'frame_portrait');
    this.view.addChild(frame);

    if (texture) {
      const portrait = new Sprite(texture);
      portrait.position.set(30, 160);
      portrait.width = 294;
      portrait.height = 392;
      this.view.addChild(portrait);
    }

    const namePlate = createRasterPanel(32, 522, 290, 60, 'panel_gold');
    const name = new Text({
      text: this.profile?.nickname ?? '계승자',
      style: new TextStyle({ fill: 0xffe5aa, fontSize: 23, fontWeight: '800' }),
    });
    name.anchor.set(0.5);
    name.position.set(177, 544);
    const role = new Text({
      text: `Lv.${this.profile?.level ?? 1} · 균열 추적자`,
      style: new TextStyle({ fill: 0xbfdad4, fontSize: 12, fontWeight: '600' }),
    });
    role.anchor.set(0.5);
    role.position.set(177, 567);
    this.view.addChild(namePlate, name, role);
  }

  private createStatusPanel(
    power: number,
    equipment: { readonly attack: number; readonly defense: number; readonly maxHp: number },
    clearedStages: number,
    claimableQuests: number,
  ): void {
    const panel = createRasterPanel(346, 148, 176, 448, 'panel');
    const heading = new Text({
      text: 'FIELD STATUS',
      style: new TextStyle({ fill: 0xe5d59f, fontSize: 13, fontWeight: '800', letterSpacing: 1 }),
    });
    heading.position.set(366, 169);

    const divider = new Graphics()
      .rect(366, 199, 136, 2)
      .fill({ color: 0xcab274, alpha: 0.55 });

    const rows = [
      ['POWER', power.toLocaleString(), 0xffd778],
      ['ATTACK', `+${equipment.attack}`, 0xff9b7b],
      ['DEFENSE', `+${equipment.defense}`, 0x82d6ff],
      ['MAX HP', `+${equipment.maxHp}`, 0x72e4bd],
      ['STAGE', `${clearedStages} / 10`, 0xc8b4ff],
      ['QUEST', claimableQuests > 0 ? `${claimableQuests} READY` : 'CLEAR', claimableQuests > 0 ? 0xffd778 : 0x72e4bd],
    ] as const;

    const children: Container[] = [panel, heading, divider];
    rows.forEach(([label, value, color], index) => {
      const y = 222 + index * 51;
      const labelText = new Text({
        text: label,
        style: new TextStyle({ fill: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 }),
      });
      labelText.position.set(366, y);
      const valueText = new Text({
        text: value,
        style: new TextStyle({ fill: color, fontSize: 18, fontWeight: '800' }),
      });
      valueText.position.set(366, y + 17);
      children.push(labelText, valueText);
    });
    this.view.addChild(...children);
  }

  private createNavigation(context: AppContext, claimableQuests: number): void {
    const battle = new UiButton({
      label: '균열 작전 개시',
      width: 500,
      height: 64,
      onPress: async () => context.scenes.change(() => new StageSelectScene()),
    });
    battle.position.set(20, 620);

    const inventory = new UiButton({
      label: '장비·인벤토리',
      width: 242,
      height: 54,
      tone: 'secondary',
      fontSize: 17,
      onPress: async () => context.scenes.change(() => new InventoryScene()),
    });
    inventory.position.set(20, 700);

    const quests = new UiButton({
      label: claimableQuests > 0 ? `퀘스트 보상 ${claimableQuests}` : '퀘스트',
      width: 242,
      height: 54,
      tone: claimableQuests > 0 ? 'primary' : 'secondary',
      fontSize: 17,
      onPress: async () => context.scenes.change(() => new QuestScene()),
    });
    quests.position.set(278, 700);

    this.fpsButton = new UiButton({
      label: this.fpsLabel(),
      width: 242,
      height: 50,
      tone: 'secondary',
      fontSize: 15,
      onPress: () => {
        context.frameRate.cycleMode();
        this.fpsButton?.setLabel(this.fpsLabel());
      },
    });
    this.fpsButton.position.set(20, 770);

    this.qualityButton = new UiButton({
      label: this.qualityLabel(),
      width: 242,
      height: 50,
      tone: 'secondary',
      fontSize: 15,
      onPress: () => {
        context.graphicsQuality.cycle();
        this.qualityButton?.setLabel(this.qualityLabel());
      },
    });
    this.qualityButton.position.set(278, 770);

    const assetGallery = new UiButton({
      label: '아트 보관소 · 라이선스 및 교체 현황',
      width: 500,
      height: 48,
      fontSize: 15,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new AssetGalleryScene()),
    });
    assetGallery.position.set(20, 836);

    const notice = new Text({
      text: 'CHAPTER 1 · 안개숲 균열  |  production-candidate open-art pass',
      style: new TextStyle({ fill: 0x91aaa5, fontSize: 11, fontWeight: '600' }),
    });
    notice.anchor.set(0.5);
    notice.position.set(DESIGN_WIDTH / 2, 905);

    this.view.addChild(battle, inventory, quests, this.fpsButton, this.qualityButton, assetGallery, notice);
  }

  private createDiagnostics(): void {
    this.fpsText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10 }),
    });
    this.fpsText.anchor.set(1, 1);
    this.fpsText.position.set(DESIGN_WIDTH - 10, DESIGN_HEIGHT - 5);
    this.view.addChild(this.fpsText);
  }

  private fpsLabel(): string {
    const mode = this.context?.frameRate.currentMode ?? 'auto';
    return `FPS · ${mode === 'auto' ? '자동' : mode}`;
  }

  private qualityLabel(): string {
    return `그래픽 · ${this.context?.graphicsQuality.current.label ?? '균형'}`;
  }
}

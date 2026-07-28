import { Container, Graphics, Sprite, Text, TextStyle, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { ASSET_PATHS, LOBBY_CHARACTER_BUNDLE } from '../core/assets/AssetCatalog';
import { createRasterPanel } from '../ui/UiSkin';
import { UiButton } from '../ui/UiButton';
import { createBadge, createProgressBar } from '../ui/PremiumUi';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import {
  calculateEquipmentSummary,
  calculateTotalPower,
  ensureStarterInventory,
} from '../game/items/inventoryLogic';
import { countClaimableQuests } from '../game/quests/questLogic';
import { operationNotificationCount } from '../game/operations/operationsLogic';
import { StageSelectScene } from './StageSelectScene';
import { QuestScene } from './QuestScene';
import { InventoryScene } from './InventoryScene';
import { AssetGalleryScene } from './AssetGalleryScene';
import { OperationsScene } from './OperationsScene';
import { AccountScene } from './AccountScene';

export class LobbyScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private profile?: PlayerProfile;
  private fpsText?: Text;
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
    const operationAlerts = operationNotificationCount(this.profile);

    this.createBackdrop(backgroundTexture);
    this.createHeader(power);
    this.createHeroPresentation(portraitTexture);
    this.createMissionCard(power, equipment, clearedStages, claimableQuests);
    this.createPrimaryAction(context);
    this.createNavigation(context, claimableQuests, operationAlerts);
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
      this.atmosphere.rotation += deltaSeconds * 0.012 * this.context.graphicsQuality.current.backgroundAnimationRate;
      this.atmosphere.alpha = 0.38 + Math.sin(performance.now() * 0.0006) * 0.08;
    }

    this.diagnosticsElapsed += deltaSeconds;
    if (this.diagnosticsElapsed < 0.5 || !this.fpsText || !this.context) return;
    this.diagnosticsElapsed = 0;
    const assets = this.context.assets.diagnostics();
    this.fpsText.text = `${this.context.performance.fps} FPS · ${this.context.performance.tier} · ${assets.loadedUrls} assets`;
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
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.dark, alpha: 0.12 })
      .rect(0, 0, DESIGN_WIDTH, 130)
      .fill({ color: COLORS.dark, alpha: 0.48 })
      .rect(0, 680, DESIGN_WIDTH, 280)
      .fill({ color: COLORS.dark, alpha: 0.7 });
    this.atmosphere = new Graphics()
      .circle(472, 210, 170)
      .fill({ color: COLORS.primaryBright, alpha: 0.08 })
      .circle(90, 560, 210)
      .fill({ color: COLORS.accent, alpha: 0.045 });
    this.view.addChild(shade, this.atmosphere);
  }

  private createHeader(power: number): void {
    const topBar = createRasterPanel(16, 16, DESIGN_WIDTH - 32, 92, 'panel_strong');
    const brand = new Text({
      text: 'LUMERIFT',
      style: new TextStyle({
        fill: 0xf4dca0,
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: 2.5,
        dropShadow: { color: COLORS.dark, alpha: 0.8, blur: 4, distance: 1 },
      }),
    });
    brand.position.set(34, 31);

    const chapter = new Text({
      text: '균열의 계승자  ·  안개숲 전초기지',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, fontWeight: '600' }),
    });
    chapter.position.set(36, 70);

    const powerChip = createRasterPanel(388, 28, 120, 66, 'resource_chip');
    const powerLabel = new Text({
      text: '전투력',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10, fontWeight: '700' }),
    });
    powerLabel.position.set(403, 41);
    const powerValue = new Text({
      text: power.toLocaleString(),
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 22, fontWeight: '700' }),
    });
    powerValue.position.set(401, 59);

    this.view.addChild(topBar, brand, chapter, powerChip, powerLabel, powerValue);
  }

  private createHeroPresentation(texture?: Texture): void {
    if (texture) {
      const portrait = new Sprite(texture);
      portrait.position.set(-18, 116);
      portrait.width = 410;
      portrait.height = 560;
      this.view.addChild(portrait);
    }

    const namePlate = createRasterPanel(28, 598, 300, 70, 'panel_gold');
    const name = new Text({
      text: this.profile?.nickname ?? '계승자',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 24, fontWeight: '700' }),
    });
    name.position.set(49, 611);
    const role = new Text({
      text: `Lv.${this.profile?.level ?? 1}  ·  균열 추적자`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 13, fontWeight: '600' }),
    });
    role.position.set(50, 643);
    this.view.addChild(namePlate, name, role);
  }

  private createMissionCard(
    power: number,
    equipment: { readonly attack: number; readonly defense: number; readonly maxHp: number },
    clearedStages: number,
    claimableQuests: number,
  ): void {
    const panel = createRasterPanel(314, 154, 210, 386, 'panel_strong');
    const eyebrow = new Text({
      text: 'TODAY MISSION',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }),
    });
    eyebrow.position.set(336, 181);
    const title = new Text({
      text: '안개숲 균열',
      style: new TextStyle({ fill: COLORS.text, fontSize: 23, fontWeight: '700' }),
    });
    title.position.set(336, 211);
    const sub = new Text({
      text: `${Math.min(10, clearedStages + 1)}-1  ·  심연의 전령`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, fontWeight: '600' }),
    });
    sub.position.set(336, 248);

    const divider = new Graphics().rect(336, 278, 164, 2).fill({ color: COLORS.warning, alpha: 0.52 });
    const progress = createProgressBar(164, clearedStages / 10, 'primary', 9);
    progress.position.set(336, 314);

    const rows = [
      ['진행', `${clearedStages} / 10`, COLORS.primaryBright],
      ['퀘스트', claimableQuests > 0 ? `${claimableQuests} 수령 가능` : '완료', claimableQuests > 0 ? 0xf4dca0 : COLORS.primaryBright],
      ['공격', `+${equipment.attack}`, 0xe8a17d],
      ['방어', `+${equipment.defense}`, 0x8bc9e5],
    ] as const;
    const children: Container[] = [panel, eyebrow, title, sub, divider, progress];
    rows.forEach(([label, value, color], index) => {
      const y = 343 + index * 48;
      const labelText = new Text({
        text: label,
        style: new TextStyle({ fill: COLORS.muted, fontSize: 10, fontWeight: '700' }),
      });
      labelText.position.set(336, y);
      const valueText = new Text({
        text: value,
        style: new TextStyle({ fill: color, fontSize: 17, fontWeight: '700' }),
      });
      valueText.position.set(336, y + 17);
      children.push(labelText, valueText);
    });

    const readiness = createBadge(power >= 10_000 ? 'READY' : 'GEAR UP', power >= 10_000 ? 'success' : 'warning');
    readiness.position.set(430, 181);
    readiness.scale.set(0.76);
    children.push(readiness);
    this.view.addChild(...children);
  }

  private createPrimaryAction(context: AppContext): void {
    const battle = new UiButton({
      label: '균열 작전 시작',
      width: 480,
      height: 70,
      fontSize: 22,
      onPress: async () => context.scenes.change(() => new StageSelectScene()),
    });
    battle.position.set(30, 704);
    this.view.addChild(battle);
  }

  private createNavigation(context: AppContext, claimableQuests: number, operationAlerts: number): void {
    const dock = createRasterPanel(18, 798, 504, 132, 'panel_strong');
    this.view.addChild(dock);

    const entries = [
      { label: '작전', active: true, press: async () => context.scenes.change(() => new StageSelectScene()) },
      { label: '장비', active: false, press: async () => context.scenes.change(() => new InventoryScene()) },
      { label: claimableQuests > 0 ? `퀘 ${claimableQuests}` : '퀘스트', active: claimableQuests > 0, press: async () => context.scenes.change(() => new QuestScene()) },
      { label: operationAlerts > 0 ? `소식 ${operationAlerts}` : '소식', active: operationAlerts > 0, press: async () => context.scenes.change(() => new OperationsScene()) },
      { label: '도감', active: false, press: async () => context.scenes.change(() => new AssetGalleryScene()) },
    ];

    entries.forEach((entry, index) => {
      const button = new UiButton({
        label: entry.label,
        width: 91,
        height: 72,
        tone: entry.active ? 'primary' : 'secondary',
        fontSize: 12,
        onPress: entry.press,
      });
      button.position.set(30 + index * 98, 820);
      this.view.addChild(button);
    });

    const settings = new UiButton({
      label: `${this.context?.frameRate.currentMode === 'auto' ? 'AUTO' : this.context?.frameRate.currentMode ?? 'AUTO'} · ${this.context?.graphicsQuality.current.label ?? '균형'}`,
      width: 234,
      height: 30,
      tone: 'secondary',
      fontSize: 10,
      onPress: () => {
        context.frameRate.cycleMode();
        context.graphicsQuality.cycle();
      },
    });
    settings.position.set(30, 894);
    const account = new UiButton({
      label: `계정 · ${cloudStateLabel(context.playerRepository.syncSnapshot.state)}`,
      width: 234,
      height: 30,
      tone: context.playerRepository.syncSnapshot.state === 'error' ? 'danger' : 'secondary',
      fontSize: 10,
      onPress: async () => context.scenes.change(() => new AccountScene()),
    });
    account.position.set(276, 894);
    this.view.addChild(settings, account);
  }

  private createDiagnostics(): void {
    this.fpsText = new Text({
      text: '',
      style: new TextStyle({ fill: 0x6f8583, fontSize: 9 }),
    });
    this.fpsText.anchor.set(1, 1);
    this.fpsText.position.set(DESIGN_WIDTH - 10, DESIGN_HEIGHT - 4);
    this.view.addChild(this.fpsText);
  }
}

function cloudStateLabel(state: string): string {
  const labels: Record<string, string> = { idle: 'CLOUD', syncing: 'SYNC', synced: 'OK', offline: 'OFFLINE', error: 'ERROR' };
  return labels[state] ?? 'CLOUD';
}

import { Container, Graphics, Sprite, Text, TextStyle, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { ASSET_PATHS, LOBBY_CHARACTER_BUNDLE } from '../core/assets/AssetCatalog';
import { createRasterPanel } from '../ui/UiSkin';
import { UiButton } from '../ui/UiButton';
import { createBadge, createProgressBar } from '../ui/PremiumUi';
import { createMenuTile, createResourceChip, createSectionTitle } from '../ui/UiTheme';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import { calculateEquipmentSummary, calculateTotalPower, ensureStarterInventory } from '../game/items/inventoryLogic';
import { countClaimableQuests } from '../game/quests/questLogic';
import { operationNotificationCount } from '../game/operations/operationsLogic';
import { StageSelectScene } from './StageSelectScene';
import { SettingsScene } from './SettingsScene';
import { QuestScene } from './QuestScene';
import { InventoryScene } from './InventoryScene';
import { AssetGalleryScene } from './AssetGalleryScene';
import { OperationsScene } from './OperationsScene';
import { AccountScene } from './AccountScene';
import { RankingScene } from './RankingScene';
import { createComicTag, createFeatureMarquee, createInterfaceBackdrop, createInterfaceStamp } from '../ui/InterfaceChrome';
import { createUxStatusRail } from '../ui/UxFeedback';
import { resolveLobbyNextAction, type LobbyNextAction } from '../game/ui/LobbyNextAction';

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

    const loaded = await context.playerRepository.load(session.uid) ?? createDefaultProfile(session.uid, session.displayName);
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
    this.createHeader(power, operationAlerts);
    this.createHeroPresentation(portraitTexture, power);
    this.createAttendanceCard();
    this.createEventBanner();
    this.createQuestPanel(clearedStages, claimableQuests, equipment);
    const nextAction = resolveLobbyNextAction({ claimableQuests, operationAlerts, clearedStages, totalStages: 10 });
    this.createRenewalBriefing(nextAction);
    this.createPrimaryAction(context, nextAction);
    this.createMenuGrid(context, claimableQuests, operationAlerts);
    this.createBottomNavigation(context);
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
      this.atmosphere.rotation += deltaSeconds * 0.01 * this.context.graphicsQuality.current.backgroundAnimationRate;
      this.atmosphere.alpha = 0.35 + Math.sin(performance.now() * 0.00055) * 0.07;
    }

    this.diagnosticsElapsed += deltaSeconds;
    if (this.diagnosticsElapsed < 0.5 || !this.fpsText || !this.context) return;
    this.diagnosticsElapsed = 0;
    const assets = this.context.assets.diagnostics();
    const adaptive = this.context.adaptivePerformance.snapshot();
    this.fpsText.text = `${this.context.performance.fps} FPS · ${adaptive.level.toUpperCase()} · ${this.context.graphicsQuality.effectiveMode} · ${assets.loadedUrls}`;
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

    const interfaceBackdrop = createInterfaceBackdrop({ dense: false, label: 'LUMERIFT · COMMAND HUB' });
    const shade = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill({ color: COLORS.dark, alpha: 0.1 })
      .rect(0, 0, DESIGN_WIDTH, 118)
      .fill({ color: COLORS.dark, alpha: 0.7 })
      .rect(0, 600, DESIGN_WIDTH, 360)
      .fill({ color: COLORS.dark, alpha: 0.78 });
    this.atmosphere = new Graphics()
      .circle(437, 210, 176)
      .fill({ color: COLORS.primaryBright, alpha: 0.07 })
      .circle(437, 210, 150)
      .stroke({ color: COLORS.primaryBright, alpha: 0.12, width: 2 })
      .circle(437, 210, 118)
      .stroke({ color: 0xffffff, alpha: 0.04, width: 1 })
      .circle(90, 510, 215)
      .fill({ color: COLORS.warning, alpha: 0.025 })
      .circle(90, 510, 172)
      .stroke({ color: COLORS.warning, alpha: 0.07, width: 2 })
      .moveTo(285, 112)
      .lineTo(520, 347)
      .stroke({ color: COLORS.primaryBright, alpha: 0.035, width: 1 });
    this.view.addChild(interfaceBackdrop, shade, this.atmosphere);
  }

  private createHeader(power: number, operationAlerts: number): void {
    const topBar = createRasterPanel(12, 12, DESIGN_WIDTH - 24, 94, 'panel_strong');
    const commandStamp = createInterfaceStamp('COMMAND HUB', 126);
    commandStamp.position.set(392, 70);
    const updateTag = createComicTag('UX UPGRADE', COLORS.sunrise);
    updateTag.position.set(388, 38);
    const portraitFrame = createRasterPanel(22, 22, 72, 72, 'portrait_small');
    const brand = new Text({
      text: 'LUMERIFT',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 20, fontWeight: '700', letterSpacing: 1.7 }),
    });
    brand.position.set(105, 24);
    const identity = new Text({
      text: `${this.profile?.nickname ?? '계승자'}  ·  Lv.${this.profile?.level ?? 1}`,
      style: new TextStyle({ fill: COLORS.text, fontSize: 12, fontWeight: '700' }),
    });
    identity.position.set(106, 54);
    const exp = createProgressBar(118, Math.min(1, (this.profile?.exp ?? 0) / 1000), 'primary', 7);
    exp.position.set(106, 77);

    const energy = createResourceChip('energy', 'ENERGY', '120/120', 106);
    energy.position.set(236, 27);
    const gold = createResourceChip('gold', 'GOLD', (this.profile?.gold ?? 0).toLocaleString(), 106);
    gold.position.set(345, 27);
    const crystal = createResourceChip('crystal', 'LUMEN', '0', 70);
    crystal.position.set(454, 27);

    const powerText = new Text({
      text: `POWER ${power.toLocaleString()}`,
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 9, fontWeight: '700', letterSpacing: 0.7 }),
    });
    powerText.position.set(106, 87);

    if (operationAlerts > 0) {
      const dot = new Graphics().circle(508, 18, 9).fill({ color: COLORS.danger, alpha: 0.98 }).stroke({ color: 0xf4dca0, width: 1 });
      const count = new Text({ text: String(operationAlerts), style: new TextStyle({ fill: 0xffffff, fontSize: 9, fontWeight: '700' }) });
      count.anchor.set(0.5);
      count.position.set(508, 18);
      this.view.addChild(dot, count);
    }
    this.view.addChild(topBar, portraitFrame, brand, identity, exp, energy, gold, crystal, powerText, commandStamp, updateTag);
  }

  private createHeroPresentation(texture?: Texture, power = 0): void {
    if (texture) {
      const portrait = new Sprite(texture);
      portrait.position.set(40, 112);
      portrait.width = 342;
      portrait.height = 510;
      this.view.addChild(portrait);
    }

    const namePlate = createRasterPanel(26, 536, 292, 78, 'panel_gold');
    const marquee = createFeatureMarquee('커맨드 허브 · UX 업그레이드', '첫 진입에서 필요한 행동과 아트·자동화 상태를 더 빠르게 읽도록 브리핑 구조를 재정비했습니다.', 268);
    marquee.position.set(36, 446);
    const name = new Text({
      text: this.profile?.nickname ?? '계승자',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 23, fontWeight: '700' }),
    });
    name.position.set(48, 550);
    const role = new Text({
      text: `Lv.${this.profile?.level ?? 1} · 균열 추적자 · 전투력 ${power.toLocaleString()}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 11, fontWeight: '600' }),
    });
    role.position.set(49, 582);
    this.view.addChild(marquee, namePlate, name, role);
  }

  private createAttendanceCard(): void {
    const panel = createRasterPanel(18, 126, 122, 150, 'panel_gold');
    const title = new Text({ text: '오늘의 출석', style: new TextStyle({ fill: 0xf4dca0, fontSize: 12, fontWeight: '700' }) });
    title.anchor.set(0.5);
    title.position.set(79, 144);
    const chest = createMenuTile({ icon: 'attendance', label: 'DAY 1', width: 88, height: 74, active: true, onPress: async () => this.context?.scenes.change(() => new OperationsScene('attendance')) });
    chest.position.set(35, 164);
    chest.scale.set(0.82);
    const reward = new Text({ text: '500 GOLD', style: new TextStyle({ fill: COLORS.text, fontSize: 11, fontWeight: '700' }) });
    reward.anchor.set(0.5);
    reward.position.set(79, 248);
    this.view.addChild(panel, title, chest, reward);
  }

  private createEventBanner(): void {
    const panel = createRasterPanel(330, 126, 196, 105, 'panel_glass');
    const eyebrow = new Text({ text: 'RIFT SIGNAL', style: new TextStyle({ fill: COLORS.primaryBright, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 }) });
    eyebrow.position.set(348, 143);
    const title = new Text({ text: '밤의 추적자', style: new TextStyle({ fill: COLORS.text, fontSize: 19, fontWeight: '700' }) });
    title.position.set(348, 163);
    const detail = new Text({ text: 'Chapter 1 균열 신호 상승', style: new TextStyle({ fill: 0xf4dca0, fontSize: 10 }) });
    detail.position.set(348, 193);
    const badge = createBadge('확률 UP', 'warning');
    badge.position.set(444, 141);
    badge.scale.set(0.64);
    this.view.addChild(panel, eyebrow, title, detail, badge);
  }

  private createQuestPanel(clearedStages: number, claimableQuests: number, equipment: { readonly attack: number; readonly defense: number; readonly maxHp: number }): void {
    const panel = createRasterPanel(330, 245, 196, 350, 'panel_strong');
    const section = createSectionTitle('오늘의 퀘스트', '진행 중인 핵심 목표');
    section.position.set(346, 265);
    const rows = [
      ['스토리 스테이지', `${clearedStages} / 10`, clearedStages / 10],
      ['몬스터 처치', `${this.profile?.dailyStatistics.monstersDefeated ?? 0} / 200`, (this.profile?.dailyStatistics.monstersDefeated ?? 0) / 200],
      ['장비 강화', `${this.profile?.dailyStatistics.equipmentUpgrades ?? 0} / 1`, this.profile?.dailyStatistics.equipmentUpgrades ? 1 : 0],
    ] as const;
    rows.forEach(([label, value, ratio], index) => {
      const y = 318 + index * 74;
      const labelText = new Text({ text: label, style: new TextStyle({ fill: COLORS.text, fontSize: 12, fontWeight: '700' }) });
      labelText.position.set(346, y);
      const valueText = new Text({ text: value, style: new TextStyle({ fill: 0xf4dca0, fontSize: 10, fontWeight: '700' }) });
      valueText.anchor.set(1, 0);
      valueText.position.set(505, y + 1);
      const bar = createProgressBar(158, ratio, ratio >= 1 ? 'success' : 'primary', 7);
      bar.position.set(346, y + 28);
      this.view.addChild(labelText, valueText, bar);
    });
    const stats = new Text({
      text: `장비 보정  ATK +${equipment.attack}  DEF +${equipment.defense}
수령 가능 보상  ${claimableQuests}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 9, lineHeight: 16 }),
    });
    stats.position.set(346, 533);
    const button = new UiButton({ label: claimableQuests > 0 ? `보상 ${claimableQuests}개 확인` : '퀘스트 모두 보기', width: 164, height: 38, tone: claimableQuests > 0 ? 'primary' : 'secondary', fontSize: 10, onPress: async () => this.context?.scenes.change(() => new QuestScene()) });
    button.position.set(346, 553);
    this.view.addChild(panel, section, stats, button);
  }

  private createRenewalBriefing(action: LobbyNextAction): void {
    const briefing = createUxStatusRail({
      eyebrow: action.eyebrow,
      title: action.title,
      detail: action.detail,
      width: 236,
      height: 90,
      tone: action.tone,
    });
    briefing.position.set(26, 620);
    const contractTag = createBadge('커맨드 브리핑 · asset audit ready', 'warning');
    contractTag.position.set(112, 682);
    contractTag.scale.set(0.42);
    this.view.addChild(briefing, contractTag);
  }

  private createPrimaryAction(context: AppContext, action: LobbyNextAction): void {
    const primary = new UiButton({
      label: action.buttonLabel,
      subtitle: action.buttonSubtitle,
      subtitleFontSize: 9,
      icon: action.icon,
      align: 'left',
      width: 248,
      height: 76,
      fontSize: action.buttonLabel.length > 8 ? 19 : 22,
      onPress: async () => this.openNextAction(context, action.id),
    });
    primary.position.set(266, 620);
    this.view.addChild(primary);
  }

  private async openNextAction(context: AppContext, action: LobbyNextAction['id']): Promise<void> {
    if (action === 'claim-quest') {
      await context.scenes.change(() => new QuestScene());
      return;
    }
    if (action === 'check-operations') {
      await context.scenes.change(() => new OperationsScene('mail'));
      return;
    }
    if (action === 'review-assets') {
      await context.scenes.change(() => new AssetGalleryScene());
      return;
    }
    await context.scenes.change(() => new StageSelectScene());
  }

  private createMenuGrid(context: AppContext, claimableQuests: number, operationAlerts: number): void {
    const entries = [
      { icon: 'stage', label: '스테이지', press: async () => context.scenes.change(() => new StageSelectScene()) },
      { icon: 'equipment', label: '장비', press: async () => context.scenes.change(() => new InventoryScene()) },
      { icon: 'inventory', label: '인벤토리', press: async () => context.scenes.change(() => new InventoryScene()) },
      { icon: 'quest', label: '퀘스트', badge: claimableQuests > 0 ? String(claimableQuests) : undefined, press: async () => context.scenes.change(() => new QuestScene()) },
      { icon: 'mail', label: '우편', badge: operationAlerts > 0 ? String(operationAlerts) : undefined, press: async () => context.scenes.change(() => new OperationsScene('mail')) },
      { icon: 'attendance', label: '출석', press: async () => context.scenes.change(() => new OperationsScene('attendance')) },
      { icon: 'ranking', label: '랭킹', press: async () => context.scenes.change(() => new RankingScene('season')) },
      { icon: 'account', label: '계정', press: async () => context.scenes.change(() => new AccountScene()) },
    ];
    entries.forEach((entry, index) => {
      const tile = createMenuTile({ icon: entry.icon, label: entry.label, width: 116, height: 72, badge: entry.badge, onPress: entry.press });
      tile.position.set(26 + (index % 4) * 124, 720 + Math.floor(index / 4) * 78);
      this.view.addChild(tile);
    });
  }

  private createBottomNavigation(context: AppContext): void {
    const dock = createRasterPanel(12, 868, 516, 80, 'panel_strong');
    this.view.addChild(dock);
    const items = [
      { icon: 'home', label: '홈', active: true, press: async () => undefined },
      { icon: 'hero', label: '영웅', active: false, press: async () => context.scenes.change(() => new InventoryScene()) },
      { icon: 'summon', label: '도감', active: false, press: async () => context.scenes.change(() => new AssetGalleryScene()) },
      { icon: 'shop', label: '운영', active: false, press: async () => context.scenes.change(() => new OperationsScene()) },
      { icon: 'menu', label: '설정', active: false, press: async () => { await context.scenes.change(() => new SettingsScene('lobby')); } },
    ];
    items.forEach((item, index) => {
      const tile = createMenuTile({ icon: item.icon, label: item.label, width: 94, height: 62, active: item.active, onPress: item.press });
      tile.position.set(26 + index * 99, 878);
      this.view.addChild(tile);
    });
  }

  private createDiagnostics(): void {
    this.fpsText = new Text({ text: '', style: new TextStyle({ fill: 0x6f8583, fontSize: 8 }) });
    this.fpsText.anchor.set(1, 1);
    this.fpsText.position.set(DESIGN_WIDTH - 8, DESIGN_HEIGHT - 3);
    this.view.addChild(this.fpsText);
  }
}

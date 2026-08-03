import { Container, Sprite, Text, TextStyle, type Spritesheet } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { ASSET_PATHS, EQUIPMENT_UI_BUNDLE } from '../core/assets/AssetCatalog';
import type { PlayerProfile } from '../repositories/PlayerRepository';
import {
  bulkSellCommon,
  calculateEquipmentSummary,
  calculateItemPower,
  calculateItemStats,
  calculateTotalPower,
  ensureStarterInventory,
  equipItem,
  isEquipped,
  sellItem,
  sortInventory,
  toggleItemLock,
  unequipSlot,
  upgradeCost,
  upgradeItem,
  type InventorySortMode,
} from '../game/items/inventoryLogic';
import type { EquipmentSlot, InventoryItem, ItemGrade } from '../game/items/itemTypes';
import { createBackground, createPanel } from '../ui/SceneChrome';
import {
  createBadge,
  createDivider,
  createItemFrame,
  createMetric,
  createProgressBar,
  createSectionPanel,
} from '../ui/PremiumUi';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';
import { materialFrameKey } from '../game/presentation/CharacterEquipmentVisualProfile';
import { PREMIUM_HUD_TEXTURE_KEYS, premiumHudTexture } from '../ui/PremiumHudArt';
import {
  PREMIUM_UI_ICON_KEYS,
  premiumGradeTextureKey,
  premiumUiV16Texture,
} from '../ui/PremiumUiIconArtV16';
import { PREMIUM_UI_ICON_V17_KEYS, premiumUiV17Texture } from '../ui/PremiumUiIconArtV17';
import { PREMIUM_UI_ICON_V18_KEYS, premiumUiV18Texture } from '../ui/PremiumUiIconArtV18';

const PAGE_SIZE = 12;
const GRID_COLUMNS = 3;
const SLOT_SIZE = 84;

export class InventoryScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private profile?: PlayerProfile;
  private equipmentSheet?: Spritesheet;
  private equipmentMaterialSheet?: Spritesheet;
  private premiumHudSheet?: Spritesheet;
  private premiumUiV16Sheet?: Spritesheet;
  private premiumUiV17Sheet?: Spritesheet;
  private premiumUiV18Sheet?: Spritesheet;
  private equipmentBundleLoaded = false;

  public constructor(
    private readonly filter?: EquipmentSlot,
    private readonly sortMode: InventorySortMode = 'power',
    private readonly page = 0,
    private readonly selectedUid?: string,
  ) {}

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');

    const loaded = await context.playerRepository.load(session.uid);
    if (!loaded) throw new Error('플레이어 저장 데이터를 찾을 수 없습니다.');
    this.profile = ensureStarterInventory(loaded, context.gameData);
    await context.playerRepository.save(this.profile);
    await context.assets.loadBundle(EQUIPMENT_UI_BUNDLE);
    this.equipmentBundleLoaded = true;
    this.equipmentSheet = context.assets.get<Spritesheet>(ASSET_PATHS.equipmentAtlas);
    this.equipmentMaterialSheet = context.assets.get<Spritesheet>(ASSET_PATHS.equipmentMaterialAtlas);
    this.premiumHudSheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumHudAtlas);
    this.premiumUiV16Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumUiIconsV16Atlas);
    this.premiumUiV17Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumUiIconsV17Atlas);
    this.premiumUiV18Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumUiIconsV18Atlas);

    const sorted = sortInventory(this.profile, context.gameData, this.sortMode, this.filter);
    const maxPage = Math.max(0, Math.ceil(sorted.length / PAGE_SIZE) - 1);
    const safePage = Math.min(this.page, maxPage);
    const items = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
    const selected = this.resolveSelected(items);

    this.view.addChild(createBackground('장비 보관소', '장비를 비교하고 성장 방향을 한눈에 확인하세요.'));
    const equipmentTexture = premiumUiV18Texture(this.premiumUiV18Sheet, PREMIUM_UI_ICON_V18_KEYS.assetQuality)
      ?? premiumUiV17Texture(this.premiumUiV17Sheet, PREMIUM_UI_ICON_V17_KEYS.equipment);
    if (equipmentTexture) {
      const equipmentIcon = new Sprite(equipmentTexture);
      equipmentIcon.anchor.set(0.5);
      equipmentIcon.position.set(486, 108);
      equipmentIcon.scale.set(0.34);
      equipmentIcon.alpha = 0.9;
      this.view.addChild(equipmentIcon);
    }
    this.view.addChild(createPanel(18, 150, 504, 674));

    this.createHeader(context);
    this.createFilters(context, safePage);
    this.createGrid(context, items, safePage, maxPage);
    this.createDetails(context, selected, safePage);
    this.createFooter(context);
  }

  public async exit(): Promise<void> {
    if (this.equipmentBundleLoaded) {
      await this.context?.assets.releaseBundle(EQUIPMENT_UI_BUNDLE.id);
      this.equipmentBundleLoaded = false;
    }
  }

  public update(): void {}

  private createHeader(context: AppContext): void {
    const profile = this.profile;
    if (!profile) return;
    const equipment = calculateEquipmentSummary(profile, context.gameData);
    const power = calculateTotalPower(context.gameData.player, profile, context.gameData);

    const metrics = [
      createMetric('전투력', power.toLocaleString(), 148),
      createMetric('골드', profile.gold.toLocaleString(), 148),
      createMetric('장비 공격', `+${equipment.attack}`, 148),
    ];
    metrics.forEach((metric, index) => metric.position.set(30 + index * 161, 166));
    this.view.addChild(...metrics);
  }

  private createFilters(context: AppContext, page: number): void {
    const filters: Array<{ readonly label: string; readonly slot?: EquipmentSlot }> = [
      { label: '전체' },
      { label: '무기', slot: 'weapon' },
      { label: '방어구', slot: 'armor' },
      { label: '장신구', slot: 'accessory' },
    ];

    filters.forEach((entry, index) => {
      const button = new UiButton({
        label: entry.label,
        width: 92,
        height: 42,
        fontSize: 13,
        tone: this.filter === entry.slot ? 'primary' : 'secondary',
        onPress: async () => context.scenes.change(
          () => new InventoryScene(entry.slot, this.sortMode, 0),
        ),
      });
      button.position.set(28 + index * 100, 238);
      this.view.addChild(button);
    });

    const sort = new UiButton({
      label: sortLabel(this.sortMode),
      width: 104,
      height: 42,
      fontSize: 12,
      tone: 'secondary',
      onPress: async () => context.scenes.change(
        () => new InventoryScene(this.filter, nextSort(this.sortMode), page),
      ),
    });
    sort.position.set(408, 238);
    this.view.addChild(sort);
  }

  private createGrid(
    context: AppContext,
    items: readonly InventoryItem[],
    page: number,
    maxPage: number,
  ): void {
    const profile = this.profile;
    if (!profile) return;

    const gridPanel = createSectionPanel(28, 294, 296, 462, 'panel_strong');
    const title = new Text({
      text: `보유 장비  ${profile.inventory.length}`,
      style: new TextStyle({ fill: COLORS.text, fontSize: 14, fontWeight: '700' }),
    });
    title.position.set(46, 310);
    this.view.addChild(gridPanel, title);

    items.forEach((item, index) => {
      const definition = context.gameData.getItem(item.itemId);
      const equipped = isEquipped(profile, item.uid);
      const selected = this.selectedUid ? this.selectedUid === item.uid : index === 0;
      const column = index % GRID_COLUMNS;
      const row = Math.floor(index / GRID_COLUMNS);
      const root = new Container();
      root.position.set(44 + column * 91, 344 + row * 96);
      root.eventMode = 'static';
      root.cursor = 'pointer';
      root.hitArea = {
        contains: (x: number, y: number) => x >= 0 && y >= 0 && x <= SLOT_SIZE && y <= SLOT_SIZE,
      };
      root.on('pointerup', () => {
        void context.scenes.change(
          () => new InventoryScene(this.filter, this.sortMode, page, item.uid),
        );
      });

      const frame = createItemFrame(
        this.equipmentSheet?.textures[`item.${item.itemId}`],
        SLOT_SIZE,
        definition.grade,
        selected,
      );
      const gradeTexture = premiumUiV16Texture(
        this.premiumUiV16Sheet,
        premiumGradeTextureKey(definition.grade),
      );
      const gradeArt = gradeTexture ? new Sprite(gradeTexture) : undefined;
      if (gradeArt) {
        gradeArt.anchor.set(0.5);
        gradeArt.position.set(SLOT_SIZE / 2, SLOT_SIZE / 2);
        gradeArt.width = SLOT_SIZE - 4;
        gradeArt.height = SLOT_SIZE - 4;
        gradeArt.alpha = selected ? 0.42 : 0.24;
      }
      const level = new Text({
        text: `+${item.level}`,
        style: new TextStyle({ fill: COLORS.text, fontSize: 12, fontWeight: '700' }),
      });
      level.anchor.set(1, 1);
      level.position.set(76, 76);
      root.addChild(...(gradeArt ? [gradeArt] : []), frame, level);

      if (equipped) {
        const badge = createBadge('E', 'success');
        badge.scale.set(0.58);
        badge.position.set(3, 3);
        root.addChild(badge);
      } else if (item.locked) {
        const badge = createBadge('LOCK', 'warning');
        badge.scale.set(0.48);
        badge.position.set(2, 3);
        root.addChild(badge);
      }
      this.view.addChild(root);
    });

    if (items.length === 0) {
      const empty = new Text({
        text: '조건에 맞는 장비가 없습니다.',
        style: new TextStyle({ fill: COLORS.muted, fontSize: 15 }),
      });
      empty.anchor.set(0.5);
      empty.position.set(176, 500);
      this.view.addChild(empty);
    }

    const previous = new UiButton({
      label: '‹',
      width: 58,
      height: 38,
      tone: 'secondary',
      fontSize: 20,
      onPress: async () => context.scenes.change(
        () => new InventoryScene(this.filter, this.sortMode, Math.max(0, page - 1)),
      ),
    });
    previous.position.set(50, 704);
    previous.setEnabled(page > 0);

    const pageText = new Text({
      text: `${page + 1} / ${maxPage + 1}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 13, fontWeight: '700' }),
    });
    pageText.anchor.set(0.5);
    pageText.position.set(176, 724);

    const next = new UiButton({
      label: '›',
      width: 58,
      height: 38,
      tone: 'secondary',
      fontSize: 20,
      onPress: async () => context.scenes.change(
        () => new InventoryScene(this.filter, this.sortMode, Math.min(maxPage, page + 1)),
      ),
    });
    next.position.set(244, 704);
    next.setEnabled(page < maxPage);
    this.view.addChild(previous, pageText, next);
  }

  private createDetails(
    context: AppContext,
    selected: InventoryItem | undefined,
    page: number,
  ): void {
    const profile = this.profile;
    if (!profile) return;

    const panel = createSectionPanel(334, 294, 178, 462, 'panel_gold');
    this.view.addChild(panel);

    if (!selected) {
      const text = new Text({
        text: '장비를 선택하세요.',
        style: new TextStyle({ fill: COLORS.muted, fontSize: 15 }),
      });
      text.anchor.set(0.5);
      text.position.set(423, 500);
      this.view.addChild(text);
      return;
    }

    const definition = context.gameData.getItem(selected.itemId);
    const stats = calculateItemStats(definition, selected.level);
    const equipped = isEquipped(profile, selected.uid);
    const cost = upgradeCost(definition, selected.level);

    const gradeBadge = createBadge(gradeLabel(definition.grade), gradeTone(definition.grade));
    gradeBadge.scale.set(0.78);
    gradeBadge.position.set(350, 314);

    const premiumInventoryTexture = premiumHudTexture(this.premiumHudSheet, PREMIUM_HUD_TEXTURE_KEYS.inventory);
    const premiumInventoryArt = premiumInventoryTexture ? new Sprite(premiumInventoryTexture) : undefined;
    if (premiumInventoryArt) {
      premiumInventoryArt.anchor.set(0.5);
      premiumInventoryArt.width = 132;
      premiumInventoryArt.height = 132;
      premiumInventoryArt.position.set(423, 397);
      premiumInventoryArt.alpha = 0.18;
      premiumInventoryArt.tint = definition.grade === 'heroic' ? 0xffd79b : definition.grade === 'rare' ? 0x9eefff : 0xffffff;
    }

    const gradeTexture = premiumUiV16Texture(
      this.premiumUiV16Sheet,
      premiumGradeTextureKey(definition.grade),
    );
    const premiumGradeArt = gradeTexture ? new Sprite(gradeTexture) : undefined;
    if (premiumGradeArt) {
      premiumGradeArt.anchor.set(0.5);
      premiumGradeArt.width = 142;
      premiumGradeArt.height = 142;
      premiumGradeArt.position.set(423, 397);
      premiumGradeArt.alpha = 0.32;
    }

    const slotTextureKey = definition.slot === 'weapon'
      ? PREMIUM_UI_ICON_KEYS.equipmentWeapon
      : definition.slot === 'armor'
        ? PREMIUM_UI_ICON_KEYS.equipmentArmor
        : PREMIUM_UI_ICON_KEYS.equipmentAccessory;
    const slotTexture = premiumUiV16Texture(this.premiumUiV16Sheet, slotTextureKey);
    const premiumSlotArt = slotTexture ? new Sprite(slotTexture) : undefined;
    if (premiumSlotArt) {
      premiumSlotArt.anchor.set(0.5);
      premiumSlotArt.width = 38;
      premiumSlotArt.height = 38;
      premiumSlotArt.position.set(484, 331);
      premiumSlotArt.alpha = 0.88;
    }

    const materialTexture = this.equipmentMaterialSheet?.textures[
      materialFrameKey(definition.slot, definition.grade)
    ];
    const materialBackdrop = materialTexture ? new Sprite(materialTexture) : undefined;
    if (materialBackdrop) {
      materialBackdrop.anchor.set(0.5);
      materialBackdrop.width = 112;
      materialBackdrop.height = 112;
      materialBackdrop.alpha = 0.52;
      materialBackdrop.position.set(423, 397);
    }
    const detailIcon = createItemFrame(
      this.equipmentSheet?.textures[`item.${selected.itemId}`],
      94,
      definition.grade,
      true,
    );
    detailIcon.position.set(376, 350);

    const title = new Text({
      text: definition.name,
      style: new TextStyle({
        fill: gradeColor(definition.grade),
        fontSize: 17,
        fontWeight: '700',
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 145,
      }),
    });
    title.anchor.set(0.5, 0);
    title.position.set(423, 452);

    const statsText = new Text({
      text: [
        `${slotLabel(definition.slot)}  +${selected.level}`,
        `전투력 ${calculateItemPower(definition, selected.level)}`,
        `공격 +${stats.attack}`,
        `방어 +${stats.defense}`,
        `HP +${stats.maxHp}`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.text, fontSize: 13, lineHeight: 20, align: 'center' }),
    });
    statsText.anchor.set(0.5, 0);
    statsText.position.set(423, 502);

    const progress = createProgressBar(
      132,
      selected.level / definition.maxUpgrade,
      definition.grade === 'heroic' ? 'warning' : 'primary',
      8,
    );
    progress.position.set(357, 610);

    const costText = new Text({
      text: selected.level >= definition.maxUpgrade ? 'MAX' : `강화 ${cost.toLocaleString()}G`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 11, fontWeight: '700' }),
    });
    costText.anchor.set(0.5);
    costText.position.set(423, 632);

    const actions = [
      new UiButton({
        label: equipped ? '해제' : '장착',
        width: 70,
        height: 42,
        fontSize: 12,
        tone: equipped ? 'secondary' : 'primary',
        onPress: async () => {
          const updated = equipped
            ? unequipSlot(profile, definition.slot)
            : equipItem(profile, selected.uid, context.gameData);
          await this.saveAndReload(updated, page, selected.uid);
        },
      }),
      new UiButton({
        label: '강화',
        width: 70,
        height: 42,
        fontSize: 12,
        tone: 'secondary',
        onPress: async () => {
          await this.saveAndReload(upgradeItem(profile, selected.uid, context.gameData), page, selected.uid);
        },
      }),
      new UiButton({
        label: selected.locked ? '해제' : '잠금',
        width: 70,
        height: 42,
        fontSize: 12,
        tone: 'secondary',
        onPress: async () => {
          await this.saveAndReload(toggleItemLock(profile, selected.uid), page, selected.uid);
        },
      }),
      new UiButton({
        label: '판매',
        width: 70,
        height: 42,
        fontSize: 12,
        tone: 'danger',
        onPress: async () => {
          await this.saveAndReload(sellItem(profile, selected.uid, context.gameData), page);
        },
      }),
    ];
    actions[0]?.position.set(350, 656);
    actions[1]?.position.set(430, 656);
    actions[1]?.setEnabled(selected.level < definition.maxUpgrade && profile.gold >= cost);
    actions[2]?.position.set(350, 706);
    actions[3]?.position.set(430, 706);
    actions[3]?.setEnabled(!selected.locked && !equipped);

    const divider = createDivider(138);
    divider.position.set(354, 646);
    this.view.addChild(
      gradeBadge,
      ...(premiumInventoryArt ? [premiumInventoryArt] : []),
      ...(premiumGradeArt ? [premiumGradeArt] : []),
      ...(premiumSlotArt ? [premiumSlotArt] : []),
      ...(materialBackdrop ? [materialBackdrop] : []),
      detailIcon,
      title,
      statsText,
      progress,
      costText,
      divider,
      ...actions,
    );
  }

  private createFooter(context: AppContext): void {
    const profile = this.profile;
    if (!profile) return;

    const bulk = new UiButton({
      label: '일반 장비 일괄판매',
      width: 226,
      height: 58,
      tone: 'danger',
      fontSize: 15,
      onPress: async () => {
        const updated = bulkSellCommon(profile, context.gameData);
        await context.playerRepository.save(updated);
        await context.scenes.change(() => new InventoryScene(this.filter, this.sortMode, 0));
      },
    });
    bulk.position.set(30, 842);

    const back = new UiButton({
      label: '거점 복귀',
      width: 226,
      height: 58,
      tone: 'secondary',
      fontSize: 15,
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(284, 842);
    this.view.addChild(bulk, back);
  }

  private resolveSelected(items: readonly InventoryItem[]): InventoryItem | undefined {
    return items.find((item) => item.uid === this.selectedUid) ?? items[0];
  }

  private async saveAndReload(
    profile: PlayerProfile,
    page: number,
    selectedUid?: string,
  ): Promise<void> {
    if (!this.context) return;
    await this.context.playerRepository.save(profile);
    await this.context.scenes.change(
      () => new InventoryScene(this.filter, this.sortMode, page, selectedUid),
    );
  }
}

function nextSort(mode: InventorySortMode): InventorySortMode {
  if (mode === 'power') return 'grade';
  if (mode === 'grade') return 'recent';
  return 'power';
}

function sortLabel(mode: InventorySortMode): string {
  if (mode === 'power') return '전투력순';
  if (mode === 'grade') return '등급순';
  return '최근순';
}

function slotLabel(slot: EquipmentSlot): string {
  if (slot === 'weapon') return '무기';
  if (slot === 'armor') return '방어구';
  return '장신구';
}

function gradeLabel(grade: ItemGrade): string {
  if (grade === 'heroic') return '영웅';
  if (grade === 'rare') return '희귀';
  return '일반';
}

function gradeTone(grade: ItemGrade): 'warning' | 'primary' | 'secondary' {
  if (grade === 'heroic') return 'warning';
  if (grade === 'rare') return 'primary';
  return 'secondary';
}

function gradeColor(grade: ItemGrade): number {
  if (grade === 'heroic') return 0xe1b773;
  if (grade === 'rare') return 0x72e7d3;
  return COLORS.text;
}

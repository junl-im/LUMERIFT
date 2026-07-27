import { Container, Graphics, Sprite, Text, TextStyle, type Spritesheet } from 'pixi.js';
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
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';

const PAGE_SIZE = 5;

export class InventoryScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private profile?: PlayerProfile;
  private equipmentSheet?: Spritesheet;
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

    const sorted = sortInventory(this.profile, context.gameData, this.sortMode, this.filter);
    const maxPage = Math.max(0, Math.ceil(sorted.length / PAGE_SIZE) - 1);
    const safePage = Math.min(this.page, maxPage);
    const items = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
    const selected = this.resolveSelected(items);

    this.view.addChild(createBackground('장비 보관소', '장착·강화·잠금·판매로 전투력을 높이세요.'));
    this.view.addChild(createPanel(20, 175, 500, 635));

    this.createHeader(context);
    this.createFilters(context, safePage);
    this.createItemList(context, items, safePage, maxPage);
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

    const summary = new Text({
      text: `전투력 ${power}  ·  Gold ${profile.gold.toLocaleString()}\n장비 보너스  공격 +${equipment.attack}  방어 +${equipment.defense}  HP +${equipment.maxHp}`,
      style: new TextStyle({ fill: COLORS.text, fontSize: 17, lineHeight: 27 }),
    });
    summary.position.set(35, 190);
    this.view.addChild(summary);
  }

  private createFilters(context: AppContext, page: number): void {
    const filters: Array<{ label: string; slot?: EquipmentSlot }> = [
      { label: '전체' },
      { label: '무기', slot: 'weapon' },
      { label: '방어구', slot: 'armor' },
      { label: '장신구', slot: 'accessory' },
    ];

    filters.forEach((entry, index) => {
      const button = new UiButton({
        label: `${this.filter === entry.slot ? '● ' : ''}${entry.label}`,
        width: 112,
        height: 48,
        tone: this.filter === entry.slot ? 'primary' : 'secondary',
        onPress: async () => context.scenes.change(
          () => new InventoryScene(entry.slot, this.sortMode, 0),
        ),
      });
      button.position.set(28 + index * 121, 260);
      this.view.addChild(button);
    });

    const sort = new UiButton({
      label: `정렬: ${sortLabel(this.sortMode)}`,
      width: 200,
      height: 48,
      tone: 'secondary',
      onPress: async () => context.scenes.change(
        () => new InventoryScene(this.filter, nextSort(this.sortMode), page),
      ),
    });
    sort.position.set(28, 318);
    this.view.addChild(sort);
  }

  private createItemList(
    context: AppContext,
    items: readonly InventoryItem[],
    page: number,
    maxPage: number,
  ): void {
    const profile = this.profile;
    if (!profile) return;

    items.forEach((item, index) => {
      const definition = context.gameData.getItem(item.itemId);
      const equipped = isEquipped(profile, item.uid);
      const prefix = equipped ? 'E ' : item.locked ? 'L ' : '';
      const button = new UiButton({
        label: `${prefix}${gradeMark(definition.grade)} ${definition.name} +${item.level}`,
        width: 300,
        height: 56,
        tone: this.selectedUid === item.uid ? 'primary' : 'secondary',
        onPress: async () => context.scenes.change(
          () => new InventoryScene(this.filter, this.sortMode, page, item.uid),
        ),
      });
      button.position.set(28, 380 + index * 64);
      this.view.addChild(button);
      const icon = this.createItemIcon(item.itemId, 38);
      if (icon) {
        icon.position.set(55, 408 + index * 64);
        this.view.addChild(icon);
      }
    });

    if (items.length === 0) {
      const empty = new Text({
        text: '해당 조건의 장비가 없습니다.',
        style: new TextStyle({ fill: COLORS.muted, fontSize: 17 }),
      });
      empty.position.set(45, 405);
      this.view.addChild(empty);
    }

    const previous = new UiButton({
      label: '이전',
      width: 92,
      height: 46,
      tone: 'secondary',
      onPress: async () => context.scenes.change(
        () => new InventoryScene(this.filter, this.sortMode, Math.max(0, page - 1)),
      ),
    });
    previous.position.set(28, 710);
    previous.setEnabled(page > 0);

    const pageText = new Text({
      text: `${page + 1} / ${maxPage + 1}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 16 }),
    });
    pageText.anchor.set(0.5);
    pageText.position.set(178, 733);

    const next = new UiButton({
      label: '다음',
      width: 92,
      height: 46,
      tone: 'secondary',
      onPress: async () => context.scenes.change(
        () => new InventoryScene(this.filter, this.sortMode, Math.min(maxPage, page + 1)),
      ),
    });
    next.position.set(234, 710);
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

    const panel = new Graphics()
      .roundRect(340, 318, 165, 438, 18)
      .fill({ color: COLORS.panelStrong, alpha: 0.96 })
      .stroke({ color: 0xffffff, alpha: 0.08, width: 2 });
    this.view.addChild(panel);

    if (!selected) {
      const text = new Text({
        text: '장비를\n선택하세요.',
        style: new TextStyle({ fill: COLORS.muted, fontSize: 19, align: 'center', lineHeight: 30 }),
      });
      text.anchor.set(0.5);
      text.position.set(422, 430);
      this.view.addChild(text);
      return;
    }

    const definition = context.gameData.getItem(selected.itemId);
    const stats = calculateItemStats(definition, selected.level);
    const equipped = isEquipped(profile, selected.uid);
    const cost = upgradeCost(definition, selected.level);
    const title = new Text({
      text: `${gradeLabel(definition.grade)}\n${definition.name}\n+${selected.level}`,
      style: new TextStyle({
        fill: gradeColor(definition.grade),
        fontSize: 17,
        fontWeight: '700',
        align: 'center',
        lineHeight: 24,
        wordWrap: true,
        wordWrapWidth: 145,
      }),
    });
    title.anchor.set(0.5, 0);
    title.position.set(422, 330);

    const statsText = new Text({
      text: [
        `${slotLabel(definition.slot)}`,
        `전투력 ${calculateItemPower(definition, selected.level)}`,
        `공격 +${stats.attack}`,
        `방어 +${stats.defense}`,
        `HP +${stats.maxHp}`,
        selected.level >= definition.maxUpgrade ? '최대 강화' : `강화 ${cost}G`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.text, fontSize: 13, align: 'center', lineHeight: 18 }),
    });
    statsText.anchor.set(0.5, 0);
    statsText.position.set(422, 432);

    const detailIcon = this.createItemIcon(selected.itemId, 58);
    if (detailIcon) detailIcon.position.set(422, 405);

    const equip = new UiButton({
      label: equipped ? '장착 해제' : '장착',
      width: 137,
      height: 45,
      tone: equipped ? 'secondary' : 'primary',
      onPress: async () => {
        const updated = equipped
          ? unequipSlot(profile, definition.slot)
          : equipItem(profile, selected.uid, context.gameData);
        await this.saveAndReload(updated, page, selected.uid);
      },
    });
    equip.position.set(354, 560);

    const upgrade = new UiButton({
      label: selected.level >= definition.maxUpgrade ? '강화 완료' : '강화',
      width: 137,
      height: 45,
      tone: 'secondary',
      onPress: async () => {
        await this.saveAndReload(upgradeItem(profile, selected.uid, context.gameData), page, selected.uid);
      },
    });
    upgrade.position.set(354, 612);
    upgrade.setEnabled(selected.level < definition.maxUpgrade && profile.gold >= cost);

    const lock = new UiButton({
      label: selected.locked ? '잠금 해제' : '잠금',
      width: 137,
      height: 45,
      tone: 'secondary',
      onPress: async () => {
        await this.saveAndReload(toggleItemLock(profile, selected.uid), page, selected.uid);
      },
    });
    lock.position.set(354, 664);

    const sell = new UiButton({
      label: '판매',
      width: 137,
      height: 45,
      tone: 'danger',
      onPress: async () => {
        await this.saveAndReload(sellItem(profile, selected.uid, context.gameData), page);
      },
    });
    sell.position.set(354, 716);
    sell.setEnabled(!selected.locked && !equipped);

    this.view.addChild(title);
    if (detailIcon) this.view.addChild(detailIcon);
    this.view.addChild(statsText, equip, upgrade, lock, sell);
  }

  private createFooter(context: AppContext): void {
    const profile = this.profile;
    if (!profile) return;

    const bulk = new UiButton({
      label: '일반 일괄판매',
      width: 205,
      height: 58,
      tone: 'danger',
      onPress: async () => {
        const updated = bulkSellCommon(profile, context.gameData);
        await context.playerRepository.save(updated);
        await context.scenes.change(() => new InventoryScene(this.filter, this.sortMode, 0));
      },
    });
    bulk.position.set(45, 835);

    const back = new UiButton({
      label: '거점 복귀',
      width: 205,
      height: 58,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(290, 835);

    this.view.addChild(bulk, back);
  }


  private createItemIcon(itemId: string, size: number): Sprite | undefined {
    const texture = this.equipmentSheet?.textures[`item.${itemId}`];
    if (!texture) return undefined;
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.width = size;
    sprite.height = size;
    return sprite;
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
  if (mode === 'power') return '전투력';
  if (mode === 'grade') return '등급';
  return '최근';
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

function gradeMark(grade: ItemGrade): string {
  if (grade === 'heroic') return '◆';
  if (grade === 'rare') return '◇';
  return '·';
}

function gradeColor(grade: ItemGrade): number {
  if (grade === 'heroic') return 0xd5a7ff;
  if (grade === 'rare') return 0x55e6bf;
  return COLORS.text;
}

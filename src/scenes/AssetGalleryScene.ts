import { Container, Graphics, Sprite, Text, TextStyle, type Spritesheet, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { ASSET_MEGA_GALLERY_BUNDLE, ASSET_PATHS } from '../core/assets/AssetCatalog';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';

interface GalleryCategory {
  readonly label: string;
  readonly atlasPath: string;
  readonly prefix: string;
}

const CATEGORIES: readonly GalleryCategory[] = [
  { label: '아이템 160종', atlasPath: ASSET_PATHS.megaItemsAtlas, prefix: 'mega_item.' },
  { label: '스킬 80종', atlasPath: ASSET_PATHS.skillIconsAtlas, prefix: 'skill.' },
  { label: '상태효과 48종', atlasPath: ASSET_PATHS.statusIconsAtlas, prefix: 'status.' },
  { label: 'UI 아이콘 96종', atlasPath: ASSET_PATHS.uiIconsV2Atlas, prefix: 'ui.icon.' },
  { label: '몬스터 도감 48종', atlasPath: ASSET_PATHS.bestiaryAtlas, prefix: 'bestiary.' },
  { label: 'NPC 초상 32종', atlasPath: ASSET_PATHS.npcPortraitsAtlas, prefix: 'npc.portrait.' },
  { label: '환경 오브젝트 120종', atlasPath: ASSET_PATHS.environmentPropsAtlas, prefix: 'prop.' },
  { label: 'VFX 24세트', atlasPath: ASSET_PATHS.effectsMegaAtlas, prefix: 'mega_effect.' },
  { label: '문장·배지 64종', atlasPath: ASSET_PATHS.emblemsAtlas, prefix: 'emblem.' },
  { label: '튜토리얼 40종', atlasPath: ASSET_PATHS.tutorialGlyphsAtlas, prefix: 'tutorial.glyph.' },
];

const PAGE_SIZE = 16;

export class AssetGalleryScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private content = new Container();
  private categoryIndex = 0;
  private page = 0;
  private bundleLoaded = false;
  private categoryText?: Text;
  private pageText?: Text;

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    this.view.addChild(createBackground('에셋 보관소', 'v0.8.0 제작 기준 메가팩을 런타임에서 직접 검수합니다.'));
    this.view.addChild(createPanel(24, 188, 492, 620));

    const status = new Text({
      text: '에셋 번들 로딩 중...',
      style: new TextStyle({ fill: COLORS.accent, fontSize: 17, align: 'center' }),
    });
    status.anchor.set(0.5);
    status.position.set(DESIGN_WIDTH / 2, 470);
    this.view.addChild(status);

    await context.assets.loadBundle(ASSET_MEGA_GALLERY_BUNDLE, (progress) => {
      status.text = `에셋 번들 로딩 ${Math.round(progress * 100)}%`;
    });
    this.bundleLoaded = true;
    status.destroy();

    this.categoryText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.text, fontSize: 22, fontWeight: '700' }),
    });
    this.categoryText.anchor.set(0.5);
    this.categoryText.position.set(DESIGN_WIDTH / 2, 224);

    this.pageText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 14 }),
    });
    this.pageText.anchor.set(0.5);
    this.pageText.position.set(DESIGN_WIDTH / 2, 764);

    this.content.position.set(46, 270);
    this.view.addChild(this.categoryText, this.content, this.pageText);

    const previousCategory = new UiButton({
      label: '이전 분류', width: 150, height: 46, fontSize: 17, tone: 'secondary',
      onPress: () => this.changeCategory(-1),
    });
    previousCategory.position.set(30, 824);
    const nextCategory = new UiButton({
      label: '다음 분류', width: 150, height: 46, fontSize: 17, tone: 'secondary',
      onPress: () => this.changeCategory(1),
    });
    nextCategory.position.set(360, 824);
    const previousPage = new UiButton({
      label: '◀ 페이지', width: 150, height: 46, fontSize: 17, tone: 'secondary',
      onPress: () => this.changePage(-1),
    });
    previousPage.position.set(195, 824);
    const nextPage = new UiButton({
      label: '페이지 ▶', width: 150, height: 46, fontSize: 17, tone: 'secondary',
      onPress: () => this.changePage(1),
    });
    nextPage.position.set(195, 878);
    const back = new UiButton({
      label: '로비로 돌아가기', width: 315, height: 48, fontSize: 18,
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(30, 878);

    this.view.addChild(previousCategory, nextCategory, previousPage, nextPage, back);
    this.renderPage();
  }

  public async exit(): Promise<void> {
    if (this.bundleLoaded) {
      await this.context?.assets.releaseBundle(ASSET_MEGA_GALLERY_BUNDLE.id);
      this.bundleLoaded = false;
    }
  }

  public update(): void {}

  private changeCategory(direction: number): void {
    this.categoryIndex = (this.categoryIndex + direction + CATEGORIES.length) % CATEGORIES.length;
    this.page = 0;
    this.renderPage();
  }

  private changePage(direction: number): void {
    const textures = this.currentTextures();
    const pages = Math.max(1, Math.ceil(textures.length / PAGE_SIZE));
    this.page = (this.page + direction + pages) % pages;
    this.renderPage();
  }

  private currentTextures(): readonly [string, Texture][] {
    const category = CATEGORIES[this.categoryIndex];
    if (!category || !this.context) return [];
    const sheet = this.context.assets.get<Spritesheet>(category.atlasPath);
    return Object.entries(sheet?.textures ?? {})
      .filter(([name]) => name.startsWith(category.prefix))
      .sort(([a], [b]) => a.localeCompare(b));
  }

  private renderPage(): void {
    const removed = this.content.removeChildren() as Container[];
    for (const child of removed) child.destroy({ children: true });
    const category = CATEGORIES[this.categoryIndex];
    const textures = this.currentTextures();
    const pages = Math.max(1, Math.ceil(textures.length / PAGE_SIZE));
    if (this.page >= pages) this.page = pages - 1;
    this.categoryText!.text = category?.label ?? '에셋';
    this.pageText!.text = `${this.page + 1} / ${pages} · 총 ${textures.length} 프레임`;

    const start = this.page * PAGE_SIZE;
    for (const [slot, [name, texture]] of textures.slice(start, start + PAGE_SIZE).entries()) {
      const col = slot % 4;
      const row = Math.floor(slot / 4);
      const cell = new Container();
      cell.position.set(col * 112, row * 116);
      const plate = new Graphics()
        .roundRect(0, 0, 98, 104, 14)
        .fill({ color: COLORS.panelStrong, alpha: 0.92 })
        .stroke({ color: COLORS.primary, alpha: 0.28, width: 2 });
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      const scale = Math.min(1, 72 / Math.max(texture.width, texture.height));
      sprite.scale.set(scale);
      sprite.position.set(49, 44);
      const label = new Text({
        text: name.split('.').slice(-2).join('.'),
        style: new TextStyle({ fill: COLORS.muted, fontSize: 10, align: 'center' }),
      });
      label.anchor.set(0.5);
      label.position.set(49, 91);
      cell.addChild(plate, sprite, label);
      this.content.addChild(cell);
    }
  }
}

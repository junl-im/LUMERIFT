import { Container, Graphics, Sprite, Text, TextStyle, type Spritesheet, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { QUALITY_GALLERY_CATEGORIES, type QualityGalleryCategoryDefinition } from '../core/assets/AssetCatalog';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createComicTag, createFeatureMarquee } from '../ui/InterfaceChrome';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';

export class AssetGalleryScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private readonly content = new Container();
  private categoryIndex = 0;
  private page = 0;
  private activeBundleId?: string;
  private categoryText?: Text;
  private pageText?: Text;
  private statusText?: Text;
  private loadingToken = 0;

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    this.view.addChild(createBackground('아트 제작 보관소', 'v1.11.10 기준 실사용 아트 라인과 보관 원본의 품질 결을 한 곳에서 점검합니다.'));
    this.view.addChild(createPanel(24, 176, 492, 636));

    this.categoryText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.text, fontSize: 21, fontWeight: '700' }),
    });
    this.categoryText.anchor.set(0.5);
    this.categoryText.position.set(DESIGN_WIDTH / 2, 214);

    const qualityNote = new Text({
      text: '앞 4개 분류: production-line live art · 이후: legacy/runtime archive',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, align: 'center' }),
    });
    qualityNote.anchor.set(0.5);
    qualityNote.position.set(DESIGN_WIDTH / 2, 243);

    const productionTag = createComicTag('production-line', COLORS.primary);
    productionTag.position.set(38, 190);
    productionTag.scale.set(0.82);
    const marquee = createFeatureMarquee('아트 룩·에셋 라인업', '실사용 번들과 아카이브를 분리 표시해 모바일 제작용 마스터 흐름을 쉽게 검수합니다.', 228);
    marquee.position.set(278, 186);
    marquee.scale.set(0.9);

    this.statusText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.accent, fontSize: 15, align: 'center' }),
    });
    this.statusText.anchor.set(0.5);
    this.statusText.position.set(DESIGN_WIDTH / 2, 480);

    this.pageText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 14 }),
    });
    this.pageText.anchor.set(0.5);
    this.pageText.position.set(DESIGN_WIDTH / 2, 772);

    this.content.position.set(46, 282);
    this.view.addChild(this.categoryText, qualityNote, productionTag, marquee, this.content, this.statusText, this.pageText);

    const previousCategory = new UiButton({ label: '이전 분류', width: 150, height: 46, fontSize: 17, tone: 'secondary', onPress: async () => this.changeCategory(-1) });
    previousCategory.position.set(30, 824);

    const nextCategory = new UiButton({ label: '다음 분류', width: 150, height: 46, fontSize: 17, tone: 'secondary', onPress: async () => this.changeCategory(1) });
    nextCategory.position.set(360, 824);

    const previousPage = new UiButton({ label: '◀ 페이지', width: 150, height: 46, fontSize: 17, tone: 'secondary', onPress: () => this.changePage(-1) });
    previousPage.position.set(195, 824);

    const nextPage = new UiButton({ label: '페이지 ▶', width: 150, height: 46, fontSize: 17, tone: 'secondary', onPress: () => this.changePage(1) });
    nextPage.position.set(195, 878);

    const back = new UiButton({ label: '로비로 돌아가기', width: 315, height: 48, fontSize: 18, onPress: async () => context.scenes.change(() => new LobbyScene()) });
    back.position.set(30, 878);

    this.view.addChild(previousCategory, nextCategory, previousPage, nextPage, back);
    await this.loadCurrentCategory();
  }

  public async exit(): Promise<void> {
    this.loadingToken += 1;
    if (this.activeBundleId) {
      await this.context?.assets.releaseBundle(this.activeBundleId);
      this.activeBundleId = undefined;
    }
  }

  public update(): void {}

  private currentCategory(): QualityGalleryCategoryDefinition | undefined {
    return QUALITY_GALLERY_CATEGORIES[this.categoryIndex];
  }

  private async changeCategory(direction: number): Promise<void> {
    this.categoryIndex = (this.categoryIndex + direction + QUALITY_GALLERY_CATEGORIES.length) % QUALITY_GALLERY_CATEGORIES.length;
    this.page = 0;
    await this.loadCurrentCategory();
  }

  private changePage(direction: number): void {
    const textures = this.currentTextures();
    const pages = Math.max(1, Math.ceil(textures.length / this.pageSize()));
    this.page = (this.page + direction + pages) % pages;
    this.renderPage();
  }

  private async loadCurrentCategory(): Promise<void> {
    const category = this.currentCategory();
    const context = this.context;
    if (!category || !context) return;

    const token = ++this.loadingToken;
    this.clearContent();
    this.categoryText!.text = category.label;
    this.pageText!.text = '';
    this.statusText!.text = '분류 에셋 로딩 중...';

    if (this.activeBundleId) {
      await context.assets.releaseBundle(this.activeBundleId);
      this.activeBundleId = undefined;
    }

    await context.assets.loadBundle(category.bundle, (progress) => {
      if (token === this.loadingToken) this.statusText!.text = `분류 에셋 로딩 ${Math.round(progress * 100)}%`;
    });

    if (token !== this.loadingToken) {
      await context.assets.releaseBundle(category.bundle.id);
      return;
    }

    this.activeBundleId = category.bundle.id;
    this.statusText!.text = '';
    this.renderPage();
  }

  private currentTextures(): readonly (readonly [string, Texture])[] {
    const category = this.currentCategory();
    if (!category || !this.context) return [];

    if (category.kind === 'image') {
      return category.imagePaths
        .map((path) => [this.displayName(path), this.context?.assets.get<Texture>(path)] as const)
        .filter((entry): entry is readonly [string, Texture] => entry[1] !== undefined);
    }

    const entries: [string, Texture][] = [];
    for (const atlasPath of category.atlasPaths) {
      const sheet = this.context.assets.get<Spritesheet>(atlasPath);
      for (const [name, texture] of Object.entries(sheet?.textures ?? {})) {
        if (!category.prefix || name.startsWith(category.prefix)) entries.push([name, texture]);
      }
    }
    return entries.sort(([a], [b]) => a.localeCompare(b));
  }

  private pageSize(): number {
    return this.currentCategory()?.kind === 'image' ? 4 : 16;
  }

  private renderPage(): void {
    this.clearContent();
    const category = this.currentCategory();
    const textures = this.currentTextures();
    const pageSize = this.pageSize();
    const pages = Math.max(1, Math.ceil(textures.length / pageSize));
    if (this.page >= pages) this.page = pages - 1;
    this.categoryText!.text = category?.label ?? '에셋';
    this.pageText!.text = `${this.page + 1} / ${pages} · 총 ${textures.length}개 · 번들 ${(category?.bundle.estimatedBytes ?? 0) / 1024 / 1024 < 0.1 ? '<0.1' : ((category?.bundle.estimatedBytes ?? 0) / 1024 / 1024).toFixed(1)}MiB`;

    const start = this.page * pageSize;
    const visible = textures.slice(start, start + pageSize);
    if (category?.kind === 'image') this.renderImagePage(visible);
    else this.renderAtlasPage(visible);
  }

  private renderAtlasPage(textures: readonly (readonly [string, Texture])[]): void {
    for (const [slot, [name, texture]] of textures.entries()) {
      const col = slot % 4;
      const row = Math.floor(slot / 4);
      const cell = new Container();
      cell.position.set(col * 112, row * 116);
      const plate = new Graphics().roundRect(0, 0, 98, 104, 14).fill({ color: COLORS.panelStrong, alpha: 0.92 }).stroke({ color: COLORS.primary, alpha: 0.28, width: 2 });
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      const scale = Math.min(1, 76 / Math.max(texture.width, texture.height));
      sprite.scale.set(scale);
      sprite.position.set(49, 44);
      const label = new Text({ text: name.split('.').slice(-2).join('.'), style: new TextStyle({ fill: COLORS.muted, fontSize: 10, align: 'center' }) });
      label.anchor.set(0.5);
      label.position.set(49, 91);
      cell.addChild(plate, sprite, label);
      this.content.addChild(cell);
    }
  }

  private renderImagePage(textures: readonly (readonly [string, Texture])[]): void {
    for (const [slot, [name, texture]] of textures.entries()) {
      const col = slot % 2;
      const row = Math.floor(slot / 2);
      const cell = new Container();
      cell.position.set(col * 224, row * 236);
      const plate = new Graphics().roundRect(0, 0, 208, 220, 16).fill({ color: COLORS.panelStrong, alpha: 0.94 }).stroke({ color: COLORS.primary, alpha: 0.32, width: 2 });
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      const scale = Math.min(188 / texture.width, 184 / texture.height);
      sprite.scale.set(scale);
      sprite.position.set(104, 100);
      const label = new Text({ text: name, style: new TextStyle({ fill: COLORS.muted, fontSize: 10, align: 'center' }) });
      label.anchor.set(0.5);
      label.position.set(104, 207);
      cell.addChild(plate, sprite, label);
      this.content.addChild(cell);
    }
  }

  private clearContent(): void {
    const removed = this.content.removeChildren() as Container[];
    for (const child of removed) child.destroy({ children: true });
  }

  private displayName(path: string): string {
    const clean = path.split(/[?#]/, 1)[0] ?? path;
    return clean.split('/').at(-1)?.replace(/\.(webp|png)$/i, '') ?? clean;
  }
}

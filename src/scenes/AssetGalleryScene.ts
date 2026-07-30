import { Container, Graphics, Sprite, Text, TextStyle, type Spritesheet, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { QUALITY_GALLERY_CATEGORIES, type QualityGalleryCategoryDefinition } from '../core/assets/AssetCatalog';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createComicTag, createFeatureMarquee } from '../ui/InterfaceChrome';
import { createBadge } from '../ui/PremiumUi';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';

interface GalleryAuditSummary {
  readonly tag: string;
  readonly tone: 'primary' | 'secondary' | 'warning' | 'success';
  readonly title: string;
  readonly detail: string;
  readonly audit: string;
}

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
  private summaryTitleText?: Text;
  private summaryDetailText?: Text;
  private summaryAuditText?: Text;
  private summaryBadge?: Container;
  private loadingToken = 0;

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    this.view.addChild(createBackground('아트 제작 보관소', 'v1.11.12 기준 실사용 아트·보관 원본·모바일 제작용 마스터 관점을 함께 점검합니다.'));
    this.view.addChild(createPanel(24, 176, 492, 650));
    this.view.addChild(createPanel(36, 260, 468, 88));

    this.categoryText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.text, fontSize: 21, fontWeight: '700' }),
    });
    this.categoryText.anchor.set(0.5);
    this.categoryText.position.set(DESIGN_WIDTH / 2, 214);

    const qualityNote = new Text({
      text: '분류별로 품질 태그 · 감수 포인트 · 묶음 크기를 함께 표시합니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 11, align: 'center', fontWeight: '700' }),
    });
    qualityNote.anchor.set(0.5);
    qualityNote.position.set(DESIGN_WIDTH / 2, 243);

    const productionTag = createComicTag('asset audit', COLORS.primary);
    productionTag.position.set(38, 190);
    productionTag.scale.set(0.82);
    const marquee = createFeatureMarquee('PRODUCTION · ARCHIVE · MOBILE MASTER', '분류 용도와 모바일 제작용 마스터 기준을 한 화면에서 파악하도록 보관소 UX를 재정비했습니다.', 228);
    marquee.position.set(278, 186);
    marquee.scale.set(0.9);

    this.summaryTitleText = new Text({
      text: '',
      style: new TextStyle({ fill: 0xf3dfb0, fontSize: 13, fontWeight: '800', letterSpacing: 0.45 }),
    });
    this.summaryTitleText.position.set(52, 274);
    this.summaryDetailText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.text, fontSize: 10, fontWeight: '700', wordWrap: true, wordWrapWidth: 292, lineHeight: 14 }),
    });
    this.summaryDetailText.position.set(52, 295);
    this.summaryAuditText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 9, fontWeight: '700', wordWrap: true, wordWrapWidth: 408, lineHeight: 12 }),
    });
    this.summaryAuditText.position.set(52, 321);

    this.statusText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.accent, fontSize: 15, align: 'center' }),
    });
    this.statusText.anchor.set(0.5);
    this.statusText.position.set(DESIGN_WIDTH / 2, 508);

    this.pageText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 13, fontWeight: '700' }),
    });
    this.pageText.anchor.set(0.5);
    this.pageText.position.set(DESIGN_WIDTH / 2, 790);

    this.content.position.set(46, 370);
    this.view.addChild(this.categoryText, qualityNote, productionTag, marquee, this.content, this.statusText, this.pageText, this.summaryTitleText, this.summaryDetailText, this.summaryAuditText);

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
    this.updateSummary(category);

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
    this.updateSummary(category);
    this.pageText!.text = `${this.page + 1} / ${pages} · 총 ${textures.length}개 · 번들 ${this.bundleSizeLabel(category)} · mobile master audit ready`;

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
      cell.position.set(col * 112, row * 100);
      const plate = new Graphics().roundRect(0, 0, 98, 90, 14).fill({ color: COLORS.panelStrong, alpha: 0.94 }).stroke({ color: COLORS.primary, alpha: 0.28, width: 2 });
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      const scale = Math.min(1, 56 / Math.max(texture.width, texture.height));
      sprite.scale.set(scale);
      sprite.position.set(49, 34);
      const label = new Text({ text: name.split('.').slice(-2).join('.'), style: new TextStyle({ fill: COLORS.muted, fontSize: 9, align: 'center', wordWrap: true, wordWrapWidth: 84 }) });
      label.anchor.set(0.5);
      label.position.set(49, 73);
      cell.addChild(plate, sprite, label);
      this.content.addChild(cell);
    }
  }

  private renderImagePage(textures: readonly (readonly [string, Texture])[]): void {
    for (const [slot, [name, texture]] of textures.entries()) {
      const col = slot % 2;
      const row = Math.floor(slot / 2);
      const cell = new Container();
      cell.position.set(col * 224, row * 194);
      const plate = new Graphics().roundRect(0, 0, 208, 178, 16).fill({ color: COLORS.panelStrong, alpha: 0.95 }).stroke({ color: COLORS.primary, alpha: 0.32, width: 2 });
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      const scale = Math.min(180 / texture.width, 130 / texture.height);
      sprite.scale.set(scale);
      sprite.position.set(104, 74);
      const label = new Text({ text: name, style: new TextStyle({ fill: COLORS.muted, fontSize: 10, align: 'center', fontWeight: '700' }) });
      label.anchor.set(0.5);
      label.position.set(104, 158);
      cell.addChild(plate, sprite, label);
      this.content.addChild(cell);
    }
  }

  private updateSummary(category: QualityGalleryCategoryDefinition | undefined): void {
    if (!category || !this.summaryTitleText || !this.summaryDetailText || !this.summaryAuditText) return;
    const summary = this.summaryFor(category);
    this.summaryTitleText.text = summary.title;
    this.summaryDetailText.text = summary.detail;
    this.summaryAuditText.text = summary.audit;
    if (this.summaryBadge) {
      this.view.removeChild(this.summaryBadge);
      this.summaryBadge.destroy({ children: true });
    }
    this.summaryBadge = createBadge(summary.tag, summary.tone);
    this.summaryBadge.position.set(364, 274);
    this.view.addChild(this.summaryBadge);
  }

  private summaryFor(category: QualityGalleryCategoryDefinition): GalleryAuditSummary {
    const bundleLabel = this.bundleSizeLabel(category);
    switch (category.id) {
      case 'live-scenes':
        return {
          tag: 'production-line',
          tone: 'success',
          title: '실사용 배경/초상 감수',
          detail: `런타임 화면의 첫인상을 담당하는 메인 비주얼입니다. 현재 번들은 ${bundleLabel} 규모로 모바일 첫 체감 품질을 좌우합니다.`,
          audit: '감수 포인트 · 화면 비율 유지 · 글자 가독성 방해 여부 · 분위기 통일 · 배경/초상 톤 일치',
        };
      case 'live-player':
        return {
          tag: 'combat motion',
          tone: 'primary',
          title: '실사용 플레이어 모션 점검',
          detail: `전투 런타임에서 직접 쓰는 플레이어 동작입니다. 방향감·실루엣·타격 자세가 읽히는지 확인합니다.`,
          audit: '감수 포인트 · 8방향 판독성 · 이동/공격 방향감 · 실루엣 충돌 최소화',
        };
      case 'owned-player-preview':
        return {
          tag: 'mobile master',
          tone: 'warning',
          title: '전용 모션 미리보기',
          detail: `LUMERIFT 전용 제작 후보 라인입니다. 실사용 대체 후보이므로 제작용 마스터 기준에서 해상도와 프레임 키 계약을 함께 봅니다.`,
          audit: '감수 포인트 · 키 이름 계약 유지 · 교체 가능성 · 마스터 보관 가치 · 용량 예산 적합성',
        };
      case 'owned-player-painted':
        return {
          tag: 'paint candidate',
          tone: 'warning',
          title: '도색 후보 아트 감수',
          detail: `전용 도색 후보군입니다. 최종 채택 전까지는 감수/비교용 성격이 강하며 제작용 마스터 관리 규칙을 우선합니다.`,
          audit: '감수 포인트 · 색 일관성 · UI 위 가독성 · 채색 명암 · 런타임 대체 비용',
        };
      case 'live-monsters':
        return {
          tag: 'runtime archive',
          tone: 'secondary',
          title: '실사용 몬스터 라인업',
          detail: `전투 체감과 스테이지 개성을 만드는 몬스터 런타임 자산입니다. 번들 규모는 ${bundleLabel}이며 lazy loading 기준으로 관리합니다.`,
          audit: '감수 포인트 · 피격 판독성 · 크기 대비 선명도 · 패턴별 개성 · 과도한 프레임 낭비 여부',
        };
      case 'live-ui':
        return {
          tag: 'ui skin',
          tone: 'primary',
          title: '실사용 UI 스킨 기준선',
          detail: '버튼, 슬롯, 패널 등 공통 컴포넌트에 쓰이는 스킨입니다. 전투/로비/결과 화면의 톤 통일을 확인합니다.',
          audit: '감수 포인트 · 대비 · 터치 영역 강조 · 상태 구분색 · 전체 시각 언어 일관성',
        };
      case 'operations-ui':
        return {
          tag: 'ops icon pack',
          tone: 'secondary',
          title: '운영 UI 보상 아이콘',
          detail: '우편, 보상, 출석, 운영 화면에서 사용하는 운영형 아이콘 묶음입니다. 작은 크기에서도 기능이 읽히는지가 핵심입니다.',
          audit: '감수 포인트 · 소형 아이콘 식별성 · 배지/카운트 중첩 · 리워드 의미 전달',
        };
      default:
        return {
          tag: 'asset audit',
          tone: 'secondary',
          title: category.label,
          detail: `선택된 분류 번들 크기 ${bundleLabel}. 모바일 제작용 마스터와 런타임 사용성을 함께 점검합니다.`,
          audit: '감수 포인트 · 목적 적합성 · 용량 예산 · 런타임 적용성',
        };
    }
  }

  private bundleSizeLabel(category: QualityGalleryCategoryDefinition | undefined): string {
    if (!category) return '0MiB';
    const mib = (category.bundle.estimatedBytes ?? 0) / 1024 / 1024;
    return mib < 0.1 ? '<0.1MiB' : `${mib.toFixed(1)}MiB`;
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

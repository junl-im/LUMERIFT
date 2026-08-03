import { Container, Graphics, NineSliceSprite, type Spritesheet, type Texture } from 'pixi.js';
import { COLORS } from '../app/constants';
import type { AssetManager } from '../core/assets/AssetManager';
import { ASSET_PATHS, CORE_UI_BUNDLE } from '../core/assets/AssetCatalog';
import { createPremiumFrameAccents } from './PremiumFrameV3';

let sheet: Spritesheet | undefined;
let iconSheet: Spritesheet | undefined;
let sceneBackground: Texture | undefined;
let titleBackground: Texture | undefined;

export async function initializeUiSkin(assets: AssetManager): Promise<void> {
  await assets.loadBundle(CORE_UI_BUNDLE);
  sheet = assets.get<Spritesheet>(ASSET_PATHS.uiAtlas);
  iconSheet = assets.get<Spritesheet>(ASSET_PATHS.uiIcons);
  sceneBackground = assets.get<Texture>(ASSET_PATHS.lobbyBackground);
  titleBackground = assets.get<Texture>(ASSET_PATHS.titleBackground);
}

export function getUiTexture(name: string): Texture | undefined {
  return sheet?.textures[name];
}

export function getUiIconTexture(name: string): Texture | undefined {
  return iconSheet?.textures[name];
}

export function getSceneBackgroundTexture(): Texture | undefined {
  return sceneBackground;
}

export function getTitleBackgroundTexture(): Texture | undefined {
  return titleBackground;
}

export function createRasterPanel(
  x: number,
  y: number,
  width: number,
  height: number,
  textureName = 'panel',
): Container {
  const root = new Container();
  const texture = getUiTexture(textureName);
  if (!texture) {
    root.addChild(new Graphics()
      .roundRect(x, y, width, height, 22)
      .fill({ color: COLORS.panel, alpha: 0.96 })
      .stroke({ color: COLORS.warning, alpha: 0.42, width: 2 }));
    addPanelDepth(root, x, y, width, height, textureName);
    addPanelComicAccent(root, x, y, width, height, textureName);
    root.addChild(createPremiumFrameAccents(x, y, width, height, textureName === 'resource_chip' ? 'compact' : 'panel'));
    return root;
  }

  const panel = new NineSliceSprite({
    texture,
    leftWidth: 42,
    topHeight: 42,
    rightWidth: 42,
    bottomHeight: 42,
  });
  panel.position.set(x, y);
  panel.width = width;
  panel.height = height;
  root.addChild(panel);
  addPanelDepth(root, x, y, width, height, textureName);
  addPanelComicAccent(root, x, y, width, height, textureName);
  root.addChild(createPremiumFrameAccents(x, y, width, height, textureName === 'resource_chip' ? 'compact' : 'panel'));
  return root;
}

function addPanelComicAccent(
  root: Container,
  x: number,
  y: number,
  width: number,
  height: number,
  textureName: string,
): void {
  if (width < 70 || height < 26) return;
  const compact = textureName === 'resource_chip' || height < 52;
  const shadow = new Graphics()
    .roundRect(x + 3, y + 5, width - 6, Math.max(10, height - 8), compact ? 10 : 16)
    .fill({ color: COLORS.dark, alpha: compact ? 0.1 : 0.14 });
  root.addChildAt(shadow, 0);

  const sticker = new Graphics();
  if (!compact) {
    sticker
      .roundRect(x + 10, y + 10, Math.min(76, width * 0.24), 14, 7)
      .fill({ color: 0xffffff, alpha: 0.06 })
      .moveTo(x + width - 34, y + 9)
      .lineTo(x + width - 20, y + 9)
      .lineTo(x + width - 16, y + 13)
      .lineTo(x + width - 16, y + 23)
      .stroke({ color: COLORS.warning, alpha: 0.28, width: 1.5 });
  } else {
    sticker
      .circle(x + width - 11, y + 11, 2.5)
      .fill({ color: COLORS.primaryBright, alpha: 0.58 });
  }

  if (!compact && width >= 180 && height >= 76) {
    const railWidth = Math.min(118, width * 0.34);
    sticker
      .moveTo(x + 14, y + height - 16)
      .lineTo(x + 14 + railWidth, y + height - 16)
      .stroke({ color: COLORS.primaryBright, alpha: 0.2, width: 2 })
      .roundRect(x + width - 54, y + height - 20, 38, 7, 4)
      .fill({ color: COLORS.warning, alpha: 0.24 })
      .moveTo(x + width - 26, y + 18)
      .lineTo(x + width - 10, y + 18)
      .lineTo(x + width - 10, y + 34)
      .stroke({ color: 0xffffff, alpha: 0.16, width: 1.2 });
  }
  root.addChild(sticker);
}

function addPanelDepth(
  root: Container,
  x: number,
  y: number,
  width: number,
  height: number,
  textureName: string,
): void {
  if (width < 76 || height < 34) return;
  const compact = textureName === 'resource_chip' || height < 52;
  const inset = compact ? 8 : 12;
  const highlightAlpha = compact ? 0.14 : 0.22;
  const accents = new Graphics()
    .moveTo(x + inset, y + 3)
    .lineTo(x + width - inset, y + 3)
    .stroke({ color: 0xffffff, alpha: highlightAlpha, width: 1 })
    .moveTo(x + inset + 6, y + 7)
    .lineTo(x + width * 0.62, y + 7)
    .stroke({ color: COLORS.primaryBright, alpha: compact ? 0.12 : 0.18, width: 1.5 })
    .moveTo(x + inset, y + height - 3)
    .lineTo(x + width - inset, y + height - 3)
    .stroke({ color: 0x020507, alpha: 0.5, width: 2 });

  if (!compact) {
    const corner = 12;
    accents
      .moveTo(x + 6, y + corner)
      .lineTo(x + 6, y + 6)
      .lineTo(x + corner, y + 6)
      .stroke({ color: COLORS.primaryBright, alpha: 0.42, width: 1.5 })
      .moveTo(x + width - corner, y + height - 6)
      .lineTo(x + width - 6, y + height - 6)
      .lineTo(x + width - 6, y + height - corner)
      .stroke({ color: COLORS.warning, alpha: 0.34, width: 1.5 });
  }
  if (!compact && width >= 160) {
    accents
      .moveTo(x + width * 0.68, y + 8)
      .lineTo(x + width * 0.9, y + 8)
      .lineTo(x + width * 0.86, y + 12)
      .lineTo(x + width * 0.66, y + 12)
      .closePath()
      .fill({ color: COLORS.warning, alpha: 0.1 });
  }
  root.addChild(accents);
}

export function buttonTextureName(tone: 'primary' | 'secondary' | 'danger' | undefined): string {
  if (tone === 'danger') return 'button_danger';
  if (tone === 'secondary') return 'button_secondary';
  return 'button_primary';
}

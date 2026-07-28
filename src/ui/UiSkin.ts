import { Container, Graphics, NineSliceSprite, type Spritesheet, type Texture } from 'pixi.js';
import { COLORS } from '../app/constants';
import type { AssetManager } from '../core/assets/AssetManager';
import { ASSET_PATHS, CORE_UI_BUNDLE } from '../core/assets/AssetCatalog';

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
      .fill({ color: COLORS.panel, alpha: 0.95 })
      .stroke({ color: COLORS.warning, alpha: 0.5, width: 2 }));
    addPanelDepth(root, x, y, width, height, textureName);
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
  return root;
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
  const highlightAlpha = compact ? 0.12 : 0.18;
  const accents = new Graphics()
    .moveTo(x + inset, y + 3)
    .lineTo(x + width - inset, y + 3)
    .stroke({ color: 0xffffff, alpha: highlightAlpha, width: 1 })
    .moveTo(x + inset, y + height - 3)
    .lineTo(x + width - inset, y + height - 3)
    .stroke({ color: 0x020507, alpha: 0.5, width: 2 });

  if (!compact) {
    const corner = 12;
    accents
      .moveTo(x + 6, y + corner)
      .lineTo(x + 6, y + 6)
      .lineTo(x + corner, y + 6)
      .stroke({ color: COLORS.primaryBright, alpha: 0.36, width: 1.5 })
      .moveTo(x + width - corner, y + height - 6)
      .lineTo(x + width - 6, y + height - 6)
      .lineTo(x + width - 6, y + height - corner)
      .stroke({ color: COLORS.warning, alpha: 0.28, width: 1.5 });
  }
  root.addChild(accents);
}

export function buttonTextureName(tone: 'primary' | 'secondary' | 'danger' | undefined): string {
  if (tone === 'danger') return 'button_danger';
  if (tone === 'secondary') return 'button_secondary';
  return 'button_primary';
}

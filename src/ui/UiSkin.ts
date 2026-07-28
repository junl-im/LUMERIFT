import { Graphics, NineSliceSprite, type Container, type Spritesheet, type Texture } from 'pixi.js';
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
  const texture = getUiTexture(textureName);
  if (!texture) {
    return new Graphics()
      .roundRect(x, y, width, height, 22)
      .fill({ color: COLORS.panel, alpha: 0.95 })
      .stroke({ color: COLORS.warning, alpha: 0.5, width: 2 });
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
  return panel;
}

export function buttonTextureName(tone: 'primary' | 'secondary' | 'danger' | undefined): string {
  if (tone === 'danger') return 'button_danger';
  if (tone === 'secondary') return 'button_secondary';
  return 'button_primary';
}

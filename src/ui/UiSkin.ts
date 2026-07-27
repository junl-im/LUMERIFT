import { Graphics, NineSliceSprite, type Container, type Spritesheet, type Texture } from 'pixi.js';
import { COLORS } from '../app/constants';
import type { AssetManager } from '../core/assets/AssetManager';
import { ASSET_PATHS, CORE_UI_BUNDLE } from '../core/assets/AssetCatalog';

let sheet: Spritesheet | undefined;
let sceneBackground: Texture | undefined;

export async function initializeUiSkin(assets: AssetManager): Promise<void> {
  await assets.loadBundle(CORE_UI_BUNDLE);
  sheet = assets.get<Spritesheet>(ASSET_PATHS.uiAtlas);
  sceneBackground = assets.get<Texture>(ASSET_PATHS.lobbyBackground);
}

export function getUiTexture(name: string): Texture | undefined {
  return sheet?.textures[name];
}

export function getSceneBackgroundTexture(): Texture | undefined {
  return sceneBackground;
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
      .roundRect(x, y, width, height, 24)
      .fill({ color: COLORS.panel, alpha: 0.94 })
      .stroke({ color: COLORS.warning, alpha: 0.45, width: 2 });
  }

  const panel = new NineSliceSprite({
    texture,
    leftWidth: 34,
    topHeight: 34,
    rightWidth: 34,
    bottomHeight: 34,
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

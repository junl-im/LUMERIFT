export interface AssetBundleDefinition {
  readonly id: string;
  readonly urls: readonly string[];
  readonly estimatedBytes: number;
}

export function assetUrl(path: string): string {
  const normalized = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || './';
  return `${base}${normalized}`;
}

export const ASSET_PATHS = {
  uiAtlas: assetUrl('assets/live/v2/atlases/ui/ui_obsidian_v2.json'),
  playerAtlas: assetUrl('assets/live/v2/atlases/player/player_live_v2.json'),
  monsterAtlas: assetUrl('assets/live/v2/atlases/monsters/monsters_live_v2.json'),
  effectsAtlas: assetUrl('assets/atlases/effects/combat_effects_v1.json'),
  equipmentAtlas: assetUrl('assets/atlases/items/equipment_icons_v1.json'),
  forestMap: assetUrl('assets/live/v2/backgrounds/battle_forest_v2.webp'),
  lobbyBackground: assetUrl('assets/live/v2/backgrounds/lobby_forest_v2.webp'),
  heroPortrait: assetUrl('assets/live/v2/portraits/hero_v2.webp'),
  bossPortrait: assetUrl('assets/live/v2/portraits/boss_v2.webp'),
  uiClick: assetUrl('assets/audio/ui/click_v1.ogg'),
  slash: assetUrl('assets/audio/combat/slash_v1.ogg'),
  hit: assetUrl('assets/audio/combat/hit_v1.ogg'),
  skill: assetUrl('assets/audio/combat/skill_v1.ogg'),
  dodge: assetUrl('assets/audio/combat/dodge_v1.ogg'),
  forestBgm: assetUrl('assets/audio/bgm/forest_rift_loop_v1.opus'),
} as const;

export const CORE_UI_BUNDLE: AssetBundleDefinition = {
  id: 'core-ui',
  urls: [ASSET_PATHS.uiAtlas, ASSET_PATHS.uiClick, ASSET_PATHS.lobbyBackground],
  estimatedBytes: 290_000,
};

export const EQUIPMENT_UI_BUNDLE: AssetBundleDefinition = {
  id: 'equipment-ui',
  urls: [ASSET_PATHS.equipmentAtlas],
  estimatedBytes: 7_000,
};

export const LOBBY_CHARACTER_BUNDLE: AssetBundleDefinition = {
  id: 'lobby-character',
  urls: [ASSET_PATHS.lobbyBackground, ASSET_PATHS.heroPortrait, ASSET_PATHS.uiAtlas, ASSET_PATHS.equipmentAtlas],
  estimatedBytes: 260_000,
};

export const BATTLE_CHAPTER_1_BUNDLE: AssetBundleDefinition = {
  id: 'battle-chapter-1',
  urls: [
    ASSET_PATHS.playerAtlas,
    ASSET_PATHS.monsterAtlas,
    ASSET_PATHS.effectsAtlas,
    ASSET_PATHS.equipmentAtlas,
    ASSET_PATHS.uiAtlas,
    ASSET_PATHS.forestMap,
    ASSET_PATHS.bossPortrait,
  ],
  estimatedBytes: 4_600_000,
};

export type QualityGalleryCategoryKind = 'atlas' | 'image';

export interface QualityGalleryCategoryDefinition {
  readonly id: string;
  readonly label: string;
  readonly kind: QualityGalleryCategoryKind;
  readonly prefix?: string;
  readonly atlasPaths: readonly string[];
  readonly imagePaths: readonly string[];
  readonly bundle: AssetBundleDefinition;
}

export const QUALITY_GALLERY_CATEGORIES: readonly QualityGalleryCategoryDefinition[] = [
  {
    id: 'live-scenes',
    label: '실사용 배경·초상',
    kind: 'image',
    atlasPaths: [],
    imagePaths: [ASSET_PATHS.lobbyBackground, ASSET_PATHS.forestMap, ASSET_PATHS.heroPortrait, ASSET_PATHS.bossPortrait],
    bundle: {
      id: 'live-scenes-gallery',
      urls: [ASSET_PATHS.lobbyBackground, ASSET_PATHS.forestMap, ASSET_PATHS.heroPortrait, ASSET_PATHS.bossPortrait],
      estimatedBytes: 380_000,
    },
  },
  {
    id: 'live-player',
    label: '실사용 플레이어 모션',
    kind: 'atlas',
    prefix: 'knight_',
    atlasPaths: [ASSET_PATHS.playerAtlas],
    imagePaths: [],
    bundle: { id: 'live-player-gallery', urls: [ASSET_PATHS.playerAtlas], estimatedBytes: 560_000 },
  },
  {
    id: 'live-monsters',
    label: '실사용 몬스터 8종',
    kind: 'atlas',
    prefix: 'monster_',
    atlasPaths: [ASSET_PATHS.monsterAtlas],
    imagePaths: [],
    bundle: { id: 'live-monsters-gallery', urls: [ASSET_PATHS.monsterAtlas], estimatedBytes: 2_600_000 },
  },
  {
    id: 'live-ui',
    label: '실사용 UI 스킨',
    kind: 'atlas',
    atlasPaths: [ASSET_PATHS.uiAtlas],
    imagePaths: [],
    bundle: { id: 'live-ui-gallery', urls: [ASSET_PATHS.uiAtlas], estimatedBytes: 30_000 },
  },
] as const;

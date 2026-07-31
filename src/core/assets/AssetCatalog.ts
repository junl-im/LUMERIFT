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
  uiAtlas: assetUrl('assets/live/v5/atlases/ui/ui_luminous_v5.json'),
  uiIcons: assetUrl('assets/live/v5/atlases/ui/ui_icons_v5.json'),
  titleBackground: assetUrl('assets/live/v5/backgrounds/title_screen_v5.webp'),
  playerAtlas: assetUrl('assets/live/v4/atlases/player/player_live_v4.json'),
  ownedPlayerAtlas: assetUrl('assets/live/v6/atlases/player/player_owned_motion_v6.json'),
  ownedPaintedPlayerAtlas: assetUrl('assets/live/v7/atlases/player/player_owned_painted_v7.json'),
  monsterAtlas: assetUrl('assets/live/v4/atlases/monsters/monsters_live_v4.json'),
  effectsAtlas: assetUrl('assets/live/v4/atlases/effects/combat_effects_v4.json'),
  equipmentAtlas: assetUrl('assets/atlases/items/equipment_icons_v1.json'),
  forestMap: assetUrl('assets/live/v4/backgrounds/forest_approach_v4.webp'),
  forestApproachMap: assetUrl('assets/live/v4/backgrounds/forest_approach_v4.webp'),
  forestRuinsMap: assetUrl('assets/live/v4/backgrounds/forest_ruins_v4.webp'),
  forestDepthsMap: assetUrl('assets/live/v4/backgrounds/forest_depths_v4.webp'),
  riftCoreMap: assetUrl('assets/live/v4/backgrounds/rift_core_v4.webp'),
  lobbyBackground: assetUrl('assets/live/v4/backgrounds/lobby_forest_v4.webp'),
  heroPortrait: assetUrl('assets/live/v8/portraits/hero_premium_v8.webp'),
  premiumPlayerOverlayAtlas: assetUrl('assets/live/v8/atlases/player/player_premium_overlay_v8.json'),
  characterFxAtlas: assetUrl('assets/live/v9/atlases/player/player_character_fx_v9.json'),
  equipmentMaterialAtlas: assetUrl('assets/live/v9/atlases/equipment/equipment_material_v9.json'),
  bossPortrait: assetUrl('assets/live/v4/portraits/boss_phase_1_v4.webp'),
  bossPortraitPhase1: assetUrl('assets/live/v4/portraits/boss_phase_1_v4.webp'),
  bossPortraitPhase2: assetUrl('assets/live/v4/portraits/boss_phase_2_v4.webp'),
  bossPortraitPhase3: assetUrl('assets/live/v4/portraits/boss_phase_3_v4.webp'),
  operationsAtlas: assetUrl('assets/live/v3/atlases/operations/operations_ui_v3.json'),
  uiClick: assetUrl('assets/audio/ui/click_v1.ogg'),
  slash: assetUrl('assets/audio/combat/slash_v1.ogg'),
  hit: assetUrl('assets/audio/combat/hit_v1.ogg'),
  skill: assetUrl('assets/audio/combat/skill_v1.ogg'),
  dodge: assetUrl('assets/audio/combat/dodge_v1.ogg'),
  forestBgm: assetUrl('assets/audio/bgm/forest_rift_loop_v1.opus'),
} as const;

export const CORE_UI_BUNDLE: AssetBundleDefinition = {
  id: 'core-ui',
  urls: [ASSET_PATHS.uiAtlas, ASSET_PATHS.uiIcons, ASSET_PATHS.titleBackground, ASSET_PATHS.uiClick, ASSET_PATHS.lobbyBackground],
  estimatedBytes: 520_000,
};

export const EQUIPMENT_UI_BUNDLE: AssetBundleDefinition = {
  id: 'equipment-ui',
  urls: [ASSET_PATHS.equipmentAtlas, ASSET_PATHS.equipmentMaterialAtlas],
  estimatedBytes: 55_000,
};

export const LOBBY_CHARACTER_BUNDLE: AssetBundleDefinition = {
  id: 'lobby-character',
  urls: [ASSET_PATHS.lobbyBackground, ASSET_PATHS.heroPortrait, ASSET_PATHS.uiAtlas, ASSET_PATHS.uiIcons, ASSET_PATHS.equipmentAtlas, ASSET_PATHS.equipmentMaterialAtlas],
  estimatedBytes: 610_000,
};


export const OPERATIONS_UI_BUNDLE: AssetBundleDefinition = {
  id: 'operations-ui-v3',
  urls: [ASSET_PATHS.operationsAtlas, ASSET_PATHS.uiAtlas, ASSET_PATHS.lobbyBackground],
  estimatedBytes: 330_000,
};


export const OWNED_PLAYER_PREVIEW_BUNDLE: AssetBundleDefinition = {
  id: 'player-owned-preview',
  urls: [ASSET_PATHS.ownedPlayerAtlas],
  estimatedBytes: 107_000,
};

export const OWNED_PLAYER_PAINTED_BUNDLE: AssetBundleDefinition = {
  id: 'player-owned-painted',
  urls: [ASSET_PATHS.ownedPaintedPlayerAtlas],
  estimatedBytes: 325_000,
};

export const BATTLE_CHAPTER_1_BUNDLE: AssetBundleDefinition = {
  id: 'battle-chapter-1',
  urls: [
    ASSET_PATHS.playerAtlas,
    ASSET_PATHS.monsterAtlas,
    ASSET_PATHS.effectsAtlas,
    ASSET_PATHS.equipmentAtlas,
    ASSET_PATHS.uiAtlas,
    ASSET_PATHS.forestApproachMap,
    ASSET_PATHS.forestRuinsMap,
    ASSET_PATHS.forestDepthsMap,
    ASSET_PATHS.riftCoreMap,
    ASSET_PATHS.bossPortraitPhase1,
    ASSET_PATHS.bossPortraitPhase2,
    ASSET_PATHS.bossPortraitPhase3,
    ASSET_PATHS.premiumPlayerOverlayAtlas,
    ASSET_PATHS.characterFxAtlas,
  ],
  estimatedBytes: 6_300_000,
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
    imagePaths: [ASSET_PATHS.lobbyBackground, ASSET_PATHS.forestApproachMap, ASSET_PATHS.forestRuinsMap, ASSET_PATHS.forestDepthsMap, ASSET_PATHS.riftCoreMap, ASSET_PATHS.heroPortrait, ASSET_PATHS.bossPortraitPhase1, ASSET_PATHS.bossPortraitPhase2, ASSET_PATHS.bossPortraitPhase3],
    bundle: {
      id: 'live-scenes-gallery',
      urls: [ASSET_PATHS.lobbyBackground, ASSET_PATHS.forestApproachMap, ASSET_PATHS.forestRuinsMap, ASSET_PATHS.forestDepthsMap, ASSET_PATHS.riftCoreMap, ASSET_PATHS.heroPortrait, ASSET_PATHS.bossPortraitPhase1, ASSET_PATHS.bossPortraitPhase2, ASSET_PATHS.bossPortraitPhase3],
      estimatedBytes: 1_100_000,
    },
  },
  {
    id: 'live-player',
    label: '실사용 플레이어 모션',
    kind: 'atlas',
    prefix: 'knight_',
    atlasPaths: [ASSET_PATHS.playerAtlas],
    imagePaths: [],
    bundle: { id: 'live-player-gallery', urls: [ASSET_PATHS.playerAtlas], estimatedBytes: 950_000 },
  },

  {
    id: 'owned-player-preview',
    label: 'LUMERIFT 전용 모션 미리보기',
    kind: 'atlas',
    prefix: 'owned_',
    atlasPaths: [ASSET_PATHS.ownedPlayerAtlas],
    imagePaths: [],
    bundle: { id: 'owned-player-gallery', urls: [ASSET_PATHS.ownedPlayerAtlas], estimatedBytes: 107_000 },
  },
  {
    id: 'owned-player-painted',
    label: 'LUMERIFT 전용 도색 후보',
    kind: 'atlas',
    prefix: 'owned_',
    atlasPaths: [ASSET_PATHS.ownedPaintedPlayerAtlas],
    imagePaths: [],
    bundle: { id: 'owned-player-painted-gallery', urls: [ASSET_PATHS.ownedPaintedPlayerAtlas], estimatedBytes: 325_000 },
  },

  {
    id: 'premium-character-v9',
    label: '프리미엄 캐릭터·장비 재질 v9',
    kind: 'atlas',
    atlasPaths: [ASSET_PATHS.characterFxAtlas, ASSET_PATHS.equipmentMaterialAtlas],
    imagePaths: [],
    bundle: { id: 'premium-character-v9-gallery', urls: [ASSET_PATHS.characterFxAtlas, ASSET_PATHS.equipmentMaterialAtlas], estimatedBytes: 285_000 },
  },
  {
    id: 'live-monsters',
    label: '실사용 몬스터 8종',
    kind: 'atlas',
    prefix: 'monster_',
    atlasPaths: [ASSET_PATHS.monsterAtlas],
    imagePaths: [],
    bundle: { id: 'live-monsters-gallery', urls: [ASSET_PATHS.monsterAtlas], estimatedBytes: 3_200_000 },
  },
  {
    id: 'live-ui',
    label: '실사용 UI 스킨',
    kind: 'atlas',
    atlasPaths: [ASSET_PATHS.uiAtlas, ASSET_PATHS.uiIcons],
    imagePaths: [],
    bundle: { id: 'live-ui-gallery', urls: [ASSET_PATHS.uiAtlas, ASSET_PATHS.uiIcons], estimatedBytes: 130_000 },
  },
  {
    id: 'operations-ui',
    label: '운영 UI·보상 아이콘',
    kind: 'atlas',
    atlasPaths: [ASSET_PATHS.operationsAtlas],
    imagePaths: [],
    bundle: { id: 'operations-ui-gallery', urls: [ASSET_PATHS.operationsAtlas], estimatedBytes: 60_000 },
  },
] as const;

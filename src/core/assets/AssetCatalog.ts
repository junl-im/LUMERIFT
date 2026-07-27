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
  uiAtlas: assetUrl('assets/atlases/ui/ui_skin_v1.json'),
  playerAtlas: assetUrl('assets/atlases/player/player_v1.json'),
  monsterAtlas: assetUrl('assets/atlases/monsters/monster_common_v1.json'),
  effectsAtlas: assetUrl('assets/atlases/effects/combat_effects_v1.json'),
  equipmentAtlas: assetUrl('assets/atlases/items/equipment_icons_v1.json'),
  forestMap: assetUrl('assets/maps/chapter1/forest_rift_v1.webp'),
  uiClick: assetUrl('assets/audio/ui/click_v1.ogg'),
  slash: assetUrl('assets/audio/combat/slash_v1.ogg'),
  hit: assetUrl('assets/audio/combat/hit_v1.ogg'),
  skill: assetUrl('assets/audio/combat/skill_v1.ogg'),
  dodge: assetUrl('assets/audio/combat/dodge_v1.ogg'),
  forestBgm: assetUrl('assets/audio/bgm/forest_rift_loop_v1.opus'),
  megaItemsAtlas: assetUrl('assets/atlases/items/mega_items_v1.json'),
  skillIconsAtlas: assetUrl('assets/atlases/skills/skill_icons_v1.json'),
  statusIconsAtlas: assetUrl('assets/atlases/status/status_icons_v1.json'),
  uiIconsV2Atlas: assetUrl('assets/atlases/ui/ui_icons_v2.json'),
  bestiaryAtlas: assetUrl('assets/atlases/bestiary/bestiary_portraits_v1.json'),
  npcPortraitsAtlas: assetUrl('assets/atlases/npc/npc_portraits_v1.json'),
  environmentPropsAtlas: assetUrl('assets/atlases/environment/environment_props_v1.json'),
  effectsMegaAtlas: assetUrl('assets/atlases/effects/effects_mega_v1.json'),
  emblemsAtlas: assetUrl('assets/atlases/emblems/emblems_v1.json'),
  tutorialGlyphsAtlas: assetUrl('assets/atlases/tutorial/tutorial_glyphs_v1.json'),
} as const;

export const CORE_UI_BUNDLE: AssetBundleDefinition = {
  id: 'core-ui',
  urls: [ASSET_PATHS.uiAtlas],
  estimatedBytes: 8_176,
};

export const EQUIPMENT_UI_BUNDLE: AssetBundleDefinition = {
  id: 'equipment-ui',
  urls: [ASSET_PATHS.equipmentAtlas],
  estimatedBytes: 8_000,
};

export const LOBBY_CHARACTER_BUNDLE: AssetBundleDefinition = {
  id: 'lobby-character',
  urls: [ASSET_PATHS.playerAtlas, ASSET_PATHS.equipmentAtlas],
  estimatedBytes: 105_000,
};

export const BATTLE_CHAPTER_1_BUNDLE: AssetBundleDefinition = {
  id: 'battle-chapter-1',
  urls: [
    ASSET_PATHS.playerAtlas,
    ASSET_PATHS.monsterAtlas,
    ASSET_PATHS.effectsAtlas,
    ASSET_PATHS.equipmentAtlas,
    ASSET_PATHS.forestMap,
  ],
  estimatedBytes: 360_000,
};

export const ASSET_MEGA_GALLERY_BUNDLE: AssetBundleDefinition = {
  id: 'asset-mega-gallery',
  urls: [
    ASSET_PATHS.megaItemsAtlas,
    ASSET_PATHS.skillIconsAtlas,
    ASSET_PATHS.statusIconsAtlas,
    ASSET_PATHS.uiIconsV2Atlas,
    ASSET_PATHS.bestiaryAtlas,
    ASSET_PATHS.npcPortraitsAtlas,
    ASSET_PATHS.environmentPropsAtlas,
    ASSET_PATHS.effectsMegaAtlas,
    ASSET_PATHS.emblemsAtlas,
    ASSET_PATHS.tutorialGlyphsAtlas,
  ],
  estimatedBytes: 1_250_000,
};

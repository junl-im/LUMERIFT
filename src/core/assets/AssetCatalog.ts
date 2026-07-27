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

function qualityAssetUrls(paths: readonly string[]): readonly string[] {
  return paths.map((path) => assetUrl(`assets/${path}`));
}

function qualityBundle(id: string, paths: readonly string[], estimatedBytes: number): AssetBundleDefinition {
  return { id, urls: qualityAssetUrls(paths), estimatedBytes };
}

export const QUALITY_GALLERY_CATEGORIES: readonly QualityGalleryCategoryDefinition[] = [
  {
    id: 'quality-heroes',
    label: '영웅 초상 8종',
    kind: 'atlas',
    prefix: 'quality.hero.',
    atlasPaths: qualityAssetUrls([
      'atlases/quality/heroes/heroes_quality_01.json',
    ]),
    imagePaths: [],
    bundle: qualityBundle('quality-heroes', [
      'atlases/quality/heroes/heroes_quality_01.json',
      'atlases/quality/heroes/heroes_quality_01.webp',
    ], 292390),
  },
  {
    id: 'quality-bosses',
    label: '보스 초상 12종',
    kind: 'atlas',
    prefix: 'quality.boss.',
    atlasPaths: qualityAssetUrls([
      'atlases/quality/bosses/bosses_quality_01.json',
      'atlases/quality/bosses/bosses_quality_02.json',
    ]),
    imagePaths: [],
    bundle: qualityBundle('quality-bosses', [
      'atlases/quality/bosses/bosses_quality_01.json',
      'atlases/quality/bosses/bosses_quality_01.webp',
      'atlases/quality/bosses/bosses_quality_02.json',
      'atlases/quality/bosses/bosses_quality_02.webp',
    ], 346339),
  },
  {
    id: 'quality-npc',
    label: 'NPC 초상 16종',
    kind: 'atlas',
    prefix: 'quality.npc.',
    atlasPaths: qualityAssetUrls([
      'atlases/quality/npc/npc_quality_01.json',
      'atlases/quality/npc/npc_quality_02.json',
    ]),
    imagePaths: [],
    bundle: qualityBundle('quality-npc', [
      'atlases/quality/npc/npc_quality_01.json',
      'atlases/quality/npc/npc_quality_01.webp',
      'atlases/quality/npc/npc_quality_02.json',
      'atlases/quality/npc/npc_quality_02.webp',
    ], 361496),
  },
  {
    id: 'quality-items',
    label: '장비·아이템 아이콘 384종',
    kind: 'atlas',
    prefix: 'quality.item.',
    atlasPaths: qualityAssetUrls([
      'atlases/quality/items/items_quality_01.json',
      'atlases/quality/items/items_quality_02.json',
      'atlases/quality/items/items_quality_03.json',
      'atlases/quality/items/items_quality_04.json',
      'atlases/quality/items/items_quality_05.json',
      'atlases/quality/items/items_quality_06.json',
    ]),
    imagePaths: [],
    bundle: qualityBundle('quality-items', [
      'atlases/quality/items/items_quality_01.json',
      'atlases/quality/items/items_quality_01.webp',
      'atlases/quality/items/items_quality_02.json',
      'atlases/quality/items/items_quality_02.webp',
      'atlases/quality/items/items_quality_03.json',
      'atlases/quality/items/items_quality_03.webp',
      'atlases/quality/items/items_quality_04.json',
      'atlases/quality/items/items_quality_04.webp',
      'atlases/quality/items/items_quality_05.json',
      'atlases/quality/items/items_quality_05.webp',
      'atlases/quality/items/items_quality_06.json',
      'atlases/quality/items/items_quality_06.webp',
    ], 2925924),
  },
  {
    id: 'quality-skills',
    label: '스킬 아이콘 160종',
    kind: 'atlas',
    prefix: 'quality.skill.',
    atlasPaths: qualityAssetUrls([
      'atlases/quality/skills/skills_quality_01.json',
      'atlases/quality/skills/skills_quality_02.json',
      'atlases/quality/skills/skills_quality_03.json',
      'atlases/quality/skills/skills_quality_04.json',
    ]),
    imagePaths: [],
    bundle: qualityBundle('quality-skills', [
      'atlases/quality/skills/skills_quality_01.json',
      'atlases/quality/skills/skills_quality_01.webp',
      'atlases/quality/skills/skills_quality_02.json',
      'atlases/quality/skills/skills_quality_02.webp',
      'atlases/quality/skills/skills_quality_03.json',
      'atlases/quality/skills/skills_quality_03.webp',
      'atlases/quality/skills/skills_quality_04.json',
      'atlases/quality/skills/skills_quality_04.webp',
    ], 1123718),
  },
  {
    id: 'quality-environment',
    label: '환경 오브젝트 240종',
    kind: 'atlas',
    prefix: 'quality.prop.',
    atlasPaths: qualityAssetUrls([
      'atlases/quality/environment/props_quality_01.json',
      'atlases/quality/environment/props_quality_02.json',
      'atlases/quality/environment/props_quality_03.json',
      'atlases/quality/environment/props_quality_04.json',
      'atlases/quality/environment/props_quality_05.json',
    ]),
    imagePaths: [],
    bundle: qualityBundle('quality-environment', [
      'atlases/quality/environment/props_quality_01.json',
      'atlases/quality/environment/props_quality_01.webp',
      'atlases/quality/environment/props_quality_02.json',
      'atlases/quality/environment/props_quality_02.webp',
      'atlases/quality/environment/props_quality_03.json',
      'atlases/quality/environment/props_quality_03.webp',
      'atlases/quality/environment/props_quality_04.json',
      'atlases/quality/environment/props_quality_04.webp',
      'atlases/quality/environment/props_quality_05.json',
      'atlases/quality/environment/props_quality_05.webp',
    ], 1514287),
  },
  {
    id: 'quality-vfx',
    label: '전투 VFX 32세트·384프레임',
    kind: 'atlas',
    prefix: 'quality.vfx.',
    atlasPaths: qualityAssetUrls([
      'atlases/quality/effects/vfx_quality_01.json',
      'atlases/quality/effects/vfx_quality_02.json',
      'atlases/quality/effects/vfx_quality_03.json',
      'atlases/quality/effects/vfx_quality_04.json',
    ]),
    imagePaths: [],
    bundle: qualityBundle('quality-vfx', [
      'atlases/quality/effects/vfx_quality_01.json',
      'atlases/quality/effects/vfx_quality_01.webp',
      'atlases/quality/effects/vfx_quality_02.json',
      'atlases/quality/effects/vfx_quality_02.webp',
      'atlases/quality/effects/vfx_quality_03.json',
      'atlases/quality/effects/vfx_quality_03.webp',
      'atlases/quality/effects/vfx_quality_04.json',
      'atlases/quality/effects/vfx_quality_04.webp',
    ], 3074366),
  },
  {
    id: 'quality-ui',
    label: '프리미엄 UI 프레임 96종',
    kind: 'atlas',
    prefix: 'quality.ui.',
    atlasPaths: qualityAssetUrls([
      'atlases/quality/ui/ui_quality_01.json',
      'atlases/quality/ui/ui_quality_02.json',
    ]),
    imagePaths: [],
    bundle: qualityBundle('quality-ui', [
      'atlases/quality/ui/ui_quality_01.json',
      'atlases/quality/ui/ui_quality_01.webp',
      'atlases/quality/ui/ui_quality_02.json',
      'atlases/quality/ui/ui_quality_02.webp',
    ], 490162),
  },
  {
    id: 'quality-keyart',
    label: '지역 키아트 10종',
    kind: 'image',
    atlasPaths: [],
    imagePaths: qualityAssetUrls([
      'loading/quality/verdant_rift_keyart_01.webp',
      'loading/quality/verdant_rift_keyart_02.webp',
      'loading/quality/sunken_dunes_keyart_01.webp',
      'loading/quality/sunken_dunes_keyart_02.webp',
      'loading/quality/frost_citadel_keyart_01.webp',
      'loading/quality/frost_citadel_keyart_02.webp',
      'loading/quality/ember_foundry_keyart_01.webp',
      'loading/quality/ember_foundry_keyart_02.webp',
      'loading/quality/neon_arcology_keyart_01.webp',
      'loading/quality/neon_arcology_keyart_02.webp',
    ]),
    bundle: qualityBundle('quality-keyart', [
      'loading/quality/verdant_rift_keyart_01.webp',
      'loading/quality/verdant_rift_keyart_02.webp',
      'loading/quality/sunken_dunes_keyart_01.webp',
      'loading/quality/sunken_dunes_keyart_02.webp',
      'loading/quality/frost_citadel_keyart_01.webp',
      'loading/quality/frost_citadel_keyart_02.webp',
      'loading/quality/ember_foundry_keyart_01.webp',
      'loading/quality/ember_foundry_keyart_02.webp',
      'loading/quality/neon_arcology_keyart_01.webp',
      'loading/quality/neon_arcology_keyart_02.webp',
    ], 1147164),
  },
  {
    id: 'quality-backgrounds',
    label: '지역 전투 배경 15종',
    kind: 'image',
    atlasPaths: [],
    imagePaths: qualityAssetUrls([
      'maps/quality/chapter1/verdant_rift_battle_01.webp',
      'maps/quality/chapter1/verdant_rift_battle_02.webp',
      'maps/quality/chapter1/verdant_rift_battle_03.webp',
      'maps/quality/chapter2/sunken_dunes_battle_01.webp',
      'maps/quality/chapter2/sunken_dunes_battle_02.webp',
      'maps/quality/chapter2/sunken_dunes_battle_03.webp',
      'maps/quality/chapter3/frost_citadel_battle_01.webp',
      'maps/quality/chapter3/frost_citadel_battle_02.webp',
      'maps/quality/chapter3/frost_citadel_battle_03.webp',
      'maps/quality/chapter4/ember_foundry_battle_01.webp',
      'maps/quality/chapter4/ember_foundry_battle_02.webp',
      'maps/quality/chapter4/ember_foundry_battle_03.webp',
      'maps/quality/chapter5/neon_arcology_battle_01.webp',
      'maps/quality/chapter5/neon_arcology_battle_02.webp',
      'maps/quality/chapter5/neon_arcology_battle_03.webp',
    ]),
    bundle: qualityBundle('quality-backgrounds', [
      'maps/quality/chapter1/verdant_rift_battle_01.webp',
      'maps/quality/chapter1/verdant_rift_battle_02.webp',
      'maps/quality/chapter1/verdant_rift_battle_03.webp',
      'maps/quality/chapter2/sunken_dunes_battle_01.webp',
      'maps/quality/chapter2/sunken_dunes_battle_02.webp',
      'maps/quality/chapter2/sunken_dunes_battle_03.webp',
      'maps/quality/chapter3/frost_citadel_battle_01.webp',
      'maps/quality/chapter3/frost_citadel_battle_02.webp',
      'maps/quality/chapter3/frost_citadel_battle_03.webp',
      'maps/quality/chapter4/ember_foundry_battle_01.webp',
      'maps/quality/chapter4/ember_foundry_battle_02.webp',
      'maps/quality/chapter4/ember_foundry_battle_03.webp',
      'maps/quality/chapter5/neon_arcology_battle_01.webp',
      'maps/quality/chapter5/neon_arcology_battle_02.webp',
      'maps/quality/chapter5/neon_arcology_battle_03.webp',
    ], 1631876),
  },
] as const;

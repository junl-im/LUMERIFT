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
  uiAtlas: assetUrl('assets/live/v22/atlases/ui/ui_reborn_v22.json'),
  uiIcons: assetUrl('assets/live/v5/atlases/ui/ui_icons_v5.json'),
  titleBackground: assetUrl('assets/live/v22/backgrounds/title_reborn_v22.webp'),
  playerAtlas: assetUrl('assets/live/v22/atlases/player/player_reborn_body_v22.json'),
  legacyPremiumPlayerAtlas: assetUrl('assets/live/v10/atlases/player/player_premium_body_v10.json'),
  weaponAttackBodyAtlas: assetUrl('assets/live/v11/atlases/player/player_weapon_attack_body_v11.json'),
  legacyPlayerAtlas: assetUrl('assets/live/v4/atlases/player/player_live_v4.json'),
  ownedPlayerAtlas: assetUrl('assets/live/v6/atlases/player/player_owned_motion_v6.json'),
  ownedPaintedPlayerAtlas: assetUrl('assets/live/v7/atlases/player/player_owned_painted_v7.json'),
  monsterAtlas: assetUrl('assets/live/v22/atlases/monsters/monsters_reborn_v22.json'),
  effectsAtlas: assetUrl('assets/live/v22/atlases/effects/combat_effects_reborn_v22.json'),
  equipmentAtlas: assetUrl('assets/atlases/items/equipment_icons_v1.json'),
  forestMap: assetUrl('assets/live/v4/backgrounds/forest_approach_v4.webp'),
  forestApproachMap: assetUrl('assets/live/v4/backgrounds/forest_approach_v4.webp'),
  forestRuinsMap: assetUrl('assets/live/v4/backgrounds/forest_ruins_v4.webp'),
  forestDepthsMap: assetUrl('assets/live/v4/backgrounds/forest_depths_v4.webp'),
  riftCoreMap: assetUrl('assets/live/v4/backgrounds/rift_core_v4.webp'),
  lobbyBackground: assetUrl('assets/live/v22/backgrounds/lobby_reborn_v22.webp'),
  heroPortrait: assetUrl('assets/live/v22/portraits/hero_reborn_v22.webp'),
  legacyPremiumHeroPortrait: assetUrl('assets/live/v8/portraits/hero_premium_v8.webp'),
  heroFacePortrait: assetUrl('assets/live/v22/portraits/hero_face_reborn_v22.webp'),
  monsterPortraitReborn: assetUrl('assets/live/v22/portraits/monster_reborn_v22.webp'),
  integratedVisualReplacementV22Contract: assetUrl('assets/live/v22/production/INTEGRATED_VISUAL_REPLACEMENT_V22.json'),
  premiumPlayerOverlayAtlas: assetUrl('assets/live/v8/atlases/player/player_premium_overlay_v8.json'),
  premiumHudAtlas: assetUrl('assets/live/v15/atlases/ui/premium_hud_v15.json'),
  premiumPlayerPartsAtlas: assetUrl('assets/live/v16/atlases/player/player_parts_v16.json'),
  premiumMonsterPartsAtlas: assetUrl('assets/live/v16/atlases/monsters/monster_parts_v16.json'),
  bossCoreFxAtlas: assetUrl('assets/live/v16/atlases/effects/boss_core_fx_v16.json'),
  premiumUiIconsV16Atlas: assetUrl('assets/live/v16/atlases/ui/premium_ui_icons_v16.json'),
  premiumPlayerDirectionV17Atlas: assetUrl('assets/live/v17/atlases/player/player_direction_parts_v17.json'),
  premiumMonsterBodyV17Atlas: assetUrl('assets/live/v17/atlases/monsters/monster_body_parts_v17.json'),
  bossCoreFxV17Atlas: assetUrl('assets/live/v17/atlases/effects/boss_core_fx_v17.json'),
  premiumUiIconsV17Atlas: assetUrl('assets/live/v17/atlases/ui/premium_ui_icons_v17.json'),
  premiumPlayerActionV18Atlas: assetUrl('assets/live/v18/atlases/player/player_action_parts_v18.json'),
  premiumMonsterMotionV18Atlas: assetUrl('assets/live/v18/atlases/monsters/monster_motion_parts_v18.json'),
  bossCoreFxV18Atlas: assetUrl('assets/live/v18/atlases/effects/boss_core_fx_v18.json'),
  premiumUiIconsV18Atlas: assetUrl('assets/live/v18/atlases/ui/premium_ui_icons_v18.json'),
  premiumPlayerActionPhaseV19Atlas: assetUrl('assets/live/v19/atlases/player/player_action_phases_v19.json'),
  premiumMonsterDirectionV19Atlas: assetUrl('assets/live/v19/atlases/monsters/monster_direction_limb_v19.json'),
  bossCoreTrailV19Atlas: assetUrl('assets/live/v19/atlases/effects/boss_core_trails_v19.json'),
  premiumCombatVfxV19Atlas: assetUrl('assets/live/v19/atlases/effects/premium_combat_vfx_v19.json'),
  premiumPlayerWeaponPhaseV20Atlas: assetUrl('assets/live/v20/atlases/player/player_weapon_phases_v20.json'),
  premiumMonsterDamageV20Atlas: assetUrl('assets/live/v20/atlases/monsters/monster_damage_parts_v20.json'),
  bossCoreEventV20Atlas: assetUrl('assets/live/v20/atlases/effects/boss_core_events_v20.json'),
  premiumStatusV20Atlas: assetUrl('assets/live/v20/atlases/effects/status_vfx_v20.json'),
  premiumSupportUiV20Atlas: assetUrl('assets/live/v20/atlases/ui/premium_support_ui_v20.json'),
  premiumPlayerInterpolationV21Atlas: assetUrl('assets/live/v21/atlases/player/player_weapon_interpolation_v21.json'),
  premiumMonsterRecoveryV21Atlas: assetUrl('assets/live/v21/atlases/monsters/monster_recovery_parts_v21.json'),
  premiumStatusLifecycleV21Atlas: assetUrl('assets/live/v21/atlases/effects/status_lifecycle_v21.json'),
  premiumSupportUiV21Atlas: assetUrl('assets/live/v21/atlases/ui/premium_support_ui_v21.json'),
  characterFxAtlas: assetUrl('assets/live/v9/atlases/player/player_character_fx_v9.json'),
  equipmentMaterialAtlas: assetUrl('assets/live/v9/atlases/equipment/equipment_material_v9.json'),
  bossPortrait: assetUrl('assets/live/v22/portraits/boss_phase_1_reborn_v22.webp'),
  bossPortraitPhase1: assetUrl('assets/live/v22/portraits/boss_phase_1_reborn_v22.webp'),
  bossPortraitPhase2: assetUrl('assets/live/v22/portraits/boss_phase_2_reborn_v22.webp'),
  bossPortraitPhase3: assetUrl('assets/live/v22/portraits/boss_phase_3_reborn_v22.webp'),
  operationsAtlas: assetUrl('assets/live/v3/atlases/operations/operations_ui_v3.json'),
  premiumCharacterArtReference: assetUrl('assets/live/v12/art-direction/character_quality_upgrade_v12.webp'),
  premiumMonsterArtReference: assetUrl('assets/live/v12/art-direction/monster_quality_upgrade_v12.webp'),
  premiumArtDirectionContract: assetUrl('assets/live/v12/art-direction/ART_DIRECTION_V12.json'),
  premiumCharacterProductionContract: assetUrl('assets/live/v13/production/CHARACTER_BODY_V13.json'),
  premiumMonsterProductionContract: assetUrl('assets/live/v13/production/MONSTER_ELITE_BOSS_V13.json'),
  premiumRuneVfxContract: assetUrl('assets/live/v13/production/RUNE_VFX_V13.json'),
  premiumUiFrameContract: assetUrl('assets/live/v13/production/UI_FRAME_V13.json'),
  premiumHudV15Contract: assetUrl('assets/live/v15/production/PREMIUM_HUD_V15.json'),
  bossCoreV15Contract: assetUrl('assets/live/v15/production/BOSS_CORE_LIFECYCLE_V15.json'),
  characterPartHandoffV15: assetUrl('assets/live/v15/production/CHARACTER_PART_ATLAS_HANDOFF_V15.json'),
  monsterPartHandoffV15: assetUrl('assets/live/v15/production/MONSTER_PART_ATLAS_HANDOFF_V15.json'),
  captureEvidenceV15Contract: assetUrl('assets/live/v15/production/CAPTURE_EVIDENCE_V15.json'),
  premiumPlayerPartsV16Contract: assetUrl('assets/live/v16/production/PLAYER_PARTS_V16.json'),
  premiumMonsterPartsV16Contract: assetUrl('assets/live/v16/production/MONSTER_PARTS_V16.json'),
  bossCoreFxV16Contract: assetUrl('assets/live/v16/production/BOSS_CORE_FX_V16.json'),
  premiumUiIconsV16Contract: assetUrl('assets/live/v16/production/PREMIUM_UI_ICONS_V16.json'),
  premiumPlayerDirectionV17Contract: assetUrl('assets/live/v17/production/PLAYER_DIRECTION_PARTS_V17.json'),
  premiumMonsterBodyV17Contract: assetUrl('assets/live/v17/production/MONSTER_BODY_PARTS_V17.json'),
  bossCoreFxV17Contract: assetUrl('assets/live/v17/production/BOSS_CORE_FX_V17.json'),
  premiumUiIconsV17Contract: assetUrl('assets/live/v17/production/PREMIUM_UI_ICONS_V17.json'),
  premiumPlayerActionV18Contract: assetUrl('assets/live/v18/production/PLAYER_ACTION_PARTS_V18.json'),
  premiumMonsterMotionV18Contract: assetUrl('assets/live/v18/production/MONSTER_MOTION_PARTS_V18.json'),
  bossCoreFxV18Contract: assetUrl('assets/live/v18/production/BOSS_CORE_FX_V18.json'),
  premiumUiIconsV18Contract: assetUrl('assets/live/v18/production/PREMIUM_UI_ICONS_V18.json'),
  premiumPlayerActionPhaseV19Contract: assetUrl('assets/live/v19/production/PLAYER_ACTION_PHASES_V19.json'),
  premiumMonsterDirectionV19Contract: assetUrl('assets/live/v19/production/MONSTER_DIRECTION_LIMB_V19.json'),
  bossCoreTrailV19Contract: assetUrl('assets/live/v19/production/BOSS_CORE_TRAILS_V19.json'),
  premiumCombatVfxV19Contract: assetUrl('assets/live/v19/production/PREMIUM_COMBAT_VFX_V19.json'),
  premiumPlayerWeaponPhaseV20Contract: assetUrl('assets/live/v20/production/PLAYER_WEAPON_PHASES_V20.json'),
  premiumMonsterDamageV20Contract: assetUrl('assets/live/v20/production/MONSTER_DAMAGE_PARTS_V20.json'),
  bossCoreEventV20Contract: assetUrl('assets/live/v20/production/BOSS_CORE_EVENTS_V20.json'),
  premiumStatusV20Contract: assetUrl('assets/live/v20/production/STATUS_VFX_V20.json'),
  premiumSupportUiV20Contract: assetUrl('assets/live/v20/production/PREMIUM_SUPPORT_UI_V20.json'),
  premiumPlayerInterpolationV21Contract: assetUrl('assets/live/v21/production/PLAYER_WEAPON_INTERPOLATION_V21.json'),
  premiumMonsterRecoveryV21Contract: assetUrl('assets/live/v21/production/MONSTER_RECOVERY_PARTS_V21.json'),
  premiumStatusLifecycleV21Contract: assetUrl('assets/live/v21/production/STATUS_LIFECYCLE_V21.json'),
  premiumSupportUiV21Contract: assetUrl('assets/live/v21/production/PREMIUM_SUPPORT_UI_V21.json'),
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
  estimatedBytes: 560_000,
};

export const PREMIUM_SUPPORT_UI_BUNDLE: AssetBundleDefinition = {
  id: 'premium-support-ui-v20',
  urls: [ASSET_PATHS.premiumUiIconsV17Atlas, ASSET_PATHS.premiumUiIconsV18Atlas, ASSET_PATHS.premiumSupportUiV20Atlas, ASSET_PATHS.premiumSupportUiV21Atlas],
  estimatedBytes: 280_000,
};

export const EQUIPMENT_UI_BUNDLE: AssetBundleDefinition = {
  id: 'equipment-ui',
  urls: [
    ASSET_PATHS.equipmentAtlas,
    ASSET_PATHS.equipmentMaterialAtlas,
    ASSET_PATHS.premiumHudAtlas,
    ASSET_PATHS.premiumUiIconsV16Atlas,
    ASSET_PATHS.premiumUiIconsV17Atlas,
    ASSET_PATHS.premiumUiIconsV18Atlas,
  ],
  estimatedBytes: 650_000,
};

export const LOBBY_CHARACTER_BUNDLE: AssetBundleDefinition = {
  id: 'lobby-character',
  urls: [ASSET_PATHS.lobbyBackground, ASSET_PATHS.heroPortrait, ASSET_PATHS.heroFacePortrait, ASSET_PATHS.uiAtlas, ASSET_PATHS.uiIcons, ASSET_PATHS.equipmentAtlas, ASSET_PATHS.equipmentMaterialAtlas],
  estimatedBytes: 760_000,
};

// Legacy contract marker retained for cumulative validation: id: 'character-wardrobe-v1'
export const WARDROBE_UI_BUNDLE: AssetBundleDefinition = {
  id: 'character-wardrobe-v22',
  urls: [
    ASSET_PATHS.playerAtlas,
    ASSET_PATHS.heroPortrait,
    ASSET_PATHS.heroFacePortrait,
    ASSET_PATHS.uiAtlas,
    ASSET_PATHS.uiIcons,
    ASSET_PATHS.equipmentAtlas,
    ASSET_PATHS.equipmentMaterialAtlas,
    ASSET_PATHS.premiumUiIconsV17Atlas,
    ASSET_PATHS.premiumUiIconsV18Atlas,
  ],
  estimatedBytes: 3_050_000,
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
  id: 'battle-chapter-1-v22',
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
    ASSET_PATHS.premiumHudAtlas,
    ASSET_PATHS.premiumCombatVfxV19Atlas,
    ASSET_PATHS.premiumStatusV20Atlas,
    ASSET_PATHS.premiumStatusLifecycleV21Atlas,
  ],
  estimatedBytes: 6_900_000,
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

export const PREMIUM_ART_DIRECTION_REFERENCE_BUNDLE: AssetBundleDefinition = {
  id: 'premium-art-direction-v12',
  urls: [ASSET_PATHS.premiumCharacterArtReference, ASSET_PATHS.premiumMonsterArtReference],
  estimatedBytes: 668_606,
};

export const PREMIUM_PRODUCTION_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'premium-production-contract-v13',
  urls: [
    ASSET_PATHS.premiumCharacterProductionContract,
    ASSET_PATHS.premiumMonsterProductionContract,
    ASSET_PATHS.premiumRuneVfxContract,
    ASSET_PATHS.premiumUiFrameContract,
  ],
  estimatedBytes: 5_000,
};

export const PREMIUM_RUNTIME_V15_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'premium-runtime-contract-v15',
  urls: [
    ASSET_PATHS.premiumHudV15Contract,
    ASSET_PATHS.bossCoreV15Contract,
    ASSET_PATHS.characterPartHandoffV15,
    ASSET_PATHS.monsterPartHandoffV15,
    ASSET_PATHS.captureEvidenceV15Contract,
  ],
  estimatedBytes: 6_000,
};

export const PREMIUM_RUNTIME_V16_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'premium-runtime-contract-v16',
  urls: [
    ASSET_PATHS.premiumPlayerPartsV16Contract,
    ASSET_PATHS.premiumMonsterPartsV16Contract,
    ASSET_PATHS.bossCoreFxV16Contract,
    ASSET_PATHS.premiumUiIconsV16Contract,
  ],
  estimatedBytes: 5_000,
};

export const PREMIUM_RUNTIME_V17_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'premium-runtime-contract-v17',
  urls: [
    ASSET_PATHS.premiumPlayerDirectionV17Contract,
    ASSET_PATHS.premiumMonsterBodyV17Contract,
    ASSET_PATHS.bossCoreFxV17Contract,
    ASSET_PATHS.premiumUiIconsV17Contract,
  ],
  estimatedBytes: 7_000,
};


export const PREMIUM_RUNTIME_V18_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'premium-runtime-contract-v18',
  urls: [
    ASSET_PATHS.premiumPlayerActionV18Contract,
    ASSET_PATHS.premiumMonsterMotionV18Contract,
    ASSET_PATHS.bossCoreFxV18Contract,
    ASSET_PATHS.premiumUiIconsV18Contract,
  ],
  estimatedBytes: 7_000,
};

export const PREMIUM_RUNTIME_V19_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'premium-runtime-contract-v19',
  urls: [
    ASSET_PATHS.premiumPlayerActionPhaseV19Contract,
    ASSET_PATHS.premiumMonsterDirectionV19Contract,
    ASSET_PATHS.bossCoreTrailV19Contract,
    ASSET_PATHS.premiumCombatVfxV19Contract,
  ],
  estimatedBytes: 7_000,
};

export const PREMIUM_RUNTIME_V22_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'integrated-visual-replacement-v22',
  urls: [ASSET_PATHS.integratedVisualReplacementV22Contract],
  estimatedBytes: 3_000,
};

export const QUALITY_GALLERY_CATEGORIES: readonly QualityGalleryCategoryDefinition[] = [
  {
    id: 'integrated-visual-replacement-v22',
    label: '초대규모 교체 아트 · 통합 본체 v22',
    kind: 'image',
    atlasPaths: [],
    imagePaths: [ASSET_PATHS.heroPortrait, ASSET_PATHS.monsterPortraitReborn],
    bundle: {
      id: 'integrated-visual-replacement-v22-gallery',
      urls: [ASSET_PATHS.heroPortrait, ASSET_PATHS.monsterPortraitReborn, ASSET_PATHS.integratedVisualReplacementV22Contract],
      estimatedBytes: 280_000,
    },
  },
  {
    id: 'premium-art-direction-v12',
    label: '확정 비주얼 기준 · 캐릭터 & 몬스터',
    kind: 'image',
    atlasPaths: [],
    imagePaths: [ASSET_PATHS.premiumCharacterArtReference, ASSET_PATHS.premiumMonsterArtReference],
    bundle: PREMIUM_ART_DIRECTION_REFERENCE_BUNDLE,
  },
  {
    id: 'premium-hud-v15',
    label: '프리미엄 HUD·스킬·보스 코어 v15',
    kind: 'atlas',
    prefix: 'premium.hud.',
    atlasPaths: [ASSET_PATHS.premiumHudAtlas],
    imagePaths: [],
    bundle: { id: 'premium-hud-v15-gallery', urls: [ASSET_PATHS.premiumHudAtlas], estimatedBytes: 66_000 },
  },
  {
    id: 'premium-parts-v16',
    label: '캐릭터·엘리트·보스 래스터 파츠 v16',
    kind: 'atlas',
    prefix: 'premium.parts.',
    atlasPaths: [ASSET_PATHS.premiumPlayerPartsAtlas, ASSET_PATHS.premiumMonsterPartsAtlas],
    imagePaths: [],
    bundle: {
      id: 'premium-parts-v16-gallery',
      urls: [ASSET_PATHS.premiumPlayerPartsAtlas, ASSET_PATHS.premiumMonsterPartsAtlas],
      estimatedBytes: 290_000,
    },
  },
  {
    id: 'premium-fx-ui-v16',
    label: '보스 코어 FX·스킬·등급·패턴 아이콘 v16',
    kind: 'atlas',
    prefix: 'premium.',
    atlasPaths: [ASSET_PATHS.bossCoreFxAtlas, ASSET_PATHS.premiumUiIconsV16Atlas],
    imagePaths: [],
    bundle: {
      id: 'premium-fx-ui-v16-gallery',
      urls: [ASSET_PATHS.bossCoreFxAtlas, ASSET_PATHS.premiumUiIconsV16Atlas],
      estimatedBytes: 280_000,
    },
  },
  {
    id: 'premium-direction-body-v17',
    label: '8방향 캐릭터·엘리트·보스 전신 확장 v17',
    kind: 'atlas',
    prefix: 'premium.',
    atlasPaths: [ASSET_PATHS.premiumPlayerDirectionV17Atlas, ASSET_PATHS.premiumMonsterBodyV17Atlas],
    imagePaths: [],
    bundle: {
      id: 'premium-direction-body-v17-gallery',
      urls: [ASSET_PATHS.premiumPlayerDirectionV17Atlas, ASSET_PATHS.premiumMonsterBodyV17Atlas],
      estimatedBytes: 385_000,
    },
  },
  {
    id: 'premium-core-ui-v17',
    label: '보스 코어 24프레임·공통 UI 아이콘 v17',
    kind: 'atlas',
    prefix: 'premium.',
    atlasPaths: [ASSET_PATHS.bossCoreFxV17Atlas, ASSET_PATHS.premiumUiIconsV17Atlas],
    imagePaths: [],
    bundle: {
      id: 'premium-core-ui-v17-gallery',
      urls: [ASSET_PATHS.bossCoreFxV17Atlas, ASSET_PATHS.premiumUiIconsV17Atlas],
      estimatedBytes: 640_000,
    },
  },
  {
    id: 'premium-action-motion-v18',
    label: '캐릭터 동작·몬스터 모션 확장 v18',
    kind: 'atlas',
    prefix: 'premium.',
    atlasPaths: [ASSET_PATHS.premiumPlayerActionV18Atlas, ASSET_PATHS.premiumMonsterMotionV18Atlas],
    imagePaths: [],
    bundle: {
      id: 'premium-action-motion-v18-gallery',
      urls: [ASSET_PATHS.premiumPlayerActionV18Atlas, ASSET_PATHS.premiumMonsterMotionV18Atlas],
      estimatedBytes: 550_000,
    },
  },
  {
    id: 'premium-core-ui-v18',
    label: '보스 코어 루프·전투 UI 아이콘 v18',
    kind: 'atlas',
    prefix: 'premium.',
    atlasPaths: [ASSET_PATHS.bossCoreFxV18Atlas, ASSET_PATHS.premiumUiIconsV18Atlas],
    imagePaths: [],
    bundle: {
      id: 'premium-core-ui-v18-gallery',
      urls: [ASSET_PATHS.bossCoreFxV18Atlas, ASSET_PATHS.premiumUiIconsV18Atlas],
      estimatedBytes: 390_000,
    },
  },
  {
    id: 'premium-phases-direction-v19',
    label: '공격 3단계·몬스터 방향 사지 v19',
    kind: 'atlas',
    prefix: 'premium.',
    atlasPaths: [ASSET_PATHS.premiumPlayerActionPhaseV19Atlas, ASSET_PATHS.premiumMonsterDirectionV19Atlas],
    imagePaths: [],
    bundle: {
      id: 'premium-phases-direction-v19-gallery',
      urls: [ASSET_PATHS.premiumPlayerActionPhaseV19Atlas, ASSET_PATHS.premiumMonsterDirectionV19Atlas],
      estimatedBytes: 790_000,
    },
  },
  {
    id: 'premium-core-vfx-v19',
    label: '보스 코어 연속 궤적·프리미엄 전투 VFX v19',
    kind: 'atlas',
    prefix: 'premium.',
    atlasPaths: [ASSET_PATHS.bossCoreTrailV19Atlas, ASSET_PATHS.premiumCombatVfxV19Atlas],
    imagePaths: [],
    bundle: {
      id: 'premium-core-vfx-v19-gallery',
      urls: [ASSET_PATHS.bossCoreTrailV19Atlas, ASSET_PATHS.premiumCombatVfxV19Atlas],
      estimatedBytes: 360_000,
    },
  },
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
    label: '프리미엄 8방향 플레이어 본체 v10',
    kind: 'atlas',
    prefix: 'premium_body.',
    atlasPaths: [ASSET_PATHS.playerAtlas],
    imagePaths: [],
    bundle: { id: 'live-player-gallery', urls: [ASSET_PATHS.playerAtlas], estimatedBytes: 1_300_000 },
  },

  {
    id: 'weapon-attack-body-v11',
    label: '무기 계열별 공격 본체 v11',
    kind: 'atlas',
    prefix: 'weapon_body.',
    atlasPaths: [ASSET_PATHS.weaponAttackBodyAtlas],
    imagePaths: [],
    bundle: { id: 'weapon-attack-body-gallery', urls: [ASSET_PATHS.weaponAttackBodyAtlas], estimatedBytes: 3_350_000 },
  },

  {
    id: 'legacy-player-fallback',
    label: '레거시 플레이어 본체 · 비상 fallback',
    kind: 'atlas',
    prefix: 'knight_',
    atlasPaths: [ASSET_PATHS.legacyPlayerAtlas],
    imagePaths: [],
    bundle: { id: 'legacy-player-gallery', urls: [ASSET_PATHS.legacyPlayerAtlas], estimatedBytes: 950_000 },
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

export const PREMIUM_RUNTIME_V20_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'premium-runtime-v20-contracts',
  urls: [ASSET_PATHS.premiumPlayerWeaponPhaseV20Contract, ASSET_PATHS.premiumMonsterDamageV20Contract, ASSET_PATHS.bossCoreEventV20Contract, ASSET_PATHS.premiumStatusV20Contract, ASSET_PATHS.premiumSupportUiV20Contract],
  estimatedBytes: 20_000,
};

export const PREMIUM_RUNTIME_V21_CONTRACT_BUNDLE: AssetBundleDefinition = {
  id: 'premium-runtime-v21-contracts',
  urls: [ASSET_PATHS.premiumPlayerInterpolationV21Contract, ASSET_PATHS.premiumMonsterRecoveryV21Contract, ASSET_PATHS.premiumStatusLifecycleV21Contract, ASSET_PATHS.premiumSupportUiV21Contract],
  estimatedBytes: 18_000,
};

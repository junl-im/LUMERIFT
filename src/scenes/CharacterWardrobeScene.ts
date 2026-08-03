import { AnimatedSprite, Container, Graphics, Sprite, Text, TextStyle, type Spritesheet } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { ASSET_PATHS, WARDROBE_UI_BUNDLE } from '../core/assets/AssetCatalog';
import {
  characterCalibrationStatusLabel,
  resolveCharacterDisplayCalibration,
  type CharacterDisplayCalibration,
} from '../core/performance/CharacterDisplayCalibration';
import {
  characterAppearanceFocusLabel,
  characterCostumeSetLabel,
  characterDirectionLabel,
  characterDyeChannelLabel,
  characterPreviewZoomLabel,
  characterPreviewZoomMultiplier,
  characterShowcasePoseLabel,
  equipmentSlotLabel,
  recentPresetUpdatedLabel,
  type CharacterDyeChannel,
} from '../core/presentation/CharacterWardrobeController';
import { characterDyeLabel } from '../core/presentation/CharacterDyeController';
import type { Scene } from '../core/scenes/Scene';
import type { EquipmentSlot, ItemDefinition } from '../game/items/itemTypes';
import { ensureStarterInventory } from '../game/items/inventoryLogic';
import { resolveWeaponMotionProfile, resolveWeaponAttackTiming } from '../game/combat/WeaponMotionProfile';
import {
  resolveCharacterEquipmentAppearance,
  resolveEquipmentDefinition,
  weaponVisualFamilyLabel,
  type CharacterEquipmentAppearance,
} from '../game/presentation/CharacterEquipmentVisualProfile';
import {
  resolveWeaponBodyFrameCorrection,
  resolveWeaponBodyTextures,
  type WeaponBodyFrameRecipe,
} from '../game/presentation/WeaponBodyAttackFrames';
import { CharacterEquipmentLayerView } from '../game/presentation/CharacterEquipmentLayerView';
import { PremiumCharacterDetailLayerView } from '../game/presentation/PremiumCharacterDetailLayerView';
import { createDefaultProfile } from '../repositories/PlayerRepository';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { PREMIUM_UI_ICON_V17_KEYS, premiumUiV17Texture } from '../ui/PremiumUiIconArtV17';
import { PREMIUM_UI_ICON_V18_KEYS, premiumUiV18Texture } from '../ui/PremiumUiIconArtV18';
import { AppearancePresetManagerScene } from './AppearancePresetManagerScene';
import { CharacterCalibrationScene } from './CharacterCalibrationScene';
import { InventoryScene } from './InventoryScene';
import { LobbyScene } from './LobbyScene';

interface PreviewSide {
  readonly sprite?: AnimatedSprite;
  readonly aura?: Graphics;
  readonly equipment?: CharacterEquipmentLayerView;
  readonly premium?: PremiumCharacterDetailLayerView;
  readonly recipe?: WeaponBodyFrameRecipe;
  readonly direction?: CharacterWardrobeControllerDirection;
  readonly baseX?: number;
  readonly baseY?: number;
  readonly baseScale?: number;
  readonly facingX?: number;
}

type CharacterWardrobeControllerDirection = AppContext['characterWardrobe']['current']['direction'];

export class CharacterWardrobeScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private bundleLoaded = false;
  private elapsed = 0;
  private readonly previewSides: PreviewSide[] = [];

  public constructor(private readonly message = '') {}

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const loaded = await context.playerRepository.load(session.uid)
      ?? createDefaultProfile(session.uid, session.displayName);
    const profile = ensureStarterInventory(loaded, context.gameData);
    await context.playerRepository.save(profile);

    await context.assets.loadBundle(WARDROBE_UI_BUNDLE);
    this.bundleLoaded = true;
    const playerSheet = context.assets.get<Spritesheet>(ASSET_PATHS.playerAtlas);
    const weaponAttackSheet = context.assets.get<Spritesheet>(ASSET_PATHS.weaponAttackBodyAtlas);
    const premiumPlayerPartSheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumPlayerPartsAtlas);
    const premiumPlayerDirectionV17Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumPlayerDirectionV17Atlas);
    const premiumUiV17Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumUiIconsV17Atlas);
    const premiumPlayerActionV18Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumPlayerActionV18Atlas);
    const premiumPlayerActionPhaseV19Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumPlayerActionPhaseV19Atlas);
    const premiumPlayerWeaponPhaseV20Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumPlayerWeaponPhaseV20Atlas);
    const premiumUiV18Sheet = context.assets.get<Spritesheet>(ASSET_PATHS.premiumUiIconsV18Atlas);
    const wardrobe = context.characterWardrobe.current;
    const calibration = resolveCharacterDisplayCalibration();
    const candidates = equipmentCandidates(context, wardrobe.comparisonSlot);
    const candidateIndex = candidates.length
      ? wardrobe.comparisonIndexes[wardrobe.comparisonSlot] % candidates.length
      : 0;
    const candidate = candidates[candidateIndex];

    const appearanceOptions = {
      costumeSet: wardrobe.costumeSet,
      dyeChannels: wardrobe.dyeChannels,
    } as const;
    const currentAppearance = resolveCharacterEquipmentAppearance(
      profile,
      context.gameData,
      context.characterDye.current,
      appearanceOptions,
    );
    const candidateAppearance = resolveCharacterEquipmentAppearance(
      profile,
      context.gameData,
      context.characterDye.current,
      {
        ...appearanceOptions,
        equipmentOverrides: candidate ? { [wardrobe.comparisonSlot]: candidate.id } : undefined,
      },
    );
    const equipped = resolveEquipmentDefinition(profile, context.gameData, wardrobe.comparisonSlot);

    this.view.addChild(createBackground(
      '캐릭터·코스튬 아틀리에',
      '8방향 수동 회전, 슬롯별 교체 비교, 무기별 본체 공격 프레임과 세부 염색을 조정합니다.',
    ));
    const wardrobeTexture = premiumUiV18Texture(premiumUiV18Sheet, PREMIUM_UI_ICON_V18_KEYS.wardrobeAction)
      ?? premiumUiV17Texture(premiumUiV17Sheet, PREMIUM_UI_ICON_V17_KEYS.wardrobe);
    if (wardrobeTexture) {
      const wardrobeIcon = new Sprite(wardrobeTexture);
      wardrobeIcon.anchor.set(0.5);
      wardrobeIcon.position.set(486, 108);
      wardrobeIcon.scale.set(0.34);
      wardrobeIcon.alpha = 0.9;
      this.view.addChild(wardrobeIcon);
    }
    this.view.addChild(createPanel(18, 164, 504, 706));

    const feedback = createInlineFeedback(
      this.message || '왼쪽은 현재 장비, 오른쪽은 선택 슬롯 교체 후 미리보기입니다. 실제 장비 데이터는 변경하지 않습니다.',
      this.message ? 'success' : 'neutral',
      468,
    );
    feedback.position.set(36, 176);
    this.view.addChild(feedback);

    this.createPreviewCard({
      x: 32,
      title: 'BEFORE · 현재 외형',
      item: equipped,
      appearance: currentAppearance,
      sheet: playerSheet,
      attackSheet: weaponAttackSheet,
      premiumPartSheet: premiumPlayerPartSheet,
      directionPartSheet: premiumPlayerDirectionV17Sheet,
      actionPartSheet: premiumPlayerActionV18Sheet,
      actionPhaseSheet: premiumPlayerActionPhaseV19Sheet,
      weaponPhaseSheet: premiumPlayerWeaponPhaseV20Sheet,
      calibration,
      isCandidate: false,
    });
    this.createPreviewCard({
      x: 278,
      title: 'AFTER · 교체 외형',
      item: candidate,
      appearance: candidateAppearance,
      sheet: playerSheet,
      attackSheet: weaponAttackSheet,
      premiumPartSheet: premiumPlayerPartSheet,
      directionPartSheet: premiumPlayerDirectionV17Sheet,
      actionPartSheet: premiumPlayerActionV18Sheet,
      actionPhaseSheet: premiumPlayerActionPhaseV19Sheet,
      weaponPhaseSheet: premiumPlayerWeaponPhaseV20Sheet,
      calibration,
      isCandidate: true,
    });

    const captureBadge = createBadge(
      `${calibration.label} · ${characterCalibrationStatusLabel(calibration)}`,
      calibration.captureStatus === 'capture-verified' ? 'success' : 'warning',
    );
    captureBadge.position.set(36, 516);
    const baseline = new Text({
      text: `${calibration.baseline} · 캐릭터 ${Math.round(calibration.studioScale * 100)}% · 발광 ${Math.round(calibration.auraMultiplier * 100)}%`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 8, fontWeight: '700' }),
    });
    baseline.position.set(36, 542);
    const calibrationButton = new UiButton({
      label: '실기기 보정',
      width: 112,
      height: 32,
      tone: calibration.captureStatus === 'capture-verified' ? 'primary' : 'secondary',
      fontSize: 8,
      onPress: async () => context.scenes.change(() => new CharacterCalibrationScene()),
    });
    calibrationButton.position.set(392, 512);
    this.view.addChild(captureBadge, baseline, calibrationButton);

    this.createControlGrid(context, candidates, candidate);
    this.createStorageControls(context);
    this.createBottomActions(context);
  }

  public async exit(): Promise<void> {
    this.previewSides.forEach(({ sprite }) => sprite?.stop());
    this.previewSides.length = 0;
    if (this.bundleLoaded) {
      await this.context?.assets.releaseBundle(WARDROBE_UI_BUNDLE.id);
      this.bundleLoaded = false;
    }
  }

  public update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    this.previewSides.forEach((side, index) => {
      const { aura, equipment, premium, sprite, recipe, direction, baseX, baseY, baseScale, facingX } = side;
      if (sprite && recipe && direction && baseX !== undefined && baseY !== undefined && baseScale !== undefined) {
        const correction = resolveWeaponBodyFrameCorrection(recipe, sprite.currentFrame, direction);
        const actionProgress = sprite.totalFrames > 1 ? sprite.currentFrame / (sprite.totalFrames - 1) : 0;
        sprite.position.set(baseX + correction.offsetX, baseY + correction.offsetY);
        sprite.scale.set(baseScale * correction.scaleX, baseScale * correction.scaleY);
        sprite.rotation = correction.rotation;
        equipment?.update({
          x: baseX + correction.offsetX,
          y: baseY + correction.offsetY,
          scaleX: baseScale * correction.scaleX,
          scaleY: baseScale * correction.scaleY,
          rotation: correction.rotation + correction.layerLag,
          facingX: facingX ?? 0,
          elapsed: this.elapsed + index * 0.4,
          actionProgress,
          state: 'showcase',
          overdrive: false,
        });
        premium?.update({
          x: baseX + correction.offsetX,
          y: baseY + correction.offsetY,
          scaleX: baseScale * correction.scaleX,
          scaleY: baseScale * correction.scaleY,
          rotation: correction.rotation + correction.layerLag * 0.6,
          facingX: facingX ?? 0,
          facingY: directionFacingY(direction),
          elapsed: this.elapsed + index * 0.4,
          actionProgress,
          comboStep: comboStepForPose(this.context?.characterWardrobe.current.pose ?? 'idle'),
          state: 'showcase',
          overdrive: this.context?.characterWardrobe.current.pose === 'skill2',
          flashRemaining: 0,
        });
      } else {
        equipment?.tick(this.elapsed + index * 0.4);
        premium?.update({
          x: baseX ?? 0,
          y: baseY ?? 0,
          scaleX: baseScale ?? 1,
          scaleY: baseScale ?? 1,
          rotation: 0,
          facingX: facingX ?? 0,
          facingY: directionFacingY(direction),
          elapsed: this.elapsed + index * 0.4,
          actionProgress: 0.5,
          comboStep: comboStepForPose(this.context?.characterWardrobe.current.pose ?? 'idle'),
          state: 'showcase',
          overdrive: this.context?.characterWardrobe.current.pose === 'skill2',
          flashRemaining: 0,
        });
      }
      if (!aura) return;
      aura.alpha = 0.72 + Math.sin(this.elapsed * 2.35 + index * 0.8) * 0.12;
      aura.rotation += deltaSeconds * (index === 0 ? 0.07 : -0.07);
    });
  }

  private createPreviewCard(input: {
    readonly x: number;
    readonly title: string;
    readonly item: ItemDefinition | undefined;
    readonly appearance: CharacterEquipmentAppearance;
    readonly sheet: Spritesheet | undefined;
    readonly attackSheet: Spritesheet | undefined;
    readonly premiumPartSheet: Spritesheet | undefined;
    readonly directionPartSheet: Spritesheet | undefined;
    readonly actionPartSheet: Spritesheet | undefined;
    readonly actionPhaseSheet: Spritesheet | undefined;
    readonly weaponPhaseSheet: Spritesheet | undefined;
    readonly calibration: CharacterDisplayCalibration;
    readonly isCandidate: boolean;
  }): void {
    const context = this.context;
    if (!context) return;
    const wardrobe = context.characterWardrobe.current;
    const panel = createPanel(input.x, 234, 230, 272);
    const title = new Text({
      text: input.title,
      style: new TextStyle({ fill: input.isCandidate ? COLORS.primary : COLORS.text, fontSize: 10, fontWeight: '900' }),
    });
    title.position.set(input.x + 14, 246);

    const aura = new Graphics()
      .circle(input.x + 115, 356, 76)
      .fill({ color: input.appearance.primaryColor, alpha: 0.09 * input.calibration.auraMultiplier })
      .circle(input.x + 115, 356, 58)
      .stroke({ color: input.appearance.secondaryColor, alpha: 0.42 * input.calibration.auraMultiplier, width: 3 })
      .circle(input.x + 115, 356, 39)
      .stroke({ color: input.appearance.runeColor, alpha: 0.26 * input.calibration.auraMultiplier, width: 2 });

    const focus = focusPreviewTransform(wardrobe.focusPart);
    const armorScale = input.appearance.armorSilhouette === 'royal'
      ? 1.06
      : input.appearance.armorSilhouette === 'guarded' ? 1.03 : 1;
    const previewScale = 2.02
      * input.calibration.studioScale
      * armorScale
      * characterPreviewZoomMultiplier(wardrobe.previewZoom)
      * focus.scale;
    const previewX = input.x + 115 + focus.x;
    const previewY = 408 + focus.y;
    const equipmentLayers = new CharacterEquipmentLayerView(input.appearance);
    equipmentLayers.update({
      x: previewX,
      y: previewY,
      scaleX: previewScale,
      scaleY: previewScale,
      rotation: 0,
      facingX: directionFacingX(wardrobe.direction),
      elapsed: this.elapsed,
      actionProgress: wardrobe.pose.startsWith('attack') || wardrobe.pose.startsWith('skill') ? 0.5 : 0,
      state: 'showcase',
      overdrive: wardrobe.pose === 'skill2',
    });
    const premiumLayers = new PremiumCharacterDetailLayerView(
      input.appearance,
      input.premiumPartSheet,
      input.directionPartSheet,
      input.actionPartSheet,
      input.actionPhaseSheet,
      input.weaponPhaseSheet,
    );
    premiumLayers.update({
      x: previewX,
      y: previewY,
      scaleX: previewScale,
      scaleY: previewScale,
      rotation: 0,
      facingX: directionFacingX(wardrobe.direction),
      facingY: directionFacingY(wardrobe.direction),
      elapsed: this.elapsed,
      actionProgress: wardrobe.pose.startsWith('attack') || wardrobe.pose.startsWith('skill') ? 0.5 : 0.35,
      comboStep: comboStepForPose(wardrobe.pose),
      state: 'showcase',
      overdrive: wardrobe.pose === 'skill2',
      flashRemaining: 0,
    });

    const body = resolveWeaponBodyTextures(
      input.sheet,
      input.appearance.weaponVisualFamily,
      wardrobe.pose,
      wardrobe.direction,
      input.attackSheet,
    );
    let sprite: AnimatedSprite | undefined;
    if (body?.textures.length) {
      sprite = new AnimatedSprite({
        textures: [...body.textures],
        animationSpeed: body.recipe.animationSpeed,
        loop: body.recipe.loop,
        autoPlay: true,
      });
      sprite.anchor.set(0.5, 0.76);
      sprite.position.set(previewX, previewY);
      sprite.scale.set(previewScale);
      sprite.tint = input.appearance.bodyTint;
    }

    const motion = resolveWeaponMotionProfile(input.appearance.weaponVisualFamily);
    const timing = resolveWeaponAttackTiming(
      input.appearance.weaponVisualFamily,
      comboStepForPose(wardrobe.pose),
      wardrobe.pose === 'skill1' || wardrobe.pose === 'skill2',
    );
    const info = new Text({
      text: [
        `${equipmentSlotLabel(wardrobe.comparisonSlot)} · ${input.item?.name ?? '기본 장비'}`,
        `${weaponVisualFamilyLabel(input.appearance.weaponVisualFamily)} · ${motion.cadenceLabel}`,
        `${characterDirectionLabel(wardrobe.direction)} · ${characterShowcasePoseLabel(wardrobe.pose)}`,
        `${characterAppearanceFocusLabel(wardrobe.focusPart)} · ${characterPreviewZoomLabel(wardrobe.previewZoom)}`,
        `${input.appearance.costumeLabel} · ${input.appearance.layerVariantLabel}`,
        `${body?.recipe.phaseLabel ?? '공통 본체 프레임'} · 접촉 ${Math.round(timing.contactRatio * 100)}%`,
      ].join('\n'),
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: 8,
        lineHeight: 13,
        fontWeight: '700',
        wordWrap: true,
        wordWrapWidth: 202,
      }),
    });
    info.position.set(input.x + 14, 430);

    this.view.addChild(panel, title, aura, premiumLayers.back, equipmentLayers.back);
    if (sprite) this.view.addChild(sprite);
    this.view.addChild(equipmentLayers.front, premiumLayers.front, info);
    this.previewSides.push({
      sprite,
      aura,
      equipment: equipmentLayers,
      premium: premiumLayers,
      recipe: body?.recipe,
      direction: wardrobe.direction,
      baseX: previewX,
      baseY: previewY,
      baseScale: previewScale,
      facingX: directionFacingX(wardrobe.direction),
    });
  }

  private createControlGrid(
    context: AppContext,
    candidates: readonly ItemDefinition[],
    candidate: ItemDefinition | undefined,
  ): void {
    const wardrobe = context.characterWardrobe.current;
    const restart = async (message: string, remember = true): Promise<void> => {
      if (remember) context.characterWardrobe.rememberCurrentPreset(context.characterDye.current);
      await context.scenes.change(() => new CharacterWardrobeScene(message));
    };

    const rotateLeft = compactButton('↶ 방향', characterDirectionLabel(wardrobe.direction), 142, async () => {
      const direction = context.characterWardrobe.rotateDirection(-1);
      await restart(`${characterDirectionLabel(direction)} 방향으로 회전했습니다.`);
    });
    rotateLeft.position.set(36, 566);
    const rotateRight = compactButton('방향 ↷', characterDirectionLabel(wardrobe.direction), 142, async () => {
      const direction = context.characterWardrobe.rotateDirection(1);
      await restart(`${characterDirectionLabel(direction)} 방향으로 회전했습니다.`);
    });
    rotateRight.position.set(184, 566);
    const pose = compactButton('공격/포즈', characterShowcasePoseLabel(wardrobe.pose), 142, async () => {
      const next = context.characterWardrobe.cyclePose();
      await restart(`${characterShowcasePoseLabel(next)} 본체 프레임으로 변경했습니다.`);
    });
    pose.position.set(332, 566);

    const slot = compactButton('비교 슬롯', equipmentSlotLabel(wardrobe.comparisonSlot), 142, async () => {
      const next = context.characterWardrobe.cycleComparisonSlot();
      await restart(`${equipmentSlotLabel(next)} 교체 비교로 변경했습니다.`, false);
    });
    slot.position.set(36, 616);
    const candidateButton = compactButton('교체 후보', candidate?.name ?? '후보 없음', 290, async () => {
      context.characterWardrobe.cycleComparisonCandidate(candidates.length);
      await restart('다음 장비 교체 후보를 표시했습니다.', false);
    });
    candidateButton.position.set(184, 616);

    const costume = compactButton('세트 코스튬', characterCostumeSetLabel(wardrobe.costumeSet), 216, async () => {
      const next = context.characterWardrobe.cycleCostumeSet();
      await restart(`${characterCostumeSetLabel(next)}을 적용했습니다.`);
    });
    costume.position.set(36, 666);
    const dye = compactButton('통합 염색', characterDyeLabel(context.characterDye.current), 216, async () => {
      const next = context.characterDye.cycle();
      await restart(`${characterDyeLabel(next)} 통합 염색을 적용했습니다.`);
    });
    dye.position.set(258, 666);

    const channels: readonly CharacterDyeChannel[] = ['primary', 'secondary', 'rune'];
    const channelButtons = channels.map((channel, index) => {
      const button = compactButton(
        characterDyeChannelLabel(channel, wardrobe.dyeChannels[channel]),
        channel === 'primary' ? '갑주 명암' : channel === 'secondary' ? '망토 명암' : '룬 발광',
        142,
        async () => {
          const level = context.characterWardrobe.cycleDyeChannel(channel);
          await restart(`${characterDyeChannelLabel(channel, level)} 단계로 변경했습니다.`);
        },
      );
      button.position.set(36 + index * 148, 716);
      return button;
    });

    const focus = compactButton('파트 확대', characterAppearanceFocusLabel(wardrobe.focusPart), 216, async () => {
      const next = context.characterWardrobe.cycleFocusPart();
      await restart(`${characterAppearanceFocusLabel(next)} 보기로 전환했습니다.`, false);
    });
    focus.position.set(36, 762);
    const zoom = compactButton('확대 비율', characterPreviewZoomLabel(wardrobe.previewZoom), 216, async () => {
      const next = context.characterWardrobe.cyclePreviewZoom();
      await restart(`${characterPreviewZoomLabel(next)} 확대 비율을 적용했습니다.`, false);
    });
    zoom.position.set(258, 762);

    this.view.addChild(rotateLeft, rotateRight, pose, slot, candidateButton, costume, dye, ...channelButtons, focus, zoom);
  }

  private createStorageControls(context: AppContext): void {
    const state = context.characterWardrobe.current;
    const slots = state.slotOrder.map((slotId, index) => {
      const saved = Boolean(state.slots[slotId]);
      const locked = state.lockedSlots[slotId];
      const button = new UiButton({
        label: `#${index + 1} · S${slotId} · ${locked ? 'LOCK' : saved ? 'SAVE' : 'EMPTY'}`,
        width: 88,
        height: 36,
        tone: state.selectedSlot === slotId ? 'primary' : 'secondary',
        fontSize: 8,
        onPress: async () => {
          context.characterWardrobe.selectSlot(slotId);
          await context.scenes.change(() => new CharacterWardrobeScene(`외형 슬롯 ${slotId}을 선택했습니다.`));
        },
      });
      button.position.set(36 + index * 94, 816);
      return button;
    });

    const selected = state.slots[state.selectedSlot];
    const selectedLocked = state.lockedSlots[state.selectedSlot];
    const selectedInfo = new Text({
      text: `S${state.selectedSlot} · ${selectedLocked ? 'LOCKED' : selected ? 'SAVED' : 'EMPTY'}`,
      style: new TextStyle({ fill: selectedLocked ? COLORS.primary : COLORS.muted, fontSize: 8, fontWeight: '900' }),
    });
    selectedInfo.position.set(208, 868);

    const moveLeft = new UiButton({
      label: '순서 ←', width: 78, height: 34, tone: 'secondary', fontSize: 8,
      onPress: async () => {
        context.characterWardrobe.moveSelectedSlot(-1);
        await context.scenes.change(() => new CharacterWardrobeScene(`SLOT ${state.selectedSlot} 우선순위를 앞으로 이동했습니다.`));
      },
    });
    moveLeft.position.set(36, 856);
    const moveRight = new UiButton({
      label: '순서 →', width: 78, height: 34, tone: 'secondary', fontSize: 8,
      onPress: async () => {
        context.characterWardrobe.moveSelectedSlot(1);
        await context.scenes.change(() => new CharacterWardrobeScene(`SLOT ${state.selectedSlot} 우선순위를 뒤로 이동했습니다.`));
      },
    });
    moveRight.position.set(120, 856);

    const save = new UiButton({
      label: '저장', width: 58, height: 36, tone: selectedLocked ? 'secondary' : 'primary', fontSize: 8,
      onPress: async () => {
        if (selectedLocked) {
          await context.scenes.change(() => new CharacterWardrobeScene(`SLOT ${state.selectedSlot}은 고정되어 있어 덮어쓸 수 없습니다.`));
          return;
        }
        context.characterWardrobe.saveSelectedSlot(context.characterDye.current);
        await context.scenes.change(() => new CharacterWardrobeScene(`SLOT ${state.selectedSlot}에 현재 외형을 저장했습니다.`));
      },
    });
    save.position.set(318, 816);
    const load = new UiButton({
      label: '불러오기', width: 66, height: 36, tone: selected ? 'primary' : 'secondary', fontSize: 8,
      onPress: async () => {
        const preset = context.characterWardrobe.loadSelectedSlot();
        if (preset) context.characterDye.set(preset.dyePreset);
        await context.scenes.change(() => new CharacterWardrobeScene(preset ? '저장 외형을 불러왔습니다.' : '선택 슬롯이 비어 있습니다.'));
      },
    });
    load.position.set(382, 816);
    const lock = new UiButton({
      label: selectedLocked ? '고정 해제' : '슬롯 고정',
      width: 60,
      height: 36,
      tone: selectedLocked ? 'primary' : 'secondary',
      fontSize: 7,
      onPress: async () => {
        const locked = context.characterWardrobe.toggleSlotLock();
        await context.scenes.change(() => new CharacterWardrobeScene(`SLOT ${state.selectedSlot} 고정을 ${locked ? '설정' : '해제'}했습니다.`));
      },
    });
    lock.position.set(452, 816);

    const recent = state.recentPresets[state.selectedRecentIndex] ?? state.recentPresets[0];
    const recentButton = new UiButton({
      label: '외형 프리셋 관리',
      subtitle: recentPresetUpdatedLabel(recent),
      width: 176,
      height: 42,
      tone: recent ? 'primary' : 'secondary',
      fontSize: 9,
      subtitleFontSize: 7,
      onPress: async () => context.scenes.change(() => new AppearancePresetManagerScene()),
    });
    recentButton.position.set(298, 852);

    this.view.addChild(...slots, selectedInfo, moveLeft, moveRight, save, load, lock, recentButton);
  }

  private createBottomActions(context: AppContext): void {
    const inventory = new UiButton({
      label: '장비 보관소',
      width: 232,
      height: 44,
      tone: 'primary',
      fontSize: 13,
      onPress: async () => context.scenes.change(() => new InventoryScene()),
    });
    inventory.position.set(28, 906);
    const back = new UiButton({
      label: '커맨드 허브로 복귀',
      width: 232,
      height: 44,
      tone: 'secondary',
      fontSize: 13,
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(280, 906);
    this.view.addChild(inventory, back);
  }
}


function directionFacingX(direction: string): number {
  if (direction.includes('w')) return -0.82;
  if (direction.includes('e')) return 0.82;
  return 0;
}

function directionFacingY(direction: string | undefined): number {
  if (!direction) return 0;
  if (direction.includes('n')) return -0.82;
  if (direction.includes('s')) return 0.82;
  return 0;
}

function focusPreviewTransform(part: 'full' | 'weapon' | 'armor' | 'cape' | 'rune'): { readonly x: number; readonly y: number; readonly scale: number } {
  if (part === 'weapon') return { x: -12, y: 4, scale: 1.12 };
  if (part === 'armor') return { x: 0, y: 16, scale: 1.18 };
  if (part === 'cape') return { x: 12, y: 12, scale: 1.16 };
  if (part === 'rune') return { x: 0, y: -10, scale: 1.24 };
  return { x: 0, y: 0, scale: 1 };
}


function equipmentCandidates(context: AppContext, slot: EquipmentSlot): readonly ItemDefinition[] {
  return context.gameData.itemIds
    .map((itemId) => context.gameData.getItem(itemId))
    .filter((definition) => definition.slot === slot)
    .sort((left, right) => gradeWeight(left.grade) - gradeWeight(right.grade) || left.name.localeCompare(right.name, 'ko-KR'));
}

function gradeWeight(grade: ItemDefinition['grade']): number {
  if (grade === 'heroic') return 3;
  if (grade === 'rare') return 2;
  return 1;
}

function comboStepForPose(pose: string): number {
  if (pose === 'attack2') return 2;
  if (pose === 'attack3') return 3;
  return 1;
}

function compactButton(
  label: string,
  subtitle: string,
  width: number,
  onPress: () => Promise<void>,
): UiButton {
  return new UiButton({
    label,
    subtitle,
    width,
    height: 44,
    tone: 'secondary',
    fontSize: 9,
    subtitleFontSize: 7,
    onPress,
  });
}

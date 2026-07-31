import { AnimatedSprite, Container, Graphics, Text, TextStyle, type Spritesheet } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { ASSET_PATHS, WARDROBE_UI_BUNDLE } from '../core/assets/AssetCatalog';
import {
  characterCalibrationStatusLabel,
  resolveCharacterDisplayCalibration,
  type CharacterDisplayCalibration,
} from '../core/performance/CharacterDisplayCalibration';
import {
  characterCostumeSetLabel,
  characterDirectionLabel,
  characterDyeChannelLabel,
  characterShowcasePoseLabel,
  equipmentSlotLabel,
  recentPresetUpdatedLabel,
  wardrobeSlotUpdatedLabel,
  type CharacterDyeChannel,
} from '../core/presentation/CharacterWardrobeController';
import { characterDyeLabel } from '../core/presentation/CharacterDyeController';
import type { Scene } from '../core/scenes/Scene';
import type { EquipmentSlot, ItemDefinition } from '../game/items/itemTypes';
import { ensureStarterInventory } from '../game/items/inventoryLogic';
import { resolveWeaponMotionProfile, resolveWeaponAttackTiming } from '../game/combat/WeaponMotionProfile';
import {
  characterCapeStyleLabel,
  resolveCharacterEquipmentAppearance,
  resolveEquipmentDefinition,
  weaponVisualFamilyLabel,
  type CharacterEquipmentAppearance,
} from '../game/presentation/CharacterEquipmentVisualProfile';
import { resolveWeaponBodyTextures } from '../game/presentation/WeaponBodyAttackFrames';
import { createDefaultProfile } from '../repositories/PlayerRepository';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { InventoryScene } from './InventoryScene';
import { LobbyScene } from './LobbyScene';

interface PreviewSide {
  readonly sprite?: AnimatedSprite;
  readonly aura?: Graphics;
}

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
      calibration,
      isCandidate: false,
    });
    this.createPreviewCard({
      x: 278,
      title: 'AFTER · 교체 외형',
      item: candidate,
      appearance: candidateAppearance,
      sheet: playerSheet,
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
    this.view.addChild(captureBadge, baseline);

    this.createControlGrid(context, candidates, candidate, currentAppearance, candidateAppearance);
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
    this.previewSides.forEach(({ aura }, index) => {
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

    const body = resolveWeaponBodyTextures(
      input.sheet,
      input.appearance.weaponVisualFamily,
      wardrobe.pose,
      wardrobe.direction,
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
      sprite.position.set(input.x + 115, 408);
      const armorScale = input.appearance.armorSilhouette === 'royal'
        ? 1.06
        : input.appearance.armorSilhouette === 'guarded' ? 1.03 : 1;
      sprite.scale.set(2.02 * input.calibration.studioScale * armorScale);
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
        `${input.appearance.costumeLabel} · ${characterCapeStyleLabel(input.appearance.capeStyle)}`,
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

    this.view.addChild(panel, title, aura);
    if (sprite) this.view.addChild(sprite);
    this.view.addChild(info);
    this.previewSides.push({ sprite, aura });
  }

  private createControlGrid(
    context: AppContext,
    candidates: readonly ItemDefinition[],
    candidate: ItemDefinition | undefined,
    currentAppearance: CharacterEquipmentAppearance,
    candidateAppearance: CharacterEquipmentAppearance,
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

    const comparison = new Text({
      text: [
        `교체 변화 · ${currentAppearance.setLabel} → ${candidateAppearance.setLabel}`,
        `무기 모션 · ${weaponVisualFamilyLabel(currentAppearance.weaponVisualFamily)} → ${weaponVisualFamilyLabel(candidateAppearance.weaponVisualFamily)}`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 8, lineHeight: 13, fontWeight: '800' }),
    });
    comparison.position.set(36, 762);

    this.view.addChild(rotateLeft, rotateRight, pose, slot, candidateButton, costume, dye, ...channelButtons, comparison);
  }

  private createStorageControls(context: AppContext): void {
    const state = context.characterWardrobe.current;
    const slots = ([1, 2, 3] as const).map((slotId, index) => {
      const saved = Boolean(state.slots[slotId]);
      const button = new UiButton({
        label: `${slotId} · ${saved ? 'SAVED' : 'EMPTY'}`,
        width: 94,
        height: 36,
        tone: state.selectedSlot === slotId ? 'primary' : 'secondary',
        fontSize: 8,
        onPress: async () => {
          context.characterWardrobe.selectSlot(slotId);
          await context.scenes.change(() => new CharacterWardrobeScene(`외형 슬롯 ${slotId}을 선택했습니다.`));
        },
      });
      button.position.set(36 + index * 100, 792);
      return button;
    });

    const selected = state.slots[state.selectedSlot];
    const selectedInfo = new Text({
      text: `SLOT ${state.selectedSlot} · ${wardrobeSlotUpdatedLabel(selected)}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 8, fontWeight: '800' }),
    });
    selectedInfo.position.set(36, 832);

    const save = new UiButton({
      label: '저장', width: 58, height: 36, tone: 'primary', fontSize: 8,
      onPress: async () => {
        context.characterWardrobe.saveSelectedSlot(context.characterDye.current);
        await context.scenes.change(() => new CharacterWardrobeScene(`SLOT ${state.selectedSlot}에 현재 외형을 저장했습니다.`));
      },
    });
    save.position.set(338, 792);
    const load = new UiButton({
      label: '불러오기', width: 70, height: 36, tone: selected ? 'primary' : 'secondary', fontSize: 8,
      onPress: async () => {
        const preset = context.characterWardrobe.loadSelectedSlot();
        if (preset) context.characterDye.set(preset.dyePreset);
        await context.scenes.change(() => new CharacterWardrobeScene(preset ? '저장 외형을 불러왔습니다.' : '선택 슬롯이 비어 있습니다.'));
      },
    });
    load.position.set(402, 792);

    const recent = state.recentPresets[0];
    const recentButton = new UiButton({
      label: '최근 외형 빠른 적용',
      subtitle: recentPresetUpdatedLabel(recent),
      width: 176,
      height: 42,
      tone: recent ? 'primary' : 'secondary',
      fontSize: 9,
      subtitleFontSize: 7,
      onPress: async () => {
        const preset = context.characterWardrobe.applyRecentPreset(0);
        if (preset) context.characterDye.set(preset.dyePreset);
        await context.scenes.change(() => new CharacterWardrobeScene(preset ? '최근 외형 프리셋을 적용했습니다.' : '최근 외형 프리셋이 없습니다.'));
      },
    });
    recentButton.position.set(298, 828);

    this.view.addChild(...slots, selectedInfo, save, load, recentButton);
  }

  private createBottomActions(context: AppContext): void {
    const inventory = new UiButton({
      label: '장비 보관소',
      width: 232,
      height: 52,
      tone: 'primary',
      fontSize: 13,
      onPress: async () => context.scenes.change(() => new InventoryScene()),
    });
    inventory.position.set(28, 888);
    const back = new UiButton({
      label: '커맨드 허브로 복귀',
      width: 232,
      height: 52,
      tone: 'secondary',
      fontSize: 13,
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(280, 888);
    this.view.addChild(inventory, back);
  }
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

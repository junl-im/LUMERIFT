import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { downloadJson, openJsonFile } from '../core/files/JsonFileTransfer';
import {
  characterCostumeSetLabel,
  characterDirectionLabel,
  characterPresetSortLabel,
  characterShowcasePoseLabel,
  recentPresetUpdatedLabel,
  visibleCharacterAppearancePresets,
  wardrobeArchiveFilename,
} from '../core/presentation/CharacterWardrobeController';
import type { Scene } from '../core/scenes/Scene';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { promptTextValue } from '../ui/TextPromptOverlay';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { CharacterWardrobeScene } from './CharacterWardrobeScene';
import { CharacterAppearanceCloudScene } from './CharacterAppearanceCloudScene';

export class AppearancePresetManagerScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly message = '') {}

  public async enter(context: AppContext): Promise<void> {
    const state = context.characterWardrobe.current;
    const selected = state.recentPresets[state.selectedRecentIndex];
    const visible = visibleCharacterAppearancePresets(state);

    this.view.addChild(createBackground(
      '외형 프리셋 보관소',
      '최근 외형을 검색·정렬하고 이름·즐겨찾기·JSON 백업을 관리합니다.',
    ));
    this.view.addChild(createPanel(18, 164, 504, 650));

    const feedback = createInlineFeedback(
      this.message || '정렬·검색은 로컬 표시 설정입니다. 고정 슬롯은 JSON 가져오기와 실수 덮어쓰기로부터 보호됩니다.',
      this.message ? 'success' : 'neutral',
      468,
    );
    feedback.position.set(36, 176);
    this.view.addChild(feedback);

    const countBadge = createBadge(`PRESET ${visible.length}/${state.recentPresets.length}`, state.recentPresets.length ? 'success' : 'warning');
    countBadge.position.set(36, 226);
    const archiveBadge = createBadge('LOCAL JSON · SAVE v4 분리', 'primary');
    archiveBadge.position.set(166, 226);
    this.view.addChild(countBadge, archiveBadge);

    const sort = new UiButton({
      label: '정렬',
      subtitle: characterPresetSortLabel(state.presetSort),
      width: 112,
      height: 38,
      tone: 'secondary',
      fontSize: 9,
      subtitleFontSize: 7,
      onPress: async () => {
        const mode = context.characterWardrobe.cyclePresetSort();
        await context.scenes.change(() => new AppearancePresetManagerScene(`${characterPresetSortLabel(mode)}으로 정렬했습니다.`));
      },
    });
    sort.position.set(286, 218);

    const search = new UiButton({
      label: state.presetQuery ? '검색 수정' : '검색',
      subtitle: state.presetQuery || '이름·세트',
      width: 106,
      height: 38,
      tone: state.presetQuery ? 'primary' : 'secondary',
      fontSize: 9,
      subtitleFontSize: 7,
      onPress: async () => {
        const value = await promptTextValue({
          title: '외형 프리셋 검색',
          description: '이름·세트·방향·포즈를 검색합니다. 빈 값은 검색 해제입니다.',
          initialValue: state.presetQuery,
          placeholder: '검색어',
        });
        if (value === null) return;
        const query = context.characterWardrobe.setPresetQuery(value);
        await context.scenes.change(() => new AppearancePresetManagerScene(query ? `“${query}” 검색을 적용했습니다.` : '프리셋 검색을 해제했습니다.'));
      },
    });
    search.position.set(404, 218);
    this.view.addChild(sort, search);

    if (!state.recentPresets.length) {
      this.addEmptyText('저장된 최근 외형이 없습니다.\n캐릭터 아틀리에에서 외형을 조정하거나 슬롯에 저장하세요.');
    } else if (!visible.length) {
      this.addEmptyText(`“${state.presetQuery}” 검색 결과가 없습니다.\n검색 버튼에서 빈 값을 입력하면 전체 목록으로 돌아갑니다.`);
    } else {
      visible.forEach(({ preset, sourceIndex }, index) => {
        const active = sourceIndex === state.selectedRecentIndex;
        const button = new UiButton({
          label: `${preset.favorite ? '★ ' : ''}${preset.name}`,
          subtitle: `${characterCostumeSetLabel(preset.costumeSet)} · ${characterDirectionLabel(preset.direction)} · ${characterShowcasePoseLabel(preset.pose)}`,
          width: 468,
          height: 58,
          tone: active ? 'primary' : 'secondary',
          fontSize: 11,
          subtitleFontSize: 8,
          onPress: async () => {
            context.characterWardrobe.selectRecentPreset(sourceIndex);
            await context.scenes.change(() => new AppearancePresetManagerScene(`${preset.name} 프리셋을 선택했습니다.`));
          },
        });
        button.position.set(36, 270 + index * 64);
        this.view.addChild(button);
      });
    }

    const selectedInfo = new Text({
      text: selected
        ? `SELECTED · ${recentPresetUpdatedLabel(selected)}\n저장 ${new Date(selected.savedAt).toLocaleString('ko-KR')}`
        : 'SELECTED · 없음',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 9, lineHeight: 14, fontWeight: '800' }),
    });
    selectedInfo.position.set(36, 602);
    this.view.addChild(selectedInfo);

    const apply = new UiButton({
      label: '선택 프리셋 적용', width: 148, height: 44, tone: selected ? 'primary' : 'secondary', fontSize: 10,
      onPress: async () => {
        const preset = context.characterWardrobe.applyRecentPreset();
        if (preset) context.characterDye.set(preset.dyePreset);
        await context.scenes.change(() => new CharacterWardrobeScene(preset ? `${preset.name} 프리셋을 적용했습니다.` : '적용할 프리셋이 없습니다.'));
      },
    });
    apply.position.set(36, 648);

    const favorite = new UiButton({
      label: selected?.favorite ? '즐겨찾기 해제' : '즐겨찾기', width: 148, height: 44, tone: selected?.favorite ? 'primary' : 'secondary', fontSize: 10,
      onPress: async () => {
        const updated = context.characterWardrobe.toggleRecentFavorite(state.selectedRecentIndex);
        await context.scenes.change(() => new AppearancePresetManagerScene(updated ? `${updated.name} 즐겨찾기를 ${updated.favorite ? '설정' : '해제'}했습니다.` : '선택 프리셋이 없습니다.'));
      },
    });
    favorite.position.set(196, 648);

    const rename = new UiButton({
      label: '이름 변경', width: 148, height: 44, tone: 'secondary', fontSize: 10,
      onPress: async () => {
        if (!selected) {
          await context.scenes.change(() => new AppearancePresetManagerScene('이름을 변경할 프리셋이 없습니다.'));
          return;
        }
        const value = await promptTextValue({
          title: '외형 프리셋 이름',
          description: '24자 이내로 프리셋 이름을 입력하세요.',
          initialValue: selected.name,
          placeholder: '외형 프리셋',
        });
        if (value === null) return;
        const updated = context.characterWardrobe.renameRecentPreset(state.selectedRecentIndex, value);
        await context.scenes.change(() => new AppearancePresetManagerScene(updated ? `${updated.name}(으)로 이름을 변경했습니다.` : '이름 변경에 실패했습니다.'));
      },
    });
    rename.position.set(356, 648);

    const exportButton = new UiButton({
      label: 'JSON 내보내기', width: 148, height: 44, tone: 'secondary', fontSize: 10,
      onPress: async () => {
        downloadJson(wardrobeArchiveFilename(), context.characterWardrobe.exportPresetArchive());
        await context.scenes.change(() => new AppearancePresetManagerScene('외형 프리셋 JSON을 저장했습니다.'));
      },
    });
    exportButton.position.set(36, 700);

    const importButton = new UiButton({
      label: 'JSON 가져오기', width: 148, height: 44, tone: 'secondary', fontSize: 10,
      onPress: async () => {
        try {
          const value = await openJsonFile();
          if (value === null) return;
          const imported = context.characterWardrobe.importPresetArchive(value);
          await context.scenes.change(() => new AppearancePresetManagerScene(imported ? `${imported}개 외형 항목을 가져왔습니다.` : '올바른 LUMERIFT 외형 프리셋 JSON이 아닙니다.'));
        } catch (error: unknown) {
          await context.scenes.change(() => new AppearancePresetManagerScene(error instanceof Error ? error.message : 'JSON 가져오기에 실패했습니다.'));
        }
      },
    });
    importButton.position.set(196, 700);

    const remove = new UiButton({
      label: '목록에서 삭제', width: 148, height: 44, tone: 'secondary', fontSize: 10,
      onPress: async () => {
        const deleted = context.characterWardrobe.deleteRecentPreset(state.selectedRecentIndex);
        await context.scenes.change(() => new AppearancePresetManagerScene(deleted ? `${deleted.name} 프리셋을 최근 목록에서 삭제했습니다.` : '삭제할 프리셋이 없습니다.'));
      },
    });
    remove.position.set(356, 700);

    const cloud = new UiButton({
      label: '외형 프리셋 Cloud Save',
      subtitle: '수동 동의 · UID 격리 · 충돌 복구',
      width: 468,
      height: 48,
      tone: context.characterAppearanceCloud.state(context.auth.currentSession?.uid ?? '').optIn ? 'primary' : 'secondary',
      fontSize: 11,
      subtitleFontSize: 8,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceCloudScene()),
    });
    cloud.position.set(36, 758);

    const back = new UiButton({
      label: '캐릭터 아틀리에로 복귀', width: 476, height: 54, tone: 'primary', fontSize: 13,
      onPress: async () => context.scenes.change(() => new CharacterWardrobeScene()),
    });
    back.position.set(32, 844);

    this.view.addChild(apply, favorite, rename, exportButton, importButton, remove, cloud, back);
  }

  public async exit(): Promise<void> {}

  public update(): void {}

  private addEmptyText(text: string): void {
    const empty = new Text({
      text,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 13, lineHeight: 22, fontWeight: '700', align: 'center' }),
    });
    empty.anchor.set(0.5);
    empty.position.set(270, 438);
    this.view.addChild(empty);
  }
}

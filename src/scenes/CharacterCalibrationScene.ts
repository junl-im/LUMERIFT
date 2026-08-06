import { Container, Sprite, Text, TextStyle, type Spritesheet } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { ASSET_PATHS, PREMIUM_SUPPORT_UI_BUNDLE } from '../core/assets/AssetCatalog';
import { downloadJson } from '../core/files/JsonFileTransfer';
import { openCharacterCaptureEvidencePackage, openCharacterCaptureFiles } from '../core/files/CharacterCaptureEvidenceTransfer';
import {
  characterCalibrationStatusLabel,
  resolveCharacterDisplayCalibration,
  resolveCharacterDisplayPlatform,
} from '../core/performance/CharacterDisplayCalibration';
import {
  clearCharacterDisplayCaptureEvidence,
  createCharacterDisplayCaptureTemplate,
  importCharacterDisplayCaptureEvidence,
  loadCharacterDisplayCaptureEvidence,
  type PhysicalCapturePlatform,
} from '../core/performance/CharacterDisplayCalibrationStore';
import type { Scene } from '../core/scenes/Scene';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { PREMIUM_UI_ICON_V18_KEYS, premiumUiV18Texture } from '../ui/PremiumUiIconArtV18';
import { PREMIUM_SUPPORT_UI_V20_KEYS, premiumSupportUiTextureV20 } from '../ui/PremiumSupportUiV20';
import { PREMIUM_SUPPORT_UI_V21_KEYS, premiumSupportUiTextureV21 } from '../ui/PremiumSupportUiV21';
import { CharacterWardrobeScene } from './CharacterWardrobeScene';

export class CharacterCalibrationScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly message = '') {}

  public async enter(context: AppContext): Promise<void> {
    await context.assets.loadBundle(PREMIUM_SUPPORT_UI_BUNDLE);
    const detected = resolveCharacterDisplayPlatform();
    const profile = resolveCharacterDisplayCalibration();
    const androidEvidence = loadCharacterDisplayCaptureEvidence('android-chrome');
    const iosEvidence = loadCharacterDisplayCaptureEvidence('ios-safari');

    this.view.addChild(createBackground(
      '캐릭터 실기기 보정 관리',
      '물리 단말 캡처 증빙이 포함된 승인 JSON만 런타임 보정값으로 적용합니다.',
    ));
    this.view.addChild(createPanel(18, 164, 504, 650));
    const mobileTexture = premiumSupportUiTextureV21(
      context.assets.get<Spritesheet>(ASSET_PATHS.premiumSupportUiV21Atlas),
      PREMIUM_SUPPORT_UI_V21_KEYS.verified,
    ) ?? premiumSupportUiTextureV20(
      context.assets.get<Spritesheet>(ASSET_PATHS.premiumSupportUiV20Atlas),
      PREMIUM_SUPPORT_UI_V20_KEYS.mobileVerify,
    ) ?? premiumUiV18Texture(
      context.assets.get<Spritesheet>(ASSET_PATHS.premiumUiIconsV18Atlas),
      PREMIUM_UI_ICON_V18_KEYS.mobileQa,
    );
    if (mobileTexture) {
      const icon = new Sprite(mobileTexture);
      icon.anchor.set(0.5);
      icon.position.set(486, 108);
      icon.scale.set(0.34);
      icon.alpha = 0.9;
      this.view.addChild(icon);
    }

    const feedback = createInlineFeedback(
      this.message || '템플릿을 내려받아 실제 Android Chrome·iOS Safari 캡처를 비교한 뒤 승인 정보를 채우세요.',
      this.message ? 'success' : 'neutral',
      468,
    );
    feedback.position.set(36, 176);
    this.view.addChild(feedback);

    const currentBadge = createBadge(`${profile.label} · ${characterCalibrationStatusLabel(profile)}`, profile.captureStatus === 'capture-verified' ? 'success' : 'warning');
    currentBadge.position.set(36, 226);
    const detectedBadge = createBadge(`DETECTED · ${detected.toUpperCase()}`, 'primary');
    detectedBadge.position.set(280, 226);
    this.view.addChild(currentBadge, detectedBadge);

    const summary = new Text({
      text: [
        `현재 기준 · ${profile.baseline}`,
        `스튜디오 ${percent(profile.studioScale)} · 전투 ${percent(profile.battleScale)}`,
        `오라 ${percent(profile.auraMultiplier)} · 오버레이 ${percent(profile.overlayMultiplier)}`,
        '',
        `Android 승인 · ${evidenceLabel(androidEvidence)}`,
        `iOS 승인 · ${evidenceLabel(iosEvidence)}`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.text, fontSize: 12, lineHeight: 22, fontWeight: '800' }),
    });
    summary.position.set(42, 286);
    this.view.addChild(summary);

    const warning = new Text({
      text: '승인 조건\n• approved=true\n• 2개 이상의 실제 캡처 파일 참조\n• 검토자·촬영 시각·CSS viewport·DPR 기록\n• 허용 범위 안의 크기·발광 보정값',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10, lineHeight: 18, fontWeight: '700' }),
    });
    warning.position.set(42, 444);
    this.view.addChild(warning);

    const androidTemplate = new UiButton({
      label: 'Android 캡처 템플릿',
      subtitle: '412×915 · DPR 2.625 기준',
      width: 226,
      height: 52,
      tone: 'secondary',
      fontSize: 10,
      subtitleFontSize: 8,
      onPress: async () => {
        try {
          const screenshots = await openCharacterCaptureFiles();
          if (!screenshots) return;
          const baseline = resolveCharacterDisplayCalibration('Mozilla/5.0 (Linux; Android 15) Chrome/140 Mobile Safari/537.36', undefined);
          const template = createCharacterDisplayCaptureTemplate('android-chrome', baseline);
          downloadJson('LUMERIFT_ANDROID_CHARACTER_CAPTURE_TEMPLATE.json', { ...template, screenshots });
          await context.scenes.change(() => new CharacterCalibrationScene('Android 캡처 SHA-256이 포함된 승인 템플릿을 저장했습니다.'));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterCalibrationScene(error instanceof Error ? error.message : 'Android 캡처 해시 생성에 실패했습니다.'));
        }
      },
    });
    androidTemplate.position.set(36, 566);

    const iosTemplate = new UiButton({
      label: 'iOS 캡처 템플릿',
      subtitle: '390×844 · DPR 3 기준',
      width: 226,
      height: 52,
      tone: 'secondary',
      fontSize: 10,
      subtitleFontSize: 8,
      onPress: async () => {
        try {
          const screenshots = await openCharacterCaptureFiles();
          if (!screenshots) return;
          const baseline = resolveCharacterDisplayCalibration('Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1', undefined);
          const template = createCharacterDisplayCaptureTemplate('ios-safari', baseline);
          downloadJson('LUMERIFT_IOS_CHARACTER_CAPTURE_TEMPLATE.json', { ...template, screenshots });
          await context.scenes.change(() => new CharacterCalibrationScene('iOS 캡처 SHA-256이 포함된 승인 템플릿을 저장했습니다.'));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterCalibrationScene(error instanceof Error ? error.message : 'iOS 캡처 해시 생성에 실패했습니다.'));
        }
      },
    });
    iosTemplate.position.set(278, 566);

    const importButton = new UiButton({
      label: '승인 JSON 가져오기',
      subtitle: '증빙 검증 후 해당 플랫폼에 적용',
      width: 226,
      height: 52,
      tone: 'primary',
      fontSize: 10,
      subtitleFontSize: 8,
      onPress: async () => {
        try {
          const packageValue = await openCharacterCaptureEvidencePackage();
          if (packageValue === null) return;
          const evidence = importCharacterDisplayCaptureEvidence(packageValue.jsonValue, packageValue.verifiedFiles);
          await context.scenes.change(() => new CharacterCalibrationScene(
            evidence
              ? `${platformLabel(evidence.platform)} SHA-256 검증 승인값을 적용했습니다.`
              : 'JSON과 선택한 캡처 파일의 이름·SHA-256·크기·해상도가 일치하지 않습니다.',
          ));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterCalibrationScene(error instanceof Error ? error.message : '승인 JSON 가져오기에 실패했습니다.'));
        }
      },
    });
    importButton.position.set(36, 630);

    const clearButton = new UiButton({
      label: '로컬 승인값 초기화',
      subtitle: 'Android·iOS 기준 프로필로 복귀',
      width: 226,
      height: 52,
      tone: androidEvidence || iosEvidence ? 'secondary' : 'secondary',
      fontSize: 10,
      subtitleFontSize: 8,
      onPress: async () => {
        clearCharacterDisplayCaptureEvidence('android-chrome');
        clearCharacterDisplayCaptureEvidence('ios-safari');
        await context.scenes.change(() => new CharacterCalibrationScene('로컬 실기기 승인값을 초기화했습니다.'));
      },
    });
    clearButton.position.set(278, 630);

    const exportCurrent = new UiButton({
      label: '현재 승인값 내보내기',
      subtitle: '감사·인수인계용 JSON',
      width: 226,
      height: 52,
      tone: androidEvidence || iosEvidence ? 'secondary' : 'secondary',
      fontSize: 10,
      subtitleFontSize: 8,
      onPress: async () => {
        const platform = preferredEvidencePlatform(detected, androidEvidence, iosEvidence);
        const evidence = platform ? loadCharacterDisplayCaptureEvidence(platform) : undefined;
        if (!platform || !evidence) {
          await context.scenes.change(() => new CharacterCalibrationScene('내보낼 승인값이 없습니다.'));
          return;
        }
        downloadJson(`LUMERIFT_${platform.toUpperCase()}_CHARACTER_CAPTURE_APPROVED.json`, evidence);
        await context.scenes.change(() => new CharacterCalibrationScene(`${platformLabel(platform)} 승인값을 저장했습니다.`));
      },
    });
    exportCurrent.position.set(36, 694);

    const back = new UiButton({
      label: '캐릭터 아틀리에로 복귀',
      width: 226,
      height: 52,
      tone: 'primary',
      fontSize: 12,
      onPress: async () => context.scenes.change(() => new CharacterWardrobeScene()),
    });
    back.position.set(278, 694);

    this.view.addChild(androidTemplate, iosTemplate, importButton, clearButton, exportCurrent, back);
  }

  public async exit(): Promise<void> {}

  public update(): void {}
}

function evidenceLabel(value: ReturnType<typeof loadCharacterDisplayCaptureEvidence>): string {
  if (!value) return 'PENDING';
  return `${value.reviewer} · ${new Date(value.capturedAt).toLocaleDateString('ko-KR')} · SHA-256 ${value.screenshots.length} captures`;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function platformLabel(platform: PhysicalCapturePlatform): string {
  return platform === 'android-chrome' ? 'Android Chrome' : 'iOS Safari';
}

function preferredEvidencePlatform(
  detected: string,
  android: ReturnType<typeof loadCharacterDisplayCaptureEvidence>,
  ios: ReturnType<typeof loadCharacterDisplayCaptureEvidence>,
): PhysicalCapturePlatform | undefined {
  if (detected === 'android-chrome' && android) return 'android-chrome';
  if (detected === 'ios-safari' && ios) return 'ios-safari';
  if (android) return 'android-chrome';
  if (ios) return 'ios-safari';
  return undefined;
}

import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { BRAND } from '../app/brand';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import { createRasterPanel, getSceneBackgroundTexture } from './UiSkin';
import { createGlowDivider } from './UiTheme';
import { createComicTag, createFeatureMarquee, createInterfaceBackdrop, createInterfaceStamp } from './InterfaceChrome';

export function createBackground(title: string, subtitle: string): Container {
  const root = new Container();
  const texture = getSceneBackgroundTexture();
  if (texture) {
    const backdrop = new Sprite(texture);
    backdrop.width = DESIGN_WIDTH;
    backdrop.height = DESIGN_HEIGHT;
    root.addChild(backdrop);
  } else {
    root.addChild(new Graphics().rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT).fill(COLORS.background));
  }

  const interfaceBackdrop = createInterfaceBackdrop({ dense: false, label: `${BRAND.title} · ${title.toUpperCase()}` });
  const shade = new Graphics()
    .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    .fill({ color: COLORS.dark, alpha: 0.56 })
    .rect(0, 0, DESIGN_WIDTH, 166)
    .fill({ color: 0x071824, alpha: 0.48 })
    .rect(0, 0, DESIGN_WIDTH, 2)
    .fill({ color: COLORS.paper, alpha: 0.16 })
    .rect(0, 746, DESIGN_WIDTH, 214)
    .fill({ color: COLORS.dark, alpha: 0.38 });
  const aura = new Graphics()
    .circle(474, 86, 188)
    .fill({ color: COLORS.primaryBright, alpha: 0.075 })
    .circle(74, 752, 210)
    .fill({ color: COLORS.warning, alpha: 0.05 })
    .circle(90, 150, 118)
    .fill({ color: COLORS.accent, alpha: 0.038 });
  const burstLines = new Graphics()
    .moveTo(330, 44)
    .lineTo(505, 116)
    .stroke({ color: COLORS.warning, alpha: 0.16, width: 2 })
    .moveTo(342, 62)
    .lineTo(492, 136)
    .stroke({ color: COLORS.primaryBright, alpha: 0.14, width: 1.5 });
  const top = createRasterPanel(18, 48, DESIGN_WIDTH - 36, 102, 'panel_strong');
  const headerSlash = new Graphics()
    .moveTo(28, 54)
    .lineTo(106, 54)
    .lineTo(90, 66)
    .lineTo(28, 66)
    .closePath()
    .fill({ color: COLORS.primaryBright, alpha: 0.28 })
    .moveTo(DESIGN_WIDTH - 112, 132)
    .lineTo(DESIGN_WIDTH - 28, 132)
    .stroke({ color: COLORS.warning, alpha: 0.38, width: 2 });

  const brand = new Text({
    text: `${BRAND.title} // RIFT PANEL`,
    style: new TextStyle({ fill: 0xeff7f4, fontSize: 9, fontWeight: '800', letterSpacing: 1.85 }),
  });
  brand.position.set(38, 58);
  const heading = new Text({
    text: title,
    style: new TextStyle({
      fill: 0xffedb9,
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: 0.65,
      dropShadow: { color: COLORS.dark, alpha: 0.78, blur: 4, distance: 1 },
    }),
  });
  heading.position.set(36, 76);
  const description = new Text({
    text: subtitle,
    style: new TextStyle({ fill: 0xc7d8d6, fontSize: 11, lineHeight: 15, fontWeight: '700', wordWrap: true, wordWrapWidth: 268 }),
  });
  description.position.set(38, 115);
  const stamp = createInterfaceStamp('CHAPTER CORE', 124);
  stamp.position.set(382, 58);
  const updateTag = createComicTag('LIVE RENEWAL', 0xf0ca78);
  updateTag.position.set(382, 94);
  const headlineMarquee = createFeatureMarquee('WEBTOON CLEAN', '말풍선형 강조 카드와 선명한 잉크 라인으로 화면 인상을 정리했습니다.', 178);
  headlineMarquee.position.set(334, 128);
  headlineMarquee.scale.set(0.78);
  const divider = createGlowDivider(462);
  divider.position.set(39, 143);

  root.addChild(interfaceBackdrop, shade, aura, burstLines, top, headerSlash, brand, heading, description, stamp, updateTag, headlineMarquee, divider);
  return root;
}

export function createPanel(x: number, y: number, width: number, height: number): Container {
  return createRasterPanel(x, y, width, height, 'panel');
}

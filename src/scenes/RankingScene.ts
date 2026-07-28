import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { calculateTotalPower, ensureStarterInventory } from '../game/items/inventoryLogic';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import type { RankingBoard, RankingEntry, RankingSnapshot, RankingSubmission } from '../services/ranking/RankingService';
import { seasonRangeLabel } from '../services/ranking/seasonLogic';
import { createBackground } from '../ui/SceneChrome';
import { createRasterPanel } from '../ui/UiSkin';
import { createBadge } from '../ui/PremiumUi';
import { UiButton } from '../ui/UiButton';
import { AccountScene } from './AccountScene';
import { LobbyScene } from './LobbyScene';

export class RankingScene implements Scene {
  public readonly view = new Container();
  private profile?: PlayerProfile;

  public constructor(private readonly board: RankingBoard = 'overall', private readonly message = '') {}

  public async enter(context: AppContext): Promise<void> {
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const loaded = await context.playerRepository.load(session.uid) ?? createDefaultProfile(session.uid, session.displayName);
    this.profile = ensureStarterInventory(loaded, context.gameData);
    const submission = createSubmission(this.profile, calculateTotalPower(context.gameData.player, this.profile, context.gameData));

    this.view.addChild(createBackground('균열 랭킹', '전체·주간·28일 시즌 순위를 확인합니다.'));
    this.createTabs(context);
    const panel = createRasterPanel(24, 236, 492, 586, 'panel_strong');
    this.view.addChild(panel);

    try {
      await context.ranking.publish(submission);
      const snapshot = await context.ranking.load(this.board, submission, 12);
      this.createSummary(snapshot);
      this.createRows(snapshot.entries);
    } catch (error: unknown) {
      this.createError(error);
    }

    if (this.message) {
      const toast = new Text({ text: this.message, style: new TextStyle({ fill: 0xf2d58a, fontSize: 11, align: 'center' }) });
      toast.anchor.set(0.5, 0);
      toast.position.set(270, 836);
      this.view.addChild(toast);
    }

    const account = new UiButton({ label: '계정 관리', width: 234, height: 54, tone: 'secondary', onPress: async () => context.scenes.change(() => new AccountScene()) });
    account.position.set(28, 884);
    const back = new UiButton({ label: '거점 복귀', width: 234, height: 54, tone: 'secondary', onPress: async () => context.scenes.change(() => new LobbyScene()) });
    back.position.set(278, 884);
    this.view.addChild(account, back);
  }

  public exit(): void {}
  public update(): void {}

  private createTabs(context: AppContext): void {
    const overall = new UiButton({
      label: '전체', width: 146, height: 58, tone: this.board === 'overall' ? 'primary' : 'secondary',
      onPress: async () => context.scenes.change(() => new RankingScene('overall')),
    });
    overall.position.set(28, 158);
    const weekly = new UiButton({
      label: '주간', width: 146, height: 58, tone: this.board === 'weekly' ? 'primary' : 'secondary',
      onPress: async () => context.scenes.change(() => new RankingScene('weekly')),
    });
    weekly.position.set(197, 158);
    const season = new UiButton({
      label: '시즌', width: 146, height: 58, tone: this.board === 'season' ? 'primary' : 'secondary',
      onPress: async () => context.scenes.change(() => new RankingScene('season')),
    });
    season.position.set(366, 158);
    this.view.addChild(overall, weekly, season);
  }

  private createSummary(snapshot: RankingSnapshot): void {
    const title = new Text({
      text: snapshot.board === 'weekly'
        ? `WEEK ${snapshot.weekKey}`
        : snapshot.board === 'season' && snapshot.season
          ? `${snapshot.season.label} · ${seasonRangeLabel(snapshot.season)}`
          : 'ALL TIME',
      style: new TextStyle({ fill: 0xf2d58a, fontSize: 12, fontWeight: '700', letterSpacing: 1 }),
    });
    title.position.set(44, 256);
    const my = createBadge(snapshot.myRank ? `MY RANK #${snapshot.myRank}` : 'MY RANK 집계 중', snapshot.myRank && snapshot.myRank <= 10 ? 'success' : 'warning');
    my.position.set(336, 250);
    const source = new Text({
      text: snapshot.source === 'firestore' ? 'Firestore 스냅샷 · 실시간 리스너 미사용' : '로컬 폴백',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10 }),
    });
    source.position.set(44, 284);
    this.view.addChild(title, my, source);
  }

  private createRows(entries: readonly RankingEntry[]): void {
    if (entries.length === 0) {
      const empty = new Text({ text: '등록된 랭킹이 없습니다.', style: new TextStyle({ fill: COLORS.muted, fontSize: 15 }) });
      empty.anchor.set(0.5);
      empty.position.set(270, 520);
      this.view.addChild(empty);
      return;
    }
    entries.slice(0, 10).forEach((entry, index) => {
      const y = 314 + index * 48;
      const panel = createRasterPanel(38, y, 464, 42, entry.isMe ? 'slot_selected' : 'slot');
      const rank = new Text({ text: `#${entry.rank}`, style: new TextStyle({ fill: entry.rank <= 3 ? 0xf2d58a : COLORS.muted, fontSize: 14, fontWeight: '700' }) });
      rank.position.set(53, y + 11);
      const name = new Text({ text: entry.nickname, style: new TextStyle({ fill: entry.isMe ? 0xf3dc9d : COLORS.text, fontSize: 13, fontWeight: entry.isMe ? '700' : '500' }) });
      name.position.set(102, y + 11);
      const stage = new Text({ text: `ST ${entry.stage}`, style: new TextStyle({ fill: COLORS.muted, fontSize: 11 }) });
      stage.position.set(310, y + 13);
      const score = new Text({ text: entry.score.toLocaleString(), style: new TextStyle({ fill: 0x85d5c0, fontSize: 13, fontWeight: '700' }) });
      score.anchor.set(1, 0);
      score.position.set(482, y + 11);
      this.view.addChild(panel, rank, name, stage, score);
    });
  }

  private createError(error: unknown): void {
    const title = new Text({ text: '랭킹을 불러오지 못했습니다.', style: new TextStyle({ fill: 0xe89a86, fontSize: 18, fontWeight: '700' }) });
    title.position.set(46, 276);
    const detail = new Text({
      text: error instanceof Error ? error.message : 'Firestore 연결 또는 색인 상태를 확인해 주세요.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, wordWrap: true, wordWrapWidth: 430 }),
    });
    detail.position.set(46, 316);
    this.view.addChild(title, detail);
  }
}

function createSubmission(profile: PlayerProfile, power: number): RankingSubmission {
  return {
    uid: profile.uid,
    nickname: profile.nickname,
    score: Math.max(0, Math.round(power)),
    stage: Math.max(1, profile.highestStage),
    level: Math.max(1, profile.level),
  };
}

import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Firestore,
  type QueryConstraint,
} from 'firebase/firestore';
import { currentWeekKey } from './rankingLogic';
import { resolveRankingSeason, type RankingSeason } from './seasonLogic';

export type RankingBoard = 'overall' | 'weekly' | 'season';

export interface RankingSubmission {
  readonly uid: string;
  readonly nickname: string;
  readonly score: number;
  readonly stage: number;
  readonly level: number;
}

export interface RankingEntry extends RankingSubmission {
  readonly rank: number;
  readonly weekKey?: string;
  readonly seasonId?: string;
  readonly isMe: boolean;
}

export interface RankingSnapshot {
  readonly board: RankingBoard;
  readonly weekKey?: string;
  readonly season?: RankingSeason;
  readonly entries: readonly RankingEntry[];
  readonly myRank?: number;
  readonly loadedAt: number;
  readonly source: 'firestore' | 'local';
}

export class RankingService {
  public constructor(private readonly db?: Firestore) {}

  public async publish(submission: RankingSubmission): Promise<void> {
    if (!this.db) return;
    const payload = normalizeSubmission(submission);
    const weekKey = currentWeekKey();
    const season = resolveRankingSeason();
    await Promise.all([
      setDoc(doc(this.db, 'rankings', payload.uid), {
        ...payload,
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(doc(this.db, 'weeklyRankings', `${weekKey}_${payload.uid}`), {
        ...payload,
        weekKey,
        updatedAt: serverTimestamp(),
      }, { merge: true }),
      setDoc(doc(this.db, 'seasonRankings', `${season.id}_${payload.uid}`), {
        ...payload,
        seasonId: season.id,
        updatedAt: serverTimestamp(),
      }, { merge: true }),
    ]);
  }

  public async load(board: RankingBoard, my: RankingSubmission, count = 20): Promise<RankingSnapshot> {
    if (!this.db) return localRanking(board, my);
    const weekKey = board === 'weekly' ? currentWeekKey() : undefined;
    const season = board === 'season' ? resolveRankingSeason() : undefined;
    const base = board === 'overall'
      ? collection(this.db, 'rankings')
      : board === 'weekly'
        ? collection(this.db, 'weeklyRankings')
        : collection(this.db, 'seasonRankings');
    const constraints: QueryConstraint[] = [];
    if (weekKey) constraints.push(where('weekKey', '==', weekKey));
    if (season) constraints.push(where('seasonId', '==', season.id));
    constraints.push(orderBy('stage', 'desc'), orderBy('score', 'desc'), limit(Math.max(1, Math.min(50, count))));

    const snapshot = await getDocs(query(base, ...constraints));
    const entries = snapshot.docs.map((entry: { data(): Record<string, unknown> }, index: number): RankingEntry => {
      const value = entry.data() as Record<string, unknown>;
      return {
        uid: stringValue(value.uid),
        nickname: stringValue(value.nickname, '계승자'),
        score: integerValue(value.score),
        stage: Math.max(1, integerValue(value.stage, 1)),
        level: Math.max(1, integerValue(value.level, 1)),
        weekKey: typeof value.weekKey === 'string' ? value.weekKey : undefined,
        seasonId: typeof value.seasonId === 'string' ? value.seasonId : undefined,
        rank: index + 1,
        isMe: value.uid === my.uid,
      };
    });
    const myRank = await this.calculateRank(board, normalizeSubmission(my));
    return { board, weekKey, season, entries, myRank, loadedAt: Date.now(), source: 'firestore' };
  }

  private async calculateRank(board: RankingBoard, my: RankingSubmission): Promise<number | undefined> {
    if (!this.db) return 1;
    const collectionRef = board === 'overall'
      ? collection(this.db, 'rankings')
      : board === 'weekly'
        ? collection(this.db, 'weeklyRankings')
        : collection(this.db, 'seasonRankings');
    const prefix = board === 'weekly'
      ? [where('weekKey', '==', currentWeekKey())]
      : board === 'season'
        ? [where('seasonId', '==', resolveRankingSeason().id)]
        : [];
    const higherStage = query(collectionRef, ...prefix, where('stage', '>', my.stage));
    const sameStageHigherScore = query(
      collectionRef,
      ...prefix,
      where('stage', '==', my.stage),
      where('score', '>', my.score),
    );
    try {
      const [stageCount, scoreCount] = await Promise.all([
        getCountFromServer(higherStage),
        getCountFromServer(sameStageHigherScore),
      ]);
      return stageCount.data().count + scoreCount.data().count + 1;
    } catch (error: unknown) {
      console.warn('[Ranking] 내 순위 집계에 실패했습니다.', error);
      return undefined;
    }
  }
}

function normalizeSubmission(value: RankingSubmission): RankingSubmission {
  return {
    uid: value.uid,
    nickname: value.nickname.trim().slice(0, 24) || '계승자',
    score: Math.max(0, Math.min(999_999_999, Math.floor(value.score))),
    stage: Math.max(1, Math.min(999, Math.floor(value.stage))),
    level: Math.max(1, Math.min(999, Math.floor(value.level))),
  };
}

function localRanking(board: RankingBoard, my: RankingSubmission): RankingSnapshot {
  const weekKey = board === 'weekly' ? currentWeekKey() : undefined;
  const season = board === 'season' ? resolveRankingSeason() : undefined;
  return {
    board,
    weekKey,
    season,
    entries: [{
      ...normalizeSubmission(my),
      rank: 1,
      isMe: true,
      weekKey,
      seasonId: season?.id,
    }],
    myRank: 1,
    loadedAt: Date.now(),
    source: 'local',
  };
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function integerValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : fallback;
}

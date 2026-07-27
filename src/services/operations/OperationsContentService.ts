import { collection, getDocs, limit, orderBy, query, where, type Firestore, type Timestamp } from 'firebase/firestore';
import { NOTICES } from '../../game/operations/operationsData';
import type { NoticeDefinition } from '../../game/operations/operationsTypes';

const CACHE_KEY = 'lumerift.remote.notices.v1';
const CACHE_TTL_MS = 15 * 60 * 1000;

interface NoticeCache {
  readonly cachedAt: number;
  readonly notices: NoticeDefinition[];
}

export class OperationsContentService {
  public constructor(private readonly db?: Firestore) {}

  public async loadNotices(): Promise<readonly NoticeDefinition[]> {
    const cached = readCache();
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return cached.notices;
    if (!this.db) return cached?.notices ?? NOTICES;

    try {
      const snapshot = await getDocs(query(
        collection(this.db, 'notices'),
        where('published', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(10),
      ));
      const notices = snapshot.docs.map((entry: { id: string; data(): Record<string, unknown> }) => parseNotice(entry.id, entry.data())).filter(isNotice);
      if (notices.length === 0) return cached?.notices ?? NOTICES;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ cachedAt: Date.now(), notices } satisfies NoticeCache));
      return notices;
    } catch (error: unknown) {
      console.warn('[Operations] 원격 공지를 불러오지 못해 캐시/내장 공지를 사용합니다.', error);
      return cached?.notices ?? NOTICES;
    }
  }
}

function parseNotice(id: string, raw: Record<string, unknown>): NoticeDefinition | null {
  if (typeof raw.title !== 'string' || typeof raw.summary !== 'string' || typeof raw.body !== 'string') return null;
  return {
    id,
    title: raw.title.slice(0, 60),
    summary: raw.summary.slice(0, 180),
    body: raw.body.slice(0, 1200),
    publishedAt: toDateKey(raw.publishedAt),
    important: raw.important === true,
  };
}

function toDateKey(value: unknown): string {
  if (typeof value === 'string') return value.slice(0, 10);
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function isNotice(value: NoticeDefinition | null): value is NoticeDefinition {
  return value !== null;
}

function readCache(): NoticeCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NoticeCache;
    return Array.isArray(parsed.notices) && typeof parsed.cachedAt === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

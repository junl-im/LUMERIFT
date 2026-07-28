export interface RankingSeason {
  readonly id: string;
  readonly number: number;
  readonly label: string;
  readonly startsAt: number;
  readonly endsAt: number;
  readonly startKey: string;
  readonly endKey: string;
}

const DAY_MS = 86_400_000;
const SEASON_LENGTH_DAYS = 28;
const SEASON_EPOCH = Date.UTC(2026, 6, 6, 0, 0, 0, 0);

export function resolveRankingSeason(date = new Date()): RankingSeason {
  const now = date.getTime();
  const elapsed = Math.max(0, now - SEASON_EPOCH);
  const number = Math.floor(elapsed / (SEASON_LENGTH_DAYS * DAY_MS)) + 1;
  const startsAt = SEASON_EPOCH + (number - 1) * SEASON_LENGTH_DAYS * DAY_MS;
  const endsAt = startsAt + SEASON_LENGTH_DAYS * DAY_MS - 1;
  const startKey = dayKey(startsAt);
  const endKey = dayKey(endsAt);
  return {
    id: `S${String(number).padStart(2, '0')}_${startKey}`,
    number,
    label: `균열 시즌 ${number}`,
    startsAt,
    endsAt,
    startKey,
    endKey,
  };
}

export function seasonRangeLabel(season: RankingSeason): string {
  return `${season.startKey.replaceAll('-', '.')} – ${season.endKey.replaceAll('-', '.')}`;
}

function dayKey(value: number): string {
  return new Date(value).toISOString().slice(0, 10);
}

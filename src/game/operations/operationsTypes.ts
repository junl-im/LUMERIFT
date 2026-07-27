export interface OperationReward {
  readonly gold: number;
  readonly itemIds: readonly string[];
}

export interface NoticeDefinition {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly publishedAt: string;
  readonly important: boolean;
}

export interface AttendanceRewardDefinition {
  readonly day: number;
  readonly label: string;
  readonly icon: string;
  readonly reward: OperationReward;
}

export interface MailDefinition {
  readonly id: string;
  readonly sender: string;
  readonly title: string;
  readonly body: string;
  readonly expiresAt: string;
  readonly reward: OperationReward;
}

export interface CouponDefinition {
  readonly code: string;
  readonly title: string;
  readonly expiresAt: string;
  readonly reward: OperationReward;
}

export interface PlayerOperationsState {
  attendanceCycleKey: string;
  attendanceClaims: number[];
  noticeReads: Record<string, number>;
  mailClaims: Record<string, number>;
  redeemedCoupons: Record<string, number>;
}

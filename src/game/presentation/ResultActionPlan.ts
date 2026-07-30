export interface ResultActionPlanInput {
  readonly victory: boolean;
  readonly clearSeconds: number;
  readonly maxCombo: number;
  readonly nextStageId?: string;
  readonly itemDropCount: number;
}

export interface ResultActionPlan {
  readonly performanceLabel: string;
  readonly recommendation: string;
  readonly primaryLabel: string;
  readonly primarySubtitle: string;
}

export function resolveResultActionPlan(input: ResultActionPlanInput): ResultActionPlan {
  if (!input.victory) {
    return {
      performanceLabel: 'TACTICAL RESET',
      recommendation: '장비를 점검하고 회피 타이밍을 정비한 뒤 재도전',
      primaryLabel: '재도전 준비',
      primarySubtitle: '같은 스테이지에서 전투 흐름을 다시 확인합니다.',
    };
  }

  const performanceLabel = input.clearSeconds <= 50 && input.maxCombo >= 4
    ? 'SPEED FOCUS'
    : input.maxCombo >= 3
      ? 'CONTROL STABLE'
      : 'PROGRESS CLEAR';

  if (input.nextStageId) {
    return {
      performanceLabel,
      recommendation: '다음 스테이지로 진행해 전투 리듬을 이어가기',
      primaryLabel: '다음 스테이지 진행',
      primarySubtitle: '승리 흐름을 유지하며 다음 작전으로 이동합니다.',
    };
  }
  if (input.itemDropCount > 0) {
    return {
      performanceLabel,
      recommendation: '획득 장비를 확인하고 강화·교체 여부 검토',
      primaryLabel: '획득 장비 확인',
      primarySubtitle: '새 장비와 현재 세팅을 비교합니다.',
    };
  }
  return {
    performanceLabel,
    recommendation: '로비로 복귀해 퀘스트와 성장 상태를 점검',
    primaryLabel: '거점 복귀',
    primarySubtitle: '다음 성장 목표와 보상을 확인합니다.',
  };
}

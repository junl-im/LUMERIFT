export type LobbyNextActionId = 'claim-quest' | 'check-operations' | 'continue-story' | 'review-assets';

export interface LobbyNextActionInput {
  readonly claimableQuests: number;
  readonly operationAlerts: number;
  readonly clearedStages: number;
  readonly totalStages: number;
}

export interface LobbyNextAction {
  readonly id: LobbyNextActionId;
  readonly eyebrow: string;
  readonly title: string;
  readonly detail: string;
  readonly buttonLabel: string;
  readonly buttonSubtitle: string;
  readonly icon: string;
  readonly tone: 'primary' | 'success' | 'warning' | 'neutral';
}

export function resolveLobbyNextAction(input: LobbyNextActionInput): LobbyNextAction {
  if (input.claimableQuests > 0) {
    return {
      id: 'claim-quest',
      eyebrow: 'NEXT BEST ACTION · REWARD',
      title: `퀘스트 보상 ${input.claimableQuests}개`,
      detail: '수령 가능한 보상을 먼저 회수하면 다음 전투 성장 효율이 좋아집니다.',
      buttonLabel: '퀘스트 보상 확인',
      buttonSubtitle: '완료한 목표와 수령 가능한 보상을 확인합니다.',
      icon: 'quest',
      tone: 'success',
    };
  }
  if (input.operationAlerts > 0) {
    return {
      id: 'check-operations',
      eyebrow: 'NEXT BEST ACTION · ALERT',
      title: `운영 알림 ${input.operationAlerts}건`,
      detail: '우편과 운영 보상에 확인하지 않은 항목이 있습니다.',
      buttonLabel: '운영 알림 확인',
      buttonSubtitle: '우편·운영 보상과 새 알림을 확인합니다.',
      icon: 'mail',
      tone: 'warning',
    };
  }
  if (input.clearedStages < input.totalStages) {
    return {
      id: 'continue-story',
      eyebrow: 'NEXT BEST ACTION · STORY',
      title: `스토리 ${input.clearedStages}/${input.totalStages}`,
      detail: '현재 성장 상태로 다음 균열 작전을 진행할 수 있습니다.',
      buttonLabel: '다음 작전 선택',
      buttonSubtitle: '해금된 스테이지에서 다음 전투를 시작합니다.',
      icon: 'play',
      tone: 'primary',
    };
  }
  return {
    id: 'review-assets',
    eyebrow: 'NEXT BEST ACTION · REVIEW',
    title: '챕터 진행 완료',
    detail: '아트 보관소에서 실사용 에셋과 제작 후보 품질을 점검할 수 있습니다.',
    buttonLabel: '에셋 품질 점검',
    buttonSubtitle: 'production·archive·mobile master 기준을 확인합니다.',
    icon: 'summon',
    tone: 'neutral',
  };
}

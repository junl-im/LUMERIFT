import type { AttendanceRewardDefinition, CouponDefinition, MailDefinition, NoticeDefinition } from './operationsTypes';

export const NOTICES: readonly NoticeDefinition[] = [
  {
    id: 'notice_v130_visual',
    title: '거점 운영 시스템 개방',
    summary: '출석·우편·쿠폰 기능과 공통 운영 UI가 추가되었습니다.',
    body: '계승자님의 성장을 돕는 운영 보상이 활성화되었습니다. 거점의 소식 메뉴에서 매일 출석 보상과 우편을 확인하세요.',
    publishedAt: '2026-07-27',
    important: true,
  },
  {
    id: 'notice_chapter1',
    title: '안개숲 균열 경보',
    summary: 'Chapter 1 정예 개체의 공격력이 상승했습니다.',
    body: '스테이지 1-7 이후에는 회피 타이밍과 장비 강화를 권장합니다. 보스 페이즈 전환 시 위험 범위를 확인하세요.',
    publishedAt: '2026-07-26',
    important: false,
  },
  {
    id: 'notice_mobile',
    title: '모바일 플레이 권장 설정',
    summary: '발열이 높을 때 품질 설정을 균형 또는 절전으로 변경하세요.',
    body: '로비 하단의 성능 버튼을 눌러 프레임과 그래픽 품질을 순환할 수 있습니다.',
    publishedAt: '2026-07-25',
    important: false,
  },
];

export const ATTENDANCE_REWARDS: readonly AttendanceRewardDefinition[] = [
  { day: 1, label: '300 Gold', icon: 'reward_gold', reward: { gold: 300, itemIds: [] } },
  { day: 2, label: '루멘석', icon: 'reward_crystal', reward: { gold: 0, itemIds: ['accessory_lumen_common'] } },
  { day: 3, label: '500 Gold', icon: 'reward_gold', reward: { gold: 500, itemIds: [] } },
  { day: 4, label: '정찰 갑주', icon: 'reward_chest', reward: { gold: 0, itemIds: ['armor_scout_common'] } },
  { day: 5, label: '700 Gold', icon: 'reward_gold', reward: { gold: 700, itemIds: [] } },
  { day: 6, label: '균열검', icon: 'reward_chest', reward: { gold: 0, itemIds: ['weapon_rift_blade_rare'] } },
  { day: 7, label: '루멘 코어', icon: 'reward_essence', reward: { gold: 1000, itemIds: ['accessory_core_rare'] } },
];

export const MAILS: readonly MailDefinition[] = [
  {
    id: 'mail_welcome_v130', sender: '루멘 전초기지', title: '운영 시스템 개방 기념',
    body: '새로운 운영 화면을 확인해 주셔서 감사합니다.', expiresAt: '2026-12-31',
    reward: { gold: 800, itemIds: ['weapon_rift_blade_common'] },
  },
  {
    id: 'mail_visual_apology', sender: '개발 기록관', title: '비주얼 재정비 지원품',
    body: 'UI·그래픽 전면 재정비를 기념해 장비와 골드를 지급합니다.', expiresAt: '2026-12-31',
    reward: { gold: 1200, itemIds: ['armor_warden_rare'] },
  },
  {
    id: 'mail_chapter1_supply', sender: '안개숲 정찰대', title: 'Chapter 1 보급품',
    body: '보스 전투에 대비한 루멘 장식입니다.', expiresAt: '2026-12-31',
    reward: { gold: 500, itemIds: ['accessory_lumen_common'] },
  },
];

export const COUPONS: readonly CouponDefinition[] = [
  { code: 'LUMERIFT13', title: 'v1.3 운영 개방 쿠폰', expiresAt: '2027-01-01', reward: { gold: 1300, itemIds: ['accessory_core_rare'] } },
  { code: 'RIFTSTART', title: '신규 계승자 지원 쿠폰', expiresAt: '2027-01-01', reward: { gold: 900, itemIds: ['weapon_rift_blade_common', 'armor_scout_common'] } },
];

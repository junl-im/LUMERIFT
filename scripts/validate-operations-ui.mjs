import { readFile, stat } from 'node:fs/promises';

const errors = [];
const requiredFiles = [
  'src/scenes/OperationsScene.ts',
  'src/game/operations/operationsTypes.ts',
  'src/game/operations/operationsData.ts',
  'src/game/operations/operationsLogic.ts',
  'src/game/operations/operationsLogic.test.ts',
  'public/assets/live/v3/atlases/operations/operations_ui_v3.json',
  'public/assets/live/v3/atlases/operations/operations_ui_v3.webp',
  'art_source/owned/v1.3.0/operations_ui_master_v1.3.0.png',
  'public/assets/OPERATIONS_V130_SUMMARY.json',
  'docs/previews/v1.3.0_operations_preview.webp',
  'docs/previews/v1.3.0_notice_preview.webp',
  'docs/previews/v1.3.0_attendance_preview.webp',
  'docs/previews/v1.3.0_mail_preview.webp',
  'docs/previews/v1.3.0_coupon_preview.webp',
];
for (const path of requiredFiles) {
  try {
    const info = await stat(path);
    if (info.size < 128) errors.push(`${path}: 파일이 지나치게 작습니다.`);
  } catch {
    errors.push(`${path}: 필수 운영 UI 파일 누락`);
  }
}

const atlas = JSON.parse(await readFile('public/assets/live/v3/atlases/operations/operations_ui_v3.json', 'utf8'));
for (const frame of [
  'notice_bell','attendance_calendar','mail_envelope','coupon_seal',
  'reward_chest','reward_gold','reward_crystal','reward_essence',
  'status_claimed','status_locked','tab_glow','event_banner',
]) {
  if (!atlas.frames?.[frame]) errors.push(`operations atlas frame missing: ${frame}`);
}

const scene = await readFile('src/scenes/OperationsScene.ts', 'utf8');
for (const marker of ['createNotices(', 'createAttendance(', 'createMail(', 'createCoupons(', 'OPERATIONS_UI_BUNDLE']) {
  if (!scene.includes(marker)) errors.push(`OperationsScene marker missing: ${marker}`);
}
const logic = await readFile('src/game/operations/operationsLogic.ts', 'utf8');
for (const marker of ['claimAttendance', 'claimAllMail', 'redeemCoupon', 'operationNotificationCount']) {
  if (!logic.includes(marker)) errors.push(`operations logic marker missing: ${marker}`);
}
const profile = await readFile('src/repositories/PlayerRepository.ts', 'utf8');
if (!profile.includes('PLAYER_SAVE_VERSION = 4')) errors.push('player save version 4 migration missing');
if (!profile.includes('operations: PlayerOperationsState')) errors.push('player operations state missing');
const lobby = await readFile('src/scenes/LobbyScene.ts', 'utf8');
if (!lobby.includes('new OperationsScene()')) errors.push('lobby operations navigation missing');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS operations UI v1.3: ${Object.keys(atlas.frames).length} frames, save v4, notice/attendance/mail/coupon connected`);
}

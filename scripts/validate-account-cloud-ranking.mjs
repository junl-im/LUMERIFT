import { readFile } from 'node:fs/promises';

const errors = [];
const files = {
  account: await readFile('src/scenes/AccountScene.ts', 'utf8'),
  recoveryScene: await readFile('src/scenes/RecoveryScene.ts', 'utf8'),
  recoveryStore: await readFile('src/services/cloud/SaveRecoveryStore.ts', 'utf8'),
  ranking: await readFile('src/scenes/RankingScene.ts', 'utf8'),
  repo: await readFile('src/repositories/ResilientPlayerRepository.ts', 'utf8'),
  localManaged: await readFile('src/repositories/LocalManagedPlayerRepository.ts', 'utf8'),
  localRepo: await readFile('src/repositories/LocalPlayerRepository.ts', 'utf8'),
  cloudRepo: await readFile('src/repositories/FirestorePlayerRepository.ts', 'utf8'),
  auth: await readFile('src/services/auth/AuthService.ts', 'utf8'),
  service: await readFile('src/services/ranking/RankingService.ts', 'utf8'),
  season: await readFile('src/services/ranking/seasonLogic.ts', 'utf8'),
  rankLogic: await readFile('src/services/ranking/rankingLogic.ts', 'utf8'),
  cloudLogic: await readFile('src/services/cloud/cloudSaveLogic.ts', 'utf8'),
  rules: await readFile('firestore.rules', 'utf8'),
  indexes: await readFile('firestore.indexes.json', 'utf8'),
};

const checks = [
  ['account', ['Google 계정 연결', '이메일 계정 연결', '비밀번호 재설정', '로컬 → 클라우드', '클라우드 → 로컬', 'RecoveryScene', 'pre-logout']],
  ['recoveryScene', ['현재 상태 백업', '복구 지점', 'restoreRecoveryPoint', 'removeRecoveryPoint']],
  ['recoveryStore', ['maxPoints = 5', 'pre-auto-merge', 'pre-cloud-download', 'pre-cloud-upload', 'pre-logout']],
  ['ranking', ["new RankingScene('overall')", "new RankingScene('weekly')", "new RankingScene('season')", 'MY RANK', 'seasonRangeLabel']],
  ['repo', ['inspect(uid', 'uploadLocal', 'downloadCloud', 'subscribe(listener', 'SaveRecoveryStore', 'pre-auto-merge', 'restoreRecoveryPoint']],
  ['localManaged', ['listRecoveryPoints', 'createRecoveryPoint', 'restoreRecoveryPoint']],
  ['localRepo', ['JSON.stringify(profile)']],
  ['cloudRepo', ['updatedAt: profile.updatedAt']],
  ['auth', ['sendEmailVerification', 'sendPasswordResetEmail', 'refreshSession']],
  ['service', ['getCountFromServer', 'weeklyRankings', 'seasonRankings', 'resolveRankingSeason']],
  ['season', ['SEASON_LENGTH_DAYS = 28', 'S${String(number).padStart', 'seasonRangeLabel']],
  ['rankLogic', ['getUTCDay', 'toISOString']],
  ['cloudLogic', ['compareProfiles', 'chooseNewest']],
  ['rules', ['match /weeklyRankings/{entryId}', 'match /seasonRankings/{entryId}', "request.resource.data.seasonId + '_' + request.auth.uid"]],
  ['indexes', ['seasonRankings', 'seasonId']],
];
for (const [name, markers] of checks) {
  for (const marker of markers) if (!files[name].includes(marker)) errors.push(`${name}: missing ${marker}`);
}
if (files.rules.includes('allow read, write: if true')) errors.push('rules: insecure allow-all rule detected');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS account/cloud/ranking contract: recovery points, manual sync, overall+weekly+28-day season ranking');
}

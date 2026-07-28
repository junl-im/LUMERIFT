import { initializeApp, deleteApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const projectId = 'lumerift-8db07';
const config = { apiKey: 'demo-key', projectId, appId: '1:demo:web:rules' };
const owner = await client('owner');
const attacker = await client('attacker');
const errors = [];

try {
  const ownerUser = (await signInAnonymously(owner.auth)).user;
  const attackerUser = (await signInAnonymously(attacker.auth)).user;
  const profile = validProfile(ownerUser.uid);
  await expectAllowed('owner profile create', () => setDoc(doc(owner.db, 'users', ownerUser.uid), profile));
  await expectAllowed('owner profile read', () => getDoc(doc(owner.db, 'users', ownerUser.uid)));
  await expectDenied('other user profile read', () => getDoc(doc(attacker.db, 'users', ownerUser.uid)));
  await expectDenied('other user ranking write', () => setDoc(doc(attacker.db, 'rankings', ownerUser.uid), ranking(ownerUser.uid)));
  await expectAllowed('owner overall ranking write', () => setDoc(doc(owner.db, 'rankings', ownerUser.uid), ranking(ownerUser.uid)));
  await expectAllowed('owner weekly ranking write', () => setDoc(
    doc(owner.db, 'weeklyRankings', `2026-07-27_${ownerUser.uid}`),
    { ...ranking(ownerUser.uid), weekKey: '2026-07-27' },
  ));
  await expectAllowed('owner season ranking write', () => setDoc(
    doc(owner.db, 'seasonRankings', `S01_2026-07-06_${ownerUser.uid}`),
    { ...ranking(ownerUser.uid), seasonId: 'S01_2026-07-06' },
  ));
  await expectDenied('other user season ranking write', () => setDoc(
    doc(attacker.db, 'seasonRankings', `S01_2026-07-06_${ownerUser.uid}`),
    { ...ranking(ownerUser.uid), seasonId: 'S01_2026-07-06' },
  ));
  await expectDenied('coupon client read', () => getDoc(doc(owner.db, 'coupons', 'TEST')));
  await signOut(attacker.auth);
  await expectAllowed('public ranking read', () => getDoc(doc(attacker.db, 'rankings', ownerUser.uid)));
} finally {
  await Promise.all([deleteApp(owner.app), deleteApp(attacker.app)]);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS Firestore emulator rules: owner isolation, public ranking read, weekly+season ownership, coupon deny');
}

async function client(name) {
  const app = initializeApp(config, `rules-${name}-${Date.now()}-${Math.random()}`);
  const auth = getAuth(app);
  const db = getFirestore(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  return { app, auth, db };
}

async function expectAllowed(label, action) {
  try { await action(); }
  catch (error) { errors.push(`${label}: expected allow, got ${errorCode(error)}`); }
}

async function expectDenied(label, action) {
  try {
    await action();
    errors.push(`${label}: expected permission-denied`);
  } catch (error) {
    if (!String(errorCode(error)).includes('permission-denied')) errors.push(`${label}: wrong error ${errorCode(error)}`);
  }
}

function errorCode(error) {
  return error && typeof error === 'object' && 'code' in error ? error.code : String(error);
}

function ranking(uid) {
  return { uid, nickname: '테스트 계승자', score: 1000, stage: 3, level: 2, updatedAt: serverTimestamp() };
}

function validProfile(uid) {
  return {
    saveVersion: 4, uid, nickname: '테스트 계승자', level: 1, exp: 0, highestStage: 1, gold: 900,
    inventory: {}, equipped: {}, stageProgress: {}, questClaims: {}, dailyQuestDate: '2026-07-27',
    dailyQuestClaims: {},
    statistics: { monstersDefeated: 0, stagesCleared: 0, equipmentUpgrades: 0, itemsObtained: 0 },
    dailyStatistics: { monstersDefeated: 0, stagesCleared: 0, equipmentUpgrades: 0, itemsObtained: 0 },
    tutorial: { completed: false, skipped: false },
    operations: { attendanceCycleKey: '', attendanceClaims: [], noticeReads: {}, mailClaims: {}, redeemedCoupons: {} },
    updatedAt: Date.now(), serverUpdatedAt: serverTimestamp(),
  };
}

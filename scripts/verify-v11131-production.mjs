import { readFile, stat } from 'node:fs/promises';
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const failures = [];
const atlas = await json('public/assets/live/v15/atlases/ui/premium_hud_v15.json');
const hud = await json('public/assets/live/v15/production/PREMIUM_HUD_V15.json');
const core = await json('public/assets/live/v15/production/BOSS_CORE_LIFECYCLE_V15.json');
const capture = await json('public/assets/live/v15/production/CAPTURE_EVIDENCE_V15.json');
const character = await json('public/assets/live/v15/production/CHARACTER_PART_ATLAS_HANDOFF_V15.json');
const monster = await json('public/assets/live/v15/production/MONSTER_PART_ATLAS_HANDOFF_V15.json');
const webp = await stat('public/assets/live/v15/atlases/ui/premium_hud_v15.webp');
if (Object.keys(atlas.frames).length !== 8 || atlas.meta.size.w !== 512 || atlas.meta.size.h !== 256) failures.push('premium HUD atlas');
if (webp.size !== 63086 || hud.frames !== 8 || hud.initialBundleAddedBytes !== 63086) failures.push('premium HUD bytes/contract');
if (core.states.join(',') !== 'shielded,fractured,shattered,regenerating,overdrive') failures.push('boss core states');
if (core.phaseBreakSeconds !== 0.24 || core.phaseReformSeconds !== 0.86) failures.push('boss core timing');
if (capture.hashAlgorithm !== 'SHA-256' || capture.requiredCaptureFiles !== 2 || capture.verification.length !== 4) failures.push('capture integrity');
if (character.finalHandPaintedAtlasComplete || monster.finalHandPaintedAtlasComplete) failures.push('handoff completion claim');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.31 production: 8 premium HUD frames, 5 boss core states, SHA-256 capture package, final body Atlases pending');

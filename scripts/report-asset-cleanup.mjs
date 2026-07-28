import { readFile, readdir } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('public/assets/ASSET_MANIFEST.json', 'utf8'));
const planFiles = (await readdir('asset_registry')).filter((name) => /^RELOCATION_PLAN_v\d+\.\d+\.\d+\.json$/.test(name));
const plans = await Promise.all(planFiles.map(async (name) => JSON.parse(await readFile(`asset_registry/${name}`, 'utf8'))));
const archivedBytes = plans.flatMap((plan) => plan.moves ?? []).reduce((sum, item) => sum + (item.bytes ?? 0), 0);
const archivedFiles = plans.flatMap((plan) => plan.moves ?? []).length;
console.log(`Active public assets: ${manifest.deployment.publicAssetFiles} files, ${(manifest.deployment.publicAssetBytes / 1_000_000).toFixed(2)} MB`);
console.log(`Archived by relocation plans: ${archivedFiles} files, ${(archivedBytes / 1_000_000).toFixed(2)} MB`);
console.log(`Runtime archive total: ${manifest.deployment.runtimeArchiveFiles} files, ${(manifest.deployment.runtimeArchiveBytes / 1_000_000).toFixed(2)} MB`);

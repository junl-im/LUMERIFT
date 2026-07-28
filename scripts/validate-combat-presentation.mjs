import { readFile } from 'node:fs/promises';

const errors = [];
const footprint = await readFile('src/game/combat/attackFootprint.ts', 'utf8');
const actor = await readFile('src/game/presentation/BattleActorView.ts', 'utf8');
const director = await readFile('src/game/presentation/BossPhaseDirector.ts', 'utf8');
const battle = await readFile('src/scenes/BattleScene.ts', 'utf8');

const requirements = [
  [footprint, 'createAttackFootprint'],
  [footprint, 'footprintContainsCircle'],
  [footprint, 'buildArcPolygon'],
  [actor, 'telegraphProgress'],
  [actor, 'buildArcPolygon(footprint, 24)'],
  [director, 'auraRings: 3'],
  [director, 'telegraphIntensity: 1.24'],
  [battle, 'createBossCinematicOverlay'],
  [battle, 'startBossCinematic'],
  [battle, 'bossCinematicAlpha'],
  [battle, 'footprintContainsCircle'],
  [battle, 'this.camera?.addHitStop'],
  [battle, 'this.camera?.pulseZoom'],
];
for (const [source, marker] of requirements) if (!source.includes(marker)) errors.push(`combat presentation missing: ${marker}`);
if (actor.includes(".ellipse(0, 0, value.pattern.range")) errors.push('monster telegraph still uses approximate ellipse');
if (battle.includes('isPointInDirectionalArc(') || battle.includes('circlesOverlap(')) errors.push('BattleScene bypasses shared attack footprint');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS combat presentation: shared telegraph/hit footprint, boss 3-phase cinematic, hit-stop/zoom feedback');
}

import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';

const roots = ['src'];
const extensions = ['', '.ts', '.tsx', '.js', '.mjs', '.json'];
const errors = [];

async function exists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (!['.ts', '.tsx', '.js', '.mjs'].includes(extname(entry.name))) continue;

    const source = await readFile(fullPath, 'utf8');
    const matches = source.matchAll(/(?:from\s+|import\s*\()(['"])(\.[^'"]+)\1/g);
    for (const match of matches) {
      const specifier = match[2];
      const base = resolve(dirname(fullPath), specifier);
      let found = false;
      for (const extension of extensions) {
        if (await exists(base + extension) || await exists(join(base, `index${extension}`))) {
          found = true;
          break;
        }
      }
      if (!found) errors.push(`누락된 상대 import: ${fullPath} -> ${specifier}`);
    }
  }
}

for (const root of roots) await walk(root);

const battleActorView = await readFile('src/game/presentation/BattleActorView.ts', 'utf8');
const monsterUpdateMatch = battleActorView.match(/public update\(\s*controller: MonsterController,([\s\S]*?)\n  \}\n\n\n  private drawPhaseAura/);
if (!monsterUpdateMatch) {
  errors.push('BattleActorView MonsterActorView.update 계약을 찾지 못했습니다.');
} else {
  const updateSource = monsterUpdateMatch[1];
  if (!updateSource.includes('_deltaSeconds: number')) {
    errors.push('BattleActorView의 의도적 미사용 시간 매개변수는 _deltaSeconds로 표기해야 합니다.');
  }
  if (/const\s+\{\s*combat\s*\}\s*=\s*this\.definition/.test(updateSource)) {
    errors.push('BattleActorView.update에 미사용 combat 지역 변수가 다시 추가되었습니다.');
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS source imports and BattleActorView TS6133 regression guard');
}

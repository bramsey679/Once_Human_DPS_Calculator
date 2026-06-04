import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data');

async function readJson(file) {
  const raw = await fs.readFile(path.join(dataDir, file), 'utf8');
  return JSON.parse(raw);
}

function ensureArray(value, name) {
  if (!Array.isArray(value)) throw new Error(`${name} must be an array`);
}

function ensureUnique(items, key, name) {
  const seen = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object') throw new Error(`${name} contains a non-object entry`);
    const v = item[key];
    if (!v) throw new Error(`${name} entry missing ${key}`);
    if (seen.has(v)) throw new Error(`${name} duplicate ${key}: ${v}`);
    seen.add(v);
  }
}

function validateRefs(items, refName, validIds) {
  for (const item of items) {
    const refs = item.source_refs || [];
    for (const ref of refs) {
      if (!validIds.has(ref)) throw new Error(`${refName} references unknown source id: ${ref}`);
    }
  }
}

async function main() {
  const [sources, patches, weapons, mods, armor, cradles, targets, formulas] = await Promise.all([
    readJson('sources.json'),
    readJson('patches.json'),
    readJson('weapons.json'),
    readJson('mods.json'),
    readJson('armor.json'),
    readJson('cradles.json'),
    readJson('targets.json'),
    readJson('formulas.json')
  ]);

  ensureArray(sources, 'sources');
  ensureArray(patches, 'patches');
  ensureArray(weapons, 'weapons');
  ensureArray(mods, 'mods');
  ensureArray(armor, 'armor');
  ensureArray(cradles, 'cradles');
  ensureArray(targets, 'targets');
  ensureArray(formulas, 'formulas');

  ensureUnique(sources, 'id', 'sources');
  ensureUnique(patches, 'id', 'patches');
  ensureUnique(weapons, 'id', 'weapons');
  ensureUnique(mods, 'id', 'mods');
  ensureUnique(armor, 'id', 'armor');
  ensureUnique(cradles, 'id', 'cradles');
  ensureUnique(targets, 'id', 'targets');
  ensureUnique(formulas, 'id', 'formulas');

  const sourceIds = new Set(sources.map(s => s.id));
  validateRefs(weapons, 'weapons', sourceIds);
  validateRefs(mods, 'mods', sourceIds);
  validateRefs(armor, 'armor', sourceIds);
  validateRefs(cradles, 'cradles', sourceIds);
  validateRefs(patches, 'patches', sourceIds);

  const activePatchRefs = new Set(patches.map(p => p.id));
  for (const formula of formulas) {
    if (formula.patch_ref && !activePatchRefs.has(formula.patch_ref)) {
      throw new Error(`formulas references unknown patch_ref: ${formula.patch_ref}`);
    }
  }

  console.log(`Validated ${sources.length} sources, ${patches.length} patches, ${weapons.length} weapons, ${mods.length} mods, ${armor.length} armor entries, ${cradles.length} cradles, ${targets.length} targets, and ${formulas.length} formulas.`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});

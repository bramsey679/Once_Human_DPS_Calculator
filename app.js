const state = {
  weapon: 'aws_338_bullseye',
  patch: '2026-01-21-v2-3-1',
  star: 0,
  tier: 0,
  calibration: 0,
  enemy: 'training_dummy',
  mode: 'pve',
  armor: Array.from({ length: 6 }, () => ({ slot: 'None', star: 0 })),
  mods: [],
  cradle: []
};

const defaults = {
  weapons: [{ id: 'aws_338_bullseye', name: 'AWS.338 - Bullseye' }],
  targets: [{ id: 'training_dummy', name: 'Training Dummy' }],
  patches: [{ id: '2026-01-21-v2-3-1', label: 'Version 2.3.1' }],
  stars: Array.from({ length: 6 }, (_, i) => i),
  tiers: Array.from({ length: 6 }, (_, i) => i),
  calibrations: Array.from({ length: 6 }, (_, i) => i)
};

const armorSlots = ['Helmet', 'Mask', 'Top', 'Gloves', 'Bottoms', 'Shoes'];
let data = {
  sources: [],
  patches: defaults.patches,
  weapons: defaults.weapons,
  targets: defaults.targets,
  stars: defaults.stars,
  tiers: defaults.tiers,
  calibrations: defaults.calibrations,
  mods: [],
  cradles: [],
  formulas: []
};

function fillSelect(id, items, selected, labelKey = 'name') {
  const el = document.getElementById(id);
  el.innerHTML = items.map(item => `<option value="${item.id ?? item}">${item[labelKey] ?? item.name ?? item}</option>`).join('');
  el.value = selected;
}

function fillNumberSelect(id, values, selected) {
  const el = document.getElementById(id);
  el.innerHTML = values.map(v => `<option value="${v}">${v}</option>`).join('');
  el.value = String(selected);
}

function renderArmorSlots() {
  const host = document.getElementById('armor-slots');
  host.innerHTML = state.armor.map((slot, index) => `
    <div class="grid" style="grid-template-columns: 1fr 140px 120px; align-items: end;">
      <label>Armor slot ${index + 1}
        <select data-armor-slot="${index}">
          <option value="None">None</option>
          ${armorSlots.map(name => `<option value="${name}">${name}</option>`).join('')}
        </select>
      </label>
      <label>Blueprint star
        <select data-armor-star="${index}">${data.stars.map(n => `<option value="${n}">${n}</option>`).join('')}</select>
      </label>
      <button data-clear-armor="${index}" type="button">Clear</button>
    </div>
  `).join('');
}

function renderMods() {
  const host = document.getElementById('mods');
  const modNames = data.mods.map(m => `${m.name} ${m.tier}`).slice(0, 12).join(', ') || 'No mod data loaded yet.';
  const cradleNames = data.cradles.map(c => c.name).join(', ') || 'No cradle data loaded yet.';
  host.innerHTML = `
    <label>Mods used
      <input id="mods-input" placeholder="Comma-separated mod names" />
    </label>
    <label>Cradle perks
      <input id="cradle-input" placeholder="Comma-separated cradle perks" />
    </label>
    <p class="muted">Loaded mod refs: ${modNames}</p>
    <p class="muted">Loaded cradle refs: ${cradleNames}</p>
  `;
}

function selectedPatch() {
  return data.patches.find(p => p.id === state.patch) || data.patches[0] || null;
}

function computeScore() {
  const weapon = data.weapons.find(w => w.id === state.weapon);
  const patch = selectedPatch();
  const weaponMultiplier = {
    aws_338_bullseye: 1.18,
    smg: 0.95,
    shotgun: 1.08,
    rifle: 1.02
  }[state.weapon] ?? 1;

  const enemyMultiplier = {
    training_dummy: 1.0,
    pve_grunt: 0.92,
    pve_elite: 0.78,
    pvp_standard: 0.66,
    pvp_tank: 0.58,
    pvp_squishy: 0.74
  }[state.enemy] ?? 1;

  const buildBonus = 1 + (state.star * 0.08) + (state.tier * 0.05) + (state.calibration * 0.03);
  const armorBonus = 1 + state.armor.filter(a => a.slot && a.slot !== 'None').length * 0.03;
  const modBonus = 1 + (document.getElementById('mods-input').value.split(',').filter(Boolean).length * 0.02);
  const cradleBonus = 1 + (document.getElementById('cradle-input').value.split(',').filter(Boolean).length * 0.015);
  const modeMultiplier = state.mode === 'pvp' ? 0.88 : 1;
  const patchMultiplier = patch?.damage_multiplier ?? 1;

  return 1000 * weaponMultiplier * buildBonus * armorBonus * modBonus * cradleBonus * enemyMultiplier * modeMultiplier * patchMultiplier;
}

function render() {
  const score = computeScore();
  const weapon = data.weapons.find(w => w.id === state.weapon);
  const enemy = data.targets.find(e => e.id === state.enemy);
  const patch = selectedPatch();
  document.getElementById('score').textContent = score.toFixed(1);
  document.getElementById('summary').textContent = `Placeholder relative score for ${weapon?.name ?? state.weapon} against ${enemy?.name ?? state.enemy} on ${patch?.label ?? state.patch}.`;
  document.getElementById('data-status').textContent = `Loaded ${data.weapons.length} weapons, ${data.mods.length} mods, ${data.cradles.length} cradles, ${data.targets.length} target profiles, and ${data.patches.length} patch records from versioned JSON.`;
}

function bind() {
  document.getElementById('patch').addEventListener('change', e => { state.patch = e.target.value; render(); });
  document.getElementById('weapon').addEventListener('change', e => { state.weapon = e.target.value; render(); });
  document.getElementById('star').addEventListener('change', e => { state.star = Number(e.target.value); render(); });
  document.getElementById('tier').addEventListener('change', e => { state.tier = Number(e.target.value); render(); });
  document.getElementById('calibration').addEventListener('change', e => { state.calibration = Number(e.target.value); render(); });
  document.getElementById('enemy').addEventListener('change', e => { state.enemy = e.target.value; render(); });
  document.getElementById('mode').addEventListener('change', e => { state.mode = e.target.value; render(); });
  document.getElementById('mods-input').addEventListener('input', render);
  document.getElementById('cradle-input').addEventListener('input', render);

  document.addEventListener('change', e => {
    const slot = e.target.dataset.armorSlot;
    const star = e.target.dataset.armorStar;
    if (slot !== undefined) {
      state.armor[Number(slot)].slot = e.target.value;
      render();
    }
    if (star !== undefined) {
      state.armor[Number(star)].star = Number(e.target.value);
      render();
    }
  });

  document.addEventListener('click', e => {
    const clearIndex = e.target.dataset.clearArmor;
    if (clearIndex !== undefined) {
      state.armor[Number(clearIndex)] = { slot: 'None', star: 0 };
      renderArmorSlots();
      bindArmor();
      render();
    }
  });
}

function bindArmor() {
  state.armor.forEach((slot, index) => {
    const input = document.querySelector(`[data-armor-slot="${index}"]`);
    const star = document.querySelector(`[data-armor-star="${index}"]`);
    if (input) input.value = slot.slot;
    if (star) star.value = String(slot.star);
  });
}

async function loadJson(path, fallback) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) return fallback;
    const data = await res.json();
    return Array.isArray(data) && data.length ? data : fallback;
  } catch {
    return fallback;
  }
}

async function init() {
  const [sourceData, patchData, weaponData, targetData, starData, tierData, calibData, modData, cradleData, formulaData] = await Promise.all([
    loadJson('data/sources.json', []),
    loadJson('data/patches.json', defaults.patches),
    loadJson('data/weapons.json', defaults.weapons),
    loadJson('data/targets.json', defaults.targets),
    loadJson('data/stars.json', defaults.stars),
    loadJson('data/tiers.json', defaults.tiers),
    loadJson('data/calibrations.json', defaults.calibrations),
    loadJson('data/mods.json', []),
    loadJson('data/cradles.json', []),
    loadJson('data/formulas.json', [])
  ]);

  data = {
    sources: sourceData,
    patches: patchData,
    weapons: weaponData,
    targets: targetData,
    stars: starData,
    tiers: tierData,
    calibrations: calibData,
    mods: modData,
    cradles: cradleData,
    formulas: formulaData
  };

  fillSelect('patch', data.patches, state.patch, 'label');
  fillSelect('weapon', data.weapons, state.weapon, 'name');
  fillNumberSelect('star', data.stars, state.star);
  fillNumberSelect('tier', data.tiers, state.tier);
  fillNumberSelect('calibration', data.calibrations, state.calibration);
  fillSelect('enemy', data.targets, state.enemy, 'name');
  renderArmorSlots();
  renderMods();
  bind();
  bindArmor();
  render();
}

init();

# Once Human simulator research and data model

This document turns the current research into a practical build plan.

## Bottom line

The best no-cost distribution path is still a **static, open-source web app** hosted on **GitHub Pages** or **Cloudflare Pages**.

For the data layer, the best approach is **versioned JSON/CSV files in the repo**, not a spreadsheet-first app.

Why:

- the UI is easier to trust when it is static and inspectable
- formulas and item data are easier to diff in git than in Sheets
- the public site can load versioned data files without a backend
- Google Sheets import functions are useful, but too brittle as the main public simulator backend

## What I could figure out from public sources

### Public community resource landscape

The Once Human community already has:

- **Once Human Database / OHDB** — broad item coverage and a build planner
- **Wikily** — item pages, build planner, mods, armor blueprints, weapon blueprints, comparisons
- **Game8** — build guides, build planners, and stat-oriented guides
- **Wiki/Fandom-style pages** — broad item and mod coverage
- **YouTube / Reddit** — practical damage and build discussions, including crit vs weakspot and PvP mitigation

### The gap that still matters

The community already has planners and databases. The missing piece is still:

- a **real damage simulator**
- with **patch-aware formulas**
- and **mode-aware target profiles**
- and **transparent source data**

## Data categories you asked me to figure out

### 1) Weapon data

These are the fields the simulator should store per weapon:

- weapon id
- name
- category / weapon class
- rarity / tier / blueprint version
- base attack or base damage
- fire rate
- magazine size
- reload time
- crit rate
- crit damage
- weakspot damage
- status / elemental interaction
- special keyword(s) such as Bounce / Shrapnel / Fast Gunner / Power Surge / Unstable Bomber / Burn / Frost Vortex / Fortress Warfare / Bull's Eye
- unique blueprint effect text
- calibration effects
- patch/version validity

**Where this data can come from:**
- official patch notes for changed blueprint effects and combat wording
- community databases like OHDB / Wikily for structured item stats
- manual verification against in-game tooltips when the wording is ambiguous

### 2) Armor data

Store per armor piece:

- armor id
- name
- slot
- set name
- base defense / HP / mitigation stats
- set bonus text
- unique gear effect text
- blueprint star level
- hide / fur / accessory flags if they affect damage
- calibration-affecting attributes
- patch/version validity

**Important:** armor in Once Human is not just defense. Some pieces directly affect damage, crit, weakspot, bounce, burn, reload, or mode-specific interactions.

### 3) Mod effects

Store per mod:

- mod id
- name
- slot type
- category
- trigger condition
- effect text
- stat deltas
- keyword-specific interaction
- proc chance / duration / stack cap
- patch/version validity
- PvE / PvP applicability

This needs normalization because mods often combine:
- flat stat bonuses
- conditional bonuses
- keyword-specific bonuses
- target-condition bonuses

### 4) Cradle perks

Store per cradle perk:

- perk id
- name
- trigger or activation condition
- effect text
- stat deltas
- stack rules
- mode restriction if any
- patch/version validity

### 5) PvE / PvP target profiles

You need target profiles, not just one dummy.

Recommended profiles:

- training dummy / baseline
- normal PvE mob
- elite mob
- boss / raid boss
- armored target
- weakspot-friendly target
- PvP standard target
- PvP tank target
- PvP squishy target

Each profile should include:

- HP pool
- armor / mitigation layer
- damage reduction layer
- status resistance or vulnerability if relevant
- weakspot multiplier / accessibility
- head/body multiplier if applicable
- mode flags

### 6) Patch / version selection

This is not optional.

The game changes fast enough that a build simulator without versioning will go stale.

Use version selection to control:

- weapon blueprint effects
- armor / mod / cradle effect changes
- formula changes
- target-profile changes
- balance updates by patch date

Recommended versioning key:

- major version
- update date
- patch notes source URL
- effective start date
- optional end date

### 7) Real mitigation / crit / weakspot formulas

This is the hardest part.

What the public evidence supports:

- Once Human combat is patch-sensitive
- crit and weakspot both matter
- some weapons and Deviations now explicitly benefit from Crit Hit / Crit DMG and Weakspot / Weakspot DMG together
- some charged / keyword interactions were updated so damage types can shift between Weapon DMG and Status DMG
- PvP damage reduction / armor / mitigation is a real separate layer

What this means for the simulator:

- use **formula tables**, not one giant hardcoded formula
- separate base weapon damage, additive bonuses, multipliers, target mitigation, and keyword-specific overrides
- allow patch-specific formula branches

## Best implementation structure

### Frontend
- `index.html`
- `style.css`
- `app.js`

### Data
- `data/weapons.json`
- `data/armor.json`
- `data/mods.json`
- `data/cradles.json`
- `data/targets.json`
- `data/patches.json`
- `data/formulas.json`

### Docs
- `README.md`
- `PRIVACY.md`
- `FORUM_POST.md`
- `CHANGELOG.md`

## Updated recommendation

### Best no-cost public setup
1. **GitHub Pages** for hosting
2. **Public GitHub repo** for source transparency
3. **Static frontend** only
4. **Versioned JSON data** in the repo
5. **Optional Google Sheets** only as a private authoring tool, not the public backend

### Why this beats Sheets as the main app
- easier to review
- easier to diff
- easier to pin to a patch version
- easier to publish safely
- easier for mod moderators and players to inspect

## What still needs a human

I can do the structure, docs, scaffolding, and source mapping.
A human still needs to:

- verify exact in-game values when tooltip wording is ambiguous
- test damage numbers in game for edge cases
- decide the final modeling assumptions for unclear formulas
- maintain the dataset when the game patches again

## Practical next step

The next thing to build is a **data-driven shell**:

- dropdowns populated from JSON
- patch selector
- target selector
- weapon/armor/mod/cradle data loaded from files
- placeholder formula engine replaced with table-driven calculations

Once that exists, the simulator becomes a real community tool instead of just a mockup.

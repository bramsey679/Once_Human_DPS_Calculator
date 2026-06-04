# Once Human Build/Damage Calculator Starter

A **static, frontend-only** starter for a community Once Human build and damage calculator.

## Safety posture

This starter is designed to be easy to review and safe to share:

- no executable
- no login
- no analytics
- no tracking pixels
- no file uploads
- no personal-data collection
- no backend required
- no secrets required

## What this is for

Use this as the public, inspectable base for a Once Human tool that players can trust.
It is especially suited for:

- build planning
- weapon / star / tier / calibration inputs
- armor-slot comparisons
- mods and cradle perks
- PvE / PvP target profiles
- patch/version-aware formulas

## What is now included

The starter is now wired for a versioned data model:

- `data/sources.json` — official/community source registry
- `data/patches.json` — patch/version boundaries
- `data/weapons.json` — starter weapon blueprint set from public lists
- `data/mods.json` — starter mod set from public lists and official notes
- `data/armor.json` — official gear/unique effect entries we could verify
- `data/cradles.json` — verified cradle effects we could verify
- `data/targets.json` — modeled PvE/PvP target profiles
- `data/formulas.json` — patch-aware formula tables
- `data/source-snapshots.json` — auto-generated source fetch snapshots

## What still needs careful verification

The public web gives us a lot of structure, but not every exact combat value. Keep the following human-reviewed before calling the tool "final":

1. exact weapon and armor stats for every item
2. full mod/perk normalization for all tiers and variants
3. exact mitigation order and rounding behavior
4. patch-by-patch formula edge cases
5. in-game validation against tooltips / combat tests

## Automatic update path

This repo now includes a basic update pipeline:

- `scripts/update-data.mjs` refreshes source snapshots
- `scripts/validate-data.mjs` checks the normalized data files
- `.github/workflows/update-data.yml` runs the refresh on a schedule and opens a PR

That means the project can update itself automatically where possible, while still forcing human review for combat math.

## Suggested file structure

- `index.html` — UI
- `style.css` — styling
- `app.js` — input logic and formula engine
- `data/` — normalized gameplay tables
- `schemas/` — JSON schema references
- `scripts/` — source refresh and validation helpers
- `README.md` — project summary
- `PRIVACY.md` — clear privacy statement
- `FORUM_POST.md` — post template for communities

## Next technical step

Replace the placeholder score in `app.js` with real Once Human formula branches and validated item stats.

# Data files

These JSON files are the source of truth for the starter simulator.

## Update policy

- `sources.json` lists the official and community pages used as references.
- `patches.json` defines patch/version boundaries.
- `weapons.json`, `armor.json`, `mods.json`, `cradles.json`, `targets.json`, and `formulas.json` are the normalized gameplay tables.
- `source-snapshots.json` is generated automatically by the refresh script.

## Practical rule

If a field is not verified, keep it `null` or mark it in `notes`. Do not silently invent exact combat math.

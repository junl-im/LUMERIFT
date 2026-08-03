# LUMERIFT v1.11.34

## Runtime art update

- Added 48-frame direction-aware player action overlay Atlas for attack, dodge, and skill states.
- Added 32-frame elite/boss motion overlay Atlas for idle, telegraph, attack, and phase-3 enrage.
- Expanded boss core destruction and regeneration loops to 30 raster frames.
- Added 16 combat, character, QA, and production-operation icons.
- Battle and Character Wardrobe share the same v18 player action overlay contract.
- v18 failure falls back through v17, v16, and the original body Atlases.

## Safety

- Player Save remains v4.
- AttackFootprint remains the sole combat hit contract.
- Firebase App Check remains disabled.
- Final hand-painted 8-direction full-body Atlases are not marked complete.

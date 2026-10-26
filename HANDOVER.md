# Handover — Floor Studio polish (rooms + install time-lapse)

**For:** Astra
**Scope:** make the procedural rooms and the Play Install sequence look better. Everything else (photo composer, share, sample CTA, day/night slider, walk mode, SSR, post-processing) is working — don't regress it.

---

## Where things live

- Repo root: `c:\Users\eveli\OneDrive\Desktop\100coatings`
- Dev: `npm run dev` → http://localhost:3000, scroll to the Floor Studio section
- 3D stack: `@react-three/fiber@9`, `@react-three/drei@10`, `three`, `@react-three/postprocessing`
- Files you'll touch:
  - `components/FloorRoom.tsx` — Canvas, materials, lighting, geometry, install animation state
  - `components/FloorStudio.tsx` — UI controls, drives install animation via `playInstall` callback, passes `installProgress` as a prop
  - `lib/finish-texture.ts` — procedural canvas texture generators (`buildFinishCanvas`, `buildRoughnessCanvas`, `buildNormalCanvas`, `buildInstallStageCanvas`)
  - `lib/floor-studio.ts` — finish/color/room data + `resolveLighting(daylight)` + `lightingStops`
  - `app/floor-studio.css` — all studio styling (slider, pills, overlay, etc.)

## 1. Rooms — current state

**Walls** (`FloorRoom.tsx` → `Walls`): three flat planes (back wall, left wall, a "window" rectangle with emissive glow) + a thin floor-edge slab at y≈-0.07.

**Decor** (`FloorRoom.tsx` → `Decor` + per-room `LivingDecor` / `GarageDecor` / `ShowroomDecor` / `BasementDecor` / `PatioDecor`): compound groups of boxes + a few cylinders/spheres with `meshStandardMaterial`. Props were just expanded in the last pass; they help with scale but still read as "built from primitives."

**Fallback to real GLB** is wired: if `/public/rooms/{living,garage,showroom,basement,patio}.glb` exists, `GltfRoomMesh` loads it and replaces walls+decor for that space. Asset-existence check at `assetExists` top of file — note it rejects `text/html` responses so Next's dev-server catch-all doesn't fake-positive.

### Why it looks weak
- No baseboards, no crown moulding, no door frames → the geometry doesn't *read* as architecture
- The "window" is a glowing rectangle with no frame or mullions
- No ceiling — overhead bloom from the Lightformers can look floaty, and Night lighting has nothing to catch
- Walls are flat tint, no micro-paint texture
- Props are correct in silhouette but miss details that sell them (TV screen, pegboard, picture frames, rug)
- All rooms share identical wall/window — a garage should feel different from a living room before any prop lands

### Improvements, ranked by impact/effort
1. **Add trim + door jamb** — baseboards (thin box ~6cm tall along wall bases), simple crown moulding, a vertical door jamb on the right-side wall. Biggest "built environment" cue for the money.
2. **Reskin the window** — mullion frame (cross bars), add a thin curtain plane beside it, maybe a sill. Currently in `Walls` as a single `<mesh>` with an emissive plane.
3. **Add a ceiling** — single plane at y=2.8, wall-tinted. For Showroom/Garage, add recessed light bars as small emissive boxes. Watch perf: `MeshReflectorMaterial` on the floor will reflect the ceiling down (`FloorMaterial` → the `MeshReflectorMaterial` component). If it looks bad, add a `polygonOffset`/depth-biased trick or set ceiling to `visible={false}` when `appearance.firstPerson === false`.
4. **Richer per-room props** — Living: TV on stand, framed art, rug (just a thin box with a fabric texture); Garage: pegboard with tool silhouettes, stacked tires, oil drum; Showroom: product displays + spotlights; Basement: dartboard on wall, mini-fridge; Patio: potted plants cluster, string lights (emissive dots on a `<Line>`).
5. **Normal maps on walls** — reuse the pattern from `buildNormalCanvas` for a subtle plaster/paint texture. Prevents the dead-flat look.
6. **Per-room Lightformer variation** — a garage lit by two cold fluorescents is nothing like a living room with warm west-facing afternoon light. Currently the Lightformer rig in `FloorRoom.tsx` is one shared setup; swap in per-room variants gated on `appearance.room`.
7. **Replace with real GLB rooms** — the loader is already there. Grab CC0 scenes from `polyhaven.com/models` (filter by Interior), scale in Blender so the floor sits at y=0 and spans roughly 6×6 units, remove the model's floor (so our material shows through), export as `.glb` (binary), drop at `/public/rooms/{name}.glb`. Zero code changes needed.

## 2. Play Install — current state

**Button** in `FloorStudio.tsx` summary bar, label switches between "Play install" / "Stop". Click fires `playInstall`:
- Sets a `requestAnimationFrame` loop that computes `elapsed/8500ms` → `installProgress ∈ [0,1]`, stored in React state
- Passed down to `FloorRoom` as `appearance.installProgress`
- At end: holds for 1.2s, then resets to `null`

**Material** (`FloorRoom.tsx` → `FloorMaterial`): reads `appearance.installProgress`, calls `discreteInstallStage(progress)` → returns one of `[0, 0.5, 1.5]` for three snap points. Rebuilds the texture via `buildInstallStageCanvas` in `lib/finish-texture.ts` when the stage key changes.

**Overlay** (`FloorRoom.tsx` → the `install-overlay` div near the bottom of the return): progress bar + stage label. Labels defined in `INSTALL_LABELS = ["Bare concrete", "Primer & base coat", "Decorative broadcast", "Sealed topcoat"]`.

### Why it looks weak
- Stages **snap** between textures — a jarring cut, not a time-lapse
- Lighting doesn't shift across the animation; an install happens over 6+ hours and the sun would move
- Nothing *moves* on screen besides the texture swap — install is tactile
- Only 3 actual stages (concrete / base / finish) despite 4 labels defined — off-by-one
- `buildInstallStageCanvas` is minimal — the concrete texture is OK, the "epoxy base" is a flat dark gradient
- No audio

### Improvements, ranked by impact/effort
1. **Fix the stage-label mismatch** — either use 4 stages or trim `INSTALL_LABELS` to 3. Currently `Math.floor(progress * 4)` can hit index 3 (`Sealed topcoat`) but the material already shows the final finish at stage 1.5 for `progress ≥ 0.75`. Cheapest cleanup.
2. **Smooth crossfade between stages** — stack two coplanar floor meshes at y=0.001 and y=0.002, lerp opacity across the stage boundary. Replaces hard cuts with a dissolve. ~20 lines in `FloorMaterial` / `Floor`.
3. **Camera dolly during playback** — slow push-in from the current camera pose to a lower closer view by t=0.5, then pull back out by t=1.0. Add to `OrbitCameraRig` as an optional override driven by `appearance.installProgress`.
4. **Shift lighting across playback** — remap `daylight` across 0→1 as the animation plays, so morning → noon → sunset. Sells "took all day." In `FloorStudio.tsx`, compute a derived `activeDaylight = installProgress !== null ? interpolate(daylight, installProgress) : daylight` and pass that through.
5. **Chip-broadcast particle burst** at the decorative stage — brief rain of ~100 small cubes via `<instancedMesh>` with simple vertical physics (`useFrame` loop). Only visible during a small t-window.
6. **More stages** matching real process: grind (lighter concrete + dust haze) → prime (dark wet gloss) → base → broadcast (base + chips settling) → topcoat (final, extra gloss). Needs new branches in `buildInstallStageCanvas`.
7. **Short fade-to-black between big stages** — simple full-screen overlay opacity blip at stage boundaries. Sells "time passed."
8. **Make the overlay show a time-of-day clock** — "6:47 AM", "11:30 AM", "4:12 PM" — tiny monospace label next to the stage caption. Cheap but memorable.

## Working state as of handover

- Dev server: `npm run dev` → http://localhost:3000 (hard-refresh if Turbopack HMR acts weird)
- Git: last known clean against `origin/main`; the user hasn't been committing. Branch before you work.
- No test suite. Verify by eyeballing the Floor Studio section after each change.
- `assetProbe` cache in `FloorRoom.tsx` holds across HMR — if you add GLB/finish assets and the probe cached a false, hard-refresh to clear.

## Suggested first sitting (~half day)

1. Add trim + crown moulding + door jamb (biggest architectural read for the hour)
2. Fix the install stage-label mismatch, add smooth crossfade between stages
3. Camera dolly during install playback

## Gotchas

- `MeshReflectorMaterial` on the floor is expensive and reflects everything above y=0. Adding a ceiling means it reflects down — may look bad. Toggle ceiling off during orbit, or lower `mixStrength` when a ceiling is present.
- Don't place opaque geometry below y=0 — `<ContactShadows>` renders there and will be occluded.
- `installProgress` must be `null` when the animation isn't running, not `0`. The material branches on `null` vs number.
- `FloorRoom` is loaded via `next/dynamic` with `ssr: false` in `FloorStudio.tsx` — all its state is client-only. Any new state in `FloorStudio` itself needs SSR safety (default initial values must match server render).
- `useGLTF` from drei caches aggressively — if you iterate on a GLB file, call `useGLTF.clear(path)` or restart the dev server.

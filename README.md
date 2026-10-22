# 110% Coatings

Marketing website for floor coatings, built with Next.js 16.4.2, React 19 and TypeScript.

## Current experience

- One continuous animated pink/lavender gradient across the homepage, gallery and finish pages, with a CSS fallback and reduced-motion support.
- Transparent original logo and untouched installation photographs.
- Finish explorer, project gallery with image dialog, process, FAQ and project brief form.
- Interactive 3D floor studio: three finish systems, twelve color blends, three room settings, sheen, lighting, camera controls and PNG export.
- The room uses software-backed Canvas 2D with perspective-projected 3D geometry and textured floors. It does not require WebGL. Preview patterns are illustrative, not exact product samples.
- Selected designs carry into the project form. Until a real Formspree endpoint is configured in `lib/site.ts`, the form downloads a project brief and explicitly states that it has not been submitted.

## Run locally

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run start
```

Preview: http://localhost:3000. On PowerShell systems that block `npm.ps1`, use `npm.cmd`.
Development uses `.next-dev`; production builds use `.next`, so building does not overwrite the running development cache.
Read the installed guides in `node_modules/next/dist/docs/` before modifying Next.js APIs.

## Active source files

- `components/Studio.tsx`: shared navigation, sections, gallery, forms and page composition.
- `components/SiteAtmosphere.tsx`, `PrismField.tsx`, `FlowExperience.tsx`: continuous background and opening scene.
- `components/FloorStudio.tsx`, `FloorRoom.tsx`: floor configurator and renderer.
- `lib/design.ts`, `lib/floor-studio.ts`: project/finish content and studio options.
- `app/globals.css`, `luxury.css`, `flow.css`, `floor-studio.css`: styles in root import order.
- `app/work/`, `app/finishes/[slug]/`: gallery and finish routes.
- `public/gallery/`: original job photos.

Other earlier design components remain in the repository but are not the active page composition.
Local screenshots, browser test profiles, logs and retouch experiments are excluded under `output/`.

## Continue later

Preserve the approved gradient palette, transparent logo and original job photographs. The homepage sphere was intentionally removed.
Before public launch, configure real contact details, the Formspree endpoint and the production metadata URL. Confirm finish names and availability with the business.

Browser checks cover floor/color changes, lighting, sheen, camera controls, PNG export and selection transfer to the form. Mobile checks cover narrow phones and tablets. Native-device Safari testing remains a useful follow-up.

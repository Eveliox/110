import { floorSystems, roomNames, sheenNames } from "./floor-studio";

// A shared Floor Studio link (?fs=&fc=&fsh=&fr=) decoded into the design it describes.
export type SharedDesign = { system: number; color: number; sheen: number; room: number };

const index = (value: string | string[] | undefined, length: number) => {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n >= 0 && n < length ? n : -1;
};

export function readSharedDesign(params: Record<string, string | string[] | undefined>): SharedDesign | null {
  const system = floorSystems.findIndex(s => s.id === params.fs);
  if (system < 0) return null;
  return {
    system,
    color: Math.max(0, index(params.fc, floorSystems[system].colors.length)),
    sheen: Math.max(0, index(params.fsh, sheenNames.length)),
    room: Math.max(0, index(params.fr, roomNames.length)),
  };
}

export function describeDesign(d: SharedDesign) {
  const system = floorSystems[d.system], blend = system.colors[d.color];
  return { system, blend, sheen: sheenNames[d.sheen], room: roomNames[d.room], title: `${blend.name} ${system.name.toLowerCase()}` };
}

export const designQuery = (d: SharedDesign) => new URLSearchParams({ fs: floorSystems[d.system].id, fc: String(d.color), fsh: String(d.sheen), fr: String(d.room) }).toString();

// Seeded so the same link always draws the same chip.
function seeded(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

/** The finish as a square SVG sample chip, drawn with filters the image renderer supports. */
export function chipSvg(d: SharedDesign, size = 440) {
  const { blend } = describeDesign(d);
  const { base, accent } = blend;
  const random = seeded(17 + d.system * 31 + d.color * 7);
  let body = "";
  if (d.system === 0) {
    // Metallic: soft pigment blobs (radial fades, since the PNG renderer skips blur filters),
    // pulled into marbling by a turbulence displacement.
    const blobs = Array.from({ length: 22 }, () => `<ellipse cx="${(random() * size).toFixed(0)}" cy="${(random() * size).toFixed(0)}" rx="${(50 + random() * 150).toFixed(0)}" ry="${(18 + random() * 60).toFixed(0)}" fill="url(#${random() > .3 ? "a" : "w"})" opacity="${(.45 + random() * .55).toFixed(2)}" transform="rotate(${(random() * 40 - 20).toFixed(0)} ${size / 2} ${size / 2})"/>`).join("");
    body = `<defs><radialGradient id="a"><stop offset="0" stop-color="${accent}"/><stop offset=".55" stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient><radialGradient id="w"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
      <filter id="m" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="3" seed="${d.color + 3}" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="120"/></filter></defs>
      <rect width="${size}" height="${size}" fill="${base}"/><g filter="url(#m)">${blobs}</g>`;
  } else if (d.system === 1) {
    const palette = [accent, accent, base, base, base, "#2a2d31", "#e9e6df", "#6f7276"];
    const chips = Array.from({ length: 1500 }, () => {
      const x = random() * size, y = random() * size, r = 4 + random() * random() * 13, a = random() * Math.PI * 2, sides = 4 + Math.floor(random() * 3);
      const points = Array.from({ length: sides }, (_, k) => { const t = a + k / sides * Math.PI * 2, rr = r * (.55 + random() * .6); return `${(x + Math.cos(t) * rr).toFixed(1)},${(y + Math.sin(t) * rr * .8).toFixed(1)}`; }).join(" ");
      return `<polygon points="${points}" fill="${palette[Math.floor(random() * palette.length)]}"/>`;
    }).join("");
    body = `<rect width="${size}" height="${size}" fill="${base}"/>${chips}`;
  } else {
    const specks = Array.from({ length: 700 }, () => `<circle cx="${(random() * size).toFixed(1)}" cy="${(random() * size).toFixed(1)}" r="${(.6 + random() * random() * 3).toFixed(1)}" fill="${["#d9d5cc", "#6d6a64", "#a49b8c", "#2f2f2d"][Math.floor(random() * 4)]}" opacity="${(.3 + random() * .5).toFixed(2)}"/>`).join("");
    body = `<defs><filter id="c"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="${d.color + 5}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .22 0"/></filter></defs>
      <rect width="${size}" height="${size}" fill="${base}"/><rect width="${size}" height="${size}" fill="${accent}" opacity=".35" filter="url(#c)"/>${specks}`;
  }
  // Clear topcoat: a diagonal sheen across the chip, stronger for gloss.
  const gloss = [.08, .18, .32][d.sheen];
  body += `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity="${gloss}"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#g)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;
}

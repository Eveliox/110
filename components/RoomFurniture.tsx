"use client";

import { createContext, memo, useContext, useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type V3 = [number, number, number];
type Surface = "oak" | "walnut" | "linen" | "cream" | "metal" | "brass" | "stone" | "felt" | "red" | "rubber";
const Materials = createContext<Record<Surface, THREE.MeshStandardMaterial> | null>(null);

// Small, deterministic, tileable detail maps shared by all furniture in a room.
function detailMap(kind: "wood" | "fabric") {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const grain = Math.sin(y * Math.PI / 8 + Math.sin(x * Math.PI / 64) * 1.5);
    const weave = (x % 4 < 2 ? 1 : -1) * (y % 4 < 2 ? 1 : -1);
    const value = kind === "wood" ? 180 + grain * 35 + Math.sin(y * Math.PI / 2) * 10 : 200 + weave * 23;
    const i = (y * size + x) * 4;
    data[i] = data[i + 1] = data[i + 2] = value; data[i + 3] = 255;
  }
  const map = new THREE.DataTexture(data, size, size);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.magFilter = THREE.LinearFilter; map.minFilter = THREE.LinearMipmapLinearFilter;
  map.generateMipmaps = true; map.repeat.set(kind === "wood" ? 2 : 10, kind === "wood" ? 3 : 10);
  map.needsUpdate = true;
  return map;
}

function Solid({ at = [0, 0, 0], size, surface = "oak", radius = .012, rotation }: { at?: V3; size: V3; surface?: Surface; radius?: number; rotation?: V3 }) {
  const materials = useContext(Materials)!;
  return <RoundedBox position={at} rotation={rotation} args={size} radius={Math.min(radius, ...size.map(v => v * .45))} smoothness={3} material={materials[surface]} castShadow receiveShadow />;
}

function Rod({ from, to, radius = .018, surface = "metal" }: { from: V3; to: V3; radius?: number; surface?: Surface }) {
  const materials = useContext(Materials)!;
  const { midpoint, orientation, length } = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), direction = b.clone().sub(a);
    return { midpoint: a.add(b).multiplyScalar(.5), length: direction.length(), orientation: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()) };
  }, [from, to]);
  return <mesh position={midpoint} quaternion={orientation} material={materials[surface]} castShadow><cylinderGeometry args={[radius, radius, length, 12]} /></mesh>;
}

function Disc({ at, radius, height, surface = "oak" }: { at: V3; radius: number; height: number; surface?: Surface }) {
  const materials = useContext(Materials)!;
  return <mesh position={at} material={materials[surface]} castShadow receiveShadow><cylinderGeometry args={[radius, radius, height, 48]} /></mesh>;
}

function Vessel({ at, scale = 1, color = "#c3ac92" }: { at: V3; scale?: number; color?: string }) {
  const profile = useMemo(() => [[0, 0], [.12, 0], [.18, .04], [.20, .16], [.16, .28], [.08, .35], [.075, .43], [.06, .43], [.065, .35], [.145, .27], [.18, .16], [.16, .05], [0, .035]].map(([x, y]) => new THREE.Vector2(x, y)), []);
  return <mesh position={at} scale={scale} castShadow receiveShadow><latheGeometry args={[profile, 48]} /><meshStandardMaterial color={color} roughness={.38} /></mesh>;
}

function Sofa() {
  return <group position={[-.55, 0, -2.18]}>
    {[-1.08, 1.08].flatMap(x => [-.32, .32].map(z => <Rod key={`${x}-${z}`} from={[x, .02, z]} to={[x * .96, .24, z * .9]} radius={.035} surface="walnut" />))}
    <Solid at={[0, .27, 0]} size={[2.55, .24, .91]} surface="walnut" radius={.055} />
    <Solid at={[0, .64, -.37]} size={[2.48, .66, .24]} surface="linen" radius={.10} />
    {[-.78, 0, .78].map(x => <group key={x}>
      <Solid at={[x, .47, .09]} size={[.75, .22, .72]} surface="cream" radius={.085} />
      <Solid at={[x, .78, -.23]} size={[.74, .47, .22]} rotation={[-.12, 0, 0]} surface="cream" radius={.09} />
      {/* Narrow welt beneath each cushion makes the construction legible. */}
      <Solid at={[x, .405, .09]} size={[.755, .018, .72]} surface="linen" radius={.008} />
    </group>)}
    {[-1.26, 1.26].map(x => <Solid key={x} at={[x, .59, 0]} size={[.2, .53, .96]} surface="linen" radius={.085} />)}
    <Solid at={[-.93, .75, .08]} size={[.34, .34, .15]} rotation={[.12, .1, .22]} surface="linen" radius={.065} />
    <Solid at={[.95, .73, .07]} size={[.32, .32, .16]} rotation={[.1, -.2, -.25]} surface="felt" radius={.06} />
  </group>;
}

function Living() {
  return <group>
    <Sofa />
    <group position={[-.5, 0, -.65]}>
      <Solid at={[0, .43, 0]} size={[1.25, .065, .65]} surface="walnut" radius={.03} />
      {[-.47, .47].flatMap(x => [-.22, .22].map(z => <Rod key={`${x}-${z}`} from={[x * 1.15, .02, z * 1.1]} to={[x, .40, z]} radius={.025} surface="walnut" />))}
      <Solid at={[-.25, .48, .04]} size={[.33, .035, .25]} surface="linen" radius={.005} />
      <Solid at={[-.23, .514, .02]} size={[.29, .025, .23]} rotation={[0, .14, 0]} surface="felt" radius={.005} />
      <Vessel at={[.31, .465, -.06]} scale={.42} />
    </group>
    <Disc at={[1.4, .025, -2.2]} radius={.22} height={.05} surface="metal" />
    <Rod from={[1.4, .05, -2.2]} to={[1.4, 1.68, -2.2]} radius={.016} surface="brass" />
    <mesh position={[1.4, 1.65, -2.2]} castShadow><cylinderGeometry args={[.19, .30, .38, 48, 1, true]} /><meshStandardMaterial color="#ecdfc4" roughness={.95} emissive="#ffd49a" emissiveIntensity={.12} side={THREE.DoubleSide} /></mesh>
    <Disc at={[1.4, 1.45, -2.2]} radius={.29} height={.012} surface="cream" />
  </group>;
}

function DrawerCabinet({ at, width = .8, red = false }: { at: V3; width?: number; red?: boolean }) {
  return <group position={at}>
    <Solid at={[0, .46, 0]} size={[width, .72, .57]} surface="metal" radius={.018} />
    {[0, 1, 2, 3, 4].map(i => <group key={i}>
      <Solid at={[0, .19 + i * .135, .293]} size={[width - .045, .118, .028]} surface={red ? "red" : "stone"} radius={.007} />
      <Rod from={[-width * .32, .23 + i * .135, .33]} to={[width * .32, .23 + i * .135, .33]} radius={.011} />
    </group>)}
    <Solid at={[0, .85, 0]} size={[width + .04, .06, .63]} surface="oak" />
    {[-1, 1].flatMap(x => [-1, 1].map(z => <mesh key={`${x}-${z}`} position={[x * (width / 2 - .08), .065, z * .2]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.06, .06, .035, 20]} /><meshStandardMaterial color="#252729" roughness={.8} /></mesh>))}
  </group>;
}

function Garage() {
  return <group>
    <DrawerCabinet at={[-2.12, 0, -2.48]} /><DrawerCabinet at={[-.38, 0, -2.48]} />
    <Solid at={[-1.25, .9, -2.48]} size={[2.62, .085, .68]} surface="oak" radius={.018} />
    <Solid at={[-1.25, .21, -2.48]} size={[.9, .045, .48]} surface="metal" />
    <DrawerCabinet at={[.92, 0, -2.42]} width={.85} red />
    <group position={[-1.9, .96, -2.4]}>
      <Solid at={[0, .04, 0]} size={[.28, .08, .22]} surface="metal" />
      <Solid at={[0, .14, -.04]} size={[.19, .14, .09]} surface="red" />
      <Solid at={[0, .14, .09]} size={[.19, .14, .05]} surface="metal" />
      <Rod from={[-.19, .1, .18]} to={[.19, .1, .18]} radius={.012} surface="brass" />
    </group>
    <group position={[-2.68, 0, -.8]}>
      {[-.22, .22].flatMap(x => [-.32, .32].map(z => <Solid key={`${x}-${z}`} at={[x, .93, z]} size={[.035, 1.86, .035]} surface="metal" radius={.003} />))}
      {[.18, .72, 1.26, 1.8].map(y => <Solid key={y} at={[0, y, 0]} size={[.5, .035, .7]} surface="metal" radius={.003} />)}
      {[.2, .74, 1.28].map((y, i) => <Solid key={y} at={[0, y + .15, 0]} size={[.38, .3, .48]} surface={i === 1 ? "red" : "stone"} radius={.025} />)}
    </group>
  </group>;
}

function Showroom() {
  return <group>
    {[-1.65, 1.45].map((x, i) => <group key={x} position={[x, 0, -1.7]}>
      <Solid at={[0, .055, 0]} size={[.83, .11, .83]} surface="metal" />
      <Solid at={[0, .54, 0]} size={[.78, .9, .78]} surface="stone" radius={.025} />
      <Solid at={[0, 1.005, 0]} size={[.82, .04, .82]} surface="cream" />
      {i === 0 ? <Vessel at={[0, 1.03, 0]} scale={1.25} /> : <mesh position={[0, 1.39, 0]} rotation={[.15, .25, .3]} castShadow><torusGeometry args={[.23, .065, 20, 64]} /><meshStandardMaterial color="#b08a51" metalness={.75} roughness={.24} /></mesh>}
      <Solid at={[0, .91, .421]} size={[.21, .055, .006]} surface="brass" radius={.002} />
    </group>)}
    <group position={[0, 0, 1.25]}>
      <Solid at={[0, .46, 0]} size={[1.6, .1, .5]} surface="linen" radius={.045} />
      {[-.62, .62].map(x => <group key={x}><Rod from={[x, .02, -.17]} to={[x, .42, -.17]} radius={.02} /><Rod from={[x, .02, .17]} to={[x, .42, .17]} radius={.02} /><Rod from={[x, .05, -.17]} to={[x, .05, .17]} radius={.02} /></group>)}
    </group>
  </group>;
}

function Basement() {
  return <group>
    <group position={[-.15, 0, -.55]}>
      {[-.9, .9].flatMap(x => [-.49, .49].map(z => <Solid key={`${x}-${z}`} at={[x, .33, z]} size={[.15, .66, .15]} surface="walnut" radius={.025} />))}
      <Solid at={[0, .65, 0]} size={[2.35, .23, 1.3]} surface="walnut" radius={.05} />
      <Solid at={[0, .783, 0]} size={[2.13, .028, 1.08]} surface="felt" radius={.025} />
      {[-.61, .61].map(z => <Solid key={z} at={[0, .81, z]} size={[2.35, .09, .12]} surface="walnut" radius={.035} />)}
      {[-1.12, 1.12].map(x => <Solid key={x} at={[x, .81, 0]} size={[.12, .09, 1.13]} surface="walnut" radius={.035} />)}
      {[-1.04, 0, 1.04].flatMap(x => [-.51, .51].map(z => <group key={`${x}-${z}`}>
        <Disc at={[x, .802, z]} radius={.068} height={.008} surface="rubber" />
        <mesh position={[x, .80, z]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.067, .01, 8, 20]} /><meshStandardMaterial color="#281e18" roughness={.85} /></mesh>
      </group>))}
      {[[-.45, .1], [.5, -.12], [.56, -.02], [.56, -.22]].map(([x, z], i) => <mesh key={i} position={[x, .826, z]} castShadow><sphereGeometry args={[.028, 20, 12]} /><meshStandardMaterial color={["#ede9d7", "#b08e2f", "#9b332c", "#284771"][i]} roughness={.2} /></mesh>)}
      <Rod from={[-.8, .87, .58]} to={[.85, .87, .58]} radius={.007} surface="oak" />
    </group>
    <group position={[-1.95, 0, -2.5]}>
      <Solid at={[0, .46, 0]} size={[1.55, .78, .48]} surface="walnut" />
      {[-.38, .38].map(x => <group key={x}><Solid at={[x, .46, .25]} size={[.73, .69, .025]} surface="oak" /><Rod from={[x + .25, .50, .29]} to={[x + .25, .66, .29]} radius={.009} surface="brass" /></group>)}
      <Solid at={[0, .87, 0]} size={[1.62, .045, .54]} surface="stone" />
    </group>
  </group>;
}

function OutdoorChair({ at, angle }: { at: V3; angle: number }) {
  return <group position={at} rotation={[0, angle, 0]}>
    {[-.26, .26].flatMap(x => [-.24, .24].map(z => <Rod key={`${x}-${z}`} from={[x * 1.12, .02, z * 1.12]} to={[x, z < 0 ? .94 : .46, z]} radius={.022} surface="oak" />))}
    <Solid at={[0, .44, 0]} size={[.58, .055, .55]} surface="oak" />
    <Solid at={[0, .50, .01]} size={[.52, .09, .49]} surface="cream" radius={.035} />
    {Array.from({ length: 5 }, (_, i) => <Solid key={i} at={[-.22 + i * .11, .75, -.25]} size={[.075, .38, .035]} rotation={[-.1, 0, 0]} surface="oak" />)}
    {[-.28, .28].map(x => <Solid key={x} at={[x, .68, 0]} size={[.055, .04, .6]} surface="oak" />)}
  </group>;
}

function Patio() {
  return <group>
    <group position={[-.55, 0, -.7]}>
      {Array.from({ length: 9 }, (_, i) => <Solid key={i} at={[-.56 + i * .14, .75, 0]} size={[.126, .045, .9]} surface="oak" radius={.008} />)}
      {[-.48, .48].flatMap(x => [-.32, .32].map(z => <Rod key={`${x}-${z}`} from={[x * 1.1, .02, z * 1.1]} to={[x, .73, z]} radius={.027} surface="metal" />))}
      <Vessel at={[0, .78, 0]} scale={.42} color="#b1b7a2" />
    </group>
    <OutdoorChair at={[-.55, 0, .35]} angle={Math.PI} /><OutdoorChair at={[-.55, 0, -1.75]} angle={0} />
    <group position={[2, 0, -2.3]}>
      <Solid at={[0, .46, 0]} size={[.9, .7, .5]} surface="metal" radius={.04} />
      <Solid at={[0, .85, 0]} size={[1.04, .1, .6]} surface="metal" radius={.025} />
      <Solid at={[0, 1.03, -.04]} size={[.94, .34, .52]} surface="metal" radius={.14} />
      <Rod from={[-.29, 1.04, .27]} to={[.29, 1.04, .27]} radius={.023} surface="brass" />
      {[-.28, 0, .28].map(x => <mesh key={x} position={[x, .82, .32]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.033, .033, .025, 20]} /><meshStandardMaterial color="#bdc4c6" metalness={.85} roughness={.25} /></mesh>)}
      <Solid at={[-.71, .84, 0]} size={[.4, .04, .5]} surface="walnut" />
      {[-.35, .35].map(x => <Disc key={x} at={[x, .05, 0]} radius={.06} height={.1} surface="rubber" />)}
    </group>
  </group>;
}

export const RoomFurniture = memo(function RoomFurniture({ room }: { room: number }) {
  const resources = useMemo(() => {
    const wood = detailMap("wood"), fabric = detailMap("fabric");
    const material = (color: string, roughness: number, metalness = 0, map?: THREE.Texture) => new THREE.MeshStandardMaterial({ color, roughness, metalness, map, bumpMap: map, bumpScale: map === fabric ? .002 : .001 });
    const materials: Record<Surface, THREE.MeshStandardMaterial> = {
      oak: material("#bc9565", .55, 0, wood), walnut: material("#705039", .43, 0, wood),
      linen: material("#b8a38a", .95, 0, fabric), cream: material("#e4d8c2", .95, 0, fabric),
      felt: material("#456257", .98, 0, fabric), stone: material("#c5c2b7", .62),
      metal: material("#394147", .32, .75), brass: material("#bc995c", .27, .8),
      red: material("#8f3b2d", .36, .4), rubber: material("#171b1a", .95),
    };
    return { materials, wood, fabric };
  }, []);
  useEffect(() => () => { Object.values(resources.materials).forEach(m => m.dispose()); resources.wood.dispose(); resources.fabric.dispose(); }, [resources]);
  return <Materials.Provider value={resources.materials}>
    {room === 0 ? <Living /> : room === 1 ? <Garage /> : room === 2 ? <Showroom /> : room === 3 ? <Basement /> : <Patio />}
  </Materials.Provider>;
});

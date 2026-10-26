"use client";

import { useEffect, useMemo } from "react";
import { Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { RoomPlant as Plant, Curtain } from "./RoomPlant";
import { buildNormalCanvas } from "@/lib/finish-texture";

function Box({ at, size, color, glow = 0 }: { at: [number, number, number]; size: [number, number, number]; color: string; glow?: number }) {
  return <mesh position={at} castShadow={!glow} receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.68} emissive={color} emissiveIntensity={glow} /></mesh>;
}

function Artwork({ x, width = 1.25, color = "#bc9875" }: { x: number; width?: number; color?: string }) {
  return <group position={[x, 1.93, -2.9]}>
    <Box at={[0, 0, 0]} size={[width, .83, .045]} color="#3c302b" />
    <Box at={[0, 0, .028]} size={[width - .06, .77, .015]} color="#e9dfcd" />
    <mesh position={[-.12, .04, .04]} scale={[width * .3, .27, 1]}><circleGeometry args={[1, 40]} /><meshStandardMaterial color={color} /></mesh>
    <Box at={[width * .19, -.1, .044]} size={[width * .22, .43, .008]} color="#777e70" />
  </group>;
}

export function RoomArchitecture({ room, daylight, firstPerson }: { room: number; daylight: number; firstPerson: boolean }) {
  const normal = useMemo(() => {
    const t = new THREE.CanvasTexture(buildNormalCanvas(1));
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 3);
    return t;
  }, []);
  useEffect(() => () => normal.dispose(), [normal]);
  const industrial = room === 1;
  const patio = room === 4;
  const wall = ["#ddd5c7", "#c3c7c5", "#e3ded4", "#b4b2a9", "#c5b498"][room];
  const trim = industrial ? "#444b4d" : room === 3 ? "#5e5145" : "#efe8dd";
  const lamp = industrial ? "#d5e9ff" : "#ffe0ab";
  const glow = .5 + Math.max(0, daylight - .5) * 3;
  return <group>
    <mesh position={[0, -.085, 0]} receiveShadow><boxGeometry args={[6.12, .16, 6.12]} /><meshStandardMaterial color="#57524c" roughness={.9} /></mesh>
    <mesh position={[0, 1.4, -3]} receiveShadow><planeGeometry args={[6, 2.8]} /><meshStandardMaterial color={wall} normalMap={normal} normalScale={new THREE.Vector2(.1, .1)} roughness={.92} /></mesh>
    {!patio && <mesh position={[-3, 1.4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[6, 2.8]} /><meshStandardMaterial color={wall} normalMap={normal} normalScale={new THREE.Vector2(.1, .1)} roughness={.92} /></mesh>}
    <Box at={[0, .06, -2.965]} size={[6, .12, .06]} color={trim} />
    {!patio && <Box at={[-2.965, .06, 0]} size={[.06, .12, 6]} color={trim} />}
    <Box at={[0, 2.73, -2.94]} size={[6, .14, .12]} color={trim} />
    {!patio && <Box at={[-2.94, 2.73, 0]} size={[.12, .14, 6]} color={trim} />}
    {/* One-sided ceiling: open dollhouse from above, enclosed from walk mode. */}
    {!patio && <mesh position={[0, 2.81, 0]} rotation={[Math.PI / 2, 0, 0]} visible={firstPerson} receiveShadow><planeGeometry args={[6, 6]} /><meshStandardMaterial color="#dedbd3" roughness={.92} /></mesh>}
    {!patio && <group position={[-2.91, industrial || room === 3 ? 2.12 : 1.65, .35]} rotation={[0, Math.PI / 2, 0]}>
      <Box at={[0, 0, -.01]} size={[2.5, industrial || room === 3 ? .65 : 1.5, .09]} color="#48545c" />
      <mesh position={[0, 0, .045]}><planeGeometry args={[2.36, industrial || room === 3 ? .51 : 1.36]} /><meshStandardMaterial color={daylight > .75 ? "#263c53" : "#bbd4de"} emissive={daylight > .75 ? "#29415b" : "#c2dde5"} emissiveIntensity={daylight > .75 ? .1 : .35} roughness={.22} /></mesh>
      {[-1.23, 0, 1.23].map(x => <Box key={x} at={[x, 0, .07]} size={[.045, industrial || room === 3 ? .65 : 1.5, .06]} color={trim} />)}
      <Box at={[0, 0, .07]} size={[2.5, .045, .06]} color={trim} />
      <Box at={[0, industrial || room === 3 ? -.36 : -.8, .09]} size={[2.65, .07, .23]} color={trim} />
      {room === 0 && [-1.43, 1.43].map(x => <Curtain key={x} x={x} />)}
    </group>}
    {room !== 2 && !patio && <group position={[2.28, 0, -2.91]}>
      <Box at={[0, 1.08, 0]} size={[.95, 2.16, .07]} color={industrial ? "#697473" : "#a0927d"} />
      {[-.51, .51].map(x => <Box key={x} at={[x, 1.1, .04]} size={[.065, 2.2, .07]} color={trim} />)}
      <Box at={[0, 2.2, .04]} size={[1.09, .07, .07]} color={trim} />
      <Box at={[-.31, 1.02, .09]} size={[.13, .025, .06]} color="#b5ad96" />
    </group>}
    {(industrial || room === 2 || room === 3) && [-1.55, 1.55].map(x => <group key={x}>
      <Box at={[x, 2.77, -.7]} size={[.14, .07, 2.8]} color="#414343" />
      <Box at={[x, 2.72, -.7]} size={[.09, .025, 2.65]} color={lamp} glow={glow} />
      <pointLight position={[x, 2.5, -.7]} color={lamp} intensity={daylight > .75 ? 3 : 1} distance={5} decay={2} />
    </group>)}
    {room === 0 && <>
      <pointLight position={[1.4, 1.65, -2.2]} color="#ffce8c" intensity={daylight > .65 ? 3 : .5} distance={5} decay={2} />
      <Artwork x={-.65} width={1.8} />
      <Plant at={[-2.35, 0, -1.3]} scale={1.3} />
      <group position={[1.96, 0, -.55]} rotation={[0, -.32, 0]}>
        <RoundedBox args={[.85, .5, .42]} radius={.035} position={[0, .31, 0]} castShadow><meshStandardMaterial color="#70533c" roughness={.65} /></RoundedBox>
        <Box at={[0, .98, 0]} size={[1.12, .67, .065]} color="#161a1c" />
        <Box at={[0, .98, .039]} size={[1.04, .59, .012]} color="#263b44" />
        <Box at={[0, .6, 0]} size={[.25, .06, .18]} color="#26292a" />
      </group>
    </>}
    {industrial && <>
      <Box at={[-1.35, 1.65, -2.9]} size={[2.5, 1.03, .05]} color="#6c6657" />
      {Array.from({ length: 48 }, (_, i) => <Box key={i} at={[-2.45 + i % 12 * .2, 1.28 + Math.floor(i / 12) * .22, -2.866]} size={[.025, .025, .008]} color="#343735" />)}
      {Array.from({ length: 6 }, (_, i) => <group key={i} position={[-2.25 + i * .36, 1.7, -2.81]} rotation={[0, 0, i % 2 ? -.15 : .12]}><Box at={[0, 0, 0]} size={[.035, .4, .045]} color="#bfc3be" /><Box at={[0, -.16, .01]} size={[.07, .18, .06]} color={i % 2 ? "#b54b35" : "#303d45"} /><Box at={[.04, .2, 0]} size={[.15, .06, .05]} color="#9da4a3" /></group>)}
      {[0, 1, 2].map(i => <mesh key={i} position={[-2.33, .17 + i * .27, 1.65]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[.31, .12, 12, 32]} /><meshStandardMaterial color="#262729" roughness={.92} /></mesh>)}
    </>}
    {room === 2 && <>
      {[-1, 0, 1].map((x, i) => <group key={x} position={[x * .85, 1.85, -2.85]}><Box at={[0, 0, 0]} size={[.65, .8, .09]} color="#38352f" /><Box at={[0, 0, .05]} size={[.57, .72, .02]} color={["#929893", "#c5b091", "#555f69"][i]} /></group>)}
      <Plant at={[2.45, 0, .7]} />
      {Array.from({ length: 17 }, (_, i) => <Box key={i} at={[-2.75 + i * .075, 1.4, -2.88]} size={[.035, 2.6, .08]} color="#a98a65" />)}
    </>}
    {room === 3 && <>
      <group position={[-1.85, 1.8, -2.88]}>{[.38, .31, .23, .13, .045].map((r, i) => <mesh key={r} position={[0, 0, i * .008]}><circleGeometry args={[r, 40]} /><meshStandardMaterial color={["#292b27", "#c2af83", "#46594d", "#c2af83", "#964f39"][i]} /></mesh>)}</group>
      <Box at={[1.05, .43, -2.48]} size={[.6, .86, .57]} color="#737b7c" />
      <Box at={[1.24, .65, -2.18]} size={[.035, .23, .04]} color="#dadbd1" />

    </>}
    {patio && <>
      {[-2.88, 2.88].map(x => <Box key={x} at={[x, 1.4, -2.75]} size={[.14, 2.8, .14]} color="#746049" />)}
      <Box at={[0, 2.77, -2.75]} size={[5.9, .14, .16]} color="#746049" />
      <Line points={Array.from({ length: 25 }, (_, i) => { const x = -2.8 + i * 5.6 / 24; return [x, 2.72 - .36 * (1 - (x / 2.8) ** 2), -2.5] as [number, number, number]; })} color="#39362d" lineWidth={1.5} />
      {Array.from({ length: 11 }, (_, i) => { const x = -2.65 + i * .53; return <mesh key={i} position={[x, 2.62 - .36 * (1 - (x / 2.8) ** 2), -2.5]}><sphereGeometry args={[.045, 12, 8]} /><meshStandardMaterial color="#ffe3ac" emissive="#ffc778" emissiveIntensity={2} /></mesh>; })}
      <Plant at={[-2.45, 0, .7]} scale={1.6} /><Plant at={[-1.95, 0, 1.3]} /><Plant at={[2.4, 0, -.4]} scale={1.3} />
      {Array.from({ length: 8 }, (_, i) => <Box key={i} at={[-2.96, .45 + i * .16, 0]} size={[.07, .09, 5.8]} color="#9c8c70" />)}
      <pointLight position={[0, 2.4, -2]} color="#ffd6a0" intensity={2} distance={6} />
    </>}
  </group>;
}

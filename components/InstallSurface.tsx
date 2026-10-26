"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildFinishCanvas, buildInstallStageCanvas } from "@/lib/finish-texture";
import { smoothProgress } from "@/lib/install-sequence";
import type { RoomAppearance } from "./FloorRoom";

// This layer uses a single material and three cached maps. Only uniforms change
// during playback; the reflective finished floor remains underneath it.
export function InstallSurface({ appearance, reducedMotion = false }: { appearance: RoomAppearance; reducedMotion?: boolean }) {
  const progress = appearance.installProgress ?? 1;
  const layer = useMemo(() => {
    const maps = [buildInstallStageCanvas(0, appearance.system, appearance.base, appearance.accent), buildInstallStageCanvas(.5, appearance.system, appearance.base, appearance.accent), buildFinishCanvas(appearance.system, appearance.base, appearance.accent)].map(canvas => {
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
      return texture;
    });
    const uniforms = { installProgress: { value: 0 }, calmMotion: { value: 0 }, baseMap: { value: maps[1] }, finishMap: { value: maps[2] } };
    const material = new THREE.MeshStandardMaterial({ map: maps[0], roughness: .92, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.fragmentShader = `uniform float installProgress; uniform float calmMotion; uniform sampler2D baseMap; uniform sampler2D finishMap;\n${shader.fragmentShader}`;
      shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `
        float lane = min(5.0, floor(vMapUv.x * 6.0));
        float travel = mod(lane, 2.0) < 1.0 ? 1.0 - vMapUv.y : vMapUv.y;
        float sweep = (lane + travel) / 6.0;
        float prime = 1.0 - smoothstep((installProgress - .25) * 4.8 - .008, (installProgress - .25) * 4.8 + .008, sweep);
        float finish = 1.0 - smoothstep((installProgress - .50) * 4.8 - .008, (installProgress - .50) * 4.8 + .008, sweep);
        prime = mix(prime, smoothstep(.25, .48, installProgress), calmMotion);
        finish = mix(finish, smoothstep(.50, .73, installProgress), calmMotion);
        vec4 concrete = texture2D(map, vMapUv);
        concrete.rgb *= 1.0 + .12 * smoothstep(0.0, .22, installProgress);
        diffuseColor *= mix(mix(concrete, texture2D(baseMap, vMapUv), prime), texture2D(finishMap, vMapUv), finish);
      `);
    };
    return { maps, material, uniforms };
  }, [appearance.system, appearance.base, appearance.accent]);
  useEffect(() => () => { layer.maps.forEach(t => t.dispose()); layer.material.dispose(); }, [layer]);
  // Three.js GPU resources are intentionally mutable outside React rendering.
  /* eslint-disable react-hooks/immutability */
  useFrame(() => {
    layer.uniforms.installProgress.value = progress;
    layer.uniforms.calmMotion.value = reducedMotion ? 1 : 0;
    layer.material.opacity = 1 - smoothProgress((progress - .76) / .22);
    layer.material.roughness = .92 - .5 * smoothProgress((progress - .25) / .22);
  });
  /* eslint-enable react-hooks/immutability */
  const phase = Math.min(3, Math.floor(progress * 4));
  const pass = Math.min(5.999, (progress - phase / 4) * 4.8 * 6);
  const lane = Math.floor(pass);
  const travel = lane % 2 === 0 ? pass - lane : 1 - (pass - lane);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .009, 0]} receiveShadow material={layer.material}><planeGeometry args={[6, 6]} /></mesh>
    {!reducedMotion && progress > .02 && progress < .94 && <group position={[-2.5 + lane, .1, -2.8 + travel * 5.6]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.075, .075, .96, 32]} /><meshStandardMaterial color={phase === 0 ? "#7f898d" : phase === 2 ? appearance.accent : "#d6cbbb"} roughness={.55} metalness={phase === 0 ? .6 : .1} /></mesh>
      <mesh position={[0, .4, .25]} rotation={[.55, 0, 0]} castShadow><cylinderGeometry args={[.018, .018, .85, 12]} /><meshStandardMaterial color="#b5b7b1" metalness={.75} roughness={.3} /></mesh>
      <mesh position={[0, .78, .48]} rotation={[.55, 0, 0]}><cylinderGeometry args={[.028, .028, .18, 12]} /><meshStandardMaterial color="#393c3e" /></mesh>
    </group>}
    {!reducedMotion && appearance.system === 1 && <Broadcast progress={progress} accent={appearance.accent} />}
  </group>;
}

function Broadcast({ progress, accent }: { progress: number; accent: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.visible = progress >= .5 && progress < .75;
    if (!mesh.current.visible) return;
    for (let i = 0; i < 100; i++) {
      const phase = ((progress - .5) * 14 + i * .618) % 1;
      dummy.position.set(Math.sin(i * 127.1) * 2.8, .025 + (1 - phase) ** 2 * 1.5, Math.cos(i * 311.7) * 2.8);
      dummy.rotation.set(i + phase * 3, i * .7, phase * 5);
      dummy.scale.setScalar(.018 + (i % 4) * .006);
      dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[undefined, undefined, 100]} frustumCulled={false}><boxGeometry args={[1, .15, 1]} /><meshStandardMaterial color={accent} roughness={.8} /></instancedMesh>;
}

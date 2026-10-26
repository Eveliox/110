"use client";

import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";

export const RoomPlant = memo(function RoomPlant({ at, scale = 1 }: { at: [number, number, number]; scale?: number }) {
  const geometry = useMemo(() => {
    const vertices: number[] = [], indices: number[] = [], uvs: number[] = [];
    const rows = 14, columns = 6;
    for (let row = 0; row <= rows; row++) {
      const t = row / rows;
      const width = .14 * Math.sin(Math.PI * t) ** .7;
      for (let col = 0; col <= columns; col++) {
        const u = col / columns * 2 - 1;
        // A tapered blade with a central rib, cupped edges and a drooping tip.
        vertices.push(u * width, t * .58, .13 * Math.sin(t * Math.PI) - .14 * t * t + Math.abs(u) * .035 * Math.sin(t * Math.PI));
        uvs.push(col / columns, t);
        if (row < rows && col < columns) {
          const a = row * (columns + 1) + col, b = a + columns + 1;
          indices.push(a, b, a + 1, a + 1, b, b + 1);
        }
      }
    }
    const leaf = new THREE.BufferGeometry();
    leaf.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    leaf.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    leaf.setIndex(indices); leaf.computeVertexNormals();
    return leaf;
  }, []);
  const profile = useMemo(() => [[.13, 0], [.16, .025], [.21, .40], [.225, .42], [.225, .45], [.195, .45], [.18, .39], [.13, .055]].map(([x, y]) => new THREE.Vector2(x, y)), []);
  const leaves = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const angle = i * 2.39996, height = .58 + i % 5 * .13;
    const end = new THREE.Vector3(Math.cos(angle) * .18, height, Math.sin(angle) * .18);
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, .43, 0), new THREE.Vector3(end.x * .3, height, end.z * .3), end);
    return { angle, height, end, stem: new THREE.TubeGeometry(curve, 10, .006, 5, false) };
  }), []);
  useEffect(() => () => { geometry.dispose(); leaves.forEach(l => l.stem.dispose()); }, [geometry, leaves]);
  return <group position={at} scale={scale}>
    <mesh castShadow receiveShadow><latheGeometry args={[profile, 48]} /><meshStandardMaterial color="#b39279" roughness={.84} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, .405, 0]}><cylinderGeometry args={[.185, .185, .02, 32]} /><meshStandardMaterial color="#352d24" roughness={1} /></mesh>
    {leaves.map((leaf, i) => <group key={i}>
      <mesh geometry={leaf.stem} dispose={null}><meshStandardMaterial color="#57613c" roughness={.85} /></mesh>
      <mesh position={leaf.end} rotation={[.55 + i % 3 * .15, -leaf.angle, .2]} geometry={geometry} dispose={null} castShadow receiveShadow>
        <meshStandardMaterial color={i % 3 === 0 ? "#697c42" : "#405b35"} roughness={.66} side={THREE.DoubleSide} />
      </mesh>
    </group>)}
  </group>;
});

export function Curtain({ x }: { x: number }) {
  const geometry = useMemo(() => {
    const mesh = new THREE.PlaneGeometry(.39, 2.05, 32, 20);
    const positions = mesh.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const px = positions.getX(i), py = positions.getY(i);
      positions.setZ(i, Math.cos(px / .39 * Math.PI * 10) * (.022 + (1 - (py + 1.025) / 2.05) * .018));
      positions.setX(i, px * (1 + (1 - (py + 1.025) / 2.05) * .16));
    }
    mesh.computeVertexNormals(); return mesh;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh position={[x, -.28, .14]} geometry={geometry} dispose={null} castShadow receiveShadow><meshStandardMaterial color="#c9baa0" roughness={1} side={THREE.DoubleSide} /></mesh>;
}

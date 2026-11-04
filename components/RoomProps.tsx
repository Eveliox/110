"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Clone, useGLTF } from "@react-three/drei";

type V3 = [number, number, number];

// Real furniture scans from Poly Haven (CC0, see public/models/CREDITS.md), compressed with
// meshopt + WebP. Draco is off so nothing is fetched from a decoder CDN.
const modelPath = (id: string) => `/models/${id}.glb`;

class LoadFailure extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Model({ id, at, rotation, scale }: { id: string; at: V3; rotation: number; scale: number }) {
  const { scene } = useGLTF(modelPath(id), false, true);
  return <Clone object={scene} position={at} rotation={[0, rotation, 0]} scale={scale} castShadow receiveShadow />;
}

/** A real model, with the procedural stand-in shown while it loads or if it can't be loaded. */
export function Prop({ id, at, rotation = 0, scale = 1, fallback = null }: { id: string; at: V3; rotation?: number; scale?: number; fallback?: ReactNode }) {
  return <LoadFailure fallback={fallback}>
    <Suspense fallback={fallback}><Model id={id} at={at} rotation={rotation} scale={scale} /></Suspense>
  </LoadFailure>;
}

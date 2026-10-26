"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type PointerEvent, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, SMAA } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";
import { buildFinishCanvas, buildNormalCanvas, buildRoughnessCanvas, finishPhotoPath, roomGlbPath } from "@/lib/finish-texture";
import { RoomFurniture } from "./RoomFurniture";
import { RoomArchitecture } from "./RoomArchitecture";
import { InstallSurface } from "./InstallSurface";
import { installLabels, installPhase, installClock } from "@/lib/install-sequence";
import { floorSystems, resolveLighting } from "@/lib/floor-studio";

export type RoomAppearance = {
  system: number;
  base: string;
  accent: string;
  sheen: number;
  room: number;
  yaw: number;
  elevation: number;
  zoom: number;
  daylight: number;
  firstPerson: boolean;
  installProgress: number | null;
};

const assetProbe = new Map<string, Promise<boolean>>();
function assetExists(path: string): Promise<boolean> {
  if (!assetProbe.has(path)) {
    assetProbe.set(path, fetch(path, { method: "HEAD" }).then(r => {
      if (!r.ok) return false;
      const ct = (r.headers.get("content-type") || "").toLowerCase();
      return !ct.startsWith("text/html") && !ct.startsWith("application/json");
    }).catch(() => false));
  }
  return assetProbe.get(path)!;
}

function FloorMaterial({ appearance }: { appearance: RoomAppearance }) {
  const colorName = useMemo(() => {
    const sys = floorSystems[appearance.system];
    return sys?.colors.find(c => c.base === appearance.base && c.accent === appearance.accent)?.name ?? "";
  }, [appearance.system, appearance.base, appearance.accent]);
  const [photoMap, setPhotoMap] = useState<THREE.Texture | null>(null);
  const [photoNormal, setPhotoNormal] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const sysId = floorSystems[appearance.system]?.id;
    if (!sysId || !colorName) return;
    const mapUrl = finishPhotoPath(sysId, colorName, "map");
    const normalUrl = finishPhotoPath(sysId, colorName, "normal");
    let disposed = false;
    (async () => {
      if (!(await assetExists(mapUrl))) return;
      new THREE.TextureLoader().load(mapUrl, (tex) => {
        if (disposed) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 8;
        setPhotoMap(tex);
      });
      if (await assetExists(normalUrl)) {
        new THREE.TextureLoader().load(normalUrl, (tex) => {
          if (disposed) { tex.dispose(); return; }
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.anisotropy = 8;
          setPhotoNormal(tex);
        });
      }
    })();
    return () => {
      disposed = true;
      setPhotoMap(prev => { prev?.dispose(); return null; });
      setPhotoNormal(prev => { prev?.dispose(); return null; });
    };
  }, [appearance.system, colorName]);

  const colorTexture = useMemo(() => {
    if (photoMap) return photoMap;
    const tex = new THREE.CanvasTexture(buildFinishCanvas(appearance.system, appearance.base, appearance.accent));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
  }, [photoMap, appearance.system, appearance.base, appearance.accent]);
  const roughnessTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(buildRoughnessCanvas(appearance.system));
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
  }, [appearance.system]);
  const normalTexture = useMemo(() => {
    if (photoNormal) return photoNormal;
    const tex = new THREE.CanvasTexture(buildNormalCanvas(appearance.system));
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
  }, [photoNormal, appearance.system]);
  useEffect(() => {
    const owned = !photoMap;
    return () => { if (owned) colorTexture.dispose(); };
  }, [colorTexture, photoMap]);
  useEffect(() => () => { roughnessTexture.dispose(); }, [roughnessTexture]);
  useEffect(() => {
    const owned = !photoNormal;
    return () => { if (owned) normalTexture.dispose(); };
  }, [normalTexture, photoNormal]);

  const sheen = appearance.sheen;
  const stageAtFinish = true;
  const baseRoughness = appearance.system === 0 ? 0.26 : appearance.system === 1 ? 0.78 : 0.55;
  const roughness = THREE.MathUtils.clamp(baseRoughness - sheen * 0.22, 0.04, 0.95);
  const metalness = appearance.system === 0 ? 0.55 : 0.08;
  const mirrorStrength = stageAtFinish
    ? (appearance.system === 0 ? 70 + sheen * 90 : appearance.system === 2 ? sheen * 55 : sheen * 18)
    : 10;
  const mirror = stageAtFinish
    ? (appearance.system === 0 ? 0.55 + sheen * 0.4 : appearance.system === 2 ? 0.1 + sheen * 0.45 : 0.08 + sheen * 0.15)
    : 0.08;
  const blurAmount = sheen > 0.6 ? 180 : sheen > 0.2 ? 400 : 800;

  return (
    <MeshReflectorMaterial
      map={colorTexture}
      normalMap={normalTexture}
      normalScale={new THREE.Vector2(photoNormal ? 0.6 : 0.35, photoNormal ? 0.6 : 0.35)}
      roughnessMap={roughnessTexture}
      roughness={roughness}
      metalness={metalness}
      color="#ffffff"
      resolution={1024}
      blur={[blurAmount, blurAmount * 0.6]}
      mixBlur={1.2}
      mixStrength={mirrorStrength}
      mirror={mirror}
      depthScale={1}
      minDepthThreshold={0.4}
      maxDepthThreshold={1.5}
      envMapIntensity={0.9}
    />
  );
}

function Floor({ appearance }: { appearance: RoomAppearance }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[6, 6, 1, 1]} />
      <FloorMaterial appearance={appearance} />
    </mesh>
  );
}

function GltfRoomMesh({ path }: { path: string }) {
  const gltf = useGLTF(path);
  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [gltf]);
  return <primitive object={gltf.scene} />;
}

function RoomShell({ appearance, wallTint }: { appearance: RoomAppearance; wallTint: string }) {
  const path = roomGlbPath(appearance.room);
  const [asset, setAsset] = useState<{ path: string; exists: boolean } | null>(null);
  useEffect(() => {
    let cancelled = false;
    assetExists(path).then((exists) => { if (!cancelled) setAsset({ path, exists }); });
    return () => { cancelled = true; };
  }, [path]);
  if (asset?.path === path && asset.exists) {
    return (
      <Suspense fallback={<ProceduralRoom appearance={appearance} wallTint={wallTint} />}>
        <GltfRoomMesh path={path} />
      </Suspense>
    );
  }
  return <ProceduralRoom appearance={appearance} wallTint={wallTint} />;
}

function ProceduralRoom({ appearance }: { appearance: RoomAppearance; wallTint: string }) {
  return (
    <>
      <RoomArchitecture room={appearance.room} daylight={appearance.daylight} firstPerson={appearance.firstPerson} />
      <RoomFurniture room={appearance.room} />
    </>
  );
}

function OrbitCameraRig({ yaw, elevation, zoom, interactionAt, installProgress, reducedMotion }: { installProgress: number | null; reducedMotion: boolean; yaw: number; elevation: number; zoom: number; interactionAt: RefObject<number> }) {
  const { camera } = useThree();
  const driftRef = useRef(0);
  useFrame((_, delta) => {
    const now = performance.now();
    const idleFor = now - interactionAt.current;
    let effectiveYaw = yaw;
    if (idleFor > 3000 && installProgress === null && !reducedMotion) {
      driftRef.current += delta;
      effectiveYaw = yaw + Math.sin(driftRef.current * 0.25) * 4;
    } else {
      driftRef.current = 0;
    }
    const y = effectiveYaw * Math.PI / 180;
    const dolly = installProgress === null || reducedMotion ? 0 : Math.sin(installProgress * Math.PI) ** 2;
    const e = (elevation - dolly * 6) * Math.PI / 180;
    const distance = zoom - dolly * .65;
    camera.position.set(Math.sin(y) * Math.cos(e) * distance, 0.9 + Math.sin(e) * distance, Math.cos(y) * Math.cos(e) * distance);
    camera.lookAt(0, 0.6, 0);
  });
  return null;
}

function FirstPersonRig({ yaw, elevation }: { yaw: number; elevation: number }) {
  const { camera } = useThree();
  const walker = useRef({ x: 0, z: 2.2, keys: new Set<string>() });
  useEffect(() => {
    const down = (ev: KeyboardEvent) => {
      const key = ev.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        walker.current.keys.add(key);
        ev.preventDefault();
      }
    };
    const up = (ev: KeyboardEvent) => {
      walker.current.keys.delete(ev.key.toLowerCase());
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  useFrame((_, delta) => {
    const w = walker.current;
    const speed = 2 * delta;
    const yawRad = yaw * Math.PI / 180;
    const forwardX = -Math.sin(yawRad), forwardZ = -Math.cos(yawRad);
    const strafeX = Math.cos(yawRad), strafeZ = -Math.sin(yawRad);
    const forward = (w.keys.has("w") || w.keys.has("arrowup") ? 1 : 0) - (w.keys.has("s") || w.keys.has("arrowdown") ? 1 : 0);
    const strafe = (w.keys.has("d") || w.keys.has("arrowright") ? 1 : 0) - (w.keys.has("a") || w.keys.has("arrowleft") ? 1 : 0);
    w.x = Math.max(-2.7, Math.min(2.7, w.x + (forwardX * forward + strafeX * strafe) * speed));
    w.z = Math.max(-2.7, Math.min(2.7, w.z + (forwardZ * forward + strafeZ * strafe) * speed));
    camera.position.set(w.x, 1.65, w.z);
    const pitch = -(elevation - 45) * Math.PI / 180 * 0.6;
    const lookDist = 5;
    camera.lookAt(w.x + forwardX * lookDist, 1.65 + Math.tan(pitch) * lookDist, w.z + forwardZ * lookDist);
  });
  return null;
}

function Exporter({ exportRef }: { exportRef: RefObject<(() => void) | null> }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    exportRef.current = () => {
      gl.render(scene, camera);
      const src = gl.domElement;
      const out = document.createElement("canvas");
      out.width = Math.max(src.width, 900);
      out.height = Math.round(src.height * out.width / src.width) + 72;
      const c = out.getContext("2d")!;
      c.fillStyle = "#17121e";
      c.fillRect(0, 0, out.width, out.height);
      c.drawImage(src, 0, 0, out.width, out.height - 72);
      c.fillStyle = "#eee4f4"; c.font = "14px sans-serif";
      c.fillText("110% COATINGS / FLOOR STUDIO", 22, out.height - 42);
      c.font = "11px sans-serif";
      c.fillText("Illustrative concept. Confirm final color, pattern and sheen with a physical sample.", 22, out.height - 20);
      const link = document.createElement("a");
      link.download = "110-coatings-floor-concept.png";
      link.href = out.toDataURL("image/png");
      link.click();
    };
    return () => { exportRef.current = null; };
  }, [gl, scene, camera, exportRef]);
  return null;
}

export function FloorRoom({ appearance: inputAppearance, onOrbit, exportRef }: { appearance: RoomAppearance; onOrbit: (yaw: number, elevation: number) => void; exportRef: RefObject<(() => void) | null> }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const progress = inputAppearance.installProgress;
  const daylightBlend = progress === null ? 0 : Math.sin(Math.PI * progress) ** 2;
  const appearance = { ...inputAppearance, daylight: progress === null || reducedMotion ? inputAppearance.daylight : inputAppearance.daylight * (1 - daylightBlend) + (.08 + progress * .65) * daylightBlend };
  const drag = useRef<{ x: number; y: number; yaw: number; elevation: number } | null>(null);
  const interactionAt = useRef(0);
  useEffect(() => { interactionAt.current = performance.now(); }, []);
  const [ready, setReady] = useState(false);
  const lighting = useMemo(() => resolveLighting(appearance.daylight), [appearance.daylight]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, yaw: appearance.yaw, elevation: appearance.elevation };
    interactionAt.current = performance.now();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d) return;
    interactionAt.current = performance.now();
    const yawRange = appearance.firstPerson ? 180 : 35;
    const elRange = appearance.firstPerson ? 75 : 60;
    const yawFloor = appearance.firstPerson ? -180 : -35;
    const elFloor = appearance.firstPerson ? 15 : 20;
    onOrbit(
      Math.max(yawFloor, Math.min(yawRange, d.yaw + (e.clientX - d.x) * (appearance.firstPerson ? 0.3 : 0.2))),
      Math.max(elFloor, Math.min(elRange, d.elevation + (e.clientY - d.y) * 0.16))
    );
  };
  const stop = () => { drag.current = null; };

  return (
    <div
      className="floor-room"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [4, 4.5, 8], fov: 32, near: 0.1, far: 50 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; setReady(true); }}
      >
        <color attach="background" args={[lighting.bg]} />
        <fog attach="fog" args={[lighting.bg, 10, 24]} />
        {appearance.firstPerson
          ? <FirstPersonRig yaw={appearance.yaw} elevation={appearance.elevation} />
          : <OrbitCameraRig yaw={appearance.yaw} elevation={appearance.elevation} zoom={appearance.zoom} interactionAt={interactionAt} installProgress={progress} reducedMotion={reducedMotion} />}
        <ambientLight color={lighting.ambient} intensity={lighting.ambientIntensity} />
        <hemisphereLight color={lighting.hemi} groundColor={"#2a2432"} intensity={0.6} />
        <directionalLight
          color={lighting.directional}
          position={[3.5 + appearance.daylight * 2, 5 + appearance.daylight * 2, 2 + appearance.daylight * 1.5]}
          intensity={lighting.directionalIntensity}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        <directionalLight color={lighting.ambient} position={[-4, 4, -2]} intensity={0.3} />
        <Floor appearance={appearance} />
        {progress !== null && <InstallSurface appearance={appearance} reducedMotion={reducedMotion} />}
        <RoomShell appearance={appearance} wallTint={lighting.wallTint} />
        <ContactShadows position={[0, 0.005, 0]} opacity={0.4} scale={9} blur={2.4} far={3} />
        <Suspense fallback={null}>
          <Environment key={`${appearance.room}-${Math.round(appearance.daylight * 12)}`} resolution={128} frames={1} background={false}>
            <Lightformer form="rect" intensity={lighting.keyIntensity} color={appearance.room === 1 ? "#d8e9ff" : lighting.keyLight} position={[0, 6, 2.5]} scale={appearance.room === 1 ? [5, .35, 1] : [7, 2, 1]} rotation-x={-Math.PI / 6} />
            <Lightformer form="circle" intensity={lighting.keyIntensity * 0.7} color={lighting.ambient} position={[-4.5, 3, 2]} scale={[2.4, 2.4, 1]} rotation-y={Math.PI / 2.5} />
            <Lightformer form="circle" intensity={lighting.keyIntensity * 0.6} color={lighting.directional} position={[4.5, 3, 2]} scale={[2.4, 2.4, 1]} rotation-y={-Math.PI / 2.5} />
            <Lightformer form="ring" intensity={lighting.keyIntensity * 0.4} color={lighting.keyLight} position={[0, 3.5, 5]} scale={[2, 2, 1]} />
            <Lightformer form="rect" intensity={0.4} color={lighting.wallTint} position={[0, 1, -5]} scale={[7, 2.5, 1]} />
          </Environment>
        </Suspense>
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <DepthOfField focusDistance={0.015} focalLength={0.04} bokehScale={1.2} height={360} />
          <Bloom
            intensity={appearance.sheen > 0.3 ? 0.5 : 0.28}
            luminanceThreshold={0.78}
            luminanceSmoothing={0.3}
            mipmapBlur
            kernelSize={KernelSize.LARGE}
          />
          <Noise opacity={0.055} blendFunction={BlendFunction.OVERLAY} premultiply />
          <Vignette offset={0.3} darkness={0.55} blendFunction={BlendFunction.NORMAL} />
          <SMAA />
        </EffectComposer>
        <Exporter exportRef={exportRef} />
      </Canvas>
      {!ready && <div className="room-fallback"><p>Preparing your room preview…</p></div>}
      <div className="room-badge">{ready ? (appearance.firstPerson ? "WALK MODE · W/A/S/D" : "LIVE 3D PREVIEW") : "LOADING PREVIEW"}</div>
      {appearance.installProgress !== null && (
        <div className="install-overlay">
          <div className="install-progress"><div className="install-progress-bar" style={{ width: `${Math.round(appearance.installProgress * 100)}%` }} /></div>
          <div className="install-heading"><span>THE TRANSFORMATION</span><time>{installClock(appearance.installProgress)}</time></div>
          <div className="install-caption" aria-live="polite">{installLabels(appearance.system)[installPhase(appearance.installProgress)]}</div>
          <div className="install-steps">{installLabels(appearance.system).map((label, i) => <span key={label} className={i <= installPhase(appearance.installProgress!) ? "active" : ""}>{String(i + 1).padStart(2, "0")}<b>{label}</b></span>)}</div>
          <small>Illustrative time-lapse ? Application and cure times vary</small>
        </div>
      )}
      <div className="room-caption">
        {appearance.firstPerson
          ? "Drag to look · W/A/S/D or arrows to walk"
          : "Drag to look around · or use the camera controls"}
      </div>
    </div>
  );
}

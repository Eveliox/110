import * as THREE from "three";
import { buildFinishCanvas, finishRepeat } from "./finish-texture";

// "View on my floor": a 3m square of the chosen finish, at real scale, on the visitor's actual floor.
// iOS opens it in AR Quick Look (USDZ, built here in the browser); Android Chrome uses WebXR.
export type ArFinish = { system: number; base: string; accent: string; sheen: number };

const PATCH = 3;

function finishMaterial(f: ArFinish) {
  const texture = new THREE.CanvasTexture(buildFinishCanvas(f.system, f.base, f.accent));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  // The studio tile spans 6m / finishRepeat; keep the same real-world chip and swirl size here.
  texture.repeat.setScalar(finishRepeat(f.system) * PATCH / 6);
  const base = f.system === 0 ? .3 : .6;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: Math.max(.05, base - f.sheen * .24), metalness: f.system === 0 ? .35 : .04 });
}

export async function openQuickLook(f: ArFinish) {
  const { USDZExporter } = await import("three/examples/jsm/exporters/USDZExporter.js");
  const scene = new THREE.Scene();
  const material = finishMaterial(f);
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(PATCH, PATCH), material);
  patch.rotation.x = -Math.PI / 2;
  scene.add(patch);
  const buffer = await new USDZExporter().parseAsync(scene, { quickLookCompatible: true, ar: { anchoring: { type: "plane" }, planeAnchoring: { alignment: "horizontal" } } });
  material.map?.dispose(); material.dispose(); patch.geometry.dispose();
  const url = URL.createObjectURL(new Blob([buffer], { type: "model/vnd.usdz+zip" }));
  // Quick Look only opens from an <a rel="ar"> wrapping an image; real scale, no pinch-resizing.
  const link = document.createElement("a");
  link.rel = "ar";
  link.href = `${url}#allowsContentScaling=0`;
  link.appendChild(document.createElement("img"));
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function startWebXr(f: ArFinish, overlay: HTMLElement, onEnd: () => void) {
  const xr = navigator.xr!;
  const session = await xr.requestSession("immersive-ar", { requiredFeatures: ["hit-test"], optionalFeatures: ["dom-overlay"], domOverlay: { root: overlay } });
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType("local");
  await renderer.xr.setSession(session);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 2.4));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(1, 3, 2);
  scene.add(sun);

  // The ring shows where the floor was found; tapping drops (or moves) the finish there.
  const reticle = new THREE.Mesh(new THREE.RingGeometry(.14, .18, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  const material = finishMaterial(f);
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(PATCH, PATCH).rotateX(-Math.PI / 2), material);
  patch.visible = false;
  scene.add(reticle, patch);

  const viewer = await session.requestReferenceSpace("viewer");
  const hitSource = await session.requestHitTestSource!({ space: viewer });
  session.addEventListener("select", () => {
    if (!reticle.visible) return;
    patch.position.setFromMatrixPosition(reticle.matrix);
    patch.position.y += .002;
    patch.visible = true;
  });

  renderer.setAnimationLoop((_, frame) => {
    const space = renderer.xr.getReferenceSpace();
    if (frame && space && hitSource) {
      const pose = frame.getHitTestResults(hitSource)[0]?.getPose(space);
      reticle.visible = !!pose;
      if (pose) reticle.matrix.fromArray(pose.transform.matrix);
    }
    renderer.render(scene, camera);
  });

  session.addEventListener("end", () => {
    renderer.setAnimationLoop(null);
    hitSource?.cancel();
    material.map?.dispose(); material.dispose(); patch.geometry.dispose(); reticle.geometry.dispose();
    renderer.dispose();
    onEnd();
  });
  return session;
}

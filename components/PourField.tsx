"use client";

import { useEffect, useRef } from "react";
import { hexToRgb, type Palette } from "@/lib/atmosphere";

const vertex = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }
`;

// Stir buffer: a small displacement field that the pointer pushes around and that relaxes
// back to flat, the way wet resin self-levels after a roller passes.
const stirFragment = `
precision highp float;
uniform sampler2D previous;
uniform vec2 size;
uniform vec2 pointer;
uniform vec2 velocity;
uniform float aspect;
uniform float decay;
vec2 read(vec2 uv) { return texture2D(previous, uv).xy * 2. - 1.; }
void main() {
  vec2 uv = gl_FragCoord.xy / size;
  vec2 drift = read(uv);
  vec2 d = read(uv - drift * .006) * decay;
  vec2 offset = uv - pointer; offset.x *= aspect;
  d += velocity * exp(-dot(offset, offset) / .0045);
  gl_FragColor = vec4(clamp(d, -1., 1.) * .5 + .5, 0., 1.);
}
`;

const pourFragment = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform sampler2D stir;
uniform vec3 deep;
uniform vec3 base;
uniform vec3 accent;
uniform vec3 glow;
uniform vec4 camera; // tilt, zoom, travel, exposure
uniform float calm; // 0 = full swirl, 1 = settled toward its average tone behind reading sections

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p) {
  float sum = 0., amp = .5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { sum += amp * noise(p); p = m * p; amp *= .5; }
  return sum / .9375;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 p = (gl_FragCoord.xy - .5 * resolution) / resolution.y;
  vec2 stirred = texture2D(stir, uv).xy * 2. - 1.;
  p -= stirred * .11;

  // A camera over an endless poured floor: straight down in the hero, tipping toward the
  // horizon as the page scrolls.
  float pitch = mix(1.5708, .2, camera.x);
  vec3 forward = vec3(0., -sin(pitch), -cos(pitch));
  vec3 right = vec3(1., 0., 0.);
  vec3 up = cross(right, forward);
  vec3 ray = normalize(forward * 1.6 + right * p.x + up * p.y);
  vec3 light = normalize(vec3(-.35, 1., -.55));

  vec3 color;
  if (ray.y < -.002) {
    float dist = 1. / -ray.y;
    vec2 s = (ray.xz * dist) * 2.6 * camera.y + vec2(0., -camera.z);
    float t = time;
    vec2 q = vec2(fbm(s + vec2(0., t * .05)), fbm(s + vec2(5.2, 1.3) - vec2(t * .04, 0.)));
    vec2 r = vec2(fbm(s + 3. * q + vec2(1.7, 9.2) + t * .03), fbm(s + 3. * q + vec2(8.3, 2.8) - t * .025));
    vec2 w = s + 2.6 * r;
    float v = fbm(w);
    float vx = fbm(w + vec2(.025, 0.)), vz = fbm(w + vec2(0., .025));
    vec3 n = normalize(vec3((v - vx) * 6., 1., (v - vz) * 6.));

    float cell = smoothstep(.34, .76, v);
    float lace = exp(-abs(r.x - .53) * 18.) * .55 + exp(-abs(v - .62) * 26.) * .3;
    vec3 albedo = mix(deep * 1.6, base, smoothstep(.18, .55, v));
    albedo = mix(albedo, accent, cell * .8);
    albedo = mix(albedo, glow, clamp(lace, 0., 1.) * .55);

    vec3 view = -ray;
    vec3 reflected = reflect(ray, n);
    float facing = max(dot(reflected, light), 0.);
    float spec = pow(facing, 70.) * 1.6 + pow(facing, 7.) * .22;
    float fresnel = pow(1. - max(dot(n, view), 0.), 5.);
    vec3 lit = albedo * (.38 + .62 * max(dot(n, light), 0.));
    lit += mix(glow, vec3(1.), .55) * spec;
    lit += glow * fresnel * .25;

    lit += glow * length(stirred) * .12;

    // Far floor resolves to its average tone instead of shimmering, then into haze.
    float detail = exp(-dist * .09) * (1. - calm * .72);
    vec3 average = mix(base, accent, .35) * .55;
    lit = mix(average, lit, detail);
    vec3 haze = mix(deep, glow * .35, .25);
    color = mix(lit, haze, 1. - exp(-dist * .05));
  } else {
    float horizon = exp(-abs(ray.y) * 14.);
    color = deep + glow * horizon * .22 + accent * horizon * horizon * .12;
  }

  color *= camera.w;
  color = 1. - exp(-color * 1.35);
  // The tone curve greys out pale finishes like Glacier; restore their hue.
  color = max(mix(vec3(dot(color, vec3(.299, .587, .114))), color, 1.3), 0.);
  vec2 centered = uv - .5;
  color *= 1. - dot(centered, centered) * .55;
  float grain = fract(sin(dot(mod(gl_FragCoord.xy, 128.), vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - .5) * .028;
  gl_FragColor = vec4(color, 1.);
}
`;

export type PourCamera = { tilt: number; zoom: number; exposure: number; calm: number };
const fallbackCamera: PourCamera = { tilt: .45, zoom: 1, exposure: .55, calm: 0 };
const cameraKeys = ["tilt", "zoom", "exposure", "calm"] as const;

// Each section can declare where the camera sits while it's centred on screen:
// data-pour="tilt zoom exposure [calm]". The camera eases between neighbouring anchors.
function readAnchors(): { top: number; camera: PourCamera }[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-pour]")).map(el => {
    const [tilt, zoom, exposure, calm = 0] = (el.dataset.pour ?? "").split(" ").map(Number);
    return { top: el.getBoundingClientRect().top + window.scrollY, camera: { tilt, zoom, exposure, calm } };
  }).sort((a, b) => a.top - b.top);
}

function cameraAt(anchors: { top: number; camera: PourCamera }[], focus: number): PourCamera {
  if (!anchors.length) return fallbackCamera;
  if (focus <= anchors[0].top) return anchors[0].camera;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    if (focus < b.top) {
      const raw = (focus - a.top) / Math.max(1, b.top - a.top);
      const t = raw * raw * (3 - 2 * raw);
      return Object.fromEntries(cameraKeys.map(key => [key, a.camera[key] + (b.camera[key] - a.camera[key]) * t])) as PourCamera;
    }
  }
  return anchors[anchors.length - 1].camera;
}

export function PourField({ palette }: { palette: Palette }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useRef({ palette });
  useEffect(() => { controls.current = { palette }; }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "high-performance" });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source); gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const link = (fragmentSource: string) => {
      const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
      const program = gl.createProgram()!;
      if (!vs || !fs) return null;
      gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
      gl.deleteShader(vs); gl.deleteShader(fs);
      return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
    };
    const pour = link(pourFragment), stir = link(stirFragment);
    if (!pour || !stir) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const bindQuad = (program: WebGLProgram) => {
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    };
    const u = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name);

    // Ping-pong stir targets. RGBA8 is renderable everywhere; the field is smooth, so 8 bits is plenty.
    const stirSize = 128;
    const flat = new Uint8Array(stirSize * stirSize * 4).fill(128);
    const targets = [0, 1].map(() => {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, stirSize, stirSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, flat);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const framebuffer = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      return { texture, framebuffer };
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    let current = 0;

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const state = {
      elapsed: 0, lastDraw: -1000, frame: 0, studioInView: false,
      pointer: [.5, .5], velocity: [0, 0], lastPointerAt: -1000,
      colors: (["deep", "base", "accent", "glow"] as const).map(key => hexToRgb(controls.current.palette[key])),
      camera: { ...fallbackCamera }, travel: 0, anchors: readAnchors(), dirty: true,
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      // The pour is soft by nature, so render well under device resolution and let CSS scale it.
      const scale = Math.min(1, Math.sqrt(750000 / Math.max(1, bounds.width * bounds.height)));
      canvas.width = Math.max(1, Math.round(bounds.width * scale));
      canvas.height = Math.max(1, Math.round(bounds.height * scale));
      state.anchors = readAnchors(); state.dirty = true;
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas); resize();
    // Sections shift as images and the 3D studio load; re-measure anchors when the page grows.
    const pageObserver = new ResizeObserver(() => { state.anchors = readAnchors(); state.dirty = true; });
    pageObserver.observe(document.body);
    const studio = document.getElementById("floor-studio");
    const studioObserver = new IntersectionObserver(([entry]) => { state.studioInView = entry.intersectionRatio > .35; }, { threshold: [0, .35, .7] });
    if (studio) studioObserver.observe(studio);

    const onPointer = (event: PointerEvent) => {
      if (motion.matches) return;
      const x = event.clientX / window.innerWidth, y = 1 - event.clientY / window.innerHeight;
      const now = performance.now();
      if (now - state.lastPointerAt < 120) {
        state.velocity[0] += Math.max(-.6, Math.min(.6, (x - state.pointer[0]) * 9));
        state.velocity[1] += Math.max(-.6, Math.min(.6, (y - state.pointer[1]) * 9));
      }
      state.pointer = [x, y]; state.lastPointerAt = now;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    const onScroll = () => { state.dirty = true; };
    window.addEventListener("scroll", onScroll, { passive: true });
    const contextLost = (event: Event) => { event.preventDefault(); canvas.style.opacity = "0"; cancelAnimationFrame(state.frame); };
    canvas.addEventListener("webglcontextlost", contextLost);

    const pourUniforms = { resolution: u(pour, "resolution"), time: u(pour, "time"), stir: u(pour, "stir"), camera: u(pour, "camera"), calm: u(pour, "calm"), deep: u(pour, "deep"), base: u(pour, "base"), accent: u(pour, "accent"), glow: u(pour, "glow") };
    const stirUniforms = { previous: u(stir, "previous"), size: u(stir, "size"), pointer: u(stir, "pointer"), velocity: u(stir, "velocity"), aspect: u(stir, "aspect"), decay: u(stir, "decay") };

    const draw = (now: number) => {
      state.frame = requestAnimationFrame(draw);
      if (document.hidden) return;
      // Leave the GPU to the 3D studio while it's on screen.
      if (now - state.lastDraw < (state.studioInView ? 140 : 33)) return;
      const step = Math.min((now - state.lastDraw) / 1000, .1);
      const still = motion.matches;
      if (!still) state.elapsed += step;

      const focus = window.scrollY + window.innerHeight * .5;
      const target = { ...cameraAt(state.anchors, focus) };
      if (motion.matches) target.tilt = state.anchors[0]?.camera.tilt ?? fallbackCamera.tilt;
      const ease = 1 - Math.exp(-step * 4);
      let settling = false;
      for (const key of cameraKeys) {
        const gap = target[key] - state.camera[key];
        state.camera[key] += gap * ease;
        if (Math.abs(gap) > .001) settling = true;
      }
      state.travel = motion.matches ? 0 : window.scrollY * .0011;
      const goal = (["deep", "base", "accent", "glow"] as const).map(key => hexToRgb(controls.current.palette[key]));
      const colorEase = 1 - Math.exp(-step * 1.8);
      state.colors.forEach((rgb, i) => rgb.forEach((v, c) => {
        const gap = goal[i][c] - v;
        rgb[c] += gap * colorEase;
        if (Math.abs(gap) > .002) settling = true;
      }));
      const stirring = Math.abs(state.velocity[0]) + Math.abs(state.velocity[1]) > .001 || now - state.lastPointerAt < 4000;
      if (still && !settling && !state.dirty && !stirring) return;
      state.dirty = false; state.lastDraw = now;

      const from = targets[current], to = targets[1 - current];
      gl.useProgram(stir); bindQuad(stir);
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.framebuffer);
      gl.viewport(0, 0, stirSize, stirSize);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, from.texture);
      gl.uniform1i(stirUniforms.previous, 0);
      gl.uniform2f(stirUniforms.size, stirSize, stirSize);
      gl.uniform2f(stirUniforms.pointer, state.pointer[0], state.pointer[1]);
      gl.uniform2f(stirUniforms.velocity, state.velocity[0], state.velocity[1]);
      gl.uniform1f(stirUniforms.aspect, canvas.width / canvas.height);
      gl.uniform1f(stirUniforms.decay, .985);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      state.velocity = [0, 0];
      current = 1 - current;

      gl.useProgram(pour); bindQuad(pour);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, to.texture);
      gl.uniform1i(pourUniforms.stir, 0);
      gl.uniform2f(pourUniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(pourUniforms.time, state.elapsed);
      gl.uniform4f(pourUniforms.camera, state.camera.tilt, state.camera.zoom, state.travel, state.camera.exposure);
      gl.uniform1f(pourUniforms.calm, state.camera.calm);
      gl.uniform3fv(pourUniforms.deep, state.colors[0]);
      gl.uniform3fv(pourUniforms.base, state.colors[1]);
      gl.uniform3fv(pourUniforms.accent, state.colors[2]);
      gl.uniform3fv(pourUniforms.glow, state.colors[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.style.opacity = "1";
    };
    state.frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(state.frame);
      resizeObserver.disconnect(); pageObserver.disconnect(); studioObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.style.opacity = "0";
      targets.forEach(t => { gl.deleteTexture(t.texture); gl.deleteFramebuffer(t.framebuffer); });
      gl.deleteBuffer(buffer); gl.deleteProgram(pour); gl.deleteProgram(stir);
    };
  }, []);

  // Static stand-in until the first frame renders, or for browsers without WebGL.
  return <div className="pour-field" aria-hidden="true" style={{ background: `radial-gradient(ellipse at 70% 30%, ${palette.glow}55, transparent 45%), radial-gradient(ellipse at 20% 80%, ${palette.accent}40, transparent 50%), ${palette.deep}` }}>
    <canvas ref={canvasRef} />
  </div>;
}

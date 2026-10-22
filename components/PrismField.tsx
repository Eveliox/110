"use client";

import { useEffect, useRef } from "react";

const vertex = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0., 1.); }
`;

const fragment = `
precision mediump float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float palette;
float band(float d, float width) { return exp(-d*d/(width*width)); }
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 p = uv*2.-1.;
  p.x *= resolution.x/resolution.y;
  p += pointer*.025;
  float t = time*.055;
  float curve = .32-.40*sin(p.x*2.6+t)+.10*cos(p.x*5.1-t*.6);
  float d = p.y-curve;
  float magenta = band(d+.035,.11);
  float pink = band(d-.10,.105);
  float violet = band(d-.23,.16);
  vec2 center = vec2(.83,.62);
  float arc = length((p-center)*vec2(.95,1.1))-.56;
  magenta = max(magenta,band(arc+.015,.055)*.9);
  pink = max(pink,band(arc-.065,.07)*.85);
  violet = max(violet,band(arc-.15,.10)*.8);
  float lowerCurve = -.53+.17*sin(p.x*2.8-t*.7);
  float lower = p.y-lowerCurve;
  float plum = band(lower,.22);
  vec3 color = vec3(.006,.004,.008);
  color += vec3(.95,.20,.58)*magenta*.72;
  color += vec3(1.,.58,.85)*pink*.79;
  color += vec3(.55,.26,.74)*violet*.70;
  color += vec3(.38,.15,.43)*plum*.55;
  color += vec3(.96,.48,.76)*band(lower-.15,.08)*.30;
  float centerShade = exp(-dot(p-vec2(-.05,.46),p-vec2(-.05,.46))*7.);
  color *= 1.-centerShade*.32;
  float fade = smoothstep(0.,.08,uv.y);
  color *= fade;
  float grain = fract(sin(dot(mod(gl_FragCoord.xy,128.),vec2(12.9898,78.233)))*43758.5453);
  color += (grain-.5)*.035;
  gl_FragColor = vec4(color,1.);
}
`;

/** Procedural brand artwork, deliberately separate from the original job photos. */
export function PrismField({ paused, palette }: { paused: boolean; palette: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useRef({ paused, palette });
  useEffect(() => { controls.current = { paused, palette }; }, [paused, palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vs || !fs || !program) { if (vs) gl.deleteShader(vs); if (fs) gl.deleteShader(fs); if (program) gl.deleteProgram(program); return; }
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resLoc = gl.getUniformLocation(program, "resolution");
    const timeLoc = gl.getUniformLocation(program, "time");
    const pointerLoc = gl.getUniformLocation(program, "pointer");
    const paletteLoc = gl.getUniformLocation(program, "palette");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true, frame = 0, elapsed = 0, previous = 0, mx = 0, my = 0;
    let lastDraw = -100, lastState = "";
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(1800000 / Math.max(1, bounds.width * bounds.height)));
      canvas.width = Math.max(1, Math.round(bounds.width*ratio)); canvas.height = Math.max(1, Math.round(bounds.height*ratio));
      gl.viewport(0,0,canvas.width,canvas.height);
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); intersection.observe(canvas);
    const point = (event: PointerEvent) => {
      if (motion.matches) return;
      const bounds = canvas.getBoundingClientRect();
      mx = (event.clientX-bounds.left)/bounds.width-.5; my = .5-(event.clientY-bounds.top)/bounds.height;
    };
    canvas.addEventListener("pointermove", point);
    // Reveal only a rendered frame; retain the CSS artwork if WebGL is lost.
    const contextLost = (event: Event) => {
      event.preventDefault();
      canvas.style.opacity = "0";
      cancelAnimationFrame(frame);
    };
    canvas.addEventListener("webglcontextlost", contextLost);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const delta = Math.min((now-previous)/1000,.05); previous = now;
      if (!visible || document.hidden) return;
      if (!controls.current.paused && !motion.matches) elapsed += delta;
      if (now-lastDraw < 32) return;
      const state = `${elapsed}:${mx}:${my}:${controls.current.palette}:${canvas.width}:${canvas.height}`;
      if (state === lastState) return;
      lastDraw = now; lastState = state;
      gl.uniform2f(resLoc,canvas.width,canvas.height);
      gl.uniform1f(timeLoc,elapsed);
      gl.uniform2f(pointerLoc,mx,my);
      gl.uniform1f(paletteLoc,controls.current.palette);
      gl.drawArrays(gl.TRIANGLES,0,6);
      canvas.style.opacity = "1";
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); canvas.removeEventListener("pointermove",point);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.style.opacity = "0";
      gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs);
    };
  }, []);
  return <div className="prism-art" aria-hidden="true"><div className="prism-fallback" /><canvas ref={canvasRef} /></div>;
}

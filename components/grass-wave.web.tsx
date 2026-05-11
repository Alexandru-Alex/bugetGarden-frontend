/**
 * Web implementation: WebGL fragment shader care distorsioneaza
 * pixelii ierbii din poza (wave displacement pe zona de jos a imaginii).
 */
import { Asset } from "expo-asset";
import React, { useEffect, useRef } from "react";

const BG = require("@/assets/images/welcome-bg.jpg");

// Preincarca imaginea la nivel de modul (inainte ca componenta sa fie montata)
const _bgAsset = Asset.fromModule(BG);
_bgAsset.downloadAsync();

// ─── Shaders ──────────────────────────────────────────────────────────────────

const VERT = `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    v_uv.y = 1.0 - v_uv.y;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

// Displacement wave aplicat doar pe zona de iarba (jos ~40%).
// Cerul (sus) ramane static. Firele de la baza se misca mai mult.
const FRAG = `
  precision mediump float;
  uniform sampler2D u_img;
  uniform float u_time;
  uniform float u_imgAspect;
  uniform float u_canvasAspect;
  varying vec2 v_uv;

  void main() {
    // Corecție aspect ratio tip "cover": imaginea umple canvas-ul fără stretch
    vec2 uv = v_uv;
    if (u_canvasAspect > u_imgAspect) {
      // Canvas mai lat — crop sus/jos
      float scale = u_imgAspect / u_canvasAspect;
      uv.y = uv.y * scale + (1.0 - scale) * 0.5;
    } else {
      // Canvas mai înalt — crop stânga/dreapta
      float scale = u_canvasAspect / u_imgAspect;
      uv.x = uv.x * scale + (1.0 - scale) * 0.5;
    }

    float y = uv.y; // 0=sus, 1=jos (dupa flip din vertex shader)

    // Zona de iarba: smoothstep intre 55% si 72% din inaltime
    float grassMask = smoothstep(0.52, 0.70, y);
    // Firele de la baza se misca mai mult decat cele din spate
    float depthAmp  = smoothstep(0.62, 1.0,  y);

    // 3 sinusoide suprapuse => miscare organica, nu robotica
    float wave =
      sin(uv.x * 22.0 + u_time * 0.4)  * 0.0006 +
      sin(uv.x * 11.0 - u_time * 0.3)  * 0.0005 +
      sin(uv.x *  5.5 + u_time * 0.2)  * 0.0008;

    float dx = wave * grassMask * depthAmp;

    gl_FragColor = texture2D(u_img, vec2(uv.x + dx, uv.y));
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function makeProgram(gl: WebGLRenderingContext) {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, makeShader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, makeShader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GrassWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const prog = makeProgram(gl);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(prog, "u_time");
    const imgAspectLoc = gl.getUniformLocation(prog, "u_imgAspect");
    const canvasAspectLoc = gl.getUniformLocation(prog, "u_canvasAspect");

    // Incarca imaginea ca textura WebGL
    const tex = gl.createTexture();
    let ready = false;
    let imgAspect = 1.0;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvas);

    (async () => {
      await _bgAsset.downloadAsync();

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgAspect = img.naturalWidth / img.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        ready = true;
      };
      img.src = _bgAsset.uri;
    })();

    const t0 = performance.now();
    function frame() {
      rafRef.current = requestAnimationFrame(frame);
      if (!ready || !gl) return;
      const t = (performance.now() - t0) / 1000;
      const w = canvas!.width;
      const h = canvas!.height;
      gl.viewport(0, 0, w, h);
      gl.uniform1f(timeLoc, t);
      gl.uniform1f(imgAspectLoc, imgAspect);
      gl.uniform1f(canvasAspectLoc, w / h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    frame();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Imaginea statică vizibilă instant (din cache) cât timp WebGL compilează shaderele */}
      <img
        src={_bgAsset.uri}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}

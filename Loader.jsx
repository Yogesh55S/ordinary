'use client';
// Ordinary Lancer — site loader
// three.js particle wave + anime.js counter + brush reveal of the wordmark + curtain wipe.
// Deps: npm i three animejs@3.2.2
// Assets expected in /public/brand/wordmark/: wordmark.png (866x344), burst-L0..L2.png, burst-R3..R4.png
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import anime from 'animejs';
import './Loader.css';

const message = (p) =>
  p < 30 ? 'warming up the code…' : p < 60 ? 'mixing the red paint…' : p < 90 ? 'brushing the logo…' : 'almost there…';

export default function Loader({ onDone, oncePerSession = true }) {
  const canvasRef = useRef(null);
  const wave = useRef({ amp: 0.5 });
  const mouse = useRef({ x: 0, y: 0 });
  const [pct, setPct] = useState(0);
  // load  = particles + counter + brush reveal
  // exit  = only the curtain is drawn (transparent), the real hero shows underneath
  // hidden = loader removed
  const [phase, setPhase] = useState('load');
  const [curtain, setCurtain] = useState(false);

  // Skip on repeat visits in the same session
  useEffect(() => {
    if (oncePerSession && typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('ol-loaded')) { setPhase('hidden'); onDone?.(); }
      } catch (e) {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // three.js particle wave (runs only while loading)
  useEffect(() => {
    if (phase !== 'load') return;
    const el = canvasRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = el.clientWidth < 600;

    const renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf6f3ee, 40, small ? 110 : 150);
    const cam = new THREE.PerspectiveCamera(small ? 62 : 50, 1, 0.1, 400);
    cam.position.set(0, 22, small ? 54 : 64);
    cam.lookAt(0, -4, 0);

    const cols = small ? 70 : 140, rows = small ? 56 : 70, gap = 1.5, n = cols * rows;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const ink = new THREE.Color('#1B1A19'), red = new THREE.Color('#C1270A');
    for (let r = 0, i = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        pos[i * 3] = (c - cols / 2) * gap;
        pos[i * 3 + 2] = (r - rows / 2) * gap;
        const k = Math.random() < 0.12 ? red : ink;
        col[i * 3] = k.r; col[i * 3 + 1] = k.g; col[i * 3 + 2] = k.b;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const dot = document.createElement('canvas');
    dot.width = dot.height = 64;
    const g = dot.getContext('2d');
    g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fill();
    const tex = new THREE.CanvasTexture(dot);
    const mat = new THREE.PointsMaterial({
      size: small ? 0.7 : 0.55, map: tex, vertexColors: true, transparent: true,
      opacity: 0.75, alphaTest: 0.02, depthWrite: false, sizeAttenuation: true, fog: true,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let raf, t = 0;
    const frame = () => {
      t += 0.016;
      const amp = wave.current.amp;
      for (let i = 0; i < n; i++) {
        const x = pos[i * 3], z = pos[i * 3 + 2];
        pos[i * 3 + 1] =
          Math.sin(x * 0.12 + t * 1.1) * 2.2 * amp +
          Math.cos(z * 0.18 + t * 0.8) * 1.6 * amp +
          Math.sin((x + z) * 0.05 + t * 0.6) * 1.2 * amp;
      }
      geo.attributes.position.needsUpdate = true;
      pts.rotation.y += (mouse.current.x * 0.25 - pts.rotation.y) * 0.04;
      pts.rotation.x += (mouse.current.y * 0.12 - pts.rotation.x) * 0.04;
      renderer.render(scene, cam);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose(); mat.dispose(); tex.dispose(); renderer.dispose();
    };
  }, [phase === 'load']); // eslint-disable-line react-hooks/exhaustive-deps

  // anime.js progress → reveal → curtain → done
  useEffect(() => {
    try { if (oncePerSession && sessionStorage.getItem('ol-loaded')) return; } catch (e) {}
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const p = { v: 0 };
    const timers = [];
    let last = -1;

    const finish = () => {
      try { sessionStorage.setItem('ol-loaded', '1'); } catch (e) {}
      if (reduce) { setPhase('hidden'); onDone?.(); return; }
      setCurtain(true);
      // screen is fully covered at ~560ms → swap to the real page underneath
      timers.push(setTimeout(() => { setPhase('exit'); onDone?.(); }, 560));
      timers.push(setTimeout(() => { setCurtain(false); setPhase('hidden'); }, 1400));
    };

    const a = anime({
      targets: p,
      v: [0, 100],
      duration: reduce ? 600 : 3400,
      delay: 300,
      easing: 'cubicBezier(.7,0,.25,1)',
      update: () => {
        const v = p.v;
        wave.current.amp = 0.5 + (v / 100) * 0.9;
        const r = Math.round(v);
        if (r !== last) { last = r; setPct(r); }
      },
      complete: finish,
    });

    return () => { a.pause(); timers.forEach(clearTimeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'hidden') return null;

  const curtainEls = curtain && (
    <>
      <div className="ol-loader__curtain ol-loader__curtain--red" aria-hidden="true" />
      <div className="ol-loader__curtain ol-loader__curtain--ink" aria-hidden="true">
        <p>hey there :)</p>
      </div>
    </>
  );

  if (phase === 'exit') {
    return <div className="ol-loader ol-loader--exit">{curtainEls}</div>;
  }

  return (
    <div
      className="ol-loader"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mouse.current.x = (e.clientX - r.left) / r.width - 0.5;
        mouse.current.y = (e.clientY - r.top) / r.height - 0.5;
      }}
    >
      <canvas ref={canvasRef} className="ol-loader__canvas" aria-hidden="true" />
      <svg className="ol-loader__grain" aria-hidden="true" width="100%" height="100%">
        <filter id="ol-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.38  0 0 0 0 0.34  0 0 0 0.09 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ol-grain)" />
      </svg>

      <div className="ol-loader__top">
        <span>ORDINARY LANCER · PORTFOLIO '26</span>
        <span className="ol-loader__live"><i />LOADING</span>
      </div>

      <div className="ol-loader__center">
        <div className="ol-loader__mark">
          <img src="/brand/wordmark/wordmark.png" alt="" aria-hidden="true" className="ol-loader__ghost" />
          <div className="ol-loader__clip" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
            <img src="/brand/wordmark/wordmark.png" alt="Ordinary Lancer" />
          </div>
          <span className="ol-loader__cursor" style={{ left: `${pct}%` }} aria-hidden="true" />
        </div>
      </div>

      <div className="ol-loader__bottom" role="status" aria-live="polite">
        <p className="ol-loader__msg">{message(pct)}</p>
        <p className="ol-loader__count">
          {String(pct).padStart(3, '0')}
          <span>%</span>
        </p>
      </div>
      <div className="ol-loader__bar" aria-hidden="true">
        <div style={{ width: `${pct}%` }} />
      </div>

      {curtainEls}
    </div>
  );
}

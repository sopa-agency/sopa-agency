// src/components/ScrollShowcase.tsx
// Port of sopa-2026's full 3D scroll presentation: 14 sections stacked in one
// scene (y = index * -SECTION_H), camera flies down as user scrolls. Window
// scroll drives everything; no deps beyond three. Textures/models reused from
// the original site (public/assets/showcase).
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SECTION_H = 50;

// amber palette from sopa-2026
const AMBER = '#FFE000';
const GOLD = '#FFD54F';
const DARK_AMBER = '#B8860B';

type SectionDef = {
  name: string;
  text?: string;
  align?: 'left' | 'right';
  build: () => { el: THREE.Object3D; update?: (t: number) => void };
};

// ---------- section builders (ported from sopa-2026 objects3D, SOPA palette) ----------

// DropObject3D: expanding water-ripple rings (texture-drop.png), staggered loop
function buildDrop() {
  const group = new THREE.Group();
  const rings: { m: THREE.Mesh; delay: number; period: number; maxScale: number }[] = [];
  const tex = new THREE.TextureLoader().load('/assets/showcase/texture-drop.png');
  for (let i = 0; i < 6; i++) {
    const mat = new THREE.MeshBasicMaterial({
      map: tex, color: AMBER, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = -10 + i * 0.4;
    group.add(m);
    rings.push({ m, delay: i * 0.25, period: 1.5, maxScale: ((i + 1) * 2) / 6 });
  }
  return {
    el: group,
    update(t: number) {
      for (const r of rings) {
        const k = ((t / 1000 - r.delay) % r.period) / r.period;
        if (k < 0) continue;
        r.m.scale.setScalar(0.1 + r.maxScale * k);
        (r.m.material as THREE.MeshBasicMaterial).opacity = 1 - k;
      }
    },
  };
}

// BallObject3D: striped sphere (texture-ball.png) with glitch/blink flashes
function buildBall() {
  const tex = new THREE.TextureLoader().load('/assets/showcase/texture-ball.png');
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const mat = new THREE.MeshLambertMaterial({ map: tex, color: GOLD, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(10, 30, 30), mat);
  const group = new THREE.Group();
  group.add(mesh);
  group.scale.setScalar(0.75); // 25% smaller
  return {
    el: group,
    update(t: number) {
      tex.offset.y = t * 0.00012;
      tex.repeat.set(1, 3 + Math.sin(t * 0.0002) * 2.5); // stripes crawl/stretch
      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.005;
      // blink flash
      const c = Math.max(0, Math.sin(t * 0.0011)) ** 24;
      mat.color.lerpColors(new THREE.Color(GOLD), new THREE.Color('#ffffff'), c);
    },
  };
}

// FlowFieldObject3D: main spline + noisy sub-curves, tetrahedra riding them
function buildFlow() {
  const group = new THREE.Group();
  const mkCurve = (seed: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const k = i / 40;
      pts.push(new THREE.Vector3(
        Math.sin(k * Math.PI * 2 + seed) * 18 * k,
        20 - k * 40 + Math.cos(k * Math.PI * 3 + seed * 2) * 8,
        Math.cos(k * Math.PI + seed) * 14 - 10
      ));
    }
    return new THREE.CatmullRomCurve3(pts);
  };
  const curves = [mkCurve(0), ...[1, 2, 3, 4].map(i => mkCurve(i * 1.7))];
  const riders: { m: THREE.Mesh; c: THREE.CatmullRomCurve3; off: number }[] = [];
  curves.forEach((c, ci) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(c.getPoints(100)),
      new THREE.LineBasicMaterial({ color: ci === 0 ? '#ffffff' : DARK_AMBER, transparent: true, opacity: ci === 0 ? 0.9 : 0.45 })
    );
    group.add(line);
    for (let j = 0; j < (ci === 0 ? 2 : 1); j++) {
      const m = new THREE.Mesh(
        new THREE.TetrahedronGeometry(ci === 0 ? 2 : 1.2),
        new THREE.MeshLambertMaterial({ color: ci === 0 ? AMBER : GOLD })
      );
      group.add(m);
      riders.push({ m, c, off: Math.random() });
    }
  });
  return {
    el: group,
    update(t: number) {
      for (const r of riders) {
        const k = (r.off + t * 0.00006) % 1;
        r.m.position.copy(r.c.getPoint(k));
        r.m.lookAt(r.c.getPoint((k + 0.01) % 1));
      }
    },
  };
}

// NeonObject3D: emissive tube + additive glow planes that flicker on
function buildNeons() {
  const group = new THREE.Group();
  const glowTex = new THREE.TextureLoader().load('/assets/showcase/texture-neonGlow.png');
  const mkNeon = (y: number, rotZ: number) => {
    const n = new THREE.Group();
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 20, 6),
      new THREE.MeshLambertMaterial({ color: '#808080', emissive: AMBER, emissiveIntensity: 1 })
    );
    n.add(tube);
    for (let i = 0; i < 3; i++) {
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 23),
        new THREE.MeshBasicMaterial({ map: glowTex, color: AMBER, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
      );
      glow.rotation.y = i * (0.7 * Math.PI);
      n.add(glow);
    }
    n.position.y = y;
    n.rotation.z = rotZ;
    group.add(n);
    return { tube, n };
  };
  const neons = [mkNeon(0, 0), mkNeon(-13, 2), mkNeon(13, 2)];
  return {
    el: group,
    update(t: number) {
      neons.forEach(({ tube, n }, i) => {
        // flicker: mostly on, random-ish dropouts
        const f = Math.sin(t * 0.013 + i * 7) > 0.92 ? 0.05 : 1;
        (tube.material as THREE.MeshLambertMaterial).emissiveIntensity = f;
        n.children.forEach(ch => {
          if (ch === tube) return;
          ((ch as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.35 * f;
        });
      });
    },
  };
}

// HeightMapObject3D: line terrain morphing between heightMap images
function buildHeight() {
  const group = new THREE.Group();
  const divisionsX = 60, divisionsY = 60; // double resolution for clearer letters

  // Shared position array — all lines reference slices of this so z updates propagate
  // PlaneGeometry vertices: y-rows top-to-bottom, x-cols left-to-right
  // vertex index = y * (divisionsX + 1) + x
  const totalVerts = (divisionsX + 1) * (divisionsY + 1);
  const positions = new Float32Array(totalVerts * 3);
  const planeW = 25, planeH = 25; // 50% smaller rendering size

  // Fill flat XY grid (z=0) matching PlaneGeometry layout
  for (let y = 0; y <= divisionsY; y++) {
    for (let x = 0; x <= divisionsX; x++) {
      const i = y * (divisionsX + 1) + x;
      positions[i * 3]     = (x / divisionsX - 0.5) * planeW;
      positions[i * 3 + 1] = (0.5 - y / divisionsY) * planeH;
      positions[i * 3 + 2] = 0;
    }
  }

  function readHeights(url: string, cb: (d: Float32Array) => void) {
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      const cx = cv.getContext('2d')!;
      cx.drawImage(img, 0, 0);
      const stepX = img.width  / divisionsX;
      const stepY = img.height / divisionsY;
      const d = new Float32Array(totalVerts);
      let i = 0;
      for (let y = 0; y <= divisionsY; y++) {
        for (let x = 0; x <= divisionsX; x++) {
          const px = cx.getImageData(
            Math.min(Math.round(x * stepX), img.width  - 1),
            Math.min(Math.round(y * stepY), img.height - 1),
            1, 1
          ).data;
          d[i++] = (px[0] + px[1] + px[2]) / 150; // luminance like original, smaller scale
        }
      }
      cb(d);
    };
    img.src = url;
  }

  const maps: Float32Array[] = [];
  const mapUrls = [
    '/assets/showcase/heightMap-S.jpg',
    '/assets/showcase/heightMap-O.jpg',
    '/assets/showcase/heightMap-P.jpg',
    '/assets/showcase/heightMap-A.jpg'
  ];
  let loadedCount = 0;
  mapUrls.forEach((u, i) =>
    readHeights(u, d => {
      maps[i] = d;
      loadedCount++;
      if (loadedCount === mapUrls.length) applyMap(maps[0]);
    })
  );

  // Build one horizontal line per Y row — matches reference `horizontal: true`
  const linesObj = new THREE.Object3D();
  const lineMat = new THREE.LineBasicMaterial({ vertexColors: true });

  for (let y = 0; y <= divisionsY; y++) {
    const count = divisionsX + 1;
    const linePos    = new Float32Array(count * 3);
    const lineColors = new Float32Array(count * 3);
    for (let x = 0; x <= divisionsX; x++) {
      const vi = y * (divisionsX + 1) + x;
      linePos[x * 3]     = positions[vi * 3];
      linePos[x * 3 + 1] = positions[vi * 3 + 1];
      linePos[x * 3 + 2] = positions[vi * 3 + 2];
      lineColors[x * 3] = lineColors[x * 3 + 1] = lineColors[x * 3 + 2] = 0.3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePos,    3));
    geo.setAttribute('color',    new THREE.BufferAttribute(lineColors, 3));
    const line = new THREE.Line(geo, lineMat);
    line.userData.y = y;
    linesObj.add(line);
  }

  // Match reference: NO rotation.x on lines (keep in XY plane, Z = height)
  // Only group.rotation.y and group.position.z from heightSection.js
  group.add(linesObj);
  group.rotation.y = -0.6;
  group.position.z = -10;

  let from = new Float32Array(totalVerts);
  let to: Float32Array | null = null;
  let morphT = 1;
  let currentMapIdx = 0;

  function applyMap(next: Float32Array) {
    const cur = new Float32Array(from.length);
    for (let i = 0; i < from.length; i++) {
      cur[i] = to ? from[i] + (to[i] - from[i]) * morphT : from[i];
    }
    from = cur;
    to = next;
    morphT = 0;
  }

  setInterval(() => {
    if (loadedCount === mapUrls.length) {
      currentMapIdx = (currentMapIdx + 1) % mapUrls.length;
      applyMap(maps[currentMapIdx]);
    }
  }, 2000);

  return {
    el: group,
    update() {
      if (!to) return;
      morphT = Math.min(1, morphT + 0.016);
      for (const obj of linesObj.children as THREE.Line[]) {
        const y: number = obj.userData.y;
        const pos    = obj.geometry.attributes.position as THREE.BufferAttribute;
        const colors = obj.geometry.attributes.color    as THREE.BufferAttribute;
        for (let x = 0; x <= divisionsX; x++) {
          const vi = y * (divisionsX + 1) + x;
          const hF = from[vi] ?? 0;
          const hT = to[vi]   ?? 0;
          const h  = hF + (hT - hF) * morphT;
          pos.setZ(x, h);
          // Color: lerp #4c4c4c -> #ffffff by height (matches reference fromColor/toColor)
          const t = Math.min(1, Math.max(0, h / 3.8)) * 2;
          colors.setXYZ(x, t, t * 0.9, 0);
        }
        pos.needsUpdate = true;
        colors.needsUpdate = true;
      }
    },
  };
}

// WaveObject3D: sine-displaced wireframe ocean
function buildWave() {
  const cols = 40, rows = 40;
  const geo = new THREE.PlaneGeometry(120, 120, cols, rows);
  const mat = new THREE.MeshBasicMaterial({ color: GOLD, wireframe: true, transparent: true, opacity: 0.5 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -10;
  const pos = geo.attributes.position;
  const group = new THREE.Group();
  group.add(mesh);
  return {
    el: group,
    update(t: number) {
      const time = t * 0.0006;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        pos.setZ(i, Math.sin((x + time * 20) * 0.08) * 2 + Math.sin((y + time * 20) * 0.08) * 4);
      }
      pos.needsUpdate = true;
    },
  };
}

// FaceHpObject3D: original face model with matCap material, slow head-turn idle
function buildFace() {
  const group = new THREE.Group();
  new THREE.BufferGeometryLoader().load('/assets/showcase/face-hp.geo.json', geo => {
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo);
    const tex = new THREE.TextureLoader().load('/assets/showcase/matCap-shiny.jpg');
    mesh.material = new THREE.MeshMatcapMaterial({ matcap: tex });
    mesh.scale.setScalar(1.5);
    mesh.name = 'face';
    group.add(mesh);
  });
  return {
    el: group,
    update(t: number) {
      const face = group.getObjectByName('face');
      if (face) face.rotation.y = Math.sin(t * 0.0005) * 0.4;
    },
  };
}

// RocksObject3D: rock cluster + rising amber sun sphere
function buildRocks() {
  const group = new THREE.Group();
  group.scale.setScalar(0.25); // 25% smaller
  new THREE.BufferGeometryLoader().load('/assets/showcase/rocks.geo.json', geo => {
    const mesh = new THREE.Mesh(geo);
    geo.computeVertexNormals();
    mesh.material = new THREE.MeshLambertMaterial({ color: '#1a1a1a', flatShading: true, side: THREE.DoubleSide });
    mesh.position.set(-70, -10, -30);
    mesh.name = 'rocks';
    group.add(mesh);
  });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(11, 24, 24), new THREE.MeshBasicMaterial({ color: '#0a0a0a' }));
  sun.position.set(0, 11, -35);
  group.add(sun);
  const light = new THREE.PointLight(AMBER, 0, 400);
  light.position.copy(sun.position);
  group.add(light);
  // ambient fill so rocks catch light even at low sun angles
  const ambient = new THREE.AmbientLight(AMBER, 0);
  group.add(ambient);
  return {
    el: group,
    update(t: number) {
      const rise = (Math.sin(t * 0.0004) + 1) / 2; // 0..1 sunrise loop
      light.intensity = rise * 550;
      light.position.y = 11 + rise * 9;
      (sun.material as THREE.MeshBasicMaterial).color.lerpColors(new THREE.Color('#0a0a0a'), new THREE.Color(AMBER), rise);
      ambient.intensity = rise * 0.7;
    },
  };
}

// GalaxyObject3D: amber star + orbit rings + planets
function buildGalaxy() {
  const group = new THREE.Group();
  group.rotation.x = -1;
  group.rotation.y = 0.2;

  const star = new THREE.Mesh(new THREE.SphereGeometry(5, 20, 20), new THREE.MeshBasicMaterial({ color: AMBER }));
  group.add(star);

  const ringMat = new THREE.LineBasicMaterial({ color: DARK_AMBER, transparent: true, opacity: 0.7 });
  const planets: { mesh: THREE.Mesh; radius: number; theta: number; inc: number }[] = [];
  const radii = [8, 10, 16, 25];
  for (const r of radii) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const th = (i / 100) * Math.PI * 2;
      pts.push(new THREE.Vector3(r * Math.cos(th), r * Math.sin(th), 0));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));

    if (Math.random() > 0.3 || r === radii[0]) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 16, 16),
        new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? GOLD : DARK_AMBER })
      );
      p.scale.setScalar(0.3 + Math.random() * 0.5);
      group.add(p);
      planets.push({ mesh: p, radius: r, theta: Math.random() * Math.PI * 2, inc: 0.005 + Math.random() * 0.02 });
    }
  }

  return {
    el: group,
    update(t: number) {
      group.rotation.z = t * 0.00004;
      for (const p of planets) {
        p.theta -= p.inc;
        p.mesh.position.x = p.radius * Math.cos(p.theta);
        p.mesh.position.y = p.radius * Math.sin(p.theta);
      }
    },
  };
}

// GravityGridObject3D-lite: grid plane whose vertices sag toward a wandering gravity well
function buildGravityGrid() {
  const cols = 24, size = 90;
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(size, size, cols, cols);
  const mat = new THREE.MeshBasicMaterial({ color: DARK_AMBER, wireframe: true, transparent: true, opacity: 0.55 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -8;
  group.add(mesh);
  const pos = geo.attributes.position;
  return {
    el: group,
    update(t: number) {
      const gx = Math.sin(t * 0.0004) * 30;
      const gy = Math.cos(t * 0.0003) * 30;
      for (let i = 0; i < pos.count; i++) {
        const dx = pos.getX(i) - gx, dy = pos.getY(i) - gy;
        const d2 = dx * dx + dy * dy;
        pos.setZ(i, -22 / (1 + d2 * 0.02)); // pull down toward the well
      }
      pos.needsUpdate = true;
    },
  };
}

// CityObject3D: Shanghai buildings wireframe fly-through
function buildCity() {
  const group = new THREE.Group();
  let loadedCount = 0;
  ['shanghai-buildings', 'shanghai-towers', 'shanghai-grounds'].forEach(f =>
    new THREE.BufferGeometryLoader().load(`/assets/showcase/${f}.geo.json`, geo => {
      const mesh = new THREE.Mesh(geo);
      geo.computeVertexNormals();
      mesh.material = new THREE.MeshLambertMaterial({ color: '#333333' });
      // cheap "outline": scaled-up backfaced copy in amber
      const outline = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: AMBER, side: THREE.BackSide }));
      outline.scale.setScalar(1.04);
      group.add(mesh, outline);
      loadedCount++;
    })
  );
  group.position.y = -10;
  return {
    el: group,
    update(t: number) {
      if (!loadedCount) return;
      group.rotation.y = Math.sin(t * 0.0001) * 0.15;
    },
  };
}

// EndSection: tetra cloud looking at a center point (LookAtField)
function buildEnd() {
  const group = new THREE.Group();
  const center = new THREE.Vector3(0, 50, 0);
  const geoms = new THREE.TetrahedronGeometry(3);
  for (let i = 0; i < 100; i++) {
    const m = new THREE.Mesh(geoms, new THREE.MeshLambertMaterial({ color: GOLD, flatShading: true }));
    m.position.set(Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 80 - 50);
    m.scale.setScalar(0.6 + Math.random() * 0.4);
    m.lookAt(center);
    group.add(m);
  }
  group.position.y = -50;
  return {
    el: group,
    update(t: number) {
      // center drifts down over time — tetras track it
      center.y = 50 - ((t * 0.01) % 100);
      for (const m of group.children as THREE.Mesh[]) m.lookAt(center);
    },
  };
}

// HelloTitle: sprite-sheet SOPA logo animation (4x10 grid, 40 frames, 70ms/frame)
function buildHello() {
  const group = new THREE.Group();
  const img = new Image();
  img.src = '/assets/showcase/sprite-SOPA.png';
  const tex = new THREE.Texture(img);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  let frameW = 0;
  img.onload = () => {
    tex.needsUpdate = true;
    frameW = img.width / 4;
  };
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), mat);
  mesh.position.y = 20; // start off-screen like reference (inTween animates y:20->0)
  group.add(mesh);

  let current = 0;
  let currentTime = 0;
  const duration = 70;
  const total = 40;
  const horizontal = 4;
  const vertical = 10;

  function animateTitle() {
    // play the sprite
    currentTime += 16; // approx frame delta
    while (currentTime > duration) {
      currentTime -= duration;
      current++;
      if (current >= total) current = 0;
      const factor = total - current;
      const row = Math.floor(factor / horizontal);
      const col = Math.floor(factor % horizontal);
      tex.repeat.set(1 / horizontal, 1 / vertical);
      tex.offset.set(col / horizontal, row / vertical);
    }
    mat.opacity = 1;
  }

  return {
    el: group,
    update() {
      if (!frameW) return;
      animateTitle();
    },
    start() { /* called when section becomes active */ },
    stop() { /* called when section leaves */ },
  };
}

const SECTIONS: SectionDef[] = [
  { name: 'hello', build: buildHello },                                        // HELLO [SOPA]
  { name: 'drop', text: 'FROM\nAN IDEA', align: 'right', build: buildDrop },   // FROM AN IDEA
  { name: 'ball', text: 'GIVE IT\nSHAPE', align: 'left', build: buildBall },      // GIVE SHAPE
  { name: 'flow', text: 'CREATE\nTRENDS', build: buildFlow },                  // CREATE TRENDS
  // { name: 'neons', build: buildNeons },                                        // (no text)
  { name: 'height', text: 'LET IT\nMORPH', align: 'right', build: buildHeight }, // LET IT MORPH
  { name: 'wave', text: 'EYES ON\nRESULTS', align: 'left', build: buildWave }, // EYES ON THE HORIZON
  { name: 'face', text: 'POWERED\nBY AI', build: buildFace },                    // KEEP TRYING
  { name: 'rocks', text: 'KEEP\nLEARNING', align: 'left', build: buildRocks }, // KEEP LEARNING
  { name: 'galaxy', text: 'WORK AS\nA TEAM', align: 'left', build: buildGalaxy }, // WORK AS A TEAM
  { name: 'gravity', build: buildGravityGrid },                                // (no text)
  // { name: 'city', build: buildCity },                                          // (no text)
  { name: 'end', text: 'Your next big idea\nstarts here.\nLet\'s make it real!', build: buildEnd },
];

export default function ScrollShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const viewport = document.querySelector('[data-showcase]') as HTMLElement;
    const overlay = overlayRef.current!;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#0a0a0a', 0.01);
    const camera = new THREE.PerspectiveCamera(20, viewport.clientWidth / viewport.clientHeight, 1, 4000);
    camera.position.set(0, 0, 70);

    // lighter shader/particle budget on phones, same signal as WebGL.tsx's orb
    const isDesktop = !/Mobi|Android/i.test(navigator.userAgent);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isDesktop ? 2 : 1.5));
    viewport.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight('#ffffff', 0.5);
    light.position.set(0.2, 1, 0.5);
    scene.add(light);

    // background particles spanning the tower (BackgroundParticlesObject3D)
    const pGeo = new THREE.BufferGeometry();
    const pCount = isDesktop ? 800 : 300;
    const pArr = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pArr[i * 3] = (Math.random() - 0.5) * 200;
      pArr[i * 3 + 1] = 50 - Math.random() * 800;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 100 - 20;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.5,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    const pObj = new THREE.Points(pGeo, pMat);
    scene.add(pObj);

    // speed lines (BackgroundLinesObject3D): vertical segments, stretch while scrolling
    const lCount = isDesktop ? 150 : 60;
    const lPos = new Float32Array(lCount * 6);
    for (let i = 0; i < lCount; i++) {
      const x = Math.random() * 40 - 20, y = Math.random() * (SECTIONS.length * SECTION_H) - SECTION_H, z = Math.random() * 100 - 50;
      lPos.set([x, y + 0.2, z, x, y, z], i * 6);
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    const lines = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: '#555555', transparent: true, opacity: 0.5 }));
    scene.add(lines);
    let lineSpeed = 0;

    // build sections — 3D only; text lives in the DOM overlay above
    const built: { el: THREE.Object3D; update?: (t: number) => void }[] = SECTIONS.map((s, i) => {
      const obj = s.build();
      obj.el.position.y = i * -SECTION_H;
      obj.el.visible = false;
      scene.add(obj.el);
      return obj;
    });

    // DOM text layers, one per section with text
    const textEls = SECTIONS.map((s) => {
      if (!s.text) return null;
      const div = document.createElement('div');
      div.className = 'showcase-text' + (s.align ? ` showcase-text--${s.align}` : '');
      s.text.split('\n').forEach(line => {
        const h = document.createElement('h1');
        h.textContent = line;
        div.appendChild(h);
      });
      overlay.appendChild(div);
      return div;
    });

    let camY = camera.position.y;
    let targetCamY = camY;
    let raf = 0;
    let visible = false;

    function setVisible(v: boolean) {
      if (visible === v) return;
      visible = v;
      viewport.style.visibility = v ? 'visible' : 'hidden';
      viewport.style.opacity = v ? '1' : '0';
      overlay.style.visibility = v ? 'visible' : 'hidden';
      overlay.style.opacity = v ? '1' : '0';
    }

    function onScroll() {
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setVisible(rect.top < window.innerHeight && rect.bottom > 0);

      // target camera Y from scroll progress (smooth lerp in frame loop)
      targetCamY = -p * (SECTIONS.length - 1) * SECTION_H;

      // DOM text visibility by proximity to camera Y
      const sectionAtCamera = -camY / SECTION_H;
      textEls.forEach((el, i) => {
        if (!el) return;
        const d = Math.abs(sectionAtCamera - i);
        // steep falloff: fully gone by ~1/3 section away, so neighbors never co-read.
        // last section also fades out near the very end so the CTA below doesn't collide.
        let opacity = Math.max(0, 1 - d * 3);
        if (i === SECTIONS.length - 1 && p > 0.92) opacity *= Math.max(0, 1 - (p - 0.92) / 0.08);
        el.style.opacity = opacity.toString();
      });
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      // smooth camera lerp to target (ease-in-out feel like reference)
      camY += (targetCamY - camY) * 0.15;
      camera.position.y = camY;

      // decay speed lines based on scroll velocity
      lineSpeed *= 0.94;
      const lp = lGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < lCount; i++) {
        const base = lp.getY(i * 2 + 1);
        lp.setY(i * 2, base + 0.2 + Math.abs(lineSpeed));
      }
      lp.needsUpdate = true;

      // update active section anims (+ neighbors so transitions stay alive)
      const idx = Math.round(-camY / SECTION_H);
      const b = built[idx];
      if (b) {
        b.update?.(now);
        const prev = built[idx - 1];
        if (prev?.el.visible) prev.update?.(now);
        const next = built[idx + 1];
        if (next?.el.visible) next.update?.(now);
      }

      // show/hide sections near camera
      built.forEach((b, i) => {
        b.el.visible = Math.abs(i - idx) <= 1;
      });

      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);

    function onResize() {
      camera.aspect = viewport.clientWidth / viewport.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      textEls.forEach(el => el?.remove());
      renderer.dispose();
      viewport.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      {/* fixed viewport: sticky breaks under the root's overflow-hidden */}
      <div className="fixed inset-0 z-[15] pointer-events-none" style={{ visibility: 'hidden', opacity: 0, transition: 'opacity .5s' }} data-showcase />
      {/* DOM section titles over the WebGL scene */}
      <div ref={overlayRef} className="fixed inset-0 z-[16] pointer-events-none" style={{ visibility: 'hidden', opacity: 0, transition: 'opacity .5s' }} data-showcase-text />
      {/* scroll track sized by section count */}
      <div ref={wrapRef} className="relative" style={{ height: `${SECTIONS.length * 100}vh`, visibility: 'hidden' }} />
    </>
  );
}

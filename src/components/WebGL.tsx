// src/components/WebGL.tsx
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

const vertexShader = `
out vec2 vUv;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float audio1;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}`;

// Ported verbatim from /libs/shaders/orb1.js (Pionner Studios)
const fragmentShader = `
precision highp float;
in vec2 vUv;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float audio1;
uniform float adj;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform float orbOpacity;
uniform float intensity;
uniform vec3 uTint;
uniform float uSteps;
out vec4 outColor;

#define R(p, a) p = p * cos(a) + vec2(-p.y, p.x) * sin(a)
#define time iTime*0.1 
#define tau 6.2831853

mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
float noise( in vec2 x ){return texture(iChannel0, x*.01).x;}
mat2 m2 = mat2( .80,  0.80, -0.80,  0.80 );

float grid(vec2 p)
{
  float s = sin(p.x)*cos(p.y);
  return s;
}

float flow(in vec2 p)
{
  float z=4.;
  float rz = 0.;
  vec2 bp = p;
  for (float i= 1.;i < 8.;i++ )
  {
    bp += time*1.5;
    vec2 gr = vec2(grid(p*3.-time*2.),grid(p*3.+4.-time))*0.4;
    gr = normalize(gr)*0.4;
    gr *= makem2((p.x+p.y)*.3+time*10.);
    p += gr*0.2;
    
    rz+= (sin(noise(p)*2.)*0.5+0.5) /z;
    
    p = mix(bp,p,.5);
    z *= 1.5;
    p *= 2.5;
    p*=m2;
    bp *= 2.5;
    bp*=m2;
  }
  return rz;  
}

float spiral(vec2 p,float scl) 
{
  float r = length(p);
  r = log(r);
  float a = atan(p.y, p.y);
  return abs(mod(scl*(r-2./scl*a),tau)-1.)*1.;
}


float Sin01(float t) {
    return .5 + 0.5 * sin(6.28319 * t );
}

float SineEggCarton(vec3 p) {
    return 0.0 + abs(sin(p.x) - cos(p.y) + sin(p.z)) * 1.2* orbOpacity;
}

float Map(vec3 p, float scale) {
    float dSphere = length(p) - 1.0;
    return max(dSphere, (.9 - SineEggCarton(scale * p)) / scale) ;
}

vec3 GetColor(vec3 p) {
    float amount = clamp((1.5 - length(p)) / 2.0, 0.0, 1.0);
    vec3 amber = uTint;
    // Changing colors over time
    vec3 hue = 0.5 + 0.5 * cos(6.28319 * (iTime * 0.1 + vec3(0.0, 0.33, 0.67)));
    float mixFactor = smoothstep(0.26, 0.4, amount);
    return mix(amber, hue, mixFactor) * amount * (orbOpacity);
}

void main() {
  vec2 coord = gl_FragCoord.xy;
  coord.x-=(iMouse.x*.003);
  coord.y+=(iMouse.y*.003);

  
  vec2 p = coord / iResolution.xy-0.5;
  p.x *= iResolution.x/iResolution.y;
  p*= 2.0  ;
  p.y+=1.5 ;
  float rz = flow(p) ;
  p /= exp(mod(2.1,2.1));
  rz *= (3.2-spiral(p,.5))*.7 * audio1 ; // intensity / thickness of ring
  vec3 col = (uTint * 0.1) / rz; 
  col=pow(abs(col),vec3(1.01)) - (abs((iMouse.x ))*.00005);
  outColor+= vec4(col,1.0);


  vec3 rd = normalize(vec3(2.0 * coord - iResolution.xy, -iResolution.y));

    vec3 ro = vec3(-iMouse.x*.0003, iMouse.y*.0002 , -1.4*(1.0-orbOpacity) -.5 +mix(2.5, 2.0, adj + Sin01( (0.05 ) * iTime))) ;
    R(rd.xz, 0.2 * iTime);
    R(ro.xz, 0.2 * iTime);
    R(rd.yz, 0.1 * iTime);
    R(ro.yz, 0.1 * iTime);
    float t = 0.0;
   // outColor.rgb = vec3(0.0);
    // shell opens as orbOpacity drops: egg-crate scale GROWS while color fades,
    // so the orb unfolds outward instead of just shrinking away
    float open = 1.0 - orbOpacity;
    float scale = mix(.5, 20.0*(orbOpacity*orbOpacity), Sin01(0.1 * iTime*(.01))) + open * 25.0;
    for (int i = 0; i < 60; i++) {
        if (i >= int(uSteps)) break; // mobile runs fewer raymarch steps
        vec3 p = ro + t * rd ; // //(orbOpacity) is more solid lines
        float d = Map(p, scale);
        if (t > 20.0 || d < 0.0001) {
            break;
        }
        t +=.7 * d ;
        outColor.rgb += (0.05 * GetColor(p) * (audio1*.6)) * orbOpacity;
    }
}`;

//  home scene: full-screen shader background plane
// and 350-point additive sprite clouds.
const ORB_OPACITY: Record<string, number> = { home: 1.0, work: 0.3, team: 0.18, feed: 0.4, solutions: 0.5, about: 0.4, contact: 0.3 };

export default function WebGL({ section = 'home', open, onProgress, tint = [1.0, 0.8, 0.0] }: { section?: string; open?: number; onProgress?: (progress: number) => void; tint?: [number, number, number] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<number | undefined>(open);
  const tintRef = useRef<[number, number, number]>(tint);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { tintRef.current = tint; }, [tint]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 0, 50);

    // sprite clouds + a lighter shader budget on phones (also gates raymarch steps + DPR)
    const isDesktop = !/Mobi|Android/i.test(navigator.userAgent);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.debug.checkShaderErrors = true;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isDesktop ? 2 : 1.5));
    container.appendChild(renderer.domElement);

    const target = new THREE.Object3D();
    target.position.set(0, 0, 0);
    scene.add(target);

    const timer = new THREE.Timer();

    const manager = new THREE.LoadingManager();
    manager.onProgress = (url, loaded, total) => { onProgress?.(loaded / total); };
    manager.onLoad = () => onProgress?.(1);
    const texLoader = new THREE.TextureLoader(manager);
    const tex1 = texLoader.load('/assets/images/tex1.png');
    const sprite = texLoader.load('/assets/images/sprite1.png');

    const uniforms = {
      iTime: { type: 'f', value: 100.0 },
      iResolution: { type: 'v2', value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      iMouse: { type: 'v2', value: new THREE.Vector2() },
      audio1: { type: 'f', value: 0.0 },
      adj: { type: 'f', value: 0.2 - window.innerHeight / window.innerWidth },
      orbOpacity: { type: 'f', value: 1.0 },
      intensity: { type: 'f', value: 1.0 },
      uSteps: { type: 'f', value: isDesktop ? 60.0 : 34.0 },
      uTint: { type: 'v3', value: new THREE.Vector3(tintRef.current[0], tintRef.current[1], tintRef.current[2]) },
      iChannel0: { type: 't', value: tex1 },
      iChannel1: { type: 't', value: sprite },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      glslVersion: THREE.GLSL3,
    });

    const bgGeometry = new THREE.PlaneGeometry(1, 1);
    const backgroundPlane = new THREE.Mesh(bgGeometry, shaderMaterial);
    backgroundPlane.scale.set(110 * (window.innerWidth / window.innerHeight), 110, 1);
    scene.add(backgroundPlane);

    // ambient sprites: two point clouds, 350 points, additive blending (desktop only, like the original)
    if (isDesktop) {
      const positions: number[] = [];
      for (let i = 0; i < 350; i++) {
        positions.push(Math.random() * 60 - 30, Math.random() * 60 - 30, Math.random() * 60 - 30);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const [tr, tg, tb] = tintRef.current; // clouds pick up the active theme colour
      const params: [[number, number, number], THREE.Texture, number][] = [
        [[tr, tg, tb], sprite, 0.3],
        [[tr * 0.6, tg * 0.6, tb * 0.6], sprite, 0.3],
      ];
      for (const [color, map, size] of params) {
        const material = new THREE.PointsMaterial({
          size,
          map,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true,
          opacity: 0.35,
        });
        material.color.setRGB(color[0], color[1], color[2]);
        const points = new THREE.Points(geometry, material);
        points.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        scene.add(points);
      }
    }

    let rafId = 0;
    let firstFrameDone = false;

    function animate() {
      rafId = requestAnimationFrame(animate);
      if (document.hidden) return; // don't burn GPU on a backgrounded tab
      timer.update();
      const d = timer.getDelta();
      uniforms.iTime.value += d;
      uniforms.audio1.value = 128.0 / 48.0 + Math.random() * 0.1;
      
      // smoothly transition tint color
      const currentTint = tintRef.current;
      uniforms.uTint.value.lerp(new THREE.Vector3(currentTint[0], currentTint[1], currentTint[2]), Math.min(1, d * 2.0));

      // orb state: menu sections tween to their per-section opacity;
      // home hero is scroll-driven ("open" 0..1 — orb unfolds/dissolves as you scroll in)
      const orbTarget = openRef.current !== undefined ? (1 - openRef.current) : (ORB_OPACITY[section] ?? 1.0);
      uniforms.orbOpacity.value += (orbTarget - uniforms.orbOpacity.value) * Math.min(1, d * 3);

      // smooth mouse
      const w = window as unknown as Record<string, number>;
      const mx = w.APP_mouseX ?? 0;
      const my = w.APP_mouseY ?? 0;
      uniforms.iMouse.value.x += (mx - uniforms.iMouse.value.x) * 0.05;
      uniforms.iMouse.value.y += (my - uniforms.iMouse.value.y) * 0.05;

      // rotate sprite clouds like the original
      if (isDesktop) {
        scene.children.forEach((object, i) => {
          if (object instanceof THREE.Points) {
            object.rotation.z = -0.03 * uniforms.iTime.value * (i < 4 ? i + 1 : -(i + 1));
          }
        });
      }

      // camera parallax toward mouse
      camera.position.x += (-mx * 0.01 - camera.position.x) * 0.05;
      camera.position.y += (my * 0.01 - camera.position.y) * 0.05;

      renderer.render(scene, camera);
      if (!firstFrameDone) {
        firstFrameDone = true;
        (window as unknown as { __orbFirstFrame?: () => void }).__orbFirstFrame?.();
        onProgress?.(1);
      }
    }
    animate();
    function setMouse(clientX: number, clientY: number) {
      const w = window as unknown as Record<string, number>;
      w.APP_mouseX = (clientX / window.innerWidth) * 2 - 1;
      w.APP_mouseY = -((clientY / window.innerHeight) * 2 - 1);
    }
    function onMove(e: MouseEvent) {
      setMouse(e.clientX, e.clientY);
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (t) setMouse(t.clientX, t.clientY);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.iResolution.value.set(w, h);
      uniforms.adj.value = 0.2 - window.innerHeight / window.innerWidth;
      backgroundPlane.scale.set(110 * (w / h), 110, 1);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [section]); // eslint-disable-line react-hooks/exhaustive-deps -- onProgress is a stable setState
  return <div ref={containerRef} className="w-full h-full m-0 p-0" />;
}

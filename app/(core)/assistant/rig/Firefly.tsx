import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { assistantBus } from '../bus';
import { AnchorRegistry } from '../anchors/AnchorRegistry';
import { VISUAL_PRESETS, VisualParams, VisualStateId } from '../state';

// ==== ШЕЙДЕРЫ (как в твоей текущей версии) ====
const coreVertex = /* glsl */`
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const coreFragment = /* glsl */`
  precision mediump float;
  varying vec3 vPos;
  uniform float uTime;
  uniform vec3  uColor;
  void main() {
    float r = length(vPos);
    float glow = smoothstep(0.5, 0.0, r);
    float pulse = 0.65 + 0.35 * sin(uTime * uBreathFreq);
    vec3 col = uColor * glow * pulse;
    gl_FragColor = vec4(col, glow);
  }
`;
const shellVertex = /* glsl */`
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const shellFragment = /* glsl */`
  precision mediump float;
  varying vec3 vNormal;
  uniform vec3 uColor;
  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0,0.0,1.0))), 2.0);
    vec3 col = uColor * fresnel;
    gl_FragColor = vec4(col, fresnel);
  }
`;
const haloVertex = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const haloFragment = /* glsl */`
  precision mediump float;
  varying vec2 vUv;
  uniform vec3 uColor;
  void main() {
    vec2 c = vUv - 0.5;
    float dist = length(c) * 2.0;
    float alpha = smoothstep(1.0, 0.0, dist);
    vec3 col = uColor * 1.5;
    gl_FragColor = vec4(col, alpha * 0.4);
  }
`;

// ==== КОМПОНЕНТ ====
const Firefly = forwardRef<THREE.Group>(function Firefly(_, ref) {
  const group = ref as React.MutableRefObject<THREE.Group | null>;
  const { clock, size, camera } = useThree();

  const haloRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // материалы
  const coreMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: coreVertex,
    fragmentShader: coreFragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(1.0, 0.95, 0.75) },
      uBreathFreq: { value: 3.0 },
    }
  }), []);
  const shellMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: shellVertex,
    fragmentShader: shellFragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    uniforms: { uColor: { value: new THREE.Color(0.8, 0.9, 1.0) } }
  }), []);
  const haloMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: haloVertex,
    fragmentShader: haloFragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(1.0, 0.95, 0.75) } }
  }), []);

  // текущее визуальное состояние
  const [state, setState] = useState<VisualStateId>('Idle');
  // целевая позиция для Point (мировые координаты)
  const targetWorld = useRef<THREE.Vector3 | null>(null);

  // утилиты
  const unproject = (screenX: number, screenY: number, zWorld = 0) => {
    const ndcX = (screenX / size.width) * 2 - 1;
    const ndcY = -(screenY / size.height) * 2 + 1;
    const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
    const dir = v.sub(camera.position).normalize();
    const EPS = 1e-5;
    const denom = Math.abs(dir.z) < EPS ? (dir.z < 0 ? -EPS : EPS) : dir.z;
    const t = (zWorld - camera.position.z) / denom;
    return camera.position.clone().add(dir.multiplyScalar(t));
  };


  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  useEffect(() => {
    return () => {
      coreMat.dispose();
      shellMat.dispose();
      haloMat.dispose();
    };
  }, [coreMat, shellMat, haloMat]);

  

  // подписки на события шины
  useEffect(() => {
    const o1 = assistantBus.on('agent:greet', () => setState('Greet'));
    const o2 = assistantBus.on('agent:listening', () => setState('Listen'));
    const o3 = assistantBus.on('agent:speaking', () => setState('Speak'));
    const o4 = assistantBus.on('agent:thinking', () => setState('Listen'));
    const o5 = assistantBus.on('agent:point', ({ anchorId }) => {
      const a = AnchorRegistry.get(anchorId);
      if (!a) return;
      targetWorld.current = unproject(a.x, a.y, a.z ?? 0);
      setState('Point');
      // см. пункт 5 — тут используем timeoutRef
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        targetWorld.current = null;
        setState('Idle');
      }, 900) as any;
    });
    return () => { o1(); o2(); o3(); o4(); o5(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // рендер-цикл: анимация позиции и применение пресетов
  useFrame((_, dt) => {
    const t = clock.getElapsedTime();
    (coreMat.uniforms.uTime as any).value = t;

    if (!group.current) return;

    // применим визуальные параметры
    const P: VisualParams = VISUAL_PRESETS[state];
    // цвета (медленный бленд)
    // правильно — используем уже вычисленный коэффициент:
    const blend = Math.min(1, dt * 6);

    // если uniforms объявлены как any:
    (coreMat.uniforms.uColor as any).value.lerp(P.coreColor, blend);
    (shellMat.uniforms.uColor as any).value.lerp(P.shellColor, blend);
    (haloMat.uniforms.uColor as any).value.lerp(P.haloColor, blend);

    (coreMat.uniforms as any).uBreathFreq.value = P.breathFreq;

    // масштаб core/halo
    const coreMesh = coreRef.current!;
    const shellMesh = shellRef.current!;
    const haloMesh = haloRef.current!;

    haloMesh.renderOrder = 0;
    shellMesh.renderOrder = 1;
    coreMesh.renderOrder = 2;


    const lerp = Math.min(1, dt * 6);
    coreMesh.scale.lerp(new THREE.Vector3(P.coreScale, P.coreScale, P.coreScale), lerp);
    haloMesh.scale.lerp(new THREE.Vector3(P.haloScale, P.haloScale, 1), lerp);
    shellMesh.scale.lerp(new THREE.Vector3(1, 1, 1), lerp); // фиксированный радиус оболочки

    // Хало всегда «смотрит» в камеру
    haloMesh.quaternion.copy(camera.quaternion);

    // Экранно-стабильный размер гало (коэффициент подберите визуально)
    const dist = group.current.position.distanceTo(camera.position);
    const haloScreenScale = P.haloScale * dist * 0.22;
    haloMesh.scale.lerp(new THREE.Vector3(haloScreenScale, haloScreenScale, 1), lerp);

    // движение: либо «Point», либо дрейф к целевым синусам
    const g = group.current.position;
    if (targetWorld.current) {
      // движение к якорю (быстрое "подлёт")
      g.x += (targetWorld.current.x - g.x) * Math.min(1, dt * 6.0);
      g.y += (targetWorld.current.y - g.y) * Math.min(1, dt * 6.0);
      g.z += (targetWorld.current.z - g.z) * Math.min(1, dt * 6.0);
    } else {
      // базовый дрейф
      const drift = P.driftAmp;
      const tx = Math.sin(t * 0.7) * 0.25 * drift;
      const ty = Math.sin(t * 0.95) * 0.18 * drift + 0.1 * Math.sin(t * 2.1) * drift;
      const tz = Math.cos(t * 0.6) * 0.25 * drift;
      g.x += (tx - g.x) * Math.min(1, dt * 3.0);
      g.y += (ty - g.y) * Math.min(1, dt * 3.0);
      g.z += (tz - g.z) * Math.min(1, dt * 3.0);
    }
  });

  return (
    <group ref={group}>
      {/* Halo */}
      <mesh ref={haloRef}>
        <planeGeometry args={[1, 1]} />
        <primitive object={haloMat} attach="material" />
      </mesh>

      {/* Shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <primitive object={shellMat} attach="material" />
      </mesh>

      {/* Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <primitive object={coreMat} attach="material" />
      </mesh>
    </group>
  );
});

export default Firefly;

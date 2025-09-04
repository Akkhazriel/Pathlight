import React, { forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const vertex = /* glsl */`
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */`
  precision mediump float;
  varying vec3 vPos;
  uniform float uTime;
  uniform vec3  uColor;

  void main() {
    float r = length(vPos);
    float glow = smoothstep(0.5, 0.0, r);
    float pulse = 0.65 + 0.35 * sin(uTime * 3.0);
    vec3 col = uColor * glow * pulse;
    gl_FragColor = vec4(col, glow);
  }
`;

const Firefly = forwardRef<THREE.Group>(function Firefly(_, ref) {
  const group = (ref as React.MutableRefObject<THREE.Group | null>) ?? { current: null };

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(1.0, 0.95, 0.75) },
      },
    });
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    (material.uniforms.uTime as any).value = t;

    if (!group.current) return;
    const targetX = Math.sin(t * 0.7) * 0.25;
    const targetY = Math.sin(t * 0.95) * 0.18 + 0.1 * Math.sin(t * 2.1);
    const targetZ = Math.cos(t * 0.6) * 0.25;
    const p = group.current.position;
    const lerp = Math.min(1, dt * 3.0);
    p.x += (targetX - p.x) * lerp;
    p.y += (targetY - p.y) * lerp;
    p.z += (targetZ - p.z) * lerp;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <primitive attach="material" object={material} />
      </mesh>
    </group>
  );
});

export default Firefly;

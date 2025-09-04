import React, { Suspense, useRef } from 'react';
import * as THREE from 'three';
import Firefly from './rig/Firefly';
import ProjectToScreen from './ui/ProjectToScreen';

export default function SceneController() {
  const fireflyRef = useRef<THREE.Group>(null);

  return (
    <>
      <ambientLight intensity={0.4} />
      <Suspense fallback={null}>
        <Firefly ref={fireflyRef} />
        {/* Проекция позиции светлячка → стор (для пузыря) */}
        <ProjectToScreen target={fireflyRef} />
      </Suspense>
    </>
  );
}

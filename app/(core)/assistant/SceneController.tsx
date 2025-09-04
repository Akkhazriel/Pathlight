/* eslint react/no-unknown-property: "off" */
import React, { memo, useRef } from 'react';
import * as THREE from 'three';
import Firefly from './rig/Firefly';
import ProjectToScreen from './ui/ProjectToScreen';

function SceneControllerImpl() {
  const fireflyRef = useRef<THREE.Group>(null);

  // TODO: сюда позже прилетит scenePreset (Onboarding/Home) и мягкий бленд параметров

  return (
    <>
      <ambientLight intensity={0.4} />
      <Firefly ref={fireflyRef} />
      {/* Проекция позиции светлячка → стор (для пузыря) */}
      <ProjectToScreen target={fireflyRef} />
    </>
  );
}

const SceneController = memo(SceneControllerImpl);
export default SceneController;

import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { useAssistantUI } from '../state/uiStore';

type Props = {
  target: React.RefObject<THREE.Group | null>;
};

export default function ProjectToScreen({ target }: Props) {
  const { camera, size } = useThree();
  const setFireflyScreen = useAssistantUI((s) => s.setFireflyScreen);

  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const obj = target.current;
    if (!obj) return;

    // мировая позиция светлячка
    obj.getWorldPosition(v);

    // проекция в NDC
    const ndc = v.clone().project(camera);

    // проверим, в пределах ли экрана
    const onScreen =
      ndc.x >= -1 && ndc.x <= 1 &&
      ndc.y >= -1 && ndc.y <= 1 &&
      ndc.z >= -1 && ndc.z <= 1;

    // NDC -> пиксели
    const x = (ndc.x * 0.5 + 0.5) * size.width;
    const y = (-ndc.y * 0.5 + 0.5) * size.height;

    setFireflyScreen({
      x: Math.round(x),
      y: Math.round(y),
      onScreen,
    });
  });

  return null;
}

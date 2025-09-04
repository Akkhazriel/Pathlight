import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { useAssistantUI } from '../state/uiStore';

type Props = {
  target: React.RefObject<THREE.Group | null>;
};

export default function ProjectToScreen({ target }: Props) {
  const { camera, size } = useThree();
  const setFireflyScreen = useAssistantUI((s) => s.setFireflyScreen);

  // переиспользуем векторы без аллокаций
  const vWorld = useMemo(() => new THREE.Vector3(), []);
  const vNdc = useMemo(() => new THREE.Vector3(), []);

  // прошлые значения — чтобы не дергать Zustand без надобности
  const prev = useRef<{ x: number; y: number; on: boolean }>({ x: -1, y: -1, on: false });

  useFrame(() => {
    const obj = target.current;
    if (!obj) return;

    // мировая позиция светлячка
    obj.getWorldPosition(vWorld);

    // проверим, объект перед камерой (на всякий случай)
    // (камера смотрит вдоль -Z в three.js; вектор от камеры к объекту должен иметь отрицательный z в coords камеры)
    const camToObj = vWorld.clone().applyMatrix4(camera.matrixWorldInverse); // в coords камеры
    const inFront = camToObj.z < 0;

    // проекция в NDC
    vNdc.copy(vWorld).project(camera);

    // в пределах ли экрана
    const onScreen =
      inFront &&
      vNdc.x >= -1 && vNdc.x <= 1 &&
      vNdc.y >= -1 && vNdc.y <= 1 &&
      vNdc.z >= -1 && vNdc.z <= 1;

    // NDC -> пиксели RN
    const x = (vNdc.x * 0.5 + 0.5) * size.width;
    const y = (-vNdc.y * 0.5 + 0.5) * size.height;

    // обновляем стор ТОЛЬКО если действительно изменилось
    const dx = Math.abs(x - prev.current.x);
    const dy = Math.abs(y - prev.current.y);
    const don = onScreen !== prev.current.on;
    if (dx > 0.5 || dy > 0.5 || don) {
      prev.current = { x, y, on: onScreen };
      setFireflyScreen({
        x: Math.round(x),
        y: Math.round(y),
        onScreen,
      });
    }
  });

  return null;
}

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import SceneController from './SceneController';

function AssistantCanvasImpl() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Canvas
        onCreated={(state) => {
          // Прозрачный фон — Canvas “парит” над UI
          state.gl.setClearColor(0x000000, 0);
        }}
      >
        <SceneController />
      </Canvas>
    </View>
  );
}

const AssistantCanvas = memo(AssistantCanvasImpl);
export default AssistantCanvas;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import SceneController from './SceneController';

export default function AssistantCanvas() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas
        onCreated={(state) => {
          state.gl.setClearColor(0x000000, 0); // прозрачный фон
        }}
      >
        <SceneController />
      </Canvas>
    </View>
  );
}
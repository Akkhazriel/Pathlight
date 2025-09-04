import * as THREE from 'three';

export type VisualStateId = 'Idle' | 'Greet' | 'Listen' | 'Speak' | 'Point';

export type VisualParams = Readonly<{
  coreColor: THREE.Color;   // COLOR OBJECT to avoid per-frame allocations
  shellColor: THREE.Color;
  haloColor: THREE.Color;
  breathFreq: number;       // частота "дыхания"
  driftAmp: number;         // амплитуда дрейфа
  haloScale: number;        // базовый размер гало (дальше масштабируется от дистанции)
  coreScale: number;        // базовый масштаб ядра
  // опционально под будущее (можешь не использовать сейчас):
  pulseAmp?: number;        // амплитуда пульса ядра (0..1)
  haloAlpha?: number;       // прозрачность гало (0..1)
}>;

const freeze = <T extends object>(o: T) => Object.freeze(o);

export const VISUAL_PRESETS: Readonly<Record<VisualStateId, VisualParams>> = freeze({
  Idle: freeze({
    coreColor: new THREE.Color(1.0, 0.95, 0.75),
    shellColor: new THREE.Color(0.82, 0.9, 1.0),
    haloColor: new THREE.Color(1.0, 0.95, 0.75),
    breathFreq: 3.0,
    driftAmp: 1.0,
    haloScale: 1.6,
    coreScale: 1.0,
    pulseAmp: 0.35,
    haloAlpha: 0.40,
  }),
  Greet: freeze({
    coreColor: new THREE.Color(1.0, 0.96, 0.8),
    shellColor: new THREE.Color(0.9, 0.96, 1.0),
    haloColor: new THREE.Color(1.0, 0.98, 0.85),
    breathFreq: 3.6,
    driftAmp: 1.1,
    haloScale: 1.9,
    coreScale: 1.05,
    pulseAmp: 0.42,
    haloAlpha: 0.48,
  }),
  Listen: freeze({
    coreColor: new THREE.Color(0.75, 0.9, 1.0),
    shellColor: new THREE.Color(0.85, 0.95, 1.0),
    haloColor: new THREE.Color(0.78, 0.92, 1.0),
    breathFreq: 2.4,
    driftAmp: 0.8,
    haloScale: 1.5,
    coreScale: 0.98,
    pulseAmp: 0.30,
    haloAlpha: 0.36,
  }),
  Speak: freeze({
    coreColor: new THREE.Color(1.0, 0.88, 0.75),
    shellColor: new THREE.Color(0.92, 0.96, 1.0),
    haloColor: new THREE.Color(1.0, 0.9, 0.78),
    breathFreq: 4.2,
    driftAmp: 1.1,
    haloScale: 1.7,
    coreScale: 1.02,
    pulseAmp: 0.45,
    haloAlpha: 0.46,
  }),
  Point: freeze({
    coreColor: new THREE.Color(1.0, 0.95, 0.7),
    shellColor: new THREE.Color(0.9, 0.96, 1.0),
    haloColor: new THREE.Color(1.0, 0.95, 0.7),
    breathFreq: 3.2,
    driftAmp: 0.6,
    haloScale: 1.5,
    coreScale: 1.0,
    pulseAmp: 0.35,
    haloAlpha: 0.42,
  }),
});

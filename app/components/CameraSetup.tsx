'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CameraSetupProps {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  raycasterRef: React.MutableRefObject<THREE.Raycaster | null>;
}

export function CameraSetup({ cameraRef, raycasterRef }: CameraSetupProps) {
  const { camera } = useThree();
  
  useEffect(() => {
    cameraRef.current = camera;
    raycasterRef.current = new THREE.Raycaster();
  }, [camera, cameraRef, raycasterRef]);

  return null;
}

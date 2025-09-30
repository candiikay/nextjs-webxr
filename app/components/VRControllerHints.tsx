// VR Controller Interaction Hints Component
// Provides visual feedback and instructions for VR users
// Similar to Meta Quest sneaker builder's VR interaction system

import React from 'react';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

// VR Controller Hints Component
export function VRControllerHints() {
  // Get XR session info to show appropriate hints
  const { session } = useXR();
  const isPresenting = !!session;

  // Only show hints when in VR mode
  if (!isPresenting) {
    return null;
  }

  return (
    <group position={[0, -3, 0]}>
      {/* VR Interaction Instructions */}
      <mesh>
        <planeGeometry args={[6, 1]} />
        <meshBasicMaterial 
          color="#1f2937" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Instruction Text Area - This would be replaced with actual 3D text */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[5.5, 0.8]} />
        <meshBasicMaterial color="#374151" />
      </mesh>

      {/* VR Controller Icons/Representations */}
      <group position={[-2, 0, 0.02]}>
        {/* Left Controller */}
        <mesh>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        {/* Trigger representation */}
        <mesh position={[0, 0, -0.05]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1]} />
          <meshBasicMaterial color="#1e40af" />
        </mesh>
      </group>

      <group position={[2, 0, 0.02]}>
        {/* Right Controller */}
        <mesh>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        {/* Trigger representation */}
        <mesh position={[0, 0, -0.05]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1]} />
          <meshBasicMaterial color="#047857" />
        </mesh>
      </group>

      {/* Interaction Arrows */}
      <group position={[0, 0, 0.02]}>
        {/* Point and click instruction */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <arrowHelper 
            args={[
              new THREE.Vector3(0, 1, 0), // direction
              new THREE.Vector3(0, 0, 0), // origin
              0.3, // length
              0xffffff, // color
              0.1, // head length
              0.05 // head width
            ]}
          />
        </mesh>
      </group>
    </group>
  );
}

// VR Teleportation Indicator Component
export function VRTeleportIndicator() {
  const { session } = useXR();
  const isPresenting = !!session;

  if (!isPresenting) {
    return null;
  }

  return (
    <group>
      {/* Teleportation ring on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
        <ringGeometry args={[1, 1.2, 32]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.5}
        />
      </mesh>
      
      {/* Center dot */}
      <mesh position={[0, -0.98, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#1e40af" />
      </mesh>
    </group>
  );
}

// VR Hand Tracking Indicator
export function VRHandTrackingIndicator() {
  const { session } = useXR();
  const isPresenting = !!session;

  if (!isPresenting) {
    return null;
  }

  return (
    <group>
      {/* Hand tracking visualization */}
      <mesh position={[3, 1, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial 
          color="#1f2937" 
          transparent 
          opacity={0.6}
        />
      </mesh>
      
      {/* Hand representation */}
      <group position={[3, 1, 0.01]}>
        {/* Palm */}
        <mesh>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        
        {/* Fingers */}
        {[0, 1, 2, 3, 4].map((finger, index) => (
          <mesh 
            key={finger}
            position={[
              Math.cos(index * 0.5) * 0.15,
              Math.sin(index * 0.5) * 0.15,
              0
            ]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.2]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// A reusable 3D cube component built with React Three Fiber
// This demonstrates how to create modular 3D objects that can be used anywhere
// Enhanced with XR support for VR/AR interactions

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Define the Cube component as a function that accepts mesh properties
// React.ComponentProps<'mesh'> means it accepts any props that a regular mesh would accept
// This includes position, rotation, scale, onClick handlers, etc.
export function Cube(props: React.ComponentProps<'mesh'>) {
  // useRef creates a reference to the mesh object for direct manipulation
  const meshRef = useRef<THREE.Mesh>(null);
  
  // useState creates state variables that trigger re-renders when changed
  const [hovered, setHovered] = useState(false);  // Track if mouse is over the cube
  const [clicked, setClicked] = useState(false);  // Track if cube has been clicked
  
  // useFrame runs on every frame (typically 60fps) - perfect for animations
  useFrame((state, delta) => {
    // Rotate the cube continuously around the Y axis
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;  // Slow, smooth rotation
    }
  });
  
  return (
    // mesh is the fundamental 3D object in Three.js
    // It combines geometry (shape) with material (appearance)
    // {...props} spreads any props passed to this component onto the mesh
    <mesh 
      ref={meshRef}  // Connect our ref to the mesh
      {...props}
      // Event handlers for mouse/touch interaction
      onClick={(event) => {
        event.stopPropagation();  // Prevent event from bubbling up
        setClicked(!clicked);     // Toggle clicked state
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);         // Set hovered to true when mouse enters
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);        // Set hovered to false when mouse leaves
      }}
    >
      
      {/* 
        boxGeometry defines the shape of our cube
        args={[width, height, depth]} - in this case, a 2x2x2 cube
        Geometry defines the vertices and faces that make up the 3D shape
      */}
      <boxGeometry args={[2, 2, 2]} />
      
      {/* 
        meshStandardMaterial defines how the surface looks and reacts to light
        This material responds realistically to lighting in the scene
        Dynamic color changes based on interaction state
      */}
      <meshStandardMaterial 
        color={hovered ? "#ff4757" : (clicked ? "#2ed573" : "#ff6b35")}  // Color changes on hover/click
        metalness={0.1}   // How metallic the surface looks (0 = not metallic, 1 = very metallic)
        roughness={0.3}   // How rough the surface is (0 = mirror-like, 1 = very rough)
      />
    </mesh>
  );
}
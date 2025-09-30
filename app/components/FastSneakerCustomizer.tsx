// Fast Sneaker Customizer Component - Fixed for stable hover/click
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Bounds } from '@react-three/drei';
import { useXR } from '@react-three/xr';
import * as THREE from 'three';

// Complete sneaker part types
type SneakerPart = 
  | 'vamp' | 'quarter' | 'heel_counter' | 'collar' | 'tongue'
  | 'vholes' | 'eyestay' | 'eyestay_secondary' | 'lace' | 'lace_tip' | 'lace_aglet'
  | 'quarter_overlay' | 'tongue_secondary' | 'vamp_overlay' | 'heel_overlay'
  | 'outsole' | 'midsole' | 'tip' | 'heel_lift' | 'toe_cap' | 'sole_unit'
  | 'tip_stiching' | 'heel_counter_stiching' | 'quarter_overlay_stiching' 
  | 'vamp_stiching' | 'tongue_stiching' | 'collar_stiching' | 'lace_stiching'
  | 'insole' | 'footbed' | 'inner_sole' | 'sockliner' | 'inner' | 'heel_cup'
  | 'arch_support' | 'toe_box_inner' | 'collar_inner' | 'tongue_inner'
  | 'backtab' | 'heel_pull' | 'heel_loop' | 'back_counter'
  | 'logo' | 'brand_tag' | 'size_tag' | 'model_tag'
  | 'perforations' | 'mesh_panels' | 'vent_holes' | 'breathable_zones'
  | 'trim' | 'accent_stripes' | 'contrast_panels' | 'color_blocks'
  | 'eyelets' | 'speed_lacing' | 'buckles' | 'straps' | 'clasps'
  | string;

// Sneaker customization options
interface SneakerOptions {
  selectedPart: SneakerPart | null;
  size: number;
  rotation: number;
  position: [number, number, number];
  partColors: Record<SneakerPart, string>;
}

// Color palette is now defined in page.tsx

// Expose a simple reset signal via props so the parent can trigger a reset
export function FastSneakerCustomizer(props: React.ComponentProps<'group'> & { 
  resetSignal?: number;
  customizerOpen?: boolean;
  setCustomizerOpen?: (open: boolean) => void;
  selectedPartForColor?: string | null;
  setSelectedPartForColor?: (part: string | null) => void;
  clickedPart?: string | null;
  setClickedPart?: (part: string | null) => void;
  partColors?: Record<string, string>;
}) {
  // Destructure props
  const { 
    clickedPart = null,
    setClickedPart = () => {},
    setCustomizerOpen = () => {},
    setSelectedPartForColor = () => {},
    partColors = {}
  } = props;
  
  // XR session state to toggle VR-specific behavior
  const xr = useXR();
  // State for sneaker customization
  const [options, setOptions] = useState<SneakerOptions>({
    selectedPart: 'vamp',
    size: 7.0,
    rotation: 0,
    position: [0, 0, 0],
    partColors: {
      vamp: '#f8bbd9',
      quarter: '#f8bbd9',
      heel_counter: '#f5deb3',
      collar: '#f5deb3',
      tongue: '#f8bbd9',
      vholes: '#ffb3ba',
      eyestay: '#ffb3ba',
      eyestay_secondary: '#faf0e6',
      lace: '#ffffff',
      lace_tip: '#f8bbd9',
      lace_aglet: '#b8b8b8',
      quarter_overlay: '#f5deb3',
      tongue_secondary: '#faf0e6',
      vamp_overlay: '#ffb3ba',
      heel_overlay: '#f5deb3',
      outsole: '#8b7355',
      midsole: '#ffffff',
      tip: '#8b7355',
      heel_lift: '#8b7355',
      toe_cap: '#8b7355',
      sole_unit: '#8b7355',
      tip_stiching: '#ffb3ba',
      heel_counter_stiching: '#f5deb3',
      quarter_overlay_stiching: '#f5deb3',
      vamp_stiching: '#f8bbd9',
      tongue_stiching: '#ffffff',
      collar_stiching: '#ffb3ba',
      lace_stiching: '#b8b8b8',
      insole: '#faf0e6',
      footbed: '#faf0e6',
      inner_sole: '#faf0e6',
      sockliner: '#faf0e6',
      inner: '#faf0e6',
      heel_cup: '#ffffff',
      arch_support: '#faf0e6',
      toe_box_inner: '#ffffff',
      collar_inner: '#ffb3ba',
      tongue_inner: '#f8bbd9',
      backtab: '#ffffff',
      heel_pull: '#f5deb3',
      heel_loop: '#f5deb3',
      back_counter: '#f5deb3',
      logo: '#b8b8b8',
      brand_tag: '#b8b8b8',
      size_tag: '#b8b8b8',
      model_tag: '#b8b8b8',
      perforations: '#b8b8b8',
      mesh_panels: '#ffffff',
      vent_holes: '#b8b8b8',
      breathable_zones: '#ffffff',
      trim: '#f8bbd9',
      accent_stripes: '#f5deb3',
      contrast_panels: '#ffb3ba',
      color_blocks: '#faf0e6',
      eyelets: '#d3d3d3',
      speed_lacing: '#b8b8b8',
      buckles: '#d3d3d3',
      straps: '#f8bbd9',
      clasps: '#d3d3d3'
    }
  });

  // Smart customizer state
  // Color picker state is now passed as props from parent
  const [hoveredPart, setHoveredPart] = useState<SneakerPart | null>(null);
  // clickedPart is now passed as prop from parent
  
  // Refs for the sneaker
  const rightSneakerRef = useRef<THREE.Group>(null);
  const sneakerContainerRef = useRef<THREE.Group>(null);
  const sneakerSceneRef = useRef<THREE.Object3D | null>(null);
  
  // Performance optimization: track previous states to avoid unnecessary updates
  const prevHoveredPart = useRef<string | null>(null);
  const prevClickedPart = useRef<string | null>(null);
  
  // Mouse drag state for rotation
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [rotationX, setRotationX] = useState(0);
  
  // Sneaker dragging state
  const [isDraggingSneaker, setIsDraggingSneaker] = useState(false);
  const [sneakerDragOffset, setSneakerDragOffset] = useState({ x: 0, y: 0, z: 0 });

  // Rigid movement limits so the sneaker always stays in view
  const movementLimits = useMemo(() => ({
    maxX: 2.5,
    maxZ: 2.0,
    minY: 0.6,
    maxY: 2.0
  }), []);
  
  // Load the real sneaker GLTF model
  const { scene: sneakerScene } = useGLTF('/content/gltf/sneaker.gltf');
  
  // Preload the sneaker model
  useGLTF.preload('/content/gltf/sneaker.gltf');
  
  // State for GLTF loading errors
  const [gltfError, setGltfError] = useState<Error | null>(null);
  
  // Handle GLTF loading errors and loading indicator
  React.useEffect(() => {
    if (sneakerScene) {
      setGltfError(null);
      // Hide loading indicator when scene is loaded
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.style.opacity = '0';
      }
    } else {
      // Show loading indicator when scene is not loaded
      const loadingIndicator = document.getElementById('loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.style.opacity = '1';
      }
    }
  }, [sneakerScene]);
  
  // Cursor state is handled manually in event handlers

  // XR placement: when a VR session starts, position the sneaker comfortably
  React.useEffect(() => {
    if (xr.session) {
      setOptions(prev => ({
        ...prev,
        position: [0, 1.15, -1.2]
      }));
    }
  }, [xr.session]);
  
  // Clone the GLTF once and keep it stable - THIS IS THE KEY FIX
  const clonedScene = useMemo(() => {
    if (!sneakerScene) {
      console.warn('Sneaker scene not loaded yet');
      return null;
    }
    try {
      return sneakerScene.clone(true);
    } catch (error) {
      console.error('Error cloning sneaker scene:', error);
      return null;
    }
  }, [sneakerScene]);

  // Set up stable references and debug logging
  React.useEffect(() => {
    if (!clonedScene) return;
    
    console.log('🔍 GLTF Scene Debug:');
    const meshNames: string[] = [];
    clonedScene.traverse((child) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((child as any).isMesh) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mesh = child as any;
        console.log('📦 Mesh:', mesh.name, 'Material:', mesh.material?.color?.getHexString?.() || 'no color');
        meshNames.push(mesh.name);
        
        // Set up stable userData and material references
        mesh.userData.partName = mesh.name || '';
        mesh.userData.baseMaterial = mesh.material;
        if (!mesh.raycast) mesh.raycast = THREE.Mesh.prototype.raycast;
      }
    });
    console.log('📋 All mesh names:', meshNames);
    console.log('🎯 Available parts for hover:', meshNames.filter(name => name && name.trim() !== ''));
    
    // Store reference for material updates
    sneakerSceneRef.current = clonedScene;
  }, [clonedScene]);

  // Update materials when hover/click state changes - SIMPLE VERSION
  // ULTRA-OPTIMIZED: Only update materials for parts that actually changed
  React.useEffect(() => {
    if (!sneakerSceneRef.current) return;
    
    // Check if anything actually changed
    const hoverChanged = hoveredPart !== prevHoveredPart.current;
    const clickChanged = clickedPart !== prevClickedPart.current;
    
    if (!hoverChanged && !clickChanged && Object.keys(partColors).length === 0) return;
    
    // Only update materials for parts that actually changed
    const partsToUpdate = new Set<string>();
    
    // Add currently hovered/clicked parts
    if (hoveredPart) partsToUpdate.add(hoveredPart);
    if (clickedPart) partsToUpdate.add(clickedPart);
    
    // Add previously hovered/clicked parts to reset them
    if (prevHoveredPart.current) partsToUpdate.add(prevHoveredPart.current);
    if (prevClickedPart.current) partsToUpdate.add(prevClickedPart.current);
    
    // Add parts that have color changes
    Object.keys(partColors).forEach(partName => {
      partsToUpdate.add(partName);
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sneakerSceneRef.current.traverse((child: any) => {
      if (!child.isMesh) return;
      
      const partName = (child.userData.partName as string) || '';
      if (!partsToUpdate.has(partName)) return; // Skip unchanged parts
      
      const isHovered = hoveredPart === partName;
      const isClicked = clickedPart === partName;

      const mat: THREE.MeshStandardMaterial = child.userData.baseMaterial;
      if (!mat) return;

      // Only update if this part has a color change or is hovered/clicked
      const base = partColors[partName as SneakerPart];
      if (base) {
        mat.color.set(base);
      }

      // Hover/click accents - use bright pink for better visibility on light colors
      if (isHovered) {
        mat.emissive?.set('#ff69b4');
        mat.emissiveIntensity = 0.4;
      } else if (isClicked) {
        mat.emissive?.set('#ff69b4');
        mat.emissiveIntensity = 0.8;
      } else {
        mat.emissive?.setRGB(0, 0, 0);
        mat.emissiveIntensity = 0.0;
      }
    });
    
    // Update refs
    prevHoveredPart.current = hoveredPart;
    prevClickedPart.current = clickedPart;
  }, [hoveredPart, clickedPart, partColors]);

  // Event handlers - optimized with debouncing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    const partName = e.object.userData?.partName || e.object.name;
    if (partName && partName.trim() !== '' && partName !== hoveredPart) {
      setHoveredPart(partName);
      document.body.style.cursor = 'grab';
    }
  }, [hoveredPart]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation();
    if (hoveredPart) {
      setHoveredPart(null);
      document.body.style.cursor = 'default';
    }
  }, [hoveredPart]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    const partName = e.object.userData?.partName || e.object.name;
    
    if (partName && partName.trim() !== '') {
      if (clickedPart === partName) {
        setClickedPart(null);
        setSelectedPartForColor(null);
        setCustomizerOpen(false);
        setHoveredPart(null);
      } else {
        setClickedPart(partName);
        setSelectedPartForColor(partName);
        setCustomizerOpen(true);
        setHoveredPart(null);
      }
    }
  }, [clickedPart, setClickedPart, setCustomizerOpen, setSelectedPartForColor]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerDown = useCallback((e: any) => {
    setIsDraggingSneaker(true);
    setLastMousePosition({ x: e.clientX || 0, y: e.clientY || 0 });
    // While dragging, show a grabbing cursor for clarity
    document.body.style.cursor = 'grabbing';
  }, []);

  // Color updates are now handled by the parent component

  // No platform geometries needed anymore

  // Animation frame
  const animationOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const floatY = Math.sin(time + animationOffset) * 0.04;

    if (rightSneakerRef.current) {
      rightSneakerRef.current.position.y = 1.2 + floatY;
      
      if (isDraggingSneaker) {
        const pulseScale = 1.0 + Math.sin(time * 8) * 0.02;
        rightSneakerRef.current.scale.setScalar(options.size * pulseScale);
      } else {
        rightSneakerRef.current.scale.setScalar(options.size);
      }
    }
  });

  // Keyboard controls
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'arrowup':
        setOptions(prev => ({ ...prev, position: [prev.position[0], prev.position[1] + 0.5, prev.position[2]] }));
        break;
      case 'arrowdown':
        setOptions(prev => ({ ...prev, position: [prev.position[0], prev.position[1] - 0.5, prev.position[2]] }));
        break;
      case 'arrowleft':
        setOptions(prev => ({ ...prev, position: [prev.position[0] - 0.5, prev.position[1], prev.position[2]] }));
        break;
      case 'arrowright':
        setOptions(prev => ({ ...prev, position: [prev.position[0] + 0.5, prev.position[1], prev.position[2]] }));
        break;
      case 'z':
        setOptions(prev => ({ ...prev, size: Math.min(50, prev.size + 2) }));
        break;
      case 'x':
        setOptions(prev => ({ ...prev, size: Math.max(5, prev.size - 2) }));
        break;
      case 'c':
        setOptions(prev => ({ ...prev, size: 15 }));
        break;
    }
  }, []);

  // Mouse drag handlers
  const handleMouseDown = useCallback((event: MouseEvent) => {
    setIsDragging(true);
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDraggingSneaker) {
      const deltaX = (event.clientX - lastMousePosition.x) * 0.01;
      const deltaY = (event.clientY - lastMousePosition.y) * 0.01;
      
      setSneakerDragOffset(prev => {
        const newX = Math.max(-movementLimits.maxX, Math.min(movementLimits.maxX, prev.x + deltaX));
        const newZ = Math.max(-movementLimits.maxZ, Math.min(movementLimits.maxZ, prev.z - deltaY));
        let newY = prev.y;
        if (event.shiftKey) {
          const candidateY = prev.y + deltaY;
          newY = Math.max(movementLimits.minY, Math.min(movementLimits.maxY, candidateY));
        }
        return { x: newX, y: newY, z: newZ };
      });
      
      setLastMousePosition({ x: event.clientX, y: event.clientY });
      return;
    }
    
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastMousePosition.x;
    const deltaY = event.clientY - lastMousePosition.y;
    const rotationSpeed = 0.01;
    
    setOptions(prev => ({
      ...prev,
      rotation: prev.rotation + deltaX * rotationSpeed
    }));
    
    setRotationX(prev => Math.max(-Math.PI/2, Math.min(Math.PI/2, prev - deltaY * rotationSpeed)));
    
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  }, [isDragging, isDraggingSneaker, lastMousePosition, movementLimits]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDraggingSneaker(false);
    // Return to a neutral cursor after drag ends
    document.body.style.cursor = 'grab';
  }, []);

  // Event listeners
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [handleKeyDown, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Listen for parent reset requests via a numeric signal that increments
  React.useEffect(() => {
    if (props.resetSignal === undefined) return;
    // Restore the default view: size, rotation, position
    setOptions(prev => ({
      ...prev,
      size: 7.0,
      rotation: 0,
      position: [0, 0, 0]
    }));
    setRotationX(0);
    setSneakerDragOffset({ x: 0, y: 0, z: 0 });
  }, [props.resetSignal]);

  // Don't render if scene isn't loaded
  if (!clonedScene) {
    if (gltfError) {
      console.error('GLTF Loading failed:', gltfError);
      return (
        <group>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="red" />
          </mesh>
        </group>
      );
    }
    return null;
  }

    return (
      <group {...props}>
      {/* Color picker is now handled in page.tsx for fixed positioning */}

      {/* VR-like framing: Bounds wraps both sneaker and platform; no wheel scaling */}
      <Bounds fit observe={false} margin={1.0}>
        {/* Interactive Sneaker Container */}
      <group 
        ref={sneakerContainerRef}
        position={[
          options.position[0] + sneakerDragOffset.x, 
            options.position[1] + sneakerDragOffset.y,
          options.position[2] + sneakerDragOffset.z
        ]}
        >
          {/* Single Sneaker - STABLE VERSION with shadows */}
        <group 
          ref={rightSneakerRef} 
          scale={[options.size, options.size, options.size]} 
            position={[0, 1.2, 0]}
          rotation={[rotationX + 0.1, options.rotation + Math.PI, 0]}
            castShadow
            receiveShadow
          >
            <primitive 
              object={clonedScene}
              onClick={handleClick}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
              onPointerDown={handlePointerDown}
              castShadow
              receiveShadow
            />
          </group>
        </group>

        {/* Grounding is handled outside Bounds so framing centers on the sneaker */}
      </Bounds>

      {/* Lighting is now handled by the main scene for better performance */}
    </group>
  );
}

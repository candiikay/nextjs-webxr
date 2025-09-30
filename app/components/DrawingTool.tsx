'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';

interface DrawingToolProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDrawing: (part: string, textureData: string) => void;
  selectedPart: string | null;
  currentColor: string;
  meshRef: React.RefObject<THREE.Object3D | null>;
  camera: THREE.Camera;
  raycaster: THREE.Raycaster;
  brushSize?: number;
  brushOpacity?: number;
  brushColor?: string;
  onBrushSizeChange?: (size: number) => void;
  onBrushOpacityChange?: (opacity: number) => void;
  onBrushColorChange?: (color: string) => void;
}

export function DrawingTool({
  isOpen,
  onClose,
  onApplyDrawing,
  selectedPart,
  currentColor,
  meshRef,
  camera,
  raycaster,
  brushSize = 10,
  brushOpacity = 1,
  brushColor = currentColor,
  onBrushSizeChange,
  onBrushOpacityChange,
  onBrushColorChange
}: DrawingToolProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'paint' | 'erase'>('paint');
  const [textureCanvas, setTextureCanvas] = useState<HTMLCanvasElement | null>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [material, setMaterial] = useState<THREE.MeshStandardMaterial | null>(null);
  const [lastUV, setLastUV] = useState<THREE.Vector2 | null>(null);

  // Initialize texture canvas and material
  useEffect(() => {
    console.log('DrawingTool: Initializing...', { isOpen, selectedPart, hasMesh: !!meshRef.current });
    
    if (!isOpen || !selectedPart || !meshRef.current) return;

    // Create a 512x512 canvas for the texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, 512, 512);
    }
    setTextureCanvas(canvas);

    // Create texture from canvas
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.flipY = false;
    canvasTexture.needsUpdate = true;
    setTexture(canvasTexture);

    // Find the material for the selected part
    let targetMaterial: THREE.MeshStandardMaterial | null = null;
    meshRef.current.traverse((child: any) => {
      if (child.isMesh && child.userData?.partName === selectedPart) {
        targetMaterial = child.material as THREE.MeshStandardMaterial;
        console.log('DrawingTool: Found material for part:', selectedPart);
      }
    });

    if (targetMaterial) {
      setMaterial(targetMaterial);
      // Store original map if it exists
      if (!(targetMaterial as any).userData.originalMap) {
        (targetMaterial as any).userData.originalMap = (targetMaterial as any).map;
      }
      (targetMaterial as any).map = canvasTexture;
      (targetMaterial as any).needsUpdate = true;
      console.log('DrawingTool: Applied texture to material for part:', selectedPart);
    } else {
      console.log('DrawingTool: No material found for part:', selectedPart);
    }

    return () => {
      if (targetMaterial && (targetMaterial as any).userData.originalMap) {
        (targetMaterial as any).map = (targetMaterial as any).userData.originalMap;
        (targetMaterial as any).needsUpdate = true;
      }
    };
  }, [isOpen, selectedPart, meshRef]);

  // Update brush color when currentColor changes
  useEffect(() => {
    if (onBrushColorChange) {
      onBrushColorChange(currentColor);
    }
  }, [currentColor, onBrushColorChange]);

  // Get UV coordinates from 3D position
  const getUVFromIntersection = useCallback((intersection: THREE.Intersection): THREE.Vector2 | null => {
    if (!intersection.uv || !(intersection.object as any).geometry) return null;

    // Convert UV coordinates to canvas coordinates
    const uv = intersection.uv.clone();
    uv.x *= 512;
    uv.y *= 512;
    return uv;
  }, []);

  // Draw on texture canvas
  const drawOnTexture = useCallback((uv: THREE.Vector2, isStart: boolean = false) => {
    if (!textureCanvas) {
      console.log('DrawingTool: No texture canvas');
      return;
    }

    const ctx = textureCanvas.getContext('2d');
    if (!ctx) {
      console.log('DrawingTool: No canvas context');
      return;
    }

    console.log('DrawingTool: Drawing at UV:', uv.x, uv.y, 'isStart:', isStart);

    if (isStart) {
      ctx.beginPath();
      ctx.moveTo(uv.x, uv.y);
      console.log('DrawingTool: Started path at', uv.x, uv.y);
    } else {
      ctx.globalCompositeOperation = drawingMode === 'paint' ? 'source-over' : 'destination-out';
      ctx.globalAlpha = drawingMode === 'paint' ? brushOpacity : 1;
      ctx.strokeStyle = drawingMode === 'paint' ? brushColor : 'rgba(0,0,0,1)';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.lineTo(uv.x, uv.y);
      ctx.stroke();
      console.log('DrawingTool: Drew line to', uv.x, uv.y);
      
      ctx.beginPath();
      ctx.moveTo(uv.x, uv.y);
    }

    // Update texture
    if (texture) {
      texture.needsUpdate = true;
      console.log('DrawingTool: Updated texture');
    }
  }, [textureCanvas, drawingMode, brushOpacity, brushColor, brushSize, texture]);

  // Handle pointer events
  const handlePointerDown = useCallback((event: PointerEvent) => {
    if (!isOpen || !meshRef.current) {
      console.log('DrawingTool: Not open or no mesh ref');
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Get canvas bounds for proper coordinate calculation
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    console.log('DrawingTool: Mouse coords:', mouse.x, mouse.y);
    console.log('DrawingTool: Selected part:', selectedPart);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current as any, true);

    console.log('DrawingTool: Intersections found:', intersects.length);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      console.log('DrawingTool: Intersection part:', intersection.object.userData.partName);
      
      if (intersection.object.userData.partName === selectedPart) {
        const uv = getUVFromIntersection(intersection);
        console.log('DrawingTool: UV coords:', uv);
        
        if (uv) {
          setIsDrawing(true);
          setLastUV(uv);
          drawOnTexture(uv, true);
          console.log('DrawingTool: Started drawing');
        }
      }
    }
  }, [isOpen, meshRef, selectedPart, raycaster, camera, getUVFromIntersection, drawOnTexture]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !meshRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    // Get canvas bounds for proper coordinate calculation
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current as any, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      if (intersection.object.userData.partName === selectedPart) {
        const uv = getUVFromIntersection(intersection);
        if (uv && lastUV) {
          // Interpolate between last UV and current UV for smooth lines
          const steps = Math.max(Math.abs(uv.x - lastUV.x), Math.abs(uv.y - lastUV.y));
          const stepCount = Math.ceil(steps);
          
          for (let i = 0; i <= stepCount; i++) {
            const t = i / stepCount;
            const interpolatedUV = new THREE.Vector2().lerpVectors(lastUV, uv, t);
            drawOnTexture(interpolatedUV);
          }
          
          setLastUV(uv);
        }
      }
    }
  }, [isDrawing, meshRef, selectedPart, raycaster, camera, getUVFromIntersection, drawOnTexture, lastUV]);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (isDrawing) {
      event.preventDefault();
      event.stopPropagation();
      setIsDrawing(false);
      setLastUV(null);
    }
  }, [isDrawing]);

  // Add event listeners when drawing is active
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalPointerDown = (event: PointerEvent) => {
      // Only handle if not clicking on UI elements
      const target = event.target as HTMLElement;
      if (target.closest('[data-drawing-controls]')) return;
      
      // Only handle if we're in drawing mode and have a selected part
      if (!selectedPart) return;
      
      // Prevent default to stop OrbitControls
      event.preventDefault();
      event.stopPropagation();
      
      handlePointerDown(event);
    };

    const handleGlobalPointerMove = (event: PointerEvent) => {
      if (!isDrawing) return;
      
      // Prevent default to stop OrbitControls
      event.preventDefault();
      event.stopPropagation();
      
      handlePointerMove(event);
    };

    const handleGlobalPointerUp = (event: PointerEvent) => {
      if (isDrawing) {
        // Prevent default to stop OrbitControls
        event.preventDefault();
        event.stopPropagation();
        
        handlePointerUp(event);
      }
    };

    // Add event listeners to the canvas element specifically
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('pointerdown', handleGlobalPointerDown, { passive: false });
      canvas.addEventListener('pointermove', handleGlobalPointerMove, { passive: false });
      canvas.addEventListener('pointerup', handleGlobalPointerUp, { passive: false });

      // Change cursor to crosshair when drawing mode is active
      canvas.style.cursor = 'crosshair';
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('pointerdown', handleGlobalPointerDown);
        canvas.removeEventListener('pointermove', handleGlobalPointerMove);
        canvas.removeEventListener('pointerup', handleGlobalPointerUp);
        canvas.style.cursor = 'default';
      }
    };
  }, [isOpen, selectedPart, isDrawing, handlePointerDown, handlePointerMove, handlePointerUp]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!textureCanvas) return;
    const ctx = textureCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);
      if (texture) {
        texture.needsUpdate = true;
      }
    }
  }, [textureCanvas, texture]);

  // Apply drawing
  const applyDrawing = useCallback(() => {
    if (!textureCanvas || !selectedPart) return;
    
    const textureData = textureCanvas.toDataURL('image/png');
    onApplyDrawing(selectedPart, textureData);
    onClose();
  }, [textureCanvas, selectedPart, onApplyDrawing, onClose]);

  if (!isOpen || !selectedPart) return null;

  return null; // This component only handles the drawing logic, UI is in the parent
}
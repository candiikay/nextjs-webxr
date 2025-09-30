// This directive tells Next.js that this component runs on the client-side
// It's needed because we're using browser-specific features like 3D graphics
'use client';

// Import required components
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import { FastSneakerCustomizer } from './components/FastSneakerCustomizer';
import { ColorPicker } from './components/ColorPicker';
import { BossChatEngine } from './components/BossChatEngine';
import { Suspense, useState, useCallback } from 'react';
import * as THREE from 'three';

// Create XR store for managing VR/AR sessions
// This is the new v6 API approach - much cleaner than the old button components
const xrStore = createXRStore();

// Main homepage component that renders our 3D scene
export default function Home() {
  // Note: XR functionality is available through xrStore methods
  // State tracking removed since UI buttons were removed
  const [showHelp, setShowHelp] = useState<boolean>(true);
  const [resetSignal, setResetSignal] = useState<number>(0);
  
  // Color picker state
  const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);
  const [selectedPartForColor, setSelectedPartForColor] = useState<string | null>(null);
  const [clickedPart, setClickedPart] = useState<string | null>(null);
  
  // Game state
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [gameScore, setGameScore] = useState<number>(0);
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [options, setOptions] = useState<{
    partColors: Record<string, string>
  }>({
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
  
  // Color picker now uses a modern color wheel interface
  
  // Update part color function - memoized to prevent re-renders
  const updatePartColor = useCallback((part: string, color: string) => {
    setOptions(prev => ({
      ...prev,
      partColors: { ...prev.partColors, [part]: color }
    }));
  }, []);

  // Apply color and close picker function
  const applyColorAndClose = useCallback((part: string, color: string) => {
    setOptions(prev => ({
      ...prev,
      partColors: { ...prev.partColors, [part]: color }
    }));
    setCustomizerOpen(false);
    setSelectedPartForColor(null);
    setClickedPart(null);
  }, []);

  // Color picker is now closed via applyColorAndClose function

  // Color change handler - memoized to prevent re-renders
  const handleColorChange = useCallback((color: string) => {
    if (selectedPartForColor) {
      updatePartColor(selectedPartForColor, color);
    }
  }, [selectedPartForColor, updatePartColor]);

  // Game event handlers
  const handleChallengeStart = useCallback((timeLimit: number, challenge: string) => {
    setTimeLimit(timeLimit);
    setCurrentChallenge(challenge);
    setIsGameActive(true);
    // Add some visual urgency to the scene
    document.body.style.animation = 'urgentPulse 2s infinite';
  }, []);

  const handleChallengeComplete = useCallback((score: number) => {
    setGameScore(prev => prev + score);
    setIsGameActive(false);
    setCurrentChallenge(null);
    setTimeLimit(0);
    // Remove urgency animation
    document.body.style.animation = 'none';
  }, []);

  const handleBossMessage = useCallback((message: string) => {
    console.log('Boss says:', message);
    // Could add sound effects or other feedback here
  }, []);

  return (
    // Container div that takes up the full viewport (100% width and height)
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}>
      {/* Cute, modern onboarding chip + help toggle (outside Canvas) */}
      {showHelp && (
        <div
          role="group"
          aria-label="Viewer controls"
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 9999, display: 'flex', gap: 10, flexWrap: 'wrap' }}
        >
          {/* Chip */}
          <div
            className="chip-pulse"
            style={{
              background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
              color: '#f8f8ff',
              border: '1px solid rgba(255,105,180,0.25)',
              borderRadius: 16,
              padding: '8px 12px',
              fontFamily: 'Inter, ui-sans-serif, system-ui',
              fontSize: 13
            }}
          >
            ⤺ Drag to Rotate
          </div>
          <div
            style={{
              background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
              color: '#f8f8ff',
              border: '1px solid rgba(255,105,180,0.25)',
              borderRadius: 16,
              padding: '8px 12px',
              fontFamily: 'Inter, ui-sans-serif, system-ui',
              fontSize: 13
            }}
          >
            ⌄⌃ Scroll to Zoom
          </div>
          <div
            style={{
              background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
              color: '#f8f8ff',
              border: '1px solid rgba(255,105,180,0.25)',
              borderRadius: 16,
              padding: '8px 12px',
              fontFamily: 'Inter, ui-sans-serif, system-ui',
              fontSize: 13
            }}
          >
            ⇧ + Drag to Move
          </div>
        </div>
      )}

      {/* Help toggle and Reset button */}
      <div style={{ position: 'absolute', right: 16, bottom: 16, display: 'flex', gap: 12, zIndex: 20 }}>
        <button
          aria-label="Reset view"
          onClick={() => setResetSignal(s => s + 1)}
          style={{
            background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
            color: '#0f0f0f',
            border: 'none',
            borderRadius: 14,
            padding: '10px 14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(255,105,180,0.35)'
          }}
        >
          Reset View
        </button>
        <button
          aria-label="Toggle help"
          onClick={() => setShowHelp(v => !v)}
          style={{
            background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
            color: '#f8f8ff',
            border: '1px solid rgba(255,105,180,0.25)',
            borderRadius: 14,
            padding: '10px 12px',
            cursor: 'pointer',
            boxShadow: '0 0 18px rgba(255,105,180,0.18)'
          }}
        >
          ?
        </button>
      </div>
      {/* 
        XR Button Container - Removed per user request
        XR functionality is still available through the store (xrStore.enterVR(), xrStore.enterAR())
        but the UI buttons have been removed for a cleaner interface
      */}
      
      {/* 
        Canvas is the main React Three Fiber component that creates a 3D scene
        It sets up WebGL context and handles rendering with professional lighting
      */}
      <Canvas 
        shadows
        gl={{
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
        }}
      >
        {/* 
          Suspense boundary ensures XR components load properly
          This prevents hydration issues with WebXR APIs
        */}
        <Suspense fallback={null}>
          {/* 
            XR Provider - New v6 API
            This component enables WebXR functionality throughout the scene
            It manages XR sessions and provides context to child components
            The store prop connects our XR store to the scene
          */}
          <XR store={xrStore}>
        
        {/* 
          PROFESSIONAL LIGHTING SETUP
          Studio-quality lighting for product visualization
        */}
        
        {/* Camera: angled view to match the reference image */}
        <PerspectiveCamera makeDefault fov={50} position={[2.5, 1.8, 6.0]} />
        
        {/* Studio environment for soft, realistic reflections */}
        <Environment preset="studio" environmentIntensity={0.6} />
        
        {/* 3-point lighting setup */}
        {/* Key light (front-left, soft) */}
        <directionalLight
          position={[-2.5, 3.0, 3.0]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Fill light (opposite, weaker) */}
        <directionalLight position={[2.0, 1.5, 1.0]} intensity={0.3} color="#dfe7ff" />
        
        {/* Rim light (back-right highlight) */}
        <directionalLight position={[2.5, 2.5, -2.0]} intensity={0.45} color="#ffd9c4" />
        
        {/* Contact shadow under the sneaker (grounds it visually) */}
        <ContactShadows
          position={[0, 0, 0]}
          scale={8}
          blur={2.0}
          opacity={0.45}
          far={3}
        />
        
        {/* 
          3D OBJECTS
          These are our interactive 3D elements in the scene
        */}
        
        {/* Fast Sneaker Customizer - Optimized for speed with girly pop design */}
        <FastSneakerCustomizer 
          resetSignal={resetSignal}
          customizerOpen={customizerOpen}
          setCustomizerOpen={setCustomizerOpen}
          selectedPartForColor={selectedPartForColor}
          setSelectedPartForColor={setSelectedPartForColor}
          clickedPart={clickedPart}
          setClickedPart={setClickedPart}
          partColors={options.partColors}
        />
        
        {/* VR Interaction Hints - Temporarily disabled to debug white lines */}
        {/* <VRControllerHints />
        <VRTeleportIndicator />
        <VRHandTrackingIndicator /> */}
        
        {/* 
          SCENE HELPERS
          Visual aids that help users understand the 3D space
        */}
        
        {/* Grid removed per user request - cleaner interface */}
        
        {/* 
          XR INTERACTION
          Note: In newer versions of @react-three/xr, controllers and hands 
          are automatically handled by the XR provider - no manual setup needed!
          The library automatically detects and renders VR controllers and hand tracking.
        */}
        
        {/* 
          CAMERA CONTROLS
          OrbitControls for desktop navigation (disabled in VR)
        */}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={4.0}
          maxDistance={14.0}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.7}
          rotateSpeed={0.0}
          zoomSpeed={0.7}
        />
        
          {/* Close the XR provider */}
          </XR>
        </Suspense>
      </Canvas>
      
      {/* Loading indicator temporarily removed to debug R3F error */}

      {/* Modern Color Picker - OUTSIDE Canvas */}
      {customizerOpen && selectedPartForColor && (
        <ColorPicker
          key={`color-picker-${selectedPartForColor}`}
          isOpen={customizerOpen}
          selectedPart={selectedPartForColor}
          onColorChange={handleColorChange}
          onApplyColor={(color) => applyColorAndClose(selectedPartForColor, color)}
          currentColor={options.partColors[selectedPartForColor] || '#ff69b4'}
        />
      )}

      {/* Boss Chat Engine - Gamified sneaker customizer */}
      <BossChatEngine
        isActive={true}
        onChallengeStart={handleChallengeStart}
        onChallengeComplete={handleChallengeComplete}
        onBossMessage={handleBossMessage}
      />
    </div>
  );
}

// Add CSS animations for game urgency effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes urgentPulse {
      0%, 100% {
        box-shadow: inset 0 0 0 0 rgba(255, 68, 68, 0.1);
      }
      50% {
        box-shadow: inset 0 0 0 20px rgba(255, 68, 68, 0.1);
      }
    }
    
    @keyframes urgentGlow {
      0%, 100% {
        filter: drop-shadow(0 0 5px rgba(255, 68, 68, 0.3));
      }
      50% {
        filter: drop-shadow(0 0 20px rgba(255, 68, 68, 0.6));
      }
    }
  `;
  document.head.appendChild(style);
}

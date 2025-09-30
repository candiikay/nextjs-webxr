// Simple Color Picker Component
// Just a color wheel - compact and easy to use

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ColorPickerProps {
  isOpen: boolean;
  selectedPart: string | null;
  onColorChange: (color: string) => void;
  onApplyColor: (color: string) => void;
  currentColor?: string;
}

export function ColorPicker({ isOpen, selectedPart, onColorChange, onApplyColor, currentColor = '#ff69b4' }: ColorPickerProps) {
  const [hue, setHue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const colorWheelRef = useRef<HTMLDivElement>(null);

  // Convert HSL to hex (simplified - just hue, fixed saturation and lightness)
  const hslToHex = (h: number): string => {
    const hNorm = h / 360;
    const sNorm = 0.8; // Fixed saturation
    const lNorm = 0.5; // Fixed lightness

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    const r = hue2rgb(p, q, hNorm + 1/3);
    const g = hue2rgb(p, q, hNorm);
    const b = hue2rgb(p, q, hNorm - 1/3);

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert hex to HSL (simplified)
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;

    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return Math.round(h * 360);
  };

  // Initialize from current color
  useEffect(() => {
    if (currentColor) {
      const hueValue = hexToHsl(currentColor);
      setHue(hueValue);
    }
  }, [currentColor]);

  const updateHueFromMouse = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!colorWheelRef.current) return;
    
    const rect = colorWheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const normalizedAngle = (angle + 360) % 360;
    
    setHue(normalizedAngle);
    
    // Update color immediately when dragging
    const hexColor = hslToHex(normalizedAngle);
    onColorChange(hexColor);
  }, [onColorChange]);

  // Handle mouse events for color wheel
  const handleColorWheelMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    updateHueFromMouse(e);
  }, [updateHueFromMouse]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateHueFromMouse(e);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateHueFromMouse, handleMouseUp]);

  if (!isOpen || !selectedPart) return null;

  const currentHex = hslToHex(hue);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 200,
        background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
        border: '1px solid rgba(255,105,180,0.3)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(255,105,180,0.25)',
        color: '#f8f8ff',
        padding: 20,
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        userSelect: 'none'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ 
          fontWeight: 600, 
          marginBottom: 4, 
          fontSize: 12, 
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Choose Color
        </div>
        <div style={{ 
          fontWeight: 700, 
          fontSize: 16,
          color: '#ff69b4',
          textTransform: 'capitalize'
        }}>
          {selectedPart.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Color Wheel */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <div
          ref={colorWheelRef}
          onMouseDown={handleColorWheelMouseDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 120,
            height: 120,
            margin: '0 auto',
            borderRadius: '50%',
            background: `conic-gradient(
              hsl(0, 100%, 50%),
              hsl(60, 100%, 50%),
              hsl(120, 100%, 50%),
              hsl(180, 100%, 50%),
              hsl(240, 100%, 50%),
              hsl(300, 100%, 50%),
              hsl(360, 100%, 50%)
            )`,
            position: 'relative',
            cursor: 'crosshair',
            border: '3px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}
        >
          {/* Hue indicator */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#fff',
              border: '3px solid #000',
              transform: `translate(-50%, -50%) rotate(${hue}deg) translateY(-50px)`,
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      </div>

      {/* Current Color Display */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: 16,
        padding: '12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: currentHex,
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          />
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: 14, 
            fontWeight: 600,
            color: '#ff69b4'
          }}>
            {currentHex.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Apply Color Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onApplyColor(currentHex);
        }}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
          color: '#0f0f0f',
          border: 'none',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 16px rgba(255,105,180,0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,105,180,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,105,180,0.3)';
        }}
      >
        Apply Color
      </button>
    </div>
  );
}
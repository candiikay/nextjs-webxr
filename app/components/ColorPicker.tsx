// Modern Color Picker Component
// Features a color wheel/droplet interface for intuitive color selection

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
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'hue' | 'sl' | null>(null);
  
  const colorWheelRef = useRef<HTMLDivElement>(null);
  const slPickerRef = useRef<HTMLDivElement>(null);

  // Debug logging to see if component is re-mounting
  console.log('🎨 ColorPicker render:', { isOpen, selectedPart, currentColor });

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number): string => {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

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

  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Initialize from current color
  useEffect(() => {
    if (currentColor) {
      const hsl = hexToHsl(currentColor);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  }, [currentColor]);

  // Update color when HSL values change - but only when not dragging to prevent flashing
  useEffect(() => {
    if (!isDragging) {
      const hexColor = hslToHex(hue, saturation, lightness);
      onColorChange(hexColor);
    }
  }, [hue, saturation, lightness, isDragging]); // Removed onColorChange from dependencies

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
  }, []);

  const updateSLFromMouse = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!slPickerRef.current) return;
    
    const rect = slPickerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    
    const saturation = Math.round((x / rect.width) * 100);
    const lightness = Math.round(100 - (y / rect.height) * 100);
    
    setSaturation(saturation);
    setLightness(lightness);
  }, []);

  // Handle mouse events for color wheel
  const handleColorWheelMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType('hue');
    updateHueFromMouse(e);
  }, [updateHueFromMouse]);

  const handleSLPickerMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragType('sl');
    updateSLFromMouse(e);
  }, [updateSLFromMouse]);

  // Handle mouse up - memoized outside useEffect
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    // Update color when dragging stops
    const hexColor = hslToHex(hue, saturation, lightness);
    onColorChange(hexColor);
  }, [hue, saturation, lightness, onColorChange]);

  // Global mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      if (dragType === 'hue') {
        updateHueFromMouse(e);
      } else if (dragType === 'sl') {
        updateSLFromMouse(e);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragType, updateHueFromMouse, updateSLFromMouse, handleMouseUp]);

  if (!isOpen || !selectedPart) return null;

  const currentHex = hslToHex(hue, saturation, lightness);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 280,
        background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
        border: '1px solid rgba(255,105,180,0.3)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(255,105,180,0.25)',
        color: '#f8f8ff',
        padding: 16,
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        userSelect: 'none'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ 
          fontWeight: 600, 
          marginBottom: 4, 
          fontSize: 12, 
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Customize Color
        </div>
        <div style={{ 
          fontWeight: 700, 
          fontSize: 20,
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
            width: 140,
            height: 140,
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
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          {/* Hue indicator */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              border: '2px solid #000',
              transform: `translate(-50%, -50%) rotate(${hue}deg) translateY(-60px)`,
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          />
        </div>
      </div>

      {/* Saturation/Lightness Picker */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <div
          ref={slPickerRef}
          onMouseDown={handleSLPickerMouseDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 140,
            height: 140,
            margin: '0 auto',
            background: `hsl(${hue}, 100%, 50%)`,
            position: 'relative',
            cursor: 'crosshair',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          {/* Saturation/Lightness indicator */}
          <div
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#fff',
              border: '2px solid #000',
              transform: `translate(-50%, -50%)`,
              left: `${saturation}%`,
              top: `${100 - lightness}%`,
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          />
        </div>
      </div>

      {/* Current Color Display */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16,
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: 12, fontWeight: 500 }}>
          Color:
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: currentHex,
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          />
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: 12, 
            fontWeight: 600,
            color: '#ff69b4'
          }}>
            {currentHex.toUpperCase()}
          </div>
        </div>
      </div>

      {/* HSL Values */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: 8, 
        marginBottom: 16 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2 }}>HUE</div>
          <div style={{ 
            fontSize: 12, 
            fontWeight: 600,
            color: '#fff'
          }}>
            {Math.round(hue)}°
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2 }}>SAT</div>
          <div style={{ 
            fontSize: 12, 
            fontWeight: 600,
            color: '#fff'
          }}>
            {Math.round(saturation)}%
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2 }}>LIGHT</div>
          <div style={{ 
            fontSize: 12, 
            fontWeight: 600,
            color: '#fff'
          }}>
            {Math.round(lightness)}%
          </div>
        </div>
      </div>

      {/* Apply Color Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const hexColor = hslToHex(hue, saturation, lightness);
          onApplyColor(hexColor);
        }}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'linear-gradient(135deg, #ff69b4, #ffc0cb)',
          color: '#0f0f0f',
          border: 'none',
          borderRadius: 8,
          fontSize: 12,
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

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

export default function Globe3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  
  // Interactive controls state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.0015);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    
    // Create globe geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create a beautiful gradient material as default
    const createDefaultMaterial = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Create a beautiful blue-green gradient
        const gradient = context.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#1e40af'); // Deep blue
        gradient.addColorStop(0.3, '#3b82f6'); // Blue
        gradient.addColorStop(0.5, '#06b6d4'); // Cyan
        gradient.addColorStop(0.7, '#10b981'); // Emerald
        gradient.addColorStop(1, '#059669'); // Green
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 256);
        
        // Add some subtle noise for texture
        for (let i = 0; i < 2000; i++) {
          context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
          context.fillRect(Math.random() * 512, Math.random() * 256, 1, 1);
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      return new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        shininess: 30,
      });
    };

    // Try to load Earth texture, fallback to beautiful gradient
    let material = createDefaultMaterial();
    
    const earthTexture = textureLoader.load(
      'https://unpkg.com/three-globe@2.24.3/example/img/earth-blue-marble.jpg',
      (texture) => {
        console.log('Earth texture loaded successfully');
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.log('Earth texture failed to load, using beautiful gradient');
        // Material already set to gradient, no action needed
      }
    );

    const earth = new THREE.Mesh(geometry, material);
    earthRef.current = earth;
    scene.add(earth);

    // Add glowing atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);

    // Add destination points
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 30;
    const positions = new Float32Array(pointsCount * 3);

    // Real destination coordinates converted to 3D positions
    const destinations = [
      { lat: 35.6762, lng: 139.6503 }, // Tokyo
      { lat: 64.9631, lng: -19.0208 }, // Iceland
      { lat: -13.1631, lng: -72.5450 }, // Machu Picchu
      { lat: 36.3932, lng: 25.4615 }, // Santorini
      { lat: 25.2048, lng: 55.2708 }, // Dubai
      { lat: -8.3405, lng: 115.0920 }, // Bali
      { lat: 40.7128, lng: -74.0060 }, // New York
      { lat: 48.8566, lng: 2.3522 }, // Paris
      { lat: 7.8804, lng: 98.3923 }, // Phuket
      { lat: 20.7984, lng: -156.3319 }, // Maui
    ];

    for (let i = 0; i < Math.min(pointsCount, destinations.length); i++) {
      const { lat, lng } = destinations[i];
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const radius = 1.02;

      positions[i * 3] = -(radius * Math.sin(phi) * Math.cos(theta));
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    // Fill remaining points randomly
    for (let i = destinations.length; i < pointsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 1.02;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.02,
      transparent: true,
      opacity: 0.9,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    pointsRef.current = points;
    scene.add(points);

    // Mouse interaction handlers
    const handleMouseDown = (event: MouseEvent) => {
      setIsMouseDown(true);
      setAutoRotate(false);
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mousePosition.x;
      const deltaY = event.clientY - mousePosition.y;
      
      setTargetRotation(prev => ({
        x: prev.x - deltaY * 0.005,
        y: prev.y + deltaX * 0.005
      }));
      
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      // Resume auto-rotation after 3 seconds of no interaction
      setTimeout(() => setAutoRotate(true), 3000);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoom = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(zoom);
      camera.position.clampLength(2, 8);
    };

    const handleDoubleClick = () => {
      // Speed up rotation temporarily
      setRotationSpeed(0.008);
      setTimeout(() => setRotationSpeed(0.0015), 2000);
    };

    // Touch interaction handlers for mobile
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      setIsMouseDown(true);
      setAutoRotate(false);
      setMousePosition({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isMouseDown) return;
      event.preventDefault();
      
      const touch = event.touches[0];
      const deltaX = touch.clientX - mousePosition.x;
      const deltaY = touch.clientY - mousePosition.y;
      
      setTargetRotation(prev => ({
        x: prev.x - deltaY * 0.005,
        y: prev.y + deltaX * 0.005
      }));
      
      setMousePosition({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = () => {
      setIsMouseDown(false);
      setTimeout(() => setAutoRotate(true), 3000);
    };

    // Add event listeners for both mouse and touch
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'none';

    // Animation with interactive controls
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      // Smooth interpolation to target rotation
      const earth = earthRef.current;
      const atmosphere = atmosphereRef.current;
      const points = pointsRef.current;
      
      if (earth && atmosphere && points) {
        if (autoRotate) {
          // Auto rotation
          earth.rotation.y += rotationSpeed;
          atmosphere.rotation.y += rotationSpeed;
          points.rotation.y += rotationSpeed;
        } else {
          // User-controlled rotation with smooth interpolation
          const lerpFactor = 0.1;
          setRotation(prev => ({
            x: prev.x + (targetRotation.x - prev.x) * lerpFactor,
            y: prev.y + (targetRotation.y - prev.y) * lerpFactor
          }));
          
          earth.rotation.x = rotation.x;
          earth.rotation.y = rotation.y;
          atmosphere.rotation.x = rotation.x;
          atmosphere.rotation.y = rotation.y;
          points.rotation.x = rotation.x;
          points.rotation.y = rotation.y;
        }
        
        // Update cursor based on interaction state
        canvas.style.cursor = isMouseDown ? 'grabbing' : 'grab';
        
        // Pulsing points with interaction feedback
        const time = Date.now() * 0.005;
        const pulseIntensity = autoRotate ? 0.5 : 0.8; // More intense when interacting
        pointsMaterial.opacity = pulseIntensity + (1 - pulseIntensity) * Math.sin(time);
        
        // Scale effect on interaction
        const scale = isMouseDown ? 1.02 : 1.0;
        earth.scale.setScalar(scale);
        atmosphere.scale.setScalar(scale * 1.05);
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Remove event listeners
      const canvas = renderer.domElement;
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      <div 
        ref={mountRef} 
        className="w-full h-full"
      />
      
      {/* Interaction hints */}
      <div className="absolute bottom-4 left-4 text-white/60 text-xs space-y-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gold-accent rounded-full animate-pulse" />
          <span>Drag to rotate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-lavender-accent rounded-full animate-pulse" />
          <span>Scroll to zoom</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>Double-click for speed boost</span>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="absolute top-4 right-4 text-white/60 text-xs pointer-events-none">
        {autoRotate ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-spin" />
            <span>Auto-rotating</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span>Manual control</span>
          </div>
        )}
      </div>
    </div>
  );
}

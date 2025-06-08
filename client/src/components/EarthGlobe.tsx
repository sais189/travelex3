import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function Globe3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  
  // Mouse interaction state
  const mouseRef = useRef({
    isDown: false,
    position: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    rotation: { x: 0, y: 0 },
    targetRotation: { x: 0, y: 0 },
    autoRotationSpeed: 0.004 // Increased from 0.0015
  });

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
    cameraRef.current = camera;

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

    // Mouse event handlers
    const handleMouseDown = (event: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.previousPosition.x = event.clientX;
      mouseRef.current.previousPosition.y = event.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseRef.current.isDown) return;

      const deltaX = event.clientX - mouseRef.current.previousPosition.x;
      const deltaY = event.clientY - mouseRef.current.previousPosition.y;

      mouseRef.current.targetRotation.y += deltaX * 0.01;
      mouseRef.current.targetRotation.x += deltaY * 0.01;

      // Clamp vertical rotation
      mouseRef.current.targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseRef.current.targetRotation.x));

      mouseRef.current.previousPosition.x = event.clientX;
      mouseRef.current.previousPosition.y = event.clientY;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomSpeed = 0.1;
      const minDistance = 1.5;
      const maxDistance = 10;
      
      camera.position.z += event.deltaY * 0.001 * zoomSpeed;
      camera.position.z = Math.max(minDistance, Math.min(maxDistance, camera.position.z));
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.style.cursor = 'grab';

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Smooth interpolation for user interactions
      const lerpFactor = 0.05;
      mouseRef.current.rotation.x += (mouseRef.current.targetRotation.x - mouseRef.current.rotation.x) * lerpFactor;
      mouseRef.current.rotation.y += (mouseRef.current.targetRotation.y - mouseRef.current.rotation.y) * lerpFactor;

      // Auto rotation when not interacting
      if (!mouseRef.current.isDown) {
        mouseRef.current.targetRotation.y += mouseRef.current.autoRotationSpeed;
      }

      // Apply rotations to globe objects
      earth.rotation.x = mouseRef.current.rotation.x;
      earth.rotation.y = mouseRef.current.rotation.y;
      atmosphere.rotation.x = mouseRef.current.rotation.x;
      atmosphere.rotation.y = mouseRef.current.rotation.y;
      points.rotation.x = mouseRef.current.rotation.x;
      points.rotation.y = mouseRef.current.rotation.y;

      // Pulsing points
      const time = Date.now() * 0.005;
      pointsMaterial.opacity = 0.5 + 0.5 * Math.sin(time);

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
      
      // Remove mouse event listeners
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      
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
    <div 
      ref={mountRef} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}

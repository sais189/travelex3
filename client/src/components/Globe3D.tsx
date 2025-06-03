import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function Globe3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);

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
    
    // Create realistic Earth texture
    const earthTexture = textureLoader.load(
      'https://raw.githubusercontent.com/ruanyf/react-demos/master/3d-earth/images/earthmap1k.jpg',
      () => {
        console.log('Earth texture loaded successfully');
      },
      undefined,
      (error) => {
        console.log('Earth texture failed to load, using wireframe');
      }
    );

    // Create globe geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create material with Earth texture
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      transparent: true,
      opacity: 0.9,
    });

    const earth = new THREE.Mesh(geometry, material);
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
    scene.add(points);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      // Smooth rotation
      earth.rotation.y += 0.0015;
      atmosphere.rotation.y += 0.0015;
      points.rotation.y += 0.0015;
      
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

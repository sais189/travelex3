import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function EarthGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    const size = 400;
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Create Earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Ocean
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGradient.addColorStop(0, '#1e40af');
    oceanGradient.addColorStop(0.5, '#2563eb');
    oceanGradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Continents
    ctx.fillStyle = '#16a34a';
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(520, 200, 50, 80, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Europe
    ctx.beginPath();
    ctx.ellipse(500, 120, 30, 25, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(650, 140, 80, 50, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // North America
    ctx.beginPath();
    ctx.ellipse(200, 120, 60, 55, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(250, 280, 40, 70, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(780, 320, 35, 20, 0, 0, 2 * Math.PI);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // Earth sphere
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
      map: texture,
      shininess: 5
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.03, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    camera.position.z = 2.5;

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      earth.rotation.y += 0.005;
      atmosphere.rotation.y += 0.003;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        ref={mountRef} 
        className="w-[400px] h-[400px]"
      />
    </div>
  );
}
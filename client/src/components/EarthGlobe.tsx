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

    // Continents with realistic shapes
    ctx.fillStyle = '#16a34a';
    
    // Africa
    ctx.beginPath();
    ctx.moveTo(510, 140); // Morocco
    ctx.lineTo(520, 130); // Algeria
    ctx.lineTo(540, 125); // Libya
    ctx.lineTo(560, 130); // Egypt
    ctx.lineTo(570, 150); // Sudan
    ctx.lineTo(575, 170); // Ethiopia
    ctx.lineTo(580, 190); // Kenya
    ctx.lineTo(575, 220); // Tanzania
    ctx.lineTo(570, 250); // Zambia
    ctx.lineTo(560, 280); // Botswana
    ctx.lineTo(540, 300); // South Africa
    ctx.lineTo(520, 295); // Namibia
    ctx.lineTo(500, 280); // Angola
    ctx.lineTo(485, 260); // Congo
    ctx.lineTo(480, 230); // Cameroon
    ctx.lineTo(485, 200); // Nigeria
    ctx.lineTo(490, 170); // Chad
    ctx.lineTo(500, 150); // Niger
    ctx.closePath();
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.moveTo(490, 100); // Scandinavia
    ctx.lineTo(510, 95);  // Finland
    ctx.lineTo(520, 100); // Russia (west)
    ctx.lineTo(530, 110); // Poland
    ctx.lineTo(525, 120); // Germany
    ctx.lineTo(515, 125); // France
    ctx.lineTo(505, 130); // Spain
    ctx.lineTo(495, 125); // Portugal
    ctx.lineTo(485, 115); // UK
    ctx.lineTo(480, 105); // Ireland
    ctx.closePath();
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.moveTo(530, 100); // Russia (west)
    ctx.lineTo(600, 90);  // Siberia
    ctx.lineTo(650, 95);  // Eastern Russia
    ctx.lineTo(680, 110); // Mongolia
    ctx.lineTo(700, 130); // China (north)
    ctx.lineTo(720, 150); // China (east)
    ctx.lineTo(710, 170); // Southeast Asia
    ctx.lineTo(690, 180); // India (east)
    ctx.lineTo(670, 185); // Bangladesh
    ctx.lineTo(650, 180); // India (main)
    ctx.lineTo(630, 170); // Pakistan
    ctx.lineTo(610, 160); // Afghanistan
    ctx.lineTo(590, 150); // Iran
    ctx.lineTo(570, 140); // Turkey
    ctx.lineTo(550, 130); // Central Asia
    ctx.lineTo(530, 120); // Kazakhstan
    ctx.closePath();
    ctx.fill();

    // North America
    ctx.beginPath();
    ctx.moveTo(150, 80);  // Alaska
    ctx.lineTo(200, 90);  // Canada (north)
    ctx.lineTo(250, 100); // Canada (east)
    ctx.lineTo(280, 120); // Eastern US
    ctx.lineTo(290, 140); // Florida
    ctx.lineTo(270, 160); // Mexico (east)
    ctx.lineTo(240, 170); // Mexico (center)
    ctx.lineTo(210, 165); // Mexico (west)
    ctx.lineTo(180, 150); // California
    ctx.lineTo(160, 130); // Pacific Northwest
    ctx.lineTo(140, 110); // Western Canada
    ctx.lineTo(130, 90);  // Northern Canada
    ctx.closePath();
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.moveTo(260, 180); // Colombia
    ctx.lineTo(280, 190); // Venezuela
    ctx.lineTo(300, 210); // Guyana/Suriname
    ctx.lineTo(320, 240); // Brazil (northeast)
    ctx.lineTo(315, 280); // Brazil (southeast)
    ctx.lineTo(300, 320); // Brazil (south)
    ctx.lineTo(280, 340); // Argentina (north)
    ctx.lineTo(260, 380); // Argentina (south)
    ctx.lineTo(240, 370); // Chile (south)
    ctx.lineTo(230, 330); // Chile (center)
    ctx.lineTo(235, 290); // Chile (north)
    ctx.lineTo(240, 250); // Peru
    ctx.lineTo(245, 210); // Ecuador
    ctx.closePath();
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.moveTo(760, 310); // Western Australia
    ctx.lineTo(800, 305); // Northern Territory
    ctx.lineTo(830, 315); // Queensland
    ctx.lineTo(840, 330); // New South Wales
    ctx.lineTo(825, 340); // Victoria
    ctx.lineTo(790, 345); // South Australia
    ctx.lineTo(770, 335); // Western Australia (south)
    ctx.closePath();
    ctx.fill();

    // Additional landmasses
    
    // Greenland
    ctx.beginPath();
    ctx.ellipse(350, 70, 25, 40, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Madagascar
    ctx.beginPath();
    ctx.ellipse(585, 270, 8, 25, 0, 0, 2 * Math.PI);
    ctx.fill();

    // New Zealand
    ctx.beginPath();
    ctx.ellipse(870, 370, 8, 20, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Japan
    ctx.beginPath();
    ctx.ellipse(740, 140, 10, 25, 0.3, 0, 2 * Math.PI);
    ctx.fill();

    // UK (more detailed)
    ctx.beginPath();
    ctx.ellipse(485, 115, 12, 20, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Indonesia/Southeast Asian islands
    ctx.fillStyle = '#15803d';
    for (let i = 0; i < 15; i++) {
      const x = 700 + Math.random() * 60;
      const y = 190 + Math.random() * 30;
      ctx.beginPath();
      ctx.ellipse(x, y, 3 + Math.random() * 5, 2 + Math.random() * 3, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

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
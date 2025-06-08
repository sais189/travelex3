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

    // Create highly detailed Earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Ocean with depth variation
    const oceanGradient = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 800);
    oceanGradient.addColorStop(0, '#0d4f8c');
    oceanGradient.addColorStop(0.3, '#1e40af');
    oceanGradient.addColorStop(0.6, '#2563eb');
    oceanGradient.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 2048, 1024);

    // Add ocean texture
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(100, 149, 237, ${Math.random() * 0.1})`;
      ctx.beginPath();
      ctx.arc(Math.random() * 2048, Math.random() * 1024, Math.random() * 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Land colors
    const landColors = {
      forest: '#0d7817',
      plains: '#16a34a', 
      desert: '#ca8a04',
      tundra: '#65a30d',
      mountain: '#166534'
    };

    // NORTH AMERICA - Highly detailed
    ctx.fillStyle = landColors.forest;
    ctx.beginPath();
    // Alaska
    ctx.moveTo(100, 120);
    ctx.lineTo(200, 100);
    ctx.lineTo(250, 110);
    ctx.lineTo(280, 140);
    ctx.lineTo(260, 160);
    ctx.lineTo(220, 170);
    ctx.lineTo(180, 160);
    ctx.lineTo(140, 140);
    ctx.closePath();
    ctx.fill();

    // Canada mainland
    ctx.beginPath();
    ctx.moveTo(250, 140);
    ctx.lineTo(400, 120);
    ctx.lineTo(500, 130);
    ctx.lineTo(560, 140);
    ctx.lineTo(580, 160);
    ctx.lineTo(570, 180);
    ctx.lineTo(550, 200);
    ctx.lineTo(520, 210);
    ctx.lineTo(480, 200);
    ctx.lineTo(440, 190);
    ctx.lineTo(400, 180);
    ctx.lineTo(360, 170);
    ctx.lineTo(320, 160);
    ctx.lineTo(280, 150);
    ctx.closePath();
    ctx.fill();

    // United States
    ctx.fillStyle = landColors.plains;
    ctx.beginPath();
    ctx.moveTo(320, 200);
    ctx.lineTo(580, 220);
    ctx.lineTo(590, 240);
    ctx.lineTo(595, 260);
    ctx.lineTo(600, 280);
    ctx.lineTo(590, 300);
    ctx.lineTo(570, 310);
    ctx.lineTo(540, 320);
    ctx.lineTo(500, 310);
    ctx.lineTo(460, 300);
    ctx.lineTo(420, 290);
    ctx.lineTo(380, 280);
    ctx.lineTo(340, 270);
    ctx.lineTo(300, 250);
    ctx.lineTo(310, 220);
    ctx.closePath();
    ctx.fill();

    // Mexico
    ctx.fillStyle = landColors.desert;
    ctx.beginPath();
    ctx.moveTo(320, 320);
    ctx.lineTo(480, 340);
    ctx.lineTo(520, 360);
    ctx.lineTo(540, 380);
    ctx.lineTo(530, 400);
    ctx.lineTo(500, 410);
    ctx.lineTo(460, 400);
    ctx.lineTo(420, 390);
    ctx.lineTo(380, 380);
    ctx.lineTo(340, 370);
    ctx.lineTo(300, 350);
    ctx.closePath();
    ctx.fill();

    // SOUTH AMERICA - Very detailed
    ctx.fillStyle = landColors.forest;
    ctx.beginPath();
    // Colombia/Venezuela
    ctx.moveTo(520, 400);
    ctx.lineTo(580, 420);
    ctx.lineTo(600, 440);
    ctx.lineTo(610, 460);
    // Brazil east coast
    ctx.lineTo(640, 480);
    ctx.lineTo(660, 520);
    ctx.lineTo(670, 560);
    ctx.lineTo(660, 600);
    ctx.lineTo(640, 640);
    ctx.lineTo(600, 680);
    ctx.lineTo(560, 720);
    // Argentina
    ctx.lineTo(520, 760);
    ctx.lineTo(480, 780);
    ctx.lineTo(460, 760);
    // Chile
    ctx.lineTo(440, 720);
    ctx.lineTo(460, 680);
    ctx.lineTo(480, 640);
    ctx.lineTo(490, 600);
    ctx.lineTo(500, 560);
    ctx.lineTo(510, 520);
    ctx.lineTo(520, 480);
    ctx.lineTo(510, 440);
    ctx.closePath();
    ctx.fill();

    // AFRICA - Detailed outline
    ctx.fillStyle = landColors.desert;
    ctx.beginPath();
    // North Africa
    ctx.moveTo(1000, 280);
    ctx.lineTo(1020, 260);
    ctx.lineTo(1060, 240);
    ctx.lineTo(1100, 250);
    ctx.lineTo(1140, 260);
    ctx.lineTo(1160, 280);
    ctx.lineTo(1170, 300);
    // East Africa
    ctx.lineTo(1180, 340);
    ctx.lineTo(1190, 380);
    ctx.lineTo(1185, 420);
    ctx.lineTo(1180, 460);
    ctx.lineTo(1175, 500);
    ctx.lineTo(1170, 540);
    ctx.lineTo(1160, 580);
    // Southern Africa
    ctx.lineTo(1140, 620);
    ctx.lineTo(1120, 640);
    ctx.lineTo(1080, 650);
    ctx.lineTo(1040, 640);
    ctx.lineTo(1000, 620);
    ctx.lineTo(980, 590);
    ctx.lineTo(970, 560);
    // West Africa
    ctx.lineTo(960, 520);
    ctx.lineTo(950, 480);
    ctx.lineTo(960, 440);
    ctx.lineTo(970, 400);
    ctx.lineTo(980, 360);
    ctx.lineTo(990, 320);
    ctx.closePath();
    ctx.fill();

    // EUROPE - Detailed
    ctx.fillStyle = landColors.forest;
    ctx.beginPath();
    // Scandinavia
    ctx.moveTo(980, 180);
    ctx.lineTo(1020, 160);
    ctx.lineTo(1040, 170);
    ctx.lineTo(1060, 180);
    ctx.lineTo(1070, 200);
    ctx.lineTo(1060, 220);
    ctx.lineTo(1040, 240);
    ctx.lineTo(1020, 250);
    ctx.lineTo(1000, 240);
    ctx.lineTo(980, 220);
    ctx.lineTo(970, 200);
    ctx.closePath();
    ctx.fill();

    // ASIA - Very large and detailed
    ctx.fillStyle = landColors.tundra;
    ctx.beginPath();
    // Russia/Siberia
    ctx.moveTo(1070, 160);
    ctx.lineTo(1200, 140);
    ctx.lineTo(1300, 130);
    ctx.lineTo(1400, 140);
    ctx.lineTo(1500, 150);
    ctx.lineTo(1600, 160);
    ctx.lineTo(1650, 180);
    ctx.lineTo(1680, 200);
    ctx.lineTo(1700, 240);
    // China/Southeast Asia
    ctx.lineTo(1720, 280);
    ctx.lineTo(1710, 320);
    ctx.lineTo(1690, 360);
    ctx.lineTo(1670, 380);
    ctx.lineTo(1640, 400);
    ctx.lineTo(1600, 410);
    // India
    ctx.lineTo(1350, 420);
    ctx.lineTo(1320, 440);
    ctx.lineTo(1300, 460);
    ctx.lineTo(1290, 480);
    ctx.lineTo(1300, 500);
    ctx.lineTo(1320, 520);
    ctx.lineTo(1350, 530);
    ctx.lineTo(1380, 520);
    ctx.lineTo(1400, 500);
    ctx.lineTo(1420, 480);
    ctx.lineTo(1440, 460);
    ctx.lineTo(1460, 440);
    ctx.lineTo(1480, 420);
    // Middle East/Central Asia
    ctx.lineTo(1450, 400);
    ctx.lineTo(1420, 380);
    ctx.lineTo(1390, 360);
    ctx.lineTo(1360, 340);
    ctx.lineTo(1330, 320);
    ctx.lineTo(1300, 300);
    ctx.lineTo(1270, 280);
    ctx.lineTo(1240, 260);
    ctx.lineTo(1210, 240);
    ctx.lineTo(1180, 220);
    ctx.lineTo(1150, 200);
    ctx.lineTo(1120, 180);
    ctx.lineTo(1090, 170);
    ctx.closePath();
    ctx.fill();

    // AUSTRALIA
    ctx.fillStyle = landColors.desert;
    ctx.beginPath();
    ctx.moveTo(1560, 660);
    ctx.lineTo(1680, 640);
    ctx.lineTo(1720, 660);
    ctx.lineTo(1740, 680);
    ctx.lineTo(1730, 700);
    ctx.lineTo(1700, 720);
    ctx.lineTo(1660, 730);
    ctx.lineTo(1620, 725);
    ctx.lineTo(1580, 710);
    ctx.lineTo(1550, 690);
    ctx.closePath();
    ctx.fill();

    // Additional major landmasses
    // Greenland
    ctx.fillStyle = landColors.tundra;
    ctx.beginPath();
    ctx.ellipse(700, 100, 50, 80, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Madagascar
    ctx.fillStyle = landColors.forest;
    ctx.beginPath();
    ctx.ellipse(1200, 580, 15, 50, 0, 0, 2 * Math.PI);
    ctx.fill();

    // New Zealand
    ctx.fillStyle = landColors.forest;
    ctx.beginPath();
    ctx.ellipse(1800, 760, 15, 40, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Japan
    ctx.fillStyle = landColors.forest;
    ctx.beginPath();
    ctx.ellipse(1500, 300, 20, 50, 0.3, 0, 2 * Math.PI);
    ctx.fill();

    // British Isles
    ctx.fillStyle = landColors.forest;
    ctx.beginPath();
    ctx.ellipse(970, 220, 25, 40, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Indonesia and Southeast Asian islands
    ctx.fillStyle = landColors.forest;
    const islands = [
      {x: 1440, y: 410, w: 30, h: 15},
      {x: 1480, y: 420, w: 25, h: 12},
      {x: 1520, y: 430, w: 20, h: 10},
      {x: 1560, y: 440, w: 25, h: 15},
      {x: 1600, y: 450, w: 30, h: 20},
    ];
    
    islands.forEach(island => {
      ctx.beginPath();
      ctx.ellipse(island.x, island.y, island.w, island.h, 0, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Philippines
    ctx.fillStyle = landColors.forest;
    for (let i = 0; i < 12; i++) {
      const x = 1480 + (i % 3) * 20;
      const y = 350 + Math.floor(i / 3) * 15;
      ctx.beginPath();
      ctx.ellipse(x, y, 5 + Math.random() * 8, 3 + Math.random() * 6, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Caribbean islands
    ctx.fillStyle = landColors.forest;
    for (let i = 0; i < 20; i++) {
      const x = 460 + Math.random() * 120;
      const y = 380 + Math.random() * 40;
      ctx.beginPath();
      ctx.ellipse(x, y, 2 + Math.random() * 4, 1 + Math.random() * 3, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add terrain variation
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 1024;
      const alpha = Math.random() * 0.1;
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 200 : 50}, ${100 + Math.random() * 100}, ${Math.random() > 0.5 ? 200 : 50}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 3, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

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
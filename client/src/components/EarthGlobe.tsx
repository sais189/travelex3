import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function EarthGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);

  // Interactive controls
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0.1, y: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0.1, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup for realistic Earth
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 0, 2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Create starfield background
    const createStarField = () => {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.8
      });

      const starsCount = 1000;
      const positions = new Float32Array(starsCount * 3);

      for (let i = 0; i < starsCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }

      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      starsRef.current = stars;
      scene.add(stars);
    };

    createStarField();

    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Create realistic Earth material with procedural textures
    const createEarthMaterial = () => {
      // Create day texture (continents and oceans)
      const dayCanvas = document.createElement('canvas');
      dayCanvas.width = 1024;
      dayCanvas.height = 512;
      const dayCtx = dayCanvas.getContext('2d');

      if (dayCtx) {
        // Ocean base
        const oceanGradient = dayCtx.createLinearGradient(0, 0, 0, 512);
        oceanGradient.addColorStop(0, '#1e3a8a'); // Deep ocean blue
        oceanGradient.addColorStop(0.5, '#1e40af'); // Ocean blue
        oceanGradient.addColorStop(1, '#1e3a8a'); // Deep ocean blue
        dayCtx.fillStyle = oceanGradient;
        dayCtx.fillRect(0, 0, 1024, 512);

        // Add continents (simplified shapes)
        dayCtx.fillStyle = '#16a34a'; // Forest green for land
        
        // Africa and Europe
        dayCtx.beginPath();
        dayCtx.ellipse(520, 180, 80, 120, 0, 0, 2 * Math.PI);
        dayCtx.fill();
        
        // Asia
        dayCtx.beginPath();
        dayCtx.ellipse(650, 150, 120, 80, 0, 0, 2 * Math.PI);
        dayCtx.fill();
        
        // North America
        dayCtx.beginPath();
        dayCtx.ellipse(200, 120, 100, 90, 0, 0, 2 * Math.PI);
        dayCtx.fill();
        
        // South America
        dayCtx.beginPath();
        dayCtx.ellipse(250, 300, 60, 100, 0, 0, 2 * Math.PI);
        dayCtx.fill();
        
        // Australia
        dayCtx.beginPath();
        dayCtx.ellipse(780, 350, 50, 30, 0, 0, 2 * Math.PI);
        dayCtx.fill();

        // Add some detail and variation
        for (let i = 0; i < 500; i++) {
          dayCtx.fillStyle = `rgba(34, 197, 94, ${Math.random() * 0.3})`;
          dayCtx.beginPath();
          dayCtx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 10, 0, 2 * Math.PI);
          dayCtx.fill();
        }
      }

      const dayTexture = new THREE.CanvasTexture(dayCanvas);
      dayTexture.wrapS = THREE.RepeatWrapping;
      dayTexture.wrapT = THREE.RepeatWrapping;

      // Create night lights texture
      const nightCanvas = document.createElement('canvas');
      nightCanvas.width = 1024;
      nightCanvas.height = 512;
      const nightCtx = nightCanvas.getContext('2d');

      if (nightCtx) {
        nightCtx.fillStyle = '#000000';
        nightCtx.fillRect(0, 0, 1024, 512);

        // Add city lights
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 512;
          const size = Math.random() * 2 + 1;
          
          nightCtx.fillStyle = `rgba(255, 255, 0, ${Math.random() * 0.8 + 0.2})`;
          nightCtx.beginPath();
          nightCtx.arc(x, y, size, 0, 2 * Math.PI);
          nightCtx.fill();
        }
      }

      const nightTexture = new THREE.CanvasTexture(nightCanvas);
      nightTexture.wrapS = THREE.RepeatWrapping;
      nightTexture.wrapT = THREE.RepeatWrapping;

      // Custom shader material for day/night transition
      const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 dayColor = texture2D(dayTexture, vUv).rgb;
          vec3 nightColor = texture2D(nightTexture, vUv).rgb;
          
          float cosineAngleSunToNormal = dot(normalize(vNormal), sunDirection);
          cosineAngleSunToNormal = clamp(cosineAngleSunToNormal, 0.0, 1.0);
          
          vec3 color = mix(nightColor, dayColor, cosineAngleSunToNormal);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `;

      return new THREE.ShaderMaterial({
        uniforms: {
          dayTexture: { value: dayTexture },
          nightTexture: { value: nightTexture },
          sunDirection: { value: new THREE.Vector3(1, 0, 0) }
        },
        vertexShader,
        fragmentShader
      });
    };

    const earthMaterial = createEarthMaterial();
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.receiveShadow = true;
    earthRef.current = earth;
    scene.add(earth);

    // Create clouds layer
    const cloudsGeometry = new THREE.SphereGeometry(1.01, 64, 64);
    const createCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, 1024, 512);

        // Create cloud patterns
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 512;
          const radius = Math.random() * 50 + 20;
          const opacity = Math.random() * 0.6 + 0.2;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    const cloudsMaterial = new THREE.MeshLambertMaterial({
      map: createCloudTexture(),
      transparent: true,
      opacity: 0.4
    });

    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    cloudsRef.current = clouds;
    scene.add(clouds);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);

    // Mouse interactions
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
        x: Math.max(-Math.PI/2, Math.min(Math.PI/2, prev.x - deltaY * 0.005)),
        y: prev.y + deltaX * 0.005
      }));
      
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setTimeout(() => setAutoRotate(true), 2000);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoom = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(zoom);
      camera.position.clampLength(1.5, 5);
    };

    // Add event listeners
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.style.cursor = 'grab';

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const earth = earthRef.current;
      const clouds = cloudsRef.current;
      const atmosphere = atmosphereRef.current;
      const stars = starsRef.current;
      
      if (earth && clouds && atmosphere && stars) {
        if (autoRotate) {
          earth.rotation.y += 0.002;
          clouds.rotation.y += 0.003;
          atmosphere.rotation.y += 0.001;
          stars.rotation.y += 0.0001;
        } else {
          // Smooth interpolation to target rotation
          const lerpFactor = 0.1;
          setRotation(prev => ({
            x: prev.x + (targetRotation.x - prev.x) * lerpFactor,
            y: prev.y + (targetRotation.y - prev.y) * lerpFactor
          }));
          
          earth.rotation.x = rotation.x;
          earth.rotation.y = rotation.y;
          clouds.rotation.x = rotation.x;
          clouds.rotation.y = rotation.y + 0.1;
          atmosphere.rotation.x = rotation.x;
          atmosphere.rotation.y = rotation.y;
        }
        
        canvas.style.cursor = isMouseDown ? 'grabbing' : 'grab';
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
      
      const canvas = renderer.domElement;
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of resources
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px', maxWidth: '500px' }}>
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-lg"
      />
      
      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 text-white/60 text-xs space-y-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span>Drag to rotate Earth</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Scroll to zoom</span>
        </div>
      </div>
      
      {/* Status */}
      <div className="absolute top-4 right-4 text-white/60 text-xs pointer-events-none">
        {autoRotate ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-spin" />
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
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface RobloxCrown3DProps {
  className?: string;
}

export const RobloxCrown3D: React.FC<RobloxCrown3DProps> = ({ className = "w-64 h-64 md:w-80 md:h-80" }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 360;
    const height = currentMount.clientHeight || 360;

    // Scene
    const scene = new THREE.Scene();

    // Camera perspective matching video 1:1 (eye-level with slight subtle incline)
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(0, 0.7, 8.8);
    camera.lookAt(0, 0, 0);

    // High performance WebGL Renderer with antialias and HDR tone mapping
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.65;
    currentMount.appendChild(renderer.domElement);

    // Dynamic gradient environment texture for radiant gold reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Create soft studio reflection map so metallic gold shines brilliantly without black reflection artifacts
    const envScene = new THREE.Scene();
    const envLight1 = new THREE.DirectionalLight(0xfff5db, 4);
    envLight1.position.set(2, 4, 3);
    envScene.add(envLight1);
    const envLight2 = new THREE.DirectionalLight(0xffffff, 3);
    envLight2.position.set(-3, -2, 2);
    envScene.add(envLight2);
    const envAmb = new THREE.AmbientLight(0xffedd0, 2);
    envScene.add(envAmb);
    const envTexture = pmremGenerator.fromScene(envScene).texture;
    scene.environment = envTexture;

    // Studio Lighting (Crisp bright key lights and warm gold rim lights)
    const ambientLight = new THREE.AmbientLight(0xfff6e5, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
    keyLight.position.set(4, 8, 7);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffea9f, 3.0);
    fillLight.position.set(-6, 5, 4);
    scene.add(fillLight);

    const backRimLight = new THREE.DirectionalLight(0xffd54f, 3.5);
    backRimLight.position.set(0, 7, -6);
    scene.add(backRimLight);

    const bottomBounceLight = new THREE.DirectionalLight(0xfff9e6, 2.0);
    bottomBounceLight.position.set(0, -5, 5);
    scene.add(bottomBounceLight);

    // Root Group for Crown
    const crownRoot = new THREE.Group();
    scene.add(crownRoot);

    // --- MATERIALS (Radiant gleaming gold matching Roblox Catalog 1:1) ---
    // 1. Radiant Primary Gold (High specular, bright gold luster)
    const radiantGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd84d,
      emissive: 0x3d2800,
      emissiveIntensity: 0.15,
      metalness: 0.92,
      roughness: 0.14,
      envMapIntensity: 1.6,
    });

    // 2. Bright Polished Gold Highlight (For blade edges & gems)
    const polishedGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffef8a,
      emissive: 0x523600,
      emissiveIntensity: 0.2,
      metalness: 0.96,
      roughness: 0.08,
      envMapIntensity: 2.0,
    });

    // 3. Deep Gold for Bands & Filigree
    const bandGoldMat = new THREE.MeshStandardMaterial({
      color: 0xebbe38,
      metalness: 0.90,
      roughness: 0.22,
      envMapIntensity: 1.4,
    });

    // 4. White / Silver-Platinum Accent for Inset Daggers & Gems
    const platinumAccentMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.10,
      envMapIntensity: 1.8,
    });

    // --- GEOMETRY CONSTRUCTION ---
    const ringRadius = 2.05;

    // Main Upper Ring Band
    const upperRingGeom = new THREE.TorusGeometry(ringRadius, 0.065, 16, 64);
    upperRingGeom.rotateX(Math.PI / 2);
    const upperRing = new THREE.Mesh(upperRingGeom, bandGoldMat);
    upperRing.position.y = 0.08;
    crownRoot.add(upperRing);

    // Main Lower Ring Band
    const lowerRingGeom = new THREE.TorusGeometry(ringRadius, 0.055, 16, 64);
    lowerRingGeom.rotateX(Math.PI / 2);
    const lowerRing = new THREE.Mesh(lowerRingGeom, bandGoldMat);
    lowerRing.position.y = -0.08;
    crownRoot.add(lowerRing);

    // Middle Inset Band (Creates the dual-rail crown structure)
    const middleRingGeom = new THREE.TorusGeometry(ringRadius - 0.03, 0.035, 12, 64);
    middleRingGeom.rotateX(Math.PI / 2);
    const middleRing = new THREE.Mesh(middleRingGeom, polishedGoldMat);
    crownRoot.add(middleRing);

    // Helper: Create 4-sided Faceted Sword Blade Geometry
    const createFacetedBladeGeom = (length: number, width: number, thickness: number) => {
      const geom = new THREE.BufferGeometry();
      const halfW = width / 2;
      const halfT = thickness / 2;

      const positions = [
        // Front Left Face
        0, length, 0,
        -halfW, 0, 0,
        0, 0, halfT,

        // Front Right Face
        0, length, 0,
        0, 0, halfT,
        halfW, 0, 0,

        // Back Right Face
        0, length, 0,
        halfW, 0, 0,
        0, 0, -halfT,

        // Back Left Face
        0, length, 0,
        0, 0, -halfT,
        -halfW, 0, 0,

        // Bottom Cap
        -halfW, 0, 0,
        0, 0, halfT,
        halfW, 0, 0,
        -halfW, 0, 0,
        halfW, 0, 0,
        0, 0, -halfT,
      ];

      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.computeVertexNormals();
      return geom;
    };

    // Geometries for Spoke Elements
    const tallSwordBladeGeom = createFacetedBladeGeom(1.75, 0.22, 0.11);
    const shortSwordBladeGeom = createFacetedBladeGeom(1.25, 0.18, 0.09);
    const lowerDaggerGeom = createFacetedBladeGeom(0.72, 0.16, 0.08);
    const crossguardGeom = new THREE.BoxGeometry(0.38, 0.06, 0.12);
    const jewelGeom = new THREE.OctahedronGeometry(0.065, 0);
    const studGeom = new THREE.SphereGeometry(0.055, 12, 12);
    const archBarGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.52, 8);
    archBarGeom.rotateZ(Math.PI / 2);

    const spokeCount = 24; // 24 radial swords matching the exact Ozymandias Crown mesh

    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;

      const spokeGroup = new THREE.Group();
      spokeGroup.position.set(x, 0, z);
      spokeGroup.rotation.y = -angle + Math.PI / 2;

      const isPrimary = i % 2 === 0;

      // 1. Crossguard on Ring Band
      const guard = new THREE.Mesh(crossguardGeom, bandGoldMat);
      spokeGroup.add(guard);

      // Center Rivet / Gem Stud on Guard
      const stud = new THREE.Mesh(studGeom, polishedGoldMat);
      stud.position.set(0, 0, 0.065);
      spokeGroup.add(stud);

      // 2. Upper Sword Blade (Alternating Tall & Medium Spikes for iconic crown silhouette)
      const upperBlade = new THREE.Mesh(
        isPrimary ? tallSwordBladeGeom : shortSwordBladeGeom,
        isPrimary ? polishedGoldMat : radiantGoldMat
      );
      upperBlade.position.set(0, 0.03, 0);
      spokeGroup.add(upperBlade);

      // Sword Hilt Ring Collar
      const collarGeom = new THREE.TorusGeometry(0.08, 0.025, 8, 16);
      collarGeom.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeom, bandGoldMat);
      collar.position.set(0, 0.06, 0);
      spokeGroup.add(collar);

      // 3. Lower Inverted Dagger Spike (Pointing Downward)
      const lowerDagger = new THREE.Mesh(lowerDaggerGeom, isPrimary ? radiantGoldMat : platinumAccentMat);
      lowerDagger.position.set(0, -0.03, 0);
      lowerDagger.rotation.x = Math.PI; // Inverted
      spokeGroup.add(lowerDagger);

      // Bottom Jewel Tip
      const jewelTip = new THREE.Mesh(jewelGeom, polishedGoldMat);
      jewelTip.position.set(0, -0.76, 0);
      spokeGroup.add(jewelTip);

      // Connecting arch / filigree strut to adjacent spoke
      const arch = new THREE.Mesh(archBarGeom, bandGoldMat);
      arch.position.set(0.24, 0.22, 0);
      arch.rotation.z = -0.22;
      spokeGroup.add(arch);

      crownRoot.add(spokeGroup);
    }

    // Gentle slight tilt matching Roblox video eye-level presentation (not bird's eye view)
    crownRoot.rotation.x = 0.09;
    crownRoot.position.y = -0.05;

    // Smooth Interactive Orbit Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotate = true;
    const autoRotateSpeed = 0.008;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      crownRoot.rotation.y += deltaX * 0.01;
      crownRoot.rotation.x = Math.max(-0.15, Math.min(0.40, crownRoot.rotation.x + deltaY * 0.005));
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      setTimeout(() => {
        autoRotate = true;
      }, 1500);
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      crownRoot.rotation.y += deltaX * 0.01;
      crownRoot.rotation.x = Math.max(-0.15, Math.min(0.40, crownRoot.rotation.x + deltaY * 0.005));
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging = false;
      setTimeout(() => {
        autoRotate = true;
      }, 1500);
    };

    const domElement = renderer.domElement;
    domElement.style.cursor = 'grab';
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate) {
        crownRoot.rotation.y += autoRotateSpeed;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(currentMount);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`relative flex items-center justify-center select-none ${className}`}
      title="3D Ansicht - Ziehen zum Drehen"
    />
  );
};

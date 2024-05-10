import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, // Changed from 90 to 75 for a better perspective view
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const globalLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(globalLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    let model; // Reference to the model

    const loader = new GLTFLoader();
    loader.load(
      "models/torus2.glb",
      (gltf) => {
        model = gltf.scene;
        model.position.set(0, 0, 0); // Center the model
        scene.add(model);
        animate();
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    camera.position.set(0, 0, 0); // Position the camera to look at the center

    const animate = () => {
      requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += 0.0002; // Rotate the model around its y-axis
      }
      renderer.render(scene, camera);
    };

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default ThreeScene;

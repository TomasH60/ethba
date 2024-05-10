import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0,0,0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const globalLight = new THREE.AmbientLight(0xffffff, 1.5); // Soft white light
    scene.add(globalLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    let model;
    const loader = new GLTFLoader();
    loader.load(
      "models/torus2.glb",
      (gltf) => {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);
        animate()
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    const pixelShader = {
      uniforms: {
        "tDiffuse": { value: null },
        "resolution": { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        "pixelSize": { value: 8 },
      },
      vertexShader: `
        varying highp vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float pixelSize;
        varying highp vec2 vUv;
        void main() {
          vec2 dxy = pixelSize / resolution;
          vec2 coord = dxy * floor(vUv / dxy);
          gl_FragColor = texture2D(tDiffuse, coord);
        }
      `
    };

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const pixelPass = new ShaderPass(pixelShader);
    pixelPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
    pixelPass.uniforms['pixelSize'].value = 8; // Adjust pixel size to change effect
    composer.addPass(pixelPass);

    const animate = () => {
      requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += 0.0002; // Rotate the model around its y-axis
      }
    
      composer.render();
    };

    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      if (model) {
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.dispose();
            child.geometry.dispose();
          }
        });
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default ThreeScene;

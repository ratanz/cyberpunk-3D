import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import gsap from "gsap";
import Lenis from '@studio-freight/lenis'

// Initialize Lenis
const lenis = new Lenis()

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 3.5;

// HDRI Environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture;
  }
);

// GLTF Model loader
const loader = new GLTFLoader();
let model; // model variable

// model loader
loader.load(
  "./texture/DamagedHelmet.gltf",
  function (gltf) {
    model = gltf.scene;
    scene.add(model);
  },
  undefined,
  () => {
    console.error("An error happened:");
  }
);


// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha: true,
});

// set renderer size and pixel ratio
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Post processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// RGB Shift effect
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0025; // RGB shift amount
composer.addPass(rgbShiftPass);

// controls - orbit controls -
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// Update camera position based on screen size
function updateCameraPosition() {
  if (window.innerWidth <= 768) {
    camera.position.z = 7; // Move camera further back on mobile
  } else {
    camera.position.z = 3.5; // Original position for desktop
  }
}

// Call initially
updateCameraPosition();

// Update the resize event listener
window.addEventListener('resize', () => {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  updateCameraPosition();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update composer
  composer.setSize(window.innerWidth, window.innerHeight);
});

// mouse movement for model rotation -
window.addEventListener("mousemove", (e) => {
  if (model) {
    const rotationY = (e.clientX / window.innerWidth - 0.5) * (Math.PI * .17);
    const rotationX = (e.clientY / window.innerHeight - 0.5) * (Math.PI * .17);
    gsap.to(model.rotation, {
      y: rotationY,
      x: rotationX,
      duration: 0.9,
      ease: "power3.out"
    });
  }
});

// Update mouse movement for mobile touch events
window.addEventListener("touchmove", (e) => {
  if (model && e.touches[0]) {
    const touch = e.touches[0];
    const rotationY = (touch.clientX / window.innerWidth - 0.5) * (Math.PI * .17);
    const rotationX = (touch.clientY / window.innerHeight - 0.5) * (Math.PI * .17);
    gsap.to(model.rotation, {
      y: rotationY,
      x: rotationX,
      duration: 0.9,
      ease: "power3.out"
    });
  }
});

// animate function
function animate(time) {
  window.requestAnimationFrame(animate);
  composer.render();
  lenis.raf(time);
}

animate();

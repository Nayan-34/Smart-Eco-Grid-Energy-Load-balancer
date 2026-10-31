
import * as THREE from 'three';
import { createBuilding } from './building.js';

// Create 3D scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101827);

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(15, 15, 20);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(10, 20, 10);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// Ground
const groundGeometry = new THREE.BoxGeometry(30, 0.5, 30);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x263445
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = -1;
scene.add(ground);
// N0 - Power Plant
createBuilding(scene, 0, 0, 0xffaa00, 5);
// N1 - Metro Hospital
createBuilding(scene, -7, -5, 0x2196f3, 7);

// N2 - Telecom Hub
createBuilding(scene, 7, -5, 0x9c27b0, 5);

// N3 - Water Plant
createBuilding(scene, -7, 5, 0x00bcd4, 4);

// N4 - City Schools
createBuilding(scene, 7, 5, 0x4caf50, 4);

// N5 - Offices
createBuilding(scene, -12, 0, 0xffffff, 6);

// N6 - Suburbs
createBuilding(scene, 12, 0, 0xff5722, 3);

// Animation
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Adjust when window resizes
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

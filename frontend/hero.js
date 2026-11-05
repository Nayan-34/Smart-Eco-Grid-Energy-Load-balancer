
import * as THREE from 'three';
import { createHeaderEnergy } from './3D/header-energy.js';

// ======================================
// 1. SCENE SETUP
// ======================================

const container = document.getElementById('hero3D');

if (!container) {
    throw new Error("Hero 3D container not found");
}

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    200
);

camera.position.set(0, 8, 28);
camera.lookAt(0, 4, 0);

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'low-power'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.setSize(container.clientWidth, container.clientHeight);

container.appendChild(renderer.domElement);

// ======================================
// 2. LIGHTING
// ======================================

scene.add(
    new THREE.HemisphereLight(0x9eeeff, 0x102b38, 2)
);

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(5, 15, 10);
scene.add(sunlight);

// ======================================
// 3. GLOWING SUN
// ======================================

const sunGroup = new THREE.Group();

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd66b })
);

sunGroup.add(sun);

// Outer glow
const glow = new THREE.Mesh(
    new THREE.SphereGeometry(2.65, 32, 32),
    new THREE.MeshBasicMaterial({
        color: 0xffbd50,
        transparent: true,
        opacity: 0.18
    })
);

sunGroup.add(glow);

// Sun rays
const rayMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdc85
});

for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;

    const ray = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.8, 0.08),
        rayMaterial
    );

    ray.position.set(
        Math.cos(angle) * 3,
        Math.sin(angle) * 3,
        0
    );

    ray.rotation.z = angle - Math.PI / 2;
    sunGroup.add(ray);
}

sunGroup.position.set(7, 10, -5);
scene.add(sunGroup);

// ======================================
// 4. WIND TURBINES
// ======================================

const turbines = [];

function createTurbine(x, z, scale = 1) {

    const turbine = new THREE.Group();

    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xd9f5f3,
        metalness: 0.5,
        roughness: 0.35
    });

    const tealMaterial = new THREE.MeshStandardMaterial({
        color: 0x00bfa5,
        emissive: 0x003c35,
        emissiveIntensity: 0.5
    });

    // Tower
    const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.28, 8, 12),
        whiteMaterial
    );

    tower.position.y = 4;
    turbine.add(tower);

    // Nacelle
    const nacelle = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.45, 0.5),
        whiteMaterial
    );

    nacelle.position.set(0, 8, 0);
    turbine.add(nacelle);

    // Rotor
    const rotor = new THREE.Group();
    rotor.position.set(0, 8, 0.32);

    const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0xf2fffc,
        roughness: 0.4
    });

    for (let i = 0; i < 3; i++) {

        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 3.4, 0.12),
            bladeMaterial
        );

        blade.position.y = 1.7;

        const bladeGroup = new THREE.Group();
        bladeGroup.rotation.z = (i * Math.PI * 2) / 3;
        bladeGroup.add(blade);

        rotor.add(bladeGroup);
    }

    // Rotor centre
    const hub = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        tealMaterial
    );

    rotor.add(hub);
    turbine.add(rotor);

    turbine.position.set(x, 0, z);
    turbine.scale.setScalar(scale);

    scene.add(turbine);
    turbines.push(rotor);
}

// Create three turbines
createTurbine(1, -3, 0.9);
createTurbine(6, -1, 1.15);
createTurbine(11, -5, 0.75);

// ======================================
// 5. SOLAR PANEL FARM
// ======================================

const panelGroup = new THREE.Group();

const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x075477,
    metalness: 0.8,
    roughness: 0.25,
    emissive: 0x003044,
    emissiveIntensity: 0.5
});

const panelFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0xb5d7db,
    metalness: 0.7,
    roughness: 0.3
});

for (let row = 0; row < 2; row++) {

    for (let col = 0; col < 4; col++) {

        const panel = new THREE.Group();

        const surface = new THREE.Mesh(
            new THREE.BoxGeometry(2.3, 0.12, 1.5),
            panelMaterial
        );

        panel.add(surface);

        // Vertical grid lines
        for (let i = -1; i <= 1; i++) {

            const line = new THREE.Mesh(
                new THREE.BoxGeometry(0.025, 0.025, 1.45),
                panelFrameMaterial
            );

            line.position.x = i * 0.55;
            line.position.y = 0.075;

            panel.add(line);
        }

        // Horizontal grid lines
        for (let i = -1; i <= 1; i++) {

            const line = new THREE.Mesh(
                new THREE.BoxGeometry(2.25, 0.025, 0.025),
                panelFrameMaterial
            );

            line.position.z = i * 0.35;
            line.position.y = 0.075;

            panel.add(line);
        }

        // Panel support
        const support = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.7, 0.12),
            panelFrameMaterial
        );

        support.position.y = -0.35;
        panel.add(support);

        panel.position.set(
            col * 2.5,
            0.7,
            row * 2.2
        );

        panel.rotation.x = -0.35;
        panelGroup.add(panel);
    }
}

panelGroup.position.set(0, 0, 5);
scene.add(panelGroup);

// ======================================
// 6. GROUND
// ======================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(45, 35),
    new THREE.MeshStandardMaterial({
        color: 0x0b2935,
        roughness: 0.9,
        metalness: 0.1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.set(4, -0.1, 1);

scene.add(ground);

// ======================================
// 7. HEADER ENERGY EFFECTS
// ======================================

// Creates glowing cables between solar panels
// and wind turbines. No moving particles.

const updateEnergy = createHeaderEnergy(THREE, scene);

// ======================================
// 8. ANIMATION
// ======================================

const timer = new THREE.Timer();

function animate() {

    requestAnimationFrame(animate);

    timer.update();
    const time = timer.getElapsed();

    // Rotate turbine blades
    turbines.forEach((rotor, index) => {
        rotor.rotation.z = -time * (0.8 + index * 0.12);
    });

    // Pulse sun glow
    const glowScale = 1 + Math.sin(time * 1.5) * 0.035;
    glow.scale.setScalar(glowScale);

    // Slowly rotate sun rays
    sunGroup.rotation.z = time * 0.025;

    // Animate energy cable brightness
    updateEnergy(time);

    renderer.render(scene, camera);
}

animate();

// ======================================
// 9. RESPONSIVE RESIZE
// ======================================

function resizeHero() {

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

window.addEventListener('resize', resizeHero);
resizeHero();

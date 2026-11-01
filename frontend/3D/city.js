
import * as THREE from 'three';
import { createBuilding } from './building.js';

const cityContainer = document.getElementById('city3D');

if (!cityContainer) {
  throw new Error("3D container with id 'city3D' not found");
}

// =====================================================
// 1. SCENE AND CAMERA
// =====================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x101820);
scene.fog = new THREE.Fog(0x101820, 300, 500);

const camera = new THREE.PerspectiveCamera(
  45,
  cityContainer.clientWidth / cityContainer.clientHeight,
  0.1,
  1000
);

camera.position.set(150, 150, 175);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'low-power'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.setSize(
  cityContainer.clientWidth,
  cityContainer.clientHeight
);

renderer.shadowMap.enabled = false;
cityContainer.appendChild(renderer.domElement);

const loadingMessage = document.getElementById('cityLoading');
if (loadingMessage) loadingMessage.remove();

// =====================================================
// 2. LIGHTING
// =====================================================

scene.add(
  new THREE.HemisphereLight(0xffffff, 0x607080, 2)
);

const sunlight = new THREE.DirectionalLight(0xffffff, 1.5);
sunlight.position.set(70, 100, 50);
scene.add(sunlight);

// =====================================================
// 3. MATERIALS
// =====================================================

const materials = {
  ground: new THREE.MeshStandardMaterial({
    color: 0x718568,
    roughness: 1
  }),

  road: new THREE.MeshStandardMaterial({
    color: 0x303943
  }),

  sidewalk: new THREE.MeshStandardMaterial({
    color: 0xb8b9ad
  }),

  marking: new THREE.MeshBasicMaterial({
    color: 0xf5d76e
  }),

  park: new THREE.MeshStandardMaterial({
    color: 0x477d4d
  }),

  wire: new THREE.LineBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.9
  })
};


// =====================================================
// 5. ROAD SYSTEM
// =====================================================

function createRoad(x, z, width, depth) {
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.15, depth),
    materials.road
  );

  road.position.set(x, -0.82, z);
  scene.add(road);
}

function createSidewalk(x, z, width, depth) {
  const sidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.18, depth),
    materials.sidewalk
  );

  sidewalk.position.set(x, -0.70, z);
  scene.add(sidewalk);
}

const horizontalRoads = [-60, -30, 0, 30, 60, 90];
const verticalRoads = [-75, -45, -15, 15, 45, 75];

// Horizontal roads
for (const z of horizontalRoads) {
  createRoad(0, z, 180, 7);

  createSidewalk(0, z - 5, 180, 2);
  createSidewalk(0, z + 5, 180, 2);
}

// Vertical roads
for (const x of verticalRoads) {
  createRoad(x, 15, 7, 180);

  createSidewalk(x - 5, 15, 2, 180);
  createSidewalk(x + 5, 15, 2, 180);
}

// Road markings
const dashGeometry = new THREE.BoxGeometry(3, 0.04, 0.18);
const verticalDashGeometry = new THREE.BoxGeometry(0.18, 0.04, 3);

for (const z of horizontalRoads) {
  for (let x = -85; x <= 85; x += 9) {
    const dash = new THREE.Mesh(
      dashGeometry,
      materials.marking
    );

    dash.position.set(x, -0.72, z);
    scene.add(dash);
  }
}

for (const x of verticalRoads) {
  for (let z = -65; z <= 95; z += 9) {
    const dash = new THREE.Mesh(
      verticalDashGeometry,
      materials.marking
    );

    dash.position.set(x, -0.72, z);
    scene.add(dash);
  }
}

// =====================================================
// 6. CITY PARKS
// =====================================================

function createPark(x, z) {
  const park = new THREE.Mesh(
    new THREE.BoxGeometry(13, 0.25, 13),
    materials.park
  );

  park.position.set(x, -0.65, z);
  scene.add(park);
}

createPark(-15, -45);
createPark(30, 15);
createPark(-15, 15);
createPark(30, 45);

// =====================================================
// 7. GRID NODE LOCATIONS
// =====================================================

const nodes = {
  solar: {
    x: -60, z: -45,
    color: 0xffaa00,
    height: 10,
    type: 'solar',
    label: 'SOLAR FARM'
  },

  hydro: {
    x: 0, z: -45,
    color: 0x2196f3,
    height: 11,
    type: 'hydro',
    label: 'HYDRO PLANT'
  },

  wind: {
    x: 60, z: -45,
    color: 0x00bcd4,
    height: 12,
    type: 'wind',
    label: 'WIND FARM'
  },

  substationA: {
    x: -30, z: -15,
    color: 0xffc107,
    height: 8,
    type: 'substation',
    label: 'SUBSTATION A'
  },

  substationB: {
    x: 30, z: -15,
    color: 0xffc107,
    height: 8,
    type: 'substation',
    label: 'SUBSTATION B'
  },

  substationC: {
    x: 60, z: 45,
    color: 0xffc107,
    height: 8,
    type: 'substation',
    label: 'SUBSTATION C'
  },

  hospital: {
    x: -60, z: 15,
    color: 0xe53935,
    height: 13,
    type: 'hospital',
    label: 'HOSPITAL'
  },

  school: {
    x: 0, z: 45,
    color: 0x4caf50,
    height: 9,
    type: 'school',
    label: 'SCHOOL'
  },

  college: {
    x: -30, z: 75,
    color: 0x673ab7,
    height: 11,
    type: 'college',
    label: 'COLLEGE'
  },

  residential: {
    x: 60, z: 75,
    color: 0x8bc34a,
    height: 7,
    type: 'residential',
    label: 'RESIDENTIAL AREA'
  },

  shopping: {
    x: 30, z: 75,
    color: 0xff7043,
    height: 10,
    type: 'shopping',
    label: 'SHOPPING COMPLEX'
  },

  depot: {
    x: -60, z: 75,
    color: 0x9e9e9e,
    height: 7,
    type: 'depot',
    label: 'REPAIR DEPOT'
  }
};

// Create main electrical facilities
Object.values(nodes).forEach(node => {
  createBuilding(
    scene,
    node.x,
    node.z,
    node.color,
    node.height,
    node.type,
    node.label
  );
});

// =====================================================
// 8. ELECTRICAL GRID CONNECTIONS
// =====================================================

const connections = [
  ['solar', 'substationA'],
  ['hydro', 'substationB'],
  ['wind', 'substationB'],
  ['substationA', 'substationB'],
  ['substationB', 'substationC'],
  ['substationA', 'hospital'],
  ['substationB', 'school'],
  ['substationA', 'college'],
  ['substationC', 'residential'],
  ['substationC', 'shopping']
];

function createPowerLine(from, to) {
  const a = nodes[from];
  const b = nodes[to];

  const start = new THREE.Vector3(a.x, 7, a.z);
  const end = new THREE.Vector3(b.x, 7, b.z);

  const middle = new THREE.Vector3(
    (a.x + b.x) / 2,
    10,
    (a.z + b.z) / 2
  );

  const curve = new THREE.QuadraticBezierCurve3(
    start,
    middle,
    end
  );

  const geometry = new THREE.BufferGeometry().setFromPoints(
    curve.getPoints(20)
  );

  const line = new THREE.Line(
    geometry,
    materials.wire
  );

  scene.add(line);
}

connections.forEach(([from, to]) => {
  createPowerLine(from, to);
});

// =====================================================
// 9. RESIDENTIAL HOUSES
// =====================================================

const houseColors = [
  0xd8c7ad,
  0xe5d5bd,
  0xc4d5d9,
  0xd9b9a7,
  0xb8c6b1,
  0xd5d0c5
];

const roofColors = [
  0x555b65,
  0x765c50,
  0x8b6d54,
  0x424b55
];

const windowMaterial = new THREE.MeshBasicMaterial({
  color: 0x8ed7ec
});

function createSmallBuilding(
  x, z, width, depth, height, color, roofColor
) {
  const group = new THREE.Group();

  // House walls
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color })
  );

  walls.position.y = height / 2;
  group.add(walls);

  // Roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(
      Math.max(width, depth) * 0.72,
      2.5,
      4
    ),
    new THREE.MeshStandardMaterial({
      color: roofColor
    })
  );

  roof.position.y = height + 1;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  // Front windows
  for (const wx of [-width / 4, width / 4]) {
    const windowMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1, 0.12),
      windowMaterial
    );

    windowMesh.position.set(
      wx,
      height * 0.55,
      depth / 2 + 0.07
    );

    group.add(windowMesh);
  }

  // Front door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 0.15),
    new THREE.MeshStandardMaterial({
      color: 0x65452f
    })
  );

  door.position.set(
    0,
    1,
    depth / 2 + 0.08
  );

  group.add(door);

  group.position.set(x, -0.55, z);
  scene.add(group);

  return group;
}

// Avoid electrical facilities
function isNearGridNode(x, z) {
  return Object.values(nodes).some(node =>
    Math.abs(x - node.x) < 13 &&
    Math.abs(z - node.z) < 13
  );
}

// Avoid road corridors
function isNearRoad(x, z) {
  return (
    horizontalRoads.some(
      roadZ => Math.abs(z - roadZ) < 8
    ) ||
    verticalRoads.some(
      roadX => Math.abs(x - roadX) < 8
    )
  );
}

// Fill remaining city blocks
function fillResidentialArea() {
  let index = 0;

  for (let x = -85; x <= 85; x += 10) {
    for (let z = -85; z <= 85; z += 10) {

      if (isNearRoad(x, z)) continue;
      if (isNearGridNode(x, z)) continue;

      const width = 5 + (index % 3);
      const depth = 5 + ((index + 1) % 3);
      const height = 5 + (index % 4) * 1.5;

      createSmallBuilding(
        x,
        z,
        width,
        depth,
        height,
        houseColors[index % houseColors.length],
        roofColors[index % roofColors.length]
      );

      index++;
    }
  }
}

fillResidentialArea();

// =====================================================
// 10. APARTMENT BUILDINGS
// =====================================================

function createApartment(x, z, floors, color) {
  const width = 9;
  const depth = 8;
  const height = floors * 2.5;

  const apartment = new THREE.Group();

  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color })
  );

  building.position.y = height / 2;
  apartment.add(building);

  // Windows
  for (let floor = 0; floor < floors; floor++) {
    for (let column = 0; column < 3; column++) {
      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.2, 0.12),
        windowMaterial
      );

      windowMesh.position.set(
        -2.8 + column * 2.8,
        1.5 + floor * 2.5,
        depth / 2 + 0.07
      );

      apartment.add(windowMesh);
    }
  }

  apartment.position.set(x, -0.5, z);
  scene.add(apartment);
}

// Apartment complexes
createApartment(-55, -75, 5, 0xd8c6b5);
createApartment(-25, -75, 6, 0xb7c9d8);
createApartment(25, -75, 5, 0xc8d4c2);
createApartment(55, -75, 6, 0xe0c9b4);

createApartment(-55, 15, 5, 0xbacbd5);
createApartment(25, 15, 6, 0xd5c4b8);

// =====================================================
// 11. TREES
// =====================================================

const trunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x795438
});

const leafMaterial = new THREE.MeshStandardMaterial({
  color: 0x287a3e
});

function createCityTree(x, z, scale = 1) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, 2.2, 6),
    trunkMaterial
  );

  trunk.position.y = 1.1;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 7, 6),
    leafMaterial
  );

  leaves.position.y = 2.8;
  leaves.scale.set(1, 1.2, 1);
  tree.add(leaves);

  tree.position.set(x, -0.5, z);
  tree.scale.setScalar(scale);

  scene.add(tree);
}

// Trees along road edges
for (let x = -85; x <= 85; x += 12) {
  createCityTree(x, -54, 0.9);
  createCityTree(x, 84, 0.9);
}

for (let z = -55; z <= 85; z += 12) {
  createCityTree(-84, z, 0.9);
  createCityTree(84, z, 0.9);
}

// Additional trees around neighbourhoods
[
  [-75, -75], [-55, -75], [-35, -75],
  [25, -75], [45, -75], [65, -75],
  [-75, 15], [-55, 15], [-35, 15],
  [25, 15], [45, 15], [65, 15],
  [-75, 75], [-55, 75], [25, 75], [45, 75]
].forEach(([x, z]) => {
  createCityTree(x, z, 0.8);
});

// =====================================================
// 12. STREETLIGHTS
// =====================================================

function createStreetLight(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 5, 5),
    new THREE.MeshStandardMaterial({
      color: 0x252b33
    })
  );

  pole.position.set(x, 1.7, z);
  scene.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 6, 5),
    new THREE.MeshBasicMaterial({
      color: 0xffe7a3
    })
  );

  lamp.position.set(x, 4.2, z);
  scene.add(lamp);
}

for (let x = -75; x <= 75; x += 30) {
  createStreetLight(x + 5, -25);
  createStreetLight(x + 5, 35);
}

// =====================================================
// 13. CARS
// =====================================================

function createCar(x, z, color, rotation = 0) {
  const car = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6
  });

  // Car body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.1, 2),
    bodyMaterial
  );

  body.position.y = 0.8;
  car.add(body);

  // Cabin
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.9, 1.7),
    new THREE.MeshStandardMaterial({
      color: 0x9ac6d8
    })
  );

  cabin.position.set(-0.2, 1.75, 0);
  car.add(cabin);

  // Wheels
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x202020
  });

  for (const wx of [-1.25, 1.25]) {
    for (const wz of [-1.05, 1.05]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.25, 8),
        wheelMaterial
      );

      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, 0.45, wz);
      car.add(wheel);
    }
  }

  car.position.set(x, -0.3, z);
  car.rotation.y = rotation;

  scene.add(car);

  return car;
}

// Parked vehicles
const parkedCars = [
  createCar(-65, -53, 0xe53935),
  createCar(-45, -53, 0xffffff),
  createCar(5, -53, 0x2196f3),
  createCar(35, 83, 0xffc107),
  createCar(55, 83, 0x43a047),
  createCar(-80, 20, 0x673ab7, Math.PI / 2),
  createCar(80, 50, 0xe53935, Math.PI / 2)
];

// =====================================================
// 14. MOVING TRAFFIC
// =====================================================

const trafficCars = [
  createCar(-80, -30, 0xff3030),
  createCar(-20, 0, 0xffffff),
  createCar(35, 30, 0x2196f3),
  createCar(75, 60, 0xffc107)
];

const trafficSpeeds = [0.12, 0.10, 0.14, 0.11];

function animateTraffic() {
  trafficCars.forEach((car, index) => {
    car.position.x += trafficSpeeds[index];

    if (car.position.x > 90) {
      car.position.x = -90;
    }
  });
}

// =====================================================
// 15. ANIMATION
// =====================================================

function animate() {
  requestAnimationFrame(animate);

  animateTraffic();

  renderer.render(scene, camera);
}

animate();

// =====================================================
// 16. RESPONSIVE RESIZE
// =====================================================
function resizeCity() {
  const width = cityContainer.clientWidth;
  const height = cityContainer.clientHeight;

  if (width === 0 || height === 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
}

window.addEventListener('resize', resizeCity);
resizeCity();
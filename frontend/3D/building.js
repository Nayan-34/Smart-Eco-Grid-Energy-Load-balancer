
import * as THREE from 'three';

export function createBuilding(scene, x, z, color, height) {

    // Building geometry
    const geometry = new THREE.BoxGeometry(3, height, 3);

    // Building material
    const material = new THREE.MeshStandardMaterial({
        color: color
    });

    // Create building
    const building = new THREE.Mesh(geometry, material);

    building.position.set(x, height / 2, z);

    scene.add(building);

    return building;
}

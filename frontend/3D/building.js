import * as THREE from 'three';

export function createBuilding(
  scene,
  x,
  z,
  color,
  height,
  type,
  label
) {
  const group = new THREE.Group();

  const mainMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x424b55
  });

  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8
  });

  function addBox(w, h, d, px, py, pz, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );

    mesh.position.set(px, py, pz);
    group.add(mesh);
    return mesh;
  }

  function addCylinder(radiusTop, radiusBottom, h, px, py, pz, material) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        h,
        8
      ),
      material
    );

    mesh.position.set(px, py, pz);
    group.add(mesh);
    return mesh;
  }

  // Facility foundation
  addBox(13, 0.6, 13, 0, 0, 0, darkMaterial);

  // Main facility structures
  switch (type) {

    case 'solar':
      addBox(8, height, 8, 0, height / 2 + 0.3, 0, mainMaterial);

      // Solar panel structures
      for (let i = -1; i <= 1; i++) {
        const panel = addBox(
          3,
          0.25,
          2,
          i * 3,
          height + 1,
          6,
          new THREE.MeshStandardMaterial({
            color: 0x174a87,
            metalness: 0.3
          })
        );

        panel.rotation.x = -0.2;
      }

      // Small control tower
      addBox(2, 4, 2, 4, 2.3, -4, whiteMaterial);
      break;

    case 'hydro':
      addBox(9, height, 8, 0, height / 2 + 0.3, 0, mainMaterial);

      // Water storage tanks
      addCylinder(2.5, 2.5, 5, -4, 3, 5, whiteMaterial);
      addCylinder(2.5, 2.5, 5, 4, 3, 5, whiteMaterial);

      // Control tower
      addBox(3, 5, 3, 0, height + 2.8, -3, darkMaterial);
      break;

    case 'wind':
      addBox(7, 5, 7, 0, 2.8, 0, mainMaterial);

      // Three simplified wind turbines
      for (const px of [-4, 0, 4]) {
        addCylinder(
          0.25, 0.4, 8,
          px, 7, -3,
          whiteMaterial
        );

        const hub = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 8, 6),
          whiteMaterial
        );

        hub.position.set(px, 11, -3);
        group.add(hub);

        for (let i = 0; i < 3; i++) {
          const blade = addBox(
            0.35, 4, 0.35,
            px, 13, -3,
            whiteMaterial
          );

          blade.rotation.z = (i * Math.PI * 2) / 3;
        }
      }
      break;

    case 'substation':
      addBox(9, 4, 8, 0, 2.3, 0, mainMaterial);

      // Transformer units
      for (const px of [-3, 0, 3]) {
        addBox(1.8, 2.5, 2, px, 1.8, 5, darkMaterial);
        addCylinder(0.25, 0.25, 3, px, 5, 5, whiteMaterial);
      }

      // Electrical support structure
      addBox(0.5, 8, 0.5, -5, 4.3, -4, darkMaterial);
      addBox(0.5, 8, 0.5, 5, 4.3, -4, darkMaterial);
      addBox(11, 0.5, 0.5, 0, 8, -4, darkMaterial);
      break;

    case 'hospital':
      addBox(9, height, 9, 0, height / 2 + 0.3, 0, whiteMaterial);
      addBox(10, 1, 10, 0, height + 0.8, 0, mainMaterial);

      // Red medical cross
      addBox(3, 0.7, 0.5, 0, height + 2.5, 4.8, mainMaterial);
      addBox(0.7, 3, 0.5, 0, height + 2.5, 4.8, mainMaterial);

      // Entrance
      addBox(3, 3, 0.5, 0, 1.8, 4.8, darkMaterial);
      break;

    case 'school':
      addBox(10, height, 8, 0, height / 2 + 0.3, 0, mainMaterial);
      addBox(11, 0.7, 9, 0, height + 0.7, 0, darkMaterial);

      // Windows
      for (const px of [-3, 0, 3]) {
        addBox(1.2, 1.5, 0.2, px, height / 2, 4.1, whiteMaterial);
      }

      // Entrance
      addBox(2, 3, 0.3, 0, 1.8, 4.2, darkMaterial);
      break;

    case 'college':
      addBox(10, height, 9, 0, height / 2 + 0.3, 0, mainMaterial);
      addBox(7, 4, 7, 0, height + 2.5, 0, whiteMaterial);
      addBox(12, 0.5, 10, 0, height + 4.7, 0, darkMaterial);

      // Front entrance
      addBox(3, 4, 0.5, 0, 2.3, 4.8, darkMaterial);
      break;

    case 'residential':
      // Three residential towers
      addBox(3.5, height, 4, -3, height / 2 + 0.3, 0, mainMaterial);
      addBox(3.5, height - 2, 4, 2, (height - 2) / 2 + 0.3, 0, whiteMaterial);
      addBox(3.5, height - 3, 4, 0, (height - 3) / 2 + 0.3, -4, mainMaterial);

      // Roofs
      addBox(4, 0.5, 4.5, -3, height + 0.6, 0, darkMaterial);
      break;

    case 'shopping':
      addBox(11, height, 9, 0, height / 2 + 0.3, 0, mainMaterial);
      addBox(12, 0.7, 10, 0, height + 0.7, 0, darkMaterial);

      // Glass-like shop front
      addBox(
        8, 3, 0.25,
        0, 2.5, 4.6,
        new THREE.MeshStandardMaterial({
          color: 0x80deea,
          metalness: 0.3,
          roughness: 0.25
        })
      );
      break;

    case 'depot':
      addBox(10, 6, 9, 0, 3.3, 0, mainMaterial);
      addBox(11, 0.7, 10, 0, 6.7, 0, darkMaterial);

      // Repair garage entrance
      addBox(5, 4, 0.3, 0, 2.5, 4.7, darkMaterial);

      // Storage tower
      addBox(3, 9, 3, -4, 4.8, -4, whiteMaterial);
      break;

    default:
      addBox(8, height, 8, 0, height / 2 + 0.3, 0, mainMaterial);
  }

  // Facility label
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 256;

  const context = canvas.getContext('2d');

  context.fillStyle = 'rgba(15, 23, 42, 0.9)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = '#00e5ff';
  context.lineWidth = 5;
  context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

  context.fillStyle = '#ffffff';
  context.font = 'bold 64px Arial';
context.textAlign = 'center';
context.textBaseline = 'middle';

context.shadowColor = '#000000';
context.shadowBlur = 8;

context.fillText(label, 512, 128, 960);

  const texture = new THREE.CanvasTexture(canvas);

  const labelMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });

  const labelSprite = new THREE.Sprite(labelMaterial);
  labelSprite.scale.set(17, 4.25, 1);
labelSprite.material.sizeAttenuation = true;
  labelSprite.position.set(0, height + 5, 0);

  group.add(labelSprite);

 group.position.set(x, -0.5, z);

// Increase the size of the main facilities
group.scale.set(1.5, 1.5, 1.5);

scene.add(group);

return group;
}

export function createHeaderEnergy(THREE, scene) {

    const energyLines = [];

    const connections = [
        [
            new THREE.Vector3(3.5, 0.9, 5),
            new THREE.Vector3(2, 1.5, 2),
            new THREE.Vector3(1, 2, -3)
        ],
        [
            new THREE.Vector3(4, 0.9, 5),
            new THREE.Vector3(5, 1.5, 2),
            new THREE.Vector3(6, 2, -1)
        ],
        [
            new THREE.Vector3(5, 0.9, 5),
            new THREE.Vector3(8, 1.5, 1),
            new THREE.Vector3(11, 2, -5)
        ]
    ];

    connections.forEach((points) => {

        const curve = new THREE.CatmullRomCurve3(points);

        // Outer glow cable
        const glowGeometry = new THREE.TubeGeometry(
            curve,
            40,
            0.09,
            8,
            false
        );

        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f5d4,
            transparent: true,
            opacity: 0.16
        });

        const glowCable = new THREE.Mesh(
            glowGeometry,
            glowMaterial
        );

        scene.add(glowCable);

        // Inner bright cable
        const coreGeometry = new THREE.TubeGeometry(
            curve,
            40,
            0.025,
            6,
            false
        );

        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x8ffff0,
            transparent: true,
            opacity: 0.75
        });

        const coreCable = new THREE.Mesh(
            coreGeometry,
            coreMaterial
        );

        scene.add(coreCable);

        energyLines.push({
            glow: glowMaterial,
            core: coreMaterial
        });
    });

    // Update cable brightness
    function updateEnergy(time) {

        energyLines.forEach((line, index) => {

            const pulse = (Math.sin(time * 2 + index) + 1) / 2;

            line.glow.opacity = 0.10 + pulse * 0.18;
            line.core.opacity = 0.45 + pulse * 0.4;
        });
    }

    return updateEnergy;
}

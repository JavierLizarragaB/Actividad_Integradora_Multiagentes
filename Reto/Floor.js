import * as THREE from '../build/three.module.js';

"use strict";

class Floor extends THREE.Group {
    constructor(size = 100) {
        super();
        this.size = size;

        const geometry = new THREE.PlaneGeometry(size, size);
        const texture = new THREE.TextureLoader().load("./img/Asphalt_texture.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 100);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.FrontSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.receiveShadow = true;
        this.gridHelper = new THREE.GridHelper(size, 10, 0x101010, 0x101010);
        // CHILDREN
        this.add(this.mesh);
        this.add(this.gridHelper);
    }
    setVisible(value = true) {
        this.visible = value;
    }
    setWireframe(value = true) {
        this.material.wireframe = value;
    }
    setColor(color) {
        this.mesh.material.color.setHex(color);
    }
}

export {Floor as Floor};
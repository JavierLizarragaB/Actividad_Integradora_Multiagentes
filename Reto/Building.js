import * as THREE from 'https://unpkg.com/three/build/three.module.js';
"use strict";

class Building extends THREE.Group {
    constructor(x = 0, z = 0, front = 50, depth = 50, height = 10, color = 0xcc0000, wireColor = 0xffffff) {
        super();
        this.front = front;
        this.length = length;
        this.height = height;
        this.position.set(x, 0, z);
        this.color = color;
        this.wireColor = wireColor;
        this.doubleSide = false;
        this.visible = true;
        this.visibleWire = false;
        this.visibleTexture = true;
        this.rotate = false;
        const geometry = new THREE.BoxGeometry(front, height, depth);
        const material = new THREE.MeshBasicMaterial({
            color
        });
        const materialWire = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: wireColor
        });
        const materialTexture = [
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/roof.jpeg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            })
        ];
        this.texture = new THREE.Mesh(geometry, materialTexture);
        this.solid = new THREE.Mesh(geometry, material);
        this.wire = new THREE.Mesh(geometry, materialWire);
        // CHILDREN
        this.add(this.solid);
        this.add(this.wire);
        this.add(this.texture);
        this.setOnFloor();
    }
    setOnFloor() {
        this.solid.geometry.computeBoundingBox();
        const bBox = this.solid.geometry.boundingBox;
        this.position.y = -bBox.min.y;
    }
}

export {Building as Building};
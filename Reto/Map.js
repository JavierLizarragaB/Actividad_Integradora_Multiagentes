import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import {
    OBJLoader
} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/OBJLoader.js';
import {
    MTLLoader
} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/MTLLoader.js';

"use strict";

class Maper extends THREE.Group {
    constructor(scene, menu, x = 0, z = 0, size = 1) {
        super();
        this.solid;
        this.wire;
        this.texture;
        this.doubleSide = false;
        this.visibleTexture = true;
        this.visibleWire = false;
        this.color = 0xcc0000;
        this.wireColor = 0xffffff;
        this.position.set(x, 0, z);
        this.scale.set(size, size, size);
        //this.rotation.y = orientation;
        this.path = "./assets/"
        this.texturelessMap = "./assets/cruceColores2.obj";
        this.texturedMap = "cruceColores2.mtl";
        this.loadOBJModel(this.texturelessMap, menu);
        this.visible = false;
        scene.add(this);
    }
    loadOBJModel(objFileName, menu) {
        // instantiate a loader
        const loader = new OBJLoader();
        // load a resource
        let modelCity = this;
        loader.load(objFileName,
            function (object) {
                // SOLID
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: modelCity.color
                        });
                    }
                });
                modelCity.solid = object;
                // WIRE
                modelCity.wire = object.clone();
                modelCity.wire.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({
                            wireframe: true,
                            color: modelCity.wireColor
                        });
                    }
                });
                // CHILDREN
                modelCity.solid.castShadow = true;
                modelCity.solid.receiveShadow = true;
                modelCity.solid.visible = true;
                modelCity.wire.visible = true;
                modelCity.add(modelCity.solid);
                modelCity.add(modelCity.wire);
                modelCity.setOnFloor();
            }
        );
    }
    setColor(hexColor = 0x991313) {
        this.color = hexColor;
        this.solid.material.color.setHex(hexColor);
        this.wire.visible = true;
        this.solid.visible = true;
        this.texture.visible = false;
    }
    setWireColor(hexColor = 0xffffff) {
        this.wireColor = hexColor;
        this.wire.material.color.setHex(hexColor);
        this.wire.visible = true;
        this.solid.visible = true;
        this.texture.visible = false;
    }
    setOnFloor() {
        const bBox = new THREE.Box3();
        bBox.setFromObject(this.solid);
        this.position.y = -bBox.min.y;
    }
}

export {
    Maper as Maper
};
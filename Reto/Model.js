import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module.js";
import {OrbitControls} from "https://unpkg.com/three@0.119.0/examples/jsm/controls/OrbitControls.js";
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/OBJLoader.js';

"use strict";

class Model extends THREE.Group {
    constructor(scene, x = 0, z = 0, size = 1, objFileName = "./assets/cruceColores2.obj" //mtlFileName = "./assets/cruceColores2.mtl"
    ){
        super();
        this.color = 0xcc0000;
        this.wireColor = 0xffffff;
        this.position.set(x, 0, z);
        this.scale.set(size, size, size);
        //this.rotation.y = orientation;
        this.objFileName = objFileName;
        this.loadOBJModel(objFileName, scene);
    }
    loadOBJModel(objFileName, scene) {
        // instantiate a loader
        const loader = new OBJLoader();
        // load a resource
        let modelCity = this;
        loader.load(objFileName,
            // called when resource is loaded
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
                modelCity.add(modelCity.solid);
                modelCity.add(modelCity.wire);
                scene.add(modelCity);
                modelCity.setOnFloor();

            },
            // called when loading is in progresses
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened' + error);
            }
        );
    }

    setOnFloor() {
        const bBox = new THREE.Box3();
        bBox.setFromObject(this.solid);
        this.position.y = -bBox.min.y;
    }
}

export {Model as Model};
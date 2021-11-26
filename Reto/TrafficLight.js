import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module.js";
import {OrbitControls} from "https://unpkg.com/three@0.119.0/examples/jsm/controls/OrbitControls.js";
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/OBJLoader.js';

"use strict";

class Semafor extends THREE.Group {
    constructor(menu, scene, x = 0, z = 0, orientation = 0, corner = "XX", objFileName = "./assets/obj/semaforovergas.obj") {
        super();
        this.color = 0xcc0000;
        this.wireColor = 0xffffff;
        this.position.set(x, 0, z);
        this.rotation.y = orientation
        this.corner = corner;
        this.objFileName = objFileName;
        this.loadOBJModel(objFileName, menu, scene);
    }
    loadOBJModel(objFileName, menu, scene) {
        // instantiate a loader
        const loader = new OBJLoader();
        // load a resource
        let trafficLight = this;
        loader.load(objFileName,
            // called when resource is loaded
            function (object) {
                // SOLID
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({
                            color: trafficLight.color
                        });
                    }
                });
                trafficLight.solid = object;
                // WIRE
                trafficLight.wire = object.clone();
                trafficLight.wire.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({
                            wireframe: true,
                            color: trafficLight.wireColor
                        });
                    }
                });
                // CHILDREN
                trafficLight.add(trafficLight.solid);
                trafficLight.add(trafficLight.wire);
                scene.add(trafficLight);
                trafficLight.setOnFloor();

                // MODEL-MENU
                const guiModelMenu = menu.addFolder(trafficLight.corner + " Traffic Ligth Menu");
                // GUI-Model
                guiModelMenu.add(trafficLight, "visible").setValue(trafficLight.visible).name("Visible").listen().onChange(value => {});
                guiModelMenu.add(trafficLight.solid, "visible").setValue(trafficLight.solid.visible).name("Wireframe").listen().onChange(value => {});
                guiModelMenu.addColor(trafficLight, "color").name("Color").setValue(trafficLight.color).listen().onChange(value => trafficLight.setColor(value));
                guiModelMenu.addColor(trafficLight, "wireColor").name("Wire Color").setValue(trafficLight.wireColor).listen().onChange(value => trafficLight.setWireColor(value));
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
    setColor(hexColor) {
        this.color = hexColor;
        this.solid.traverse(function (child) {
            if (child.isMesh) {
                child.material.color.setHex(hexColor);
            }
        });
    }
    setWireColor(hexColor) {
        this.wireColor = hexColor;
        this.wire.traverse(function (child) {
            if (child.isMesh) {
                child.material.color.setHex(hexColor);
            }
        });
    }
    setOnFloor() {
        const bBox = new THREE.Box3();
        bBox.setFromObject(this.solid);
        this.position.y = -bBox.min.y;
    }
}

export {Semafor as Semafor};
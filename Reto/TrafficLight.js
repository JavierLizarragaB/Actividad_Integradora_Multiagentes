import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/OBJLoader.js';
import {SpotLight} from './Lights.js';

"use strict";

class Semafor extends THREE.LOD {
    constructor(menu, scene, x = 0, z = 0, orientation = 0, corner = "XX") {
        super();
        this.solid = [];
        this.wire = [];
        this.color = 0xcc0000;
        this.wireframe = true;
        this.wireColor = 0xffffff;
        this.position.set(x, 0, z);
        this.rotation.y = orientation
        this.corner = corner;
        this.light = new SpotLight();
        this.lowPoli = "./assets/SemaforoLowPoli.obj";
        this.highPoli = "./assets/trafficlight/trafficlight.obj";
        this.loadOBJModel(this.lowPoli, 300, 1);
        this.loadOBJModel(this.highPoli, 0, 2, 1, true);
        scene.add(this);

        const guiModelMenu = menu.addFolder(this.corner + " Traffic Ligth Menu");
        guiModelMenu.add(this, "visible").setValue(this.visible).name("Visible").listen().onChange(value => {});
        guiModelMenu.add(this, "wireframe").setValue(this.wireframe).name("Wireframe").listen().onChange(value => {});
        guiModelMenu.add(this.light, "visible").setValue(this.light.visible).name("Light").listen().onChange(value => {});

    }
    loadOBJModel(objFileName, zoom, scael, index = 0, rotate = false) {
        const loader = new OBJLoader();
        let trafficLight = this;
        loader.load(objFileName,
            function (object) { // called when resource is loaded
                // SOLID
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: trafficLight.color
                        });
                    }
                });
                trafficLight.solid.push(object);
                // WIRE
                trafficLight.wire.push(object.clone());
                trafficLight.wire[index].traverse(child => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({
                            wireframe: true,
                            color: trafficLight.wireColor
                        });
                    }
                });
                // CHILDREN
                trafficLight.solid[index].castShadow = true;
                trafficLight.wire[index].castShadow = true;
                trafficLight.solid[index].receiveShadow = true;
                if(index == 0){
                    trafficLight.solid[index].scale.set(scael,1.5*scael,scael);
                    trafficLight.wire[index].scale.set(scael,1.5*scael,scael);
                }
                if(rotate){
                    trafficLight.solid[index].rotation.y = (- 90) * Math.PI / 180;
                    trafficLight.wire[index].rotation.y = (- 90) * Math.PI / 180;
                }
                let trafficGroup = new THREE.LOD();
                trafficGroup.add(trafficLight.solid[index]);
                trafficGroup.add(trafficLight.wire[index]);
                trafficGroup.add(trafficLight.light);
                trafficLight.addLevel(trafficGroup, zoom);
                trafficLight.setOnFloor();
            },
            function (xhr) { // called when loading is in progresses
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) { // called when loading has errors
                console.log('An error happened' + error);
            }
        );
    }
    setColor(hexColor) {
        this.color = hexColor;
        this.light.setColor(hexColor);
        this.solid.forEach(solid => {
            solid.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(hexColor);
                }
            })
        });
    }
    setWireColor(hexColor) {
        this.wireColor = hexColor;
        this.wire.forEach(wire => {
            wire.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(hexColor);
                }
            });
        });
    }
    setOnFloor() {
        const bBox = new THREE.Box3();
        bBox.setFromObject(this.solid[0]);
        this.position.y = -bBox.min.y;
        this.light.setPosition(this.position.x,bBox.max.y+20,this.position.z);
    }
}

export {Semafor as Semafor};
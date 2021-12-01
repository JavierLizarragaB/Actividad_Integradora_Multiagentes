import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/OBJLoader.js';

"use strict";

class Car extends THREE.Group {
    constructor(carId, menu, scene, camera, x = 0, z = 0, dir = 180, color = 0xcc0000, objFileName = "./assets/obj/car.obj") {
        super();
        this.carId = carId;
        this.x = x;
        this.z = z;
        this.theta = dir-90;
        this.position.set(x, 0, z);
        this.color = color;
        this.wireColor = 0xffffff;
        this.doubleSide = false;
        this.rotate = false;
        this.objFileName = objFileName;
        this.loadOBJModel(objFileName, menu, scene, camera);
        this.setDirection(dir);
    }
    loadOBJModel(objFileName, menu, scene, camera) {
        // instantiate a loader
        const loader = new OBJLoader();
        // load a resource
        let thisIndex = this.carId;
        let thisAutomobil = this;
        loader.load(objFileName,
            // called when resource is loaded
            function (object) {
                // SOLID
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: thisAutomobil.color
                        });
                    }
                });
                thisAutomobil.solid = object;
                // WIRE
                thisAutomobil.wire = object.clone();
                thisAutomobil.wire.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({
                            wireframe: true,
                            color: thisAutomobil.wireColor
                        });
                    }
                });
                //model.rotation.y = Math.PI;
                thisAutomobil.scale.set(2, 2, 2);
                // CHILDREN
                thisAutomobil.solid.castShadow = true;
                thisAutomobil.solid.receiveShadow = true;
                thisAutomobil.add(thisAutomobil.solid);
                thisAutomobil.add(thisAutomobil.wire);
                scene.add(thisAutomobil);
                thisAutomobil.setOnFloor();

                // MODEL-MENU
                const guiModelMenu = menu.addFolder("SportCar " + thisIndex + " Menu");
                // GUI-Model
                guiModelMenu.add(thisAutomobil, "visible").setValue(thisAutomobil.visible).name("Visible").listen().onChange(value => {});
                guiModelMenu.add(thisAutomobil.solid, "visible").setValue(thisAutomobil.solid.visible).name("Wireframe").listen().onChange(value => {});
                guiModelMenu.add(thisAutomobil, "doubleSide").setValue(thisAutomobil.doubleSide).name("Double Side").listen().onChange(value => thisAutomobil.setDoubleSide(value));
                guiModelMenu.addColor(thisAutomobil, "color").name("Color").setValue(thisAutomobil.color).listen().onChange(value => thisAutomobil.setColor(value));
                guiModelMenu.addColor(thisAutomobil, "wireColor").name("Wire Color").setValue(thisAutomobil.wireColor).listen().onChange(value => thisAutomobil.setWireColor(value));
                guiModelMenu.add(camera, "internalView").setValue(camera.internalView).name("Internal View").listen().onChange((value) => camera.setInternalView(thisAutomobil));
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
    setDoubleSide(value) {
        this.doubleSide = value;
        this.solid.traverse(function (child) {
            if (child.isMesh) {
                if (value) {
                    child.material.side = THREE.DoubleSide;
                } else {
                    child.material.side = THREE.FrontSide;
                }
            }
        });
    }
    setOnFloor() {
        const bBox = new THREE.Box3();
        bBox.setFromObject(this.solid);
        this.position.y = -bBox.min.y;
    }
    setPosition(x, z) {
        this.x = x;
        this.z = z;
        this.position.set(x, 0, z);
    }
    setDirection(dir) {
        this.theta = dir-90;
        this.rotation.y = (dir-90) * Math.PI / 180;
    }
}

export {Car as Car};
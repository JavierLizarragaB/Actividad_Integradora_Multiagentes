import * as THREE from './build/three.module.js';
import {OBJLoader} from './jsm/loaders/OBJLoader.js';

"use strict";

class Car extends THREE.LOD {
    constructor(carId, menu, scene, camera, x = 0, z = 0, dir = 180, color = 0xcc0000) {
        super();
        this.carId = carId;
        this.x = x;
        this.z = z;
        this.theta = dir - 90;
        this.position.set(x, 0, z);
        this.color = color;
        this.wireframe = true;
        this.wireColor = 0xffffff;
        this.doubleSide = false;
        this.rotate = false;
        this.lowPoli = "./assets/car.obj";
        this.midPoli = "./assets/coche.obj";
        this.highPoli = "./assets/sportsCar.obj";
        this.loadOBJModel(this.lowPoli, 350, 1.4);
        this.loadOBJModel(this.midPoli, 50, 3.1);
        this.loadOBJModel(this.highPoli, 0, 3.1);
        scene.add(this);
        this.setDirection(dir);

        const guiModelMenu = menu.addFolder("Car " + this.carId);
        guiModelMenu.add(this, "visible").setValue(this.visible).name("Visible").listen().onChange(value => {});
        guiModelMenu.add(this, "wireframe").name("Wireframe").setValue(this.wireColor).listen().onChange(value => {
            this.setWireFrame(value)
        });
        guiModelMenu.add(this, "doubleSide").name("Double Side").setValue(this.doubleSide).listen().onChange(value => this.setDoubleSide(value));
        guiModelMenu.addColor(this, "color").name("Color").setValue(this.color).listen().onChange(value => this.setColor(value));
        guiModelMenu.addColor(this, "wireColor").name("Wire Color").setValue(this.wireColor).listen().onChange(value => this.setWireColor(value));
        guiModelMenu.add(camera, "internalView").name("Internal View").setValue(camera.internalView).listen().onChange((value) => camera.setInternalView(this));
    }
    loadOBJModel(objFileName, zoom, scale) {
        const loader = new OBJLoader();
        let thisAutomobil = this;
        loader.load(objFileName,
            function (object) {// called when resource is loaded
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
                thisAutomobil.solid.scale.set(scale, scale, scale);
                thisAutomobil.wire.scale.set(scale, scale, scale);
                
                thisAutomobil.solid.castShadow = true;
                thisAutomobil.solid.receiveShadow = true;
                let carGroup = new THREE.Group();
                carGroup.add(thisAutomobil.solid);
                carGroup.add(thisAutomobil.wire);
                thisAutomobil.addLevel(carGroup, zoom);
                thisAutomobil.setOnFloor();
            },
            function (xhr) { // called when loading is in progresses
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) { // called when loading has errors
                console.log('An error happened' + error);
            }
        );
    }
    setWireFrame(value) {
        this.levels.forEach(level => {
            let obj = level.object.children[0];
            obj.visible = value;
        });
    }
    setColor(hexColor) {
        this.color = hexColor;
        this.levels.forEach(level => {
            let obj = level.object.children[0];
            obj.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(hexColor);
                }
            });
        });
    }
    setWireColor(hexColor) {
        this.wireColor = hexColor;
        this.levels.forEach(level => {
            let obj = level.object.children[1];
            obj.wire.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(hexColor);
                }
            });
        });
    }
    setDoubleSide(value) {
        this.doubleSide = value;
        this.levels.forEach(level => {
            let obj = level.object.children[0];
            obj.traverse(function (child) {
                if (child.isMesh) {
                    if (value) {
                        child.material.side = THREE.DoubleSide;
                    } else {
                        child.material.side = THREE.FrontSide;
                    }
                }
            });
        });
    }
    setOnFloor() {
        const bBox = new THREE.Box3();
        this.levels.forEach(level => {
            let obj = level.object.children[0];
            bBox.setFromObject(obj);
            this.position.y = -bBox.min.y;
        });
    }
    setPosition(x, z) {
        if(this.theta == 0) x -= 9;
        if(this.theta == 90) z += 5;
        if(this.theta == 180) x += 1;
        if(this.theta == 270) x -= 5;
        this.x = x;
        this.z = z;
        this.position.set(x, 0, z);
    }
    setDirection(dir) {
        this.theta = dir - 90;
        this.rotation.y = (dir - 90) * Math.PI / 180;
    }
}

export {
    Car as Car
};
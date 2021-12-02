import * as THREE from './build/three.module.js';
import {
    OBJLoader
} from './jsm/loaders/OBJLoader.js';

"use strict";

class Car extends THREE.LOD {
    constructor(carId, menu, scene, camera, x = 0, z = 0, dir = 180, color = 0xcc0000) {
        super();
        this.carId = carId;
        this.solid = [];
        this.wire = [];
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
        this.loadOBJModel(this.lowPoli, 350, 1.4, 0);
        this.loadOBJModel(this.midPoli, 50, 3.1, 1);
        this.loadOBJModel(this.highPoli, 0, 3.1, 2);
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
    loadOBJModel(objFileName, zoom, scale, index) {
        const loader = new OBJLoader();
        let thisAutomobil = this;
        loader.load(objFileName,
            function (object) { // called when resource is loaded
                // SOLID
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshPhongMaterial({
                            color: thisAutomobil.color
                        });
                    }
                });
                thisAutomobil.solid.push(object);
                // WIRE
                thisAutomobil.wire.push(object.clone());
                thisAutomobil.wire[index].traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({
                            wireframe: true,
                            color: thisAutomobil.wireColor
                        });
                    }
                });
                thisAutomobil.solid[index].scale.set(scale, scale, scale);
                thisAutomobil.wire[index].scale.set(scale, scale, scale);

                thisAutomobil.solid[index].castShadow = true;
                thisAutomobil.solid[index].receiveShadow = true;
                let carGroup = new THREE.Group();
                carGroup.add(thisAutomobil.solid[index]);
                carGroup.add(thisAutomobil.wire[index]);
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
        this.solid.forEach(level => {
            level.visible = value;
        });
    }
    setColor(hexColor) {
        this.color = hexColor;
        this.solid.forEach(object => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(hexColor);
                }
            });
        });
    }
    setWireColor(hexColor) {
        this.wireColor = hexColor;
        this.wire.forEach(object => {
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material.color.setHex(hexColor);
                }
            });
        });
    }
    setDoubleSide(value) {
        this.doubleSide = value;
        this.solid.forEach(level => {
            if (value) {
                level.material.side = THREE.DoubleSide;
            } else {
                level.material.side = THREE.FrontSide;
            }
        });
    }
    setOnFloor() {
        const bBox = new THREE.Box3();
        this.solid.forEach(level => {
            bBox.setFromObject(level);
            this.position.y = -bBox.min.y;
        });
    }
    setPosition(x, z) {
        if (this.theta == 0) x -= 9;
        if (this.theta == 90) z += 5;
        if (this.theta == 180) x += 1;
        if (this.theta == 270) x -= 5;
        this.x = x;
        this.z = z;
        this.position.set(x, 0, z);
    }
    setDirection(dir) {
        // 0 -> Izquierda
        // 90 -> Abajo
        // 180 -> Derecha
        // 270 -> Arriba
        this.theta = dir - 90;
        if (this.theta == -90 || this.theta == 90) this.theta += 180;
        this.rotation.y = (this.theta) * Math.PI / 180;
    }
}

export {
    Car as Car
};
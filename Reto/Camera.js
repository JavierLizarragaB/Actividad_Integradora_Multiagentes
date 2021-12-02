import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import {OrbitControls} from "https://unpkg.com/three@0.119.0/examples/jsm/controls/OrbitControls.js";

"use strict";

class Camera extends THREE.PerspectiveCamera {
    constructor(renderer, fov = 60, aspect = window.innerWidth / window.innerHeight, near = 0.01, far = 10000.0) {
        super(fov, aspect, near, far);
        this.orbitControls = new OrbitControls(this, renderer.domElement);
        this.orbitControls.update();
        this.topView = false;
        this.frontView = false;
        this.sideView = false;
        this.internalView = false;
        this.carTarget;
        this.perspectiveView = false;
        this.autoRotate = false;
    }
    setAutoRotate(value) {
        this.autoRotate = value;
        this.orbitControls.autoRotate = value;
        this.orbitControls.update();
    }
    setPerspective(x = -100, y = 100, z = 300) {
        this.topView = false;
        this.frontView = false;
        this.sideView = false;
        this.internalView = false;
        this.perspectiveView = true;

        this.position.set(x, y, z); // Position
        this.orbitControls.target = new THREE.Vector3(0, 0, 0); // Direction
        this.up.set(0, 1, 0); // Rotation
        this.orbitControls.update();
    }
    setTopView() {
        this.topView = true;
        this.frontView = false;
        this.sideView = false;
        this.internalView = false;
        this.perspectiveView = false;

        this.position.set(0, 150, 0);
        this.orbitControls.target = new THREE.Vector3(0, 0, 0);
        this.up.set(-1, 0, 0);
        this.orbitControls.update();
    }
    setFrontView() {
        this.topView = false;
        this.frontView = true;
        this.sideView = false;
        this.internalView = false;
        this.perspectiveView = false;

        this.position.set(0, 2, 300);
        this.orbitControls.target = new THREE.Vector3(0, 0, 0);
        this.up.set(0, 1, 0);
        this.orbitControls.update();
    }
    setSideView() {
        this.topView = false;
        this.frontView = false;
        this.sideView = true;
        this.internalView = false;
        this.perspectiveView = false;

        this.position.set(300, 2, 0);
        this.orbitControls.target = new THREE.Vector3(0, 0, 0);
        this.up.set(0, 1, 0);
        this.orbitControls.update();
    }
    setInternalView(carrito) {
        this.carTarget = carrito;
        this.topView = false;
        this.frontView = false;
        this.sideView = false;
        this.internalView = true;
        this.perspectiveView = false;

        this.position.set(carrito.position.x, carrito.position.y + 5, carrito.position.z);
        this.orbitControls.target = new THREE.Vector3(carrito.position.x, carrito.position.y + 5, carrito.position.z + Math.cos(carrito.theta));
        this.up.set(0, 1, 0);
        this.orbitControls.update();
    }
}

export {Camera as Camera};
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module.js";

import {Camera} from './Camera.js';
import {Car} from './Car.js';
import {Scenary} from './Scenary.js';
import {View} from './View.js';

"use strict";

let renderer, scene, stats, data, scenary;
let camera;
let gui, sceneMenu, cameraMenu, buildingMenu, trafficLightMenu, vehicleMenu;
let frameIndex = 0;
let automobiles = [];

function init(event) {
    gui = new dat.GUI();
    sceneMenu = gui.addFolder("Scene Menu");
    cameraMenu = gui.addFolder("Camera");
    buildingMenu = gui.addFolder("Buildings");
    trafficLightMenu = gui.addFolder("Traffic Lights");
    vehicleMenu = gui.addFolder("Vehicles");

    renderer = new View();
    camera = [new Camera(cameraMenu, renderer)];
    camera[0].setTopView();
    
    scene = new THREE.Scene();
    scenary = new Scenary(trafficLightMenu, buildingMenu, sceneMenu, scene);
    scene.add(scenary);
    
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    readTextFile("./simul_data.json", text => {
        data = JSON.parse(text);
        console.log(data);
        data.cars.forEach(vehicle => {
            const thisCar = new Car(vehicle.id, vehicleMenu, scene, camera[0], vehicle.x, vehicle.z, vehicle.dir);
            thisCar.name = vehicle.id;
            automobiles.push(thisCar);
        });
        renderLoop();
    });

}
function renderLoop() {
    stats.begin();
    renderer.views[0].render(scene, camera[0]); // DRAW THE SCENE GRAPH
    updateScene();
    stats.end();
    requestAnimationFrame(renderLoop);
}
function updateScene() {
    data.frames[frameIndex].cars.forEach(vehicle => {
        let car = automobiles[vehicle.id];
        car.setPosition(vehicle.x, vehicle.z);
        car.setDirection(vehicle.dir);
    });
    scenary.setTrafficLights(data.frames[frameIndex]);
    if (frameIndex < data.frames.length - 1) frameIndex++;
    if (camera[0].autoRotate) camera[0].orbitControls.update();
    if(camera[0].internalView) camera[0].setInternalView(camera[0].carTarget);
}
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
window.addEventListener("resize", () => {
    camera[0].aspect = window.innerWidth / window.innerHeight;
    camera[0].updateProjectionMatrix();
    renderer.reset();
}, false);
document.addEventListener("DOMContentLoaded", init);
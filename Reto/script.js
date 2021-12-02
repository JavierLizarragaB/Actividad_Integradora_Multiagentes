import * as THREE from './build/three.module.js';
import Stats from "./jsm/libs/stats.module.js";

import {
    Camera
} from './Camera.js';
import {
    Car
} from './Car.js';
import {
    Scenary
} from './Scenary.js';
import {
    View
} from './View.js';
import {
    DirectionalLight
} from './Lights.js';

"use strict";

let renderer, scene, stats, data, scenary;
let camera;
let pause = false;
let gui, sceneMenu, buildingMenu, trafficLightMenu, vehicleMenu;
let frameIndex = 0;
let automobiles = [];

function init(event) {
    gui = new dat.GUI();
    sceneMenu = gui.addFolder("Scene Menu");
    buildingMenu = gui.addFolder("Buildings");
    trafficLightMenu = gui.addFolder("Traffic Lights");
    vehicleMenu = gui.addFolder("Vehicles");

    renderer = new View();
    camera = [new Camera(renderer),new Camera(renderer),new Camera(renderer),new Camera(renderer)];
    camera[0].setTopView();
    camera[1].setFrontView();
    camera[2].setPerspective();
    camera[3].setSideView();

    sceneMenu.add(renderer, "viewports").setValue(renderer.viewports).min(1).max(4).step(1).name("Viewport").listen().onChange((value) => renderer.setViews(value));

    scene = new THREE.Scene();
    scenary = new Scenary(trafficLightMenu, buildingMenu, sceneMenu, scene);
    scene.add(scenary);
    const light = new DirectionalLight();
    scene.add(light);

    const lightMenu = gui.addFolder("DirectionalLight Menu");
    lightMenu.add(light, "visible").name("On").setValue(light.visible).listen().onChange(function (value) {});
    lightMenu.add(light.position, "x").name("x").min(-50).max(50).step(0.1).setValue(0).listen().onChange(function (value) {});
    lightMenu.addColor(light, "strColor").name("Color").setValue(light.strColor).listen().onChange(function (value) {
        light.setColor(value);
    });
    lightMenu.add(light, "intensity").name("Intensity").min(0).max(1).step(0.1).setValue(light.intensity).listen().onChange(function (value) {});

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
    updateScene();
    stats.end();
    requestAnimationFrame(renderLoop);
}

function updateScene() {
    renderer.renderViews(scene, camera);
    // Move Cars
    data.frames[frameIndex].cars.forEach(vehicle => {
        let car = automobiles[vehicle.id];
        car.setPosition(vehicle.x, vehicle.z);
        car.setDirection(vehicle.dir);
    });
    // Update Traffic Lights
    scenary.setTrafficLights(data.frames[frameIndex]);
    if (!pause && frameIndex < data.frames.length - 1) frameIndex++;
    if (camera[0].autoRotate) camera[0].orbitControls.update();
    if (camera[0].internalView) camera[0].setInternalView(camera[0].carTarget);
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
    renderer.setViews(1);
}, false);
document.addEventListener("DOMContentLoaded", init);
document.addEventListener('keypress', key => {
    if(key.key == "e"){
        camera[0].setTopView();
        camera[1].setFrontView();
        camera[2].setPerspective();
        camera[3].setSideView();
        renderer.setViews(1);
    }
    else if(key.key == "p")
        frameIndex = 0;
    else if(key.key == "1")
        renderer.viewports = 1;
    else if(key.key == "2")
        renderer.viewports = 2;
    else if(key.key == "3")
        renderer.viewports = 3;
    else if(key.key == "4")
        renderer.viewports = 4;
    else if(key.key == ' ' || key.key == 'k') // Space
        pause = !pause;
    else if(key.key == 'j') // Left
        frameIndex = Math.max(0, frameIndex-1);
    else if(key.key == 'l') // Right
        frameIndex = Math.min(data.frames.length, frameIndex+1);
});
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module.js";
import {OrbitControls} from "https://unpkg.com/three@0.119.0/examples/jsm/controls/OrbitControls.js";
import {OBJLoader} from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/OBJLoader.js';

"use strict";

let renderer, scene, stats, data, scenary;
let camera, orbitControls;
let gui, sceneMenu, cameraMenu, buildingMenu, trafficLightMenu, vehicleMenu;
let frameIndex = 0;
let automobiles = [];
let firstTime = true, carsLoaded = 0;
//* --- Init del Neto
function init(event) {
    // RENDERER ENGINE
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0, 0, 0));
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // GUI
    gui = new dat.GUI();
    sceneMenu = gui.addFolder("Scene Menu");
    cameraMenu = gui.addFolder("Camera");
    buildingMenu = gui.addFolder("Buildings");
    trafficLightMenu = gui.addFolder("Traffic Lights");
    vehicleMenu = gui.addFolder("Vehicles");
    
    // Scene
    scene = new THREE.Scene();
    scenary = new Scenary();
    scene.add(scenary);

    // CAMERA (PERSPECTIVE)
    camera = new Camera();
    camera.setTopView();
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.update();

    // SETUP STATS
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    readTextFile("./simul_data.json", text => {
        data = JSON.parse(text);
        console.log(data);
        data.cars.forEach(vehicle => {
            const thisCar = new SportsCar(vehicle.id, vehicle.x, vehicle.z, vehicle.dir);
            thisCar.name = vehicle.id;
            automobiles.push(thisCar);
        });
        renderLoop();
    });

}
/* - - - */
function renderLoop() {
        stats.begin();
        renderer.render(scene, camera); // DRAW THE SCENE GRAPH
        updateScene();
        stats.end();
        requestAnimationFrame(renderLoop);
}
function updateScene() {
    console.log(carsLoaded+"/"+data.cars.length);
        data.frames[frameIndex].cars.forEach(vehicle => {
        let car = automobiles[vehicle.id];
        car.setPosition(vehicle.x, vehicle.z);
        car.setDirection(vehicle.dir);
        });
        if (frameIndex < data.frames.length - 1) frameIndex++;
        if (camera.autoRotate) camera.orbitControls.update();
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
document.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
class Camera extends THREE.PerspectiveCamera {
    constructor(fov = 60, aspect = window.innerWidth / window.innerHeight, near = 0.01, far = 10000.0) {
        super(fov, aspect, near, far);
        this.orbitControls = new OrbitControls(this, renderer.domElement);
        this.orbitControls.update();
        this.topView = true;
        this.frontView = false;
        this.sideView = false;
        this.internalView = false;
        this.perspectiveView = false;
        this.autoRotate = false;

        cameraMenu.add(this, "autoRotate").setValue(this.autoRotate).name("Auto Rotate").listen().onChange((value) => this.setAutoRotate(value));
        cameraMenu.add(this, "topView").setValue(this.topView).name("Top View").listen().onChange((value) => this.setTopView());
        cameraMenu.add(this, "frontView").setValue(this.frontView).name("Front View").listen().onChange((value) => this.setFrontView());
        cameraMenu.add(this, "sideView").setValue(this.sideView).name("Side View").listen().onChange((value) => this.setSideView());
        cameraMenu.add(this, "perspectiveView").setValue(this.perspectiveView).name("Perspective View").listen().onChange((value) => this.setPerspective());
        /* - */
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

        this.position.set(0, 1000, 0);
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
    setInternalView(model) {
        this.topView = false;
        this.frontView = false;
        this.sideView = false;
        this.internalView = true;
        this.perspectiveView = false;

        this.position.set(model.position.x, model.position.y + 1.5, model.position.z);
        this.orbitControls.target = new THREE.Vector3(0, 0, 0);
        this.up.set(0, 1, 0);
        this.orbitControls.update();
    }
}
class Axes extends THREE.AxesHelper {
    constructor(size = 10, visible = true) {
        super(size);
        this.size = size;
        this.visible = visible;
        this.position.set(0, 1, 0);
        //*
        sceneMenu.add(this, "visible").setValue(this.visible).name("World Axes").listen().onChange(value => this.setVisible(value));
        /* - */
    }
    setVisible(value) {
        this.visible = value;
    }
}
class Floor extends THREE.Group {
    constructor(size = 100) {
        super();
        this.size = size;
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({
            color: 0x808080
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.gridHelper = new THREE.GridHelper(size, 10, 0xff0000, 0x000000);
        // CHILDREN
        this.add(this.mesh);
        this.add(this.gridHelper);
    }
    setVisible(value = true) {
        this.visible = value;
    }
    setWireframe(value = true) {
        this.material.wireframe = value;
    }
    setColor(color) {
        this.mesh.material.color.setHex(color);
    }
}
class SportsCar extends THREE.Group {
    constructor(carId, x = 0, z = 0, dir = 180, objFileName = "./assets/obj/car.obj") {
        super();
        this.carId = carId;
        this.x = x;
        this.z = z;
        this.theta = dir;
        this.position.set(x, 0, z);
        this.color = 0xcc0000;
        this.wireColor = 0xffffff;
        this.doubleSide = false;
        this.rotate = false;
        this.objFileName = objFileName;
        this.loadOBJModel(objFileName);
        this.setDirection(dir);
    }
    loadOBJModel(objFileName) {
        // instantiate a loader
        const loader = new OBJLoader();
        // load a resource
        let thisIndex = this.carId;
        loader.load(objFileName,
            // called when resource is loaded
            function (object) {
                // SOLID
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({
                            color: automobiles[thisIndex].color
                        });
                    }
                });
                automobiles[thisIndex].solid = object;
                // WIRE
                automobiles[thisIndex].wire = object.clone();
                automobiles[thisIndex].wire.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = new THREE.MeshBasicMaterial({
                            wireframe: true,
                            color: automobiles[thisIndex].wireColor
                        });
                    }
                });
                //model.rotation.y = Math.PI;
                automobiles[thisIndex].scale.set(2, 2, 2);
                // CHILDREN
                automobiles[thisIndex].add(automobiles[thisIndex].solid);
                automobiles[thisIndex].add(automobiles[thisIndex].wire);
                scene.add(automobiles[thisIndex]);
                automobiles[thisIndex].setOnFloor();

                // MODEL-MENU
                const guiModelMenu = vehicleMenu.addFolder("SportCar " + thisIndex + " Menu");
                // GUI-Model
                guiModelMenu.add(automobiles[thisIndex], "visible").setValue(automobiles[thisIndex].visible).name("Visible").listen().onChange(value => {});
                guiModelMenu.add(automobiles[thisIndex].solid, "visible").setValue(automobiles[thisIndex].solid.visible).name("Wireframe").listen().onChange(value => {});
                guiModelMenu.add(automobiles[thisIndex], "doubleSide").setValue(automobiles[thisIndex].doubleSide).name("Double Side").listen().onChange(value => automobiles[thisIndex].setDoubleSide(value));
                guiModelMenu.addColor(automobiles[thisIndex], "color").name("Color").setValue(automobiles[thisIndex].color).listen().onChange(value => automobiles[thisIndex].setColor(value));
                guiModelMenu.addColor(automobiles[thisIndex], "wireColor").name("Wire Color").setValue(automobiles[thisIndex].wireColor).listen().onChange(value => automobiles[thisIndex].setWireColor(value));
                guiModelMenu.add(camera, "internalView").setValue(camera.internalView).name("Internal View").listen().onChange((value) => camera.setInternalView(automobiles[thisIndex]));
                carsLoaded++;
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
        this.theta = dir;
        this.rotation.y = dir * Math.PI / 180;
    }
}
class Semafor extends THREE.Group {
    constructor(x = 0, z = 0, orientation = 0, corner = "XX", objFileName = "./assets/obj/semaforovergas.obj") {
        super();
        this.color = 0xcc0000;
        this.wireColor = 0xffffff;
        this.position.set(x, 0, z);
        this.rotation.y = orientation
        this.corner = corner;
        this.objFileName = objFileName;
        this.loadOBJModel(objFileName);
    }
    loadOBJModel(objFileName) {
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
                const guiModelMenu = trafficLightMenu.addFolder(trafficLight.corner + " Traffic Ligth Menu");
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
class Building extends THREE.Group {
    constructor(x = 0, z = 0, front = 50, depth = 50, height = 10, color = 0xcc0000, wireColor = 0xffffff) {
        super();
        this.front = front;
        this.length = length;
        this.height = height;
        this.position.set(x, 0, z);
        this.color = color;
        this.wireColor = wireColor;
        this.doubleSide = false;
        this.visible = true;
        this.visibleWire = false;
        this.visibleTexture = true;
        this.rotate = false;
        const geometry = new THREE.BoxGeometry(front, height, depth);
        const material = new THREE.MeshBasicMaterial({
            color
        });
        const materialWire = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: wireColor
        });
        const materialTexture = [
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/roof.jpeg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/edificio.jpg"),
                side: THREE.FrontSide
            })
        ];
        this.texture = new THREE.Mesh(geometry, materialTexture);
        this.solid = new THREE.Mesh(geometry, material);
        this.wire = new THREE.Mesh(geometry, materialWire);
        // CHILDREN
        this.add(this.solid);
        this.add(this.wire);
        this.add(this.texture);
        this.setOnFloor();
    }
    setOnFloor() {
        this.solid.geometry.computeBoundingBox();
        const bBox = this.solid.geometry.boundingBox;
        this.position.y = -bBox.min.y;
    }
}
class Scenary extends THREE.Group {
    constructor(size = 1000) {
        super();
        this.axes = new Axes(size);
        this.floor = new Floor(size);
        this.buildings = [];
        this.semafors = [];
        this.areVisible = true;
        this.wire = false;
        this.doubleSide = false;
        this.visibleTexture = true;
        this.color = 0x991515;
        this.wireColor = 0xffffff;
        //SE
        this.buildings.push(new Building(56, 56, 50, 50, 50));
        this.buildings.push(new Building(56, 110, 50, 50, 10));
        this.buildings.push(new Building(56, 165, 50, 50, 20));
        this.buildings.push(new Building(56, 220, 50, 50, 80));
        this.buildings.push(new Building(56, 275, 50, 50, 40));

        this.buildings.push(new Building(110, 56, 50, 50, 10));
        this.buildings.push(new Building(165, 56, 50, 50, 30));
        this.buildings.push(new Building(220, 56, 50, 50, 50));
        this.buildings.push(new Building(275, 56, 50, 50, 10));
        this.buildings.push(new Building(332, 56, 50, 50, 40));

        this.semafors.push(new Semafor(-32, -18, -0.05, "SE"));

        // SW (Tec)
        this.buildings.push(new Building(-56, 56, 50, 50, 5));
        this.buildings.push(new Building(-56, 110, 50, 50, 5));
        this.buildings.push(new Building(-56, 165, 50, 50, 5));
        this.buildings.push(new Building(-56, 220, 50, 50, 5));

        this.buildings.push(new Building(-56, 56, 50, 50, 10));
        this.buildings.push(new Building(-110, 56, 50, 50, 20));
        this.buildings.push(new Building(-165, 56, 50, 50, 20));
        this.buildings.push(new Building(-225, 56, 50, 50, 20));
        this.buildings.push(new Building(-280, 56, 50, 50, 20));

        this.semafors.push(new Semafor(-18, 32, Math.PI / 2 - 0.05, "SW"));

        // NE
        this.buildings.push(new Building(56, -56, 50, 50, 10));
        this.buildings.push(new Building(110, -56, 50, 50, 20));
        this.buildings.push(new Building(165, -56, 50, 50, 20));
        this.buildings.push(new Building(225, -56, 50, 50, 20));
        this.buildings.push(new Building(280, -56, 50, 50, 20));

        this.buildings.push(new Building(56, -110, 50, 50, 10));
        this.buildings.push(new Building(56, -165, 50, 50, 20));
        this.buildings.push(new Building(56, -220, 50, 50, 20));
        this.buildings.push(new Building(56, -275, 50, 50, 20));
        this.buildings.push(new Building(56, -330, 50, 50, 20));

        this.semafors.push(new Semafor(32, 18, Math.PI - 0.05, "NE"));

        // NW
        this.buildings.push(new Building(-56, -56, 50, 50, 10));
        this.buildings.push(new Building(-110, -56, 50, 50, 20));
        this.buildings.push(new Building(-165, -56, 50, 50, 20));
        this.buildings.push(new Building(-225, -56, 50, 50, 20));
        this.buildings.push(new Building(-280, -56, 50, 50, 20));

        this.buildings.push(new Building(-56, -110, 50, 50, 10));
        this.buildings.push(new Building(-56, -165, 50, 50, 20));
        this.buildings.push(new Building(-56, -220, 50, 50, 20));
        this.buildings.push(new Building(-56, -275, 50, 50, 20));
        this.buildings.push(new Building(-56, -330, 50, 50, 20));

        this.semafors.push(new Semafor(18, -32, -Math.PI / 2 - 0.05, "NW"));

        // CHILDREN
        this.add(this.axes);
        this.add(this.floor);
        for (let i = 0; i < this.buildings.length; i++) {
            this.add(this.buildings[i]);
        }
        for (let i = 0; i < this.semafors.length; i++) {
            this.add(this.semafors[i]);
        }

        buildingMenu.add(this, "areVisible").setValue(this.areVisible).name("Visible").listen().onChange(value => this.setVisible(value));
        buildingMenu.add(this, "wire").setValue(this.wire).name("Wireframe").listen().onChange(value => this.setVisibleWire(value));
        buildingMenu.add(this, "doubleSide").setValue(this.doubleSide).name("Double Side").listen().onChange(value => this.setDoubleSide(value));
        buildingMenu.add(this, "visibleTexture").setValue(this.visibleTexture).name("Texture").listen().onChange(value => this.setVisibleTexture(value));
        buildingMenu.addColor(this, "color").name("Color").setValue(this.color).listen().onChange(value => this.setColor(value));
        buildingMenu.addColor(this, "wireColor").name("Wire Color").setValue(this.wireColor).listen().onChange(value => this.setWireColor(value));
    }
    setVisible(value = true){
        this.areVisible = value;
        this.buildings.forEach(edificio =>  {
            if(value){
                edificio.visible = true;
                edificio.wire.visible = false;
                edificio.solid.visible = false;
                edificio.texture.visible = true;
                edificio.visibleWire = false;
                edificio.visibleTexture = true;
            }else{
                edificio.visible = false;
                edificio.wire.visible = false;
                edificio.solid.visible = false;
                edificio.texture.visible = false;
                edificio.visibleWire = false;
                edificio.visibleTexture = false;
            }
        });
    }
    setVisibleWire(value = true){
        this.buildings.forEach(edificio =>  {
            if (value) {
                edificio.wire.visible = true;
                edificio.solid.visible = false;
                edificio.texture.visible = false;
                this.visibleTexture = false;
            } else {
                edificio.wire.visible = true;
                edificio.solid.visible = true;
                edificio.texture.visible = true;
                this.visibleTexture = true;
            }
        });
    }
    setVisibleTexture(value = true){
        this.buildings.forEach(edificio =>  {
            if (value) {
                edificio.wire.visible = false;
                edificio.solid.visible = false;
                edificio.texture.visible = true;
                this.visibleWire = false;
            } else {
                edificio.wire.visible = true;
                edificio.solid.visible = true;
                edificio.texture.visible = false;
                this.visibleWire = true;
            }
        });
    }
    setDoubleSide(value = true){
        this.buildings.forEach(edificio => {
            edificio.doubleSide = value
        });
    }
    setColor(hexColor = 0x991313){
        this.buildings.forEach(edificio =>  {
            edificio.color = hexColor;
            edificio.solid.material.color.setHex(hexColor);
            edificio.wire.visible = true;
            edificio.solid.visible = true;
            edificio.texture.visible = false;
        });
    }
    setWireColor(hexColor = 0xffffff){
        this.buildings.forEach(edificio =>  {
            edificio.wireColor = hexColor;
            edificio.wire.material.color.setHex(hexColor);
            edificio.wire.visible = true;
            edificio.solid.visible = true;
            edificio.texture.visible = false;
        });
    }
}
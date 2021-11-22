import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import Stats from "https://unpkg.com/three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.119.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.117.1/examples/jsm/loaders/OBJLoader.js';

"use strict";

let renderer, scene, stats, data, model;
let camera, orbitControls;
let gui, vehicleMenu, trafficLightMenu;
let frameIndex = 0;
let carsLoaded = [];
let automobiles = [];

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

    scene = new THREE.Scene();
    const scenary = new Scenary();
    scene.add(scenary);

    // CAMERA (PERSPECTIVE)
    camera = new Camera();
    camera.setPerspective();
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.update();

    // SETUP STATS
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    // GUI
    gui = new dat.GUI();
    vehicleMenu = gui.addFolder("Vehicles");
    trafficLightMenu = gui.addFolder("Traffic Lights");
    const guiSceneMenu = gui.addFolder("Scene Menu");
    guiSceneMenu.add(scenary.axes, "visible").setValue(scenary.axes.visible).name("World Axes").listen().onChange(function (value) {
        scenary.axes.setVisible(value);
    });
    guiSceneMenu.open();

    const guiCameraMenu = gui.addFolder("Camera");
    guiCameraMenu.add(camera, "autoRotate").setValue(camera.autoRotate).name("Auto Rotate").listen().onChange((value) => camera.setAutoRotate(value));
    guiCameraMenu.add(camera, "topView").setValue(camera.topView).name("Top View").listen().onChange((value) => camera.setTopView());
    guiCameraMenu.add(camera, "frontView").setValue(camera.frontView).name("Front View").listen().onChange((value) => camera.setFrontView());
    guiCameraMenu.add(camera, "sideView").setValue(camera.sideView).name("Side View").listen().onChange((value) => camera.setSideView());
    //guiCameraMenu.add(camera, "internalView").setValue(camera.internalView).name("Internal View").listen().onChange((value)=>camera.setInternalView(model));
    guiCameraMenu.add(camera, "perspectiveView").setValue(camera.perspectiveView).name("Perspective View").listen().onChange((value) => camera.setPerspective());
    guiCameraMenu.open();

    readTextFile("./simul_data.json", text => {
        data = JSON.parse(text);
        data.cars.forEach(vehicle => {
            console.log(vehicle);
            const thisCar = new SportsCar(vehicle.id, vehicle.x, vehicle.z, vehicle.dir);
            thisCar.name = vehicle.id;
            automobiles.push(thisCar);
        });
        // DRAW SCENE IN A RENDER LOOP (ANIMATION)
        //while(carsLoaded < automobiles.length) console.log("Pikachu");
        renderLoop();
    });

}
function renderLoop() {
    stats.begin();
    renderer.render(scene, camera); // DRAW THE SCENE GRAPH
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
    if (frameIndex < data.frames.length - 1) frameIndex++;
    if (camera.autoRotate) {
        camera.orbitControls.update();
    }
    /*if(model && model.animate) {
        model.position.z = model.position.z - 0.6;
    }
    if(camera.internalView) camera.setInternalView(model);*/
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
        this.topView = false;
        this.frontView = false;
        this.sideView = false;
        this.internalView = false;
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

        this.position.set(0, 300, 0);
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
    constructor(carId, x = 0, z = 0, dir = 180, objFileName = "./assets/obj/sportsCar.obj") {
        super();
        this.carId = carId;
        this.x = x;
        this.z = z;
        this.theta = dir;
        this.position.set(x, 0, z);
        this.color = 0xcc0000;
        this.wireColor = 0xffffff;
        this.material = [
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/rocks.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/rocks.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/red-brick.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/green-grass.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/sirewall.jpg"),
                side: THREE.FrontSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/water.jpg"),
                side: THREE.FrontSide
            })
        ];
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
                guiModelMenu.add(automobiles[thisIndex], "doubleSide").setValue(automobiles[thisIndex].doubleSide).name("Double Side").listen().onChange(value => {
                    automobiles[thisIndex].setDoubleSide(value);
                });
                guiModelMenu.add(automobiles[thisIndex], "material").setValue(automobiles[thisIndex]).name("Texture").listen().onChange(value => {
                    automobiles[thisIndex].setTexture(value);
                });
                guiModelMenu.addColor(automobiles[thisIndex], "color").name("Color").setValue(automobiles[thisIndex].color).listen().onChange(value => {
                    automobiles[thisIndex].setColor(value);
                });
                guiModelMenu.addColor(automobiles[thisIndex], "wireColor").name("Wire Color").setValue(automobiles[thisIndex].wireColor).listen().onChange(value => {
                    automobiles[thisIndex].setWireColor(value);
                });
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
    setTexture(value) {
        this.texture = value;
        this.material.traverse(function (child) {
            if (child.isMesh) {
                child.material = [
                    new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load("./img/rocks.jpg"),
                        side: THREE.FrontSide
                    }),
                    new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load("./img/rocks.jpg"),
                        side: THREE.FrontSide
                    }),
                    new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load("./img/red-brick.jpg"),
                        side: THREE.FrontSide
                    }),
                    new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load("./img/green-grass.jpg"),
                        side: THREE.FrontSide
                    }),
                    new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load("./img/sirewall.jpg"),
                        side: THREE.FrontSide
                    }),
                    new THREE.MeshBasicMaterial({
                        map: new THREE.TextureLoader().load("./img/water.jpg"),
                        side: THREE.FrontSide
                    })
                ];
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
                console.log(trafficLight.corner + " Traffic Ligth Menu");
                const guiModelMenu = trafficLightMenu.addFolder(trafficLight.corner + " Traffic Ligth Menu");
                // GUI-Model
                guiModelMenu.add(model, "visible").setValue(trafficLight.visible).name("Visible").listen().onChange(function (value) {

                });
                guiModelMenu.add(trafficLight.solid, "visible").setValue(trafficLight.solid.visible).name("Wireframe").listen().onChange(function (value) {

                });
                guiModelMenu.addColor(trafficLight, "color").name("Color").setValue(trafficLight.color).listen().onChange(function (value) {
                    trafficLight.setColor(value);
                });
                guiModelMenu.addColor(model, "wireColor").name("Wire Color").setValue(trafficLight.wireColor).listen().onChange(function (value) {
                    trafficLight.setWireColor(value);
                });
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
        this.rotate = false;
        const geometry = new THREE.BoxGeometry(front, height, depth);
        const material = new THREE.MeshBasicMaterial({
            color
        });
        const materialWire = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: wireColor
        });
        this.solid = new THREE.Mesh(geometry, material);
        this.wire = new THREE.Mesh(geometry, materialWire);
        // CHILDREN
        this.add(this.solid);
        this.add(this.wire);
        this.setOnFloor();
    }
    setWireframe(value = true) {
        this.solid.setVisible(value);
    }
    setColor(hexColor) {
        this.color = hexColor;
        this.solid.material.color.setHex(hexColor);
    }
    setWireColor(hexColor) {
        this.wireColor = hexColor;
        this.wire.material.color.setHex(hexColor);
    }
    setDoubleSide(value) {
        this.doubleSide = value;
        if (value) {
            this.solid.material.side = THREE.DoubleSide;
        } else {
            this.solid.material.side = THREE.FrontSide;
        }
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

        this.buildings.push(new Semafor(-32, -18, -0.05, "SE"));

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

        this.buildings.push(new Semafor(-18, 32, Math.PI / 2 - 0.05, "SW"));

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

        this.buildings.push(new Semafor(32, 18, Math.PI - 0.05, "NE"));

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

        this.buildings.push(new Semafor(18, -32, -Math.PI / 2 - 0.05, "NW"));

        // CHILDREN
        this.add(this.axes);
        this.add(this.floor);
        for (let i = 0; i < this.buildings.length; i++) {
            this.add(this.buildings[i]);
        }
    }
}
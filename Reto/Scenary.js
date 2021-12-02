import * as THREE from './build/three.module.js';
import {Axes} from './Axes.js';
import {Floor} from './Floor.js';
import {Semafor} from './TrafficLight.js';
import {DirectionalLight} from './Lights.js';
import {Model} from './Model.js';

"use strict";

class Scenary extends THREE.Group {
    constructor(TraficLightMenu, BuildingMenu, ScenaryMenu, scene, size = 10000) {
        super();
        this.axes = new Axes(ScenaryMenu, size);
        this.floor = new Floor(2*size);

        this.model;
        this.buildings = [];
        this.semafors = [];
        this.areVisible = true;
        this.wire = false;
        this.doubleSide = false;
        this.visibleTexture = true;
        this.color = 0x991515;
        this.wireColor = 0xffffff;

        let skyGeo = new THREE.BoxGeometry(2*size, 2*size, 2*size);
        let skyMat = [
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/skybox/elyvisions/sh_ft.png"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/skybox/elyvisions/sh_bk.png"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/skybox/elyvisions/sh_up.png"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/skybox/elyvisions/sh_dn.png"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/skybox/elyvisions/sh_rt.png"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("./img/skybox/elyvisions/sh_lf.png"),
                side: THREE.DoubleSide
            })
        ];
        this.sky = new THREE.Mesh(skyGeo, skyMat);

        this.semafors.push(new Semafor(TraficLightMenu, scene, -18, 32, Math.PI / 2 - 0.05, "SW"));
        this.semafors.push(new Semafor(TraficLightMenu, scene, 18, -32, -Math.PI / 2 - 0.05, "NW"));
        this.semafors.push(new Semafor(TraficLightMenu, scene, 32, 18, Math.PI - 0.05, "NE"));
        this.semafors.push(new Semafor(TraficLightMenu, scene, -32, -18, -0.05, "SE"));

        this.model = new Model(scene, 0, 0, 3);

        // CHILDREN
        this.add(this.sky);
        this.add(this.axes);
        this.add(this.floor);
        for (let i = 0; i < this.semafors.length; i++) {
            this.add(this.semafors[i]);
        }

        BuildingMenu.add(this, "areVisible").setValue(this.areVisible).name("Visible").listen().onChange(value => this.setVisible(value));
        BuildingMenu.add(this, "wire").setValue(this.wire).name("Wireframe").listen().onChange(value => this.setVisibleWire(value));
        BuildingMenu.add(this, "doubleSide").setValue(this.doubleSide).name("Double Side").listen().onChange(value => this.setDoubleSide(value));
        BuildingMenu.add(this, "visibleTexture").setValue(this.visibleTexture).name("Texture").listen().onChange(value => this.setVisibleTexture(value));
        BuildingMenu.addColor(this, "color").name("Color").setValue(this.color).listen().onChange(value => this.setColor(value));
        BuildingMenu.addColor(this, "wireColor").name("Wire Color").setValue(this.wireColor).listen().onChange(value => this.setWireColor(value));
    }
    setVisible(value = true) {
        this.areVisible = value;
        this.buildings.forEach(edificio => {
            if (value) {
                edificio.visible = true;
                edificio.wire.visible = false;
                edificio.solid.visible = false;
                edificio.texture.visible = true;
                edificio.visibleWire = false;
                edificio.visibleTexture = true;
            } else {
                edificio.visible = false;
                edificio.wire.visible = false;
                edificio.solid.visible = false;
                edificio.texture.visible = false;
                edificio.visibleWire = false;
                edificio.visibleTexture = false;
            }
        });
    }
    setVisibleWire(value = true) {
        this.buildings.forEach(edificio => {
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
    setVisibleTexture(value = true) {
        this.buildings.forEach(edificio => {
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
    setDoubleSide(value = true) {
        this.buildings.forEach(edificio => {
            edificio.setDoubleSide(value);
        });
    }
    setColor(hexColor = 0x991313) {
        this.buildings.forEach(edificio => {
            edificio.color = hexColor;
            edificio.solid.material.color.setHex(hexColor);
            edificio.wire.visible = true;
            edificio.solid.visible = true;
            edificio.texture.visible = false;
        });
    }
    setWireColor(hexColor = 0xffffff) {
        this.buildings.forEach(edificio => {
            edificio.wireColor = hexColor;
            edificio.wire.material.color.setHex(hexColor);
            edificio.wire.visible = true;
            edificio.solid.visible = true;
            edificio.texture.visible = false;
        });
    }
    setTrafficLights(frame){
        for(var i=0;i<frame.TL.length;i++){
            if(frame.TL[i].state == 0){
                this.semafors[i].setColor(0x00FF00);
                this.semafors[i].setWireColor(0x00FF00);
            }
            if(frame.TL[i].state == 1){
                this.semafors[i].setColor(0xFFFF00);
                this.semafors[i].setWireColor(0xFFFF00);
            }
            if(frame.TL[i].state == 2){
                this.semafors[i].setColor(0xFF0000);
                this.semafors[i].setWireColor(0xFF0000);
            }
        }
    }
}

export {Scenary as Scenary};
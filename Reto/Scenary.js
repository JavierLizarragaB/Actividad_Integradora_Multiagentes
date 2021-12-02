import * as THREE from './build/three.module.js';
import {Axes} from './Axes.js';
import {Floor} from './Floor.js';
import {Semafor} from './TrafficLight.js';
import {DirectionalLight} from './Lights.js';
import {Model} from './Model.js';
import {Maper} from './Map.js';

"use strict";

class Scenary extends THREE.Group {
    constructor(TraficLightMenu, BuildingMenu, ScenaryMenu, scene, size = 10000) {
        super();
        this.axes = new Axes(ScenaryMenu, size);
        this.floor = new Floor(2*size);

        this.model = [,];
        this.buildings = [];
        this.semafors = [];
        this.mapisvisible = true;
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

        this.model[0] = new Model(scene, 3);
        this.model[1] = new Maper(scene, BuildingMenu, 0, 0, 3);

        BuildingMenu.add(this, "mapisvisible").name("Visible").setValue(this.mapisvisible).listen().onChange(value => {this.setMapVisible(value)});
        BuildingMenu.add(this.model[0], "visible").name("Texture").setValue(this.visible).listen().onChange(value => this.setVisibleTexture(value, 0));
        BuildingMenu.addColor(this.model[1], "color").name("Color").setValue(this.model[1].color).listen().onChange(value => this.model[1].setColor(value));
        BuildingMenu.addColor(this.model[1], "wireColor").name("Wire Color").setValue(this.model[1].wireColor).listen().onChange(value => this.model[1].setWireColor(value));
        BuildingMenu.add(this.model[1], "visible").name("Wireframe").setValue(this.model[1].visible).listen().onChange(value => {this.setVisibleTexture(value, 1)});

        let banqueta = new THREE.Mesh(new THREE.BoxGeometry(990,2,990), new THREE.MeshBasicMaterial({color: 0x464646}));
        banqueta.position.set(-520,0,-520);
        this.add(banqueta);
        banqueta = new THREE.Mesh(new THREE.BoxGeometry(990,2,990), new THREE.MeshBasicMaterial({color: 0x464646}));
        banqueta.position.set(520,0,-520);
        this.add(banqueta);
        banqueta = new THREE.Mesh(new THREE.BoxGeometry(990,2,990), new THREE.MeshBasicMaterial({color: 0x464646}));
        banqueta.position.set(520,0,520);
        this.add(banqueta);
        banqueta = new THREE.Mesh(new THREE.BoxGeometry(990,2,990), new THREE.MeshBasicMaterial({color: 0x464646}));
        banqueta.position.set(-520,0,520);
        this.add(banqueta);

        // CHILDREN
        this.add(this.sky);
        this.add(this.axes);
        this.add(this.floor);
        for (let i = 0; i < this.semafors.length; i++) {
            this.add(this.semafors[i]);
        }
    }
    setMapVisible(value = true) {
        this.mapisvisible = value;
        this.model[0].visible = false;
        this.model[1].visible = false;
        if(value) {
            this.model[0].visible = value;
        }
    }
    setVisibleTexture(value = true, index = 0) {
        this.model[index].visible = value;
        if(value) this.model[(index+1)%2].visible = false;
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
import * as THREE from 'https://unpkg.com/three/build/three.module.js';

"use strict";

class View{
    constructor() {
        this.viewports = 4;
        this.views = [new THREE.WebGLRenderer({antialias: true})];
        for(var i=0;i<1;i++){
            this.views[i].setClearColor(new THREE.Color(191, 195, 201));
            this.views[i].setPixelRatio(window.devicePixelRatio);
        }
        
        this.views[0].setSize(window.innerWidth, window.innerHeight);
        this.views[0].setViewport(0, 0, window.innerWidth, window.innerHeight);
        
        //sceneMenu.add(this, "viewports").setValue(this.viewports).min(1).max(4).step(1).name("Viewport").listen().onChange((value) => this.setViews(value));
        
        this.domElement = this.views[0].domElement;
        document.body.appendChild(this.views[0].domElement);
    }
    reset(){
        for(var i=0;i<1;i++)
            this.views[0].setViewport(0, 0, window.innerWidth, window.innerHeight);
    }
}

export {View as View};
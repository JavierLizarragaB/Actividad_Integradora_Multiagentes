import * as THREE from 'https://unpkg.com/three/build/three.module.js';

"use strict";

class View extends THREE.WebGLRenderer{
    constructor() {
        super({
            antialias: true
        });
        this.viewports = 1;
        this.shadowMap.enabled = true;
        this.shadowMap.type = THREE.PCFSoftShadowMap;
        this.setClearColor(new THREE.Color(191, 195, 201));
        this.setPixelRatio(window.devicePixelRatio);

        this.setScissorTest(true);
        this.setSize(window.innerWidth, window.innerHeight);
        this.setViewport(0, 0, window.innerWidth, window.innerHeight);

        this.domElement = this.domElement;
        document.body.appendChild(this.domElement);
    }
    setViews(value){
        this.viewports = value;
    }
    renderViews(scene,camera) {
        let views = this.viewports-1;
        let wh = window.innerHeight;
        let ww = window.innerWidth;
        const pointsX = [
            [0],
            [0, ww / 2.],
            [0, ww / 2., 0],
            [0, ww / 2., 0, ww / 2.]
        ];
        const pointsY = [
            [0],
            [0, 0],
            [0, 0, wh / 2],
            [0, 0, wh / 2, wh / 2]
        ];
        const sizeX = [
            [ww],
            [ww / 2., ww / 2.],
            [ww / 2., ww / 2., ww],
            [ww / 2., ww / 2., ww / 2., ww / 2.]
        ];
        const sizeY = [
            [wh],
            [wh, wh],
            [wh / 2, wh / 2, wh / 2],
            [wh / 2, wh / 2, wh / 2, wh / 2]
        ];
        //*
        for (let i = 0; i <= views; ++i) {
            camera[i].aspect = sizeX[views][i] / sizeY[views][i];
            camera[i].updateProjectionMatrix();
            let viewVector = new THREE.Vector4(pointsX[views][i], pointsY[views][i], sizeX[views][i], sizeY[views][i]);
            this.setViewport(viewVector);
            this.setScissor(viewVector);
            this.render(scene, camera[i]);
        }
        /**/
    }
}

export {
    View as View
};
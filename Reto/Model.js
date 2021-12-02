
import Stats from "./jsm/libs/stats.module.js";
import {OrbitControls} from "./jsm/controls/OrbitControls.js";
import * as THREE from './build/three.module.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
"use strict";

class Model extends THREE.Group {
    constructor(scene, size = 1) {
        super();
        this.loadMTLModel(size);
        scene.add(this);
    }
    
    loadMTLModel(size = 1) {
        var buildings = this;
        const manager = new THREE.LoadingManager();
        new MTLLoader( manager )
					.setPath( 'assets/' )
					.load( 'cruceColores2.mtl', function ( materials ) {
						materials.preload();

						new OBJLoader( manager )
							.setMaterials( materials )
							.setPath( 'assets/' )
							.load( 'cruceColores2.obj', function ( object ) {
                                object.scale.set(size,size,size)
								buildings.add( object );
							},);
					} );
    }
    setOnFloor() {
        const bBox = new THREE.Box3();
        bBox.setFromObject(this.solid);
        this.position.y = -bBox.min.y;
    }
}

export {
    Model as Model
};
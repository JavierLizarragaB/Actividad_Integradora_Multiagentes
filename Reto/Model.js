
import Stats from "./jsm/libs/stats.module.js";
import {OrbitControls} from "./jsm/controls/OrbitControls.js";
import * as THREE from './build/three.module.js';
import { MTLLoader } from './jsm/loaders/MTLLoader.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';
"use strict";

class Model extends THREE.Group {
    constructor(scene, menu, x = 0, z = 0, size = 1) {
        super();
        this.loadMTLModel(this.texturedMap, this.texturlessMap);
        scene.add(this);
        /*
        menu.add(this, "visible").name("Visible").setValue(this.visible).listen().onChange(value => {});
        menu.add(this, "doubleSide").name("Double Side").setValue(this.doubleSide).listen().onChange(value => this.setDoubleSide(value));
        menu.add(this, "visibleTexture").name("Texture").setValue(this.visibleTexture).listen().onChange(value => this.setVisibleTexture(value));
        menu.addColor(this, "color").name("Color").setValue(this.color).listen().onChange(value => this.setColor(value));
        menu.addColor(this, "wireColor").name("Wire Color").setValue(this.wireColor).listen().onChange(value => this.setWireColor(value));
        */
    }
    
    loadMTLModel(mtlFileName, objFileName) {
        
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
                                object.scale.set(2,2,2)
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
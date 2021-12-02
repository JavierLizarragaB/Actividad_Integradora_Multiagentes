import * as THREE from './build/three.module.js';

"use strict";

class Axes extends THREE.AxesHelper {
    constructor(menu, size = 10, visible = true) {
        super(size);
        this.size = size;
        this.visible = visible;
        this.position.set(0, 1, 0);
        //*
        menu.add(this, "visible").setValue(this.visible).name("World Axes").listen().onChange(value => this.setVisible(value));
        /* - */
    }
    setVisible(value) {
        this.visible = value;
    }
}

export {Axes as Axes};
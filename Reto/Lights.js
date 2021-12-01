import * as THREE from 'https://unpkg.com/three/build/three.module.js';

"use strict";

class DirectionalLight extends THREE.DirectionalLight {
    constructor(color = 0xFFFFFF, intensity = 0.7) {
        super(color, intensity);
        this.strColor = color;
        this.position.set(100, 1, 0);
        this.castShadow = true;
    }
    setColor(strColor) {
        this.color.setHex(strColor);
    }
}
class SpotLight extends THREE.SpotLight {
    constructor(color = 0xFFFFFF, intensity = 1, distance = 0, angle = Math.PI / 2, penumbra = 0, decay = 1) {
        super(color, intensity, distance, angle, penumbra, decay);
        this.angleDeg = angle * 180 / Math.PI;
        this.strColor = color;
        this.position.set(0, 3, 0);
    }
    setColor(strColor) {
        this.color.setHex(strColor);
    }
    setAngle(angleDeg) {
        this.angle = angleDeg * Math.PI / 180;
    }
}

export {DirectionalLight as DirectionalLight, SpotLight as SpotLight};
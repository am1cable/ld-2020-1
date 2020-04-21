import { directions } from "../wind/wind";

export default class Flame {
    constructor({ parent, target, strength = 1, pos = { x: 0, y: 0 } }) {
        this.parent = parent;
        this.particles = this.parent.add.particles('flares');
        this.startPos = pos;
        this.lifespan = 20 * strength;
        this.speed = 100 * strength;
        this.wick = target;
        this.flame = this.particles.createEmitter({
            frame: 'yellow',
            radial: false,
            x: pos.x,
            y: pos.y,
            speedY: { min: -this.speed, max: -this.speed * 2 },
            lifespan: { min: this.lifespan, max: this.lifespan * 2 },
            alpha: { start: 1, end: 0 },
            quantity: 3,
            scale: { start: 0.09, end: 0.01 },
            blendMode: 'ADD'
        });
        if (!!this.wick) {
            this.flame.startFollow(this.wick.target, this.wick.offsetX, this.wick.offsetY, this.wick.trackVisible);
        }
    }

    setWind = ({ direction = undefined, strength = 0 }) => {
        this.flame.setSpeedX(0);
        switch (direction) {
            case directions.s:
                this.flame.setSpeedY({ min: this.speed * strength, max: (this.speed * strength) * 2 });
                break;
            case directions.w:
                this.flame.setSpeedX(-strength * this.speed);
                break;
            case directions.e:
                this.flame.setSpeedX(strength * this.speed);
                break;
            default:
                this.setStrength(this.strength);
        }
    }

    setDepth = (depth) => this.particles.setDepth(depth);

    setStrength = (strength) => {
        this.strength = strength;
        const speed = this.speed * strength;
        const lifespan = this.lifespan * strength;
        this.flame.setSpeedY({ min: -speed, max: -speed * 2 });
        this.flame.setLifespan({ min: lifespan, max: lifespan * 2 });
        this.flame.setAlpha({ start: strength, end: 0 });
    }

    setPosition = (pos = this.startPos) => this.flame.setPosition(pos.x, pos.y);

}
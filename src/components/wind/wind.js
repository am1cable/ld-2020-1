import { objectsInSameCoridoorX, objectsInSameCoridoorY } from "../../ray";

export const directions = { s: "s", e: "e", w: "w" };

export default class Wind {
    constructor({ parent, windEmitters }) {
        this.wind = parent.sound.add('wind_3');
        this.parent = parent;
        this.windEmitters = [];
        this.defaultWindStrength = 0.25;
        this.windStrength = this.defaultWindStrength;
        windEmitters.forEach(e => { this.windEmitters.push(new WindEmitter({ parent, emitterPoint: e })) });
        this.parent.events.on("update", this.update, this);
        this.parent.events.once("shutdown", this.destroy, this);
        this.parent.events.once("destroy", this.destroy, this);

        this.wind.play({ volume: this.defaultWindStrength, loop: true });
    };

    destroy = () => {
        this.parent.events.off("update", this.update, this);
        this.parent.events.off("shutdown", this.destroy, this);
        this.parent.events.off("destroy", this.destroy, this);
    }

    getMedian = ({ min, max }) => (min + max) / 2;

    getXYofEmitter = (e) => {
        const emitter = { ...e };
        if (typeof emitter.x.propertyValue === "object") emitter.x.propertyValue = this.getMedian(emitter.x.propertyValue);
        if (typeof emitter.y.propertyValue === "object") emitter.y.propertyValue = this.getMedian(emitter.y.propertyValue);
        return { x: emitter.x.propertyValue, y: emitter.y.propertyValue };
    }

    transitionVolume = (target) => {
        const start = this.windStrength;
        if (target !== start) {
            if (!!this.volumeTransition) {
                if (this.volumeTransition.data[0].getEndValue() === target) return;
                this.volumeTransition.stop();
                this.volumeTransition.remove();
            }
            const duration = Math.abs(start - target) * 500;
            this.volumeTransition = this.parent.tweens.addCounter({
                from: start,
                to: target,
                duration,
                onUpdate: this.updateVolume,
                onUpdateScope: this
            });
        }
    }
    updateVolume = (tween) => {
        this.windStrength = tween.getValue();
        this.wind.setVolume(this.windStrength);
    }

    update = () => {
        if (this.parent.player.isWalking || this.parent.player.isRunning) {
            const player = this.parent.player.sprite;
            const visibleEmitters = this.windEmitters.filter(wi => {
                const config = { parent: this.parent, bodies: [player.body], start: this.getXYofEmitter(wi.emitter) };
                const objects = wi.direction === directions.s ? objectsInSameCoridoorY(config) : objectsInSameCoridoorX(config);
                return !!objects.find(obj => player.body.parts.some(b => b === obj.body));
            });
            const distanceToEmitters = visibleEmitters.map(wi => {
                const emitter = this.getXYofEmitter(wi.emitter);
                const distance = Phaser.Math.Distance.Squared(player.x, player.y, emitter.x, emitter.y) / 32;
                return distance;
            });
            const closestDistance = distanceToEmitters.reduce((prev, dist) => dist < prev ? dist : prev, 999999999999999);
            const closestEmitter = visibleEmitters.find((e, i) => distanceToEmitters[i] === closestDistance);
            const newWindStrength = (closestEmitter || { strength: this.defaultWindStrength }).strength;
            const candle = this.parent.hud.candle;
            if (closestEmitter) {
                candle.flame.setWind({direction: closestEmitter.direction, strength: closestEmitter.strength});
            }else{
                candle.flame.setWind({direction: undefined, strength: 0});
            }
            this.transitionVolume(newWindStrength);
        }
    }
}

export class WindEmitter {
    constructor({ parent, emitterPoint }) {
        this.parent = parent;
        this.originPoint = emitterPoint;
        this.direction = emitterPoint.properties[0].value;
        this.strength = 1;

        const particles = this.parent.add.particles('particle');
        const config = {
            x: emitterPoint.x,
            y: { min: emitterPoint.y - 32, max: emitterPoint.y + 32 },
            lifespan: 4000,
            scale: { start: 1, end: 0 },
            quantity: 4
        };
        const emitterOffset = 4;
        const speed = { min: 50, max: 200 };
        if (this.direction === directions.s) {
            config.x = { min: emitterPoint.x - 32, max: emitterPoint.x + 32 }
            config.y = emitterPoint.y + emitterOffset;
            config.speedY = speed;
        }
        if (this.direction === directions.e) {
            config.speedX = speed;
            config.x = emitterPoint.x + emitterOffset;
        }
        if (this.direction === directions.w) {
            config.speedX = { min: -speed.min, max: -speed.max };
            config.x = emitterPoint.x - emitterOffset;
        }
        this.emitter = particles.createEmitter({ ...config });
        this.emitter.manager.setDepth(this.parent.map.heightInPixels + 1);
    };

    update = (time, delta) => {

    }
};
import { objectsInSameCoridoorX, objectsInSameCoridoorY, inDirectLineOfSight } from "../../ray";

export const directions = { s: "s", e: "e", w: "w" };
const minWindSpeed = 0.3;
export default class Wind {
    constructor({ parent, windEmitters }) {
        this.wind = parent.sound.add('wind_3');
        this.parent = parent;
        this.player = this.parent.player.sprite;
        this.windEmitters = [];
        this.defaultWindStrength = minWindSpeed;
        this.windStrength = this.defaultWindStrength;
        windEmitters.forEach(e => { this.windEmitters.push(new WindEmitter({ parent, emitterPoint: e })) });
        this.parent.events.on("update", this.update, this);
        this.parent.events.once("shutdown", this.destroy, this);
        this.parent.events.once("destroy", this.destroy, this);
        this.candle = this.parent.candleManager;

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
                onUpdate: this.updateCandleWind,
                onUpdateScope: this
            });
        }
    }
    updateCandleWind = (tween) => {
        this.windStrength = tween.getValue();
        this.wind.setVolume(this.windStrength);
        if (this.closestEmitter && this.windStrength !== this.defaultWindStrength) {
            this.candle.setWind({ direction: this.closestEmitter.direction, strength: this.windStrength });
            this.candle.exposeToWind(this.windStrength);
        } else {
            this.candle.setWind({ direction: undefined, strength: 0 });
            this.candle.exposeToWind(0);
        }
    }

    getVisibleEmitters = () => {
        return this.windEmitters.filter(wi => {
            const config = { parent: this.parent, bodies: [this.player.body], start: this.getXYofEmitter(wi.emitter) };
            const objects = wi.direction === directions.s ? objectsInSameCoridoorY(config) : objectsInSameCoridoorX(config);
            return !!objects.find(obj => this.player.body.parts.some(b => b === obj.body));
        });
    }

    getClosestEmitter = () => {
        const visibleEmitters = this.getVisibleEmitters();
        const distanceToEmitters = visibleEmitters.map(wi => {
            const emitter = this.getXYofEmitter(wi.emitter);
            const distance = Phaser.Math.Distance.Squared(this.player.x, this.player.y, emitter.x, emitter.y) / 32;
            return distance;
        });
        const closestDistance = distanceToEmitters.reduce((prev, dist) => dist < prev ? dist : prev, 999999999999999);
        return visibleEmitters.find((e, i) => distanceToEmitters[i] === closestDistance);
    }

    getClosestExposedEmitter = () => {
        const visibleEmitters = this.getVisibleEmitters();
        return visibleEmitters.find(vi => {
            return inDirectLineOfSight({ parent: this.parent, blockableBodies: this.parent.boxes.map(b => b.box.body), start: this.getXYofEmitter(vi.emitter), end: this.player })
        });
    }

    update = () => {
        if (this.parent.player.isWalking || this.parent.player.isRunning) {
            this.closestEmitter = this.getClosestExposedEmitter();
            const newWindStrength = (this.closestEmitter || { strength: this.defaultWindStrength }).strength;
            newWindStrength != this.windStrength && this.transitionVolume(newWindStrength);
        } else if (!!this.closestEmitter) {
            const newWindStrength = this.closestEmitter.strength;
            newWindStrength != this.windStrength && this.transitionVolume(newWindStrength);
        }
    }
}

export class WindEmitter {
    constructor({ parent, emitterPoint }) {
        this.parent = parent;
        this.originPoint = emitterPoint;
        this.direction = emitterPoint.properties[0].value;
        this.strength = 1;
        this.strengthTimerConfig = {
            delay: 5000 * Math.random(),
            callback: this.getNewStrength,
            callbackScope: this,
            loop: true
        };
        this.newStrengthTimer = this.parent.time.addEvent(this.strengthTimerConfig);
        const matterContains = Phaser.Physics.Matter.Matter.Bounds.contains;
        const boxes = this.parent.boxes;
        const walls = this.parent.map.filterTiles(t => t.properties.isUnpassable, this, undefined, undefined, undefined, undefined, undefined, "bg");


        const isInDeathZone = {
            contains: (x, y) => {
                return boxes.find(box => matterContains(box.box.body.bounds, { x, y })) || walls.find(wall => matterContains(wall.physics.matterBody.body.bounds, { x, y }));
            }
        }
        const particles = this.parent.add.particles('particle');
        const config = {
            x: emitterPoint.x,
            y: { min: emitterPoint.y - 32, max: emitterPoint.y + 32 },
            lifespan: 10 * 1000,
            quantity: 4,
            alpha: { min: 0.2, max: 1 },
            deathZone: { type: 'onEnter', source: isInDeathZone }
        };
        const emitterOffset = 4;
        this.speed = { min: 300, max: 400 };
        if (this.direction === directions.s) {
            config.x = { min: emitterPoint.x - 32, max: emitterPoint.x + 32 }
            config.y = emitterPoint.y + emitterOffset;
            config.speedY = this.speed;
        }
        if (this.direction === directions.e) {
            config.speedX = this.speed;
            config.x = emitterPoint.x + emitterOffset;
        }
        if (this.direction === directions.w) {
            config.speedX = { min: -this.speed.min, max: -this.speed.max };
            config.x = emitterPoint.x - emitterOffset;
        }
        this.emitter = particles.createEmitter({ ...config });
        this.emitter.manager.setDepth(this.parent.map.heightInPixels + 1);
    };

    getNewStrength = () => {
        const randomStrength = Math.max(0, Math.random().toFixed(2));
        const strength = randomStrength <= minWindSpeed ? 0 : randomStrength;
        this.newStrengthTimer.delay = (5000 * Math.random()).toFixed(2);
        this.transitionSpeed(strength);
    }

    transitionSpeed = (target) => {
        const start = this.strength;
        if (target !== start) {
            if (!!this.speedTransition) {
                if (this.speedTransition.data[0].getEndValue() === target && this.speedTransition.isPlaying()) return;
                this.speedTransition.stop();
                this.speedTransition.remove();
            }
            const duration = Math.abs(start - target) * 500;
            this.speedTransition = this.parent.tweens.addCounter({
                from: start,
                to: target,
                duration,
                onUpdate: (tween) => this.updateSpeed(tween.getValue()),
                onUpdateScope: this
            });
        }
    }

    updateSpeed = (newStrength) => {
        this.strength = newStrength;
        if (this.strength <= minWindSpeed) {
            this.emitter.setQuantity = 0;
        }
        const speed = { min: this.speed.min * this.strength, max: this.speed.max * this.strength };
        if (this.direction === directions.s) {
            this.emitter.setSpeedY(speed);
        }
        if (this.direction === directions.e) {
            this.emitter.setSpeedX(speed);
        }
        if (this.direction === directions.w) {
            this.emitter.setSpeedX({ min: -speed.min, max: -speed.max });
        }
    }
};
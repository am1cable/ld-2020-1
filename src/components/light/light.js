import Flame from "../flame/flame";

export default class Light {
    constructor({ parent, rect }) {
        this.parent = parent;
        this.light = this.parent.matter.add.rectangle(rect.x + (rect.width / 2), rect.y + (rect.height / 2), rect.width, rect.height, { isSensor: true, isStatic: true });
        this.flame = new Flame({ parent, pos: { x: rect.x + (rect.width / 2), y: rect.y + (rect.height / 2) } });
        this.flame.setDepth(this.flame.y);
        this.collision = this.parent.matterCollision.addOnCollideStart({
            objectA: this.light,
            objectB: this.parent.player.sprite,
            callback: this.onCollision,
            context: this
        });
    };
    onCollision = () => {
        const candle = this.parent.hud.candle;
        candle.setCandleRemaining(1);
        this.collision.sleep = true;
    }

    update = (time, delta) => {
    }
};
export default class Box {
    constructor({ parent, rect }) {
        this.parent = parent;
        this.box = this.parent.matter.add.image(rect.pixelX + rect.width / 2, rect.pixelY + rect.height / 2, "sprites1", "sprites-22.png")
            .setOrigin(0, 0)
            .setRectangle(rect.width / 1.5, rect.height / 1.5, { isStatic: false, friction: 1, staticFriction: 1, frictionAir: 1, density: 100 })
            .setFixedRotation();
            this.box.setDepth(this.box.y + this.box.height - 2);
            this.parent.events.on("update", this.update, this);

    };

    update = (time, delta) => {
        this.box.setDepth(this.box.y + this.box.height - 2);
    }
};
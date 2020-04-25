export default class Barrel {
    constructor({ parent, rect }) {
        this.parent = parent;
        this.barrel = this.parent.matter.add.image(rect.pixelX + rect.width / 2, rect.pixelY + rect.height / 2, "sprites1", "sprites-21.png")
            .setOrigin(0, 0)
            .setRectangle(rect.width / 1.5, rect.height / 1.5, { isStatic: true })
            .setFixedRotation();
            this.barrel.setDepth(this.barrel.y + this.barrel.height - 2);
    };

};
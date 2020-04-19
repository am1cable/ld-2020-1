export default class Box {
    constructor({ parent, rect }) {
        this.parent = parent;
        debugger;
        this.box = this.parent.matter.add.image(rect.pixelX + rect.width / 2, rect.pixelY + rect.height / 2, "sprites1", "sprites-22.png");
        this.box.setOrigin(0, 0);
        this.box.setRectangle(rect.width / 1.5, rect.height / 1.5, { isStatic:false, friction: 1, staticFriction: 1, frictionAir: 1, density: 100  });
        this.box.setFixedRotation();
    };

    update = (time, delta) => {
    }
};
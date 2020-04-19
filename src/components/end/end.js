export default class End {
    constructor({ parent, triggerPoint, endPoint, sprites }) {
        this.parent = parent;
        const polygon = new Phaser.Geom.Polygon(triggerPoint.polygon);
        const aabb = Phaser.Geom.Polygon.GetAABB(polygon);
        this.triggerArea = this.parent.matter.add.fromVertices(triggerPoint.x + (aabb.width/2), triggerPoint.y - (aabb.height /2), triggerPoint.polygon, { isSensor: true, isStatic: true });
        this.brazierSprites = [];
        sprites.forEach((obj, i) => {
            const spriteNumb = i === 0 ? "28" : i === 1 ? "29" : i === 2 ? "37" : "38";
            const sprite = this.parent.matter.add.image(obj.pixelX + obj.width / 2, obj.pixelY + obj.height / 2, "sprites1", `sprites-${spriteNumb}.png`, {isStatic: true, isSensor: true});
            sprite.setDepth(sprite.y + sprite.height - 2);
            this.brazierSprites.push(sprite);
        })
        this.endPoint = endPoint;
    };

    update = (time, delta) => {
    }
};
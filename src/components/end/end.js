import PathFinder from "../pathFinder/pathFinder";

export default class End {
    constructor({ parent, triggerPoint, endPoint, sprites }) {
        this.parent = parent;
        const polygon = new Phaser.Geom.Polygon(triggerPoint.polygon);
        const aabb = Phaser.Geom.Polygon.GetAABB(polygon);
        this.triggerArea = this.parent.matter.add.fromVertices(triggerPoint.x + (aabb.width / 2), triggerPoint.y - (aabb.height / 2), triggerPoint.polygon, { isSensor: true, isStatic: true });
        this.parent.brazierSprites = [];
        sprites.forEach((obj, i) => {
            const spriteNumb = i === 0 ? "28" : i === 1 ? "29" : i === 2 ? "37" : "38";
            const sprite = this.parent.matter.add.image(obj.pixelX + obj.width / 2, obj.pixelY + obj.height / 2, "sprites1", `sprites-${spriteNumb}.png`, { isStatic: true, isSensor: true });
            sprite.setDepth(sprite.y + sprite.height - 2);
            this.parent.brazierSprites.push(sprite);
        })
        this.endPoint = endPoint;

        this.collision = this.parent.matterCollision.addOnCollideStart({
            objectA: this.triggerArea,
            objectB: this.parent.player.sprite,
            callback: this.onCollision,
            context: this
        });
    };

    onCollision = () => {
        const player = this.parent.player;
        player.stop();
        const pathFinder = new PathFinder({parent: this.parent});
        pathFinder.getPath({start: player.sprite, end: this.endPoint, callback: player.moveTo})
        this.collision();
    }

    update = (time, delta) => {
    }
};
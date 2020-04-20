export default class Flame{
    constructor({parent, target, pos = {x: 0, y: 0}}) {
        this.parent = parent;
        var particles = this.parent.add.particles('flares');
        this.startPos = pos;
        this.lifespan = 20;
        this.speed = 100;
        this.wick = target;
        this.flame = particles.createEmitter({
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
        if (!!this.wick){
            this.flame.startFollow(this.wick.target, this.wick.offsetX, this.wick.offsetY, this.wick.trackVisible);
        }
    }

    setPosition = (pos = this.startPos) => this.flame.setPosition(pos.x, pos.y);
    
}
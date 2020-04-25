import Candle from "../candle/candle";

export default class Player {
    constructor({ parent, x, y }) {
        this.parent = parent;
        this.sprite = this.parent.matter.add.sprite(0, 0, "sprites1", "sprites-1.png");
        this.lastClicks = [];
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const { width: w, height: h } = this.sprite;
        const mainBody = Bodies.circle(0, 0 + h * 0.15, w / 3, h / 3);
        this.triggerBodyOriginalPos = { x: 0, y: 0 - h * 0.25, w: w, h: h * 0.5 };
        var dist = 0.5;
        var length = 0.5;
        var depth = 0.5;
        this.triggers = {
            up: Bodies.rectangle(0, 0 - h * dist, w * length, h * depth, { isSensor: true }),
            down: Bodies.rectangle(0, h * dist, w * length, h * depth, { isSensor: true }),
            left: Bodies.rectangle(0 - w * dist, 0, w * depth, h * length, { isSensor: true }),
            right: Bodies.rectangle(w * dist, 0, w * depth, h * length, { isSensor: true })
        };
        const compoundBody = Body.create({
            parts: [mainBody, this.triggers.up, this.triggers.down, this.triggers.left, this.triggers.right],
            frictionStatic: 100,
            friction: 100,
            ignoreGravity: true
        });
        this.sprite
            .setExistingBody(compoundBody)
            .setFixedRotation()
            .setPosition(x, y)
            .setDepth(this.sprite.y + this.sprite.height - 2);

        this.candleOffset = 13;
        // this.candle = new Candle({ parent: this.parent, player: this, size: { width: 5, height: 10 }, border: 1, padding: 0 , scaleCandle : false, origin: [0.5, 1]});
        // this.candle.setPosition({x, y: y - this.candleOffset});
        // this.candle.setDepth(this.candle.y + this.candle.height - 2);

        const { A, D, W, S } = Phaser.Input.Keyboard.KeyCodes;
        this.leftInput = this.parent.input.keyboard.addKey(A);
        this.leftInput.on("down", e => this.lastClicks.push({ type: "left", time: e.originalEvent.timeStamp }));
        this.rightInput = this.parent.input.keyboard.addKey(D);
        this.rightInput.on("down", e => this.lastClicks.push({ type: "right", time: e.originalEvent.timeStamp }));
        this.upInput = this.parent.input.keyboard.addKey(W);
        this.upInput.on("down", e => this.lastClicks.push({ type: "up", time: e.originalEvent.timeStamp }));
        this.downInput = this.parent.input.keyboard.addKey(S);
        this.downInput.on("down", e => this.lastClicks.push({ type: "down", time: e.originalEvent.timeStamp }));

        this.parent.events.on("update", this.update, this);
        this.parent.events.once("shutdown", this.destroy, this);
        this.parent.events.once("destroy", this.destroy, this);

        this.isRunning = false;
        this.isWalking = false;
        this.isControllable = false;
    };

    destroy = () => {
        this.isControllable = false;
        this.parent.events.off("update", this.update, this);
        this.parent.events.off("shutdown", this.destroy, this);
        this.parent.events.off("destroy", this.destroy, this);
    }

    runVelocity = () => this.lastClicks.length > 1 && (this.lastClicks[1].time - this.lastClicks[0].time < 350) || this.isRunning ? 1.5 : 0.5;

    moveTo = (endPoint, callback) => (path) => {
        const tweens = [];
        var baseDuration = 450;
        path.forEach((p, i) => {
            var duration = i == 1 ? baseDuration * 2 : baseDuration;
            tweens.push({
                targets: this.sprite,
                x: { value: p.x + (i == 1 ? 0 : (31 / 2)), duration },
                y: { value: p.y + (i == 1 ? 0 : (31 / 2)), duration },
                onStart: this.updateSpritePose,
                onStartScope: this
            });
        })
        tweens.pop();
        tweens.shift();
        tweens.push({
            targets: this.sprite,
            x: { value: endPoint.x, duration: baseDuration },
            y: { value: endPoint.y, duration: baseDuration },
            onStart: this.updateSpritePose,
            onStartScope: this
        })
        this.parent.tweens.timeline({
            tweens: tweens,
            onComplete: callback,
            onCompleteScope: this
        });
    }

    updateSpritePose = (a) => {
        const target = { x: a.data[0].getEndValue(), y: a.data[1].getEndValue() };
        const diffX = Math.abs(target.x - this.sprite.x);
        const diffY = Math.abs(target.y - this.sprite.y);
        if (diffX > diffY) {
            if (target.x > this.sprite.x) this.sprite.setTexture("sprites1", "sprites-3.png");
            else if (target.x < this.sprite.x) this.sprite.setTexture("sprites1", "sprites-2.png");
        } else {
            if (target.y > this.sprite.y) this.sprite.setTexture("sprites1", "sprites-0.png");
            else if (target.y < this.sprite.y) this.sprite.setTexture("sprites1", "sprites-1.png");
        }
    }

    stop = () => {
        this.isControllable = false;
        this.sprite.setVelocity(0, 0);
    }

    start = () => this.isControllable = true;

    update = (time, delta) => {
        const sprite = this.sprite;
        const isRightKeyDown = this.rightInput.isDown;
        const isLeftKeyDown = this.leftInput.isDown;
        const isUpKeyDown = this.upInput.isDown;
        const isDownKeyDown = this.downInput.isDown;
        if (this.lastClicks.length > 2) this.lastClicks.shift();
        sprite.setVelocity(0, 0);
        if (this.isControllable && (isRightKeyDown || isLeftKeyDown || isUpKeyDown || isDownKeyDown)) {
            var velocity = this.runVelocity();
            this.triggers.left.sleeping = true;
            this.triggers.right.sleeping = true;
            this.triggers.up.sleeping = true;
            this.triggers.down.sleeping = true;

            if (isRightKeyDown) {
                sprite.setVelocityX(velocity);
                sprite.setTexture("sprites1", "sprites-3.png");
                // this.candle.setPosition({x: this.sprite.x + this.candleOffset, y: this.sprite.y});
                this.triggers.right.sleeping = false;
            };
            if (isLeftKeyDown) {
                sprite.setVelocityX(-velocity);
                sprite.setTexture("sprites1", "sprites-2.png");
                // this.candle.setPosition({x: this.sprite.x - this.candleOffset, y: this.sprite.y});
                this.triggers.left.sleeping = false;
            };
            if (isUpKeyDown) {
                sprite.setVelocityY(-velocity);
                sprite.setTexture("sprites1", "sprites-1.png");
                // this.candle.setPosition({x: this.sprite.x, y: this.sprite.y - this.candleOffset});
                this.triggers.up.sleeping = false;
            }
            if (isDownKeyDown) {
                sprite.setVelocityY(velocity);
                sprite.setTexture("sprites1", "sprites-0.png");
                // this.candle.setPosition({x: this.sprite.x, y: this.sprite.y + this.candleOffset});
                this.triggers.down.sleeping = false;
            }
            if (velocity > 1) {
                this.isRunning = true;
                this.isWalking = false;
            }
            else {
                this.isRunning = false;
                this.isWalking = true;
            }

        } else {
            this.isWalking = false;
            this.isRunning = false;
        }
        this.sprite.setDepth(this.sprite.y + (this.sprite.height / 1.5));
        // this.candle.setDepth(this.candle.y + this.candle.height - 2);
    }
};
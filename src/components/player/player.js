export default class Player {
    constructor({ parent, x, y }) {
        this.parent = parent;
        this.sprite = this.parent.matter.add.sprite(0, 0, "sprites1", "sprites-1.png");
        this.lastClicks = [];

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const { width: w, height: h } = this.sprite;
        const mainBody = Bodies.circle(0, 0, w / 3, h / 3);
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

        const { A, D, W, S } = Phaser.Input.Keyboard.KeyCodes;
        this.leftInput = this.parent.input.keyboard.addKey(A);
        this.leftInput.on("down", e => this.lastClicks.push({ type: "left", time: e.originalEvent.timeStamp }));
        this.rightInput = this.parent.input.keyboard.addKey(D);
        this.rightInput.on("down", e => this.lastClicks.push({ type: "right", time: e.originalEvent.timeStamp }));
        this.upInput = this.parent.input.keyboard.addKey(W);
        this.upInput.on("down", e => this.lastClicks.push({ type: "up", time: e.originalEvent.timeStamp }));
        this.downInput = this.parent.input.keyboard.addKey(S);
        this.downInput.on("down", e => this.lastClicks.push({ type: "down", time: e.originalEvent.timeStamp }));

        this.destroyed = false;
        this.parent.events.on("update", this.update, this);
        this.isRunning = false;
        this.isWalking = false;
    };

    runVelocity = () => this.lastClicks.length > 1 && (this.lastClicks[1].time - this.lastClicks[0].time < 350) || this.isRunning ? 1.5 : 0.5;

    update = (time, delta) => {
        const sprite = this.sprite;
        const isRightKeyDown = this.rightInput.isDown;
        const isLeftKeyDown = this.leftInput.isDown;
        const isUpKeyDown = this.upInput.isDown;
        const isDownKeyDown = this.downInput.isDown;
        if (this.lastClicks.length > 2) this.lastClicks.shift();
        sprite.setVelocity(0, 0);
        if (isRightKeyDown || isLeftKeyDown || isUpKeyDown || isDownKeyDown) {
            var velocity = this.runVelocity();
            this.triggers.left.sleeping = true;
            this.triggers.right.sleeping = true;
            this.triggers.up.sleeping = true;
            this.triggers.down.sleeping = true;

            if (isRightKeyDown) {
                sprite.setVelocityX(velocity);
                sprite.setTexture("sprites1", "sprites-3.png");
                this.triggers.right.sleeping = false;
            };
            if (isLeftKeyDown) {
                sprite.setVelocityX(-velocity);
                sprite.setTexture("sprites1", "sprites-2.png");
                this.triggers.left.sleeping = false;
            };
            if (isUpKeyDown) {
                sprite.setVelocityY(-velocity);
                sprite.setTexture("sprites1", "sprites-1.png");
                this.triggers.up.sleeping = false;
            }
            if (isDownKeyDown) {
                sprite.setVelocityY(velocity);
                sprite.setTexture("sprites1", "sprites-0.png");
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

        } else if (this.lastClicks.length > 1 && this.lastClicks[1].time - this.lastClicks[0].time >= 350) {
            this.isWalking = false;
            this.isRunning = false;
        }
        this.sprite.setDepth(this.sprite.y + this.sprite.height - 2);
    }
};
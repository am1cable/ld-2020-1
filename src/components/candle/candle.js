import Flame from "../flame/flame";

export default class Candle {
    constructor({ parent, player, size }) {
        this.parent = parent;
        this.player = player;
        this.candleRemaining = 1;
        this.minCandleRemaining = 0.3;
        this.candle;
        this.padding = 10;
        this.candleHeight = (size.height / 10) - (this.padding * 2);
        this.candle = this.parent.add.rectangle(0, 0, size.width / 20, this.candleHeight, 0x55aaff)
            .setOrigin(0, 0)
            .setPosition(this.padding, this.padding)
            .setStrokeStyle(2, 0x0000aa, 1);
        this.wickOffset = 1;
        this.wick = this.parent.add.rectangle(0, 0, 2, 2, 0x0000aa)
            .setOrigin(0, 0)
            .setPosition(this.candle.x + (this.candle.width / 2) - this.wickOffset, this.candle.y + this.wickOffset);
        this.flame = new Flame({ parent: this.parent, target: { target: this.candle, offsetX: this.candle.width / 2 } })

        this.parent.events.on("update", this.update, this);
        this.parent.events.once("shutdown", this.destroy, this);
        this.parent.events.once("destroy", this.destroy, this);
    };

    destroy = () => {
        this.parent.events.off("update", this.update, this);
        this.parent.events.off("shutdown", this.destroy, this);
        this.parent.events.off("destroy", this.destroy, this);
    }

    setPosition = (pos) => this.candle.setPosition(pos.x, pos.y);

    transitionCandle = (target) => {
        const start = this.candleRemaining;
        if (target !== start) {
            if (!!this.candleTransition) {
                if (this.candleTransition.data[0].getEndValue() === target && this.candleTransition.isPlaying()) return;
                this.candleTransition.stop();
                this.candleTransition.remove();
            }
            const duration = Math.abs(start - target) * 500;
            this.candleTransition = this.parent.tweens.addCounter({
                from: start,
                to: target,
                duration,
                onUpdate: (tween) => this.setCandleFromTransition(tween),
                onUpdateScope: this
            });
        }
    }

    setCandleFromTransition = (tween) => this.setCandleRemaining(tween.getValue(), true);

    setCandleRemaining = (amt, inTransition = false) => {
        if (amt && !inTransition) {
            this.transitionCandle(amt);
        } else if (amt) {
            this.candleRemaining = amt;
        } else {
            if (this.player.isRunning) {
                this.candleRemaining -= 0.001;

            } else if (this.player.isWalking) {
                this.candleRemaining -= 0.0005;

            } else {
                this.candleRemaining -= 0.0001;
            }
        }
        this.candleRemaining = Math.max(this.candleRemaining, this.minCandleRemaining);
        const candleBurned = this.candleHeight - (this.candleHeight * this.candleRemaining);
        this.candle.setScale(1, this.candleRemaining);
        this.candle.setPosition(this.padding, this.padding + candleBurned);
        this.wick.setPosition(this.wick.x, this.candle.y - this.wickOffset);
        this.wick.setSize(this.wick.width, Math.min(5, 2 + (candleBurned / 2.5 )));
        this.flame.setStrength(this.candleRemaining);
    }

    update = (time, delta) => {
        if (this.candleRemaining > this.minCandleRemaining && this.player.isControllable) {
            this.setCandleRemaining();
        }
    }
}
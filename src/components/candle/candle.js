import Flame from "../flame/flame";

export class CandleManager {
    constructor({ parent }) {
        this.candles = [];
    }
    addCandle = (candle) => this.candles.push(candle);
    exposeToWind = (strength) => this.candles.forEach(candle => candle.exposeToWind(strength));
    setCandleRemaining = (amt) => this.candles.forEach(candle => candle.setCandleRemaining(amt));
    setWind = (amt) => this.candles.forEach(candle => candle.flame.setWind(amt));
}

export default class Candle {
    constructor({ parent, player, size, showWick = true, border, padding, wickOffset, scaleCandle = true, origin = [0, 0] }) {
        this.parent = parent;
        this.player = player;
        this.candleRemaining = 1;
        this.minCandleRemaining = 0.3;
        this.windStrength = 0;
        this.candle;
        this.padding = padding || 10;
        this.candlePosition = { x: this.padding, y: this.padding };
        this.candleWidth = scaleCandle ? size.width / 20 : size.width;
        this.candleHeight = scaleCandle ? (size.height / 10) - (this.padding * 2) : size.height;
        this.candle = this.parent.add.rectangle(0, 0, this.candleWidth, this.candleHeight, 0x55aaff)
            .setOrigin(...origin)
            .setPosition(this.padding, this.padding)
            .setStrokeStyle(border || 2, 0x0000aa, 1);
        this.wickOffset = wickOffset || 1;
        this.wick = this.parent.add.rectangle(0, 0, this.candle.width / 10, this.candle.width / 10, 0x0000aa)
            .setOrigin(0, 0)
            .setPosition(this.candle.x + (this.candle.width / 2) - this.wickOffset, this.candle.y + this.wickOffset);
        if (!showWick) this.wick.setVisible(false);
        this.flame = new Flame({ parent: this.parent, target: { target: this.candle, offsetX: this.candle.width / 2 } })

        this.parent.events.on("update", this.update, this);
        this.parent.events.once("shutdown", this.destroy, this);
        this.parent.events.once("destroy", this.destroy, this);
    };

    setPosition = (pos) => this.candlePosition = pos;
    exposeToWind = (strength) => this.windStrength = strength;
    setCandleFromTransition = (tween) => this.setCandleRemaining(tween.getValue(), true);

    setDepth = (depth) => {
        this.candle.setDepth(depth);
        this.wick.setDepth(depth);
        this.flame.setDepth(depth);
    }

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

    setCandleRemainingDecrease = (amt) => {
        var amtTotal = this.windStrength !== 0 ? (amt / this.windStrength).toFixed(5) : amt;
        this.candleRemaining -= amtTotal;
    }

    setCandleRemaining = (amt, inTransition = false) => {
        if (amt && !inTransition) {
            this.transitionCandle(amt);
        } else if (amt) {
            this.candleRemaining = amt;
        } else {
            if (this.player.isRunning) {
                this.setCandleRemainingDecrease(0.001);

            } else if (this.player.isWalking) {
                this.setCandleRemainingDecrease(0.0005);

            } else {
                this.setCandleRemainingDecrease(0.0001);
            }
        }
        this.candleRemaining = Math.max(this.candleRemaining, this.minCandleRemaining);
    }

    update = (time, delta) => {
        if (this.candleRemaining > this.minCandleRemaining && this.player.isControllable) {
            this.setCandleRemaining();
        }
        const candleBurned = this.candleHeight - (this.candleHeight * this.candleRemaining);
        this.candle.setScale(1, this.candleRemaining);
        this.candle.setPosition(this.candlePosition.x, this.candlePosition.y + candleBurned);
        this.wick.setPosition(this.wick.x, this.candle.y - this.wickOffset);
        this.wick.setSize(this.wick.width, Math.min(5, 2 + (candleBurned / 2.5)));
        this.flame.setStrength(this.candleRemaining);
    }

    destroy = () => {
        this.parent.events.off("update", this.update, this);
        this.parent.events.off("shutdown", this.destroy, this);
        this.parent.events.off("destroy", this.destroy, this);
    }
}
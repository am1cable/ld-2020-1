import { gameRatio } from '../gameVariables';

export default class Candle extends Phaser.Scene {
    constructor() {
        super('candle');
    };

    init = () => {
        this.mapScene = this.scene.get('map1');
        this.scene.bringToTop();
        this.candleRemaining = 1;
        this.candle;
        this.padding = 10;
        this.candleHeight = (gameRatio.height / 10) - (this.padding * 2);
    };

    create = () => {
        this.candle = this.add.rectangle(0, 0, gameRatio.width / 20, this.candleHeight, 0x55aaff)
            .setOrigin(0, 0)
            .setPosition(this.padding, this.padding)
            .setStrokeStyle(2, 0x0000aa, 1);
        this.mapScene.startScene();
    }

    update = (time, delta) => {
        if (this.candleRemaining > 0.1) {
            if (this.mapScene.player.isRunning) {
                this.candleRemaining -= 0.001;

            } else if (this.mapScene.player.isWalking) {
                this.candleRemaining -= 0.0005;

            } else {
                this.candleRemaining -= 0.0001;
            }
            this.candleRemaining = Math.max(this.candleRemaining, 0.1);
            
            this.candle.setScale(1, this.candleRemaining);
            this.candle.setPosition(this.padding, this.padding + (this.candleHeight - (this.candleHeight * this.candleRemaining)));
        }
    }
};
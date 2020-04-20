import Candle from "../components/candle/candle";
import { gameRatio } from "../gameVariables";

export default class HUD extends Phaser.Scene {
    constructor() {
        super('hud');
    };

    init = () => {
        this.scene.bringToTop();
        this.camera = this.cameras.main;
        this.camera.zoom = 0.7;
        this.camera.setOrigin(0, 0);
        this.camera.setPosition(1, 1);
    };

    create = () => {
        this.mapScene = this.scene.get('map');
        this.candle = new Candle({parent: this, player: this.mapScene.player, size: gameRatio});
        this.mapScene.startScene();
    }

    update = (time, delta) => {        
    }
};
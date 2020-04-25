import Candle from "../components/candle/candle";
import { gameRatio } from "../gameVariables";
import { createText } from "../text";

export default class HUD extends Phaser.Scene {
    constructor() {
        super('hud');
    };

    init = () => {
        this.scene.bringToTop();
        this.camera = this.cameras.main;
        this.camera.zoom = 1;
        this.camera.setOrigin(0, 0);
        this.camera.setPosition(1, 1);
    };

    create = () => {
        this.mapScene = this.scene.get('map');
        this.candle = new Candle({parent: this, player: this.mapScene.player, size: gameRatio});
        this.mapScene.startScene();
        const instructions = 'wasd - move\ndouble tap - run\nf - grab crate';
        this.instructions = this.make.text(createText({ x: this.candle.candle.width + (this.candle.padding * 2), y: this.candle.padding }, instructions));
    }

    refresh = () => {
        this.mapScene = this.scene.get('map');
        this.candle.setPlayer(this.mapScene.player);
    }

    update = (time, delta) => {        
    }
};
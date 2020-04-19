import Phaser from 'phaser';
import Debugger from '../components/debugger/debugger';
import Player from '../components/player/player';
import Light from '../components/light/light';

export default class MapScene1 extends Phaser.Scene {
    constructor() {
        super('map1')
    }

    init = (data) => {
    }
    preload = () => { }

    create = () => {
        this.map = this.make.tilemap({ key: "map" });
        const tileset = this.map.addTilesetImage("map_bg_v1", "sprites");
        const bg = this.map.createStaticLayer("bg", tileset, 0, 0);
        bg.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(bg);
    }

    startScene = () => {
        const spawnPoint = this.map.findObject('points', obj => obj.type === "start");
        const lights = this.map.filterObjects('points', obj => obj.type = "relight");
        this.player = new Player({ parent: this, x: spawnPoint.x, y: spawnPoint.y });
        this.drawCamera(spawnPoint);
        this.drawLights(lights);
        this.debuggingTools = new Debugger(this);
    }

    drawLights = (lights) => {
        this.lightStations = [];
        lights.forEach(e => {
            this.lightStations.push(new Light({ parent: this, rect: e }));
        });
    }

    drawCamera = (spawnPoint) => {
        this.camera = this.cameras.main;
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera.startFollow(this.player.sprite);
        this.camera.fadeEffect.start(false, 400, 0, 0, 0);
    }

    update = (time, delta) => {
    }
}

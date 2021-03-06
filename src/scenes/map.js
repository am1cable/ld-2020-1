import Phaser from 'phaser';
import Debugger from '../components/debugger/debugger';
import Player from '../components/player/player';
import Light from '../components/light/light';
import Barrel from '../components/barrel/barrel';
import Box from '../components/box/box';
import End from '../components/end/end';
import Wind from '../components/wind/wind';
import { gameRatio } from '../gameVariables';
import { CandleManager } from '../components/candle/candle';

export default class MapScene extends Phaser.Scene {
    constructor() {
        super('map')
    }

    init = ({ restarting = false }) => {
        this.restarting = restarting;
        if (this.restarting) {

            this.candleManager.setCandleRemaining(1);
            this.candleManager.setWind();
        }
    }
    preload = () => {
    }

    create = () => {
        // debugger;
        this.candleManager = new CandleManager({ parent: this });
        this.map = this.make.tilemap({ key: "map" });
        const tileset = this.map.addTilesetImage("map_bg_v1", "sprites");
        const tileset2 = this.map.addTilesetImage("map_bg_v2", "sprites2");
        const bg = this.map.createStaticLayer("bg", tileset, 0, 0);
        bg.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(bg);
        let objects = this.map.getLayer("objects");
        objects = [...objects.data].reduce((list, line) => {
            const itemsInLine = line.filter(obj => obj.properties && obj.properties.name);
            return [...list, ...itemsInLine];
        }, []);
        this.boxes = [];
        this.barrels = [];
        this.brazier = []
        objects.forEach(obj => {
            if (obj.properties.name === "barrel") this.barrels.push(new Barrel({ parent: this, rect: obj }))
            if (obj.properties.name === "box") this.boxes.push(new Box({ parent: this, rect: obj }));
            if (obj.properties.name === "brazier") this.brazier.push(obj);
        });
        this.lamps = [];
        // this.createNewImageFromTileLayer({ name: "candles", newArray: this.lamps, tileSet: tileset2, imageKey: "sprites2" })
        this.drawPlayer();
        this.hud = this.scene.get('hud');
        if (this.restarting) {
            this.hud.refresh();
            this.startScene();
        }
    }

    createNewImageFromTileLayer = ({ name, newArray, tileSet, imageKey }) => {
        this.map.createStaticLayer(name, tileSet, 0, 0);
        const arrayOfIndexes = [];
        this.map.forEachTile(t => arrayOfIndexes.push(t.index), this, undefined, undefined, undefined, undefined, { isNotEmpty: true }, name);
        newArray = this.map.createFromTiles(arrayOfIndexes, -1, { key: imageKey }, undefined, name);
        newArray.forEach(sprite => {
            debugger;
        })
    }

    startScene = () => {
        this.candleManager.addCandle(this.hud.candle);
        // this.candleManager.addCandle(this.player.candle);         
        this.drawCamera();
        this.drawEnd();
        this.drawLights();
        this.drawWind();
        this.add.image(0, 0, 'foreground').setOrigin(0, 0).setDepth(this.map.heightInPixels + 1000);
        // this.debuggingTools = new Debugger(this);
        this.input.keyboard.on('keydown', this.startPlayerMove);
    }

    startPlayerMove = (e) => {
        var key = e.key;
        if (key === "w" || key === "a" || key === "s" || key === "d") {
            this.player.start();
            this.input.keyboard.off("keydown", this.startPlayerMove);
        }
    }

    drawPlayer = () => {
        const spawnPoint = this.map.findObject('points', obj => obj.type === "start");
        this.player = new Player({ parent: this, x: spawnPoint.x, y: spawnPoint.y });
    }

    drawEnd = () => {
        const endGame1 = this.map.findObject('points', obj => obj.type === "triggerEnd");
        const endGame2 = this.map.findObject('points', obj => obj.type === "end");
        this.end = new End({ parent: this, triggerPoint: endGame1, endPoint: endGame2, sprites: this.brazier });
    }

    drawLights = () => {
        const lights = [...this.map.filterObjects('points', obj => obj.type === "relight")];
        this.lightStations = [];
        lights.forEach(e => {
            this.lightStations.push(new Light({ parent: this, rect: e }));
        });
    }

    drawWind = () => {
        const windEmitters = this.map.getObjectLayer('wind_points').objects;
        this.wind = new Wind({ parent: this, windEmitters });
    }

    drawCamera = () => {
        this.camera = this.cameras.main;
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.camera.startFollow(this.player.sprite);
        this.camera.zoom = gameRatio.zoom;
        this.camera.fadeEffect.start(false, 400, 0, 0, 0);
    }

    fadeSceneRestart = () => {
        this.camera.fadeEffect.start(true, 400, 0, 0, 0);
        this.time.delayedCall(1 * 1000, () => this.scene.restart({ restarting: true }), [], this);
    }

    update = (time, delta) => {
    }
}

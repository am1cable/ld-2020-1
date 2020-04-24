import Phaser from 'phaser';
import LoadingScene from './scenes/loading';
import MapScene from './scenes/map';
import {gameRatio} from './gameVariables';
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import HUD from './scenes/hud';


const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  width: gameRatio.width,
  height: gameRatio.height,
  scale: {
    parent: undefined,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [LoadingScene, HUD, MapScene],
  physics: {
    default: "matter",
    matter: {
      gravity: {y: 0 },
      enableSleep: true
    }
  },plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
      }
    ]
  }
};

const game = new Phaser.Game(config);
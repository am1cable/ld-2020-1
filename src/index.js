import Phaser from 'phaser';
import {gameRatio} from './gameVariables';

const config = {
  type: Phaser.AUTO,
  // pixelArt: true,
  scale: {
    parent: 'perfect-baby',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameRatio.width,
    height: gameRatio.height,
  },
  scene: [],
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true,
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);

import { gameRatio } from '../gameVariables';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('loading')
  }
  preload = () => {
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x422f26, 1);
    progressBox.fillRect(((gameRatio.width - 40) / 2) / 2, gameRatio.height / 3, (gameRatio.width + 40) / 2, 50);

    var percentText = this.make.text({
      x: gameRatio.width / 2,
      y: gameRatio.width / 2 - 5,
      text: '0%',
      style: {
        font: '10px monospace',
        fill: '#1fad1f'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0x1fad1f, 1);
      progressBar.fillRect(((gameRatio.width) / 2) / 2, (gameRatio.height + 25) / 3, gameRatio.width / 2 * value, 35);
      percentText.setText(parseInt(value * 100) + '%');
    });
    
    this.load.tilemapTiledJSON('map', 'assets/map1.json');
    this.load.image('sprites', 'assets/sprites_1.png');
    this.load.image('sprites2', 'assets/sprites_2.png');
    this.load.atlas('sprites1', 'assets/sprites1-0.png', 'assets/sprites1.json');
    this.load.image('particle', 'assets/particle.png');
    this.load.audio('wind_3', 'assets/wind_3.m4a');
    this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');
    this.load.image('foreground', 'assets/map1-2.png');
  }

  create = () => {
     this.scene.start('map');
     this.scene.launch('hud');
  }
}
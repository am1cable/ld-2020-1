//just testing tools 
export default class Debugger {
  constructor(parent) {
    this.parent = parent;

    // this.parent.cameras.add(0, 0, 100, 100)
    //   .setName("mini")
    //   .setBounds(0, 0, this.parent.map.widthInPixels, this.parent.map.heightInPixels)
    //   .setPosition(0,0)
    //   .setZoom(0.1);

    // const debugGraphics = this.parent.add.graphics().setAlpha(0.25);
    // parent.tileMap.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });
    
    this.parent.matter.world.createDebugGraphic();
    this.parent.matter.world.drawDebug = true;

    // parent.traps.pathFinder.debugging = true;
  }
  update() {
  }
}
import EasyStar from 'easystarjs';

export default class PathFinder {
  constructor({ parent }) {
    this.map = parent.map;
    this.boxes = parent.boxes;
    this.barrels = parent.barrels;
    this.braziers = parent.brazierSprites;
    this.debugging = false;
    this.pathFinder = new EasyStar.js();
  }

  setupMap = () => {
    const mapBg = this.map.getLayer("bg");
    const mapTileArray = mapBg.data.map((x, indexX) => x.map((y, indexY) => {
      if (y.properties.isUnpassable) return 0;
      const isValidTile = true;
      return isValidTile ? 1 : 0;
    }));

    this.pathFinder.setAcceptableTiles([1]);
    this.pathFinder.setGrid(mapTileArray);
  }

  getPath = ({start, end, callback}) => {
    this.setupMap();
    this.pathFinder.findPath(Math.floor(start.x/32), Math.floor(start.y/32), Math.floor(end.x/32), Math.floor(end.y/32), (path) => {
      if (path) {
        const finalPath = path.map(e => ({ x: e.x * 32, y: e.y * 32 }));
        callback(finalPath);
      }
    }, [callback]);
    this.pathFinder.setIterationsPerCalculation(1000);
    this.pathFinder.calculate();
  }
  
}
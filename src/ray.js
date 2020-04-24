export const inDirectLineOfSight = ({ parent, blockableBodies, start, end }) => {
    const query = Phaser.Physics.Matter.Matter.Query;
    const mapBodies = getMapBodies(parent.map);
    const objectsInWay = query.ray([...mapBodies, ...blockableBodies], { x: start.x, y: start.y }, { x: end.x, y: end.y });
    return objectsInWay.length === 0;
}


export const objectsInSameCoridoorX = ({ parent, bodies = [], start }) => {
    const query = Phaser.Physics.Matter.Matter.Query;
    const mapBodies = getMapBodies(parent.map);
    const objectsInWay = query.ray([...mapBodies, ...bodies], { x: 0, y: start.y }, { x: parent.map.heightInPixels, y: start.y }, 30);
    return objectsInWay;
}

export const objectsInSameCoridoorY = ({ parent, bodies = [], start }) => {
    const query = Phaser.Physics.Matter.Matter.Query;
    const mapBodies = getMapBodies(parent.map);
    const objectsInWay = query.ray([...mapBodies, ...bodies], { x: start.x, y: 0 }, { x: start.x, y: parent.map.widthInPixels }, 30);
    return objectsInWay;
}

const getMapBodies = (map) => {
    const mapBodies = [];
    map.getLayer("bg").data.forEach((x) => mapBodies.push(...x.filter(y => y.physics.matterBody).map((y) => (y.physics.matterBody.body))));
    mapBodies.filter(b => b != undefined && b.bounds != undefined);
    return mapBodies;
}
import * as THREE from 'three'


export class Point {
    public x: number;
    public y: number;
    public z: number;
}



export class Building{
    public sizeX: number;
    public sizeY: number;
    public sizeZ: number;
    public position: Point;
    
}


export class BuildingManager {
    public buildings: Building[] = []

    constructor(){

    }

    GenerateBuildingModels(scene){
        for (var ind = 0; ind < this.buildings.length; ind++){
            const geometry = new THREE.BoxGeometry( this.buildings[ind].sizeX,  this.buildings[ind].sizeY, this.buildings[ind].sizeZ ); 
            const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
            const cube = new THREE.Mesh( geometry, material ); 


            var xOffset = this.buildings[ind].sizeX / 2
            var yOffset = this.buildings[ind].sizeY / 2
            var zOffset = this.buildings[ind].sizeZ / 2
            console.log({xOffset:xOffset,yOffset:yOffset})
            cube.position.x = this.buildings[ind].position.x + xOffset
            cube.position.y = this.buildings[ind].position.y + yOffset
            cube.position.z = this.buildings[ind].position.z + zOffset
            scene.add( cube );
        }
    }
}



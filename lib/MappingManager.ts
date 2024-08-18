export class MappingManager {

    public textureSizeX = 256
    public textureSizeY = 256
    public textureFileList: {fileName:string, rotation:number, u1:number,v1:number,u2:number,v2:number}[] = []
    public roadTypeTextureMap: {[id:string]:number} = {}
    public objectFileList: {objName:string, objPath:string, mtlPath:string, scale:{x:number,y:number,z:number}, rotation:{x:number,y:number,z:number}, offset:{x:number,y:number,z:number}}[]=[]

    constructor(){
        // Add All Texture Files To Load, w/ Rotations Required
        this.CreateTextureFileList()

        // Add All Model Files To Load, w/ Individual scaling / rotation...
        this.Create3dAssetList()

        this.CreateRoadTypeTextureMap()
    }

    // Texture Files To Load
    CreateTextureFileList(){
        this.AddTextureFile(0,"uvMap.png",0)
        this.AddTextureFile(1,"dirt.png",0)
        this.AddTextureFile(2,"dryGrass.png",0)

        // Road
        this.AddTextureFile(3,"road.png",90)
        this.AddTextureFile(4,"road.png",180)
        this.AddTextureFile(5,"road.png",270)
        this.AddTextureFile(6,"road.png",0)

        // 3 Way Placeholder..
        this.AddTextureFile(10,"troad.png",0)
        this.AddTextureFile(7,"troad.png",90)
        this.AddTextureFile(8,"troad.png",180)
        this.AddTextureFile(9,"troad.png",270)

        // 4 Way Placeholder..
        this.AddTextureFile(11,"4way.png",0)
        this.AddTextureFile(12,"4way.png",90)
        this.AddTextureFile(13,"4way.png",180)
        this.AddTextureFile(14,"4way.png",270)

        // UTurn Placeholder..
        this.AddTextureFile(18,"uturn.png",0)
        this.AddTextureFile(15,"uturn.png",90)
        this.AddTextureFile(16,"uturn.png",180)
        this.AddTextureFile(17,"uturn.png",270)

        // 90 DEG Placeholder..
        this.AddTextureFile(19,"90road.png",0)
        this.AddTextureFile(20,"90road.png",90)
        this.AddTextureFile(21,"90road.png",180)
        this.AddTextureFile(22,"90road.png",270)
    }

    // Road To Texture Mapping
    CreateRoadTypeTextureMap(){
        // Index: Road Type, Value: RoadTextureIndex
        this.roadTypeTextureMap['paved000'] = 3
        this.roadTypeTextureMap['paved090'] = 4
        this.roadTypeTextureMap['paved180'] = 5
        this.roadTypeTextureMap['paved270'] = 6

        this.roadTypeTextureMap['paved3way000'] = 7
        this.roadTypeTextureMap['paved3way090'] = 8
        this.roadTypeTextureMap['paved3way180'] = 9
        this.roadTypeTextureMap['paved3way270'] = 10

        this.roadTypeTextureMap['paved4way000'] = 11
        this.roadTypeTextureMap['paved4way090'] = 12
        this.roadTypeTextureMap['paved4way180'] = 13
        this.roadTypeTextureMap['paved4way270'] = 14

        this.roadTypeTextureMap['paveddead000'] = 15
        this.roadTypeTextureMap['paveddead090'] = 16
        this.roadTypeTextureMap['paveddead180'] = 17
        this.roadTypeTextureMap['paveddead270'] = 18
    }
    
    // 3d Assets To Load (fileName, ObjectName, scale, rotation)
    Create3dAssetList(){
        this.Add3dAssetObj("/male","male", {x:0.1,y:0.1,z:0.1}, {x:90,y:0,z:0}, {x:0,y:0,z:0})
        this.Add3dAssetObj("/factory","factory", {x:1,y:1,z:1}, {x:0,y:0,z:0}, {x:-10,y:0,z:0})
    }
    
    // Converts Road Type To Road Texture
    RoadTypeToTexture(roadType:string,direction:string){
        // Add Direction To String & Check If Key Exists & Return
        roadType += direction
        if (roadType in this.roadTypeTextureMap){
            return this.roadTypeTextureMap[roadType]
        }
        else{
            console.error("MappingManager:RoadTypeToTexture: Invalid Road Type: ", roadType)
        }
    }

    // Adds a 3d Asset of Type .obj To Models To Load
    // ./folder/filesToLoad (Both .obj & .mtl Required)
    Add3dAssetObj(fileName:string, objName:string, scale:{x:number,y:number,z:number}, rotation:{x:number,y:number,z:number}, offset:{x:number,y:number,z:number}){
        const objPath = "assets/models/" + fileName + "/" + fileName + ".obj"
        const mtlPath = "assets/models/" + fileName + "/" + fileName + ".mtl"
        rotation.x = rotation.x * (Math.PI/180)
        rotation.y = rotation.y * (Math.PI/180)
        rotation.z = rotation.z * (Math.PI/180)

        this.objectFileList.push({objName,objPath,mtlPath,scale,rotation,offset})
    }

    AddTextureFile(texInd:number,_fileName:string, rotation:number){
        if (rotation == 0) this.textureFileList[texInd] = {fileName:_fileName, rotation:0,u1:0,v1:0,u2:0,v2:0}
        else if (rotation == 90) this.textureFileList[texInd] = {fileName:_fileName, rotation:90,u1:0,v1:0,u2:0,v2:0}
        else if (rotation == 180) this.textureFileList[texInd] = {fileName:_fileName, rotation:180,u1:0,v1:0,u2:0,v2:0}
        else if (rotation == 270) this.textureFileList[texInd] = {fileName:_fileName, rotation:270,u1:0,v1:0,u2:0,v2:0}
    }

}
import { TileArea, TerrainRenderer } from './TerrainRenderer';
import { MappingManager } from './MappingManager';

// Road Types
// Gravel
// Paved 2 Lane
//


// Assets Required Per Road Type
// Intersection 3-way
// Intersection 4-way
// Intersection DeadEnd
// Road-> Other
// Road East -> West
// Road North -> South


export class Road {
    public vrt1: {x:number, y:number}
    public vrt2: {x:number, y:number}
    public type: string
    public congestion: number
    public vertical: boolean

    constructor(vrt1:{x:number,y:number},vrt2:{x:number,y:number}, type:string){
        this.vrt1 = vrt1
        this.vrt2 = vrt2
        this.type = type
        this.congestion = 0 // Initilize to none = new road
    }

    // Get Road Direction From Vertexs For Texturing
    IsRoadNorthSouth(){
        if (this.vrt1.x == this.vrt2.x){
            return true
        }
        else{
            return false
        }
    }
}





export class RoadManager {

    public ref_mappingManager
    public ref_terrainRenderer
    public roadTypeArr: {isRoad:boolean,type:number}[][] = []
    public roadsArr: Road[] = []

    constructor(terrainRenderer: TerrainRenderer, mappingManager:MappingManager){
        this.ref_terrainRenderer = terrainRenderer
        this.ref_mappingManager = mappingManager

        const value = {isRoad:false,type:-1}
        this.roadTypeArr = [...Array(this.ref_terrainRenderer.sizeX)].map(e => Array(this.ref_terrainRenderer.sizeX).fill(value));

        this.roadTypeArr[0][0].isRoad = false 

        for (var x = 0; x<this.ref_terrainRenderer.sizeX; x++){
            for (var y = 0; y<this.ref_terrainRenderer.sizeY; y++){
                this.roadTypeArr[x][y].isRoad = false 
                this.roadTypeArr[x][y].type = -1
            }
        }
        
    }





    UpdateRoadTypeArr(x1:number,y1:number,x2:number,y2:number,_type:number){
        // Always Sort Low To High
        if (x1 > x2){
            var temp = x1
            x1 = x2
            x2 = temp
        }
        if (y1 > y2){
            var temp = y1
            y1 = y2
            y2 = temp
        }

        // Apply
        for (var x = x1; x <= x2; x++){
            for (var y = y1; y < y2; y++){
                this.roadTypeArr[x][y] = {isRoad:true,type:_type}
            }
        }
    }

    // Roads Must be N->S or E-> W 
    // Adding a road should call the terrain manager and update texture based on road type
    AddRoad(x1:number,y1:number,x2:number,y2:number, roadType:string){

        /// Need To Check if existing road..... and not add or update....

        console.log("Called")
        
        var vertex1 = {x:x1,y:y1}
        var vertex2 = {x:x2,y:y2}
        // Create Tile Area From Road Vertexs
        var roadArea = new TileArea(vertex1.x,vertex1.y,vertex2.x,vertex2.y)


       
        // Validation
        if (!this.ref_terrainRenderer.TileAreaInBounds(roadArea)){
            console.error("RoadManager:AddRoad:Road Area OutOfBounds")
        }

        // Complete Request
        else{
            // Add Road To Road Graph
            
            var road = new Road(vertex1,vertex2,roadType)
            this.roadsArr.push(road)

            // Convert Road Type / Direction To Texture
            // Format = roadType + 0 Or 1
            // Eg: 101
            var angle
            if (road.IsRoadNorthSouth()){
                angle = "090"
            }
            else{
                angle = "000"
            }
            var roadTexture = this.ref_mappingManager.RoadTypeToTexture(roadType, angle)
            
            



            // Add To Road Array
            for (var x = vertex1.x; x <= vertex2.x; x++){
                for (var y = vertex1.y; y <= vertex2.y; y++){
                    this.roadTypeArr[x][y] = {isRoad:true,type:roadTexture}
                }
            }
            
            if (roadTexture != undefined){
                // Apply Road Texture To Road Internal Items
                this.ref_terrainRenderer.UpdateAreaTexture(roadArea,roadTexture)

                var vrt1Tex = this.CalculateEndType(vertex1.x,vertex1.y)
                this.ref_terrainRenderer.UpdateTileTexture(vertex1.x,vertex1.y,vrt1Tex)

                var vrt2Tex = this.CalculateEndType(vertex2.x,vertex2.y)
                this.ref_terrainRenderer.UpdateTileTexture(vertex2.x,vertex2.y,vrt2Tex)
               
            }
            
             
        }
        
        
    }


    CalculateEndType(x:number,y:number){

        var neighbours: {isRoad:boolean,type:number}[]=[]
        // Calculate Intersection Connections
        if (x-1 >= 0 && x-1 <= this.ref_terrainRenderer.sizeX && y >= 0 && y <= this.ref_terrainRenderer.sizeY){
            neighbours.push(this.roadTypeArr[x-1][y])
        }
        else{
            neighbours.push({isRoad:false,type:-1})
        }

        if (x >= 0 && x <= this.ref_terrainRenderer.sizeX && y+1 >= 0 && y+1 <= this.ref_terrainRenderer.sizeY){
            neighbours.push(this.roadTypeArr[x][y+1])
        }
        else{
            neighbours.push({isRoad:false,type:-1})
        }

        if (x+1 >= 0 && x+1 <= this.ref_terrainRenderer.sizeX && y >= 0 && y <= this.ref_terrainRenderer.sizeY){
            neighbours.push( this.roadTypeArr[x+1][y])
        }
        else{
            neighbours.push({isRoad:false,type:-1})
        }

        if (x >= 0 && x <= this.ref_terrainRenderer.sizeX && y-1 >= 0 && y-1 <= this.ref_terrainRenderer.sizeY){
            neighbours.push(this.roadTypeArr[x][y-1])
        }
        else{
            neighbours.push({isRoad:false,type:-1})
        }

        
        // Sum Connections
        var connections = 0
        for (var ind = 0; ind <= 3; ind++){
            if (neighbours[ind].isRoad){
                connections++
            }
        }
        console.log("Connections:",connections)
        // Handle 4 Way
        if(connections == 4){
            // Is4Way
            return 11
        }

        else if(connections == 3){
            // Is 3 Way
            if (neighbours[0].isRoad && neighbours[1].isRoad && neighbours[2].isRoad ){
                return 7
            }
            else if(neighbours[1].isRoad && neighbours[2].isRoad && neighbours[3].isRoad ){
                return 8
            }
            else if(neighbours[2].isRoad && neighbours[3].isRoad && neighbours[0].isRoad ){
                return 9
            }
            else if(neighbours[3].isRoad && neighbours[0].isRoad && neighbours[1].isRoad ){
                return 10
            }

        }

        else if(connections == 2){
            // Is 2 Way
            if (neighbours[0].isRoad && neighbours[1].isRoad){
                return 19
            }
            else if (neighbours[1].isRoad && neighbours[2].isRoad){
                return 20
            }
            else if (neighbours[2].isRoad && neighbours[3].isRoad){
                return 21
            }
            else if (neighbours[3].isRoad && neighbours[0].isRoad){
                return 22
            }
        }

        else if(connections == 1){
            if (neighbours[0].isRoad){
                return 15
            }
            else if (neighbours[1].isRoad){
                return 16
            }
            else if (neighbours[2].isRoad){
                return 17
            }
            else if (neighbours[3].isRoad){
                return 18
            }
        }

        return 0

    }

    GetRoute(vertex1:{x:number,y:number}, vertex2:{x:number,y:number}){

    }
}



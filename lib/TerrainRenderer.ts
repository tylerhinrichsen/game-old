import * as THREE from 'three'
import {TextureLoader, DefaultLoadingManager} from 'three'
import { MappingManager } from './MappingManager'


class TileData {
    public p00:number
    public p01:number
    public p10:number
    public p11:number
    public texture:number
  }


// Helper Class To Hold a tileArea (x1,y1 -> x2,y2)
export class TileArea{
    public x1: number
    public x2: number
    public y1: number
    public y2: number
    public vertex1: {x:number,y:number}
    public vertex2: {x:number,y:number}

    constructor (x1:number, y1:number, x2:number, y2:number){
        this.x1 = x1
        this.x2 = x2
        this.y1 = y1
        this.y2 = y2
        
        if (x2 < x1){
            this.x2 = x1
            this.x1 = x2
        }
        if (y2 < y1){
            this.y1 = y2
            this.y2 = y1
        }
        this.vertex1 = {x:this.x1,y:this.y1}
        this.vertex2 = {x:this.x2,y:this.y2}
    }
}

export class TileAreaPt{
    public x1: number
    public y1: number
    public pt1: number

    public x2: number
    public y2: number
    public pt2:number
    

    constructor (x1:number, y1:number, pt1:number, x2:number, y2:number,pt2:number){
        this.x1 = x1
        this.x2 = x2
        this.y1 = y1
        this.y2 = y2
        this.pt1 = pt1
        this.pt2 = pt2
        if (x2 < x1){
            this.x2 = x1
            this.x1 = x2
        }
        if (y2 < y1){
            this.y1 = y2
            this.y2 = y1
        }
    }
}


// Class Functions ---------------

// Rendering Functions ///////////////
// PUBLIC: RebuildAndRender(scene)
// PUBLIC: ApplyHeightMap()

// HeightMap Functions //////////////
// PUBLIC: IsTileFlat(x:number,y:number)
// PUBLIC: IsTileAreaFlat(tileArea:TileArea)
// PUBLIC: ModifyTileHeight(x:number,y:number,raise:boolean)
// PUBLIC: GetFlatTileHeight(x:number, y:number)

// TextureMap Functions /////////////
// PUBLIC: UpdateTileTexture(x:number, y:number, texture:number)
// PUBLIC: UpdateAreaTexture(tileArea:TileArea, texture:number)

// Validation Functions ////////////
// PRIVATE: ValidateTileHeightChange(x:number,y:number, raise:boolean)
// PRIVATE: TileInBounds(x:number, y:number){ 
// PRIVATE: TileAreaInBounds(tileArea:TileArea){

// Asset Loading Functions ////////////
// PRIVATE: LoadWait(sizeX: number, sizeY: number)
// PUBLIC: ASYNC loadHeightMap(sizeX:number, sizeY:number)


export class TerrainRenderer{
    public vrtArr
    public vrtArrSz
    public indArr
    public indArrSz
    public uvsArr
    public uvArrSz

    public sizeX
    public sizeY
    public tileSize
    public maxHeightDiff = 1
    public tileHeightStepSize = 1

    public ref_threeScene
    public ref_textureMap
    public ref_mappingManager: MappingManager // Doesnt Change

    public heightMap
    public textureMap: {u1:number, v1:number, u2:number,v2:number}[] = []
    public wallsNS: {[id:string]: boolean;} = {}
    public wallsEW: {[id:string]: boolean;} = {}
    public terrainTextureMap: number[][] = []

    // Initilization Of Terrain Mananager
    constructor(sizeX:number, sizeY:number, tileSize:number, baseHeightMap:number[][], scene:THREE.Scene, mappingManager:MappingManager){

        



        this.ref_threeScene = scene
        this.ref_mappingManager = mappingManager
        this.heightMap = baseHeightMap
        this.sizeX = sizeX
        this.sizeY = sizeY
        this.tileSize = tileSize
        var size = sizeX * sizeY // Total Tiles

        // Grid Size
        this.vrtArrSz =     size * 4 * 3           // 4 Vertex Per Tile
        this.indArrSz =     size * 6            // 6 Indcie Per Tile
        this.uvArrSz =      this.vrtArrSz * 2   // 2 Uvs Per Vertex

        // Generate Mesh Data Arrays
        this.vrtArr =       new Float32Array(this.vrtArrSz)
        this.indArr =       new Uint32Array(this.indArrSz)
        this.uvsArr =       new Float32Array(this.uvArrSz)


        // Populate Texture Maps
        const value = 0 // Default Texture
        this.terrainTextureMap = [...Array(this.sizeX)].map(e => Array(this.sizeY).fill(value));

        // Size of the Texture File Size
        const texFileX = 1000 // Pixels
        const texFileY = 1000 // Pixels
        const numX = 6.0 // Number Of Textures along X Axis
        const numY = 6.0 // Number of Textures Along Y Axis


        for (var ind = 0; ind < mappingManager.textureFileList.length; ind++){
            
            var texture = mappingManager.textureFileList[ind]
            var u1 = texture.u1
            var v1 = texture.v1
            var u2 = texture.u2
            var v2 = texture.v2
            this.textureMap[ind] = {u1,v1,u2,v2}
        }

        // Generate Base Mesh
        var vrtInd = 0
        var vrtCnt = 0
        var uvsInd = 0
        var indInd = 0

        // Generate Terrain World Offset -> Ensure Terrain Is Centered on 0,0
        var xOffset = (this.sizeX * this.tileSize) * -0.5
        var yOffset = (this.sizeY * this.tileSize) * -0.5

        for (var x = 0; x < this.sizeX; x++){
            for (var y = 0; y < this.sizeY; y++){

                // Generates One Tile w/ 2 Faces
                // Uses Base UV Texture: 0,0 -> 0.2,0.2
                const baseTextureId = 0
                
                // Vertex 0,0
                this.vrtArr[vrtInd+0] =       (x+0) * this.tileSize + xOffset
                this.vrtArr[vrtInd+1] =     (y+0) * this.tileSize + yOffset
                this.vrtArr[vrtInd+2] =      Math.round(baseHeightMap[x+0][y+0])
                this.uvsArr[uvsInd+0] =      this.textureMap[baseTextureId].u1
                this.uvsArr[uvsInd+1] =      this.textureMap[baseTextureId].v1

                // Vertex 1,0
                this.vrtArr[vrtInd+3] =       (x+1) * this.tileSize + xOffset
                this.vrtArr[vrtInd+4] =     (y+0) * this.tileSize + yOffset
                this.vrtArr[vrtInd+5] =      Math.round(baseHeightMap[x+1][y+0])
                this.uvsArr[uvsInd+2] =      this.textureMap[baseTextureId].u1
                this.uvsArr[uvsInd+3] =      this.textureMap[baseTextureId].v2

                // Vertex 0,1
                this.vrtArr[vrtInd+6] =       (x+0) * this.tileSize + xOffset
                this.vrtArr[vrtInd+7] =     (y+1) * this.tileSize + yOffset
                this.vrtArr[vrtInd+8] =      Math.round(baseHeightMap[x+0][y+1])
                this.uvsArr[uvsInd+4] =      this.textureMap[baseTextureId].u2
                this.uvsArr[uvsInd+5] =      this.textureMap[baseTextureId].v1

                // Vertex 1,1
                this.vrtArr[vrtInd+9] =       (x+1) * this.tileSize + xOffset
                this.vrtArr[vrtInd+10] =     (y+1) * this.tileSize + yOffset
                this.vrtArr[vrtInd+11] =      Math.round(baseHeightMap[x+1][y+1])
                this.uvsArr[uvsInd+6] =      this.textureMap[baseTextureId].u2
                this.uvsArr[uvsInd+7] =      this.textureMap[baseTextureId].v2

                // Face 1
                this.indArr[indInd+0] =       vrtCnt+0
                this.indArr[indInd+1] =       vrtCnt+1
                this.indArr[indInd+2] =       vrtCnt+2

                // Face 2
                this.indArr[indInd+3] =       vrtCnt+1
                this.indArr[indInd+4] =       vrtCnt+2
                this.indArr[indInd+5] =       vrtCnt+3

                // Apply Array Index Jumps - Minimizes Data Memory Updating
                vrtCnt += 4
                indInd += 6
                uvsInd += 8
                vrtInd += 12
            }
        }
    }


    // Raise Or Lower A Tile By The Step Size
    ModifyTileHeight(x:number,y:number,raise:boolean){
        if(!this.TileInBounds(x,y)){
            console.error("TerrainRenderer:ModifyTileHeight:Tile Selected OutofBounds")
        }
        else{
            var dist
            if (raise){
                dist = this.tileHeightStepSize
            }
            else{
                dist = -this.tileHeightStepSize
            }
            
    
            // Get Tallest or Lowest
            var heights: {ht:number}[] = []
            heights[0] = {ht:this.heightMap[x+0][y+0]}
            heights[1] = {ht:this.heightMap[x+1][y+0]}
            heights[2] = {ht:this.heightMap[x+0][y+1]}
            heights[3] = {ht:this.heightMap[x+1][y+1]}
    
            heights.sort((a,b) => a.ht - b.ht)
    
            // Tile Is Level
            if (heights[0].ht == heights[3].ht){
                this.heightMap[x+0][y+0] += dist
                this.heightMap[x+1][y+0] += dist
                this.heightMap[x+0][y+1] += dist
                this.heightMap[x+1][y+1] += dist
            }
            else{
                if(raise){
                    this.heightMap[x+0][y+0] = heights[3].ht
                    this.heightMap[x+1][y+0] = heights[3].ht
                    this.heightMap[x+0][y+1] = heights[3].ht
                    this.heightMap[x+1][y+1] = heights[3].ht
                }
                else{
                    this.heightMap[x+0][y+0] = heights[0].ht
                    this.heightMap[x+1][y+0] = heights[0].ht
                    this.heightMap[x+0][y+1] = heights[0].ht
                    this.heightMap[x+1][y+1] = heights[0].ht
                }
            }
            this.ValidateTileHeightChange(x,y,raise)

        }
    }

    // Propogates Tile Height Change To Neighbouring Tiles Based on maximum tile height difference (Slope...)
    // Private Function
    ValidateTileHeightChange(x:number,y:number, raise:boolean){

        // Create a list of the outer paremeter tiles around the changed tile, expanding each iteration 
        for (var offsetLimit = 1; offsetLimit <= 100; offsetLimit++){
            var offsetIndex = 0
            var allTilesValid = true
            // Create List
            var offsets: {x:number, y:number}[] = []

            // Traverse Y Axis Edges
            for (var offset = -offsetLimit; offset <= offsetLimit; offset++){
                
                // Left Side
                offsets[offsetIndex] = {x:0,y:0}
                offsets[offsetIndex].x = x - offsetLimit
                offsets[offsetIndex].y = y + offset
                offsetIndex += 1
                

                // Right Side
                offsets[offsetIndex] = {x:0,y:0}
                offsets[offsetIndex].x = x + offsetLimit
                offsets[offsetIndex].y = y + offset
                offsetIndex += 1
            }
            

            // Traverse X Axis Edges
            for (var offset = -offsetLimit + 1; offset < offsetLimit; offset++){
                // Top Side
                offsets[offsetIndex] = {x:0,y:0}
                offsets[offsetIndex].x = x - offset
                offsets[offsetIndex].y = y + offsetLimit
                offsetIndex += 1

                // Bottom Side
                offsets[offsetIndex] = {x:0,y:0}
                offsets[offsetIndex].x = x - offset 
                offsets[offsetIndex].y = y - offsetLimit
                offsetIndex += 1
            }

            // Check If Tiles Are Valid
            for (var index = 0; index < offsetIndex; index++){
                var xPos = offsets[index].x
                var yPos = offsets[index].y

                // Check If Tile Position is inbounds
                if (xPos >= 0 && yPos >= 0 && xPos < this.sizeX && yPos < this.sizeY){

                    // Get Tile Heights
                    var heights: {ht:number}[] = []
                    heights[0] = {ht:this.heightMap[xPos+0][yPos+0]}
                    heights[1] = {ht:this.heightMap[xPos+1][yPos+0]}
                    heights[2] = {ht:this.heightMap[xPos+0][yPos+1]}
                    heights[3] = {ht:this.heightMap[xPos+1][yPos+1]}

                    // Sort Low to High
                    heights.sort((a,b) => a.ht - b.ht)
                    if (Math.abs(heights[0].ht - heights[3].ht) >= this.maxHeightDiff){
                        allTilesValid = false

                        if (raise){ // Move Lower Up...
                            if (heights[3].ht - this.heightMap[xPos+0][yPos+0] > this.maxHeightDiff){
                                this.heightMap[xPos+0][yPos+0]  = heights[3].ht - this.maxHeightDiff
                            }
                            if (heights[3].ht - this.heightMap[xPos+1][yPos+0] > this.maxHeightDiff){
                                this.heightMap[xPos+1][yPos+0] = heights[3].ht - this.maxHeightDiff
                            }
                            if (heights[3].ht - this.heightMap[xPos+0][yPos+1] > this.maxHeightDiff){
                                this.heightMap[xPos+0][yPos+1] = heights[3].ht - this.maxHeightDiff
                            }
                            if (heights[3].ht - this.heightMap[xPos+1][yPos+1] > this.maxHeightDiff){
                                this.heightMap[xPos+1][yPos+1]  = heights[3].ht - this.maxHeightDiff
                            }
                        }
                        else{ // Move Uppers Down
                            if (Math.abs(this.heightMap[xPos+0][yPos+0] - heights[0].ht) > this.maxHeightDiff){
                                this.heightMap[xPos+0][yPos+0] = heights[0].ht + this.maxHeightDiff
                            }
                            if (Math.abs(this.heightMap[xPos+1][yPos+0] - heights[0].ht) > this.maxHeightDiff){
                                this.heightMap[xPos+1][yPos+0] = heights[0].ht + this.maxHeightDiff
                            }
                            if (Math.abs(this.heightMap[xPos+0][yPos+1] - heights[0].ht) > this.maxHeightDiff){
                                this.heightMap[xPos+0][yPos+1] = heights[0].ht + this.maxHeightDiff
                            }
                            if (Math.abs(this.heightMap[xPos+1][yPos+1] - heights[0].ht) > this.maxHeightDiff){
                                this.heightMap[xPos+1][yPos+1] = heights[0].ht + this.maxHeightDiff
                            }
                        }
                    }
                }
            }

            if (allTilesValid){
                break
            }
        }
    }

    // Completed - Validated
    // Public Function
    UpdateTileTexture(x:number, y:number, texture:number){
        // Validation
        if(!this.TileInBounds(x,y)){
            console.error("TerrainRenderer:UpdateTileTexture:Tile OutOfBounds")
        }

        // Complete Request
        else{
            if (texture < this.textureMap.length && texture >= 0){
                this.textureMap[x][y] = texture
                // x * ySize + y
                var tileOffset = (x * this.sizeY + y) 
                var uvsInd = tileOffset * 8
    
                // Vertex 0,0
                this.uvsArr[uvsInd+0] =     this.textureMap[texture].u1
                this.uvsArr[uvsInd+1] =     this.textureMap[texture].v1
    
                // Vertex 0,1
                this.uvsArr[uvsInd+2] =     this.textureMap[texture].u1
                this.uvsArr[uvsInd+3] =     this.textureMap[texture].v2
    
                // Vertex 1,0
                this.uvsArr[uvsInd+4] =     this.textureMap[texture].u2
                this.uvsArr[uvsInd+5] =     this.textureMap[texture].v1
    
                // Vertex 1,1
                this.uvsArr[uvsInd+6] =     this.textureMap[texture].u2
                this.uvsArr[uvsInd+7] =     this.textureMap[texture].v2
            }
            else{
                console.error("TerrainRenderer:UpdateTileTexture: Invalid Texture Index Selected: ", texture, " IsInvalid Limit: 0->",this.textureMap.length-1)
            }
        }
    }


    // Completed - Validated
    // Public Function
    UpdateAreaTexture(tileArea:TileArea, texture:number){
        // Validation...
        if(!this.TileAreaInBounds(tileArea)){
            console.log("TerrainRenderer:UpdateAreaTexture:TileAreaOutOfBounds")
        }

        // Complete Request
        else{
            
            for (var x = tileArea.x1; x <= tileArea.x2; x++){
                for (var y = tileArea.y1; y <= tileArea.y2; y++){
                    this.UpdateTileTexture(x,y,texture)
                }
            }
        }
    }

    GetTexture(x:number,y:number){
        if (x >= 0 && x <= this.sizeX && y >= 0 && y <= this.sizeY){
            return this.terrainTextureMap[x][y]
        }
        else{
            return -1
        }
    }

    // Completed
    // Gets the tile height -> If the tile is flat
    // Used for placement of buildings and ingame assests
    // returns -1 if tile is not flat
    GetFlatTileHeight(x:number, y:number){
        // Check For Bounds
        if (!this.TileInBounds(x,y)){
            console.error("TerrainRenderer:GetFlatTileHeight:Tile OutOfBounds")
        }

        // Check If Tile Is Flat
        if (!this.IsTileFlat(x,y)){
            console.error("TerrainRenderer:GetFlatTileHeight:Tile Not Flat")
            return -1
        }

        // Return Height
        return this.heightMap[x+0][y+0]
    }



    ///////////////////////////////////////////////////////////////////////
    /// Helper Functions
    ///////////////////////////////////////////////////////////////////////
    
    // Check if TileAreaIsInBounds
    TileAreaInBounds(tileArea:TileArea){
        if (tileArea.x1 >= 0 && tileArea.y1 >= 0 && tileArea.x1 < this.sizeX && tileArea.y1 < this.sizeY){
            if (tileArea.x2 >= 0 && tileArea.y2 >= 0 && tileArea.x2 < this.sizeX && tileArea.y2 < this.sizeY){
                return true
            }
        }
        return false
    }

    // Check If Tile Selected is outofbounds
    TileInBounds(x:number, y:number){ 
        if (x >= 0 && y >= 0 && x < this.sizeX && y < this.sizeY){
            return true
        }
        else{
            return false
        }
        
    }

    // Checks If Tile Is Flat
    IsTileFlat(x:number,y:number){ 
        // Get Tile Heights
        var heights: {ht:number}[] = []
        heights[0] = {ht:this.heightMap[x+0][y+0]}
        heights[1] = {ht:this.heightMap[x+1][y+0]}
        heights[2] = {ht:this.heightMap[x+0][y+1]}
        heights[3] = {ht:this.heightMap[x+1][y+1]}

        // Sort Low to High
        heights.sort((a,b) => a.ht - b.ht)
        
        if(heights[0].ht = heights[3].ht){
            return true
        }
        else{
            return false
        }
    }

    // Checks if TileArea Is Flat
    IsTileAreaFlat(tileArea:TileArea){
        // Validation
        if(!this.TileAreaInBounds(tileArea)){
            console.error("TerrainRenderer:IsTileAreaFlat:TileAreaOutOfBounds")
        }

        // Complete Request
        else{
            var allFlat = true
            loopX: for (var x = tileArea.x1; x <= tileArea.x2; x++){
                loopY: for(var y = tileArea.y1; y <= tileArea.y2; y++){
                    if(!this.IsTileFlat(x,y)){
                        allFlat = false
                        break loopX;
                    }
                }
            }
            return allFlat
        }
    }






    ///////////////////////////////////////////////////////////////////////
    /// Rendering Functions Below.....
    ///////////////////////////////////////////////////////////////////////


    // Apply Height Map Values To Mesh Vertex Array
    // Private Function
    ApplyHeightMap(){
        var vrtInd = 0
        for (var x = 0; x < this.sizeX; x++){
            for (var y = 0; y < this.sizeY; y++){
                this.vrtArr[vrtInd+2] =      Math.round(this.heightMap[x+0][y+0])
                this.vrtArr[vrtInd+5] =      Math.round(this.heightMap[x+1][y+0])
                this.vrtArr[vrtInd+8] =      Math.round(this.heightMap[x+0][y+1])
                this.vrtArr[vrtInd+11] =      Math.round(this.heightMap[x+1][y+1])
                vrtInd += 12
            }
        }
    }

    // Completed - Functional
    // Rebuilds Terrain Mesh & Texture From HeightMap & Uv Map
    // Public Function
    RebuildAndRender(){

        let obj = this.ref_threeScene.getObjectByName("terrain")
		if (obj != null){
			this.ref_threeScene.remove(obj)
			obj.geometry.dispose()
			obj.material.dispose()
		}
        // Generate
        this.ApplyHeightMap()
        const geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.BufferAttribute( this.vrtArr, 3 ) );
		geometry.setIndex(  new THREE.BufferAttribute( this.indArr, 1) );
		geometry.setAttribute( 'uv', new THREE.BufferAttribute( this.uvsArr, 2 ) );
        const uvTex = new THREE.TextureLoader().load( "/terraintexture.png" );
        
		//const material = new THREE.MeshBasicMaterial( {  map: uvTex,   side: THREE.DoubleSide, } );
        const material = new THREE.MeshBasicMaterial( {  map: this.ref_textureMap,   side: THREE.DoubleSide, } );
		//material.wireframe = true
		const mesh = new THREE.Mesh( geometry, material );
		mesh.name = "terrain"
		this.ref_threeScene.add( mesh )
    }


    LoadTextureMap(texture: THREE.Texture) {
        this.ref_textureMap = texture
    }
}



// Load Textures, Rotate & Apply To Canvas



// functioning
  export function LoadWait(sizeX: number, sizeY: number) {
    const getTextures = () =>
      new Promise<number[][]>((resolve, reject) => {
        const loader = new TextureLoader();
        const heightMap: number[][] = [];
  
        for (let x = 0; x < sizeX; x++) {
          heightMap[x] = [];
          for (let y = 0; y < sizeY; y++) {
            heightMap[x][y] = 0;
          }
        }
  
        const texture = loader.load('./assets/heightmap.png', (loadedHeightMap) => {
          const canvas = document.createElement('canvas');
          canvas.width = sizeX;
          canvas.height = sizeY;
  
          const context = canvas.getContext('2d', { willReadFrequently: true });
  
          if (context !== null) {
            context.drawImage(loadedHeightMap.image, 0, 0, sizeX, sizeY);
  
            for (let x = 0; x < sizeX; x++) {
              for (let y = 0; y < sizeY; y++) {
                const pixelData = context.getImageData(x, y, 1, 1).data;
                heightMap[x][y] = ((pixelData[0] + pixelData[1] + pixelData[2]) / 3) * 0.01;
              }
            }
  
            resolve(heightMap);
          } else {
            reject(new Error('Failed to get 2D context.'));
          }
        });
      });
  
    return getTextures();
  }


// functioning
// Loads Height Map File For Terrain
export async function loadHeightMap(sizeX:number, sizeY:number) {

    try {
      // Load 1 Larger on each axis as heightmap is based on tile vertex points...
      const heightMap = await LoadWait(sizeX+1, sizeY+1);
  
      return heightMap
    } catch (error) {
        console.error('Error loading heightMap:', error);
        const heightMap: number[][] = []
        return heightMap
    }
  }






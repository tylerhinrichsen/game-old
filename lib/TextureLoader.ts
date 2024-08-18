import * as THREE from 'three'
import {TextureLoader, DefaultLoadingManager} from 'three'
import { MappingManager } from './MappingManager'
import { randInt } from 'three/src/math/MathUtils';


// Texture File Generation.....

export async function GenerateTextureFile(mappingManager: MappingManager){
    return new Promise<{tex:{texture:string,x:number,y:number,rotation:number}[],x:number,y:number}>((resolve) => {
        const numTextureFiles = mappingManager.textureFileList.length
        const root = Math.ceil(Math.sqrt(numTextureFiles))
        const canvasSizeX = root * mappingManager.textureSizeX
        const canvasSizeY = root * mappingManager.textureSizeY


        // Load Textures
        var texturesLoaded: {texture:string,x:number,y:number,rotation:number}[]=[]
        var textureIndex = 0
        for (var posY = 0; posY <= canvasSizeY-mappingManager.textureSizeX; posY += mappingManager.textureSizeY){
            for (var posX = 0; posX <= canvasSizeX-mappingManager.textureSizeX; posX += mappingManager.textureSizeX){
                if (textureIndex < mappingManager.textureFileList.length){

                    mappingManager.textureFileList[textureIndex].u1 = posX/canvasSizeX
                    mappingManager.textureFileList[textureIndex].u2 = (posX+mappingManager.textureSizeX)/canvasSizeX
                    mappingManager.textureFileList[textureIndex].v1 = 1 - (posY/canvasSizeY)
                    mappingManager.textureFileList[textureIndex].v2 = 1 - (posY+mappingManager.textureSizeY)/canvasSizeY

                    // Load Textures Into Data Structure
                    const filePath = "./Assets/Textures/" + mappingManager.textureFileList[textureIndex].fileName
                    //const loadedTexture = loader.load(filePath)
                    var temp = {texture:filePath,x:posX,y:posY,rotation:mappingManager.textureFileList[textureIndex].rotation}
                    texturesLoaded.push(temp)
                    textureIndex++
                }
            }
        }
        
        
        resolve({tex:texturesLoaded,x:canvasSizeX,y:canvasSizeY})
    });
}



export function WaitForLoad(img:HTMLImageElement){
    return new Promise<boolean>((resolve,reject) => {
        img.decode().then((value)=>{
            resolve(true)
        })
    })
}



export async function LoadTexturesWait(mappingManager: MappingManager) {
        // Load 1 Larger on each axis as heightmap is based on tile vertex points...
        var texturesLoaded: {tex:{texture:string,x:number,y:number,rotation:number}[],x:number,y:number}
        var texturesLoaded = await GenerateTextureFile(mappingManager);
        

        // Create Canvas
        const canvas = document.createElement('canvas');
        canvas.width = texturesLoaded.x;
        canvas.height = texturesLoaded.y;
        const context = canvas.getContext('2d');
        const texLoad = texturesLoaded.tex

        const tasks: Promise<boolean>[] = []

        if(context != null) {
            for (var ind = 0; ind < mappingManager.textureFileList.length; ind++){
                var tex = mappingManager.textureFileList[ind]
                var x = texLoad[ind].x
                var y = texLoad[ind].y
                var w = mappingManager.textureSizeX
                var h = mappingManager.textureSizeY
                var angle = texLoad[ind].rotation
                var fileName =texLoad[ind].texture
                const img = new Image()
                img.src = fileName

                const rtrn = await WaitForLoad(img)

                context.save()

                context.translate(x + w / 2, y + h / 2);
                context.rotate(angle*Math.PI/180);
                context.translate(- x - img.width / 2, - y - img.height / 2);
                context.drawImage(img,x,y,w,h)
                context.restore()
              }
        }
        var finalTexture = new THREE.Texture(canvas)
        finalTexture.wrapS = THREE.RepeatWrapping;
        finalTexture.wrapT = THREE.RepeatWrapping;
        finalTexture.needsUpdate = true
        return finalTexture
  }
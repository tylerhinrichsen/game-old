import { MappingManager } from "./MappingManager";
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { TerrainRenderer} from "./TerrainRenderer";
import * as THREE from 'three'

export class AssetManager{
    public ref_mappingManager
    public models:  {[id:string]: THREE.Object3D}={}
    constructor(mappingManager: MappingManager){
        this.ref_mappingManager = mappingManager
    }

    // Return a 3d Model For Use In Game
    GetModel(modelName:string){
        if (this.models[modelName] != undefined){
            return this.models[modelName]
        }
        else{
            console.error("AssetManager: GetModel: Model File Not Loaded: ", modelName)
        }
    }

    // Load All Model Files As Specified in the mapping Manager
    async LoadAssets(){
        console.log("AssetManager: LoadAssets ----------------")
        console.log("Assets To Load:", this.ref_mappingManager.objectFileList.length)
        // For Each Asset In Mapping Manager
        for (var ind = 0; ind < this.ref_mappingManager.objectFileList.length; ind++){
            // Object Details For Loading
            var objDetails: {objName:string, objPath:string, mtlPath:string, scale:{x:number,y:number,z:number}, rotation:{x:number,y:number,z:number}, offset:{x:number,y:number,z:number}}
            objDetails = this.ref_mappingManager.objectFileList[ind]

            // Check If Model Already Loaded
            if (objDetails.objName in this.models){
                console.error("LoadAssets: 3d Object Already Exists: ", objDetails.objName)
            }
            else{
                console.log("Loading Object: ", ind, ":", objDetails.objName)

                // Load 3d Files
                var loadedObject: THREE.Group<THREE.Object3DEventMap>
                loadedObject = await this.LoadModelFile(objDetails.objPath, objDetails.mtlPath)

                // Set Object Rotation & Scale Properties
                const scale = objDetails.scale
                loadedObject.scale.set(scale.x,scale.y,scale.z)
                const rotation = objDetails.rotation
                loadedObject.rotation.set(rotation.x,rotation.y,rotation.z)

                const offset = objDetails.offset
                loadedObject.translateX(offset.x)
                loadedObject.translateY(offset.y)
                loadedObject.translateZ(offset.z)

                this.models[objDetails.objName] = loadedObject
                
            }
        }
        console.log("All Assets Loaded")
    }
    
    // Load Model File, Create 3D Object & Store in Models Dict {AssetName:Object3D}
    LoadModelFile(objPath:string, mtlPath:string){
        return new Promise<THREE.Group<THREE.Object3DEventMap>>((resolve) => {
            var mtlLoader = new MTLLoader();
            mtlLoader.load(mtlPath, function(materials){
                materials.preload();
                var objLoader = new OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load(objPath, function(object){    
                    var obj = object.clone(true)
                    resolve(obj)
                });
            });
        })
    }
}


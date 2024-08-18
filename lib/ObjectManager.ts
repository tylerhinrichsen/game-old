import { MappingManager } from "./MappingManager"
import { AssetManager } from "./AssetManager"

require("crypto")

export class GameObject {
    public UUID: string
    public model: THREE.Object3D
    public position: THREE.Vector3

    constructor(model: THREE.Object3D){
        this.UUID = crypto.randomUUID()
        this.model = model
        this.position.x = 0
        this.position.y = 0
        this.position.z = 0
    }
}




export class ObjectManager {
    public ref_mappingManager
    public ref_assetManager
    public ref_scene
    public objects: {[id:string]: GameObject} = {}

    constructor(assetManager:AssetManager, scene:THREE.Scene){
        this.ref_assetManager = assetManager
        this.ref_scene = scene
    }

    Createobject(modelName: string){
        var model = this.ref_assetManager.GetModel(model)
        var obj = new GameObject(model)
        this.objects[obj.UUID] = obj
        this.ref_scene.add(this.objects[obj.UUID])
        return obj.UUID
    }

    Object(UUID: string){
        const key = UUID
        if (key in this.objects){
            return this.objects[key]
        }
    }
}
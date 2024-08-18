import { RoadManager } from "./RoadManager";
import { TileArea } from "./TerrainRenderer";

export class Parcel {

    public parcelArea: TileArea
    public zoning: number
    public ownerId: string // uniqueId....

    constructor(parcelArea:TileArea,zoning:number,ownerId:string){
        this.parcelArea = parcelArea
        this.zoning = zoning
        this.ownerId = ownerId
    }

    // Buildings....
}


export class ParcelManager {
    public ref_roadManager
    public parcelArr: Parcel[]=[]

    constructor(roadManager:RoadManager){
        this.ref_roadManager = roadManager
    }


    AddParcel(parcel:Parcel){
        // Add Parcel
        this.parcelArr.push(parcel)

        // Update Roads..

        // Add / Update Roads Along Peremeter
        var peremeterAreas: TileArea[]=[]
        peremeterAreas[0] = new TileArea(parcel.parcelArea.x1,
                                        parcel.parcelArea.y1,
                                        parcel.parcelArea.x1,
                                        parcel.parcelArea.y2)

        peremeterAreas[1] = new TileArea(parcel.parcelArea.x1,
                                        parcel.parcelArea.y2,
                                        parcel.parcelArea.x2,
                                        parcel.parcelArea.y2)

        peremeterAreas[2] = new TileArea(parcel.parcelArea.x2,
                                        parcel.parcelArea.y2,
                                        parcel.parcelArea.x2,
                                        parcel.parcelArea.y1)

        peremeterAreas[3] = new TileArea(parcel.parcelArea.x1,
                                        parcel.parcelArea.y1,
                                        parcel.parcelArea.x2,
                                        parcel.parcelArea.y2)

        
        this.ref_roadManager.AddRoad(peremeterAreas[0].vertex1.x,peremeterAreas[0].vertex1.y,peremeterAreas[0].vertex2.x,peremeterAreas[0].vertex2.y, "paved")
        this.ref_roadManager.AddRoad(peremeterAreas[1].vertex1.x,peremeterAreas[1].vertex1.y,peremeterAreas[1].vertex2.x,peremeterAreas[1].vertex2.y, "paved")
        this.ref_roadManager.AddRoad(peremeterAreas[2].vertex1.x,peremeterAreas[2].vertex1.y,peremeterAreas[2].vertex2.x,peremeterAreas[2].vertex2.y, "paved")
        this.ref_roadManager.AddRoad(peremeterAreas[3].vertex1.x,peremeterAreas[3].vertex1.y,peremeterAreas[3].vertex2.x,peremeterAreas[3].vertex1.y, "paved")
                        
    }

}
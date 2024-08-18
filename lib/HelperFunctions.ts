export function ConvertWorldPointToGrid(_tileSizeX:number, _tileSizeY:number, _gridSizeX:number, _gridSizeY:number, gridPosX:number,gridPosY:number,contactPoint:THREE.Vector3){
	const baseTileX = ((_gridSizeX) * _tileSizeX * -0.5) + gridPosX
	const baseTileY = ((_gridSizeY) * _tileSizeY * -0.5) + gridPosY
	const tilesX = Math.floor((contactPoint.x - baseTileX) / _tileSizeX)
	const tilesY = Math.floor((contactPoint.y - baseTileY) / _tileSizeY)
	return {tilesX, tilesY}
}
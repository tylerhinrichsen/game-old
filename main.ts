import * as THREE from 'three'
import { LoadWait, TerrainRenderer } from './lib/TerrainRenderer';
import { ConvertWorldPointToGrid } from './lib/HelperFunctions';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BuildingManager } from './lib/BuildingManager';

import { Building} from './lib/BuildingManager';
import { Point } from './lib/BuildingManager';
import { loadHeightMap } from './lib/TerrainRenderer';
import { GenerateTextureFile } from './lib/TextureLoader';
import { MappingManager } from './lib/MappingManager';
import { LoadTexturesWait } from './lib/TextureLoader';
import { RoadManager } from './lib/RoadManager';
import { ParcelManager } from './lib/ParcelManager';
import { TileArea } from './lib/TerrainRenderer';
import { Parcel } from './lib/ParcelManager';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { AssetManager } from './lib/AssetManager';
import { ObjectManager } from './lib/ObjectManager';


// Damn Right you gonna forget this stupid
// RUN: npx vite
// Localhost:5173

let container, stats;
let camera, controls, scene, renderer;
var heightMap: number[][] = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let terrainManager
let terrainRenderer

const tileSize = 2
const gridSizeX = 10
const gridSizeY = 10


// Int Main {}

Init()
Animate()


function Animate(){
	requestAnimationFrame( Animate );
	renderer.render( scene, camera );
}

async function Init(){
// Setup Renderer
	const width = window.innerWidth, height = window.innerHeight;
	container = document.getElementById( 'container' );
	container.innerHTML = '';
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );
	renderer.setClearColor( 0x888888, 1 );	
	container.appendChild( renderer.domElement );

// Create Camera
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 90, width / height, 1, 10000 );
	camera.position.z = 10;
	camera.position.y = -5;
	camera.position.x = 0;
	camera.rotation.x = 45 * 0.0174533
	camera.rotation.y = 0 * 0.0174533
	camera.rotation.z = 0 * 0.0174533
	scene.add(camera)

// Add Light
	scene.add( new THREE.AmbientLight( 0x444444 ) );
	const  light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );
	const  light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( 0, -1, 0 );
	scene.add( light2 );	


	container.addEventListener( 'click', onPointerClick)
	container.addEventListener( 'keydown', onKeyDown)



// Initilize Managment Classes
	var mappingManager = new MappingManager()	

	// Load Height Map For Terrain Generation 
	heightMap = await loadHeightMap(gridSizeX,gridSizeY)

	// Load Terrain Textures & Generate Terrain Texture File
	var loadedTexture = new THREE.Texture
	loadedTexture = await LoadTexturesWait(mappingManager)
	loadedTexture.needsUpdate = true

	// Initilize Terrain Renderer
	terrainRenderer = new TerrainRenderer(gridSizeX,gridSizeY,tileSize,heightMap, scene, mappingManager)
	terrainRenderer.LoadTextureMap(loadedTexture)
	
	var roadManager = new RoadManager(terrainRenderer, mappingManager)

	var parcelManager = new ParcelManager(roadManager)

	var assetManager = new AssetManager(mappingManager)
	await assetManager.LoadAssets()

	var objectManager = new ObjectManager(assetManager,scene)



	terrainRenderer.RebuildAndRender()


	parcelManager.AddParcel(new Parcel(new TileArea(0,0,4,4),0,"Me"))
	parcelManager.AddParcel(new Parcel(new TileArea(4,0,8,4),0,"Me"))


	var objectId = objectManager.Createobject("factory")
	
	var object = objectManager.Object(objectId)
	if(object != undefined){
		object.position = new THREE.Vector3(10,10,10)
	}
	


	terrainRenderer.RebuildAndRender()
	

	
}

function onKeyDown( event) {
	if (event.key == 'w'){
		camera.position.y++
	}
	if (event.key == 's'){
		camera.position.y--
	}
	if (event.key == 'a'){
		camera.position.x--
	}
	if (event.key == 'd'){
		camera.position.x++
	}

	if (event.key == 'ArrowRight'){
		camera.rotation.y -= 0.0174533
	}
	if (event.key == 'ArrowLeft'){
		camera.rotation.y += 0.0174533
	}

	if (event.key == 'ArrowUp'){
		camera.rotation.x += 0.0174533
	}
	if (event.key == 'ArrowDown'){
		camera.rotation.x -= 0.0174533
	}
}


/* 

// TEST texture modification

function onPointerClick( event) {
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
	raycaster.setFromCamera( pointer, camera );
	const terrainObj = scene.getObjectByName("terrain")
	const intersects = raycaster.intersectObject( terrainObj );
	if ( intersects.length > 0 ) { 
		const gridPos = ConvertWorldPointToGrid(tileSize, tileSize, gridSizeX, gridSizeY, 0,0,intersects[0].point)
		// terrainManager.ModifyHeightMap(gridPos.tilesX, gridPos.tilesY)
		console.log(gridPos)
		var random = Math.floor(Math.random() * 35)
		terrainRenderer.UpdateTileTexture(gridPos.tilesX,gridPos.tilesY,random)
		terrainRenderer.RebuildAndRender(scene)
	}
}
*/



// TEST height Modification

function onPointerClick( event ) {
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
	raycaster.setFromCamera( pointer, camera );
	const terrainObj = scene.getObjectByName("terrain")
	const intersects = raycaster.intersectObject( terrainObj );
	if ( intersects.length > 0 ) { 
		const gridPos = ConvertWorldPointToGrid(tileSize, tileSize, gridSizeX, gridSizeY, 0,0,intersects[0].point)
		terrainRenderer.ModifyTileHeight(gridPos.tilesX,gridPos.tilesY,true)
		terrainRenderer.RebuildAndRender(scene)
	}
}




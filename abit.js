var camera = new THREE.Camera(75, null, 1, 10000),
	scene = new THREE.Scene(),
	light1 = new THREE.PointLight( 0xffffff ),
	renderer = new THREE.WebGLRenderer();
	//renderer = new THREE.CanvasRenderer();

var keys = {}, radius = 1000, rotation = 0;

// from three.js grass demo
function generateTextureBase() {

	var canvas = document.createElement( 'canvas' );
	canvas.loaded = true;
	canvas.width = 1024;
	canvas.height = 1024;

	var context = canvas.getContext( '2d' );
	context.fillStyle = "#030";
	context.fillRect(0,0, canvas.width, canvas.height);

	for ( var i = 0; i < 20000; i ++ ) {

		context.fillStyle = 'rgba(0,' + Math.floor( Math.random() * 64 + 32 ) + ',16,1)';
		context.beginPath();
		context.arc( Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3 + 1, 0, Math.PI * 2, true );
		context.closePath();
		context.fill();

	}

	context.globalAlpha = 0.1;
	context.globalCompositeOperation = 'lighter';

	return canvas;
}

window.onload = function(){
	document.body.appendChild( renderer.domElement );
	(window.onresize = function(){
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	})();
	window.onkeydown = window.onkeyup = function(e){
		keys[e.keyCode] = e.type == 'keydown';
	}
	init();
}

function init() {
	camera.position.y = camera.position.z = 2000;
	light1.position.y = 2000;
	scene.addLight( light1 );
	cube = new THREE.Mesh( new Cube( 200, 200, 200, 1, 1, 
		new THREE.MeshLambertMaterial( { color:
			Math.random() * 0xffffff, shading:THREE.FlatShading } )),
		new THREE.MeshFaceMaterial() );
	cube.position.y = 125;
	cube.overdraw = true;
	scene.addObject(cube);
	var geometry = new Plane(10000,10000);
	var texture = generateTextureBase();
	var floor = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: new THREE.Texture( texture , new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping ) } ) );
	floor.rotation.x = - 90 * ( Math.PI / 180 );
	floor.position.x = 1000;
	floor.position.z = 1000;
	scene.addObject(floor);
	setInterval(loop, 1000 / 60);
	camera.target.position = cube.position;
}

function loop() {
	var speed = keys[16]?50:10;
	if (keys[87]) cube.position.z -= speed;
	if (keys[83]) cube.position.z += speed;
	if (keys[65]) cube.position.x -= speed;
	if (keys[68]) cube.position.x += speed;
	light1.position.x = cube.position.x+500;
	light1.position.z = cube.position.z+500;
	renderer.render( scene, camera );
}

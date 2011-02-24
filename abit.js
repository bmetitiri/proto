var camera = new THREE.Camera(75, null, 1, 10000),
	scene = new THREE.Scene(),
	renderer = new THREE.WebGLRenderer();
	//renderer = new THREE.CanvasRenderer();

var keys = {}, radius = 1000, rotation = 0;

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
	cube = new THREE.Mesh( new Cube( 200, 200, 200, 1, 1, 
		new THREE.MeshBasicMaterial( { color:
			Math.random() * 0xffffff } )),
		new THREE.MeshFaceMaterial() );
	cube.position.y = 125;
	cube.overdraw = true;
	scene.addObject(cube);
	for (var x = -2; x <= 2; x++)
		for (var z = -2; z <= 2; z++){
			var floor = new THREE.Mesh(new Cube(1000, 50, 1000, 1, 1,
				new THREE.MeshBasicMaterial( { color:
					Math.random() * 0xffffff } )),
				new THREE.MeshFaceMaterial() );
			floor.position.x = x*1000;
			floor.position.z = z*1000;
			scene.addObject(floor);
		}
	setInterval(loop, 1000 / 60);
}

function loop() {
	var speed = keys[16]?50:10;
	if (keys[87]) cube.position.z -= speed;
	if (keys[83]) cube.position.z += speed;
	if (keys[65]) cube.position.x -= speed;
	if (keys[68]) cube.position.x += speed;
	camera.target.position = cube.position;
	renderer.render( scene, camera );
}

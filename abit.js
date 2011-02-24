var camera = new THREE.Camera( 75, 1, 1, 10000 ),
	scene = new THREE.Scene(),
	renderer = new THREE.CanvasRenderer();

var keys = {}, radius = 1000, rotation = 0;

window.onload = function(){
	init();
	(window.onresize = function(){
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	})();
	window.onkeydown = window.onkeyup = function(e){
		keys[e.keyCode] = e.type == 'keydown';
	}
	setInterval( loop, 1000 / 60 );
}

function init() {
	for (var i = 0; i < 1000; i++) {
		var particle = new THREE.Particle( new THREE.ParticleCircleMaterial( { color: Math.random() * 0xffffff } ) );
		particle.position.x = Math.random() * 2000 - 1000;
		particle.position.y = Math.random() * 2000 - 1000;
		particle.position.z = Math.random() * 2000 - 1000;
		particle.scale.x = particle.scale.y = Math.random() * 10 + 5;
		scene.addObject( particle );
	}

	document.body.appendChild( renderer.domElement );
}

function loop() {
	var speed = keys[16]?5:1;
	if (keys[87]) radius -= speed*2;
	if (keys[83]) radius += speed*2;
	if (keys[65]) rotation -= speed/180;
	if (keys[68]) rotation += speed/180;
	camera.position.x = Math.cos(rotation)*radius;
	camera.position.z = Math.sin(rotation)*radius;
	renderer.render( scene, camera );
}

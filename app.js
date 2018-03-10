var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
var roadWidth = 2.0;

///////////////////// road

function getRoadCurvePoints(steps) {
    let points = [];
    let x = 0, y = 0;
    for (var i = 0; i < steps; i++) {
        points.push({x: x, y: y});
        x = x + Math.random() * 4 - 1;
        y = y + Math.max(10, Math.random() * 30);
    }
    return points;
}

function getRoadPath(steps = 100) {
    let curvePoints = getRoadCurvePoints(steps);

    // near edge
    let points = [new THREE.Vector2( (roadWidth / 2), 0 ), new THREE.Vector2( -(roadWidth / 2), 0 )];

    // left side curve
    let curve1 = [];
    for (let point of curvePoints) {
        curve1.push(new THREE.Vector2( point.x - (roadWidth / 2), point.y ));
    }
    curve1 = new THREE.SplineCurve(curve1).getPoints(steps * 10);
    points = points.concat(curve1);

    // far edge
    points.push(new THREE.Vector2( points.slice(-1)[0].x + (roadWidth / 2), points.slice(-1)[0].y ))

    // right curve
    let curve2 = [];
    for (let point of curvePoints.reverse()) {
        curve2.push(new THREE.Vector2( point.x + (roadWidth / 2), point.y ));
    }
    points = points.concat(new THREE.SplineCurve(curve2).getPoints(steps * 10));

    return points;
}


var roadShape = new THREE.Shape(getRoadPath());


var material = new THREE.MeshStandardMaterial( {
    color: 0x0080ff,
    metalness: 1.0,
    roughness: 0.4,
} );

var extrudeSettings = { amount: 0.1, bevelEnabled: true, bevelSegments: 2,
    steps: 2, bevelSize: 0.01, bevelThickness: 0.01 };

var geometry = new THREE.ExtrudeGeometry( roadShape, extrudeSettings );

geometry.rotateX(3 * Math.PI / 2);

var road = new THREE.Mesh( geometry, material );
scene.add( road );


////////////////// lights and camrea

var lights = [];

lights[ 0 ] = new THREE.PointLight( 0xffffff, 10, 0 );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 10, 0 );

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );

lights[ 0 ].position.set( 0, 0.5, 0 );
lights[ 1 ].position.set( 1, 0.5, 0 );

camera.position.z = 0;
camera.position.y = 0.5;
camera.position.x = (roadWidth / 2);

/////////////////// keyboard

var pressedKeys = {};
// var keyMap = { 40: 'down', 38: 'up', 37: 'left', 39: 'right'};
var keyMap = { 'left': 37, 'up':38, 'right': 39, 'down': 40};

function isPressed(keyCode) {
    return pressedKeys[keyMap[keyCode]];
}

window.addEventListener('keydown', (e) => {
    pressedKeys[e.keyCode] = true;
})

window.addEventListener('keyup', (e) => {
    pressedKeys[e.keyCode] = false;
});

//////////////////// move

var player = { x: 0, y: 0, z: 0, angle: Math.PI / 2, speed: 0, maxSpeed: 0.3 }

function turn(direction = 1, speed = 0.01) {
    player.angle = player.angle + direction * speed;
    camera.rotateY(direction * speed);
    lights[0].rotateY(direction * speed);
    lights[1].rotateY(direction * speed);
}


function move(direction = 1) {
    if (!player.speed) return;

    player.x = player.x + direction * player.speed * Math.cos(player.angle);
    player.z = player.z + (-1 * direction * player.speed * Math.sin(player.angle));

    camera.position.x = player.x;
    camera.position.z = player.z;

    lights[0].position.z = player.z;
    lights[0].position.x = player.x - (roadWidth / 2);

    lights[1].position.z = player.z;
    lights[1].position.x = player.x + (roadWidth / 2);
}


/////////////////// animate

function animate() {
    requestAnimationFrame( animate );
    if (isPressed('up')) {
        player.speed += 0.005;
    } else if (isPressed('down')) {
        player.speed -= 0.1;
    } else {
        player.speed -= 0.01;
    }

    if (player.speed < 0.05) player.speed = 0.05;
    if (player.speed > player.maxSpeed) player.speed = player.maxSpeed;

    if (isPressed('left')) {
        turn(1);
    }
    if (isPressed('right')) {
        turn(-1);
    }
    move();

    // geometry.rotateX(0.01);
	renderer.render( scene, camera );
}


animate();
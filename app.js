const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    'Images/background.png',
    'Images/background.png',
    'Images/background.png',
    'Images/background.png',
    'Images/background.png',
    'Images/background.png',
]);

scene.background = texture;

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 4, 4);
scene.add(directionalLight);

// Spaceship components
const spaceship = new THREE.Group();

// Main body
const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x778899 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.rotation.x = Math.PI / 2;
spaceship.add(body);

// Cockpit
const cockpitGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, transparent: true, opacity: 0.8 });
const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
cockpit.position.z = 0.8;
cockpit.scale.set(0.5, 0.5, 0.75); // Flatten the sphere a bit
spaceship.add(cockpit);

// Wings
const wingGeometry = new THREE.BoxGeometry(0.1, 1, 2);
const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x1E90FF });
const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
leftWing.position.y = -1;
rightWing.position.y = 1;
spaceship.add(leftWing);
spaceship.add(rightWing);

// Tail
const tailGeometry = new THREE.ConeGeometry(0.3, 1, 32);
const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x696969 });
const tail = new THREE.Mesh(tailGeometry, tailMaterial);
tail.position.z = -1.5;
tail.rotation.x = Math.PI;
spaceship.add(tail);

// Add the spaceship to the scene
scene.add(spaceship);




// Asteroids setup
const asteroids = [];
const asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const asteroidVelocity = 0.1;

// function createAsteroid() {
//     const size = Math.random() * 0.5 + 0.1;
//     const asteroidGeometry = new THREE.DodecahedronGeometry(size);
//     const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
//     asteroid.position.set((Math.random() - 10) * 100, (Math.random() - 100) * 10, 5);
//     asteroid.position.z = 30;
//     asteroids.push(asteroid);
//     scene.add(asteroid);
// }



function createAsteroid() {
   

  
        const size = Math.random() * 0.9   + 0.1;  // Random size between 0.1 and 0.6
        const asteroidGeometry = new THREE.DodecahedronGeometry(size);
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        // Random positions within a specified range
        asteroid.position.x = (Math.random() - 0.5) * 100;
        asteroid.position.y = (Math.random() - 0.5) * 100;
        asteroid.position.z = (Math.random() - 0.5) * 100;
        
        asteroids.push(asteroid);
        scene.add(asteroid);
    
}

// Generate several asteroids
for (let i = 0; i < 20; i++) {
    createAsteroid();
}

// Laser setup
const lasers = [];
const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

function shootLaser() {
    const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.position.set(spaceship.position.x, spaceship.position.y, spaceship.position.z);
    laser.rotation.x = Math.PI / 2;
    lasers.push(laser);
    scene.add(laser);
}





function createCrosshair() {

    const material = new THREE.LineBasicMaterial( { color: 0xAAFFAA });
    const geometry = new THREE.BufferGeometry();


    // Define the size of the crosshair
    const size = 0.05;


    // Points for lines
    const vertices = new Float32Array([

        0, -size, 0,
        0, size, 0,
        -size, 0, 0,
        size, 0, 0
    ]);


    // Create position attribute
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));


    const crosshair = new THREE.LineSegments(geometry, material);

    // Set the position of the crosshair in front of the spaceship
    crosshair.position.set(0, 0, -10); // Adjust the z-position to be in front


    return crosshair;


}

const crosshair = createCrosshair();
spaceship.add(crosshair);



// Set initial camera position
camera.position.z = 10;

// Movement controls
const speed = 0.3;
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowUp':
            spaceship.position.y += speed;
            break;
        case 'ArrowDown':
            spaceship.position.y -= speed;
            break;
        case 'ArrowLeft':
            spaceship.position.x -= speed;
            break;
        case 'ArrowRight':
            spaceship.position.x += speed;
            break;
        
        case ' ':
            shootLaser();
            break;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);


    spaceship.rotation.z += 0.01;

     // Move lasers
     lasers.forEach(laser => {
        laser.position.z -= 0.5;
        if (laser.position.z < -30) {
            scene.remove(laser);
            lasers.splice(lasers.indexOf(laser), 1);
        }
    });


    // Move asteroids
    asteroids.forEach(asteroid => {
        asteroid.position.z += asteroidVelocity;
        if (asteroid.position.z > 5) {
            asteroid.position.z = -20;
            asteroid.position.x = (Math.random() - 0.5) * 10;
            asteroid.position.y = (Math.random() - 0.5) * 10;
        }

        // Collision detection
        if (spaceship.position.distanceTo(asteroid.position) < 0.75) {
            console.log("Collision Detected!");
            // Reset asteroid position after collision
            asteroid.position.z = 5;
            asteroid.position.x = (Math.random() - 0.5) * 10;
            asteroid.position.y = (Math.random() - 0.5) * 10;
        }

         // Check for laser hits
        lasers.forEach(laser => {
            if (laser.position.distanceTo(asteroid.position) < 1) {
                console.log("Asteroid destroyed!");
                scene.remove(asteroid);
                asteroids.splice(index, 1);
                resetAsteroid(asteroid);
                scene.remove(laser);
                lasers.splice(lasers.indexOf(laser), 1);
            }
        });

    });


   
    renderer.render(scene, camera);
}

animate();
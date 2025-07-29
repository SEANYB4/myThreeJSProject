import { AlienSpaceship } from './enemies.js';


// THREE.JS ENVIRONMENT SETUP


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
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




// LIGHTING
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 4, 4);
scene.add(directionalLight);





// SPACESHIP 

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



// GAME VARIABLES

let playerHealth = 100;
let score = 0;
let difficulty = 1;


// Asteroids setup
const asteroids = [];
const smallerAsteroids = [];
const asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const asteroidVelocity = 0.2;


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


function spawnAsteroid() {

    if (asteroids.length < difficulty * 4) {
        createAsteroid();
    } 
}



function createSmallerAsteroids(asteroid) {


    const numFragments = 3 + Math.floor(Math.random() * 5);
    const fragments = [];




    for (let i = 0; i < numFragments; i++) {


        const size = asteroid.geometry.parameters.radius * 0.3;
        const fragmentGeometry = new THREE.DodecahedronGeometry(size);
        const fragment = new THREE.Mesh(fragmentGeometry, asteroid.material);


        // Start fragments at the position of the original asteroid
        fragment.position.copy(asteroid.position);


        // Give fragments a random velocity
        const speed = 0.5 * Math.random() * 0.5;
        fragment.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * speed,
            (Math.random() - 0.5) * speed,
            (Math.random() - 0.5) * speed
        );

        fragments.push(fragment);
        scene.add(fragment);
    }

    return fragments;
}



function updateFragments(fragments) {
  
    fragments.forEach((fragment, index) => {
       

        fragment.position.add(fragment.velocity);
        // Example condition: remove if it moves too far from origin
        if (fragment.position.length() > 50) {
            scene.remove(fragment);
            fragments.splice(index, 1);
        }

    })
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

function checkLaserCollisions() {

    lasers.forEach(laser => {
        asteroids.forEach(asteroid => {
            if (laser.position.distanceTo(asteroid.position) < 1) {
                console.log('Asteroid destroyed!');
                const fragments = createSmallerAsteroids(asteroid);
                fragments.forEach(fragment => {
                    smallerAsteroids.push(fragment);
                });
                scene.remove(asteroid);
                asteroids.splice(asteroids.indexOf(asteroid), 1);
                scene.remove(laser);
                lasers.splice(lasers.indexOf(laser), 1);
            }
        });

        aliens.forEach(alien => {
            if (laser.position.distanceTo(alien.mesh.position) < 1) {
                console.log("Alien spaceship hit!");
                score++;
                
                if (difficulty < 6) {
                    difficulty++;
                }
                scene.remove(alien.beam);

                alien.remove();
                aliens.splice(aliens.indexOf(alien), 1);
                scene.remove(laser);
                lasers.splice(lasers.indexOf(laser), 1);
            }
        });
    });



}


function checkBeamCollisions() {


    // aliens.forEach((alien) => {


    //     if (alien.beamActive && alien.beam) {
           

    //         // Check collision with player
    //         if (alien.beam.position.distanceTo(spaceship.position) < 1) {
    //             playerHealth -= 20;
    //         }

    //         // Check collision with asteroids


    //         asteroids.forEach((asteroid, index) => {
    //             if (alien.beam.position.distanceTo(asteroid.position) < 1) {
    //                 const fragments = createSmallerAsteroids(asteroid);
    //                 fragments.forEach(fragment => {
    //                     smallerAsteroids.push(fragment);
    //                 });
    //                 scene.remove(asteroid);
    //                 asteroids.splice(asteroids.indexOf(asteroid), 1);
    //             }
    //         });

    //     }

    // });
}




// crosshair setup

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






// camera setup

// Set initial camera position
camera.position.z = 20;

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



// enemies setup


const aliens = [];
function spawnAliens() {

    if (aliens.length < difficulty) {
        const alien = new AlienSpaceship(scene);
        aliens.push(alien);
    } 
}

let globalLasers = [];


function updateAlienLasers() {

 


        globalLasers.forEach((laser, index) => {

            laser.position.z += 0.5;
            if (laser.position.z > 50) {
                scene.remove(laser);
                globalLasers.splice(index, 1);
            }

            if (laser.position.distanceTo(spaceship.position) < 1) {
                console.log('Player hit!!!');
                playerHealth -= 10;
            }


        });
    
}





// Set random interval for spawning aliens
setInterval(spawnAliens, Math.random() * 5000 + 2000);



function gameOver() {

    document.getElementById('gameOverMessage').style.display = 'block';
    cancelAnimationFrame(animationId);

}





// animation setup

let animationId = null;


// Animation loop
function animate() {



    animationId = requestAnimationFrame(animate);


    // update score

    document.getElementById('score').innerHTML = `Score: ${score}`;
    document.getElementById('health').innerHTML = `Player Health: ${playerHealth}`;


    spaceship.rotation.z += 0.01;

     // Move lasers
     lasers.forEach(laser => {
        laser.position.z -= 0.5;
        if (laser.position.z < -30) {
            scene.remove(laser);
            lasers.splice(lasers.indexOf(laser), 1);
        }
    });



    spawnAsteroid();

    // Move asteroids
    asteroids.forEach(asteroid => {
        asteroid.position.z += asteroidVelocity;
        asteroid.rotation.z += 0.01;
        
        if (asteroid.position.z > 10) {
            asteroid.position.z = -20;
            asteroid.position.x = (Math.random() - 0.5) * 10;
            asteroid.position.y = (Math.random() - 0.5) * 10;
        }

        // Collision detection
        if (spaceship.position.distanceTo(asteroid.position) < 1.0) {
            console.log("Collision Detected!");

            playerHealth -= 10;
            
            // Reset asteroid position after collision
            asteroid.position.z = 5;
            asteroid.position.x = (Math.random() - 0.5) * 10;
            asteroid.position.y = (Math.random() - 0.5) * 10;

           
        }
    });

    updateFragments(smallerAsteroids);


    // update enemies

    aliens.forEach(alien => {
        
        alien.update()
        alien.lasers.forEach(laser => {
            globalLasers.push(laser);
        });
        alien.lasers = [];
    
    });

    updateAlienLasers();

    checkLaserCollisions();
    checkBeamCollisions();

    if (playerHealth <= 0) {
        gameOver();
    }
   
    renderer.render(scene, camera);
}

animate();


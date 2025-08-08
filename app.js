import { AlienSpaceship } from './enemies.js';
import { AlienMothership } from './boss.js';
import { AudioManager } from './audio.js';




// DATABASE SETUP

const supabaseUrl = 'https://drbpkekgxqxonjomngcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnBrZWtneHF4b25qb21uZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTE1MTQsImV4cCI6MjA2OTQ4NzUxNH0.O1XLfHnVLtP1Y_osLywGcJwgRfcql9s3vfqU5lHMwSs';

// Create a single supabase client for interacting with your database
const Supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function fetchTopScores() {

    const { data, error } = await Supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false})
    .limit(10)

    if (error) console.error('Error fetching scores: ', error);
    else return data;

}

async function submitScore(score) {

    const name = prompt('Please enter your name: ');

    const {data, error } = await Supabase
    .from('scores')
    .insert([
        { name: name, score: score }
    ]);

    if (error) console.error('Error saving score: ', error);
    else console.log('Score saved successfully!', data);
}


async function updateLeaderBoard() {

    const scores = await fetchTopScores();
    const scoresList = document.getElementById('scores');
    scoresList.innerHTML = '';
    const title = document.createElement('h2');
    title.innerHTML = 'SCORES:';
    scoresList.appendChild(title);
    scores.forEach(score => {

        const item = document.createElement('li');
        item.textContent = `${score.name}: ${score.score}`;
        scoresList.appendChild(item);
    
    });
    scoresList.style = 'display: block; position: absolute; top:60%; left: 10%; transform: translate(-50%, -50%); color: blue; font-size: 3em; z-index: 1000; font-family: Permanent Marker, cursive; list-style: none;';
}


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


// SOUND

const audioManager = new AudioManager();
export default audioManager;
audioManager.loadSound('laser1', './Audio/laser1.mp3');
audioManager.loadSound('laser2', './Audio/laser2.mp3');
audioManager.loadSound('laser3', './Audio/laser3.mp3');
audioManager.loadSound('laser4', './Audio/laser4.mp3');
audioManager.loadSound('asteroidExplosion1', './Audio/asteroidExplosion.mp3');
audioManager.loadSound('enemyDeath1', './Audio/enemyDeath1.mp3');
audioManager.loadSound('playerHit', './Audio/playerHit.mp3');
audioManager.loadSound('gameOver', './Audio/game_over.mp3');
audioManager.loadSound('powerUp', './Audio/powerUp.mp3');
audioManager.loadSound('music1', './Audio/tanks.mp3');


// SPACESHIP 

export const spaceship = new THREE.Group();

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



function createShield() {

    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x0099ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });

    const shield = new THREE.Mesh(geometry, material);
    shield.visible = false;
    return shield;
}

let shieldActivated = false;
let shieldCooldown = false;
const playerShield = createShield();
spaceship.add(playerShield);


let beam = null;
let beamActive = false;
let beamDuration = 1000;

function activateBeam() {


    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 50, 32);
    const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.copy(spaceship.position);
    beam.rotation.x = Math.PI / 2;
    beam.position.z -= 25;


    scene.add(beam);
    beamActive = true;
    audioManager.playSound('laser4');

    setTimeout(() => {
        deactivateBeam();
    }, beamDuration);
}

function deactivateBeam() {

    scene.remove(beam);
    beam = null;
    beamActive = false;
}



// GAME VARIABLES

let playerHealth = 100;
let score = 0;
let difficulty = 1;


let numGrenades = 5;


const powerUpVelocity = 0.2;


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

    if (asteroids.length < difficulty * 6) {
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
    audioManager.playSound('laser2');
}


const grenades = [];

function shootGrenade() {

    const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
    const grenade = new THREE.Mesh(sphereGeometry, laserMaterial);
    grenade.position.set(spaceship.position.x, spaceship.position.y, spaceship.position.z);
    grenades.push(grenade);
    scene.add(grenade);

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
                audioManager.playSound('asteroidExplosion1');
                maybeSpawnBonus(asteroid);
            }
        });

        aliens.forEach(alien => {
            if (laser.position.distanceTo(alien.mesh.position) < 1) {
                console.log("Alien spaceship hit!");
                score++;
                
                if (difficulty < 7) {
                    difficulty++;
                }
                scene.remove(alien.beam);
                alien.energyBalls.forEach(energyBall => scene.remove(energyBall));
                audioManager.playSound('enemyDeath1');
                alien.remove();
                aliens.splice(aliens.indexOf(alien), 1);
                scene.remove(laser);
                lasers.splice(lasers.indexOf(laser), 1);
            }
        });

        if (boss) {
            if (laser.position.distanceTo(boss.mesh.position) < 5) {

                boss.takeDamage(5);
                scene.remove(laser);
                lasers.splice(lasers.indexOf(laser), 1);

            }
        }
    
    });

}

function checkGrenadeCollisions() {

    grenades.forEach((grenade, index) => {


        asteroids.forEach((asteroid, index) => {

            if (grenade.position.distanceTo(asteroid.position) < 5) {

                console.log('Asteroid destroyed!');
                const fragments = createSmallerAsteroids(asteroid);
                fragments.forEach(fragment => {
                    smallerAsteroids.push(fragment);
                });
                scene.remove(asteroid);
                asteroids.splice(asteroids.indexOf(asteroid), 1);
                //scene.remove(grenade);
                //grenades.splice(grenades.indexOf(grenade), 1);
                audioManager.playSound('asteroidExplosion1');
                maybeSpawnBonus(asteroid);

            }


        });


        aliens.forEach(alien => {
            if (grenade.position.distanceTo(alien.mesh.position) < 5) {
                console.log("Alien spaceship hit!");
                score++;
                
                if (difficulty < 7) {
                    difficulty++;
                }
                scene.remove(alien.beam);
                alien.energyBalls.forEach(energyBall => scene.remove(energyBall));
                audioManager.playSound('enemyDeath1');
                alien.remove();
                aliens.splice(aliens.indexOf(alien), 1);
                scene.remove(grenade);
                grenades.splice(grenades.indexOf(grenade), 1);
            }
        });
        
        if (boss) {
            if (grenade.position.distanceTo(boss.mesh.position) < 5) {
    
                boss.takeDamage(20);
                console.log('boss hit with grenade!');
                scene.remove(grenade);
                grenades.splice(grenades.indexOf(grenade), 1);
            }
            
        }

    });

  
}


function checkBossAttackCollisions() {
    if (boss) {
        boss.lasers.forEach((laser) => {
        
            if (laser.position.distanceTo(spaceship.position) < 1 && !shieldActivated) {
    
                playerHealth -= 20;
                scene.remove(laser);
                boss.lasers.splice(boss.lasers.indexOf(laser), 1);
            }
    
    
    });


    boss.energyBalls.forEach((energyBall) => {


        if (energyBall.position.distanceTo(spaceship.position) < 1 && !shieldActivated) {

            playerHealth -= 30;
            scene.remove(energyBall);
            boss.energyBalls.splice(boss.energyBalls.indexOf(energyBall), 1);
        }
    })

    }

  


}


// POWER UP FUNCTIONS

let powerUps = [];

function maybeSpawnBonus(asteroid) {

    if (Math.random() > 0.9) {
        spawnBonus(asteroid);
    }
}

function spawnBonus(asteroid) {

    const powerUp = createPowerUp();
    powerUps.push(powerUp);
    powerUp.position.copy(asteroid.position);
    scene.add(powerUp);

}


function createPowerUp() {

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        emissive: 0x007700,
        specular: 0x009900,
        shininess: 10, 
        opacity: 0.8,
        transparent: true
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.rotationSpeed = 0.01;

    return cube;
}


function updateBonuses() {



    powerUps.forEach(powerUp => {

        powerUp.position.z += powerUpVelocity;
        powerUp.rotation.z += 0.01;
        
        // Collision detection
        if (spaceship.position.distanceTo(powerUp.position) < 1.0 && !shieldActivated) {
           
            
            scene.remove(powerUp);
            powerUps.splice(powerUps.indexOf(powerUp), 1);

            numGrenades = 5;
            playerHealth = 100;

            audioManager.playSound('powerUp');
     
        }


    });


}


function checkBeamCollisions() {


    asteroids.forEach((asteroid) => {

        if ((Math.abs(spaceship.position.x - asteroid.position.x) < 1) && (Math.abs(spaceship.position.y - asteroid.position.y) < 1) && beamActive) {

            scene.remove(asteroid);
            asteroids.splice(asteroids.indexOf(asteroid), 1);

            const fragments = createSmallerAsteroids(asteroid);
            fragments.forEach(fragment => {
                smallerAsteroids.push(fragment);
            });

            audioManager.playSound('asteroidExplosion1');

            maybeSpawnBonus(asteroid);

        }
    });

    if (boss) {
        if ((Math.abs(spaceship.position.x - boss.mesh.position.x) < 5) && (Math.abs(spaceship.position.x - boss.mesh.position.y) < 5) && beamActive) {

            boss.takeDamage(10);
            console.log('boss hit with beam!');
        }
        
    }
    
    aliens.forEach((alien) => {


        if ((Math.abs(spaceship.position.x - alien.mesh.position.x) < 1) && (Math.abs(spaceship.position.y - alien.mesh.position.y) < 1) && beamActive) {

            alien.health -= 100;
            score++;
        }





        // CHECK ALIEN BEAM COLLISIONS

        if (alien.beamActive && alien.beam) {
           

            // Check collision with player
            if ((Math.abs(alien.beam.position.x - spaceship.position.x) < 1) && (Math.abs(alien.beam.position.y - spaceship.position.y) < 1) && !shieldActivated) {
                playerHealth -= 1;
            }

            // Check collision with asteroids


            asteroids.forEach((asteroid, index) => {
                if (alien.beam.position.distanceTo(asteroid.position) < 1) {
                    const fragments = createSmallerAsteroids(asteroid);
                    fragments.forEach(fragment => {
                        smallerAsteroids.push(fragment);
                    });
                    scene.remove(asteroid);
                    asteroids.splice(asteroids.indexOf(asteroid), 1);
                }
            });

        }


        // CHECK ALIEN ENERGY BALL COLLISIONS

        alien.energyBalls.forEach(energyBall => {
            if (energyBall.position.distanceTo(spaceship.position) < 2 && !shieldActivated) {
                playerHealth -= 50;
                scene.remove(energyBall);
                alien.energyBalls.splice(alien.energyBalls.indexOf(energyBall), 1);
            }

        })
    });
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

        case 's':

            if (!shieldCooldown) {

                playerShield.visible = !playerShield.visible;
                shieldActivated = !shieldActivated;
                shieldCooldown = true;
                setTimeout(() => {
                    shieldCooldown = false;
                }, 2000);
                setTimeout(()=> {   
                    playerShield.visible = !playerShield.visible;
                    shieldActivated = !shieldActivated;
                }, 1000);
            }
        
            break;

        case 'g':
            if (numGrenades > 0) {
                shootGrenade();
                numGrenades--;
            }
            break;

        case 'b':
            if (!beamActive) {
                activateBeam();
            }
           
            break;
        
        case ' ':
            shootLaser();
            break;
    }
});



// enemies setup

let boss = null;

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

            if (laser.position.distanceTo(spaceship.position) < 1 && !shieldActivated) {
                console.log('Player hit!!!');

                playerHealth -= 10;
                audioManager.playSound('playerHit');
            }


        });
    
}





// Set random interval for spawning aliens
setInterval(spawnAliens, Math.random() * 5000 + 2000);



function gameOver() {

    document.getElementById('gameOverMessage').style.display = 'block';
    document.getElementById('controls1').style.display = 'block';
    document.getElementById('controls2').style.display = 'block';
    document.getElementById('controls3').style.display = 'block';
    document.getElementById('controls4').style.display = 'block';
    document.getElementById('controls5').style.display = 'block';
    cancelAnimationFrame(animationId);
    audioManager.playSound('gameOver');

    submitScore(score);
 
    updateLeaderBoard();

}



function maybeSpawnBoss() {
    if (difficulty >= 5 && !boss) {
        spawnBoss();
    }
}


function spawnBoss() {  
    difficulty = 0;
    boss = new AlienMothership(scene);
    const healthBarContainer = document.getElementById('bossHealthContainer');
    if (healthBarContainer) {
        healthBarContainer.style.display = 'block';
    }
}




// animation setup

let animationId = null;
let musicPlaying = false;

function playMusic() {
    if (!musicPlaying) {
        try {
            audioManager.playSound('music1');
            musicPlaying = true;
        } catch (error) {
            
            console.log(error);
        }
       
    }
}

// Animation loop
function animate() {

    playMusic();

    animationId = requestAnimationFrame(animate);


    // update GUI

    document.getElementById('score').innerHTML = `Score: ${score}`;
    document.getElementById('health').innerHTML = `Player Health: ${playerHealth}`;
    document.getElementById('grenades').innerHTML = `Grenades: ${numGrenades}`;


    spaceship.rotation.z += 0.01;

     // Move lasers
     lasers.forEach(laser => {
        laser.position.z -= 0.5;
        if (laser.position.z < -30) {
            scene.remove(laser);
            lasers.splice(lasers.indexOf(laser), 1);
        }
    });


    // Move Beam

    if (beam) {
        beam.position.copy(spaceship.position);
        beam.position.z -= 25;
    }


    // Move Grenades
    grenades.forEach(grenade => {
        grenade.position.z -= 0.5;
        if (grenade.position.z < -30) {
            scene.remove(grenade);
            grenades.splice(grenades.indexOf(grenade), 1);
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
        if (spaceship.position.distanceTo(asteroid.position) < 1.0 && !shieldActivated) {
            console.log("Collision Detected!");
            audioManager.playSound('asteroidExplosion1');
            maybeSpawnBonus(asteroid);

            const fragments = createSmallerAsteroids(asteroid);
            fragments.forEach(fragment => {
                smallerAsteroids.push(fragment);
            });
            scene.remove(asteroid);
            asteroids.splice(asteroids.indexOf(asteroid), 1);


            playerHealth -= 10;
            audioManager.playSound('playerHit');
            
            // Reset asteroid position after collision
            // asteroid.position.z = 5;
            // asteroid.position.x = (Math.random() - 0.5) * 10;
            // asteroid.position.y = (Math.random() - 0.5) * 10;

           
        }

        if (playerShield.position.distanceTo(asteroid.position) < 4.0 && shieldActivated) {
            audioManager.playSound('asteroidExplosion1');
            maybeSpawnBonus(asteroid);

            const fragments = createSmallerAsteroids(asteroid);
            fragments.forEach(fragment => {
                smallerAsteroids.push(fragment);
            });
            scene.remove(asteroid);
            asteroids.splice(asteroids.indexOf(asteroid), 1);
        }


        if (boss) {
            if (boss.mesh.position.distanceTo(asteroid.position) < 6.0) {

                audioManager.playSound('asteroidExplosion1');
                maybeSpawnBonus(asteroid);
    
                const fragments = createSmallerAsteroids(asteroid);
                fragments.forEach(fragment => {
                    smallerAsteroids.push(fragment);
                });
                scene.remove(asteroid);
                asteroids.splice(asteroids.indexOf(asteroid), 1);
            }
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

        if (alien.health <= 0) {
            scene.remove(alien.mesh);
            aliens.splice(aliens.indexOf(alien), 1);
        }
    
    });

    updateAlienLasers();

    updateBonuses(powerUps);

    checkLaserCollisions();
    checkGrenadeCollisions();
    checkBeamCollisions();
    checkBossAttackCollisions();

    if (boss) {
        if (!boss.isAlive) {
            boss = null;
            difficulty = 1;
        }
    }
   
    maybeSpawnBoss();

    if (boss) {
        boss.update();
    }

    if (playerHealth <= 0) {
        gameOver();
    }
   
    renderer.render(scene, camera);
}

animate();


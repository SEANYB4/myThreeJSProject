import { AlienSpaceship } from './enemies.js';
import { AlienMothership } from './boss.js';
import { AlienMothership2 } from './boss 2.js';
import { AudioManager } from './audio.js';
import { AlienInterceptor } from './interceptor.js';
import { MessageManager } from './messages.js';
import { Spaceship } from './player.js';


const startMenu = document.getElementById('startMenu');
const startMenuBackground = document.getElementById('startMenuBackground');

const playerHealthBar = document.getElementById('playerHealthBar');
const playerHealthContainer = document.getElementById('playerHealthContainer');

startMenu.addEventListener('click', () => {

    startMenu.style.display = 'none';
    startMenuBackground.style.display = 'none';
    controls.style.display = 'none';
    playerHealthBar.style.display = 'block';
    playerHealthContainer.style.display = 'block';
    
    animate();
})

const controls = document.getElementById('controls');
const controlMenu = document.getElementById('controlsMenu');

const backButton = document.getElementById('backButton');

controls.addEventListener('click', () => {
    startMenu.style.display = 'none';
    controls.style.display = 'none';

    controlMenu.style.display = 'block';
    backButton.style.display = 'block';

});


backButton.addEventListener('click', () => {

    startMenu.style.display = 'block';
    controls.style.display = 'block';
    backButton.style.display = 'none';
    controlMenu.style.display = 'none';
})

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

    const name = prompt('Please enter your name to save your score: ');

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
    scoresList.style.display = 'block';
    
    let scoreString = '';

    scores.forEach(score => {

        scoreString += score + '\n';
    })

    messageManager.displayMessage(scoreString, 5000, null);
}


// THREE.JS ENVIRONMENT SETUP



// LOADING TEXTURES
const textureLoader = new THREE.TextureLoader();
const grenadeTexture = textureLoader.load(
    '',
    () => {
        console.log('Texture loaded successfully');
    }, 
    undefined,
    (error) => {
        console.error('Error loading texture');
    }
);







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
audioManager.loadSound('ambience', './Audio/ambience.mp3');
audioManager.loadSound('alien1', './Audio/alien1.mp3');
audioManager.loadSound('message', './Audio/message.mp3');



// MESSAGES

const messageManager = new MessageManager(scene);
const messages = ["Attention, Pilot! Intelligence reports enemy activity in the Nebula Sector.",  "Your mission is to scout the area and engage any hostile forces.", "Maintain radio silence until further notice. Stay sharp out there!", "Update: We've detected a high-value target entering your vicinity.", "This is a critical opportunity. Use extreme caution, but do not let them escape.",  "This is a direct order!", "Immediate attention required! Our sensors have picked up a massive energy spike from your location—it's a trap!", "Initiate evasive maneuvers now and prepare for heavy resistance.", "Survival is your top priority. Do whatever it takes to get out of there intact!"];
//messageManager.startPeriodicMessages(messages, 5000); 

// SPACESHIP 

export const spaceship = new Spaceship(scene);


// GAME VARIABLES

export let score = 0;
let difficulty = 1;


export function updateScore(newScore) {
    score += newScore;
    difficulty += 1;
}


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
    laser.position.set(spaceship.spaceship.position.x, spaceship.spaceship.position.y, spaceship.spaceship.position.z);
    laser.rotation.x = Math.PI / 2;
    lasers.push(laser);
    scene.add(laser);
    audioManager.playSound('laser2');
}


const grenades = [];

function shootGrenade() {

    const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
    const grenade = new THREE.Mesh(sphereGeometry, laserMaterial);
    grenade.position.set(spaceship.spaceship.position.x, spaceship.spaceship.position.y, spaceship.spaceship.position.z);
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

        interceptors.forEach(interceptor => {


            if (laser.position.distanceTo(interceptor.mesh.position) < 1) {
                interceptor.health -= 50;
                scene.remove(laser);
                lasers.splice(lasers.indexOf(laser), 1);
            }

        });


        aliens.forEach(alien => {
            if (laser.position.distanceTo(alien.mesh.position) < 1) {
                console.log("Alien spaceship.spaceship hit!");
                
                
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

        interceptors.forEach(interceptor => {


            if (grenade.position.distanceTo(interceptor.mesh.position) < 5) {
                interceptor.health -= 100;
                
                scene.remove(grenade);
                grenades.splice(grenades.indexOf(grenade), 1);

            }
        })


        aliens.forEach(alien => {
            if (grenade.position.distanceTo(alien.mesh.position) < 5) {
                console.log("Alien spaceship hit!");
                updateScore(1);
            
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
        
            if (laser.position.distanceTo(spaceship.spaceship.position) < 1 && !spaceship.shieldActivated) {
    
                spaceship.playerHealth -= 20;
                scene.remove(laser);
                boss.lasers.splice(boss.lasers.indexOf(laser), 1);
            }
    });


    boss.energyBalls.forEach((energyBall) => {


        if (energyBall.position.distanceTo(spaceship.spaceship.position) < 2 && !spaceship.shieldActivated) {

            spaceship.playerHealth -= 30;
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
        if (spaceship.spaceship.position.distanceTo(powerUp.position) < 1.0 && !spaceship.shieldActivated) {
           
            
            scene.remove(powerUp);
            powerUps.splice(powerUps.indexOf(powerUp), 1);

            spaceship.numGrenades = 5;
            spaceship.playerHealth = 100;

            audioManager.playSound('powerUp');
     
        }


    });


}


function checkBeamCollisions() {


    asteroids.forEach((asteroid) => {

        if ((Math.abs(spaceship.spaceship.position.x - asteroid.position.x) < 1) && (Math.abs(spaceship.spaceship.position.y - asteroid.position.y) < 1) && spaceship.beamActive) {

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
        if ((Math.abs(spaceship.spaceship.position.x - boss.mesh.position.x) < 5) && (Math.abs(spaceship.spaceship.position.x - boss.mesh.position.y) < 5) && spaceship.beamActive) {

            boss.takeDamage(10);
            spaceship.deactivateBeam();
        }
        
    }

    interceptors.forEach(interceptor => {

        if (Math.abs(spaceship.spaceship.position.x - interceptor.mesh.position.x) < 1 && Math.abs(spaceship.spaceship.position.y - interceptor.mesh.position.y) < 1) {

            interceptor.health -= 50;
        }

    });
    
    aliens.forEach((alien) => {


        if ((Math.abs(spaceship.spaceship.position.x - alien.mesh.position.x) < 1) && (Math.abs(spaceship.spaceship.position.y - alien.mesh.position.y) < 1) && spaceship.beamActive) {

            alien.health -= 100;
        }





        // CHECK ALIEN BEAM COLLISIONS

        if (alien.beamActive && alien.beam) {
           

            // Check collision with player
            if ((Math.abs(alien.beam.position.x - spaceship.spaceship.position.x) < 1) && (Math.abs(alien.beam.position.y - spaceship.spaceship.position.y) < 1) && !spaceship.shieldActivated) {
                spaceship.playerHealth -= 1;
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
            if (energyBall.position.distanceTo(spaceship.spaceship.position) < 2 && !spaceship.shieldActivated) {
                spaceship.playerHealth -= 50;
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
spaceship.spaceship.add(crosshair);






// camera setup

// Set initial camera position
camera.position.z = 20;

// Movement controls
const speed = 0.5;


// mobile movement

const leftButton = document.getElementById('move-left');
const rightButton = document.getElementById('move-right');
const upButton = document.getElementById('move-up');
const downButton = document.getElementById('move-down');


leftButton.addEventListener('touchstart', () => {
    spaceship.spaceship.position.x -= speed;
});

rightButton.addEventListener('touchstart', () => {
    spaceship.spaceship.position.x += speed;
});

upButton.addEventListener('touchstart', () => {
    spaceship.spaceship.position.y += speed;
});

downButton.addEventListener('touchstart', () => {
    spaceship.spaceship.position.y -= speed;
});


document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowUp':
            spaceship.spaceship.position.y += speed;
            break;
        case 'ArrowDown':
            spaceship.spaceship.position.y -= speed;
            break;
        case 'ArrowLeft':
            spaceship.spaceship.position.x -= speed;
            break;
        case 'ArrowRight':
            spaceship.spaceship.position.x += speed;
            break;

        case 's':

            if (!spaceship.shieldCooldown) {

                spaceship.shield.visible = !spaceship.shield.visible;
                spaceship.shieldActivated = !spaceship.shieldActivated;
                spaceship.shieldCooldown = true;
                setTimeout(() => {
                    spaceship.shieldCooldown = false;
                }, spaceship.shieldCooldownLength);
                setTimeout(()=> {   
                    spaceship.shield.visible = !spaceship.shield.visible;
                    spaceship.shieldActivated = !spaceship.shieldActivated;
                }, spaceship.shieldDuration);
            }
        
            break;

        case 'g':
            if (spaceship.numGrenades > 0) {
                shootGrenade();
                spaceship.numGrenades--;
            }
            break;

        case 'b':
            if (!spaceship.beamActive) {
                spaceship.activateBeam();
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
export const interceptors = [];
function spawnAliens() {

    if (aliens.length < difficulty) {
        const alien = new AlienSpaceship(scene);
        aliens.push(alien);
    } 

    if (interceptors.length < difficulty) {

        const interceptor = new AlienInterceptor(scene);
        interceptors.push(interceptor);
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

            if (laser.position.distanceTo(spaceship.spaceship.position) < 1 && !spaceship.shieldActivated) {
                console.log('Player hit!!!');

                spaceship.playerHealth -= 10;
                audioManager.playSound('playerHit');
            }

        });    
}


function checkPlasmaBurstCollisions() {

    interceptors.forEach(interceptor => {

        interceptor.plasmaBursts.forEach((plasmaBurst) => {

            if (plasmaBurst.position.distanceTo(spaceship.spaceship.position) < 2) {
                
                spaceship.playerHealth -= 10;
                console.log('PLAYER HIT');

                interceptor.plasmaBursts.splice(interceptor.plasmaBursts.indexOf(plasmaBurst), 1);
                scene.remove(plasmaBurst);
        
            }

        });

    });
}


// Set random interval for spawning aliens
setInterval(spawnAliens, Math.random() * 5000 + 2000);



function gameOver() {


    startMenuBackground.style.display = 'block';
    document.getElementById('bossHealthBar').style.display = 'none';
    document.getElementById('bossHealthContainer').style.display = 'none';
    document.getElementById('gameOverMessage').style.display = 'block';

    cancelAnimationFrame(animationId);
    audioManager.playSound('gameOver');


    setTimeout(() => {
        submitScore(score);
        setTimeout(() => {
            updateLeaderBoard();
        }, 2000)
        
    }, 2000);

}



function maybeSpawnBoss() {
    if (difficulty >= 5 && !boss) {
        spawnBoss();
    }
}


function spawnBoss() {  
    difficulty = 0;

    if (Math.random() > 0.5) {
        boss = new AlienMothership(scene);
    } else {
        boss = new AlienMothership2(scene);
    }
   
    audioManager.playSound('alien1');
    const healthBarContainer = document.getElementById('bossHealthContainer');
    if (healthBarContainer) {
        healthBarContainer.style.display = 'block';
    }

    messageManager.displayMessage(messages[3], 3000, 'Images/commander.png');
    
}




// animation setup

let animationId = null;
let musicPlaying = false;
let ambiencePlaying = false;

function playMusic() {
    if (!musicPlaying) {
        try {
            audioManager.playSound('music1', { volume: 3});
            musicPlaying = true;
        } catch (error) {
            
            console.log(error);
        }
       
    }
}


function playAmbience() {

    if (!ambiencePlaying) {

        try {
            audioManager.playSound('ambience', { volume: 3});
            ambiencePlaying = true;
        } catch (error) {
            console.log(error);
        }
    }
}

messageManager.displayMessage(messages[1], 3000, 'Images/commander.png');
    



// Animation loop
function animate() {


    playMusic();
    playAmbience();

    animationId = requestAnimationFrame(animate);


    // update GUI

    document.getElementById('score').innerHTML = `Score: ${score}`;
    document.getElementById('health').innerHTML = `Player Health: ${spaceship.playerHealth}`;
    document.getElementById('grenades').innerHTML = `Grenades: ${spaceship.numGrenades}`;


    spaceship.spaceship.rotation.z += 0.01;

     // Move lasers
     lasers.forEach(laser => {
        laser.position.z -= 0.5;
        if (laser.position.z < -30) {
            scene.remove(laser);
            lasers.splice(lasers.indexOf(laser), 1);
        }
    });


    // Move Beam

    if (spaceship.beam) {
        spaceship.beam.position.copy(spaceship.spaceship.position);
        spaceship.beam.position.z -= 25;
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
        if (spaceship.spaceship.position.distanceTo(asteroid.position) < 1.0 && !spaceship.shieldActivated) {
            console.log("Collision Detected!");
            audioManager.playSound('asteroidExplosion1');
            maybeSpawnBonus(asteroid);

            const fragments = createSmallerAsteroids(asteroid);
            fragments.forEach(fragment => {
                smallerAsteroids.push(fragment);
            });
            scene.remove(asteroid);
            asteroids.splice(asteroids.indexOf(asteroid), 1);


            spaceship.playerHealth -= 10;
            audioManager.playSound('playerHit');
            
            // Reset asteroid position after collision
            // asteroid.position.z = 5;
            // asteroid.position.x = (Math.random() - 0.5) * 10;
            // asteroid.position.y = (Math.random() - 0.5) * 10;

           
        }

        // check for shield collisions with asteroids

        if (spaceship.shield.position.distanceTo(asteroid.position) < 4.0 && spaceship.shieldActivated) {
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
            alien.remove();
            aliens.splice(aliens.indexOf(alien), 1);
        }
    
    });

    interceptors.forEach(interceptor => {

        interceptor.update();

    });

    updateAlienLasers();

    updateBonuses(powerUps);

    checkLaserCollisions();
    checkGrenadeCollisions();
    checkBeamCollisions();
    checkBossAttackCollisions();


    checkPlasmaBurstCollisions();


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

    if (spaceship.playerHealth <= 0) {
        gameOver();
    }


    spaceship.updateHealthBar();
   
    renderer.render(scene, camera);
}




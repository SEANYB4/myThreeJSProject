
import { updateScore } from "./app.js";

export class AlienMothership {

    constructor(scene) {


        this.scene = scene;
        this.health = 100;
        this.isAlive = true;
        this.mesh = new THREE.Group();
        this.createMothership();
        this.scene.add(this.mesh);
        this.lasers = [];
        this.energyBalls = [];
        this.health = 100;
    }


    createMothership() {


        // Main body with improved material
        const bodyGeometry = new THREE.SphereGeometry(5, 32, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x5555ff, shininess: 150, specular: 0x888888 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.add(body);

        // Appendages enhanced
        const appendageGeometry = new THREE.ConeGeometry(0.5, 2, 32);
        const appendageMaterial = new THREE.MeshPhongMaterial({ color: 0xff5555, specular: 0x222222 });

        for (let i = 0; i < 6; i++) {
            const appendage = new THREE.Mesh(appendageGeometry, appendageMaterial);
            appendage.position.set(Math.cos(i * Math.PI / 3) * 5, Math.sin(i * Math.PI / 3) * 5, 0);
            appendage.rotation.z = i * Math.PI / 3 + Math.PI / 2;
            this.mesh.add(appendage);
        }

        // Central core - enhanced with a glow effect
        const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.mesh.add(core);

        // Randomize initial position a bit more
        this.mesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, -10);


        this.movePositionID = null;

        this.attack2ID = null;


        this.movePositionID = setInterval(() => {

            const newX = (Math.random() - 0.5) * 20;
            const newY = (Math.random() - 0.5) * 20;
            const newZ = -10;

            this.moveToNewPosition(newX, newY, newZ, 2000);

        }, 5000);

        this.attack2ID = setInterval(() => {
            this.attack2();
        }, 6000);
    }


    attack() {
  
      // Laser attack improvements
      const laserGeometry = new THREE.CylinderGeometry(0.2, 0.2, 20, 32);
      const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, opacity: 0.7, transparent: true });
      const laser = new THREE.Mesh(laserGeometry, laserMaterial);
      laser.position.copy(this.mesh.position);
      laser.rotation.x = Math.PI / 2;
      this.lasers.push(laser);
      this.scene.add(laser);

     
    }


    attack2() {
        console.log('boss attacking');

        const gridSize = 3;
        const spacing = 2;

        const startOffset = -(gridSize - 1) / 2 * spacing;

        for (let y = 0; y < gridSize; y++) {

            for(let x = 0; x < gridSize; x++) {
                const energyBallGeometry = new THREE.SphereGeometry(1, 32, 32);
                const energryBallMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
                const energyBall = new THREE.Mesh(energyBallGeometry, energryBallMaterial);
    
            
                energyBall.position.copy(this.mesh.position);
                energyBall.position.x = this.mesh.position.x + startOffset + x * spacing;
                energyBall.position.y = this.mesh.position.y + startOffset + y * spacing;
                energyBall.position.z += 0.5;
    
                this.scene.add(energyBall);
                this.energyBalls.push(energyBall);
    
            }
        }
    }

    attack3() {
        console.log('boss executing shockwave attack');
    
        const numPulses = 12; // Number of pulses in the shockwave
        const pulseRadius = 1; // Radius of each pulse
    
        for (let i = 0; i < numPulses; i++) {
            const angle = (Math.PI * 2 / numPulses) * i; // Angle for each pulse in radians
            const pulseGeometry = new THREE.SphereGeometry(pulseRadius, 16, 16);
            const pulseMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
            const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    
            // Positioning the pulses in a circle around the boss
            pulse.position.x = this.mesh.position.x + 5 * Math.cos(angle); // 5 is the distance from the center
            pulse.position.y = this.mesh.position.y + 5 * Math.sin(angle);
            pulse.position.z = this.mesh.position.z;
    
            // Animating the pulses moving outward
            const moveOutward = () => {
                requestAnimationFrame(moveOutward);
                pulse.position.x += 0.1 * Math.cos(angle);
                pulse.position.y += 0.1 * Math.sin(angle);
    
                // Removing the pulse if it moves beyond a certain distance
                if (Math.abs(pulse.position.x - this.mesh.position.x) > 20 || Math.abs(pulse.position.y - this.mesh.position.y) > 20) {
                    this.scene.remove(pulse);
                }
            }
            moveOutward();
    
            this.scene.add(pulse);
            this.energyBalls.push(pulse);
        }
    }



    moveToNewPosition(x, y, z, duration = 1000) {

        const startPosition = this.mesh.position.clone();
        const endPosition = new THREE.Vector3(x, y, z);
        const startTime = Date.now();


        const animatePosition = () => {

            const elapsed = Date.now() - startTime;
            const fraction = elapsed / duration;

            if (fraction < 1) {

                this.mesh.position.lerpVectors(startPosition, endPosition, fraction);
                requestAnimationFrame(animatePosition);

            } else {
                this.mesh.position.set(x, y, z);
            }
            
        }

        animatePosition();
    }

    takeDamage(amount) {
        console.log('boss taking damage');
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
        
    }


    destroy() {

        this.isAlive = false;
        this.scene.remove(this.mesh);

        updateScore(5);

        clearInterval(this.movePositionID);
        clearInterval(this.attack2ID);
       
        // Correctly remove all lasers
        while (this.lasers.length > 0) {

            let laser = this.lasers.pop();
            this.scene.remove(laser);
        }


        // Correctly remove all energy Balls
        while (this.energyBalls.length > 0) {

            let energyBall = this.energyBalls.pop();
            this.scene.remove(energyBall);
        }   



        const healthBarContainer = document.getElementById('bossHealthContainer');
        if (healthBarContainer) {
            healthBarContainer.style.display = 'none';
        }
    }


    updateHealthBar() {

        const healthPercentage = this.health / 100;
        const healthBar = document.getElementById('bossHealthBar');
        if (healthBar) {
            healthBar.style.width = `${healthPercentage * 100}%`;
            if (healthPercentage < 0.3) {
                healthBar.style.backgroundColor = 'red';

            } else if (healthPercentage < 0.6) {

                healthBar.style.backgroundColor = 'yellow';
            } else {
                healthBar.style.backgroundColor = 'green';
            }
        }
    }


    update() {
        this.mesh.rotation.y += 0.05;
        // Update lasers
        this.lasers.forEach(laser => {
            laser.position.z += 0.5; // Move lasers
            if (laser.position.z > 10) { // Remove lasers that go off screen
                this.scene.remove(laser);
                this.lasers.splice(this.lasers.indexOf(laser), 1);
            }
        });

        this.energyBalls.forEach(energyBall => {


            energyBall.position.z += 0.5;
            if (energyBall.position.z > 10) {

                this.scene.remove(energyBall);
                this.energyBalls.splice(this.energyBalls.indexOf(energyBall), 1);
            }
        })

        this.maybeAttack();
        this.updateHealthBar();
        

    }

    maybeAttack() {

        if (Math.random() * 10 > 9.9) {

            this.attack();
        }

        // if (Math.random() * 10 > 9.95) {

        //     this.attack2();
        // }

        if (Math.random() * 10 > 9.95) {
            this.attack3();
        }
    }

}
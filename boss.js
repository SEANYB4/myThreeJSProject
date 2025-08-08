





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
        for (let i = 0; i < 6; i++) { // Increased number for a more menacing look
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



        setInterval(() => {

            const newX = (Math.random() - 0.5) * 20;
            const newY = (Math.random() - 0.5) * 20;
            const newZ = -10;

            this.moveToNewPosition(newX, newY, newZ, 2000);

        }, 5000);
    }


    attack() {
  
      // Laser attack improvements
      const laserGeometry = new THREE.CylinderGeometry(0.2, 0.2, 20, 32);
      const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.7, transparent: true });
      const laser = new THREE.Mesh(laserGeometry, laserMaterial);
      laser.position.copy(this.mesh.position);
      laser.rotation.x = Math.PI / 2;
      this.lasers.push(laser);
      this.scene.add(laser);
      // Assuming audioManager exists and is initialized
      //audioManager.playSound('laser_fire'); // Ensure sound name matches your files
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
        
    }

    maybeAttack() {

        if (Math.random() * 10 > 9.9) {

            this.attack();
        }

        if (Math.random() * 10 > 9.9) {

            this.attack2();
        }
    }

}
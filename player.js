import audioManager from "./app.js";

export class Spaceship {

    constructor(scene) {

        this.scene = scene;
        this.spaceship = new THREE.Group();

        this.numGrenades = 5;
        
        this.beamActive = false;
        this.beam = null;
        this.beamDuration = 2000;

        this.shieldActivated = false;
        this.shieldCooldown = false;

        this.shieldCooldownLength = 8000;
        this.shieldDuration = 4000;
        this.playerHealth = 100;

        // Main body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x778899 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        this.spaceship.add(body);

        // Cockpit
        const cockpitGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, transparent: true, opacity: 0.8 });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.z = 0.8;
        cockpit.scale.set(0.5, 0.5, 0.75); // Flatten the sphere a bit
        this.spaceship.add(cockpit);

        // Wings
        const wingGeometry = new THREE.BoxGeometry(0.1, 1, 2);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x1E90FF });
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.y = -1;
        rightWing.position.y = 1;
        this.spaceship.add(leftWing);
        this.spaceship.add(rightWing);

        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.3, 1, 32);
        const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x696969 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.z = -1.5;
        tail.rotation.x = Math.PI;
        this.spaceship.add(tail);

        // Add the spaceship to the scene
        this.scene.add(this.spaceship);

        this.createShield();

        this.healthBar = document.getElementById('playerHealthBar');
        this.healthBarContainer = document.getElementById('playerHealthContainer');
    
    }


    takeDamage(damage) {

        if (!this.shieldActivated) {
            this.playerHealth -= damage;
        }

        audioManager.playSound('playerHit');
    }


    createShield() {

    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x0099ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });

    this.shield = new THREE.Mesh(geometry, material);
    this.shield.visible = false;
    this.spaceship.add(this.shield);
}


    activateBeam() {

        const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 50, 32);
        const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.beam = new THREE.Mesh(beamGeometry, beamMaterial);
        this.beam.position.copy(this.spaceship.position);
        this.beam.rotation.x = Math.PI / 2;
        this.beam.position.z -= 25;


        this.scene.add(this.beam);
        this.beamActive = true;
        audioManager.playSound('laser4');

        setTimeout(() => {
            this.deactivateBeam();
        }, this.beamDuration);
    }


    deactivateBeam() {

        this.scene.remove(this.beam);
        this.beam = null;
        this.beamActive = false;

    }


    updateHealthBar() {

        const healthPercentage = this.playerHealth / 100;
        const healthBar = document.getElementById('playerHealthBar');
        if (this.healthBar) {
            this.healthBar.style.width = `${healthPercentage * 100}%`;
            if (healthPercentage < 0.3) {
                healthBar.style.backgroundColor = 'red';

            } else if (healthPercentage < 0.6) {

                healthBar.style.backgroundColor = 'yellow';
            } else {
                healthBar.style.backgroundColor = 'green';
            }
        }
    }



    displayShield() {

        const shieldIndicator = document.getElementById('shieldIndicator');
        if (this.shieldCooldown) {
            shieldIndicator.style.backgroundColor = 'grey';
        } else {
            shieldIndicator.style.backgroundColor = 'white';
        }


    }

}
import audioManager from "./app.js";

export class AlienSpaceship {


    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();  // Use a group to combine multiple parts
        this.createSpaceship();
        this.velocity = new THREE.Vector3(0.1, 0.1, 0.1);
        this.scene.add(this.mesh);
        this.lasers = [];
        this.beam = null;
        this.beamActive = false;
        this.beamDuration = 2000;
    }

    activateBeam() {


        const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 50, 32);
        const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.beam = new THREE.Mesh(beamGeometry, beamMaterial);
        this.beam.position.copy(this.mesh.position);
        this.beam.rotation.x = Math.PI / 2;
        this.beam.position.z += 25;
    

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

    createSpaceship() {
        // Main body - a torus for a futuristic look
        const bodyGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x5555ff, shininess: 150 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;

        // Appendages - elongated cones
        const appendageGeometry = new THREE.ConeGeometry(0.1, 0.5, 32);
        const appendageMaterial = new THREE.MeshPhongMaterial({ color: 0xff5555 });
        for (let i = 0; i < 4; i++) {
            const appendage = new THREE.Mesh(appendageGeometry, appendageMaterial);
            appendage.position.set(Math.cos(i * Math.PI / 2) * 0.6, Math.sin(i * Math.PI / 2) * 0.6, 0);
            appendage.rotation.z = i * Math.PI / 2;
            this.mesh.add(appendage);
        }

        // Central core - a glowing sphere
        const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.mesh.add(core);;

        this.mesh.add(body);  // Add the body last to ensure it's rendered on top for depth perception
        this.mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, -10);
    }

    maybeActivateBeam() {
        if (!this.beamActive && Math.random() < 0.01) {
            this.activateBeam();
        }
    }



    update() {

        this.mesh.position.add(this.velocity);
        this.boundaryCheck();
        this.attemptToShoot();

        this.maybeActivateBeam();

        if (this.beam) {
            this.beam.position.copy(this.mesh.position);
            this.beam.position.z += 25;
        }
    }




    boundaryCheck() {

        const bounds = 10;
        if (this.mesh.position.x > bounds || this.mesh.position.x < -bounds ||
            this.mesh.position.y > bounds || this.mesh.position.y < -bounds) {
            this.velocity.multiplyScalar(-1);
        }
    }


    remove() {
        this.scene.remove(this.mesh);
    }


    attemptToShoot() {
        if (Math.random() < 0.01) {
            this.shoot();
        }
    }


    shoot() {

        const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
        const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.position.copy(this.mesh.position);
        laser.rotation.x = Math.PI / 2;
        this.lasers.push(laser);
        this.scene.add(laser);
        audioManager.playSound('laser2');
        
    }
}

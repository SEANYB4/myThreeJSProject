import audioManager from "./app.js";
import { score } from "./app.js";

export class AlienInterceptor {

    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.createInterceptor();
        this.velocity = new THREE.Vector3(0.2, 0.2, 0);  // Faster and more aggressive
        this.scene.add(this.mesh);
        this.plasmaBursts = [];
        this.health = 100;
    }

    createInterceptor() {
        // Aggressive body - an elongated diamond shape
        const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 200 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;

        // Sharp wings
        const wingGeometry = new THREE.PlaneGeometry(1, 2);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
        for (let i = -1; i <= 1; i += 2) {
            const wing = new THREE.Mesh(wingGeometry, wingMaterial);
            wing.position.set(i * 0.75, 0, 0);
            wing.rotation.y = Math.PI / 2;
            this.mesh.add(wing);
        }

        // Central core - a pulsing red light
        const coreGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.6 });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.mesh.add(core);

        this.mesh.add(body);
        this.mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, -10);
    }

    activatePlasmaBurst() {
        const burstGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const burstMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500, opacity: 0.9, transparent: true });
        const burst = new THREE.Mesh(burstGeometry, burstMaterial);
        burst.position.copy(this.mesh.position);
        burst.position.z += 0.5;

        this.scene.add(burst);
        this.plasmaBursts.push(burst);

        

        setTimeout(() => {
            this.scene.remove(burst);
            this.plasmaBursts.splice(this.plasmaBursts.indexOf(burst), 1);
        }, 1000);  // Short-lived but powerful
    }

    update() {
        this.mesh.position.add(this.velocity);
        this.boundaryCheck();

        if (Math.random() < 0.1) {  // Lower chance but more powerful attack
            this.activatePlasmaBurst();
        }

        this.plasmaBursts.forEach(burst => {
            burst.position.add(new THREE.Vector3(0, 0, 0.5));  // Move bursts forward
        });


        if (this.health <= 0) {
            this.remove();
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
        while (this.plasmaBursts.length > 0) {
            let burst = this.plasmaBursts.pop();
            this.scene.remove(burst);
        }

        score++;
    }
}
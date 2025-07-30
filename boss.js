export class AlienMothership {

    constructor(scene) {


        this.scene = scene;
        this.health = 100;
        this.isAlive = true;
        this.mesh = new THREE.Group();
        this.createMothership();
        this.scene.add(this.mesh);
    }


    createMothership() {

        const bodyGeometry = new THREE.SphereGeometry(5, 32, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x5555ff, specular: 0x5555ff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.add(body);


        // Details like antennas or guns

        const detailGeometry = new THREE.BoxGeometry(0.5, 0.5, 2);
        const detailMaterial = new THREE.MeshPhongMaterial({ color: 0xff5555 });
        const detail = new THREE.Mesh(detailGeometry, detailMaterial);
        detail.position.set(0, 0, 3);
        this.mesh.add(detail);

    }


    attack(target) {
        console.log('Mothership attacking');
    }



    takeDamage(amount) {

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

        this.mesh.rotation.y += 0.01;
    }

}
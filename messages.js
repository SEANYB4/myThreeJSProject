import audioManager from "./app.js";


const cornerRadius = 20;


function drawRoundedRect(ctx, x, y, width, height, radius) {

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function createTextSprite(message, imageUrl, backgroundColor = 'rgba(0, 0, 240, 0.8', textColor = 'rgba(255, 255, 255, 0.95') {


    return new Promise(resolve => {
        const padding = 10; // Padding around content
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = new Image();

        image.onload = () => {
            const imageHeight = 200; // Fixed image height
            const imageWidth = 200; // Fixed image width

            context.font = 'Bold 40px Arial';
            const textWidth = context.measureText(message).width;
            const textHeight = 20; // Approximate height of the text

            // Set canvas dimensions
            canvas.width = textWidth + imageWidth + 250;
            canvas.height = Math.max(imageHeight, textHeight) + 50;

           


             // Draw background rectangle
             context.fillStyle = backgroundColor;
             drawRoundedRect(context, 0, 0, canvas.width, canvas.height, cornerRadius);
             context.fill();

            // Draw the image at the left side
            context.drawImage(image, padding, canvas.height/2-imageHeight/2, imageWidth, imageHeight);

            // Adjust text position: start after the image and padding
            context.font = 'Bold 40px Arial';
            context.fillStyle = textColor;
            context.fillText(message, imageWidth + (padding * 2), canvas.height / 2 + textHeight / 4);

            // Use the canvas contents as a texture
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(canvas.width / 100, canvas.height / 100, 1); // Adjust scaling based on your scene needs

            resolve(sprite);
        };

        image.src = imageUrl; // Set image source URL
    });

}



export class MessageManager {


    constructor(scene) {


        this.scene = scene;
        this.currentSprite = null;

    }

    displayMessage(message, interval, imageUrl) {

        try {
            audioManager.playSound('message');
        } catch(error) {

            console.log(error);
        }
        

        if (this.currentSprite) {
            this.scene.remove(this.currentSprite); // remove old message if exists
        }

        this.currentSprite = createTextSprite(message, imageUrl).then(sprite => {


            this.currentSprite = sprite;
            this.currentSprite.position.set(10, -10, -10);
            this.scene.add(this.currentSprite);


            setTimeout(() => {

                if (this.currentSprite) {
                    this.scene.remove(this.currentSprite);
                    this.currentSprite = null;
                }
    
            }, interval - 100);
    

        });
   


       
    }


    startPeriodicMessages(messages, interval) {

        let index = 0;
        setInterval(() => {
            this.displayMessage(messages[index % messages.length], interval);
            index++;

        }, interval);
    }

}
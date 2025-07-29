export class AudioManager {

    constructor() {


        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
    }

    loadSound(name, url) {

        fetch(url).then(response => response.arrayBuffer())
        .then(buffer => {
            this.audioContext.decodeAudioData(buffer, (decodedData) => {
                this.sounds[name] = decodedData;
            });
        }); 
    }

    playSound(name, options = {}) {
        if (this.sounds[name]) {
            const soundSource = this.audioContext.createBufferSource();
            soundSource.buffer = this.sounds[name];
            soundSource.loop = options.loop || false;
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = options.volume || 1;
            soundSource.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            soundSource.start(0);
            return soundSource;
        }
        console.error('Sound not found: ', name);
    }
}
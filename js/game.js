// set config of the game
let config = {
    type: Phaser.AUTO, 
    width: 360,
    height: 640,
    scene: [titleScene, gameScene, scoreScene],
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true
        }
    },
    audio: {
        disableWebAudio: true
    }
};

// create a new game, pass the config
let game = new Phaser.Game(config);

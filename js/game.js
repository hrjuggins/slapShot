// create a new scene
let gameScene = new Phaser.Scene('Game');

// initiate scene parameters
gameScene.init = function() {
    this.playerSpeed = 6;
}

// load assets
gameScene.preload = function() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('player', 'assets/player.png');
    this.load.image('defender', 'assets/defender.png');
    this.load.image('goal', 'assets/goal.png');    
    this.load.image('puck', 'assets/puck.png');
    this.load.audio('buzzer', 'assets/buzzer.mp3');
    this.load.audio('slapshot', 'assets/slapshot.mp3');
}

// called after the preload ends

gameScene.create = function() {
    this.bg = this.add.tileSprite(0, 0, 360, 640, 'background');
    this.bg.setOrigin(0,0);

    this.player = this.physics.add.sprite(this.sys.game.config.width/2, 400, 'player');
    this.player.setScale(0.5)

    
    // this.defender = this.physics.add.sprite(Math.random() * this.sys.game.config.width, 0, 'defender');
    // this.defender.setScale(0.65)
    // this.physics.moveTo(this.defender, this.player.x, this.player.y, 200);

    this.defenders = this.physics.add.group({
        defaultKey: 'defender'
    });

    this.goal = this.add.sprite(this.sys.game.config.width/2, 40, 'goal');

    this.pucks = this.physics.add.group({
        defaultKey: 'puck'
    });

    this.input.on('pointerdown', setOriginalPoint);
    this.input.on('pointerup', shoot, this);

    this.time.addEvent({delay: 3000, loop: true, callback: defence, callbackScope: this});
    

    scoreText = this.add.text(50, 50, score, { fontSize: 42, color: 'black' });

}

function shoot(pointer) {
    if (!activePuck) {
        gameScene.sound.play('slapshot');
        let puck = this.pucks.get(this.player.x, this.player.y);
        pucksShot ++;
        activePuck = true;
        console.log(pucksShot);
        if (puck) {
            puck.setActive(true);
            puck.setVisible(true);
            puck.setBounce(0.7);
            puck.setCollideWorldBounds(true);
            let angle = Phaser.Math.DegToRad(getAngle(original, current) - 180);
            gameScene.physics.velocityFromRotation(angle, 150, puck.body.velocity);
            puck.body.velocity.x *= 2;
            puck.body.velocity.y *= 2;
        } 
    }
    
}

function goalScored(puck) {
    gameScene.sound.play('buzzer');
    activePuck = false;
    puck.destroy();
    updateText();
}

let original
let current
let score = 0;
let pucksShot = 0;
let activePuck = false;

function setOriginalPoint() {
    original = {
        x: game.input.activePointer.x,
        y: game.input.activePointer.y,
    }
}

function setCurrentPoint() {
    current = {
        x: game.input.activePointer.x,
        y: game.input.activePointer.y
    }
}

function getAngle(obj1, obj2) {
    var angleDeg = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180 / Math.PI);
    return angleDeg
}

function updateText() {
    score ++;
    scoreText.setText(score)
}

function defence() {
    let defender = this.defenders.get(Math.random() * this.sys.game.config.width, 0);
    if (defender) {
    defender.setActive(true);
    defender.setVisible(true);
    defender.setScale(0.6)
    this.physics.moveTo(defender, this.player.x, this.player.y, 200);
    
        // puck.setBounce(0.7);
        // puck.setCollideWorldBounds(true);
        // let angle = Phaser.Math.DegToRad(getAngle(original, current) - 180);
        // gameScene.physics.velocityFromRotation(angle, 150, puck.body.velocity);
        // puck.body.velocity.x *= 2;
        // puck.body.velocity.y *= 2;
    }
}

function loss() {
    score = 0;
    gameScene.scene.restart()
    return;
}

// update function called 60 times a sec

gameScene.update = function() {

    // background and goal scrolling
    this.bg.tilePositionY -= 2
    this.goal.y += 2;
    if (this.goal.y == 640) {
        this.goal.y = 0;
    }

    // collisions
    let playerRect = this.player.getBounds();
    let goalRect = this.goal.getBounds();
    let pucks = this.pucks.getChildren()
    for (let i = 0; i < pucks.length; i++) {
        let puckRect = pucks[i].getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(puckRect, goalRect)) {
            goalScored(pucks[i])
        }
        if (puckRect.bottom == 10) {
            pucks[i].destroy();
        }
    }
    let defenders = this.defenders.getChildren()
    for (let i = 0; i < defenders.length; i++) {
        let defRect = defenders[i].getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, defRect)) {
            loss();
        }
    }
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect)) {
        this.player.y +=2;
    }
    if (!Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect) && this.player.y > 400) {
        // this.physics.moveTo(this.player, 400, 5);
        if (this.player.y == 400) {
            this.player.y = 400
        } else {
            this.player.y -= 2;
        }
    }
    if (this.player.y > 590) {
        loss();
    }
    
    // player movement
    if (this.input.activePointer.isDown) {
        setCurrentPoint()
        // console.log(getAngle(original, current))
        if (current.x > this.sys.game.config.width/2 && playerRect.left > 0 ) {
            this.player.x -= this.playerSpeed;
            this.player.flipX = false;
            // this.player.rotation += 0.05;
        } else if (current.x < this.sys.game.config.width/2 && playerRect.right < this.sys.game.config.width) {
            this.player.x += this.playerSpeed;
            this.player.flipX = true;
            // this.player.rotation -= 0.05;
        }
    }
}

gameScene.render = function() {
    game.debug.body(this.player);
}

// set config of the game

let config = {
    type: Phaser.AUTO, 
    width: 360,
    height: 640,
    scene: gameScene,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    audio: {
        disableWebAudio: true
    }
};

// create a new game, pass the config

let game = new Phaser.Game(config);
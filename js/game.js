// create a new scene
let gameScene = new Phaser.Scene('Game');

// initiate scene parameters
gameScene.init = function() {
    this.playerSpeed = 8;
    this.defenderSpeed = 8;
}

// load assets
gameScene.preload = function() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('player', 'assets/player.png');
    this.load.image('defender', 'assets/defender.png');
    this.load.image('goal', 'assets/goal.png');    
    this.load.image('puck', 'assets/puck.png');
    this.load.audio('buzzer', [
        'assets/buzzer.ogg',
        'assets/buzzer.mp3',
    ], {instances: 10});
    this.load.audio('slapshot', [
        'assets/slapshot.ogg',
        'assets/slapshot.mp3',
    ], {instances: 10});

}

// called after the preload ends

gameScene.create = function() {
    this.bg = this.add.tileSprite(0, 0, 360, 640, 'background');
    this.bg.setOrigin(0,0);

    this.player = this.physics.add.sprite(this.sys.game.config.width/2, 400, 'player');
    // this.player.setOrigin()
    this.player.setScale(0.4)

    
    // this.defender = this.physics.add.sprite(Math.random() * this.sys.game.config.width, 0, 'defender');
    // this.defender.setScale(0.65)
    // this.physics.moveTo(this.defender, this.player.x, this.player.y, 200);

    this.defenders = this.physics.add.group({
        defaultKey: 'defender'
    });

    this.defendersGroup = this.defenders.getChildren();

    this.goal = this.add.sprite(this.sys.game.config.width/2, 40, 'goal');

    this.pucks = this.physics.add.group({
        defaultKey: 'puck'
    });

    this.input.on('pointerdown', setOriginalPoint);
    this.input.on('pointerup', shoot, this);

    this.time.addEvent({delay: 3000, loop: false, callback: defence, callbackScope: this});

    scoreText = this.add.text(50, 50, score, { fontSize: 42, color: 'black' });

    this.graphics = this.add.graphics();
    this.graphics.fillStyle(0xf7f7f7);
    this.graphics.fillRect(0, 550, 360, 640);
    // this.graphics.lineStyle(20, 0x2ECC40);
    this.graphics.strokeRect(0, 550, 360, 80);
    this.time.addEvent({delay: 3000, loop: true, callback: flashSlowMo, callbackScope: this});
    this.text = this.add.text(this.sys.game.config.width/2 - 60, 575, 'Slo-mo zone', { fontFamily: 'Arial', fontSize: 24, color: '#000000' });

    
}

function flashSlowMo() {
    gameScene.graphics.clear();
    this.text.setColor('#00000000');
}
function shoot(pointer) {  
    if (!activePuck) {
        let puck = this.pucks.get(this.player.x, this.player.y);
        let puckPos = {
            x: this.player.x,
            y: this.player.y
        }
        pucksShot ++;
        activePuck = true;
        gameScene.sound.play('slapshot');
        if (puck) {
            puck.setActive(true);
            puck.setVisible(true);
            puck.setBounce(0.7);
            puck.setCollideWorldBounds(true);
            let angle = Phaser.Math.DegToRad(getAngle(puckPos, current) - 180);
            gameScene.physics.velocityFromRotation(angle, 150, puck.body.velocity);
            puck.body.velocity.x *= 4;
            puck.body.velocity.y *= 4;
        } 
    }
}

function goalScored(puck) {
    gameScene.sound.play('buzzer');
    activePuck = false;
    puck.destroy();
    updateText();
}

let original;
let current;
let score = 0;
let pucksShot = 0;
let activePuck = false;
let playerPos;

function setOriginalPoint() {

    let x = game.input.activePointer.x
    let y = game.input.activePointer.y

    original = {
        x: x,
        y: y
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
    setPlayerPos();
    let defender = gameScene.defenders.get(Math.random() * gameScene.sys.game.config.width, 0);
    if (defender) {
        defender.setActive(true);
        defender.setVisible(true);
        defender.setScale(0.5)
    }
    if (gameScene.defendersGroup[0].y >= 640) {
        defence();
    }
    if (gameScene.defendersGroup.length > 1) {
        gameScene.defendersGroup[0].destroy();
    }
}

function loss() {
    score = 0;
    activePuck = false;
    gameScene.scene.restart()
    return;
}

function setPlayerPos() {
    playerPos = {
        x: gameScene.player.x,
        y: gameScene.player.y
    }
}

// update function called 60 times a sec

gameScene.update = function() {
    
    if (this.defendersGroup.length >= 1) {
        if (this.defendersGroup[0].y >= 640) {
            this.defendersGroup[0].y = 0;
        }
        this.physics.moveTo(this.defendersGroup[0], playerPos.x, 700, this.defenderSpeed);
    }

    // background and goal scrolling
    if (this.input.activePointer.isDown && this.input.activePointer.y > this.player.y + 150) {
        this.bg.tilePositionY -= 0.5;
        this.goal.y += 0.5;
        this.playerSpeed = 1;
        this.defenderSpeed = 2 * 30;
    } else {
        this.bg.tilePositionY -= 3;
        this.goal.y += 3;
        this.playerSpeed = 6;
        this.defenderSpeed = 8 * 30;
    }
    if (this.goal.y >= this.sys.game.config.height) {
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
            activePuck = false;
            pucks[i].destroy();
            activePuck = false;
        } else  if (puckRect.bottom >= 640) {
            activePuck = false;
            pucks[i].destroy();
            activePuck = false;
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
        setCurrentPoint();
        // left
        if (current.x < this.player.x - 20 && playerRect.left > 0) {
            this.player.x -= this.playerSpeed;
            this.player.flipX = false;

            console.log(this.player);
        // right
        } else if (current.x > this.player.x + 20 && playerRect.right < this.sys.game.config.width ) {
            this.player.x += this.playerSpeed;
            this.player.flipX = true;
        
        }
        // inverted
        // right
        // if (current.x < this.player.x - 20 && playerRect.right < this.sys.game.config.width) {
        //     this.player.x += this.playerSpeed;
        // // left
        // } else if (current.x > this.player.x + 20 && playerRect.left > 0) {
        //     this.player.x -= this.playerSpeed;
        
        // }
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
            // debug: true
        }
    },
    audio: {
        disableWebAudio: true
    }
};

// create a new game, pass the config

let game = new Phaser.Game(config);

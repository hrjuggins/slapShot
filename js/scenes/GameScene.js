let gameScene = new Phaser.Scene('Game');

// initiate scene parameters
gameScene.init = function() {
    this.playerSpeed = 8;
    this.defenderSpeed = 10 * 30;
}

// load assets
gameScene.preload = function() {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('defender', 'assets/defender.png');
    this.load.image('goal', 'assets/goal.png');    
    this.load.image('puck', 'assets/puck.png');
    this.load.image('question', 'assets/question.png');
    this.load.image('slomoactivated', 'assets/slomoactivated.png');
    // this.load.audio('buzzer', [
    //     'assets/buzzer.ogg',
    //     'assets/buzzer.mp3',
    // ], {instances: 10});
    // this.load.audio('slapshot', [
    //     'assets/slapshot.ogg',
    //     'assets/slapshot.mp3',
    // ], {instances: 10});

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

    this.goal = this.physics.add.sprite(this.sys.game.config.width/2, 50, 'goal');

    this.pucks = this.physics.add.group({
        defaultKey: 'puck'
    });

    this.input.on('pointerdown', setOriginalPoint);
    this.input.on('pointerup', shoot, this);



    this.time.addEvent({delay: defTimer, loop: false, callback: defence, callbackScope: this});
    
    this.scoreText = this.add.text(50, 50, score, { fontSize: 42, color: 'black' });
    this.scoreText.setDepth(1);


    

    this.graphics = this.add.graphics();

    this.questions = this.physics.add.group({
        defaultKey: 'question'
    });
    this.questionsGroup = this.questions.getChildren();

    if (!questionActive) {
        this.time.addEvent({delay: 10000, loop: true, callback: showQuestion, callbackScope: this});
    }

    this.slomotext = this.add.sprite(gameScene.sys.game.config.width/2, 50, 'slomoactivated');
    this.slomotext.setVisible(false);

}


let original;
let current = {
    x: 160,
    y: 400
}
let score = 0;
let pucksShot = 0;
let activePuck = false;
let playerPos;
let questionActive = true;
let powerUpActive = false;
let powerUpStart;
let defTimer = 3000;
let defNum = 1;

function showQuestion() {
    let question = gameScene.questions.get(Math.random() * gameScene.sys.game.config.width, Math.random() * gameScene.sys.game.config.height / 2);
    if (question) {
        question.setActive(true);
        question.setVisible(true);
    }
    if (gameScene.questionsGroup.length > 1) {
        gameScene.questionsGroup[0].destroy();
        questionActive = false;
    }
}

function powerUpAction() {
    questionActive = false;
    powerUpStart = gameScene.time.now;
    let roll = Math.floor(Math.random() * 4);
    if (roll == 1) {
        flashSlowMo()
    }
}



function flashSlowMo() {
    gameScene.slomotext.setVisible(true);
    gameScene.graphics.fillStyle(0xf7f7f7);
    gameScene.graphics.fillRect(0, 550, 360, 640);
    // this.graphics.lineStyle(20, 0x2ECC40);
    gameScene.graphics.strokeRect(0, 550, 360, 80);
    gameScene.time.addEvent({delay: 3000, loop: true, callback: function() {
        gameScene.graphics.clear();
        gameScene.slomotext.setVisible(false);
    }, callbackScope: this});
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
        // gameScene.sound.play('slapshot');
        if (puck) {
            puck.setActive(true);
            puck.setVisible(true);
            puck.setBounce(0.7);
            puck.setCollideWorldBounds(true);
            angle = Phaser.Math.DegToRad(getAngle(puckPos, current) - 180);
            gameScene.physics.velocityFromRotation(angle, 150, puck.body.velocity);
            puck.body.velocity.x *= 4;
            puck.body.velocity.y *= 4;
        } 
    }
}

function goalScored(puck) {
    // gameScene.sound.play('buzzer');
    activePuck = false;
    puck.destroy();
    updateText();
}

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
    gameScene.scoreText.setText(score)
}

function defence() {
    setPlayerPos();
    let defender = gameScene.defenders.get(Math.random() * gameScene.sys.game.config.width, 0);
    if (defender) {
        defender.setActive(true);
        defender.setVisible(true);
        defender.setScale(0.5)
    }
    if (gameScene.defendersGroup.length > defNum) {
        gameScene.defendersGroup[0].destroy();
    }
}

function loss() {
    score = 0;
    activePuck = false;
    // gameScene.scene.pause()
    gameScene.scene.launch(scoreScene);
    // gameScene.scene.add('scoreScene', scoreScene, true, { x: 400, y: 300 });

    // gameScene.scene.restart()
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
    // power up code
    let powerRect
    if (this.questionsGroup.length >= 1) {
        powerRect = this.questionsGroup[0].getBounds();
        this.questionsGroup[0].y += 3
    }
    if (this.time.now - powerUpStart > 10000) {
        questionActive = true;
    }

    // defender code //
    // save defender bounds 
    let defRect
    // only this code if there is a defender
    if (this.defendersGroup.length >= 1) {
        // save defender bounds 
        defRect = this.defendersGroup[0].getBounds();
        // reset pos at bottom of screen
        if (this.defendersGroup[0].y >= 640) {
            defence();
        }
        // direction of defender towards player position
        this.physics.moveTo(this.defendersGroup[0], playerPos.x, 700, this.defenderSpeed);
        if (this.defendersGroup.length >= 2) {
            this.physics.moveTo(this.defendersGroup[1], playerPos.x, 700, this.defenderSpeed);
        }
    }
   
    // if (this.bg.tilePositionY <= -1000 && this.bg.tilePositionY >= - 1200) {
    //     defTimer = 4000;
    //     defNum = 2;
    // }

    // continuous scrolling and slow mo
    // if (this.input.activePointer.isDown && this.input.activePointer.y > this.player.y + 150) {
    //     this.bg.tilePositionY -= 0.5;
    //     this.goal.y += 0.5;
    //     this.playerSpeed = 1;
    //     this.defenderSpeed = 2 * 30;
    // } else {
    this.bg.tilePositionY -= 3;
    this.goal.y += 3;
    // this.playerSpeed = 8;
    // this.defenderSpeed = 10 * 30;
    // }
    if (this.goal.y >= 859) {
        this.goal.y = 0;
    }
    

    // collisions
    let playerRect = this.player.getBounds();
    let goalRect = this.goal.getBounds();
    let pucks = this.pucks.getChildren()

    for (let i = 0; i < pucks.length; i++) {
        let puckRect = pucks[i].getBounds();
        // puck and goal collision
        if (Phaser.Geom.Intersects.RectangleToRectangle(puckRect, goalRect)) {
            goalScored(pucks[i])
        // puck and defender collision
        } else if (defRect && Phaser.Geom.Intersects.RectangleToRectangle(puckRect, defRect)) {
            pucks[i].destroy();
            activePuck = false;
        } 
        // puck top of screen reset
        if (puckRect.bottom <= 10) {
            activePuck = false;
            pucks[i].destroy();
            // puck bottom of screen reset
        } else  if (puckRect.bottom >= 639) {
            activePuck = false;
            pucks[i].destroy();
        }
    }
    let defenders = this.defenders.getChildren()
    for (let i = 0; i < defenders.length; i++) {
        let defRect = defenders[i].getBounds();
        // defender and player collision
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, defRect)) {
            loss();
        } 
    } 
    // player and power up collision
    if (powerRect && Phaser.Geom.Intersects.RectangleToRectangle(playerRect, powerRect)) {
        powerUpAction();
    }
    
    // player and power up collision
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect)) {
        this.player.y +=3;
    }
    if (!Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect) && this.player.y > 400) {
        if (this.player.y == 400) {
            this.player.y = 400
        } else {
            this.player.y -= 2;
        }
    }
    // player bottom of screen collision
    if (this.player.y > 590) {
        loss();
    }
    
    
    // player movement
    if (this.input.activePointer.isDown) {
        setCurrentPoint();
        // left
        if (current.x < this.player.x - 20 && playerRect.left > 30) {
            this.player.x -= this.playerSpeed;
            this.player.flipX = false;
        // right
        } else if (current.x > this.player.x + 20 && playerRect.right < this.sys.game.config.width - 30) {
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

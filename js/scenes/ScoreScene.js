let scoreScene = new Phaser.Scene('Score');

scoreScene.preload = function() {
    this.load.image('result', 'assets/result.png');
}

scoreScene.create = function() {

    gameScene.scene.pause()
    gameScene.time.now = 0;
    gameScene.scoreText.setVisible(false);
    this.finalScore = this.add.text(this.sys.game.config.width/2 - 15, this.sys.game.config.height/2 - 30, gameScene.scoreText.text, { fontSize: 42, color: 'black' });
    this.finalScore.setDepth(1);

    result = this.add.sprite(this.sys.game.config.width/2, 300, 'result');

    this.input.once('pointerdown', function () {

        this.scene.stop();
        gameScene.scene.restart();

    }, this);

}
scoreScene.update = function() {}

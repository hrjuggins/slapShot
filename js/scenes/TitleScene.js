let titleScene = new Phaser.Scene('Title');

titleScene.preload = function() {
    this.load.image('title', 'assets/title.png');
}

titleScene.create = function() {
    let bg = this.add.sprite(0, 0, 'title');
    bg.setOrigin(0, 0);

    this.input.once('pointerdown', function () {
        
        this.scene.start(gameScene);

    }, this);

}

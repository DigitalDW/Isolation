class Main extends Phaser.Scene {
  constructor() {
    super('main'); // la clef d'accès à la scène
    this.lag = 0;
    this.needs = {
      sleep: 0,
      hunger: 0,
    };
    this.mental = 0;
    this.test;
    this.seconds = 0;
    this.playerSpeed = 3;
    this.cursors;
  }

  preload() {
    // preload l'image du joueur
    this.load.image('player', '../assets/redb.png');
  };

  create() {
    const timerEventConfig = {
      delay: 1000,
      repeat: 0,
      loop: true,
      callback: this.displayTime,
      callbackScope: this,
    };
    this.test = this.time.addEvent(timerEventConfig);

  
    // créer le sprite du joueur
    this.player = this.physics.add.image(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    // créer les variables d'input flèches du clavier
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  displayTime() {
    this.seconds++;
    console.log(this.seconds);
  }

  update() {
    if (this.seconds >= 10 && this.test.paused == false) {
      console.log('stop');
      this.test.paused = true;
    }
       //regarder si input actif j'ai fait avec if et else mais un switch pourrait être mieux
    if(this.cursors.right.isDown){
      //faire avancer le personnage 
      this.player.x += this.playerSpeed;
    } else if(this.cursors.left.isDown){
      this.player.x += -this.playerSpeed;
    } else if(this.cursors.down.isDown){
      this.player.y += this.playerSpeed;
    } else if(this.cursors.up.isDown){
      this.player.y += -this.playerSpeed;
    }
  }

  reset() {}
}

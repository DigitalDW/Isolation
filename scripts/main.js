class Main extends Phaser.Scene {
  constructor() {
    super('main'); // la clef d'accès à la scène
    this.duration = 120;
    this.mental = 1;
    this.lag = 1;
    this.needs = {
      sleep: 60,
      hunger: 30,
    };
    this.eventSeconds;
    this.seconds = 0;
    this.action = 0;
    this.rect;
    this.keys;
  }
  preload() {
    this.load.image('background', '../assets/background.png');
  }

  create() {
    this.add.image(300, 350, 'background');
    const timerEventConfig = {
      delay: 1000,
      repeat: 0,
      loop: true,
      callback: this.oneSecond,
      callbackScope: this,
    };
    this.eventSeconds = this.time.addEvent(timerEventConfig);

    this.rect = this.add.rectangle(200, 200, 100, 150, 0xffffff);

    this.physics.add.existing(this.rect);
    this.rect.body.setCollideWorldBounds(true);

    /*
    // Mouvement discontinu
    this.input.keyboard.on(
      'keyup',
      function (event) {
        switch (event.keyCode) {
          case 65: // touche A
            this.rect.x -= 20;
            break;
          case 68: // touche D
            this.rect.x += 20;
            break;
          case 87: // touche W
            this.rect.y -= 20;
            break;
          case 83: // touche S
            this.rect.y += 20;
            break;
        }
      },
      this
    );*/

    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
    });
    this.keys.enabled = true;

    if (this.keys.enabled) {
      this.keys.interact.on('down', this.interact, this);
    }
    // this.rect.body.velocity.x = 100;
    // this.rect.body.velocity.y = 100;
    // this.rect.body.bounce.x = 1;
    // this.rect.body.bounce.y = 1;
  }

  oneSecond() {
    this.seconds++;
    this.mental += 1 / this.duration;
    this.needs.hunger--;
    this.needs.sleep--;
  }

  interact(_, event) {
    this.keys.enabled = false;
    const currentHunger = this.needs.hunger;
    setTimeout(
      () => {
        this.action = this.seconds - this.action;
        let deviation = 0 - currentHunger;
        let modification = deviation / (30 * this.lag);
        this.lag += (modification / 2) * this.mental;
        this.needs.hunger = 30 * this.lag;
        const supposedSleep = 60 * this.lag - this.action;
        this.needs.sleep = supposedSleep;
        this.keys.enabled = true;
      },
      2000,
      currentHunger
    );
  }

  update() {
    if (
      this.seconds / 60 >= this.duration / 60 &&
      this.eventSeconds.paused == false
    ) {
      console.log('stop');
      this.eventSeconds.paused = true;
    }

    // Mouvement continu
    this.rect.body.setVelocity(0);
    if (this.keys.enabled) {
      if (this.keys.left.isDown) {
        this.rect.body.setVelocityX(-300);
      } else if (this.keys.right.isDown) {
        this.rect.body.setVelocityX(300);
      }

      if (this.keys.up.isDown) {
        this.rect.body.setVelocityY(-300);
      } else if (this.keys.down.isDown) {
        this.rect.body.setVelocityY(300);
      }
    }
  }

  reset() {}
}

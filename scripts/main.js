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
  }

  preload() {}

  create() {
    const timerEventConfig = {
      delay: 1000,
      repeat: 0,
      loop: true,
      callback: this.displayTime,
      callbackScope: this,
    };
    this.test = this.time.addEvent(timerEventConfig);
  }

  displayTime() {
    this.seconds++;
    console.log(this.seconds);
  }

  update() {}

  reset() {}
}

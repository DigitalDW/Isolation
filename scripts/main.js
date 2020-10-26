class Main extends Phaser.Scene {
  constructor() {
    super('main'); // la clef d'accès à la scène
    this.lag = 0;
    this.needs = {
      sleep: 0,
      hunger: 0,
    };
    this.mental = 0;
  }

  preload() {}

  create() {}

  update() {}

  reset() {}
}

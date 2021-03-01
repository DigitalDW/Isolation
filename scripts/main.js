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
		this.character;
		this.keys;
	}
	preload() {
		this.load.image('background', '../assets/background.png');
		this.load.image('character', '../assets/character.png');
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

		this.character = this.add.image(0, 0, 'character');

		this.physics.add.existing(this.character);
		this.character.body.setCollideWorldBounds(true);

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
			currentHunger,
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
		this.character.body.setVelocity(0);
		if (this.keys.enabled) {
			if (this.keys.left.isDown) {
				this.character.body.setVelocityX(-300);
				this.character.flipX = true; // retourner l'image
			} else if (this.keys.right.isDown) {
				this.character.body.setVelocityX(300);
				this.character.flipX = false;
			}

			if (this.keys.up.isDown) {
				this.character.body.setVelocityY(-300);
			} else if (this.keys.down.isDown) {
				this.character.body.setVelocityY(300);
			}
		}
	}

	reset() {}
}

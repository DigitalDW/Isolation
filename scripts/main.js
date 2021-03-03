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
		this.bed;
		this.bedCollision;
	}

	preload() {
		this.load.image('background', '../assets/background.png');
		this.load.image('bed', '../assets/bed.png');
		this.load.spritesheet(
			'character',
			'../assets/character_sprite.png',
			{ frameWidth: 90, frameHeight: 171 },
		);
	}

	create() {
		this.add.image(300, 350, 'background');
		this.bed = this.physics.add.image(384, 225, 'bed');
		this.bed.body.setCollideWorldBounds(true);
		this.bed.body.immovable = true;

		const timerEventConfig = {
			delay: 1000,
			repeat: 0,
			loop: true,
			callback: this.oneSecond,
			callbackScope: this,
		};
		this.eventSeconds = this.time.addEvent(timerEventConfig);

		this.anims.create({
			key: 'walk',
			frameRate: 12,
			frames: this.anims.generateFrameNumbers('character', {
				start: 6,
			}),
		});

		this.anims.create({
			key: 'idle',
			frameRate: 6,
			frames: this.anims.generateFrameNumbers('character', {
				start: 0,
				end: 5,
			}),
		});

		this.character = this.add.sprite(100, 100, 'character');
		this.character.play('idle', true);

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
		this.keys.isDown = false;

		if (this.keys.enabled) {
			this.keys.interact.on('down', this.interact, this);
		}

		this.bedCollision = this.physics.add.collider(
			this.character,
			this.bed,
			this.hitBed,
			null,
			this,
		);
	}

	hitBed() {
		console.log(this.character.x);
		if (
			this.character.x > 273.5 &&
			this.character.y < this.bed.height + 25
		) {
			this.character.y = this.bed.height + 25;
		}
	}

	playAnim() {
		this.character.play('walk', true);
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
		if (this.character.y <= this.bed.height + 25) {
			this.bedCollision.active = true;
		} else {
			this.bedCollision.active = false;
		}

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
				this.playAnim();
				this.character.body.setVelocityX(-200);
				this.character.flipX = true; // retourner l'image
			} else if (this.keys.right.isDown) {
				this.playAnim();
				this.character.body.setVelocityX(200);
				this.character.flipX = false;
			} else if (this.keys.up.isDown) {
				this.playAnim();
				this.character.body.setVelocityY(-200);
			} else if (this.keys.down.isDown) {
				this.playAnim();
				this.character.body.setVelocityY(200);
			} else {
				this.character.anims.play('idle', true);
			}
		}
	}

	reset() {}
}
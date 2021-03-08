class Main extends Phaser.Scene {
	constructor() {
		super('main'); // la clef d'accès à la scène
		this.duration = 2 * 60; // [x] mintues * 60
		this.timings = {
			food: [
				{
					start: [7, 0],
					end: [8, 0],
				},
				{
					start: [11, 30],
					end: [12, 30],
				},
				{
					start: [18, 0],
					end: [19, 0],
				},
			],
			goToSleep: [
				{
					start: [22, 0],
					end: [0, 0],
				},
			],
			wakeUp: [
				{
					start: [7, 0],
					end: [8, 0],
				},
			],
			meal: 2, // 0 = dejeuner, 1 = diner, 2 = souper
			inBed: true,
		};
		this.elapsedTime;
		this.relativeTime;
		this.relativeTimeDelay = 1000;
		this.seconds = 0;
		this.minute = 0;
		this.hour = 15;
		this.action = 0;
		this.character;
		this.keys;
		this.bed;
		this.bedCollision;
		this.foodCabinet;
		this.sink;
		this.toilet;
		this.flip = false;
		this.detected = null;
		this.rects = [];
	}

	preload() {
		this.load.image('background', '../assets/background.png');
		this.load.image('bed', '../assets/bed.png');
		this.load.image('cabinet', '../assets/food_cabinet.png');
		this.load.spritesheet('sink', '../assets/sink.png', {
			frameWidth: 130,
			frameHeight: 150,
		});
		this.load.image('toilet', '../assets/toilet.png');
		this.load.spritesheet(
			'character',
			'../assets/character_sprite.png',
			{ frameWidth: 90, frameHeight: 171 },
		);
	}

	create() {
		//#######//
		// Timer //
		//#######//
		const elapsedTimeConfig = {
			delay: 1000,
			repeat: 0,
			loop: true,
			callback: this.realTime,
			callbackScope: this,
		};
		this.elapsedTime = this.time.addEvent(elapsedTimeConfig);

		const relativeTimeConfig = {
			delay: 1000,
			repeat: 0,
			loop: true,
			callback: this.feltTime,
			callbackScope: this,
		};
		this.relativeTime = this.time.addEvent(relativeTimeConfig);

		//############//
		// Animations //
		//############//
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

		//######//
		// Keys //
		//######//
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

		//############//
		// Add images //
		//############//
		this.add.image(300, 350, 'background');
		this.bed = this.physics.add.image(384, 225, 'bed');
		this.bed.body.immovable = true;

		this.foodCabinet = this.physics.add.image(65, 425, 'cabinet');
		this.foodCabinet.body.immovable = true;

		this.sink = this.physics.add.image(65, 275, 'sink');
		this.sink.body.immovable = true;

		this.toilet = this.physics.add.image(65, 150, 'toilet');
		this.toilet.body.immovable = true;

		//###############//
		// Add character //
		//###############//
		this.character = this.add.sprite(225, 250, 'character');
		this.character.play('idle', true);

		this.physics.add.existing(this.character);
		this.character.body.setCollideWorldBounds(true);

		//#########//
		// Overlap //
		//#########//
		this.charCircle = this.add.circle(0, 0, 1);
		this.physics.add.existing(this.charCircle);

		[this.bed, this.foodCabinet, this.sink, this.toilet].forEach(
			(elem) => {
				const rect = this.add.rectangle(
					elem.x,
					elem.y,
					elem.width + 25,
					elem.height,
				);
				rect.name = elem.texture.key;

				this.rects.push(rect);
				this.physics.add.existing(rect);
			},
		);

		//############//
		// Collitions //
		//############//
		this.bedCollision = this.physics.add.collider(
			this.character,
			this.bed,
		);
		this.physics.add.collider(this.character, this.foodCabinet);
		this.physics.add.collider(this.character, this.sink);
		this.physics.add.collider(this.character, this.toilet);
	}

	test(_, t) {
		this.detected = t.name;
	}

	playAnim() {
		this.character.play('walk', true);
	}

	realTime() {
		this.seconds++;
		/*this.mental += 1 / this.duration;
		this.needs.hunger--;
		this.needs.sleep--;*/
	}

	feltTime() {
		this.minute++;
		if (this.minute != 0 && this.minute % 60 == 0) {
			this.minute = 0;
			this.hour++;
			if (this.hour != 0 && this.hour % 24 == 0) {
				this.hour = 0;
			}
		}
		console.log(`${this.hour}:${this.minute}`);
	}

	interact(_, event) {
		// ---- IMPORTANT! ---- //
		// Detection of objects //
		// ---- IMPORTANT! ---- //
		let over = false;
		this.rects.forEach((r) => {
			const t = this.physics.overlap(
				this.charCircle,
				r,
				this.test,
				null,
				this,
			);
			over ||= t;
		});
		if (!over) {
			this.detected = null;
		}

		// IMPORTANT: on peut ralentir/accelerer le delai avec this.relativeTime.delay = ...

		console.log(this.detected);
		let timing;
		if (this.detected == 'cabinet') {
			const meal = this.timings.meal;
			this.timings.meal = (meal + 1) % 3 == 0 ? 0 : meal + 1; // change meal timing
			timing = this.timings.food[meal];
			this.characterAction(timing, 'eat');
		} else if (this.detected == 'bed') {
			const sleeping = this.timings.inBed;
			this.timing.inBed = !this.timings.inBed;
			timing = !inBed ? this.timings.goToSleep : this.timings.wakeUp;
			this.characterAction(timing, !inBed ? 'goToSleep' : 'wakeUp');
		}
		/*this.keys.enabled = false;
		const currentHunger = this.needs.hunger;
		setTimeout(
			() => {
				this.action = this.minute - this.action;
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
		);*/
	}

	characterAction(timing, action) {
		if (
			(this.hour == timing.start[0] &&
				this.minute >= timing.start[1]) ||
			(this.hour == timing.end[0] && this.minute <= timing.end[1])
		) {
		}
	}

	update() {
		if (this.character.y <= this.bed.height + 24) {
			this.bedCollision.active = true;
		} else {
			this.bedCollision.active = false;
		}

		if (
			this.seconds / 60 >= this.duration / 60 &&
			this.elapsedTime.paused == false
		) {
			console.log('stop');
			this.elapsedTime.paused = true;
			this.relativeTime.paused = true;
		}

		// Mouvement continu
		this.character.body.setVelocity(0);
		this.charCircle.x = this.character.x + (this.flip ? -40 : 40);
		this.charCircle.y = this.character.y;
		if (this.keys.enabled) {
			if (this.keys.left.isDown) {
				this.playAnim();
				this.character.body.setVelocityX(-200);
				this.character.flipX = true; // retourner l'image
				this.flip = true;
			} else if (this.keys.right.isDown) {
				this.playAnim();
				this.character.body.setVelocityX(200);
				this.character.flipX = false;
				this.flip = false;
			} else if (this.keys.up.isDown) {
				this.playAnim();
				this.character.body.setVelocityY(
					this.character.x > 273.5 &&
						this.character.y < this.bed.height + 40
						? 0
						: -200,
				);
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

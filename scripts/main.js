class Main extends Phaser.Scene {
	constructor() {
		super('main'); // la clef d'accès à la scène

		// Game duration
		this.duration = 24 * 60; // [x] mintues * 60

		// Timings
		this.timings = {
			food: [
				{
					start: 7,
					end: 8,
				},
				{
					start: 12,
					end: 13,
				},
				{
					start: 18,
					end: 19,
				},
			],
			goToSleep: {
				start: 22,
				end: 0,
			},
			wakeUp: {
				start: 7,
				end: 8,
			},
		};

		// Character stats
		this.characterStats = {
			meal: 3, // 0 = has to eat breakfast, 1 = has to eat lunch, 2 = doit has to eat diner, 3+ = more meals
			inBed: false,
			day: 1,
		};

		this.elapsedTime;
		this.relativeTime;
		this.relativeTimeDelay = 1000;

		// Time variables
		this.seconds = 0;
		this.minute = 0;
		this.hour = 23; // starting hour
		this.day = 1;

		// Action variables
		this.forceWakeUp = false;

		// Sprites and images variables
		this.character;
		this.keys;
		this.bed;
		this.bedCollision;
		this.foodCabinet;
		this.sink;
		this.toilet;
		this.rects = [];

		// Character flip variable
		this.flip = false;

		// Detection variable
		this.detected = null;
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
			{ frameWidth: 95, frameHeight: 171 },
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
			key: 'idle',
			frameRate: 6,
			frames: this.anims.generateFrameNumbers('character', {
				start: 0,
				end: 5,
			}),
		});

		this.anims.create({
			key: 'walk',
			frameRate: 12,
			frames: this.anims.generateFrameNumbers('character', {
				start: 6,
				end: 13,
			}),
		});

		this.anims.create({
			key: 'drink',
			frameRate: 8,
			frames: this.anims.generateFrameNumbers('character', {
				start: 14,
				end: 54,
			}),
		});

		this.anims.create({
			key: 'sleep',
			frameRate: 5,
			repeat: -1,
			frames: this.anims.generateFrameNumbers('character', {
				start: 55,
				end: 62,
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
	}

	feltTime() {
		this.minute++;
		if (this.minute != 0 && this.minute % 60 == 0) {
			this.minute = 0;
			this.hour++;
			if (this.hour != 0 && this.hour % 24 == 0) {
				this.hour = 0;
				this.day++;
			}
		}
		console.log(`day ${this.day} : ${this.hour}:${this.minute}`);
	}

	interact(_, event) {
		if (!this.keys.enabled && !this.characterStats.inBed) {
			return;
		}

		// Detection of objects
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

		this.keys.enabled = false;
		console.log(this.detected);
		let timing;
		if (this.detected == 'cabinet') {
			this.character.x -= 25;
			this.character.play('drink');
			const meal = this.characterStats.meal;
			this.characterStats.meal++;
			timing = !(meal > 2)
				? this.timings.food[meal]
				: { start: this.hour + 1, end: this.hour + 2 };
			this.characterAction(timing, 'eat');
		} else if (this.detected == 'bed') {
			timing = this.characterStats.inBed
				? this.timings.wakeUp
				: this.timings.goToSleep;
			this.characterAction(
				timing,
				this.characterStats.inBed ? 'wakeUp' : 'goToSleep',
			);
			this.characterStats.inBed = !this.characterStats.inBed;
		}
	}

	characterAction(timing, action) {
		let deviation = 0;
		let day = this.characterStats.day;

		if (action == 'eat') {
			this.character.once(
				'animationcomplete',
				function () {
					this.keys.enabled = true;
					this.character.x += 25;
				},
				this,
			);
			deviation += this.eatDeviation(timing);
		} else if (action == 'goToSleep') {
			this.coords = [this.character.x, this.character.y];
			this.character.x = this.bed.x + 17;
			this.character.y = this.bed.y - 36;
			this.character.play('sleep');
			deviation += this.sleepDeviation(timing, day);
		} else if (action == 'wakeUp') {
			this.keys.enabled = true;
			this.character.x = this.coords[0];
			this.character.y = this.coords[1];
			this.characterStats.day++;
			this.characterStats.meal = 0;
			deviation += this.wakeUpDeviation(timing);
		}

		deviation = deviation / 75; // attenuer les effets du décalage
		this.relativeTimeDelay += deviation;
		this.relativeTime.delay = this.relativeTimeDelay;
		console.log(this.relativeTimeDelay);

		// IMPORTANT: on peut ralentir/accelerer le delai avec this.relativeTime.delay = ...
	}

	eatDeviation(timing) {
		let dev = 0;
		let h = 0;
		let m = 0;
		if (this.hour < timing.start) {
			h = timing.start - 1 - this.hour;
			m = 60 - this.minute + h * 60;
			dev -= m * 15;
		} else if (this.hour >= timing.end) {
			h = this.hour - timing.end;
			m = this.minute + h * 60;
			dev += m * 15;
		}
		return dev;
	}

	sleepDeviation(timing, day) {
		let dev = 0;
		let mealsVariation = 0;
		if (!this.forceWakeUp) {
			mealsVariation = this.characterStats.meal - 3; // negatif = pas assez de repas, positif = trop de repas, 0 = assez de repas
		}
		dev += mealsVariation * 75;

		let h = 0;
		let m = 0;
		if (this.hour < timing.start && this.day == day) {
			h = timing.start - 1 - this.hour;
			m = 60 - this.minute + h * 60;
			dev -= m * 25;
		} else if (this.hour >= timing.end && this.day > day) {
			h = this.hour - timing.end;
			m = this.minute + h * 60;
			dev += m * 25;
		}
		return dev;
	}

	wakeUpDeviation(timing) {
		const currDay = this.day;
		const day = this.characterStats.day;
		let dev = 0;
		let h = 0;
		let m = 0;
		if (this.hour < timing.start && this.day == day) {
			h = timing.start - 1 - this.hour;
			m = 60 - this.minute + h * 60;
			dev -= m * 20;
		} else if (this.hour >= timing.end && this.day == day) {
			h = this.hour - timing.end;
			m = this.minute + h * 60;
			dev += m * 10;
		} else {
			h = 23 - this.hour + timing.start;
			m = 60 - this.minute + h * 60;
			dev -= m * 30;
		}
		this.day += this.day + 1 == currDay ? 0 : 1;
		this.hour = 7;
		return dev;
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

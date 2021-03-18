class Title extends Phaser.Scene {
	constructor() {
		super('title');

		this.alpha = 1;

		this.loadLogo = true;
		this.volume = 0.33;
	}

	preload() {
		this.load.image('logo', '../assets/title.png');
		this.load.image('background', '../assets/background.png');
		this.load.image('bed', '../assets/bed.png');
		this.load.image('cabinet', '../assets/food_cabinet.png');
		this.load.spritesheet('sink', '../assets/sink.png', {
			frameWidth: 130,
			frameHeight: 150,
		});
		this.load.image('toilet', '../assets/toilet.png');
		this.load.image('arrow', '../assets/arrow.png');

		this.load.audio('menu', ['../assets/audio/menu.mp3']);
		this.load.audio('menu_press', [
			'../assets/audio/menu_press.ogg',
			'../assets/audio/menu_press.mp3',
		]);
		this.load.audio('pluck', [
			'../assets/audio/pluck.ogg',
			'../assets/audio/pluck.mp3',
		]);
	}

	create() {
		this.music = this.sound.add('menu');
		this.music.setVolume(0.33);
		this.music.setLoop(true);
		this.music.play();

		const options = this.scene.get('options');
		options.events.on('volume_change', (value) => {
			this.music.setVolume(value);
		});

		this.press = this.sound.add('menu_press').setVolume(0.5);
		this.pluck = this.sound.add('pluck').setVolume(0.33);

		this.add.image(300, 350, 'background');

		this.bed = this.physics.add.image(384, 225, 'bed');
		this.bed.body.immovable = true;

		this.foodCabinet = this.physics.add.image(65, 425, 'cabinet');
		this.foodCabinet.body.immovable = true;

		this.sink = this.physics.add.sprite(65, 275, 'sink');
		this.sink.body.immovable = true;

		this.toilet = this.physics.add.image(65, 150, 'toilet');
		this.toilet.body.immovable = true;

		this.rect = this.add.rectangle(
			this.game.config.width / 2,
			this.game.config.height / 2,
			this.game.config.width,
			this.game.config.height,
			'black',
		);

		this.logo = this.add.image(
			this.game.config.width / 2,
			this.loadLogo ? -100 : this.logo.height * 1.5,
			'logo',
		);
		if (!this.loadLogo) this.drawMenu();
		this.logo.setScale(1.5);
		//this.drawStart(); // for testing purposes
	}

	drawStart() {
		this.play = this.add
			.text(70, this.logo.height * 3, 'Press space to start', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);

		this.tweens.add({
			targets: [this.play],
			alpha: { value: 1, duration: 1000, ease: 'Power1' },
			delay: 250,
			onComplete: () => (this.play.isVisible = true),
		});

		this.play.on('pointerdown', () => {
			this.drawMenu();
			this.press.play();
		});
		this.input.keyboard.once('keydown-' + 'SPACE', () => {
			this.drawMenu();
			this.press.play();
		});
	}

	drawMenu() {
		this.play.destroy();

		this.arrow = this.add
			.image(155, this.logo.height * 3.15, 'arrow')
			.setAlpha(0);

		this.newGame = this.add
			.text(165, this.logo.height * 3, 'New game', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.newGame.on('pointerover', () => {
			this.arrow.y = this.logo.height * 3.15;
			this.pluck.play();
		});
		this.newGame.on('pointerdown', this.startGame, this);

		this.continue = this.add
			.text(164.5, this.logo.height * 3.5, 'Continue', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.continue.on('pointerover', () => {
			this.arrow.y = this.logo.height * 3.65;
			this.pluck.play();
		});
		this.continue.on('pointerdown', this.loadGame, this);

		this.options = this.add
			.text(173, this.logo.height * 4, 'Options', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.options.on('pointerover', () => {
			this.arrow.y = this.logo.height * 4.15;
			this.pluck.play();
		});
		this.options.on('pointerdown', this.optionsMenu, this);

		this.tweens.add({
			targets: [this.newGame, this.continue, this.options],
			alpha: { value: 1, duration: 1000, ease: 'Power1' },
			delay: 250,
			onComplete: () => {
				this.arrow.setAlpha(1);
			},
		});
	}

	startGame() {
		this.newGame.destroy();
		this.continue.destroy();
		this.options.destroy();
		this.logo.destroy();
		this.music.stop();
		this.press.play();
		this.scene.start('help', { origin: 'newgame', playerData: {} });
	}

	loadGame() {
		this.music.stop();
		const data = JSON.parse(
			localStorage.getItem('isolation_saved_game_data'),
		);
		this.press.play();
		this.scene.start('help', { origin: 'newgame', playerData: data });
	}

	optionsMenu() {
		this.press.play();
		this.scene.pause();
		this.scene.launch('options', {
			origin: 'title',
		});
		console.log(this.music.volume);
	}

	update() {
		if (this.alpha - 1 / (60 * 200) >= 0.8) {
			this.alpha -= 1 / (60 * 200);
			this.rect.setFillStyle('black', this.alpha);
		}

		if (Math.abs(this.logo.y + 1 / 4) <= this.logo.height * 1.5) {
			this.logo.y += 1 / 4;
			if (this.logo.y == this.logo.height * 1.5 && this.loadLogo) {
				this.drawStart();
			}
		}

		if (this.play && this.play.isVisible) {
			if (Math.floor(this.time.now / 1000) % 2 == 0) {
				this.play.setAlpha(0);
			} else {
				this.play.setAlpha(1);
			}
		}

		if (this.arrow) {
			if (!this.left && this.arrow.x + 1 / 3 <= 148) {
				this.arrow.x += 1 / 3;
			} else {
				this.left = true;
				this.arrow.x -= 1 / 3;
				if (this.arrow.x <= 142) {
					this.left = false;
				}
			}
		}
	}
}

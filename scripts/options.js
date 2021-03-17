class Options extends Phaser.Scene {
	constructor() {
		super('options');
	}

	init(data) {
		this.fromScene = data.origin;
	}

	preload() {
		this.load.image('arrow', '../assets/arrow.png');

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
		this.press = this.sound.add('menu_press').setVolume(0.5);
		this.pluck = this.sound.add('pluck').setVolume(0.33);

		this.rect = this.add.rectangle(
			this.game.config.width / 2,
			this.game.config.height / 2,
			this.game.config.width,
			this.game.config.height,
			'black',
			this.alpha,
		);

		this.help = this.add
			.text(177, 90 * 2.5, 'Help', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.help.on('pointerover', () => {
			this.arrow.y = 90 * 2.65;
			this.arrow.x = 155;
			this.pluck.play();
		});
		/*this.help.on('pointerdown', () => {
			this.scene.stop();
			this.press.play();
			this.scene.resume('game');
		});*/

		this.volume = this.add
			.text(169, 90 * 3, 'Volume', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.volume.on('pointerover', () => {
			this.arrow.y = 90 * 3.15;
			this.arrow.x = 147;
			this.pluck.play();
		});
		//this.volume.on('pointerdown', this.volumeMenu, this);

		this.back = this.add
			.text(124, 90 * 3.5, 'Back', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.back.on('pointerover', () => {
			this.arrow.y = 90 * 3.65;
			this.arrow.x = 102;
			this.pluck.play();
		});
		this.back.on('pointerdown', this.backToScene, this);

		this.tweens.add({
			targets: [this.help, this.volume, this.back],
			alpha: { value: 1, duration: 1000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {
				this.arrow = this.add.image(155, 90 * 2.65, 'arrow');
			},
		});
	}

	backToScene() {
		if (this.fromScene == 'pause') {
			this.scene.start('pause');
		} else if (this.fromScene == 'title') {
			this.scene.start('title', { fromOptions: true });
		}
	}

	update() {
		if (this.alpha + 1 / 120 <= 0.8) {
			this.alpha += 1 / 120;
			this.rect.setFillStyle('black', this.alpha);
		}
	}
}

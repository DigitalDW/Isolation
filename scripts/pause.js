class Pause extends Phaser.Scene {
	constructor() {
		super('pause');

		this.alpha = 0;
	}

	init(data) {
		this.volume = data.volume;
		this.playerData = {
			character: data.characterStats,
			timeInfo: data.timeInfo,
		};
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

		this.input.keyboard.on('keydown-' + 'ESC', () => {
			this.scene.stop();
			this.scene.resume('game');
		});

		this.rect = this.add.rectangle(
			this.game.config.width / 2,
			this.game.config.height / 2,
			this.game.config.width,
			this.game.config.height,
			'black',
			this.alpha,
		);

		this.arrow = this.add.image(155, 90 * 2.65, 'arrow').setAlpha(0);

		this.resume = this.add
			.text(177, 90 * 2.5, 'Resume', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.resume.on('pointerover', () => {
			this.arrow.y = 90 * 2.65;
			this.arrow.x = 155;
			this.pluck.play();
		});
		this.resume.on('pointerdown', () => {
			this.scene.stop();
			this.press.play();
			this.scene.resume('game');
		});

		this.options = this.add
			.text(169, 90 * 3, 'Options', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.options.on('pointerover', () => {
			this.arrow.y = 90 * 3.15;
			this.arrow.x = 147;
			this.pluck.play();
		});
		this.options.on('pointerdown', this.optionsMenu, this);

		this.save = this.add
			.text(124, 90 * 3.5, 'Save and quit', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.save.on('pointerover', () => {
			this.arrow.y = 90 * 3.65;
			this.arrow.x = 102;
			this.pluck.play();
		});
		this.save.on('pointerdown', this.saveGame, this);

		this.tweens.add({
			targets: [this.resume, this.options, this.save],
			alpha: { value: 1, duration: 1000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {
				this.arrow.setAlpha(1);
			},
		});
	}

	optionsMenu() {
		this.press.play();
		this.scene.stop();
		this.scene.start('options', { origin: 'game' });
	}

	saveGame() {
		localStorage.setItem(
			'isolation_saved_game_data',
			JSON.stringify(this.playerData),
		);
		console.log(
			`saved : ${JSON.parse(
				localStorage.getItem('isolation_saved_game_data'),
			)}`,
		);
		this.scene.stop('game');
		this.scene.stop();
		this.sound.stopAll();
		this.press.play();
		this.scene.start('title');
	}

	update() {
		if (this.alpha + 1 / 120 <= 0.8) {
			this.alpha += 1 / 120;
			this.rect.setFillStyle('black', this.alpha);
		}
	}
}

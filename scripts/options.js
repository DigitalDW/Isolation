class Options extends Phaser.Scene {
	constructor() {
		super('options');
	}

	init(data) {
		this.fromScene = data.origin;
		this.originScene = this.scene.get(data.origin);
		if (data.origin == 'title') {
			this.test = [this.originScene.music];
		} else if (data.origin == 'game') {
			this.test = [
				this.originScene.music_1,
				this.originScene.music_2,
			];
		}
	}

	preload() {
		this.load.scenePlugin({
			key: 'rexuiplugin',
			url:
				'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
			sceneKey: 'rexUI',
		});

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

		this.slider = this.rexUI.add
			.slider({
				x: 225,
				y: 305,
				width: 200,
				height: 10,
				orientation: 'x',

				track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 6, 0x696969),
				indicator: this.rexUI.add.roundRectangle(
					0,
					0,
					0,
					0,
					6,
					0xb0b0b0,
				),
				thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 6, 0xb0b0b0),

				space: {
					top: 4,
					bottom: 4,
				},
				input: 'drag', // 'drag'|'click'
				value: this.test[0].volume,
			})
			.layout();

		this.slider.on('valuechange', (value) => {
			this.events.emit('volume_change', value);
		});

		this.help = this.add
			.text(192, 90 * 2.5, 'Help', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.help.on('pointerover', () => {
			this.arrow.y = 90 * 2.65;
			this.arrow.x = 170;
			this.pluck.play();
		});
		/*this.help.on('pointerdown', () => {
			this.scene.stop();
			this.press.play();
			this.scene.resume('game');
		});*/

		this.volume = this.add
			.text(132, 90 * 3, 'Music volume', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		//this.volume.on('pointerdown', this.volumeMenu, this);

		this.back = this.add
			.text(192, 90 * 3.5, 'Back', {
				font: '26px',
			})
			.setInteractive()
			.setAlpha(0);
		this.back.on('pointerover', () => {
			this.arrow.y = 90 * 3.65;
			this.arrow.x = 170;
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
		if (this.fromScene == 'game') {
			this.scene.stop();
			this.scene.run('pause');
		} else if (this.fromScene == 'title') {
			this.scene.stop();
			this.scene.run('title');
		}
	}

	update() {
		if (this.alpha + 1 / 120 <= 0.8) {
			this.alpha += 1 / 120;
			this.rect.setFillStyle('black', this.alpha);
		}
	}
}

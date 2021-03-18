class Help extends Phaser.Scene {
	constructor() {
		super('help');
	}

	init(data) {
		this.origin = data.origin;
		this.playerData = data.playerData;
	}

	preload() {
		this.load.image('arrow', '../assets/arrow.png');

		this.load.image('key_w', '../assets/key_w.png');
		this.load.image('key_s', '../assets/key_s.png');
		this.load.image('key_a', '../assets/key_a.png');
		this.load.image('key_d', '../assets/key_d.png');
		this.load.image('key_e', '../assets/key_e.png');

		this.load.image('bed', '../assets/bed.png');
		this.load.image('cabinet', '../assets/food_cabinet.png');
		this.load.spritesheet('sink', '../assets/sink.png', {
			frameWidth: 130,
			frameHeight: 150,
		});
		this.load.image('toilet', '../assets/toilet.png');

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

		const offs = {
			x: 48,
			y: 50,
		};

		this.wasd = this.add.text(
			96 + offs.x,
			0 + offs.y,
			'Press W A S D to walk around',
			{
				font: '16px',
			},
		);
		this.add.image(20 + offs.x, 0 + offs.y, 'key_w');
		this.add.image(0 + offs.x, 20 + offs.y, 'key_a');
		this.add.image(24 + offs.x, 20 + offs.y, 'key_s');
		this.add.image(48 + offs.x, 20 + offs.y, 'key_d');

		this.e = this.add.text(
			96 + offs.x,
			50 + offs.y,
			'Press E to interact with the \nobjects in the room:',
			{
				font: '16px',
			},
		);
		this.add.image(24 + offs.x, 65 + offs.y, 'key_e');

		this.physics.add
			.sprite(24 + offs.x, 216 - offs.y, 'sink')
			.setScale(0.25);

		this.sink = this.add.text(
			96 + offs.x,
			108 + offs.y,
			'Sink: make water flow',
			{
				font: '16px',
			},
		);

		this.physics.add
			.image(24 + offs.x, 274 - offs.y, 'cabinet')
			.setScale(0.25);

		this.cabinet = this.add.text(
			96 + offs.x,
			152 + offs.y,
			'Cabinet: eat, you should eat \n3 times a day (listen for \nstomach growls)',
			{
				font: '16px',
			},
		);

		this.physics.add
			.image(24 + offs.x, 330 - offs.y, 'toilet')
			.setScale(0.25);

		this.toilet = this.add.text(
			96 + offs.x,
			215 + offs.y,
			'Toilet: you should go 2-3 \ntimes a day',
			{
				font: '16px',
			},
		);

		this.physics.add
			.image(24 + offs.x, 400 - offs.y, 'bed')
			.setScale(0.25);

		this.bed = this.add.text(
			96 + offs.x,
			285 + offs.y,
			'Bed: sleep, listen to yawns \nto know when to go',
			{
				font: '16px',
			},
		);

		this.arrow = this.add.image(170, 443, 'arrow');

		this.button = this.add
			.text(193, 430, this.origin == 'options' ? 'Back' : 'Play', {
				font: '26px',
			})
			.setInteractive();
		this.button.on('pointerover', () => this.pluck.play());
		this.button.on('pointerdown', this.backToScene, this);
	}

	backToScene() {
		if (this.origin == 'options') {
			this.scene.stop();
			this.press.play();
			this.scene.run('options');
		} else {
			this.press.play();
			this.scene.start('game', this.playerData);
		}
	}

	update() {
		if (!this.left && this.arrow.x + 1 / 3 <= 178) {
			this.arrow.x += 1 / 3;
		} else {
			this.left = true;
			this.arrow.x -= 1 / 3;
			if (this.arrow.x <= 168) {
				this.left = false;
			}
		}
	}
}

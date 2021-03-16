const config = {
	type: Phaser.WEBGL,
	width: 450,
	height: 500,
	parent: 'phaser-example',
	scale: {
		// mode: Phaser.Scale.FIT,
		// autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	scene: [Title, Game],
	physics: {
		default: 'arcade',
		arcade: {
			// y: 30,
			debug: false,
		},
	},
	render: {
		antialias: false,
	},
};

const isolation = new Phaser.Game(config);

class End extends Phaser.Scene {
	constructor() {
		super('end');
	}

	init(data) {
		this.characterStats = data.character;
		this.timeInfo = data.timeInfo;
	}

	preload() {
		this.load.audio('menu_press', [
			'../assets/audio/menu_press.ogg',
			'../assets/audio/menu_press.mp3',
		]);
	}

	create() {
		this.press = this.sound.add('menu_press').setVolume(0.5);

		this.rect = this.add
			.rectangle(
				this.game.config.width / 2,
				this.game.config.height / 2,
				this.game.config.width,
				this.game.config.height,
				'black',
			)
			.setAlpha(0);

		this.theEnd = this.add
			.text(156, 45, 'The End', {
				font: '32px',
			})
			.setAlpha(0);

		const marginX = 25;

		this.realTime = this.add
			.text(marginX, 120, 'Real time:', {
				font: '16px',
			})
			.setAlpha(0);

		this.playerTime = this.add
			.text(marginX, 150, 'Time felt:', {
				font: '16px',
			})
			.setAlpha(0);

		this.realTimeInfo = this.add
			.text(marginX + 195, 120, 'Day 3, 03:00PM (15:00)', {
				font: '16px',
			})
			.setAlpha(0);

		this.playerTimeInfo = this.add
			.text(
				marginX + 195,
				150,
				`Day ${this.characterStats.day}, ${
					this.timeInfo.hour % 12 < 10 ? '0' : ''
				}${this.timeInfo.hour % 12}:${
					this.timeInfo.minute < 10 ? '0' : ''
				}${this.timeInfo.minute}${
					this.timeInfo.hour > 12 ? 'PM' : 'AM'
				} (${this.timeInfo.hour < 10 ? '0' : ''}${
					this.timeInfo.hour
				}:${this.timeInfo.minute < 10 ? '0' : ''}${
					this.timeInfo.minute
				})`,
				{
					font: '16px',
				},
			)
			.setAlpha(0);

		this.stepsNumber = this.add
			.text(marginX, 180, 'Steps:', {
				font: '16px',
			})
			.setAlpha(0);

		this.stepsNumberInfo = this.add
			.text(
				marginX +
					396 -
					(String(this.characterStats.steps).length - 1) * 10,
				180,
				`${this.characterStats.steps}`,
				{
					font: '16px',
				},
			)
			.setAlpha(0);

		this.moral = this.add
			.text(marginX, 210, 'Moral (ideal: 0.75):', {
				font: '16px',
			})
			.setAlpha(0);

		this.moralValue = this.add
			.text(
				marginX +
					396 -
					(String(this.characterStats.moral).length - 1) * 10,
				210,
				`${this.characterStats.moral}`,
				{
					font: '16px',
				},
			)
			.setAlpha(0);

		this.faucet = this.add
			.text(marginX, 240, 'Tap opened:', {
				font: '16px',
			})
			.setAlpha(0);

		this.faucetOpened = this.add
			.text(
				marginX +
					396 -
					(String(this.characterStats.tap).length - 1) * 10,
				240,
				`${this.characterStats.tap}`,
				{
					font: '16px',
				},
			)
			.setAlpha(0);

		this.credits = this.add
			.text(
				marginX,
				300,
				'Thanks for playing !' +
					'\n\nI hope you enjoyed your time and found the \nexperience interesting.' +
					'\n\nI would recommended that you play again to \ntry to prevent your character from losing \ntrack of time ! \n\nPress space to quit.',
				{
					font: '16px',
				},
			)
			.setAlpha(0);

		const creditsTween = {
			targets: [this.credits],
			alpha: { value: 0.8, duration: 1000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {},
		};

		const tapTween = {
			targets: [this.faucet, this.faucetOpened],
			alpha: { value: 0.8, duration: 1000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {
				this.tweens.add(creditsTween);
				this.input.keyboard.once('keydown-' + 'SPACE', () => {
					localStorage.setItem(
						'isolation_saved_game_data',
						JSON.stringify(this.characterStats),
					);
					console.log('saved');
					this.scene.stop('game');
					this.scene.stop();
					this.sound.stopAll();
					this.press.play();
					this.scene.start('title');
				});
			},
		};

		const moralTween = {
			targets: [this.moral, this.moralValue],
			alpha: { value: 0.8, duration: 1000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {
				this.tweens.add(tapTween);
			},
		};

		const stepsNumberTween = {
			targets: [this.stepsNumber, this.stepsNumberInfo],
			alpha: { value: 0.8, duration: 1000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {
				this.tweens.add(moralTween);
			},
		};

		const playerTimeTween = {
			targets: [this.playerTime, this.playerTimeInfo],
			alpha: { value: 0.8, duration: 1000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {
				this.tweens.add(stepsNumberTween);
			},
		};

		const realTimeTween = {
			targets: [this.realTime, this.realTimeInfo],
			alpha: { value: 0.8, duration: 1000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {
				this.tweens.add(playerTimeTween);
			},
		};

		this.tweens.add({
			targets: [this.rect, this.theEnd],
			alpha: { value: 0.8, duration: 4000, ease: 'Power1' },
			delay: 100,
			onComplete: () => {
				//this.arrow.setAlpha(1);
				this.tweens.add(realTimeTween);
			},
		});
	}

	update() {}
}

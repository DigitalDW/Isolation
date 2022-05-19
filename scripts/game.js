class Game extends Phaser.Scene {
  constructor() {
    super('game'); // la clef d'accès à la scène

    // Game duration
    this.duration = 72 * 60; // [x] mintues * 60

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
    };

    // Time variables
    this.seconds = 0;
    this.minute = 0;
    this.hour = 15; // starting hour
    this.day = 1;

    // Character stats
    this.characterStats = {
      meal: 2, // 0 = has to eat breakfast, 1 = has to eat lunch, 2 = has to eat diner, 3+ = ate diner - ("+" - more meals)
      inBed: false,
      day: 1,
      toilet: 2, // number of times the character was sat on the toilet. Between 2 and 3 is ideal.
      onToilet: false,
      openSink: false,
      steps: 0,
      moral: 1,
      tap: 0,
    };

    this.elapsedTime;
    this.relativeTime;
    this.relativeTimeDelay = 1000;

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

  init(data) {
    if (Object.keys(data).length > 0) {
      this.characterStats = data.character;
      this.seconds = data.timeInfo.seconds;
      this.minute = data.timeInfo.minute;
      this.hour = data.timeInfo.hour;
      this.day = data.timeInfo.day;
      this.relativeTimeDelay = data.timeInfo.delay;
    }
  }

  preload() {
    // Images and sprites
    this.load.image('background', '../assets/background.png');
    this.load.image('bed', '../assets/bed.png');
    this.load.image('cabinet', '../assets/food_cabinet.png');
    this.load.spritesheet('sink', '../assets/sink.png', {
      frameWidth: 130,
      frameHeight: 150,
    });
    this.load.image('toilet', '../assets/toilet.png');
    this.load.spritesheet('character', '../assets/character_sprite.png', {
      frameWidth: 95,
      frameHeight: 171,
    });

    // Sounds
    this.load.audio('footsteps', [
      '../assets/audio/footstep.ogg',
      '../assets/audio/footstep.mp3',
    ]);
    this.load.audio('game_1', ['../assets/audio/game_1.mp3']);
    this.load.audio('game_2', ['../assets/audio/game_2.mp3']);
    this.load.audio('water_faucet', [
      '../assets/audio/sink.ogg',
      '../assets/audio/sink.mp3',
    ]);
    this.load.audio('bottle_cap', [
      '../assets/audio/bottle_cap.ogg',
      '../assets/audio/bottle_cap.mp3',
    ]);
    this.load.audio('gulps', [
      '../assets/audio/gulps.ogg',
      '../assets/audio/gulps.mp3',
    ]);
    this.load.audio('growls', [
      '../assets/audio/growls.ogg',
      '../assets/audio/growls.mp3',
    ]);
    this.load.audio('yawns', [
      '../assets/audio/yawns.ogg',
      '../assets/audio/yawns.mp3',
    ]);
    this.load.audio('door', [
      '../assets/audio/door.ogg',
      '../assets/audio/door.mp3',
    ]);
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

    //########//
    // Sounds //
    //########//
    // Footsteps
    this.footsteps = this.sound.add('footsteps');
    this.addMarkers(this.footsteps, 'step', [0, 0.75, 1.5, 2.25, 3], 0.33, {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0,
    });

    // Sink
    const sinkConfig = {
      mute: false,
      volume: 0.1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0,
    };
    this.sinkSound = this.sound.add('water_faucet');
    this.addMarkers(
      this.sinkSound,
      ['start', 'flow', 'end'],
      [0, 1.145, 18.255],
      [1.145, 17.11, 1.181],
      [
        sinkConfig,
        {
          mute: false,
          volume: 0.1,
          rate: 1,
          detune: 0,
          seek: 0,
          loop: true,
          delay: 0,
        },
        sinkConfig,
      ]
    );

    // Gulps
    this.gulps = this.sound.add('gulps');
    this.addMarkers(this.gulps, 'gulp', [0.299, 1.487, 2.895], 0.25, {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0,
    });

    // Bottle cap
    const capConfig = {
      mute: false,
      volume: 0.5,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0,
    };
    this.bottleCap = this.sound.add('bottle_cap', capConfig);

    // Growls
    this.growls = this.sound.add('growls');
    this.addMarkers(
      this.growls,
      'growl',
      [0.063, 1.897, 3.193, 4.602, 5.717, 6.662],
      [1.792, 0.874, 1.197, 0.967, 0.815, 1.18],
      {
        mute: false,
        volume: 0.5,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: false,
        delay: 0,
      }
    );

    // Yawns
    this.yawns = this.sound.add('yawns');
    this.addMarkers(
      this.yawns,
      'yawn',
      [1.794, 5.5, 9.125, 12.672, 15.95],
      [1.607, 1.369, 1.794, 1.526, 1.05],
      {
        mute: false,
        volume: 0.5,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: false,
        delay: 0,
      }
    );

    this.door = this.sound.add('door').setVolume(0.33);

    //#######//
    // Music //
    //#######//

    this.music_1 = this.sound.add('game_1');
    this.music_2 = this.sound.add('game_2');

    this.music_1.setVolume(0.3);
    this.music_2.setVolume(0.3);

    this.music_1.on('complete', () => this.music_2.play());
    this.music_2.on('complete', () => this.music_1.play());

    const options = this.scene.get('options');
    options.events.on('volume_change', (value) => {
      this.music_1.setVolume(value);
      this.music_2.setVolume(value);
    });

    // Music on startup
    if (!this.music_1.isPlaying && !this.music_2.isPlaying) {
      this.music_1.play();
    }

    //############//
    // Animations //
    //############//
    this.createAnim('idle', 6, 'character', 0, 5, 0);
    this.createAnim('walk', 12, 'character', 6, 13, 0);
    this.createAnim('drink', 6, 'character', 14, 54, 0);
    this.createAnim('sleep', 5, 'character', 55, 62, -1);
    this.createAnim('toilet', 5, 'character', 63, 68, 0);
    this.createAnim('open_faucet', 24, 'sink', 1, 9, 0);
    this.createAnim('flowing', 16, 'sink', 10, 13, -1);

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
    this.keys.interact.on('down', this.interact, this);

    this.input.keyboard.on('keydown-' + 'ESC', () => {
      this.scene.pause();
      this.scene.launch('pause', {
        volume: this.music_1.volume,
        characterStats: this.characterStats,
        timeInfo: {
          seconds: this.seconds,
          minute: this.minute,
          hour: this.hour,
          day: this.day,
          delay: this.relativeTimeDelay,
        },
      });
    });

    //############//
    // Add images //
    //############//
    this.add.image(300, 350, 'background');
    this.bed = this.physics.add.image(384, 225, 'bed');
    this.bed.body.immovable = true;

    this.foodCabinet = this.physics.add.image(65, 425, 'cabinet');
    this.foodCabinet.body.immovable = true;

    this.sink = this.physics.add.sprite(65, 275, 'sink');
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

    [this.bed, this.foodCabinet, this.sink, this.toilet].forEach((elem) => {
      const rect = this.add.rectangle(
        elem.x,
        elem.y,
        elem.width + 25,
        elem.height
      );
      rect.name = elem.texture.key;

      this.rects.push(rect);
      this.physics.add.existing(rect);
    });

    //############//
    // Collitions //
    //############//
    this.bedCollision = this.physics.add.collider(this.character, this.bed);
    this.physics.add.collider(this.character, this.foodCabinet);
    this.physics.add.collider(this.character, this.sink);
    this.physics.add.collider(this.character, this.toilet);

    // Add info rect
    this.createInfoRect();
  }

  addMarkers(sound, name, starts, duration, config) {
    starts.forEach((start, i) => {
      sound.addMarker({
        name: typeof name == 'string' ? `${name}_${i + 1}` : name[i],
        start: start,
        duration: typeof duration == 'number' ? duration : duration[i],
        config: typeof config.length != 'number' ? config : config[i],
      });
    });
  }

  createAnim(name, frameRate, sprite, start, end, repeat) {
    this.anims.create({
      key: name,
      frameRate: frameRate,
      frames: this.anims.generateFrameNumbers(sprite, {
        start: start,
        end: end,
      }),
      repeat: repeat,
    });
  }

  detection(_, t) {
    this.detected = t.name;
  }

  createInfoRect() {
    this.rect = this.add
      .rectangle(
        this.game.config.width / 2,
        400,
        this.game.config.width,
        this.game.config.height / 5,
        'black'
      )
      .setAlpha(0);

    this.infoText = this.add
      .text(
        this.game.config.width / 4,
        360,
        `     Day ${this.day}\n\n${this.hour % 12 < 10 ? '0' : ''}${
          this.hour % 12
        }:${this.minute < 10 ? '0' : ''}${this.minute}${
          this.hour > 12 ? 'PM' : 'AM'
        } (${this.hour < 10 ? '0' : ''}${this.hour}:${
          this.minute < 10 ? '0' : ''
        }${this.minute})`,
        {
          font: '26px',
        }
      )
      .setAlpha(0);

    this.events.on('oneRelativeMinute', () => {
      this.infoText.text = `     Day ${this.day}\n\n${
        this.hour % 12 < 10 ? '0' : ''
      }${this.hour % 12}:${this.minute < 10 ? '0' : ''}${this.minute}${
        this.hour > 12 ? 'PM' : 'AM'
      } (${this.hour < 10 ? '0' : ''}${this.hour}:${
        this.minute < 10 ? '0' : ''
      }${this.minute})`;
    });

    this.tweens.add({
      targets: [this.rect, this.infoText],
      alpha: { value: 0.8, duration: 2000, ease: 'power1' },
      delay: 0,
      onComplete: () => {
        this.tweens.add({
          targets: [this.rect, this.infoText],
          alpha: { value: 0, duration: 2000, ease: 'power1' },
          delay: 6000,
        });
      },
    });
  }

  playAnim() {
    this.character.play('walk', true);
    if (
      (this.character.anims.currentFrame.textureFrame == 8 ||
        this.character.anims.currentFrame.textureFrame == 12) &&
      !this.footsteps.isPlaying
    ) {
      this.footsteps.play(`step_${Math.ceil(Math.random() * 5)}`);
      this.characterStats.steps++;
    }
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
    this.events.emit('oneRelativeMinute');
    this.characterStats.moral -= 1 / (this.duration * 4);
    console.log(
      `day ${this.day} : ${this.hour}:${this.minute} || ${this.seconds}`
    );
  }

  interact(_, event) {
    // Detection of objects
    let over = false;
    this.rects.forEach((r) => {
      const t = this.physics.overlap(
        this.charCircle,
        r,
        this.detection,
        null,
        this
      );
      over ||= t;
    });
    if (!over) {
      this.detected = null;
    }

    if (
      (!this.keys.enabled && !this.characterStats.inBed) ||
      this.detected == null
    ) {
      return;
    }

    this.keys.enabled = false;
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
      const meal = this.characterStats.meal;
      timing = this.characterStats.inBed ? 0 : this.timings.goToSleep;
      if (!(meal > 2) && !this.characterStats.inBed) {
        console.log('go to bed');
        this.characterAction(timing, 'goToSleep');
      } else if (this.characterStats.inBed) {
        this.characterAction(timing, 'wakeUp');
      }

      this.characterStats.inBed = !this.characterStats.inBed;
    } else if (this.detected == 'toilet') {
      this.characterStats.toilet++;
      this.character.flipX = false;
      this.character.x = 105;
      this.character.y = 122;
      this.character.play('toilet');
      this.characterAction(0, 'toilet');
    } else if (this.detected == 'sink') {
      this.keys.enabled = true;
      if (!this.characterStats.openSink) {
        this.sink.play('open_faucet');
        this.sinkSound.play('start');
        this.characterStats.tap++;
      } else {
        this.sink.anims.stop();
        this.sink.setFrame(0);
      }
      this.characterAction(0, 'sink');
    }
  }

  characterAction(timing, action) {
    let deviation = 0;
    let day = this.characterStats.day;

    if (action == 'eat') {
      this.character.once(
        'animationcomplete-drink',
        function () {
          this.keys.enabled = true;
          this.character.x += 25;
        },
        this
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
      if (this.characterStats.day != this.day) {
        this.day = this.characterStats.day;
      }
      this.hour = 7;
      this.minute = Math.floor(Math.random() * 60);
      this.characterStats.meal = 0;
      this.createInfoRect();
    } else if (action == 'toilet') {
      this.character.once(
        'animationcomplete-toilet',
        function () {
          const rdm = Math.ceil(Math.random() * 10);
          if (rdm > 3) {
            this.character.play('toilet');
            this.characterAction(0, 'toilet');
          } else {
            this.keys.enabled = true;
            this.character.x += 75;
          }
        },
        this
      );
      return;
    } else if (action == 'sink') {
      this.sink.once(
        'animationcomplete-open_faucet',
        function () {
          this.sink.play('flowing');
        },
        this
      );
      if (!this.characterStats.openSink) {
        this.sinkSound.once(
          'complete',
          () => this.sinkSound.play('flow'),
          this
        );
      } else {
        this.sinkSound.play('end');
        this.sinkSound.once('complete', () => this.sinkSound.stop(), this);
      }

      this.characterStats.openSink = !this.characterStats.openSink;
    }

    deviation = deviation / 75; // attenuer les effets du décalage
    deviation = 0;
    this.relativeTimeDelay += deviation;
    this.relativeTime.delay = this.relativeTimeDelay;
    console.log(this.relativeTimeDelay);
  }

  eatDeviation(timing) {
    let dev = 0;
    if (this.hour < timing.start || this.hour >= timing.end) {
      this.hour = timing.start;
      this.minute = Math.floor(Math.random() * 60);
    }
    if (this.hour < timing.start) {
      dev -= this.timeDeviation(timing, 'early') * 15;
    } else if (this.hour >= timing.end) {
      dev += this.timeDeviation(timing, 'late') * 15;
    }
    return dev;
  }

  sleepDeviation(timing, day) {
    let dev = 0;
    let mealsVariation = 0;
    console.log(timing);
    if (!this.forceWakeUp) {
      mealsVariation = this.characterStats.meal - 3; // negatif = pas assez de repas, positif = trop de repas, 0 = assez de repas
    }
    dev += mealsVariation * (mealsVariation < 0 ? 1250 : 75);

    const toilet = this.characterStats.toilet;
    dev += toilet == 2 || toilet == 3 ? 0 : Math.round(toilet - 2.5) * 10;

    if (this.hour < timing.start && this.day == day) {
      dev -= this.timeDeviation(timing, 'early') * 25;
    } else if (this.hour >= timing.end && this.day > day) {
      dev += this.timeDeviation(timing, 'late') * 25;
    }

    if (
      (this.hour < timing.start && this.day == day) ||
      (this.hour >= timing.end && this.day > day)
    ) {
      this.hour = Math.floor(Math.random() * 2) + 22;
      this.minute = Math.floor(Math.random() * 60);
    }

    return dev;
  }

  timeDeviation(timing, state) {
    let h = 0;
    let m = 0;
    if (state == 'early') {
      h = timing.start - 1 - this.hour;
      m = 60 - this.minute + h * 60;
    } else if (state == 'late') {
      h = this.hour - timing.end;
      m = this.minute + h * 60;
    } else {
      h = 23 - this.hour + timing.start;
      m = 60 - this.minute + h * 60;
    }
    return m;
  }

  characterDrink() {
    const frame = this.character.anims.currentFrame.textureFrame;
    if (frame == 21 && !this.bottleCap.isPlaying) {
      this.bottleCap.play();
    } else if (
      (frame == 40 || frame == 44 || frame == 48) &&
      !this.gulps.isPlaying
    ) {
      this.gulps.play(`gulp_${Math.ceil(Math.random() * 3)}`);
    }
  }

  sounds() {
    //########//
    // Hunger //
    //########//
    if (
      (this.hour == 7 || this.hour == 12 || this.hour == 18) &&
      this.minute % 5 == 0 &&
      this.minute != 30 &&
      !this.characterStats.inBed &&
      !this.growlPlaying // custom isPlaying variable for growls to prevent update function from firing twice on shorter growls
    ) {
      if (
        (this.hour == 7 && this.characterStats.meal == 1) ||
        (this.hour == 12 && this.characterStats.meal == 2) ||
        (this.hour == 18 && this.characterStats.meal >= 3)
      ) {
        return;
      } else {
        const chance = Math.ceil(Math.random() * 300);
        if (chance == 150) {
          this.playGrowl();
        }
      }
    } else if (
      (this.hour == 7 || this.hour == 12 || this.hour == 18) &&
      this.minute % 5 == 0 &&
      this.minute == 30 &&
      !this.characterStats.inBed &&
      !this.growlPlaying
    ) {
      if (
        (this.hour == 7 && this.characterStats.meal == 1) ||
        (this.hour == 12 && this.characterStats.meal == 2) ||
        (this.hour == 18 && this.characterStats.meal >= 3)
      ) {
        return;
      } else {
        this.playGrowl();
      }
    }

    //#######//
    // Tired //
    //#######//
    if (
      (this.hour == 22 || this.hour == 23) &&
      this.minute % 10 == 0 &&
      this.minute != 0 &&
      !this.characterStats.inBed &&
      !this.yawns.isPlaying
    ) {
      const chance = Math.ceil(Math.random() * 300);
      if (chance == 150) {
        this.playYawn();
      }
    } else if (
      this.hour == 23 &&
      this.minute == 0 &&
      !this.characterStats.inBed &&
      !this.yawns.isPlaying
    ) {
      this.playYawn();
    }
  }

  playGrowl() {
    this.growls.play(`growl_${Math.ceil(Math.random() * 6)}`);
    this.growlPlaying = true;
    setTimeout(() => (this.growlPlaying = false), 2000);
  }

  playYawn() {
    this.yawns.play(`yawn_${Math.ceil(Math.random() * 5)}`);
    if (
      this.character.anims.isPlaying &&
      this.character.anims.currentAnim.key != 'drink'
    ) {
      this.character.anims.stop();
      this.character.setFrame(0);
      this.keys.enabled = false;
      this.yawns.once(
        'complete',
        function () {
          this.keys.enabled = true;
        },
        this
      );
    }
  }

  resetClock() {}

  update(time) {
    this.character.body.setVelocity(0);

    if (this.character.y <= this.bed.height + 24) {
      this.bedCollision.active = true;
    } else {
      this.bedCollision.active = false;
    }

    if (this.seconds / 60 >= this.duration / 60) {
      this.keys.enabled = false;
      this.elapsedTime.paused = true;
      this.relativeTime.paused = true;

      this.scene.pause();
      this.scene.launch('end', {
        character: this.characterStats,
        timeInfo: {
          seconds: this.seconds,
          minute: this.minute,
          hour: this.hour,
          day: this.day,
          delay: this.relativeTimeDelay,
        },
      });

      const currentAnim = this.character.anims.currentAnim.key;
      if (currentAnim != 'idle' && currentAnim != 'walk') {
        this.character.stop();
        if (currentAnim == 'sleep') {
          this.character.x = this.coords[0];
          this.character.y = this.coords[1];
        } else if (currentAnim == 'toilet') {
          this.character.x += 75;
        } else if (currentAnim == 'drink') {
          this.character.x += 25;
          if (this.bottleCap.isPlaying) this.bottleCap.stop();
          if (this.gulps.isPlaying) this.gulps.stop();
        }
      }

      if (!this.music_1.isPlaying || !this.music_2.isPlaying) {
        this.music_1.stop();
        this.music_2.stop();
      }

      if (!this.door.isPlaying) this.playAnim();

      // x=225, y=250
      if (this.character.x < 220) {
        this.character.body.setVelocityX(100);
        this.character.flipX = false;
      } else if (this.character.x > 230) {
        this.character.body.setVelocityX(-100);
        this.character.flipX = true;
      }
      if (this.character.x >= 220 && this.character.x <= 230) {
        if (this.character.y == 414.5 && !this.continue) {
          this.character.stop();
          this.character.setFrame(0);
          if (!this.door.isPlaying) {
            this.door.play();
            this.door.once('complete', () => {
              this.character.body.setCollideWorldBounds(false);
              this.continue = true;
            });
          }
        } else {
          this.character.body.setVelocityY(100);
        }
      }
      if (
        this.character.y >=
        this.game.config.height + this.character.height / 2
      ) {
        this.rect.destroy();
        this.infoText.destroy();
        this.scene.pause();
        this.scene.launch('end', {
          character: this.characterStats,
          timeInfo: {
            seconds: this.seconds,
            minute: this.minute,
            hour: this.hour,
            day: this.day,
            delay: this.relativeTimeDelay,
          },
        });
      }
    }

    if (this.character.anims.currentAnim.key == 'drink') {
      this.characterDrink();
    }

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
          this.character.x > 273.5 && this.character.y < this.bed.height + 40
            ? 0
            : -200
        );
      } else if (this.keys.down.isDown) {
        this.playAnim();
        this.character.body.setVelocityY(200);
      } else {
        this.character.anims.play('idle', true);
      }
    }

    this.sounds();
  }

  reset() {}
}

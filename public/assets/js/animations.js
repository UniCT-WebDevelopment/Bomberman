const playerAnimation = () => {
    let scene = game.scene.scenes[0];

    for(let color of game_colors) {
        scene.anims.create({
            key: color+'-left',
            frames: scene.anims.generateFrameNumbers(color+'-bm', { start: 3, end: 5 }),
            frameRate: 5,
            repeat: -1
        });
    
        scene.anims.create({
            key: color+'-right',
            frames: scene.anims.generateFrameNumbers(color+'-bm', { start: 9, end: 11 }),
            frameRate: 5,
            repeat: -1
        });
    
        scene.anims.create({
            key: color+'-up',
            frames: scene.anims.generateFrameNumbers(color+'-bm', { start: 0, end: 2 }),
            frameRate: 5,
            repeat: -1
        });
    
        scene.anims.create({
            key: color+'-down',
            frames: scene.anims.generateFrameNumbers(color+'-bm', { start: 6, end: 8 }),
            frameRate: 5,
            repeat: -1
        });
    
        scene.anims.create({
            key: color+'-death',
            frames: scene.anims.generateFrameNumbers(color+'-bm', { start: 12, end: 17 }),
            frameRate: 5,
            repeat: 0
        });
    }
};


const flamesAnimation = () => {
    let scene = game.scene.scenes[0];

    scene.anims.create({
        key: 'bomb-exploding-center',
        frames: scene.anims.generateFrameNumbers('bomb-flame', { frames: [5, 6, 7, 8, 9, 8, 7, 6, 5] }),
        frameRate: 18,
        repeat: 0
    });

    scene.anims.create({
        key: 'bomb-exploding-ud-body',
        frames: scene.anims.generateFrameNumbers('bomb-flame', { frames: [10, 11, 12, 13, 14, 13, 12, 11, 10] }),
        frameRate: 18,
        repeat: 0
    });

    scene.anims.create({
        key: 'bomb-exploding-lr-body',
        frames: scene.anims.generateFrameNumbers('bomb-flame', { frames: [15, 16, 17, 18, 19, 18, 17, 16, 15] }),
        frameRate: 18,
        repeat: 0
    });

    scene.anims.create({
        key: 'bomb-exploding-up-head',
        frames: scene.anims.generateFrameNumbers('bomb-flame', { frames: [20, 21, 22, 23, 24, 23, 22, 21, 20] }),
        frameRate: 18,
        repeat: 0
    });

    scene.anims.create({
        key: 'bomb-exploding-down-head',
        frames: scene.anims.generateFrameNumbers('bomb-flame', { frames: [25, 26, 27, 28, 29, 28, 27, 26, 25] }),
        frameRate: 18,
        repeat: 0
    });

    scene.anims.create({
        key: 'bomb-exploding-right-head',
        frames: scene.anims.generateFrameNumbers('bomb-flame', { frames: [30, 31, 32, 33, 34, 33, 32, 31, 30] }),
        frameRate: 18,
        repeat: 0
    });

    scene.anims.create({
        key: 'bomb-exploding-left-head',
        frames: scene.anims.generateFrameNumbers('bomb-flame', { frames: [35, 36, 37, 38, 39, 38, 37, 36, 35] }),
        frameRate: 18,
        repeat: 0
    });
    
    for(let color of game_colors) {
        scene.anims.create({
            key: color+'-bomb-exploding-center',
            frames: scene.anims.generateFrameNumbers(color+'-flame', { frames: [5, 6, 7, 8, 9, 8, 7, 6, 5] }),
            frameRate: 18,
            repeat: 0
        });
    
        scene.anims.create({
            key: color+'-bomb-exploding-ud-body',
            frames: scene.anims.generateFrameNumbers(color+'-flame', { frames: [10, 11, 12, 13, 14, 13, 12, 11, 10] }),
            frameRate: 18,
            repeat: 0
        });
    
        scene.anims.create({
            key: color+'-bomb-exploding-lr-body',
            frames: scene.anims.generateFrameNumbers(color+'-flame', { frames: [15, 16, 17, 18, 19, 18, 17, 16, 15] }),
            frameRate: 18,
            repeat: 0
        });
    
        scene.anims.create({
            key: color+'-bomb-exploding-up-head',
            frames: scene.anims.generateFrameNumbers(color+'-flame', { frames: [20, 21, 22, 23, 24, 23, 22, 21, 20] }),
            frameRate: 18,
            repeat: 0
        });
    
        scene.anims.create({
            key: color+'-bomb-exploding-down-head',
            frames: scene.anims.generateFrameNumbers(color+'-flame', { frames: [25, 26, 27, 28, 29, 28, 27, 26, 25] }),
            frameRate: 18,
            repeat: 0
        });
    
        scene.anims.create({
            key: color+'-bomb-exploding-right-head',
            frames: scene.anims.generateFrameNumbers(color+'-flame', { frames: [30, 31, 32, 33, 34, 33, 32, 31, 30] }),
            frameRate: 18,
            repeat: 0
        });
    
        scene.anims.create({
            key: color+'-bomb-exploding-left-head',
            frames: scene.anims.generateFrameNumbers(color+'-flame', { frames: [35, 36, 37, 38, 39, 38, 37, 36, 35] }),
            frameRate: 18,
            repeat: 0
        });
    }
};


const bombsAnimations = () => {
    let scene = game.scene.scenes[0];
    
    for(let color of game_colors) {
        scene.anims.create({
            key: color+'-bomb-ticking',
            frames: scene.anims.generateFrameNumbers(color+'-bomb', { start: 0, end: 3 }),
            frameRate: 3,
            repeat: 1
        });

        scene.anims.create({
            key: color+'-wall-destroyed',
            frames: scene.anims.generateFrameNumbers(color+'-wall-destroyed', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: 0
        });

        scene.anims.create({
            key: color+'-item-destroyed',
            frames: scene.anims.generateFrameNumbers(color+'-flame', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: 0
        });
    }
};
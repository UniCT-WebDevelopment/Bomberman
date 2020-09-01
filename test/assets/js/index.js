var config = {
    type: Phaser.AUTO,
    width: 240,
    height: 208,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: "#2E8B57",
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        },
    },
    pixelArt: true,
};

var game = new Phaser.Game(config);
var map, tileset, layer, scene, notWall;
var player;
var bombs, flipFlopBomb, flipMovement;
var cursors, animated; //animated is used to show the right animation with the player sprite
var walls, items;
var speed, velocity;
const items_list = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 3, 3, 9, 9, 9, 9, 9, 23, 23, 23];

function preload() {
    //1 hard wall, 2 normal wall, 3 grass, 4 shadowed grass,
    this.load.image("tiles-stage-1", "assets/tiles/snes_stage_1.png");
    this.load.tilemapCSV('map', 'assets/tilemaps/stage_1.csv');


    this.load.spritesheet('white-bm',
        'assets/sprites/snes_white.png',
        { frameWidth: 17, frameHeight: 26 }
    );

    this.load.spritesheet('white-bomb',
        'assets/sprites/snes_bombs_white.png',
        { frameWidth: 16, frameHeight: 16 }
    );

    this.load.spritesheet('bomb-flame',
        'assets/sprites/bomb_flames.png',
        { frameWidth: 16, frameHeight: 16 }
    );

    this.load.spritesheet('walls',
        'assets/tiles/snes_stage_1.png',
        { frameWidth: 16, frameHeight: 16 }
    );

    this.load.spritesheet('wall-destroyed',
        'assets/sprites/wall_destroyed.png',
        { frameWidth: 16, frameHeight: 16 }
    );

    this.load.spritesheet('items',
        'assets/sprites/snes_items.png',
        { frameWidth: 16, frameHeight: 16 }
    );

    this.load.audio("music", "assets/audio/snes_battle_music.mp3");

    this.bombsGroup = this.physics.add.group({
        allowGravity: false
    });
    this.flamesGroup = this.physics.add.group({
        allowGravity: false
    });
    this.wallsGroup = this.physics.add.group({
        allowGravity: false
    });
    this.itemsGroup = this.physics.add.group({
        allowGravity: false
    });
    scene = this;
}

function create() {

    // MAP
    map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
    tileset = map.addTilesetImage('tiles-stage-1');
    layer = map.createStaticLayer(0, tileset, 0, 0);
    layer.setCollisionByExclusion([3, 4]);


    // PLAYER
    player = this.physics.add.sprite(0, 0, 'white-bm', 7);
    player.setSize(14, 14, 0, 0).setOffset(1, 11).setOrigin(0.471, 0.70);
    player.setPosition(24, 24)
    player.setDepth(2000);
    player.setCollideWorldBounds(true);


    // WALLS and ITEMS
    generateWalls();
    generateItems();

    //ANIMATIONS
    playerAnimation();
    flamesAnimation();
    this.anims.create({
        key: 'bomb-ticking',
        frames: this.anims.generateFrameNumbers('white-bomb', { start: 0, end: 3 }),
        frameRate: 3,
        repeat: 1
    });
    this.anims.create({
        key: 'wall-destroyed',
        frames: this.anims.generateFrameNumbers('wall-destroyed', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: 0
    });
    this.anims.create({
        key: 'item-destroyed',
        frames: this.anims.generateFrameNumbers('bomb-flame', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: 0
    });
    this.physics.add.collider(player, layer);

    //AUDIO
    this.backgroundSong = this.sound.add("music");


    //CURSORS
    cursors = this.input.keyboard.createCursorKeys();

    //INITIALIZATIONS VARIABLES
    animated = false;
    bombs = [];
    player.speed = 1;
    player.items_collected = [0, 0];
    player.bombs = 3;
    player.flames = 2;
    player.status = 'alive';
    player.godlike = false;
    flipFlopBomb = false;
    flipMovement = false;

    this.backgroundSong.play();
}

var createVerticalTween = (player_y, dir) => {
    return scene.tweens.add({
        targets: player,
        duration: speed,
        y: parseInt(player_y / 16) * 16 + (dir === 'up' ? - 8 : 24),
        ease: 'Linear',
        repeat: 0,
        onStart: function () {
            player.anims.play(dir, true);
        },
        onComplete: function () {
            player.anims.setCurrentFrame(player.anims.currentAnim.frames[1]);
            player.anims.stop();
            actualTween = undefined;
        },
        delay: 0,
        completeDelay: 0,
        yoyo: false
    });
};

var createHorizontalTween = (player_x, dir) => {
    return scene.tweens.add({
        targets: player,
        duration: speed,
        x: parseInt(player_x / 16) * 16 + (dir === 'left' ? - 8 : 24),
        ease: 'Linear',
        repeat: 0,
        onStart: function () {
            player.anims.play(dir, true);
        },
        onComplete: function () {
            player.anims.setCurrentFrame(player.anims.currentAnim.frames[1]);
            player.anims.stop();
            actualTween = undefined;
        },
        delay: 0,
        completeDelay: 0,
        yoyo: false
    });
};

var actualTween;

function update() {
    keyboardMovements();
};

function getCollisionOnMove(x, y, dir) {

    switch (dir) {
        case 'right':
            x += 16;
            break;
        case 'left':
            x -= 16;
            break;
        case 'down':
            y += 16;
            break;
        case 'up':
            y -= 16;
            break;
    }
    try {
        return map.getTileAtWorldXY(x, y, layer).index === 1 || _.filter(bombs, (el) => getCollisionObject(x, y, el.x, el.y)).length > 0 || _.filter(game.scene.scenes[0].wallsGroup.children.entries, (el) => getCollisionObject(x, y, el.x, el.y)).length > 0;
    }
    catch {
        return true;
    }
};

function getCollisionObject(x1, y1, x2, y2) {
    return (x2 <= x1) && (x1 < x2 + 16) &&
        (y2 <= y1) && (y1 < y2 + 16);
};

function keyboardMovements() {
    if (player.status === 'alive') {
        speed = 300 - player.speed * 20;
        player.anims.msPerFrame = speed / 3;

        if (cursors.right.isDown) {
            if (actualTween === undefined && !getCollisionOnMove(player.x, player.y, 'right')) {
                actualTween = createHorizontalTween(player.x, 'right');
            }
        } else if (cursors.left.isDown) {
            if (actualTween === undefined && !getCollisionOnMove(player.x, player.y, 'left')) {
                actualTween = createHorizontalTween(player.x, 'left');
            }
        } else if (cursors.up.isDown) {
            if (actualTween === undefined && !getCollisionOnMove(player.x, player.y, 'up')) {
                actualTween = createVerticalTween(player.y, 'up');
            }
        } else if (cursors.down.isDown) {
            if (actualTween === undefined && !getCollisionOnMove(player.x, player.y, 'down')) {
                actualTween = createVerticalTween(player.y, 'down');
            }
        }

        if (actualTween === undefined && animated && player.body.velocity.x == 0 && player.body.velocity.y == 0) {
            player.anims.setCurrentFrame(player.anims.currentAnim.frames[1]);
            player.anims.stop();
            animated = false;
        }

        if (!flipFlopBomb && player.bombs > bombs.length && cursors.space.isDown) {
            place_bomb(player.x, player.y);
            flipFlopBomb = true;
        }

        if (flipFlopBomb && cursors.space.isUp) {
            flipFlopBomb = false;
        }

        if (!player.godlike && scene.physics.collide(player, scene.flamesGroup)) {
            death(player);
        }
    }
}

const death = (player) => {
    player.status = "dead";
    player.anims.play('death', true);
    player.once("animationcomplete", () => {
        setTimeout(() => {
            items_collected = player.items_collected;
            player.destroy();
            replaceItems(items_collected);
        }, 1000);
    });
};

const replaceItems = (items_collected) => {
    let i = 0;
    while (i < items_collected.length && notWall.length > 0) {
        index = Math.floor(Math.random() * notWall.length);
        x = parseInt(notWall[index].split(',')[0]);
        y = parseInt(notWall[index].split(',')[1]);
        createNewItem(items_collected[i], x * 16, y * 16);
        notWall.splice(index, 1);
        i++;
    }
}

const generateWalls = () => {
    const players_start = [
        "1,1",
        "1,2",
        "2,1",
        "13,1",
        "12,1",
        "13,2",
        "1,11",
        "1,10",
        "2,11",
        "13,11",
        "13,10",
        "12,11",
    ];

    notWall = players_start;
    walls = [];
    for (let i = 1; i < 14; i++) {
        for (let j = 1; j < 12; j++) {
            console.log()
            if (players_start.indexOf(i + "," + j) === -1 && map.getTileAtWorldXY(i * 16, j * 16, layer).index !== 1) {
                if (Math.random() < 0.85) {
                    let wall = scene.wallsGroup.create(i * 16, j * 16, 'walls', 2).setOrigin(0, 0);
                    wall.setImmovable();
                    wall.setDepth(1001);
                    scene.physics.add.collider(player, wall);
                    walls.push(wall);
                } else {
                    notWall.push(i + "," + j);
                }
            }
        }
    }
}

const destroyWall = (wall) => {
    wall.anims.play("wall-destroyed", true);
    wall.once("animationcomplete", () => {
        if (notWall.indexOf(Math.floor(wall.x / 16) + ',' + Math.floor(wall.y / 16)) < 0 && _.filter(scene.itemsGroup.children.entries, (item) => item.x == wall.x && item.y == wall.y).length == 0)
            notWall.push(Math.floor(wall.x / 16) + ',' + Math.floor(wall.y / 16));
        wall.destroy();
    });
}

const generateItems = () => {
    items = [];
    for (let wall of walls) {
        if (Math.random() < 0.25) {
            createNewItem(items_list[Math.floor(Math.random() * items_list.length)], wall.x, wall.y);
        }
    }

}

const createNewItem = (item_index, item_x, item_y) => {
    item = scene.itemsGroup.create(item_x, item_y, 'items', item_index).setOrigin(0, 0);
    item.setImmovable();
    item.index = item_index;
    item.player_collider = scene.physics.add.overlap(item, player, (item) => {
        player.items_collected.push(item.index);
        if (item.index == 0 && player.bombs < 10) {
            player.bombs++
        } else if (item.index == 1 && player.bombs < 13) {
            player.flames++;
        } else if (item.index == 3) {
            player.flames = 13;
        } else if (item.index == 9 && player.speed < 6) {
            player.speed++;
        } else if (item.index == 23 & player.speed > 0) {
            player.speed--;
        }
        if (notWall.indexOf(Math.floor(item.x / 16) + ',' + Math.floor(item.y / 16)) < 0)
            notWall.push(Math.floor(item.x / 16) + ',' + Math.floor(item.y / 16));
        item.destroy();
    });
}

const destroyItem = (item) => {
    item.anims.play('item-destroyed', true);
    item.once('animationcomplete', () => {
        item.destroy();
    });
}


const place_bomb = (x, y) => {
    var bomb;
    var newX, newY, i, j; //i,j are the coordinates of the 16x16 squares of the stage map
    i = Math.floor(Math.floor(x) / 16);
    j = Math.floor(Math.floor(y) / 16);

    newX = Math.floor(x) - (Math.floor(x) % 16) + 8;
    newY = Math.floor(y) - (Math.floor(y) % 16) + 8;

    if (_.filter(bombs, (b) => Math.floor(b.x / 16) == i && Math.floor(b.y / 16) == j).length == 0) {
        bomb = scene.bombsGroup.create(-128, -128, 'white-bomb').setOrigin(0, 0).disableBody(true, true);
        bomb.x = newX;
        bomb.y = newY;
        //bomb.setSize(13, 13).setOffset(2, 2);

        bomb.setInteractive();
        bomb.setImmovable();

        setTimeout(() => { //fixed the bug when the bomb is misplaced on top of an undestructable wall
            if (bombOverlapWall(bomb)) { //bomb misplaced
                bomb.x -= 8;
                bomb.y -= 8;
            }
            bomb.enableBody(false, 0, 0, true, true);
            bomb.anims.play('bomb-ticking', true);
        }, 50);

        bomb.once("animationcomplete", () => {
            explosion(bomb, 0);
        });
        scene.physics.add.collider(player, bomb);
        scene.physics.add.collider(scene.flamesGroup, bomb, () => {
            explosion(bomb, -0.5);
        });

        bombs.push(bomb);
        return bomb;
    }
    return bomb;
};

const explosion = (bomb, origin) => {
    bombs.splice(bombs.indexOf(bomb), 1);
    createFlames(bomb.x, bomb.y, origin);
    if (notWall.indexOf(Math.floor(bomb.x / 16) + ',' + Math.floor(bomb.y / 16)) < 0)
        notWall.push(Math.floor(bomb.x / 16) + ',' + Math.floor(bomb.y / 16));
    bomb.destroy();
}

const bombOverlapWall = (bomb) => {
    return map.getTileAtWorldXY(bomb.x + 1, bomb.y + 1, layer).index === 1 ||
        map.getTileAtWorldXY(bomb.x + 1, bomb.y + 15, layer).index === 1 ||
        map.getTileAtWorldXY(bomb.x + 15, bomb.y + 1, layer).index === 1 ||
        map.getTileAtWorldXY(bomb.x + 15, bomb.y + 15, layer).index === 1;
}

const createFlames = (x, y, origin) => {
    u = d = l = r = true;

    flames = [];

    flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 5).setOrigin(origin, origin));
    flames[flames.length - 1].animation = "bomb-exploding-center";

    for (let i = 0; i < player.flames; i++) {
        if (u)
            u = addFlameUp(flames, x, y, i, player.flames, origin);
        if (d)
            d = addFlameDown(flames, x, y, i, player.flames, origin);
        if (l)
            l = addFlameLR(flames, x, y, i, player.flames, origin, true);
        if (r)
            r = addFlameLR(flames, x, y, i, player.flames, origin, false);
    }

    _.each(flames, (f) => {
        f.setImmovable();
        f.anims.play(f.animation, 'play');
        f.once("animationcomplete", () => {
            f.destroy();
        });
    });
}

const addFlameUp = (flames, x, y, i, length, origin) => {
    if (map.getTileAtWorldXY(x, y - 16 * (i + 1), layer).index !== 1) {
        y = y - 16 * (i + 1);
        if (checkAndDestroyObjects(x, y)) {
            return false;
        }

        if (i == length - 1) {
            flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 3000).setOrigin(origin, origin).setSize(10, 16).setOffset(3, 0));
            flames[flames.length - 1].animation = "bomb-exploding-up-head";
        }
        else {
            flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 10).setOrigin(origin, origin).setSize(10, 16).setOffset(3, 0));
            flames[flames.length - 1].animation = "bomb-exploding-ud-body";
        }
        return true;
    }
    return false;
}

const addFlameDown = (flames, x, y, i, length, origin) => {
    if (map.getTileAtWorldXY(x, y + 16 * (i + 1), layer).index !== 1) {
        y = y + 16 * (i + 1);
        if (checkAndDestroyObjects(x, y)) {
            return false;
        }

        if (i == length - 1) {
            flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 25).setOrigin(origin, origin).setSize(10, 16).setOffset(3, 0));
            flames[flames.length - 1].animation = "bomb-exploding-down-head";
        }
        else {
            flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 10).setOrigin(origin, origin).setSize(10, 16).setOffset(3, 0));
            flames[flames.length - 1].animation = "bomb-exploding-ud-body";
        }
        return true;
    }
    return false;
}

const addFlameLR = (flames, x, y, i, length, origin, isL) => {
    if (isL) {
        if (map.getTileAtWorldXY(x - 16 * (i + 1), y, layer).index !== 1) {
            x = x - 16 * (i + 1);
            if (checkAndDestroyObjects(x, y)) {
                return false;
            }

            if (i == length - 1) {
                flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 35).setOrigin(origin, origin).setSize(16, 10).setOffset(0, 3));
                flames[flames.length - 1].animation = "bomb-exploding-left-head";
            }
            else {
                flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 15).setOrigin(origin, origin).setSize(16, 10).setOffset(0, 3));
                flames[flames.length - 1].animation = "bomb-exploding-lr-body";
            }
            return true;
        }
    } else {
        if (map.getTileAtWorldXY(x + 16 * (i + 1), y, layer).index !== 1) {
            x = x + 16 * (i + 1);
            if (checkAndDestroyObjects(x, y)) {
                return false;
            }

            if (i == length - 1) {
                flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 30).setOrigin(origin, origin).setSize(16, 10).setOffset(0, 3));
                flames[flames.length - 1].animation = "bomb-exploding-right-head";
            }
            else {
                flames.push(scene.flamesGroup.create(x, y, 'bomb-flame', 15).setOrigin(origin, origin).setSize(16, 10).setOffset(0, 3));
                flames[flames.length - 1].animation = "bomb-exploding-lr-body";
            }
            return true;
        }
    }
    return false;
}

const checkAndDestroyObjects = (x, y) => { //used to stop the flames at the first wall/item
    walls_hit = _.filter(scene.wallsGroup.children.entries, (w) => w.x === x && w.y === y);
    if (walls_hit.length > 0) {
        _.each(walls_hit, (w) => destroyWall(w));
        return true;
    }
    items_hit = _.filter(scene.itemsGroup.children.entries, (i) => i.x === x && i.y === y);
    if (items_hit.length > 0) {
        _.each(items_hit, (i) => destroyItem(i));
        return true;
    }
    return false;
}



const playerAnimation = () => {
    scene.anims.create({
        key: 'left',
        frames: scene.anims.generateFrameNumbers('white-bm', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'right',
        frames: scene.anims.generateFrameNumbers('white-bm', { start: 9, end: 11 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'up',
        frames: scene.anims.generateFrameNumbers('white-bm', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'down',
        frames: scene.anims.generateFrameNumbers('white-bm', { start: 6, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'death',
        frames: scene.anims.generateFrameNumbers('white-bm', { start: 12, end: 17 }),
        frameRate: 5,
        repeat: 0
    });
}


const flamesAnimation = () => {
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
}
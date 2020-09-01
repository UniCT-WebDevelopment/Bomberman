const game_colors = ['white', 'black', 'blue', 'red'];
var colorMap = {
    gray: { sprites: "white-bm", x: 24, y: 24 },
    black: { sprites: "black-bm", x: 216, y: 24 },
    blue: { sprites: "blue-bm", x: 24, y: 184 },
    red: { sprites: "red-bm", x: 216, y: 184 }
};
const items_list = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 3, 9, 9, 9, 9, 9, 23, 23];

var musicConfig = {
    mute: false,
    volume: 0.25,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0,
}

var game, cursors;
var setupStage, replaceItems, placeBomb, moveEnemy, stopEnemy, killEnemy;
var everyoneReady; //used to hide the Card telling to wait for others

function setupGame() {
    bombs = $('#numberBombs').val();
    flames = $('#numberFlames').val();
    speed = $('#numberSpeed').val();
    _.each(userList, (el) => {
        if (el.color === 'white')
            el.color = "gray";
    });
    socket.emit('start-game', { b: bombs, f: flames, s: speed, players: userList });
};

function startGame(b, f, s, playersList, your_id, stage, items) {

    var config = {
        type: Phaser.AUTO,
        width: 240,
        height: 208,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.NO_CENTER
        },
        backgroundColor: "#000000",//"#2E8B57",
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            },
        },
        input: {
            gamepad: true
        },
        pixelArt: true
    };

    game = new Phaser.Game(config);


    inGame = true;
    $('.lobby').hide();
    $('.game').show();
    $('.icon-volume').removeClass('fa-volume-off').addClass('fa-volume-up');
    $('.canvasContainer').html("");
    isMobile = !game.device.os.desktop;
    everyoneReady = false;

    var map, tileset, layer, scene;
    var players;
    var bombs, flipFlopBomb;
    var animated; //animated is used to show the right animation with the player sprite
    var anim;
    var walls;


    function preload() {

        //LOAGING SCREEN
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            //console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('fileprogress', function (file) {
            //console.log(file.src);
            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', function () {
            //console.log('complete');
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
            //socket.emit('request-stage', your_id);
            if(!everyoneReady)
                $('#gameCard').show();
            else
                $('#gameCard').hide();
            socket.emit('user-ready', your_id);
        });




        //1 hard wall, 2 normal wall, 3 grass, 4 shadowed grass,
        this.load.image("tiles-stage-1", "/public/assets/tiles/snes_stage_1.png");
        this.load.tilemapCSV('map', '/public/assets/tilemaps/stage_1.csv')
        loadSprites(this);

        //AUDIO
        this.load.audio("music", "/public/assets/audio/snes_battle_music.mp3");
        this.load.audio("explosion", "/public/assets/audio/explosion.mp3");

        // GROUPS
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
            allowGravity: false,
            visible: true
        });
        this.playersGroup = this.physics.add.group({
            allowGravity: false
        });
        scene = this;
        scene.your_id = your_id;
    }








    function create() {

        // MAP
        if (map === undefined) {
            map = scene.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
            tileset = map.addTilesetImage('tiles-stage-1');
            layer = map.createStaticLayer(0, tileset, 0, 0);
            //layer.setCollisionByExclusion([3, 4]);
        }

        //WALLS ITEMS
        walls = [];
        for (let i = 1; i < 14; i++) {
            for (let j = 1; j < 12; j++) {
                if (stage[j][i] === 2 || stage[j][i] === 3) {
                    let wall = createNewWall(i * 16, j * 16)
                    walls.push(wall);
                }
            }
        }

        for (let item of items) {
            createNewItem(item[0], item[1], item[2]);
        }
        console.log("Walls/Items loaded");

        // PLAYERS
        players = addPlayers(playersList);

        scene.physics.add.collider(players[your_id], scene.flamesGroup, () => {
            death(your_id);
        }, null, this);

        //ANIMATIONS
        playerAnimation();
        flamesAnimation();
        bombsAnimations();
        scene.physics.add.collider(scene.playersGroup, layer);

        //AUDIO
        this.backgroundSong = this.sound.add("music");
        this.explosion = this.sound.add("explosion");

        //MOBILE CURSORS
        if (isMobile) {
            $('.controls').show();
            setupVirtualKeys();
        }

        //INITIALIZATIONS VARIABLES
        animated = false;
        anim = 'stop';
        bombs = [];

        //this.backgroundSong.play(musicConfig);
        //game.sound.setVolume(0);
    }

    /*setupStage = (s, items) => {
        if (!stage) {
            if (map === undefined) {
                map = scene.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 });
                tileset = map.addTilesetImage('tiles-stage-1');
                layer = map.createStaticLayer(0, tileset, 0, 0);
                //layer.setCollisionByExclusion([3, 4]);
            }


            //WALLS ITEMS
            stage = s;
            walls = [];
            for (let i = 1; i < 14; i++) {
                for (let j = 1; j < 12; j++) {
                    if (stage[j][i] === 2 || stage[j][i] == 3) {
                        let wall = createNewWall(i * 16, j * 16)
                        walls.push(wall);
                    }
                }
            }

            for (let item of items) {
                createNewItem(item[0], item[1], item[2]);
            }
            console.log("Walls/Items loaded");
        }

        $('canvas').on('click', function() {
            this.focus();
        });
    };*/


    const createNewWall = (x, y) => {
        let wall = scene.wallsGroup.create(x, y, 'walls', 2).setOrigin(0, 0);
        wall.setImmovable();
        wall.setDepth(1999);
        scene.physics.add.collider(scene.playersGroup, wall);
        return wall;
    }






    function update() {

        phaserKeyboard();
        mobileControls();

    }








    // FUNCTIONS

    const addPlayers = (list) => {
        let players = [];
        let i = 0;
        for (let user in list) {
            let player = colorMap[list[user].color];
            players.push(createPlayer(player.x, player.y, player.sprites, i));

            if (list[user].color == "gray")
                playersList[user].color = "white";
            i++;
        }
        return players;
    };


    const createPlayer = (x, y, sprites, id) => {
        player = scene.playersGroup.create(x, y, sprites, 7);
        player.setSize(15, 15, 0, 0).setOffset(0, 11).setOrigin(0.471, 0.70);
        player.setDepth(2001);
        player.setCollideWorldBounds(true);
        player.speed = s;
        player.countDeathCollider = 0;
        player.bombs = b;
        player.id = id;
        player.flames = f;
        player.status = 'alive';
        player.godlike = false;
        player.items_collected = [];
        flipFlopBomb = false;

        _.times(player.bombs, () => player.items_collected.push(0));
        _.times(player.flames, () => player.items_collected.push(1));
        _.times(player.speed, () => player.items_collected.push(9));

        return player;
    }

    var chevronUp = chevronDown = chevronLeft = chevronRight = bombKey = false;

    const setupVirtualKeys = () => {
        $('#chevron-up').bind('mousedown touchstart', () => {
            chevronUp = true;
        });
        $('#chevron-down').bind('mousedown touchstart', () => {
            chevronDown = true;
        });
        $('#chevron-left').bind('mousedown touchstart', () => {
            chevronLeft = true;
        });
        $('#chevron-right').bind('mousedown touchstart', () => {
            chevronRight = true;
        });
        $('#chevron-up').bind('mouseup touchend', () => {
            chevronUp = false;
        });
        $('#chevron-down').bind('mouseup touchend', () => {
            chevronDown = false;
        });
        $('#chevron-left').bind('mouseup touchend', () => {
            chevronLeft = false;
        });
        $('#chevron-right').bind('mouseup touchend', () => {
            chevronRight = false;
        });
        $('#bomb-key').bind('mousedown touchstart', () => {
            bombKey = true;
        });
        $('#bomb-key').bind('mouseup touchend', () => {
            bombKey = false;
        });

        zoomDisable();
    }

    moveEnemy = (x, y, id, animation) => {
        if (id != your_id) {
            players[id].x = x;
            players[id].y = y;
            if (animation == "stop") {
                players[id].anims.setCurrentFrame(players[id].anims.currentAnim.frames[1]);
                players[id].anims.stop();
            }
            else {
                players[id].anims.play(animation, true);
            }
        }
    };

    stopEnemy = (id) => {
        if (id != your_id) {
            players[id].anims.setCurrentFrame(players[id].anims.currentAnim.frames[1]);
            players[id].anims.stop();
            players[id].setVelocity(0, 0);
        }
    };



    const death = (id) => {
        if (id === your_id && players[id].countDeathCollider == 0) {
            socket.emit('dead-items', { stage: stage, items: players[id].items_collected, id: your_id });
            players[id].countDeathCollider++;
            players[id].status = "dead";
            players[id].anims.play(/*game_colors[id]*/playersList[id].color + '-death', true);
            players[id].once("animationcomplete", () => {
                setTimeout(() => {
                    players[id].destroy();
                }, 500);
            });
        }
    };

    killEnemy = (id) => {
        console.log(id);
        if (your_id != id) {
            try {
                players[id].status = "dead";
                players[id].anims.play(/*game_colors[id]*/playersList[id].color + '-death', true);
                players[id].once("animationcomplete", () => {
                    setTimeout(() => {
                        players[id].destroy();
                    }, 1000);
                });
            } catch (err) {
                console.log(err);
            }
        }
    }

    replaceItems = (items_collected) => {
        _.each(items_collected, (item) => createNewItem(item[0], item[1][0], item[1][1]));
    }

    const destroyWall = (wall, color) => {
        wall.anims.play(color + "-wall-destroyed", true);
        wall.once("animationcomplete", () => {
            x = Math.floor(wall.x / 16);
            y = Math.floor(wall.y / 16);
            if (stage[y][x] === 2) {
                stage[y][x] = 0;
            }
            wall.destroy();
        });
    }

    const createNewItem = (item_index, item_x, item_y) => {
        item = scene.itemsGroup.create(item_x, item_y, 'items', item_index).setOrigin(0, 0).setSize(12, 12).setOffset(2, 2);
        item.setImmovable();
        item.setDepth(1998);
        item.index = item_index;
        item.player_collider = scene.physics.add.overlap(item, scene.playersGroup, (item, player) => {
            player.items_collected.push(item.index);
            if (item.index == 0 && player.bombs < 10) {
                player.bombs++;
            } else if (item.index == 1 && player.bombs < 13) {
                player.flames++;
            } else if (item.index == 3) {
                player.flames = 13;
            } else if (item.index == 9 && player.speed < 6) {
                player.speed++;
            } else if (item.index == 23 & player.speed > 0) {
                player.speed--;
            }

            x = Math.floor(item.x / 16);
            y = Math.floor(item.y / 16);
            stage[y][x] = 0;
            item.destroy();
        });
        return item;
    }

    const destroyItem = (item, color) => {
        item.anims.play(color + '-item-destroyed', true);
        item.once('animationcomplete', () => {
            x = Math.floor(item.x / 16);
            y = Math.floor(item.y / 16);
            stage[y][x] = 0;
            item.destroy();
        });
    }


    placeBomb = (x, y, id, flames_len) => {
        var bomb;
        var newX, newY, i, j; //i,j are the coordinates of the 16x16 squares of the stage map
        i = Math.floor(Math.floor(x) / 16);
        j = Math.floor(Math.floor(y) / 16);

        newX = Math.floor(x) - (Math.floor(x) % 16) + 8;
        newY = Math.floor(y) - (Math.floor(y) % 16) + 8;

        if (_.filter(bombs, (b) => Math.floor(b.x / 16) == i && Math.floor(b.y / 16) == j).length == 0) {
            bomb = scene.bombsGroup.create(-128, -128, playersList[id].color + '-bomb').setOrigin(0, 0).disableBody(true, true);
            bomb.x = newX;
            bomb.y = newY;
            bomb.player_id = id;
            bomb.flames = flames_len;
            bomb.color = playersList[id].color;//game_colors[id];
            bomb.setSize(13, 13).setOffset(2, 2);
            bomb.setImmovable();
            bomb.setDepth(2000);

            setTimeout(() => { //fixed the bug when the bomb is misplaced on top of an undestructable wall
                if (bombOverlapWall(bomb)) { //bomb misplaced
                    bomb.x -= 8;
                    bomb.y -= 8;
                }
                bomb.enableBody(false, 0, 0, true, true);
                bomb.anims.play(bomb.color + '-bomb-ticking', true);
            }, 50);

            bomb.once("animationcomplete", () => {
                explosion(bomb, 0);
            });
            scene.physics.add.collider(scene.playersGroup, bomb);
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
        createFlames(bomb.x, bomb.y, origin, bomb.flames, bomb.color);
        scene.explosion.play();
        bomb.destroy();
    }

    const bombOverlapWall = (bomb) => {
        return map.getTileAtWorldXY(bomb.x + 1, bomb.y + 1, layer).index === 1 ||
            map.getTileAtWorldXY(bomb.x + 1, bomb.y + 15, layer).index === 1 ||
            map.getTileAtWorldXY(bomb.x + 15, bomb.y + 1, layer).index === 1 ||
            map.getTileAtWorldXY(bomb.x + 15, bomb.y + 15, layer).index === 1;
    }

    const createFlames = (x, y, origin, flames_len, color) => {
        u = d = l = r = true;

        flames = [];

        flames.push(scene.flamesGroup.create(x, y, color + '-flame', 5).setOrigin(origin, origin));
        flames[flames.length - 1].animation = color + "-bomb-exploding-center";

        for (let i = 0; i < flames_len; i++) {
            if (u)
                u = addFlameUp(flames, x, y, i, flames_len, origin, color);
            if (d)
                d = addFlameDown(flames, x, y, i, flames_len, origin, color);
            if (l)
                l = addFlameLR(flames, x, y, i, flames_len, origin, color, true);
            if (r)
                r = addFlameLR(flames, x, y, i, flames_len, origin, color, false);
        }

        _.each(flames, (f) => {
            f.setImmovable();
            f.setDepth(1997);
            f.anims.play(f.animation, 'play');
            f.once("animationcomplete", () => {
                f.destroy();
            });
        });
    }

    const addFlameUp = (flames, x, y, i, length, origin, color) => {
        if (map.getTileAtWorldXY(x, y - 16 * (i + 1), layer).index !== 1) {
            y = y - 16 * (i + 1);
            if (checkAndDestroyObjects(x, y, color)) {
                return false;
            }

            if (i == length - 1) {
                flames.push(scene.flamesGroup.create(x, y, color + '-flame', 20).setOrigin(origin, origin).setSize(8, 16).setOffset(5, 0));
                flames[flames.length - 1].animation = color + "-bomb-exploding-up-head";
            }
            else {
                flames.push(scene.flamesGroup.create(x, y, color + '-flame', 10).setOrigin(origin, origin).setSize(10, 16).setOffset(3, 0));
                flames[flames.length - 1].animation = color + "-bomb-exploding-ud-body";
            }
            return true;
        }
        return false;
    }

    const addFlameDown = (flames, x, y, i, length, origin, color) => {
        if (map.getTileAtWorldXY(x, y + 16 * (i + 1), layer).index !== 1) {
            y = y + 16 * (i + 1);
            if (checkAndDestroyObjects(x, y, color)) {
                return false;
            }

            if (i == length - 1) {
                flames.push(scene.flamesGroup.create(x, y, color + '-flame', 25).setOrigin(origin, origin).setSize(10, 16).setOffset(3, 0));
                flames[flames.length - 1].animation = color + "-bomb-exploding-down-head";
            }
            else {
                flames.push(scene.flamesGroup.create(x, y, color + '-flame', 10).setOrigin(origin, origin).setSize(10, 16).setOffset(3, 0));
                flames[flames.length - 1].animation = color + "-bomb-exploding-ud-body";
            }
            return true;
        }
        return false;
    }

    const addFlameLR = (flames, x, y, i, length, origin, color, isL) => {
        if (isL) {
            if (map.getTileAtWorldXY(x - 16 * (i + 1), y, layer).index !== 1) {
                x = x - 16 * (i + 1);
                if (checkAndDestroyObjects(x, y, color)) {
                    return false;
                }

                if (i == length - 1) {
                    flames.push(scene.flamesGroup.create(x, y, color + '-flame', 35).setOrigin(origin, origin).setSize(16, 10).setOffset(0, 3));
                    flames[flames.length - 1].animation = color + "-bomb-exploding-left-head";
                }
                else {
                    flames.push(scene.flamesGroup.create(x, y, color + '-flame', 15).setOrigin(origin, origin).setSize(16, 10).setOffset(0, 3));
                    flames[flames.length - 1].animation = color + "-bomb-exploding-lr-body";
                }
                return true;
            }
        } else {
            if (map.getTileAtWorldXY(x + 16 * (i + 1), y, layer).index !== 1) {
                x = x + 16 * (i + 1);
                if (checkAndDestroyObjects(x, y, color)) {
                    return false;
                }

                if (i == length - 1) {
                    flames.push(scene.flamesGroup.create(x, y, color + '-flame', 30).setOrigin(origin, origin).setSize(16, 10).setOffset(0, 3));
                    flames[flames.length - 1].animation = color + "-bomb-exploding-right-head";
                }
                else {
                    flames.push(scene.flamesGroup.create(x, y, color + '-flame', 15).setOrigin(origin, origin).setSize(16, 10).setOffset(0, 3));
                    flames[flames.length - 1].animation = color + "-bomb-exploding-lr-body";
                }
                return true;
            }
        }
        return false;
    }

    const checkAndDestroyObjects = (x, y, color) => { //used to stop the flames at the first wall/item
        walls_hit = _.filter(scene.wallsGroup.children.entries, (w) => w.x === x && w.y === y);
        if (walls_hit.length > 0) {
            _.each(walls_hit, (w) => {
                try {
                    destroyWall(w, color)
                } catch {
                    console.log("Element not found");
                    destroyWall(createNewWall(x, y), color);
                }
            });
            return true;
        }
        items_hit = _.filter(scene.itemsGroup.children.entries, (i) => i.x === x && i.y === y);
        if (items_hit.length > 0) {
            _.each(items_hit, (i) => {
                try {
                    destroyItem(i, color);
                } catch {
                    console.log("Element not found");
                    destroyItem(createNewItem(0, x, y), color);
                }
            });
            return true;
        }
        return false;
    }

    $canvas = $('canvas').detach();
    $('.canvasContainer').html($canvas);
    resize();
    window.addEventListener("resize", resize, false);

    function resize() {
        var canvas = document.querySelector("canvas");
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var windowRatio = windowWidth / windowHeight;
        var gameRatio = game.config.width / game.config.height;

        if (windowRatio < gameRatio) {
            canvas.style.width = windowWidth + "px";
            canvas.style.height = (windowWidth / gameRatio) + "px";
        }
        else {
            canvas.style.width = (windowHeight * gameRatio) + "px";
            canvas.style.height = windowHeight + "px";
        }
    }

    function phaserKeyboard() {
        if (cursors && players[your_id] && players[your_id].status === 'alive') {
            speed = 300 - players[your_id].speed * 20;
            players[your_id].anims.msPerFrame = speed / 3;

            if (cursors.right.isDown) {
                if (actualTween === undefined && !getCollisionOnMove(players[your_id].x, players[your_id].y, 'right')) {
                    anim = playersList[your_id].color + '-right';
                    actualTween = createHorizontalTween(players[your_id].x, 'right', anim);
                }
            } else if (cursors.left.isDown) {
                if (actualTween === undefined && !getCollisionOnMove(players[your_id].x, players[your_id].y, 'left')) {
                    anim = playersList[your_id].color + '-left';
                    actualTween = createHorizontalTween(players[your_id].x, 'left', anim);
                }
            } else if (cursors.up.isDown) {
                if (actualTween === undefined && !getCollisionOnMove(players[your_id].x, players[your_id].y, 'up')) {
                    anim = playersList[your_id].color + '-up';
                    actualTween = createVerticalTween(players[your_id].y, 'up', anim);
                }
            } else if (cursors.down.isDown) {
                if (actualTween === undefined && !getCollisionOnMove(players[your_id].x, players[your_id].y, 'down')) {
                    anim = playersList[your_id].color + '-down';
                    actualTween = createVerticalTween(players[your_id].y, 'down', anim);
                }
            }

            if (actualTween === undefined) {
                if (anim != 'stop') {
                    players[your_id].anims.setCurrentFrame(players[your_id].anims.currentAnim.frames[1]);
                    players[your_id].anims.stop();
                }
                anim = 'stop';
                animated = false;
            }

            if (!flipFlopBomb && players[your_id].bombs > _.filter(bombs, (b) => b.player_id === your_id).length && cursors.space.isDown) {
                placeBomb(players[your_id].x, players[your_id].y, your_id, players[your_id].flames);
                socket.emit('placed-bomb', { x: players[your_id].x, y: players[your_id].y, player_id: your_id, flames_len: players[your_id].flames });
                flipFlopBomb = true;
            }

            if (flipFlopBomb && cursors.space.isUp) {
                flipFlopBomb = false;
            }

            socket.emit('move-player', {
                player_id: players[your_id].id,
                x: players[your_id].x,
                y: players[your_id].y,
                animation: anim,
            });
        }
    };

    function mobileControls() {
        if (isMobile && players[your_id] && players[your_id].status === 'alive') {
            speed = 300 - players[your_id].speed * 20;
            players[your_id].anims.msPerFrame = speed / 3;

            if (chevronUp) {
                if (actualTween === undefined && !getCollisionOnMove(players[your_id].x, players[your_id].y, 'up')) {
                    anim = playersList[your_id].color + '-up';
                    actualTween = createVerticalTween(players[your_id].y, 'up', anim);
                }
            } else if (chevronDown) {
                if (actualTween === undefined && !getCollisionOnMove(players[your_id].x, players[your_id].y, 'down')) {
                    anim = playersList[your_id].color + '-down';
                    actualTween = createVerticalTween(players[your_id].y, 'down', anim);
                }
            } else if (chevronLeft) {
                if (actualTween === undefined && !getCollisionOnMove(players[your_id].x, players[your_id].y, 'left')) {
                    anim = playersList[your_id].color + '-left';
                    actualTween = createHorizontalTween(players[your_id].x, 'left', anim);
                }
            }
            else if (chevronRight) {
                if (actualTween === undefined && !getCollisionOnMove(players[your_id].x, players[your_id].y, 'right')) {
                    anim = playersList[your_id].color + '-right';
                    actualTween = createHorizontalTween(players[your_id].x, 'right', anim);
                }
            }

            if (actualTween === undefined) {
                if (anim != 'stop') {
                    players[your_id].anims.setCurrentFrame(players[your_id].anims.currentAnim.frames[1]);
                    players[your_id].anims.stop();
                }
                anim = 'stop';
                animated = false;
            }

            if (!flipFlopBomb && players[your_id].bombs > _.filter(bombs, (b) => b.player_id === your_id).length && bombKey) {
                placeBomb(players[your_id].x, players[your_id].y, your_id, players[your_id].flames);
                socket.emit('placed-bomb', { x: players[your_id].x, y: players[your_id].y, player_id: your_id, flames_len: players[your_id].flames });
                flipFlopBomb = true;
            }

            if (flipFlopBomb && !bombKey) {
                flipFlopBomb = false;
            }

            socket.emit('move-player', {
                player_id: players[your_id].id,
                x: players[your_id].x,
                y: players[your_id].y,
                animation: anim,
            });
        }
    };


    // needed for the tile based movement
    var actualTween;

    var createVerticalTween = (player_y, dir, anim) => {
        return scene.tweens.add({
            targets: players[your_id],
            duration: speed,
            y: parseInt(player_y / 16) * 16 + (dir === 'up' ? - 8 : 24),
            ease: 'Linear',
            repeat: 0,
            onStart: function () {
                players[your_id].anims.play(anim, true);
            },
            onComplete: function () {
                //players[your_id].anims.setCurrentFrame(player.anims.currentAnim.frames[1]);
                players[your_id].anims.stop();
                anim = 'stop';
                animated = false;
                actualTween = undefined;
            },
            delay: 0,
            completeDelay: 0,
            yoyo: false
        });
    };

    var createHorizontalTween = (player_x, dir, anim) => {
        return scene.tweens.add({
            targets: players[your_id],
            duration: speed,
            x: parseInt(player_x / 16) * 16 + (dir === 'left' ? - 8 : 24),
            ease: 'Linear',
            repeat: 0,
            onStart: function () {
                players[your_id].anims.play(anim, true);
            },
            onComplete: function () {
                //players[your_id].anims.setCurrentFrame(player.anims.currentAnim.frames[1]);
                players[your_id].anims.stop();
                anim = 'stop';
                animated = false;
                actualTween = undefined;
            },
            delay: 0,
            completeDelay: 0,
            yoyo: false
        });
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
};
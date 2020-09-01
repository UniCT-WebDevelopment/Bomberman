var socket;
var userNickname;
var roomName;
var avatar;
var userList;
var host;
var userId;
var stageSelected;
var num_players_ready;
var inGame;
var isMobile;
var $objHead;
var yourColor;

const resetVal = () => {
    userNickname = undefined;
    roomName = undefined;
    avatar = undefined;
    userList = undefined;
    host = undefined;
    userId = undefined;
    stageSelected = undefined;
    num_players_ready = undefined;
    inGame = undefined;
    isMobile = undefined;
    yourColor = undefined;
    $('#cardPlaceSelector [data-color]').css('visibility', 'visible');
    $('#cardPlaceSelector [data-color]').parent().removeClass('picked-color');
    $('#numberBombs').val(1);
    $('#numberFlames').val(2);
    $('#numberSpeed').val(1);
}

$(document).ready(() => {

    const loginUser = () => {
        $objHead = $('head');

        socket = io();

        socket.on('connect', () => {

            // LOGIN

            socket.emit('load-rooms');

            //socket.emit('create-room', { nickname: userNickname, roomName: roomName, avatar: avatar });


            socket.on('list-of-rooms', (rooms) => {
                let $rooms = [];
                for (let room in rooms) {
                    if (rooms[room].userList.length > 0 && rooms[room].userList.length < 4) {
                        $rooms.push('<span class="col-5 d-flex justify-content-center" id="room' + room + '">' + room + '</span>\
                                        <span class="col-4 d-flex justify-content-center" id="len'+ room + '">' + rooms[room].userList.length + '/4</span>\
                                        <span class="col-3 d-flex justify-content-center" data-room="'+ room + '"><button class="btn btn-success p-1 enter-room-button">ENTER</button></span>');
                    }
                    $('#room-list').html($rooms.join(""));
                }

                $('.enter-room-button').click((event) => {
                    event.preventDefault();
                    roomName = $(event.currentTarget.parentElement).attr('data-room');
                    setTimeout(() => {
                        $('#enterRoom').modal('hide');
                        $('.icon-exit').show();
                        socket.emit('create-room', { nickname: userNickname, roomName: roomName, avatar: avatar });
                    }, 250);
                });
            });

            // ERROR HANDLING

            socket.on("nickname-exists", () => {
                $('.chat').hide();
                $('.icon-exit').hide();
                socket.close();
                //console.log("Nickname exists");
                createPopup("Nickname already exists in this room", 500, 50);
                setTimeout(() => {
                    $('#loginModal').modal('show');
                    $('#carouselAvatar').carousel('pause');
                }, 1000);
            });

            socket.on("room-not-exists", () => {
                $('.chat').hide();
                $('.icon-exit').hide();
                socket.close();
                //console.log("Doesn't exists a room with this name");
                createPopup("Doesn't exists a room with this name", 500, 50);
                setTimeout(() => {
                    $('#loginModal').modal('show');
                    $('#carouselAvatar').carousel('pause');
                }, 1000);
            });

            socket.on("room-exists", () => {
                $('.chat').hide();
                $('.icon-exit').hide();
                socket.close();
                //console.log("This room name is already used");
                createPopup("This room name is already used", 500, 50);
                setTimeout(() => {
                    $('#loginModal').modal('show');
                    $('#carouselAvatar').carousel('pause');
                }, 1000);
            });

            socket.on("room-full", () => {
                $('.chat').hide();
                $('.icon-exit').hide();
                socket.close();
                //console.log("This room is full");
                createPopup("This room is full", 500, 50);
                setTimeout(() => {
                    $('#loginModal').modal('show');
                    $('#carouselAvatar').carousel('pause');
                }, 500);
            });

            socket.on("room-in-game", () => {
                $('.chat').hide();
                $('.icon-exit').hide();
                socket.close();
                //console.log("This room is full");
                createPopup("This room is in-game.", 500, 50);
                setTimeout(() => {
                    $('#loginModal').modal('show');
                    $('#carouselAvatar').carousel('pause');
                }, 500);
            });

            socket.on('enter-room', (data) => {
                socket.emit("login", { nickname: data.nickname, roomName: data.roomName, avatar: data.avatar });
            });

            socket.on("user_list", (data) => {
                userList = data.list;
                //console.logconsole.log(userList);
                let nicknames = _.map(userList, (user) => user.nickname);
                userId = nicknames.indexOf(userNickname);
                host = data.h;
                setUserList();
                printUserList();
            });

            socket.on("user_logged", (nickname) => {
                if (nickname !== userNickname) {
                    serviceMessage('User joined: ' + nickname);
                    socket.emit('request_user_list');
                    $('#buttonStart').hide();
                    $('#buttonReady').show();
                }
            });

            socket.on("user_disconnected", (data) => {
                serviceMessage('User disconnected: ' + data.nickname);
                num_players_ready = data.readyPlayers;
                socket.emit('request_user_list');
            });

            socket.on("new_host", (nickname) => {
                serviceMessage('New host: ' + nickname);
                if (userNickname === nickname) {
                    host = nickname;
                    $('.settingButton').css('visibility', 'visible');
                    initCarousel();
                }
            });

            socket.on("set-player-ready", (data) => {
                userList[data.index].status = "ready";
                let $rowUserList = $('#gameSetup #cardPlayersList .card-body').find('.row');
                $user = $($rowUserList[data.index]);
                $user.find('.not-ready').removeClass('not-ready').addClass("ready");
                $user.find('.ready').html("READY");
                num_players_ready = data.readyPlayers;
                if (host == userNickname && num_players_ready > 1 && num_players_ready == userList.length) {
                    $('#buttonReady').hide();
                    $('#buttonStart').show();
                }
            });

            socket.on("set-player-not-ready", (data) => {
                userList[data.index].status = "not-ready";
                let $rowUserList = $('#gameSetup #cardPlayersList .card-body').find('.row');
                $user = $($rowUserList[data.index]);
                $user.find('.ready').removeClass('ready').addClass("not-ready");
                $user.find('.not-ready').html("NOT READY");
                num_players_ready = data.readyPlayers;
                if (host == userNickname && num_players_ready < userList.length) {
                    $('#buttonStart').hide();
                    $('#buttonReady').show();
                }
            });

            socket.on("message", (data) => {
                if (userNickname != data.nickname) {
                    //messaggio degli altri
                    receiveMsg(data.nickname, data.message, data.avatar);
                }
            })

            socket.on("load_dashboard", (gameStarted) => {
                $('.chat').show();

                if (gameStarted) {
                    console.log("Wait for the game to finish!");
                } else {
                    console.log("Loading your dashboard. Please Wait.")
                    loadSettings();
                }
            });

            socket.on("get-color", (list) => {
                pickAColor(list);
            });


            socket.on("remove-color", (data) => {
                $('#cardPlaceSelector [data-color="' + data.actual_color + '"]').css('visibility', 'hidden');
                if (data.prev_color) {
                    $('#cardPlaceSelector [data-color="' + data.prev_color + '"]').css('visibility', 'visible');
                }
            });


            socket.on("release-color", (color) => {
                if (color) {
                    $('#cardPlaceSelector [data-color="' + color + '"]').css('visibility', 'visible');
                    $('#cardPlaceSelector [data-color="' + color.prev_color + '"]').parent().removeClass('picked-color');
                }
            });



            socket.on("get-input-values", (data) => {
                $('#' + data.id).val(data.value);
            });

            socket.on("update-stage-carousel", (stage) => {
                if (host != userNickname) {
                    $('#carouselStage').carousel(stage - 1);
                    $('#carouselStage').carousel('pause');
                    stage = stage;
                }
            });



            // GAME EVENTS
            socket.on('load-game', (data) => {
                if (userId != -1) {
                    startGame(data.b, data.f, data.s, data.players, userId, data.stage, data.items);
                }
            });

            socket.on('all-users-ready', () => {
                $('#gameCard').hide();
                everyoneReady = true;
                countDown();
            });

            socket.on('exit-game', () => {
                if (inGame) {
                    exitGame();
                }
            });

            socket.on('walls-items-ready', (data) => {
                if (inGame) {
                    setupStage(data.stage, data.items);
                }
            });

            socket.on('move-enemy', (data) => {
                if (inGame)
                    try {
                        moveEnemy(data.x, data.y, data.player_id, data.animation);
                    } catch {
                        //console.log("Error! Moving a died enemy!");
                    }

            });

            socket.on('stop-enemy', (id) => {
                if (inGame)
                    try {
                        stopEnemy(id);
                    } catch {
                        console.log("Error! Moving a died enemy!");
                    }

            });

            socket.on('place-enemy-bomb', (data) => {
                if (inGame)
                    placeBomb(data.x, data.y, data.player_id, data.flames_len);
            })

            socket.on('replace-items', (data) => {
                if (inGame)
                    replaceItems(data);
            });

            socket.on('kill-player', (id) => {
                if (inGame)
                    killEnemy(id);
            });

            socket.on('end-game', (winner) => {
                if (inGame) {
                    console.log("Exiting");
                    let result;
                    if (game.scene.scenes[0].your_id === winner) {
                        result = "You won!";
                    } else {
                        result = "You lost! Player " + (winner + 1) + " won!";
                    }
                    createPopup(result, 2000, 150);
                    if (game.scene.scenes[0].your_id === winner)
                        $('.popup_scheda').removeClass('bg-danger').addClass('bg-success');
                    setTimeout(() => game.destroy(false, false), 1000);
                    setTimeout(() => exitGame(), 5000);
                    socket.emit('close-game');
                    inGame = false;
                }
            });
        });
    }

    setUserList = () => {
        let list = "";
        for (let i = 0; i < userList.length; i++)
            list += (host === userList[i].nickname ? "Host - " : "") + userList[i].nickname + "<br>";
        $("#usersList").attr("data-original-title", list);
    }

    //Manage events

    $('#nickname').on('keydown', (event) => {
        if (event.keyCode === 13)
            $('#loads-room').trigger('click');
    });

    $('#roomName').on('keydown', (event) => {
        if (event.keyCode === 13)
            $('#join-room').trigger('click');
    });

    $("#loads-room").on('click', () => {
        $("#nickname").val($("#nickname").val().replace(/ /g, ""));
        if ($("#nickname").val().length > 2) {
            userNickname = $("#nickname").val();
            avatar = $('#carouselAvatar').find('.active').attr('data-avatar');
            $('#loginModal').modal('hide');
            setTimeout(() => $('#enterRoom').modal({ backdrop: 'static', keyboard: false }), 500);
            loginUser();
        } else {
            createPopup("The username must have at least three character", 500, 50);
        }
    });

    $("#join-room").on('click', () => {
        $("#roomName").val($("#roomName").val().replace(/ /g, ""));
        roomName = $("#roomName").val();
        if (roomName.length > 0) {
            $('#enterRoom').modal('hide');
            $('.icon-exit').show();
            userList = [];
            num_players_ready = 0;
            inGame = false;
            socket.emit('create-room', { nickname: userNickname, roomName: roomName, avatar: avatar });
        } else {
            createPopup("Room Name must have at least a character", 500, 50);
        }
    });

    
    // Chat commands

    $('.chat_icon').on('click', () => {
        $('.chat_icon').hide();
        $('.chat_panel').show();
        $('.messages').animate({ scrollTop: $('.messages').prop('scrollHeight') }, 300);
    });

    $('.chat_panel').find('.card-header').on('click', () => {
        $('#unread-messages').html('0');
        $('.chat_panel').hide();
        $('.chat_icon').show();
    });

    $('#usersList').tooltip({ trigger: 'click hover', title: "Users online", placement: 'bottom', html: true });

    
    // Initial Setup
     

    createLoginModal();

    
    // Game Commands
     

    $('#icon-volume').click(() => {
        $('#range-volume').show().focus();
        $('#icon-volume').hide();
    });

    $('#range-volume').on('change', () => {
        game.sound.setVolume($('#range-volume').val());
        $('#range-volume').focusout();
    }).on('focusout', () => {
        $('#range-volume').hide();
        $('#icon-volume').show();
    });

    $('#exit-game').click(() => {
        if (userId == 0) {
            if ($('canvas')) {
                socket.emit('close-game');
                exitGame();
            }
        }
        else {
            exitGame();
            if (inGame) {
                $('.chat').hide();
                $('.icon-exit').hide();
                $('#gameSetup').hide();
                socket.close();
                setTimeout(() => {
                    $('#loginModal').modal('show');
                    $('#carouselAvatar').carousel('pause');
                }, 500);
            }
        }
        $('#cardPlaceSelector .your-color .btn').trigger('click');
        socket.emit('user-exits');
        inGame = false;
    });

    $('#exit-room').click(() => {
        socket.close();
        $('#gameSetup').hide();
        $('.chat').hide();
        $('.icon-exit').hide();
        createPopup("You left the room.", 500, 50);
        resetVal();
        setTimeout(() => {
            $('#loginModal').modal('show');
            $('#carouselAvatar').carousel('pause');
        }, 1000);
    });

    $('.fa-arrow-down.settingButton').click((event) => {
        $el = $(event.currentTarget);
        let val = parseInt($el.parent().find("input").val());
        if (val > 1)
            $el.parent().find("input").val(val - 1);
    });
    $('.fa-arrow-up.settingButton').click((event) => {
        $el = $(event.currentTarget);
        let val = parseInt($el.parent().find("input").val());
        if (val < 10)
            $el.parent().find("input").val(val + 1);
    });

    $('#cardPlaceSelector .colors-circle .btn').click((event) => {
        yourColor = $(event.currentTarget).data('color');
        $('.colors-circle').hide();

        let colorClass;
        switch (yourColor) {
            case "black":
                colorClass = "btn btn-dark";
                break;
            case "blue":
                colorClass = "btn btn-primary";
                break;
            case "red":
                colorClass = "btn btn-danger";
                break;
            default:
                colorClass = "btn btn-light";
        }
        $('.your-color span').addClass(colorClass);
        $('.your-color p').html("You picked the color: " + yourColor + ".<br>Click again on your color to change the selection!");

        $('.your-color').show();
        socket.emit('color-claimed', yourColor);
    });

    $('#cardPlaceSelector .your-color .btn').click(() => {
        if ($('#buttonReady').hasClass('btn-success')) {
            $('#buttonReady').trigger('click');
        }
        $('.your-color span').removeClass();
        socket.emit('color-released', yourColor);
        yourColor = undefined;
        $('.your-color').hide();
        $('.colors-circle').show();
    });
});

function exitGame() {
    game.destroy();
    $('.controls').hide();
    $('.game').hide();
    $('.lobby').show();
    $('#buttonReady').trigger('click');
    if (isMobile)
        zoomEnable();
}


function createLoginModal() {
    $('.chat').hide();
    $('.icon-exit').hide();
    $('#gameSetup').hide();
    $('#loginModal').modal({ backdrop: 'static', keyboard: false });


    $('#carouselAvatar').carousel('pause');
    $('#carouselAvatar').carousel();
    $('#prev-avatar').click(() => {
        $('#carouselAvatar').carousel('prev');
        $('#carouselAvatar').carousel('pause');
    });
    $('#next-avatar').click(() => {
        $('#carouselAvatar').carousel('next');
        $('#carouselAvatar').carousel('pause');
    });
}

function createPopup(text, time = 500, top = 50, fs = 15) {
    const popup = $('<div class="popup_scheda"></div>')
        .css({
            position: "fixed",
            display: "block",
            top: -50,
            padding: 50,
            opacity: 0,
            color: "white",
            "font-weight": "bold",
            "font-size": fs,
            "border-radius": 50,
            "z-index": 9999,
            "text-align": "center",
            "margin-left": -$('.popup_scheda').outerWidth() / 2
        })
        .html(text)
        .appendTo('body')
        .addClass("bg-danger")
        .animate({
            top: top,
            opacity: 1
        },
            time);

    popup.css("left", ($(window).width() / 2) - (popup.outerWidth() / 2));

    window.setTimeout(() => deletePopup(popup, time, top), time * 2);
}

function deletePopup(popup, time, top) {
    popup.animate({
        top: -top,
        opacity: 0
    },
        time / 2,
        () => {
            $('.popup_scheda').remove();
            popupCreato = false;
        });
};

function countDown() {
    let height = $(document).height()/4; 
    if (!isMobile) {
        createPopup("3", 333, height, 300);
        $('.popup_scheda').removeClass('bg-danger');
        setTimeout(() => {
            createPopup("2", 333, height, 300);
            $('.popup_scheda').removeClass('bg-danger');
        }, 1000);
        setTimeout(() => {
            createPopup("1", 333, height, 300);
            $('.popup_scheda').removeClass('bg-danger');
        }, 2000);
    } else {
        createPopup("3", 333, height, 200);
        $('.popup_scheda').removeClass('bg-danger');
        setTimeout(() => {
            createPopup("2", 333, height, 200);
            $('.popup_scheda').removeClass('bg-danger');
        }, 1000);
        setTimeout(() => {
            createPopup("1", 333, height, 200);
            $('.popup_scheda').removeClass('bg-danger');
        }, 2000);
    }
    setTimeout(() => {
        allowMovements();
    }, 3000);
}

function allowMovements() {
    let height = $(document).height()/4; 
    if (!isMobile) {
        cursors = game.scene.scenes[0].input.keyboard.createCursorKeys();
        createPopup("Start!", 1000, height, 150);
        $('.popup_scheda').removeClass('bg-danger');
    } else {
        createPopup("Start!", 1000, height, 100);
        $('.popup_scheda').removeClass('bg-danger');
    }
    game.scene.scenes[0].backgroundSong.play(musicConfig);
    game.sound.setVolume($('#range-volume').val());
}

var zoomDisable = function () {
    $objHead.find('meta[name=viewport]').remove();
    $objHead.prepend('<meta name="viewport" \
        content="width=device-width, initial-scale=1.0, user-scalable=0" />' );
};

var zoomEnable = function () {
    $objHead.find('meta[name=viewport]').remove();
    $objHead.prepend('<meta name="viewport" \
        content="width=device-width, initial-scale=1.0, user-scalable=1" />');
};

function pickAColor(list) {
    let picked_colors = _.map(_.filter(list, (el) => el.color), (el) => el.color);
    let color = _.difference(colors, picked_colors)[0];
    $('#cardPlaceSelector [data-color="' + color + '"]').trigger('click');
}
const colors = ['gray', 'black', 'blue', 'red'];

const loadSettings = () => {
    $('#gameSetup').show("fast", setupSettings);
    $('.timePanel').hide();
}

const setupSettings = () => {
    printUserList();
    disableInputs();
    setInputListeners();
    setEventsButtons();
    setCarousel();
    setPlaceButtons();
    setSettingsButtons();
}

const printUserList = () => {
    $('#gameSetup').find('#cardPlayersList').find('.card-body').html('');
    /*if (yourColor === undefined) {
        $('#gameSetup').find('#cardPlayersList').find('.card-body').html('You must choose a color!<br>');
    }*/
    for (let i = 0; i < userList.length; i++) {
        let $row = $('<div class="row"></div>');
        let color = "black";
        if (userList[i].color) {
            color = userList[i].color;
        }
        $row.append('<span class="col-12 col-lg-7 userName" style="color:' + color + ';">' + (i == 0 ? "Host - " : "") + userList[i].nickname + '</span>');
        $row.append('<span class="col-12 col-lg-5 ' + userList[i].status + '">' + (userList[i].status == "ready" ? 'READY' : 'NOT READY') + '</span>');
        $('#gameSetup').find('#cardPlayersList').find('.card-body').append($row);
    }
    if (userNickname === host) {
        if (userList.length == _.filter(userList, (user) => user.status == "ready").length && _.filter(userList, (user) => user.status == "ready").length > 1) {
            $('#buttonReady').hide();
            $('#buttonStart').show();
        }
        else {
            $('#buttonStart').hide();
            $('#buttonReady').show();
        }
    }
};

const disableInputs = () => {
    if (userNickname != host) {
        $('#gameSetup').find('input').prop('disabled', true);
    }
};

const setInputListeners = () => {
    if (userNickname == host) {
        $('#gameSetup').find('input').change((event) => {
            var idInput = event.currentTarget.id;
            socket.emit('send-input-values', { id: idInput, value: $('#' + idInput).val() });
        });
    }
};

const setEventsButtons = () => {
    $('#buttonStart').hide();

    $('#buttonReady').click(() => {
        let index = _.findIndex(userList, (user) => user.nickname == userNickname);
        if (index != -1) {
            if (userList[index].status == "not-ready") {
                if (userList[index].color) {
                    console.log("Now ready.")
                    socket.emit('player-ready', index);
                    $('#buttonReady').removeClass('btn-danger').addClass('btn-success');
                } else {
                    createPopup("You must choose a color before!", 500, 50);
                }
            } else if (userList[index].status == "ready") {
                console.log("Now not ready.")
                socket.emit('player-not-ready', index);
                $('#buttonReady').removeClass('btn-success').addClass('btn-danger');
            }
        }
    });

    $('#buttonStart').click(() => {
        console.log("Starting a new game");
        setupGame();
    });
};

const setCarousel = () => {

    initCarousel();

    $('#prev-stage').click(() => {
        $('#carouselStage').carousel('prev');
        $('#carouselStage').carousel('pause');
        stageSelected = $('#carouselStage').find('.active').attr('data-stage');
        socket.emit("update-stage", stageSelected);
    });
    $('#next-stage').click(() => {
        $('#carouselAvatar').carousel();
        $('#carouselStage').carousel('next');
        $('#carouselStage').carousel('pause');
        stageSelected = $('#carouselStage').find('.active').attr('data-stage');
        socket.emit("update-stage", stageSelected);
    });
};

const initCarousel = () => {
    if (host == userNickname) {
        $('#carouselStage').carousel();
        $('#prev-stage').show();
        $('#next-stage').show();
        $('#carouselStage').carousel('pause');
    } else {
        $('#prev-stage').hide();
        $('#next-stage').hide();
    }
};

const setPlaceButtons = () => {
    for (let i in userList) {
        if (userList[i].color)
            $('#cardPlaceSelector [data-color="' + userList[i].color + '"]').css('visibility', 'hidden');
    }
};

const setSettingsButtons = () => {
    if (userId != 0)
        $('.settingButton').css('visibility', 'hidden');
};
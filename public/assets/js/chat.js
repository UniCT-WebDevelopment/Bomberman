var sendMsg, receiveMsg, serviceMessage;

$('document').ready(() => {
    $('#btn-input').on('click', function () {
        if (game) {
            game.input.keyboard.enabled = false;
        }
    });
    $('#btn-input').on('focusout', function () {
        if (game) {
            game.input.keyboard.enabled = true;
        }
    });
    (function () {
        $(function () {
            var getMessageText, message_side;
            getMessageText = function () {
                var $message_input;
                $message_input = $('#btn-input');
                return $message_input.val();
            };
            sendMsg = function (text) {
                const $message = $('\
                    <li class="left clearfix">\
                        <span class="chat-img pull-left">\
                            <img src="/public/assets/img/avatar/avatar_'+ avatar + '.png" alt="User Avatar" class="rounded-circle">\
                        </span>\
                        <div class="chat-body clearfix">\
                            <div class="header">\
                                <strong class="pull-right primary-font">You</strong>\
                                <small class=" text-muted"><span class="fa fa-clock-o fa-1"></span> '+ getNow() + '</small>\
                            </div>\
                            <p>'+ text + '</p>\
                        </div>\
                    </li>');

                var $messages;
                if (text.trim() === '') {
                    return;
                }
                $('#btn-input').val('');
                $messages = $('.messages');
                socket.emit("send_message", text);
                $message.appendTo('.chat_messages');
                return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
            };
            receiveMsg = function (user, text, avatarUser) {
                const $message = $('\
                    <li class="left clearfix">\
                        <span class="chat-img pull-left">\
                            <img src="/public/assets/img/avatar/avatar_'+ avatarUser + '.png" alt="User Avatar" class="rounded-circle">\
                        </span>\
                        <div class="chat-body clearfix">\
                            <div class="header">\
                                <strong class="pull-right primary-font">'+ user + '</strong>\
                                <small class=" text-muted"><span class="fa fa-clock-o fa-1"></span> '+ getNow() + '</small>\
                            </div>\
                            <p>'+ text + '</p>\
                        </div>\
                    </li>');
                var $messages;
                if (text.trim() === '') {
                    return;
                }
                $messages = $('.messages');
                $message.appendTo('.chat_messages');

                var unread = parseInt($('#unread-messages').text()) + 1;
                $('#unread-messages').html(unread);
                return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
            };

            serviceMessage = function (text) {
                const $message = $('\
                    <li class="clearfix">\
                        <div class="chat-body clearfix">\
                            <div class="header">\
                                <small class=" text-muted"><span class="fa fa-clock-o fa-1"></span> '+ getNow() + '</small>\
                            </div>\
                            <p><strong>'+ text + '<strong></p>\
                        </div>\
                    </li>');
                var $messages;
                if (text.trim() === '') {
                    return;
                }
                $messages = $('.messages');
                $message.appendTo('.chat_messages');

                var unread = parseInt($('#unread-messages').text()) + 1;
                $('#unread-messages').html(unread);
                return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
            };

            $('.send_message').click(function (e) {
                return sendMsg(getMessageText());
            });
            $('.message_input').keyup(function (e) {
                if (e.which === 13) {
                    return sendMsg(getMessageText());
                }
            });
        });
    }.call(this));


    function getNow() {
        var today = new Date();
        let hh = today.getHours();
        if (("" + hh).length == 1)
            hh = "0" + hh;
        let mm = today.getMinutes();
        if (("" + mm).length == 1)
            mm = "0" + mm;
        let ss = today.getSeconds();
        if (("" + ss).length == 1)
            ss = "0" + ss;
        return hh + ':' + mm + ':' + ss;
    }
});
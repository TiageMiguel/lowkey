//#region Core Inicialization
const socket = io('http://localhost');

let joinRooms = new Array();
$('#conversations-all-chats li a').each((index, element) => joinRooms.push($(element).attr('chat-value')));

socket.emit('onConnect', { userCredential, sessionID, userName, tokens: joinRooms });
if (originalStatus !== 0) socket.emit('status', { status: originalStatus, name: userName });

registerRTCRooms = (tokens, userName) => socket.emit('join', { tokens, userName });
registerRTCRoom  = (token)  => socket.emit('join', { tokens: [token] });
//#endregion
//#region Core - RTC Ping
let pingTimer = Date.now();
getCurrentRTCLatency = () => {
    pingTimer = Date.now();
    socket.emit('latency');
}
socket.on('latency', () => {
    const latency = Date.now() - pingTimer;
    $('#ping').attr('data-tooltip', `${latency} ms!`);
});
setTimeout(() => getCurrentRTCLatency(), 1000);

//#endregion
//#region Core - RTC Status
registerRTCStatus = (el) => {
    const statie = ['offline', 'online', 'idle', 'disturbe']
    const status = $(el).attr('status-value');
    $('#status-dropdown li a').each((key, value) => $(value).removeClass());
    $(el).addClass('remove click dark darken-3');
    $('img.profile.status').removeClass('online idle disturbe offline');
    $('img.profile.status').addClass(statie[status != 0 ? status : 0]);
    socket.emit('status', { status, name: userName });
}
socket.on('status', (data) => {
    const { name, status } = data;
    //if (name !== userName) //SendNotification(`${name} está agora ${status}`, 'people');
});

//#endregion

//#region Friends - RTC Pending
registerRTCFriendsRequest = async (room, friend, name, ian, photo) => {
    await registerRTCRoom(room);
    await socket.emit('friends-pending', { room, friend, name, ian, photo });
}
socket.on('friends-pending', async (data) => {
    const { room, name, ian, photo } = data;
    await registerRTCRoom(room);
    SendNotification(`Recebeu um pedido de amizade de: ${ name }`);
    let counter = parseInt($('#friends-pending-counter').attr('counter'));
    $('#friends-pending-counter').remove();
    $('#myfriends-pending').append(`<span id='friends-pending-counter' class="white black-text new badge pending right" counter="${counter + 1}" data-badge-caption="pedido(s)">${counter + 1}</span>`);
    if ($('#NoPendingFriends').length != 0) {
        $('#NoPendingFriends').addClass('hide');
    }
    $('#friends-pending ul.collection')
        .append(`<li class="collection-item avatar hoverable" friend-value="${ room }" friend-name="${ name }" friend-ian="${ ian }">
                <img src="/static/uploads/${ photo }" class="circle">
                <span class="title">${ name }</span>
                <p>${ian}</p>
                <a class="secondary-content">
                    <div class="secondary-content right">
                        <a class="btn-flat rounded pointer pending-hover right" onclick="FriendsAcceptFriendRequest(this);">
                            <i class="material-icons-outlined">done</i>
                        </a>
                        <a class="btn-flat rounded pointer pending-hover right" onclick="FriendsRejectFriendRequest(this);">
                            <i class="material-icons-outlined">close</i>
                        </a>
                    </div>
                </a>
            </li>`
        );
});
//#endregion
//#region Friends - RTC Remove
registerRTCFriendsRemoval = async (room, name) => await socket.emit('friend-remove', { room, name });
socket.on('friend-remove', async (data) => {
    const { room, name } = data;
    console.log(data);
    let friendName = '';
    $('li').each((index, value) => {
        if ($(value).attr('friend-value') == room) {
            friendName = $(value).children('span').text();
            $(value).remove();
        }
    });
    $('.modal').each((index, value) => {
        if ($(value).attr('friend-modal') == room) {
            $(value).modal('close').remove();
        }
    });
    $('#conversations-all-chats').each((i, els) => {
        const xyz = $(els).find('a').attr('chat-value');
        console.log(xyz, room);
        if (xyz == room) $(els).remove();
    });
    let counter = parseInt($('#friends-all-counter').attr('counter'));
    $('#friends-all-counter').remove();
    $('#myfriends-all').append(`<span id='friends-all-counter' class="white black-text new badge pending right" counter="${counter - 1}" data-badge-caption="pedido(s)">${counter - 1}</span>`);
    if (name == userName) SendNotification(`${friendName} foi removido da sua lista de amigos`);
    else SendNotification(`${name} removeu-te dos amigos!`, 'sentiment_very_dissatisfied');

});
//#endregion
//#region Friends - RTC Accept
registerRTCFriendsAccepted = async (data) => await socket.emit('friends-accept', data);
socket.on('friends-accept', async (data) => {
    const { token } = data;
    let { name, ian, photo } = data;
    if (name == userName) {
        $('#friends-pending ul li').each((index, value) => {
            if ($(value).attr('friend-value') == token) {
                name = $(value).children('span').text();
                ian = $(value).children('p').text();
                photo = $(value).children('img').attr('src');
                $(value).remove();
            }
        });
    }
    $('#NoAllFriends').addClass('hide');
    $('#conversations-all-chats').append(`
    <li class="collection-item avatar z-depth-4">
        <div class="status-badge online"></div>
        <img src="/static/uploads/${photo}" alt="" class="circle">
        <span class="title">${name}</span>
        <p>@${ian}</p>
        <a chat-value="${token}" class="secondary-content pointer">
            <i class="material-icons-outlined conversation-friend tooltipped" data-position="bottom" data-tooltip="Conversar">chat_bubble_outline</i>
        </a>
    </li>
`);
    $('#friends-all ul').append(`<li friend-value="${token}" class="collection-item avatar">
        <img src="${photo}" class="circle">
        <span class="title">${name}</span>
        <p>@${ian}</p>
        <a chat-value="${token}" href="#modal-${token}" class="secondary-content modal-trigger">
            <i class="material-icons">more_horiz</i>
        </a>
    </li>
    <div id="modal-${token}" friend-modal="${token}" class="modal dark darken-3 bottom-sheet">
        <div class="modal-content container">
            <div class="modal-header center"><br>
                <h4 class="title white-text">Perfil de: ${name}</h4>
                <span class="grey-text lighten-1">@${ian}</span>
            </div>
            <br><br><br><br>
            <div class="container center">
                <div class="row">
                    <div class="col s12 m4 l4">
                        <a friend="${token}" class="btn-flat rounded bold outline-primary primary-text center">
                            <i class="material-icons-outlined left">chat</i>
                            conversar
                        </a>
                        <br><br>
                    </div>
                    <div class="col s12 m4 l4">
                        <a friend="${token}" friend-name="${name}" class="btn-flat outline error rounded bold error-text center">
                            <i class="material-icons-outlined left">block</i>
                            Bloquear
                        </a>
                        <br><br>
                    </div>
                    <div class="col s12 m4 l4">
                        <a friend="${token}" friend-name="${name}" class="btn-flat error rounded bold white-text center" onclick="FriendsRemoveFriend(this);">
                            <i class="material-icons-outlined left">lock_open</i>
                            remover
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>`);
    $('#no-friends').remove();
    $('.modal').modal();
    let counter = parseInt($('#friends-all-counter').attr('counter'));
    if (name !== userName) {
        SendNotification(`${name} aceitou o teu pedido de amizade`);
        let counterp = parseInt($('#friends-pending-counter').attr('counter'));
        $('#friends-pending-counter').remove();
        $('#myfriends-pending').append(`<span id='friends-pending-counter' class="white black-text new badge pending right" counter="${counterp - 1}" data-badge-caption="pedido(s)">${counterp - 1}</span>`);
    }
    $('#friends-all-counter').remove();
    $('#myfriends-all').append(`<span id='friends-all-counter' class="white black-text new badge pending right" counter="${counter + 1}" data-badge-caption="amigo(s)">${counter + 1}</span>`);
});
//#endregion
//#region Friends - RTC Block

//#endregion

//#region Chat - RTC Solo
registerSoloFileUpload = (fileinfo, message) => {
    const { source, original } = fileinfo;
    console.log(fileinfo);
    const room = currentChatToken;
    const name = userName;

    socket.emit('dm', { message, room, name, source, original });

    nonImage = true;
    
    const extension = source.split('.')[1];
    let preview = '';
    if (extension === 'png' || extension === 'jpg' || extension === 'gif' || extension === 'jpeg') preview = `<div class="container large"><img class="rounded responsive-img chat-link-preview" style="width: -webkit-fill-available;" src="/static/uploads/${source}"></div>`;
    else {
        nonImage = false;
        preview = `<div class="chat-file container">
                    <div class="card">
                    <div class="card-content white-text">
                    <span class="card-title">${original}</span>
                    <p>Ficheiro enviado por: ${name}</p>
                    </div>
                    <div class="card-action">
                    <a class="primary-text" href="/static/uploads/${source}" target="_blank">VER ONLINE</a>
                    <a class="primary-text" href="/static/uploads/${source}" download>DESCARREGAR</a>
                    </div>

                    </div>
                    </div>`;
    }
    if (nonImage) $('#messages').append($(`
        <div class="chat-message outline-dark-darken-2 coalesce right">
            ${preview}
        <div>
    `));
    else $('#messages').append($(`${preview}`));
}
registerSendSoloMessage = () => {
    const message = $('#input-chat-message')[0].emojioneArea.getText();

    if (message.length > 0) {
        const room = currentChatToken;
        const data = {
            message,
            room,
            name: userName,
        }

        socket.emit('dm', data);
        GenerateMessage(emojione.shortnameToImage(message), results => {
            let myself = 'right';
            let valign = 'valign-wrapper';
            let preview = '';
            let isFile = false;
            let nonImage = true;
            if (typeof results.preview !== 'undefined') {
                valign = '';
                preview = `
                    <div class="chat-image">
                        <blockquote style="border-left: 5px solid #0e0e0e !important;">
                            <a target="_blank" href="${results.link}" class="white-text"><span class="left bold">${results.preview.title}</span></a>
                            <span class="left">${results.preview.description}</span><br>
                            <img class="responsive-img rounded chat-link-preview" src="${results.preview.image}">
                        </blockquote>
                    </div>`;
            }
            if (typeof results.img !== 'undefined') { isFile = true; valign = ''; preview = `<div class="container large"><img class="responsive-img rounded chat-link-preview" style="width: -webkit-fill-available;" src="${results.img}"></div>`; }
            else $('#messages').append($(`
                <div class="chat-message outline-dark-darken-2 coalesce ${myself} ${valign}">
                    <span class="left">${results.message}</span>
                    ${preview}
                </div>
            `));
        });
        $('.emojionearea-editor').empty();
        $('#input-chat-message')[0].emojioneArea.setText('');
        ChatToBottom();
    }
}
$('#chat-message').submit(event => {
    event.preventDefault();
    registerSendSoloMessage();
});
socket.on('dm', data => {
    if (data.room == currentChatToken) {

        console.log(data);

        GenerateMessage(emojione.shortnameToImage(data.message), results => {
            console.log(results);
            let valign = 'valign-wrapper';
            let preview = '';
            let isFile = false;
            let nonImage = true;
            if (typeof results.preview !== 'undefined') {
                valign = '';
                preview = `
                    <div class="chat-image">
                        <blockquote style="border-left: 5px solid #0e0e0e !important;">
                            <a target="_blank" href="${results.link}" class="white-text"><span class="left bold">${results.preview.title}</span></a>
                            <span class="left">${results.preview.description}</span>
                            <img class="responsive-img chat-link-preview" src="${results.preview.image}">
                        </blockquote>
                    </div>`;
            }
            if (typeof results.img !== 'undefined') { valign = ''; preview = `<div class="container"><img class="responsive-img chat-link-preview" style="width: -webkit-fill-available;" src="${results.img}"></div>`;}
            if (data.source) {
                isFile = true;
                nonImage = false;
                let fileUserName = data.name;
                const extension = data.source.split('.')[1];
                valign = '';
                if (extension === 'png' || extension === 'jpg' || extension === 'gif' || extension === 'jpeg') 
                    preview = `<div class="container large"><img class="rounded responsive-img chat-link-preview" style="width: -webkit-fill-available;" src="/static/uploads/${data.source}"></div>`;
                else preview = `<div class="chat-file container">
                <div class="card">
                   <div class="card-content white-text">
                        <span class="card-title">${data.original}</span>
                        <p>Ficheiro enviado por: ${fileUserName}</p>
                        </div>
                        <div class="card-action">
                        <a class="primary-text" href="/static/uploads/${data.source}" target="_blank">VER ONLINE</a>
                        <a class="primary-text" href="/static/uploads/${data.source}" download>DESCARREGAR</a>
                        </div>

                </div>
            </div>`;
            }
            if (isFile) {
                if (nonImage) $('#messages').append($(`
                    <div class="chat-message outline-dark-darken-2 coalesce ${valign}">
                        ${preview}
                    <div>
                `));
                else $('#messages').append($(`${preview}`));
            }
            else $('#messages').append($(`
                <div class="chat-message outline-dark-darken-2 coalesce black ${valign}">
                    <span class="left">${results.message}</span>
                    ${preview}
                </div>
            `));
        });
        ChatToBottom();
    } else SendMessage(`${data.name} enviou-te uma mensagem...`);
});

//#endregion
//#region Chat - RTC Typing
    let isTyping = null;
    registerRTCChatTyping = (key) => key.keyCode === 13 ? registerSendSoloMessage() : socket.emit('typing', { name: userName, room: currentChatToken });
    
    socket.on('typing', (data) => {
        const { name, room } = data;
        if (room == currentChatToken && name !== userName) {
            clearTimeout(isTyping);
            $('#isTyping').empty();
            $('#isTyping').text(`${name} está a escrever...`);
            isTyping = setTimeout(() =>  $('#isTyping').empty().html('<br>'), 1200);
        }
    });

//#endregion
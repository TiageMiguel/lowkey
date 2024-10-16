let currentChatToken = null

$(() => {
  //#region Inicialization
  $('.fixed-action-btn').floatingActionButton()
  $('.dropdown-trigger').dropdown()
  $('.materialboxed').materialbox()
  $('.tooltipped').tooltip()
  $('.modal').modal()
  $('.tabs').tabs()
  $('.sidenav').sidenav()
  $('#input-chat-message').emojioneArea({
    placeholder: 'Escreva a sua mensagem...',
    search: false,
    attributes: {
      spellcheck: true,
      autocomplete: 'on',
    },
    hidePickerOnBlur: false,
    saveEmojisAs: 'shortname',
    inline: true,
    events: {
      keyup: (editor, event) => registerRTCChatTyping(event),
    },
  })
  $('#sendfile-message').emojioneArea({
    placeholder: 'Insira uma mensagem adicional (opcional)',
    search: false,
    attributes: {
      spellcheck: true,
      autocomplete: 'on',
    },
    hidePickerOnBlur: false,
    saveEmojisAs: 'shortname',
    inline: true,
  })

  // $('*').contextmenu((event) => event.preventDefault());

  //#endregion
  //#region Forms Handlers

  // Profile
  $('#form-update-profile').submit((event) => updateProfile(event))
  $('#update-profile-reset').click(() => updateProfileReset())

  // Security
  $('#form-security').submit((event) => updateSecurity(event))
  $('#update-security-clear').click(() => updateSecurityClearErrors())
  $('#twofa-activate-form').submit((event) => ActivateTwoFA(event))
  $('#twofa-desactivate-form').submit((event) => DesactivateTwoFA(event))

  // Friends
  $('#addfriend-form').submit((event) => FriendsAdd(event))
  $('#addfriend-goback').click(() => $('#friend-add-modal').modal('close'))
  $('#friend-add-modal').modal({
    onOpenStart: () => {
      $('#addfriend-name + label').removeClass('active')
      $('#addfriend-name').removeClass('error')
      $('#addfriend-name-info').empty()
      $('#addfriend-name').val('')
      setTimeout(() => $('#addfriend-name').focus(), 200)
    },
  })
  // Conversations
  $('#form-sendfile').submit((event) => ConversationUploadFile(event))
  //#endregion
  //#region Navigation Switcher
  $('#myAccount, #mySecurity, #changeLogs').click((event) => {
    $('#myAccount, #mySecurity, #changeLogs').parent().removeClass('active')
    $('#myAccount, #mySecurity, #changeLogs').each((index, element) =>
      $('#' + $(element).attr('dataTarget')).addClass('hide')
    )
    $(event.target).parent().addClass('active')
    $('#' + $(event.target).attr('dataTarget')).removeClass('hide')
  })
  $(
    '#myfriends-all, #myfriends-online, #myfriends-pending, #myfriends-blocked'
  ).click((event) => {
    $(
      '#myfriends-all, #myfriends-online, #myfriends-pending, #myfriends-blocked'
    )
      .parent()
      .removeClass('active')
    $(
      '#myfriends-all, #myfriends-online, #myfriends-pending, #myfriends-blocked'
    ).each((index, element) =>
      $('#' + $(element).attr('dataTarget')).addClass('hide')
    )
    $(event.target).parent().addClass('active')
    $('#' + $(event.target).attr('dataTarget')).removeClass('hide')
  })
  $('#btn-homepage, #btn-conversations, #btn-settings').click((event) => {
    $('#btn-homepage, #btn-conversations, #btn-settings')
      .parent()
      .removeClass('active')
    $('#btn-homepage, #btn-conversations, #btn-settings').each(
      (index, element) =>
        $('#' + $(element).attr('dataTarget')).addClass('hide')
    )
    $(event.target).parent().addClass('active')
    $('#' + $(event.target).attr('dataTarget')).removeClass('hide')
  })
  $('.conversation-friend').click((event) => {
    const token = $(event.target).parent().attr('chat-value')
    $('#conversations-all-chats li').each((index, element) =>
      $(element).removeClass('active-chat')
    )
    $('#conversations-all-chats li a').each((index, element) =>
      $(element).removeClass('hide')
    )
    $(event.target).parent().parent().addClass('active-chat')
    $(event.target).parent().addClass('hide')
    const name = $($(event.target).parent().parent()).find('span').text()
    const ian = $($(event.target).parent().parent()).find('p').text()
    ConversationLoadMessages(token, name, ian)
  })
  //#endregion
})

setup = () => {
  noCanvas()

  //#region Profile - Update

  updateProfileCardinal = (status = false) => {
    const name = $('#update-profile-name').attr('value')
    const newName = $('#update-profile-name').val()
    const ian = $('#update-profile-ian').attr('value')
    const newIan = $('#update-profile-ian').val()
    const email = $('#update-profile-email').attr('value')
    const newEmail = $('#update-profile-email').val()
    const photo = $('#update-profile-image').attr('value')
    const newPhoto = $('#update-profile-image').attr('src')

    if (
      (name !== newName && newName.length >= 3) ||
      (ian !== newIan && newIan.length >= 3) ||
      (email !== newEmail && newEmail.length >= 3) ||
      photo !== newPhoto
    )
      status = true

    return status
      ? $('#update-profile-submit').removeClass('disabled')
      : $('#update-profile-submit').addClass('disabled')
  }

  updateProfilePicturePreview = (input) => {
    if (input.files && input.files[0]) {
      var reader = new FileReader()
      reader.onload = (event) => {
        $('#update-profile-image').attr('src', event.target.result)
        updateProfileCardinal()
      }
      reader.readAsDataURL(input.files[0])
    }
  }

  updateProfileReset = () => {
    $('#update-profile-name').val($('#update-profile-name').attr('value'))
    $('#update-profile-ian').val($('#update-profile-ian').attr('value'))
    $('#update-profile-email').val($('#update-profile-email').attr('value'))
    $('#update-profile-image').attr(
      'src',
      $('#update-profile-image').attr('value')
    )
    $('#update-profile-picture-input')[0].files = null
    updateProfileCardinal()
  }

  updateProfile = (event) => {
    event.preventDefault()
    let data = new FormData()

    data.append('avatar', $('#update-profile-picture-input')[0].files[0])
    data.append('name', $('#update-profile-name').val())
    data.append('ian', $('#update-profile-ian').val())
    data.append('email', $('#update-profile-email').val())

    $.ajax({
      url: '/api/profile/update/account',
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      method: 'POST',
      success: (data) => updateProfileHandler(data),
    })
    return false
  }
  updateProfileHandler = (data) => {
    if (data.database) HandleDatabaseError()
    if (data.error) updateProfileErrorHandler(data.error)
    if (data.success) updateProfileSuccessHandler()
  }
  updateProfileErrorHandler = (err) => {
    if (err == 1)
      HandleInputError(
        '#update-profile-ian',
        '#update-profile-ian-info',
        'Esse Nome de Utilizador já está em uso!'
      )
    if (err == 2)
      HandleInputError(
        '#update-profile-email',
        '#update-profile-email-info',
        'Esse Endereço Eletrónico já está em uso!'
      )
  }
  updateProfileSuccessHandler = () => {
    SendNotification('Definições de perfil atualizadas com sucesso!')
    $('#update-profile-submit').addClass('disabled')
    $('#update-profile-name').attr('value', $('#update-profile-name').val())
    $('#update-profile-ian').attr('value', $('#update-profile-ian').val())
    $('#update-profile-email').attr('value', $('#update-profile-email').val())
    $('#update-profile-image').attr(
      'value',
      $('#update-profile-image').attr('src')
    )
    updateProfileReset()
  }

  //#endregion
  //#region Profile - Security - Twofa

  GenerateTwoFA = async (input, password) => {
    await httpPost('/api/profile/update/twofa', 'json', { password }, (res) => {
      if (res.database) HandleDatabaseError()
      if (res.error)
        HandleInputError(
          input,
          input + '-info',
          'A palavra-pass está incorreta!'
        )
      if (res.success) HandleTwoFASuccess(res.success)
    })
  }
  HandleTwoFASuccess = (data) => {
    $('#desactivate-twofa-modal').modal('close')
    $('#activate-twofa-modal').modal('close')
    $('#twofa-info').empty()
    $('#protected-account').empty()
    if (data == 'activated') {
      $('#twofa-modal-btn').removeClass('primary pulse')
      $('#twofa-modal-btn')
        .addClass('error')
        .attr('href', '#desactivate-twofa-modal')
      $('#twofa-modal-btn').text('DESATIVAR 2FA')
      $('#protected-account').append('A sua conta está protegida!')
      $('#twofa-info').append(
        '<div class="bold">CONTA PROTEGIDA</div> <i class="material-icons-outlined left">verified_user</i>Segundo Fator de Autenticação está Ativo'
      )
      SendNotification(
        'Segundo Fator de Autenticação Ativado',
        'dark darken-3',
        10
      )
    } else {
      $('#twofa-modal-btn').removeClass('error')
      $('#twofa-modal-btn')
        .addClass('primary pulse')
        .attr('href', '#activate-twofa-modal')
      $('#twofa-modal-btn').text('ATIVAR 2FA')
      $('#protected-account').append(
        'Para ter a sua conta mais protegida, ative o Segundo Fator de Autenticação (2FA)'
      )
      $('#twofa-info').append(
        'Protege a tua Conta Lowkey com uma camada extra de segurança. Depois de ativo, sempre que iniciares sessão vai ser te pedido um código de autenticação que será enviado para o seu endereço eletrónico.'
      )
      SendNotification(
        'Segundo Fator de Autenticação Desativado',
        'dark darken-3',
        10
      )
    }
  }

  //#endregion
  //#region Profile - Security - TwoFA - Activate

  ActivateTwoFA = (event) => {
    event.preventDefault()
    if (TwoFAActivateCardinal('#twofa-activate-password')) {
      const password = $('#twofa-activate-password').val()
      $('#twofa-activate-submit').addClass('disabled')
      GenerateTwoFA('#twofa-activate-password', password)
    }
  }

  TwoFAActivateCardinal = (input, status = true) => {
    const data = $(input).val().length
    if (data < 5) status = false
    status
      ? $('#twofa-activate-submit').removeClass('disabled')
      : $('#twofa-activate-submit').addClass('disabled')
    return status
  }

  //#endregion
  //#region Profile - Security - TwoFA - Desactivate
  DesactivateTwoFA = (event) => {
    event.preventDefault()
    if (TwoFADesactivateCardinal('#twofa-desactivate-password')) {
      const password = $('#twofa-desactivate-password').val()
      $('#twofa-desactivate-submit').addClass('disabled')
      GenerateTwoFA('#twofa-desactivate-password', password)
    }
  }
  TwoFADesactivateCardinal = (input, status = true) => {
    const data = $(input).val().length
    if (data < 5) status = false
    status
      ? $('#twofa-desactivate-submit').removeClass('disabled')
      : $('#twofa-desactivate-submit').addClass('disabled')
    return status
  }
  //#endregion
  //#region Profile - Security
  updateSecurity = (event) => {
    event.preventDefault()

    const currentPassword = $('#update-security-current').val()
    const newPassword = $('#update-security-new').val()

    if (updateSecurityCardinal()) {
      const data = { currentPassword, newPassword }
      $('#update-security-submit').addClass('disabled')
      httpPost('/api/profile/update/security', 'json', data, (res) => {
        updateSecurityClearErrors()
        if (res.database) HandleDatabaseError()
        if (res.error) HandleUpdateSecurityErrrors(res.error)
        if (res.success) updateSecuritySuccess()
      })
    }
  }
  HandleUpdateSecurityErrrors = (err) => {
    if (err == 1) HandleDatabaseError()
    if (err == 2)
      HandleInputError(
        '#update-security-current',
        '#update-security-current-info',
        'A palavra-passe está incorreta!'
      )
  }
  updateSecuritySuccess = () => {
    $('#update-security-current').val('')
    $('#update-security-new').val('')
    SendNotification('Palavra-Passe alterada com successo!', '', 10)
  }
  updateSecurityClearErrors = () => {
    $('#update-security-current').removeClass('error')
    $('#update-security-new').removeClass('error')
    $('#update-security-current-info').empty()
    $('#update-security-new-info').empty()
  }
  updateSecurityCardinal = (status = true) => {
    const currentPassword = $('#update-security-current').val()
    const newPassword = $('#update-security-new').val()

    updateSecurityClearErrors()

    if (
      currentPassword === null ||
      currentPassword === undefined ||
      currentPassword.length === 0 ||
      newPassword === null ||
      newPassword === undefined ||
      newPassword.length === 0
    )
      status = false
    else {
      if (currentPassword.length < 5 || newPassword.length < 5) status = false
      if (currentPassword.length > 100 || newPassword.length > 100)
        status = false
      if (currentPassword == newPassword) {
        HandleInputError(
          '#update-security-current',
          '#update-security-current-info',
          'As palavras-passe são iguais!'
        )
        HandleInputError(
          '#update-security-new',
          '#update-security-new-info',
          'As palavras-passe são iguais!'
        )
        status = false
      }
    }
    status
      ? $('#update-security-submit').removeClass('disabled')
      : $('#update-security-submit').addClass('disabled')
    return status
  }
  //#endregion

  //#region Friends - Add
  FriendsAdd = (event) => {
    event.preventDefault()
    $('#addfriend-name').removeClass('error')
    $('#addfriend-name-info').empty()
    const name = $('#addfriend-name').val()
    httpPost('/api/app/friend/add', 'json', { name }, (data) => {
      if (data.database) HandleDatabaseError()
      if (data.error) FriendsAddErrorHandler(data.error)
      if (data.success) FriendsAddSuccessHandler(name, data.success)
    })
  }
  AddFriendCardinal = (obj) => {
    let status = true
    const friend = $(obj).val()
    if (friend.length < 3) status = false
    status
      ? $('#addfriend-submit').removeClass('disabled')
      : $('#addfriend-submit').addClass('disabled')
  }
  FriendsAddErrorHandler = (err) => {
    if (err == 1)
      HandleInputError(
        '#addfriend-name',
        '#addfriend-name-info',
        'Essa Conta Lowkey não existe!'
      )
    if (err == 2)
      HandleInputError(
        '#addfriend-name',
        '#addfriend-name-info',
        'Não é possivel adicionar-te a ti mesmo aos teus contactos!'
      )
    if (err == 3)
      HandleInputError(
        '#addfriend-name',
        '#addfriend-name-info',
        'Não é possivel adicionar alguem que já está na tua lista de contactos!'
      )
  }
  FriendsAddSuccessHandler = (friendName, data) => {
    const { hash, friend } = data
    registerRTCFriendsRequest(hash, friend, userName, userIAN, userPhoto)
    $('#friend-add-modal').modal()
    $('#friend-add-modal').modal('close')
    SendNotification(`Pedido de amizade enviado a: ${friendName}`)
  }
  //#endregion
  //#region Friends - Accept
  FriendsAcceptFriendRequest = async (event) => {
    const el = $($(event).parent().parent())
    const token = el.attr('friend-value')
    const accepted = {
      el,
      token,
      name: el.attr('friend-name'),
      ian: el.attr('friend-ian'),
    }

    await httpPost('/api/app/friend/accept', 'json', { token }, (data) => {
      if (data.database) HandleDatabaseError()
      if (data.success) HandleAcceptedFriendRequest(accepted)
    })
  }
  HandleAcceptedFriendRequest = (data) => {
    const { el, token, name, ian } = data
    registerRTCFriendsAccepted({
      token,
      name: userName,
      ian: userIAN,
      photo: '/static/uploads/' + userPhoto,
    })
    SendNotification(`${name} agora faz parte dos seus amigos!`)
    $(el).remove()
    $('#NoAllFriends').addClass('hide')
    $('#friends-all ul')
      .append(`<li friend-value="${token}" class="collection-item avatar">
            <img src="/static/uploads/default.png" class="circle">
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
        </div>`)
    $('#conversations-all-chats').append(`
            <li class="collection-item avatar z-depth-4">
                <div class="status-badge online"></div>
                <img src="/static/uploads/default.png" alt="" class="circle">
                <span class="title">${name}</span>
                <p>@${ian}</p>
                <a chat-value="${token}" class="secondary-content pointer">
                    <i class="material-icons-outlined conversation-friend tooltipped" data-position="bottom" data-tooltip="Conversar">chat_bubble_outline</i>
                </a>
            </li>
        `)
    $('#no-friends').remove()
    let x = parseInt($('#friends-pending-counter').text())
    x--
    $('#friends-pending-counter').text(x)
    $('.modal').modal()
    let counter = parseInt($('#friends-all-counter').attr('counter'))
    $('#friends-all-counter').remove()
    $('#myfriends-all').append(
      `<span id='friends-all-counter' class="white black-text new badge pending right" counter="${
        counter + 1
      }" data-badge-caption="amigo(s)">${counter + 1}</span>`
    )
  }
  //#endregion
  //#region Friends - Reject
  FriendsRejectFriendRequest = async (event) => {
    const el = $($(event).parent().parent())
    const token = el.attr('friend-value')
    await httpPost('/api/app/friend/remove', 'json', { token }, (data) => {
      if (data.database) HandleDatabaseError()
      if (data.success) FriendsRejectFriendRequestSuccess(el)
    })
  }
  FriendsRejectFriendRequestSuccess = (el) => {
    el.remove()
    SendNotification('Pedido de Amizade Removido')
    let counter = parseInt($('#friends-pending-counter').attr('counter'))
    $('#friends-pending-counter').attr('counter', counter - 1)
    $('#friends-pending-counter').remove()
    $('#myfriends-pending').append(
      `<span id='friends-pending-counter' class="white black-text new badge pending right" counter="${
        counter - 1
      }" data-badge-caption="pedido(s)">${counter - 1}</span>`
    )
  }
  //#endregion
  //#region Friends - Remove Friend

  FriendsRemoveFriend = async (event) => {
    const el = $(event)
    const token = el.attr('friend')
    await httpPost('/api/app/friend/remove', 'json', { token }, (data) => {
      if (data.database) HandleDatabaseError()
      if (data.success) FriendsRemoveFriendSuccess(token)
    })
  }
  FriendsRemoveFriendSuccess = (token) => {
    registerRTCFriendsRemoval(token, userName)
    let friendName = ''
    $('li').each((index, value) => {
      if ($(value).attr('friend-value') == token) {
        friendName = $(value).children('span').text()
        $(value).remove()
      }
    })
    $('.modal').each((index, value) => {
      if ($(value).attr('friend-modal') == token) {
        $(value).modal('close').remove()
      }
    })
    SendNotification(`${friendName} foi removido da sua lista de amigos`)
    $('#conversations-all-chats').each((i, els) => {
      const xyz = $(els).find('a').attr('chat-value')
      if (xyz == token) $(els).remove()
    })
    let counter = parseInt($('#friends-all-counter').attr('counter'))
    $('#friends-all-counter').remove()
    $('#myfriends-all').append(
      `<span id='friends-all-counter' class="white black-text new badge pending right" counter="${
        counter - 1
      }" data-badge-caption="pedido(s)">${counter - 1}</span>`
    )
  }

  //#endregion

  //#region Conversations - Load Messages

  ConversationLoadMessages = (token, name, ian) => {
    httpPost('/api/app/chat/mensager', 'json', { token }, (data) => {
      if (data.database) HandleDatabaseError()
      else {
        $('#messages').empty()
        currentChatToken = token
        if (data.success) {
          let messages = data.success
          console.log(messages)
          $('#messages').append('<br>')
          messages.forEach((element) => {
            GenerateMessage(
              emojione.shortnameToImage(element.MESSAGE || ''),
              (results) => {
                let myself = ''
                let friendo = 'black'
                let valign = 'valign-wrapper'
                if (element.SENDER == userCredential) {
                  myself = 'right'
                  friendo = ''
                }
                let preview = ''
                let isFile = false
                let nonImage = true
                if (typeof results.preview !== 'undefined') {
                  valign = ''
                  preview = `
                                        <div class="chat-image">
                                            <blockquote style="border-left: 5px solid #0e0e0e !important;">
                                                <a target="_blank" href="${results.link}" class="white-text"><span class="left bold">${results.preview.title}</span></a>
                                                <span class="left">${results.preview.description}</span><br>
                                                <img class="responsive-img rounded chat-link-preview" src="${results.preview.image}">
                                            </blockquote>
                                        </div>`
                }
                if (typeof results.img !== 'undefined') {
                  valign = ''
                  preview = `<div class="container large"><img class="responsive-img rounded chat-link-preview" style="width: -webkit-fill-available;" src="${results.img}"></div>`
                }
                if (element.SOURCE) {
                  isFile = true
                  nonImage = false
                  let fileUserName = name
                  if (element.SENDER == userCredential) {
                    fileUserName = userName
                  }
                  const extension = element.SOURCE.split('.')[1]
                  valign = ''
                  if (
                    extension === 'png' ||
                    extension === 'jpg' ||
                    extension === 'gif' ||
                    extension === 'jpeg'
                  )
                    preview = `<div class="container large"><img class="rounded responsive-img chat-link-preview" style="width: -webkit-fill-available;" src="/static/uploads/${element.SOURCE}"></div>`
                  else
                    preview = `<div class="chat-file container">
                                <div class="card">
                                   <div class="card-content white-text">
                                        <span class="card-title">${element.NAME}</span>
                                        <p>Ficheiro enviado por: ${fileUserName}</p>
                                        </div>
                                        <div class="card-action">
                                        <a class="primary-text" href="/static/uploads/${element.SOURCE}" target="_blank">VER ONLINE</a>
                                        <a class="primary-text" href="/static/uploads/${element.SOURCE}" download>DESCARREGAR</a>
                                        </div>
        
                                </div>
                            </div>`
                }
                if (isFile) {
                  if (nonImage)
                    $('#messages').append(
                      $(`
                                    <div class="chat-message outline-dark-darken-2 coalesce ${myself} ${valign} ${friendo}">
                                        ${preview}
                                    <div>
                                `)
                    )
                  else $('#messages').append($(`${preview}`))
                } else
                  $('#messages').append(
                    $(`
                                <div class="chat-message outline-dark-darken-2 coalesce ${myself} ${valign} ${friendo}">
                                    <span class="left">${results.message}</span>
                                    ${preview}
                                </div>
                            `)
                  )
              }
            )
          })
        } else if (data.error == 1) {
          $('#messages').append(
            '<p class="center grey-text"> --- Inicio da conversa --- </p>'
          )
        }

        $('#conversations-landing').addClass('hide')
        $('#conversations-messages').removeClass('hide')
        $('.chat-top-info h6').text(name)
        $('.chat-top-info span').text(ian)
      }
      ChatToBottom()
    })
  }
  GenerateMessage = (message, callback) => {
    const words = message.split(' ')
    let lastURL = null
    let img = null
    words.forEach((word) => {
      if (IsURL(word)) {
        lastURL = word
      }
      if (IsImage(word)) {
        lastURL = word
        img = true
      }
    })
    message = message.replace(
      lastURL,
      '<a href="' +
        lastURL +
        '" class="underline white-text">' +
        lastURL +
        '</a>'
    )
    if (lastURL) {
      if (img) {
        callback({ message, img: lastURL, link: lastURL })
      } else {
        PreviewLink(lastURL, (result) => {
          const { data } = result
          const { title, image, description } = data
          if (title && image && description)
            callback({ message, preview: data, link: lastURL })
          else callback({ message })
        })
      }
    } else callback({ message })
  }

  ChatToBottom = () => (messages.scrollTop = messages.scrollHeight)

  //#endregion
  //#region Conversations - Upload a File
  ConversationUploadFileReset = () => {
    $('#sendfile-submit').addClass('disabled')
    $('#sendfile-input')[0].files[0] = null
    $('#sendfile-message')[0].emojioneArea.setText(
      $('#input-chat-message')[0].emojioneArea.getText()
    )
  }
  ConversationUploadFileCardinal = (status = true) => {
    const file = $('#sendfile-input')[0].files[0]
    if (typeof file === 'undefined' || (file.length === 0 && file === null))
      status = false
    return status
      ? $('#sendfile-submit').removeClass('disabled')
      : $('#sendfile-submit').addClass('disabled')
  }
  ConversationUploadFile = (event) => {
    event.preventDefault()
    if (ConversationUploadFileCardinal()) {
      let data = new FormData()
      data.append('file', $('#sendfile-input')[0].files[0])
      data.append('token', currentChatToken)

      const message = $('#sendfile-message')[0].emojioneArea.getText()

      $.ajax({
        url: '/api/app/chat/upload',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        success: (data) => ConversationUploadFileHandleData(data, message),
      })
    }
  }

  ConversationUploadFileHandleData = (data, message) => {
    const { database, error, success } = data
    if (database) HandleDatabaseError()
    if (error) HandleConversationUploadFileError()
    if (success) registerSoloFileUpload(success, message)
    $('#sendfile-modal').modal('close')
  }
  HandleConversationUploadFileError = () => {
    $('#sendfile-modal').modal('close')
    SendNotification('Occoreu um erro ao enviar o ficheiro!', 'error')
  }
  //#endregion

  //#region Tenor
  sendTenorToMessage = (el) => {
    const tenorie = $(el).attr('tenor')
    const message = $('#input-chat-message').val()
    $('#input-chat-message')[0].emojioneArea.setText(`${message} ${tenorie}`)
    $('#tenor').modal('close')
  }
  //#endregion

  //#region Generic Methods

  Logout = () =>
    httpPost('/api/oauth/logout', 'json', (res) => (location.href = '/'))
  distLogout = () =>
    httpPost(
      '/api/oauth/logout',
      'json',
      (res) => (location.href = '/build-dist')
    )

  HandleDatabaseError = () =>
    SendNotification('Não foi possivel ligar á base de dados!')
  HandleInputError = (el, info, err) => {
    $(el).addClass('error')
    $(info).html('<i class="material-icons inline-icon tiny">error</i> ' + err)
  }
  SendNotification = (
    html,
    icon = 'notifications_none',
    classes = '',
    duration = 9
  ) =>
    M.toast({
      html: `<a class="left valign-wrapper"><i class="material-icons white-text">${icon}</i></a><span class="valign-wrapper">   ${html}</span><button class="btn-flat toast-action red-text" onclick="ClearNotification(this);"><i class="material-icons">close</i></button>`,
      classes: 'rounded z-depth-5 ' + classes,
      displayLength: duration * 1000,
    })
  ClearNotification = (el) => M.Toast.getInstance($($(el).parent())).dismiss()
  IsURL = (str) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ) // fragment locator
    return !!pattern.test(str)
  }
  IsImage = (str) => {
    const pattern = new RegExp('^(https?|ftp)://.*(jpeg|png|gif|bmp)')
    return !!pattern.test(str)
  }
  PreviewLink = (url, callback) =>
    httpPost('/api/app/chat/linkpreview', 'json', { url }, (data) => {
      if (data.error) return callback(null)
      return callback(data)
    })
  //#endregion

  //#region Entity Fix
  $('#sendfile-modal').modal({
    onOpenStart: ConversationUploadFileReset(),
  })
  //#endregion
}

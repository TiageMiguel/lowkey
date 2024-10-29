let client = null

$(() => {
  //#region Inicialization
  $('.modal').modal()
  $('#twofa-code').characterCounter()
  $('#login-name').focus()
  //#endregion
  //#region Authentication - Form Handlers
  $('#login-form').submit((event) => {
    event.preventDefault()
    sendLoginInfo()
  })
  $('#twofa-form').submit((event) => {
    event.preventDefault()
    sendTwoFA()
  })
  $('#forgotpassword-form').submit((event) => {
    event.preventDefault()
    sendForgotPassword()
  })
  $('#login-goforgotpassword').click(() => {
    $('#forgotpassword-name').val('')
    $('#forgotpassword-btn').addClass('disabled')
    $('#forgotpassword-modal').modal('open')
    setTimeout(() => $('#forgotpassword-name').focus(), 100)
  })
  $('#login-goregister').click(() => {
    $('#login-content').addClass('hide')
    $('#register-content').removeClass('hide')
    setTimeout(() => $('#register-name').focus(), 100)
  })
  $('#register-form').submit((event) => {
    event.preventDefault()
    sendData()
  })
  $('#register-gologin').click(() => {
    $('#login-content').removeClass('hide')
    $('#register-content').addClass('hide')
    $(
      '#register-name, #register-ian, #register-email, #register-password, #register-cpassword, #login-name, #login-password'
    ).val('')
    setTimeout(() => $('#login-name').focus(), 100)
  })
  //#endregion
})
setup = () => {
  noCanvas()
  //#region Authentication - Login
  loginCardinal = (status = true) => {
    const ianemail = $('#login-name').val()
    const password = $('#login-password').val()
    if (ianemail === null || ianemail === undefined || ianemail.length === 0)
      status = false
    else {
      if (ianemail.length < 3) status = false
      if (ianemail.length > 100) status = false
    }
    if (password === null || password === undefined || password.length === 0)
      status = false
    else {
      if (password.length < 5) status = false
      if (password.length > 100) status = false
    }
    return status
      ? $('#login-btn').removeClass('disabled')
      : $('#login-btn').addClass('disabled')
  }
  sendLoginInfo = () => {
    let ianemail = $('#login-name').val()
    let password = $('#login-password').val()
    $('#login-name-info').html('')
    $('#login-password-info').html('')
    if (loginCardinal()) {
      httpPost('/api/oauth/signin', 'json', { ianemail, password }, (res) => {
        if (res.database) HandleDatabaseError()
        if (res.error) handleLoginErrors(res.error)
        if (res.success) handleLoginSuccess()
        if (res.twofa) handleLoginTwoFA(res.twofa)
      })
    }
  }
  handleLoginErrors = (error) => {
    if (error == 1)
      HandleInputError(
        '#login-name',
        '#login-name-info',
        'Não foi possivel encontrar a sua Conta Lowkey.'
      )
    if (error == 2)
      HandleInputError(
        '#login-password',
        '#login-password-info',
        'Palavra-passe errada. Tente novamente ou clique em Esqueci-me da palavra-passe para a repor.'
      )
    if (error == 3)
      HandleInputError(
        '#login-name',
        '#login-name-info',
        'A sua Conta Lowkey ainda não é verificada.'
      )
    $('#login-btn').addClass('disabled')
  }
  handleLoginSuccess = () => location.replace('/mensagens/build-dist')
  handleLoginTwoFA = (twofa) => {
    client = twofa
    SendNotification('O Codigo de verificação foi envido para o seu email')
    $('#twofa-code').val('')
    $('#twofa-modal').modal('open')
    setTimeout(() => $('#twofa-code').focus(), 100)
  }
  //#endregion
  //#region Authentication - Two Factor Authentication (2FA)
  twoFAcardinal = (status = true) => {
    const twofa = $('#twofa-code').val()
    if (twofa === null || twofa === undefined || twofa.length === 0)
      status = false
    if (twofa.length != 9) status = false
    return status
      ? $('#twofa-btn').removeClass('disabled')
      : $('#twofa-btn').addClass('disabled')
  }
  sendTwoFA = () => {
    const twofa = $('#twofa-code').val()
    if (twoFAcardinal()) {
      httpPost('api/oauth/twofa', 'json', { twofa, ian: client }, (res) => {
        if (res.error) handleTwoFAErrors(res.error)
        if (res.success) handleLoginSuccess()
        if (res.database) HandleDatabaseError()
      })
    }
  }
  handleTwoFAErrors = (error) => {
    if (error == 1)
      HandleInputError(
        '#twofa-code',
        '#twofa-code-info',
        'O código de verificação não coicide com a sua conta!'
      )
  }
  //#endregion
  //#region Authentication - Forgot Password
  forgotPasswordCardinal = (status = true) => {
    const ianemail = $('#forgotpassword-name').val()
    if (ianemail === null || ianemail === undefined || ianemail.length === 0)
      status = false
    else {
      if (ianemail.length < 3) status = false
      if (ianemail.length > 100) status = false
    }
    return status
      ? $('#forgotpassword-btn').removeClass('disabled')
      : $('#forgotpassword-btn').addClass('disabled')
  }
  sendForgotPassword = () => {
    const ianemail = $('#forgotpassword-name').val()
    $('#forgotpassword-name').removeClass('error')
    $('#forgotpassword-name-info').html('')
    if (forgotPasswordCardinal()) {
      httpPost('api/oauth/recover', 'json', { ianemail }, (res) => {
        if (res.database) HandleDatabaseError()
        if (res.error) HandleForgotPasswordErrors(res.error)
        if (res.success) HandleForgotPasswordSuccess(res.success)
      })
    }
  }
  HandleForgotPasswordErrors = (error) => {
    if (error == 1)
      HandleInputError(
        '#forgotpassword-name',
        '#forgotpassword-name-info',
        'Não foi possivel encontrar a sua Conta Lowkey.'
      )
    if (error == 2)
      HandleInputError(
        '#forgotpassword-name',
        '#forgotpassword-name-info',
        'A sua Conta Lowkey ainda não é verificada.'
      )
  }
  HandleForgotPasswordSuccess = (email) => {
    $('#forgotpassword-form').addClass('hide')
    $('#forgotpassword-success').removeClass('hide')
    $('#forgotpassword-success-email').text(email)
  }
  //#endregion
  //#region Authentication - Register
  registerCardinal = (status = true) => {
    const name = $('#register-name').val()
    const ian = $('#register-ian').val()
    const email = $('#register-email').val()
    const password = $('#register-password').val()
    const cpassword = $('#register-cpassword').val()
    if (name === null || name === undefined || name.length === 0) status = false
    else {
      if (name.length < 3) status = false
      if (name.length > 20) status = false
    }
    if (ian === null || ian === undefined || ian.length === 0) status = false
    else {
      if (ian.length < 3) status = false
      if (ian.length > 16) status = false
    }
    if (email === null || email === undefined || email.length === 0)
      status = false
    else {
      if (email.length < 5) status = false
      if (email.length > 100) status = false
    }
    if (password === null || password === undefined || password.length === 0)
      status = false
    else {
      if (password.length < 5) status = false
      if (password.length > 16) status = false
    }
    if (cpassword === null || cpassword === undefined || cpassword.length === 0)
      status = false
    else {
      if (cpassword.length < 5) status = false
      if (cpassword.length > 16) status = false
    }
    if (password != cpassword && password.length > 0 && cpassword.length > 0) {
      status = false
      $('#register-password-info').text('As palavras-passe não coicidem!')
    } else $('#register-password-info').text('')
    $('#register-ian-info').val('')
    $('#register-email-info').val('')
    return status
      ? $('#register-btn').removeClass('disabled')
      : $('#register-btn').addClass('disabled')
  }

  sendData = () => {
    const name = $('#register-name').val()
    const ian = $('#register-ian').val()
    const email = $('#register-email').val()
    const password = $('#register-password').val()
    const cpassword = $('#register-cpassword').val()

    $(
      '#register-ian-info, #register-email-info, #register-password-info, #register-cpassword-info'
    ).text('')

    if (registerCardinal()) {
      httpPost(
        '/api/oauth/signup',
        'json',
        { name, ian, email, password, cpassword },
        (res) => {
          if (res.database) HandleDatabaseError()
          if (res.error) handleRegisterErrors(res.error)
          if (res.success) handleRegisterSuccess(res.success)
        }
      )
    }
  }
  handleRegisterErrors = (error) => {
    if (error == 1) $('#register-email-info').text('Esse email já está em uso!')
    if (error == 2)
      $('#register-ian-info').text(
        'Esse nome de utilizador não está disponivel!'
      )
    if (error == 3)
      SendNotification('Occoreu um erro inesperado. Tente novamente!')
    $('#register-btn').addClass('disabled')
  }
  handleRegisterSuccess = (email) => {
    $('#register-gologin').click()
    $('#register-sucess-modal').modal('open')
    $('#success-email').empty()
    $('#success-email').text(email)
  }
  formVerifier = (obj, verification = true) => {
    obj.forEach((element) => {
      if (
        element.value.length == 0 ||
        element.value === null ||
        element.value === undefined
      )
        verification = false
      else {
        if (element.value.length < element.rules.min) verification = false
        if (element.value.length > element.rules.max) verification = false
      }
    })
    if (obj[3].value != obj[4].value) verification = false
    return verification
  }
  //#endregion
}
//#region Generic Methods
HandleDatabaseError = () =>
  SendNotification('Não foi possivel ligar á base de dados!')
HandleInputError = (el, info, err) => {
  $(el).addClass('error')
  $(info).html('<i class="material-icons inline-icon tiny">error</i> ' + err)
}
SendNotification = (html, classes = '', duration = 9) =>
  M.toast({
    html: `<a class="left valign-wrapper"><i class="material-icons-outlined white-text">notifications</i></a><span class="valign-wrapper">   ${html}</span><button class="btn-flat toast-action red-text" onclick="ClearNotification(this);"><i class="material-icons">close</i></button>`,
    classes: 'rounded z-depth-5 ' + classes,
    displayLength: duration * 1000,
  })
ClearNotification = (el) => M.Toast.getInstance($($(el).parent())).dismiss()
//#endregion

$(() => {
  $('.modal').modal()
  $('.sidenav').sidenav()
  $('#twofa-code').characterCounter()
  $('.open-sidenav').click(() => $('.sidenav').sidenav('open'))
  // $('*').contextmenu((event) => event.preventDefault());

  $('.register').click(() => {
    $('#registerModalFile').modal()
    $('#registerModalFile').modal('open')
    setTimeout(() => $('#register-name').focus(), 200)
  })
  $('.login').click(() => {
    $('#loginModalFile').modal()
    $('#loginModalFile').modal('open')
    $('#login-name').removeClass('error').val('')
    $('#login-password').removeClass('error').val('')
    $('#login-name-info').html('')
    $('#login-password-info').html('')
    $('#login-btn').addClass('disabled')
    setTimeout(() => $('#login-name').focus(), 200)
  })

  //Form Handlers

  //#region Login
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
  $('#login-goregister').click(() => {
    $('#registerModalFile').modal()
    $('#loginModalFile').modal()
    $('#registerModalFile').modal('open')
    $('#loginModalFile').modal('close')
    setTimeout(() => $('#register-name').focus(), 100)
  })

  $('#twofa-goback').click(() => {
    if (!$('#twofa-form').hasClass('hide')) {
      $('#twofa-form').addClass('hide')
      $('#login-form').removeClass('hide')
      $('#login-password').val('')
      $('#login-btn').addClass('disabled')
      setTimeout(() => $('#login-name').focus(), 100)
    }
  })

  $('#login-goforgotpassword').click(() => {
    if (!$('#login-form').hasClass('hide')) {
      $('#login-form').addClass('hide')
      $('#forgotpassword-form').removeClass('hide')
      $('#forgotpassword-name').val('')
      $('#forgotpassword-btn').addClass('disabled')
      setTimeout(() => $('#forgotpassword-name').focus(), 100)
    }
  })

  $('#forgotpassword-goback').click(() => {
    if (!$('#forgotpassword-form').hasClass('hide')) {
      $('#forgotpassword-form').addClass('hide')
      $('#login-form').removeClass('hide')
      $('#login-password').val('')
      $('#login-btn').addClass('disabled')
      setTimeout(() => $('#login-name').focus(), 100)
    }
  })
  //#endregion
  //#region Register
  $('#register-form').submit((event) => {
    event.preventDefault()
    sendData()
  })
  $('#register-gologin').click(() => {
    $('#loginModalFile').modal()
    $('#registerModalFile').modal()
    $('#loginModalFile').modal('open')
    $('#registerModalFile').modal('close')
    setTimeout(() => $('#login-name').focus(), 100)
  })
  //#endregion
})

setup = () => {
  noCanvas()

  //#region Register Methods
  registerCardinal = () => {
    const name = $('#register-name').val()
    const ian = $('#register-ian').val()
    const email = $('#register-email').val()
    const password = $('#register-password').val()
    const cpassword = $('#register-cpassword').val()
    const terms = $('register-terms').val()

    let status = true

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

    status
      ? $('#register-btn').removeClass('disabled')
      : $('#register-btn').addClass('disabled')

    return status
  }

  sendData = () => {
    const name = $('#register-name').val()
    const ian = $('#register-ian').val()
    const email = $('#register-email').val()
    const password = $('#register-password').val()
    const cpassword = $('#register-cpassword').val()

    $('#register-ian-info').text('')
    $('#register-email-info').text('')
    $('#register-password-info').text('')
    $('#register-cpassword-info').text('')

    if (registerCardinal()) {
      let registerData = {
        name,
        ian,
        email,
        password,
        cpassword,
      }

      httpPost('/api/oauth/signup', 'json', registerData, (res) => {
        console.log(res)
        if (res.database) handleDatabaseErrors()
        if (res.error) handleRegisterErrors(res.error)
        if (res.success) handleRegisterSuccess(res.success)
      })
    }
    return false
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
    $('#register-form').addClass('hide')
    $('#register-success').removeClass('hide')
    $('#success-email').text(email)
  }
  handleDatabaseErrors = () =>
    M.toast({
      html: 'Não foi possivel ligar á base de dados!',
      classes: 'rounded z-depth-4',
      displayLength: 6000,
    })
  formVerifier = (obj) => {
    let verification = true

    obj.forEach((element) => {
      if (
        element.value.length == 0 ||
        element.value === null ||
        element.value === undefined
      ) {
        verification = false
        //    toastNotification('É obrigatório preencher o campo: "'+ element.name +'"');
      } else {
        if (element.value.length < element.rules.min) {
          verification = false
          //      loginErrorHandler('O campo: "'+ element.name +'" não pode ter um tamanho inferior a ' + element.rules.min);
        }
        if (element.value.length > element.rules.max) {
          verification = false
          //      loginErrorHandler('O campo: "'+ element.name +'" não pode ter um tamanho superior a ' + element.rules.max);
        }
      }
    })

    if (obj[3].value != obj[4].value) {
      verification = false
      //    loginErrorHandler('As palavras-passe não coicidem');
    }

    return verification
  }

  //#endregion
  //#region Login Methods
  let client = null

  loginCardinal = () => {
    const ianemail = $('#login-name').val()
    const password = $('#login-password').val()

    let status = true

    /* TESTE   const regex_ianemail = new RegExp(/^(?=.{3,16}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/gmu);
         if (regex_ianemail.test(ianemail) === false) {
            status = false
         }
         var res = patt.test(str);*/

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

    status
      ? $('#login-btn').removeClass('disabled')
      : $('#login-btn').addClass('disabled')

    return status
  }
  sendLoginInfo = () => {
    let ianemail = $('#login-name').val()
    let password = $('#login-password').val()

    $('#login-name-info').html('')
    $('#login-password-info').html('')

    if (loginCardinal()) {
      let loginData = { ianemail, password }
      httpPost('/api/oauth/signin', 'json', loginData, (res) => {
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
  handleLoginSuccess = () => location.replace('/mensagens/')
  handleLoginTwoFA = (twofa) => {
    client = twofa
    SendNotification('O Codigo de verificação foi envido para o seu email')
    $('#login-form').addClass('hide')
    $('#twofa-form').removeClass('hide')
    $('#twofa-code').val('')
    setTimeout(() => $('#twofa-code').focus(), 100)
  }
  twoFAcardinal = () => {
    const twofa = $('#twofa-code').val()
    let status = true
    if (twofa === null || twofa === undefined || twofa.length === 0)
      status = false
    if (twofa.length != 9) status = false
    status
      ? $('#twofa-btn').removeClass('disabled')
      : $('#twofa-btn').addClass('disabled')
    return status
  }
  sendTwoFA = () => {
    const twofa = $('#twofa-code').val()
    if (twoFAcardinal()) {
      let data = { twofa, ian: client }
      httpPost('api/oauth/twofa', 'json', data, (res) => {
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

  forgotPasswordCardinal = () => {
    const ianemail = $('#forgotpassword-name').val()
    let status = true
    if (ianemail === null || ianemail === undefined || ianemail.length === 0)
      status = false
    else {
      if (ianemail.length < 3) status = false
      if (ianemail.length > 100) status = false
    }
    status
      ? $('#forgotpassword-btn').removeClass('disabled')
      : $('#forgotpassword-btn').addClass('disabled')
    return status
  }

  sendForgotPassword = () => {
    const ianemail = $('#forgotpassword-name').val()
    $('#forgotpassword-name').removeClass('error')
    $('#forgotpassword-name-info').html('')
    if (forgotPasswordCardinal()) {
      const data = { ianemail }
      httpPost('api/oauth/recover', 'json', data, (res) => {
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
        'CONTA NAO EXISTE'
      )
    if (error == 2)
      HandleInputError(
        '#forgotpassword-name',
        '#forgotpassword-name-info',
        'CONTA NAO VERIFICADA'
      )
  }
  HandleForgotPasswordSuccess = (email) => {
    $('#forgotpassword-form').addClass('hide')
    $('#forgotpassword-success').removeClass('hide')
    $('#forgotpassword-success-email').text(email)
  }
  //#endregion

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
}

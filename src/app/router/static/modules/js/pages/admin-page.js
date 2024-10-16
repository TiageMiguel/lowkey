$(() => {
  $('.sidenav').sidenav()
})

setup = () => {
  noCanvas()

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
    var pattern = new RegExp(
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
    let pattern = new RegExp('^(https?|ftp)://.*(jpeg|png|gif|bmp)')
    return !!pattern.test(str)
  }
  PreviewLink = (url, callback) =>
    httpPost('/api/app/chat/linkpreview', 'json', { url }, (data) => {
      if (data.error) return callback(null)
      return callback(data)
    })
  //#endregion
}

const metaGetter = require('metagetter')
const { getMetaData } = metaGetter

module.exports = async (req, res) => {
  const { url } = req.body

  getMetaData(url)
    .then((data) => res.json({ data }))
    .catch((err) => res.json({ error: err }))
}

const http = require('http')
const createHandler = require('github-webhook-handler')

module.exports = (secret, config)=>{
    var handler = createHandler({ path: '/webhook', secret })

    http.createServer(function (req, res) {

        handler(req, res, function (err) {
          res.statusCode = 404
          res.end('no such location')
        })
      }).listen(config.port || 7777)

      return handler
}
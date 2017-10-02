const fs = require('fs')

const Koa = require('koa');
const Router = require('koa-router');
const Static = require('koa-static-server');

const webhooks = require('./github')

// ARGS

const args = process.argv.slice(2).concat(null)
if(!args[0]) return console.error(`USAGE:
    node server.js http://..`)

const REPO = args[0]

// Server init

const app = new Koa();
const router = new Router();

const EZStatic = path => Static({
    rootDir:process.cwd()+path,
    rootPath: path,
    notFoundFile:process.cwd()+'/404.html',
})

app.use(EZStatic('/dist'));
app.use(EZStatic('/bower_components'));
app.use(EZStatic('/starter.html'));

app.use(async (ctx, next)=>{
    console.log(`${ctx.request.ip}: ${ctx.request.req.method}|${ctx.request.originalUrl} -->`)
    await next();
    console.log(`${ctx.request.ip}: ${ctx.request.req.method}|${ctx.request.originalUrl} <-- ${ctx.request.res.statusCode}`)
})

// Server routes

router.get('/', function (ctx, next) {
  ctx.body = fs.readFileSync(process.cwd()+'/starter.html').toString()
});

// Server setup
 
app
  .use(router.routes())
  .use(router.allowedMethods());

// Hooks import setup

const handler = webhooks('secret',{port:7777})
        handler.on('error', function (err) {
        console.error('Error:', err.message)
    })

handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref)
    })

app.listen(8000, ()=>{
    console.log('Listening');
})
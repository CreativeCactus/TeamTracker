const fs = require('fs')

const Koa = require('koa');
const Router = require('koa-router');
const Static = require('koa-static-server');

const hbs = require('koa-hbs');

const webhooks = require('./github')
const repoGroup = require('./repos')

// ARGS

const args = process.argv.slice(2).concat(null)
if(args[0]!=='run') {
    return console.error(`USAGE:
    SECRET="secret" GITHUB_USER="" GITHUB_TOKEN="" node server.js run ["repoUrl"] ["repoUrl"]
    
    User is the github user to act as.
    Token is generated in guthub user settings.
    Secret is to authenticate hooks. See scripts.
    Urls are in the form user/repo.`)
}

// Setup

// Pass the array of repo URLs to constructor
const REPOS = new repoGroup(...args.slice(1).filter(v=>v))

// Server init

const app = new Koa();
const router = new Router();

app.use(hbs.middleware({
    viewPath: __dirname + '/views',
    defaultLayout:'main'
  }));

const EZStatic = path => Static({
    rootDir:process.cwd()+path,
    rootPath: path,
    notFoundFile:process.cwd()+'/404.html',
})

app.use(EZStatic('/dist'));
app.use(EZStatic('/bower_components'));

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

const handler = webhooks(process.env.SECRET,{port:7777})

handler.on('error', function (err) {
    console.error('Error:', err.message)
})

handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref)
    REPOS.update(event.payload.repository.url)
})

// Server listen

app.listen(8000, ()=>{
    console.log('Listening');
})
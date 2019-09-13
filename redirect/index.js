const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();


router.get('/', ctx => {
	// Not supposed to happen with Zeit routing, but in case of...
	ctx.redirect('https://squared.codebrew.fr');
});

router.get('/github', ctx => {
	ctx.redirect('https://github.com/GitSquared');
});

router.get('/donate', ctx => {
	ctx.redirect('https://buymeacoffee.com/gaby');
});

router.get('/edex', ctx => {
	ctx.redirect('https://github.com/GitSquared/edex-ui');
});

router.get('/edex-vuln', ctx => {
	ctx.redirect('/posts/edex-injection-vuln/');
});



router.get('/*', ctx => {
	ctx.redirect('https://squared.codebrew.fr'+ctx.path);
});

app.use(async (ctx, next) => {
		const start = Date.now();
		await next();
		const ms = Date.now() - start;
		ctx.set('X-Response-Time', `${ms}ms`);
		ctx.set('Cache-Control', 's-maxage=2592000')
	}).use(router.routes())
	.use(router.allowedMethods());

module.exports = app.callback();

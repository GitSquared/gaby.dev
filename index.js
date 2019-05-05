const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();


router.get('/', ctx => {
	ctx.redirect('https://squared.codebrew.fr');
});

router.get('/github', ctx => {
	ctx.redirect('https://github.com/GitSquared');
});

router.get('/donate', ctx => {
	ctx.redirect('https://buymeacoff.ee/gaby');
});

router.get('/edex', ctx => {
	ctx.redirect('https://github.com/GitSquared/edex-ui');
});

app.use(async (ctx, next) => {
		const start = Date.now();
		await next();
		const ms = Date.now() - start;
		ctx.set('X-Response-Time', `${ms}ms`);
	}).use(router.routes())
	.use(router.allowedMethods());

module.exports = app.callback();

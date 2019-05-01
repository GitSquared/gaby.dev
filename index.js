const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();


router.get('/', ctx => {
	ctx.redirect('https://squared.codebrew.fr');
});

router.get('/donate', ctx => {
	ctx.redirect('https://buymeacoff.ee/gaby');
});

router.get('/live', ctx => {
	ctx.redirect('https://www.youtube.com/channel/UCiVqJ8VrvjqRKuPD_Hj-6bw');
});

app.use(async (ctx, next) => {
		const start = Date.now();
		await next();
		const ms = Date.now() - start;
		ctx.set('X-Response-Time', `${ms}ms`);
	}).use(router.routes())
	.use(router.allowedMethods());

module.exports = app.callback();

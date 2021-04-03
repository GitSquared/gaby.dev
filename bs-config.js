module.exports = {
	ui: false,
	notify: false,
	server: {
		baseDir: 'public'
	},
	middleware: (req, _, next) => {
		if (req.url.endsWith('/')) req.url = req.url+'index.html'
		return next()
	}
}

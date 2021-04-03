const { spawn } = require('child_process');
const chokidar = require('chokidar');

chokidar.watch('public/posts/').on('all', (_, path) => {
	if (!path.endsWith('index.md')) return
	console.log(path)
	spawn('npm', ['run', 'build'])
})

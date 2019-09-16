(async function() {
	const { log } = console;
	const rfs = require('fs');
	const ora = require('ora');
	const marked = require('marked');

	// Async helpers
	const fs = new Proxy(rfs, {
		get: function(fs, prop) {
			if (prop in fs) {
				return function(...args) {
					return new Promise((resolve, reject) => {
						fs[prop](...args, (err, d) => {
							if (typeof err !== "undefined" && err !== null) reject(err);
							if (typeof d !== "undefined") resolve(d);
							if (typeof d === "undefined" && typeof err === "undefined") resolve();
						});
					});
				}
				
			}
		},
		set: function() {
			return false;
		}
	});

	async function asyncForEach(array, callback) {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array);
		}
	}

	function wait(ms) {
		return new Promise(res => {
			setTimeout(res, ms);
		});
	}

	// Markdown renderer options
	marked.setOptions({
		highlight: code => {
			return require('highlight.js').highlightAuto(code).value;
		},
		gfm: true,
		breaks: true
	});


	// Build list of current and new posts
	let spin = ora('Building posts index...').start();

	let posts = [];

	let postsDirs = await fs.readdir('posts/', { withFileTypes: true });
	postsDirs = postsDirs.filter(e => {
		if (!e.name.startsWith('_template') && e.isDirectory()) return true;
		return false;
	});

	await asyncForEach(postsDirs, async dir => {
		let url = `/posts/${dir.name}`;
		let content = await fs.readdir(url.substr(1));

		// Detect unbuilt posts
		if (content.indexOf('index.html') === -1) {
			// Search for markdown source
			let mds = content.filter(file => {
				if (file.endsWith('.md')) return true;
				return false;
			});
			
			if (mds.length === 1) {
				// Retrieve info from markdown file
				let md = await fs.readFile(url.substr(1)+'/'+mds[0], { encoding: 'utf-8' });
				let title = /# .+\n/.exec(md)[0].substr(2).trim();
				let date = /\ndate(?:: | = )[0-9A-Z-:]+/g.exec(md);
				if (date) date = date[0].substr(6).trim();

				if (title) md = md.substring(md.indexOf("\n") + 1)
				if (date) md = md.substring(md.indexOf("\n") + 1)

				posts.push({
					title,
					date: new Date(date || Date.now()),
					url,
					unbuilt: true,
					src: md
				});
			}

			return;
		};

		// Parse index.html to retrieve date and title of existing posts
		let index = await fs.readFile(url.substr(1)+'/index.html', { encoding: 'utf-8' });
		let title = /<title>.+<\/title>/g.exec(index)[0].substr(7).slice(0, -15);
		let date = /<h4>Published .+<\/h4>/g.exec(index)[0].substr(14).slice(0, -5);
		date = new Date(date);

		posts.push({
			title,
			date,
			url,
			unbuilt: false
		});
	});

	posts.sort((a, b) => {
		// Sort posts by timestamp
		return b.date.getTime() - a.date.getTime();
	});

	spin.succeed();
	log(`\n${posts.length} posts found:\n`);
	posts.forEach((post, i) => {
		log(`${i}${(post.unbuilt) ? ' (NEW)' : ''}: ${post.date.toDateString()} - ${post.title}  (${post.url})`);
	});
	log(`\n`);

	spin = ora('Interrupt NOW if something seems wrong. Writing operations starts in 5s.').start();

	await wait(5000);


	spin.text = 'Retrieving HTML templates...';
	let postTemplate = await fs.readFile('posts/_template-post-dir/index.html', { encoding: 'utf-8' });
	let indexTemplate = await fs.readFile('posts/_template-index.html', { encoding: 'utf-8' });

	spin.text = 'Building new posts...';
	
	await asyncForEach(posts, async post => {
		if (!post.unbuilt) return;
		
		post.rendered = postTemplate;
		
		post.rendered = post.rendered.replace(/{{ TITLE }}/g, post.title);
		post.rendered = post.rendered.replace(/{{ DATE }}/g, post.date.toDateString());
		post.rendered = post.rendered.replace(/{{ POST }}/g, marked(post.src));
		post.rendered = post.rendered.replace(/{{ URL }}/g, post.url);
	});

	spin.text = 'Update link lists inside posts...';

	await asyncForEach(posts, async post => {
		if (!post.unbuilt) {
			post.rendered = await fs.readFile(post.url.substr(1)+'/index.html', { encoding: 'utf-8' });
		}

		let previousPosts = '\n<!-- POSTS_LINKS -->\n';
		await asyncForEach(posts, lpost => {
			let link = (lpost.url === post.url) ? 'disabled class="current-post"' : `href="${lpost.url}"`;
			previousPosts += `<a ${link}>
				<li>
					<h4>${lpost.date.toDateString()}</h4><br><h1>${lpost.title}</h1>
				</li>
			</a>`;
		});
		previousPosts += '\n<!-- POSTS_LINKS -->\n';

		post.rendered = post.rendered.replace(/\n<!-- POSTS_LINKS -->\n([\s\S]*)\n<!-- POSTS_LINKS -->\n/g, previousPosts);
	});

	spin.text = 'Building blog index...';

	let index = indexTemplate;
	let previousPosts = '';
	await asyncForEach(posts, post => {
		previousPosts += `<a href="${post.url}">
			<li>
				<h4>${post.date.toDateString()}</h4> - <h1>${post.title}</h1>
			</li>
		</a>`;
	});
	index = index.replace(/{{ POSTS_LINKS }}/g, previousPosts);


	spin.text = 'Writing index file...';
	fs.writeFileSync('posts/index.html', index, { encoding: 'utf-8' });

	spin.text = 'Writing posts...';
	await asyncForEach(posts, async post => {
		fs.writeFileSync(post.url.substr(1)+'/index.html', post.rendered, { encoding: 'utf-8' });
	});

	spin.text = 'All done!'
	spin.succeed();
})();

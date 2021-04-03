(async function() {
	const { log } = console;
	const fs = require('fs');
	const ora = require('ora');
	const marked = require('marked');

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

	let postsDirs = fs.readdirSync('public/posts/', { withFileTypes: true });
	postsDirs = postsDirs.filter(e => {
		if (!e.name.startsWith('.template') && e.isDirectory()) return true;
		return false;
	});

	postsDirs.forEach(dir => {
		let url = `/posts/${dir.name}`;
		let content = fs.readdirSync('public/'+url.substr(1));

		// Detect unbuilt posts
		if (content.indexOf('index.html') === -1) {
			// Search for markdown source
			let mds = content.filter(file => {
				if (file.endsWith('.md')) return true;
				return false;
			});

			if (mds.length === 1) {
				// Retrieve info from markdown file
				let md = fs.readFileSync('public/'+url.substr(1)+'/'+mds[0], { encoding: 'utf-8' });
				let title = /# .+\n/.exec(md)[0].substr(2).trim();
				let date = /\ndate: [0-9A-Z-:]+/g.exec(md);
				if (date) date = date[0].substr(6).trim();

				if (title) md = md.substring(md.indexOf("\n") + 1);
				if (date) md = md.substring(md.indexOf("\n") + 1);

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
		let index = fs.readFileSync('public/'+url.substr(1)+'/index.html', { encoding: 'utf-8' });
		let title = /<title>.+<\/title>/g.exec(index)[0].substr(7).slice(0, -22);
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

	// spin = ora('Interrupt NOW if something seems wrong. Writing operations starts in 5s.').start();
	// await wait(5000);


	spin.text = 'Retrieving HTML templates...';
	let postTemplate = fs.readFileSync('public/posts/.template-post-dir/index.html', { encoding: 'utf-8' });
	let indexTemplate = fs.readFileSync('public/posts/.template-index.html', { encoding: 'utf-8' });

	spin.text = 'Building new posts...';

	posts.forEach(post => {
		if (!post.unbuilt) return;

		post.rendered = postTemplate;

		post.rendered = post.rendered.replace(/{{ TITLE }}/g, post.title)
						.replace(/{{ DATE }}(?!\\)/g, post.date.toDateString())
						.replace(/{{ POST }}(?!\\)/g, marked(post.src))
						.replace(/{{ URL }}(?!\\)/g, post.url)
						// Remove escaper:
						.replace(/{{ DATE }}\\/g, '{{ DATE }}')
						.replace(/{{ POST }}\\/g, '{{ POST }}')
						.replace(/{{ URL }}\\/g, '{{ URL }}');
	});

	spin.text = 'Update link lists inside posts...';

	posts.forEach(post => {
		if (!post.unbuilt) {
			post.rendered = fs.readFileSync('public/'+post.url.substr(1)+'/index.html', { encoding: 'utf-8' });
		}

		let previousPosts = '\n<!-- POSTS_LINKS -->\n';
		posts.forEach(lpost => {
			let link = (lpost.url === post.url) ? 'disabled class="current-post"' : `href="${lpost.url}" target="_self"`;
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
	posts.forEach(post => {
		previousPosts += `<a href="${post.url}">
			<li>
				<h4>${post.date.toDateString()}</h4> - <h1>${post.title}</h1>
			</li>
		</a>`;
	});
	index = index.replace(/{{ POSTS_LINKS }}/g, previousPosts);


	spin.text = 'Writing index file...';
	fs.writeFileSync('public/posts/index.html', index, { encoding: 'utf-8' });

	spin.text = 'Writing posts...';
	posts.forEach(post => {
		fs.writeFileSync('public/'+post.url.substr(1)+'/index.html', post.rendered, { encoding: 'utf-8' });
	});

	spin.text = 'All done!'
	spin.succeed();
})();

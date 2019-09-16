# Writing a static blog generator

For about a year now, I have been using [Hugo](https://gohugo.io/) as a static site generator for my personal homepage.
I recently bought a new laptop, and wanted to write a new blog post last Friday but realized I hadn't installed Hugo on the new system yet. Hugo needs Ruby, and I don't do anything in Ruby, so I didn't want to bloat my so-far-still-clean install just to write some articles...

So I wrote a new blog, with a simple Node.js script to generate new posts from Markdown files.
It's nothing compared to Hugo, but it's tiny, efficient, and it took less than 2 hours of work. It's perhaps a bit hacky and may need some more polishing, but it *works*.

Here's how I made it.

---

<p align="center">
  <img src="{{ URL }}/res/demo-index.png" alt="Screenshot of what the blog looks like (Index page).">
  <br><br>
  <img src="{{ URL }}/res/demo-post.png" alt="Screenshot of what the blog looks like (A post).">
</p>

---

## Structure

The website is all static HTML/CSS, because that's really all you should have in a personal website. Static is also *very cheap* to host these days - actually, it's *free* on serverless platforms like [ZEIT Now](https://zeit.co), which I use. I hear [Netlify](https://netlify.com) has a similar offering, too.

The whole site lives in a [GitHub](https://github.com) repo, on which Now is plugged in - which means I just have to `git push` to deploy to production (and it's up in 900ms). It's also useful because it means I can host some stuff on GitHub and tell Now to ignore it for publishing: so my blog generator script is version-controlled but isn't uploaded as a part of the live website.

Here's what that repo looks likes ([see it on GH](https://github.com/GitSquared/gaby.dev/tree/1c56408ceef753a13f6d73c0ccb0b9809b57dd7a)):

```
gaby.dev
├── _tools
│  ├── node_modules
│  ├── buildPosts.js
│  ├── package-lock.json
│  └── package.json
├── posts
│  ├── _template-post-dir
│  │  ├── res
│  │  │  └── illustration.bmp
│  │  └── index.html
│  ├── (... actual posts dirs)
│  ├── _template-index.html
│  └── index.html
├── styles
│  ├── index.css
│  ├── posts.css
│  ├── posts_index.css
│  ├── syntax.css
│  └── water.css
├── .nowignore
├── .gitignore
├── build.sh
├── now.json
└── index.html
```

Each post lives inside its own directory in `posts/`, along with all the resources it needs (images, demos, etc).
Now's `.nowignore` is set to not upload the `_tools` directory - where the site generator lives - and anything starting with `_template-`.

Finally, `build.sh` is just a shortcut to access the site generator:

```bash
#!/bin/sh
node _tools/buildPosts.js
```

## Workflow

To create a new post, here's what I do:
 - Make a new directory under `posts/`, with a short, url-friendly directory name.
 - Create an `index.md` (markdown) file in this new directory.
 - Write the post in Markdown.
   - The first line must be a `# Heading` and will determinate the full-length post title.
   - If the second line looks like `date: YYYY-MM-DD` (or any JS-valid time representation), the generator will use that to date the post - otherwise it uses the current date at build time.
   - `{{ URL }}` is replaced with the url to the post directory (used to link resources).
 - Run `./build.sh`.
 - Commit, push, and it's live!

<p align="center">
  <img src="{{ URL }}/res/cli.png" alt="Screenshot of build script output.">
</p>

## Static post generator script

#### Indexing

The generator script first crawls through each `posts/` subdirectory and builds an array containing one object for each post, built or unbuilt:

```js
let posts = [];

let postsDirs = fs.readdirSync('posts/', { withFileTypes: true });
postsDirs = postsDirs.filter(e => {
    // Do not parse template directories
    if (!e.name.startsWith('_template') && e.isDirectory()) return true;
    return false;
});

postsDirs.forEach(dir => {
    let url = `/posts/${dir.name}`;
    let content = fs.readdirSync(url.substr(1));

    // Detect unbuilt posts
    if (content.indexOf('index.html') === -1) {
        // Search for markdown source
        let mds = content.filter(file => {
            if (file.endsWith('.md')) return true;
            return false;
        });
        
        if (mds.length === 1) {
            // Retrieve info from markdown file
            let md = fs.readFileSync(url.substr(1)+'/'+mds[0], { encoding: 'utf-8' });
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
    let index = fs.readFileSync(url.substr(1)+'/index.html', { encoding: 'utf-8' });
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
```

As you can see it uses a bunch of regex to retrieve info from either the unbuilt Markdown source or the renderer HTML file. Here's what the array looks like at this point:

```js
[
  {
    title: 'New Post Example',
    date: Date.now(),
    url: 'posts/new-post',
    unbuilt: true,
    src: '(Markdown file)'
  },
  {
    title: 'Introducing Mr.Worldwide',
    date: Date('Sun Jan 20 2019'),
    url: '/posts/mr-worldwide',
    unbuilt: false
  }
]
```

This array is sorted so that newer posts will have lower indexes; which will be useful later for making the blog homepage, and sidebar menus.

```js
posts.sort((a, b) => {
    // Sort posts by timestamp
    return b.date.getTime() - a.date.getTime();
});
```

#### Building new posts

New posts (`unbuilt === true`) are rendered using a [template HTML file](https://github.com/GitSquared/gaby.dev/blob/c1bf2eff98373a1593c72206e8ffbc6228f172cf/posts/_template-post-dir/index.html) which has special strings like `{{ TITLE }}` and `{{ DATE }}`. These are replaced with the info retrieved above, using regex again.

Markdown is transformed into HTML using [`marked`](https://www.npmjs.com/package/marked).

```js
let postTemplate = fs.readFileSync('posts/_template-post-dir/index.html', { encoding: 'utf-8' });

posts.forEach(post => {
    // Skip already-built posts.
    if (!post.unbuilt) return;
    
    post.rendered = postTemplate;
    
    post.rendered = post.rendered.replace(/{{ TITLE }}/g, post.title)
                    .replace(/{{ DATE }}/g, post.date.toDateString())
                    .replace(/{{ POST }}/g, marked(post.src))
                    .replace(/{{ URL }}/g, post.url);
});
```

#### Updating navigation sidebars

Each post has a "Latest posts" menu in a sidebar. When new posts are added, the generator needs to rewrite this menu in all the previous posts to reflect the changes.

The HTML post template includes special comments around the relevant part of the sidebar:
```html
<!-- POSTS_LINKS -->
    <a href="/post/new-post">
      <li>New post!</li>
    </a>
<!-- POSTS_LINKS -->
```

This makes it easy to search-and-replace the links:


```js
posts.forEach(post => {
    if (!post.unbuilt) {
        // Populate post.rendered with the already-built HTML file
        post.rendered = await fs.readFile(post.url.substr(1)+'/index.html', { encoding: 'utf-8' });
    }

    // Build the new posts links HTML
    // Add the special POSTS_LINKS comments at the beginnind and end of the string,
    // otherwise they will be deleted on search-and-replace
    let previousPosts = '\n<!-- POSTS_LINKS -->\n';
    
    posts.forEach(lpost => {
        // Disable link for the current post
        let link = (lpost.url === post.url) ? 'disabled class="current-post"' : `href="${lpost.url}"`;

        previousPosts += `<a ${link}>
            <li>
                <h4>${lpost.date.toDateString()}</h4><br><h1>${lpost.title}</h1>
            </li>
        </a>`;
    });
    
    previousPosts += '\n<!-- POSTS_LINKS -->\n';

    // Replace the old links with the new ones                      ▼▼▼▼▼▼ ---- This means "every character" (non-whitespace + whitespace)
    post.rendered = post.rendered.replace(/\n<!-- POSTS_LINKS -->\n([\s\S]*)\n<!-- POSTS_LINKS -->\n/g, previousPosts);
});
```

#### Creating the blog homepage

The blog index/homepage (at `posts/index.html`) also has its own [template](https://github.com/GitSquared/gaby.dev/blob/c1bf2eff98373a1593c72206e8ffbc6228f172cf/posts/_template-index.html), with a `{{ POSTS_LINKS }}` string inside.

```js
let indexTemplate = fs.readFileSync('posts/_template-index.html', { encoding: 'utf-8' });

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
```

#### Saving everything

The script now has a `post` array containing one object for each post, where `post.rendered` is the new or updated HTML file, and an `index` string which has the HTML code for the blog homepage.
The only thing left is to save everything to disk!

```js
fs.writeFileSync('posts/index.html', index, { encoding: 'utf-8' });

posts.forEach(post => {
    fs.writeFileSync(post.url.substr(1)+'/index.html', post.rendered, { encoding: 'utf-8' });
});
```

## Footnote

I voluntarily removed some quality-of-life code from the snippets in this post to keep it clear and simple.
If you're interested into using this for your own site or playing around with it, check out the [latest source](https://github.com/GitSquared/gaby.dev/blob/master/_tools/buildPosts.js).


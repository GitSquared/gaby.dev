## gaby.dev

This is my personal website which hosts a bunch of links to my public online accounts, my resume, and a blog for when I feel like sharing something.

It also has a bunch of handy short-url redirects, like `gaby.dev/edex`.

It's all static html+css hosted on ZEIT's Now, because there is no need for anything else.

There is a Node.js script in `_tools` which parses the `posts` folder to render Markdown articles in HTML, following a template in `posts/_template-post-dir`.
It also updates posts links accross all pages and is capable of importing timestamps from markdown files.

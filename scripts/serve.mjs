import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const publicDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const port = Number.parseInt(process.env.PORT ?? '3000', 10)

const contentTypes = {
	'.asc': 'application/pgp-keys',
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.jpg': 'image/jpeg',
	'.js': 'text/javascript; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml'
}

const server = createServer(async (request, response) => {
	try {
		const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
		let filePath = resolve(publicDirectory, `.${pathname}`)

		if (filePath !== publicDirectory && !filePath.startsWith(`${publicDirectory}${sep}`)) {
			response.writeHead(400).end('Bad request')
			return
		}

		try {
			if ((await stat(filePath)).isDirectory()) filePath = join(filePath, 'index.html')
			await stat(filePath)
		} catch {
			filePath = join(publicDirectory, '404.html')
			response.statusCode = 404
		}

		response.setHeader('Content-Type', contentTypes[extname(filePath)] ?? 'application/octet-stream')
		createReadStream(filePath).pipe(response)
	} catch {
		response.writeHead(400).end('Bad request')
	}
})

server.listen(port, () => {
	console.log(`Serving gaby.dev at http://localhost:${port}`)
})

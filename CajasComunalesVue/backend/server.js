const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist', 'server.js');

if (fs.existsSync(distPath)) {
	import('./dist/server.js').catch(err => {
		console.error('Error importing dist/server.js:', err);
		process.exit(1);
	});
} else {
	const isDev = process.env.NODE_ENV !== 'production';
	if (isDev) {
		try {
			// Try to enable ts-node to run TypeScript sources directly in development
			require('ts-node/register');
			import('./src/server.ts').catch((err) => {
				console.error('Error importing src/server.ts:', err);
				process.exit(1);
			});
		} catch (err) {
			console.error('ts-node not available. Use `npm run dev` or build with `npm run build`.', err);
			process.exit(1);
		}
	} else {
		console.error('Built server not found at dist/server.js. Please run `npm run build` before starting in production.');
		process.exit(1);
	}
}

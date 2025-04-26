const fs = require('fs');
const path = require('path');

// Recursively get all HTML files in a directory
function getAllHtmlFiles(dirPath, arrayOfFiles) {
	const files = fs.readdirSync(dirPath);

	arrayOfFiles = arrayOfFiles || [];

	files.forEach(file => {
		const fullPath = path.join(dirPath, file);
		if (fs.statSync(fullPath).isDirectory()) {
			arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
		} else if (path.extname(file) === '.html') {
			arrayOfFiles.push(fullPath);
		}
	});

	return arrayOfFiles;
}

// Switch between dev and prod modes
function switchMode(mode) {
	const htmlFiles = getAllHtmlFiles('./examples');

	htmlFiles.forEach(file => {
		let content = fs.readFileSync(file, 'utf8');

		if (mode === 'dev') {
			content = content.replace(
				/\/styles\/vanilla-combined\.min\.css">/g,
				'/styles/main.css">'
			);
		} else if (mode === 'prod') {
			content = content.replace(
				/\/styles\/main\.css">/g,
				'/styles/vanilla-combined.min.css">'
			);
		}

		fs.writeFileSync(file, content);
	});
}

// Get mode from command line argument
const mode = process.argv[2];
if (mode !== 'dev' && mode !== 'prod') {
	console.error('Please specify mode: dev or prod');
	process.exit(1);
}

switchMode(mode);
console.log(`Switched to ${mode} mode`);
const fs = require('fs');
const path = require('path');

// Function to recursively get all HTML files
function getAllHtmlFiles(dirPath, arrayOfFiles) {
	const files = fs.readdirSync(dirPath);

	arrayOfFiles = arrayOfFiles || [];

	files.forEach(file => {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllHtmlFiles(dirPath + "/" + file, arrayOfFiles);
		} else if (path.extname(file) === '.html') {
			arrayOfFiles.push(path.join(dirPath, file));
		}
	});

	return arrayOfFiles;
}

// Function to switch between dev and prod modes
function switchMode(mode) {
	const htmlFiles = getAllHtmlFiles('./examples');

	htmlFiles.forEach(file => {
		let content = fs.readFileSync(file, 'utf8');

		if (mode === 'dev') {
			content = content.replace(
				/\/styles\/vanilla-combined.min.css">/g,
				'/styles/main.css">'
			);
		} else if (mode === 'prod') {
			content = content.replace(
				/\/styles\/main.css">/g,
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
const fs = require('fs');
const path = require('path');

const frontendSrcPath = path.join(__dirname, 'frontend/src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === 'dist') return;
        const result = path.join(dir, file);
        if (fs.statSync(result).isDirectory()) {
            results = results.concat(walk(result));
        } else if (result.endsWith('.jsx')) {
            results.push(result);
        }
    });
    return results;
}

const files = walk(frontendSrcPath);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Global Main Layout Wrappers -> 100% Width
    content = content.replace(/max-w-7xl/g, 'w-full');
    
    // 2. Expand Admin Panels Specifically
    if (file.includes('Admin') && !file.includes('AdminLayout')) {
        content = content.replace(/max-w-5xl/g, 'w-full');
        content = content.replace(/max-w-4xl/g, 'w-full');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Widened File: ${path.basename(file)}`);
    }
});

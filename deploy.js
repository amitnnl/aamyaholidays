const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Starting cPanel Production Build Pipeline...");

const frontendSrcPath = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) return;
        const result = path.join(dir, file);
        if (fs.statSync(result).isDirectory()) {
            results = results.concat(walk(result));
        } else if (result.endsWith('.jsx') || result.endsWith('.js') || result.endsWith('.php')) {
            results.push(result);
        }
    });
    return results;
}

// 1. Replace Frontend API Paths to Dynamic Output
const files = walk(frontendSrcPath);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Turn "http://localhost/aamya_holiday/backend/public/api" into Dynamic Wrapper resolving natively!
    content = content.replace(/'http:\/\/localhost\/aamya_holiday\/backend\/public\/api(.*?)'/g, "((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api$1' : '/backend/public/api$1')");

    // Replace backtick instances
    content = content.replace(/`http:\/\/localhost\/aamya_holiday\/backend\/public\/api(.*?)`/g, "`${(window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api' : '/backend/public/api'}$1`");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Rewritten API bindings for: ${path.basename(file)}`);
    }
});

// 2. Add specific file to copy over for React Router on Apache (cPanel standard)
const htaccessPath = path.join(__dirname, 'frontend', 'public', '.htaccess');
const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;
if (!fs.existsSync(path.dirname(htaccessPath))) fs.mkdirSync(path.dirname(htaccessPath), { recursive: true });
fs.writeFileSync(htaccessPath, htaccessContent);

// 3. Compile the Production Build!
console.log("Compiling optimized Vite static assets...");
execSync('npm run build', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

// 4. Archive mapping for final deployment
console.log("Build successful. Generating final push structure.");
execSync('git add . && git commit -m "Automated cPanel Deploy Overhaul" && git push', { cwd: __dirname, stdio: 'inherit' });

console.log("Done! API endpoints are natively dynamic and GitHub is 100% updated.");

const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { existsSync } = require('node:fs');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { promisify } = require('node:util');

const chrome = process.env.CHROME_PATH || [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
].find((candidate) => existsSync(candidate));
const root = path.resolve(__dirname, '..');

test('todo UI regression scenarios in Chrome', { skip: !chrome && 'Set CHROME_PATH to run browser checks', timeout: 30000 }, async () => {
    const profile = await mkdtemp(path.join(os.tmpdir(), 'engaged-todo-tests-'));
    const server = http.createServer(async (request, response) => {
        try {
            const pathname = new URL(request.url, 'http://localhost').pathname;
            const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
            if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
            let content = await readFile(file);
            if (file === path.join(root, 'index.html')) {
                content = content.toString().replace('<head>', '<head><script>window.todoBrowserErrors = []; window.addEventListener("error", event => window.todoBrowserErrors.push(event.message));</script>')
                    .replace('</body>', '<script src="/tests/todos.browser.js"></script></body>');
            }
            const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream';
            response.writeHead(200, { 'Content-Type': type }).end(content);
        } catch { response.writeHead(404).end(); }
    });
    try {
        await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
        const args = ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking',
            '--disable-sync', '--hide-scrollbars', '--window-size=540,900', `--user-data-dir=${profile}`, '--virtual-time-budget=7000', '--dump-dom'];
        if (process.env.TODO_SCREENSHOT_PATH) args.push(`--screenshot=${process.env.TODO_SCREENSHOT_PATH}`);
        args.push(`http://127.0.0.1:${server.address().port}/`);
        const { stdout } = await promisify(execFile)(chrome, args, { timeout: 20000, maxBuffer: 5 * 1024 * 1024 });
        const encoded = stdout.match(/data-todo-test-result="([^"]+)"/);
        assert.ok(encoded, 'Browser checks did not finish. Inspect browser console errors.');
        const report = JSON.parse(Buffer.from(encoded[1], 'base64').toString());
        assert.deepEqual(report.errors, [], 'App initialization should have no JavaScript errors');
        const failures = report.results.filter((result) => !result.passed);
        assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
        assert.equal(report.results.length, 12);
    } finally {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
        await rm(profile, { recursive: true, force: true });
    }
});

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectName = process.argv[2] || 'my-api-project';
const projectPath = path.join(process.cwd(), projectName);

const files = {
    'package.json': `{
  "name": "${projectName}",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "latest"
  }
}`,
    'server.js': `const express = require('express');
const loadRoutes = require('./api/router');

const app = express();
const PORT = 3000;

app.use(express.json());
loadRoutes(app);

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});`,
    'api/router.js': `const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    const apiDir = path.join(__dirname);
    fs.readdirSync(apiDir).forEach(file => {
        if (file !== 'router.js' && file.endsWith('.js')) {
            const route = require(path.join(apiDir, file));
            const routeName = '/' + file.replace('.js', '');
            app.use(routeName, route);
        }
    });
};`,
    'api/user.js': `const express = require('express');
const router = express.Router();

/**
 * @openapi
 * /user:
 *   get:
 *     description: Returns a user endpoint
 *     responses:
 *       200:
 *         description: A user object
 */
router.get('/', (req, res) => {
    res.json({ message: 'User endpoint' });
});

module.exports = router;`
};

function createProject() {
    if (fs.existsSync(projectPath)) {
        console.error('Error: Project folder already exists.');
        process.exit(1);
    }

    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'api'));

    for (const [file, content] of Object.entries(files)) {
        const filePath = path.join(projectPath, file);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
    }

    console.log('Example project created!');
    console.log(`Run:
    cd ${projectName}
    npm install
    node server.js`);
}

function scanRoutes(directory, baseRoute = '') {
    let routes = [];
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        const routePath = `${baseRoute}/${file.replace('.js', '')}`;

        if (fs.statSync(fullPath).isDirectory()) {
            routes = routes.concat(scanRoutes(fullPath, routePath));
        } else if (file.endsWith('.js') && file !== 'router.js') {
            routes.push(routePath);
        }
    });
    return routes;
}

function getRouteMethod(routeFile) {
    if (!fs.existsSync(routeFile)) return [];

    const content = fs.readFileSync(routeFile, 'utf8');
    let methods = [];

    if (content.includes("router.get(")) methods.push("get");
    if (content.includes("router.post(")) methods.push("post");
    if (content.includes("router.put(")) methods.push("put");
    if (content.includes("router.delete(")) methods.push("delete");

    return methods;
}

function generateAPIClient(routes, outputPath, baseURL) {
    const clientCode = `class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const response = await fetch(
            \`\${this.baseURL}\${endpoint}\`,
            { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }
        );
        return response.json();
    }

${routes
    .map(route => {
        const routeFile = path.join(process.cwd(), 'api', route.replace(/\//g, path.sep) + '.js');
        const methods = getRouteMethod(routeFile);

        return methods
            .map(method => `    async ${route.replace(/\//g, '_').replace('-', '_')}_${method}() {
        return this.request('${route}', { method: '${method.toUpperCase()}' });
    }`)
            .join('\n');
    })
    .join('\n')}
}

export default new APIClient('${baseURL}');`;

    fs.writeFileSync(outputPath, clientCode);
    console.log(`API client generated at ${outputPath}`);
}

function generateDocs() {
    const apiDir = path.join(process.cwd(), 'api');
    if (!fs.existsSync(apiDir)) {
        console.error('Error: API directory does not exist.');
        process.exit(1);
    }

    const routes = scanRoutes(apiDir);
    let docContent = '# API Documentation\n\n## Endpoints\n';

    routes.forEach(route => {
        docContent += `### \`${route}\`\n- **GET**: Fetch data from ${route}\n- **POST**: Send data to ${route}\n- **PUT**: Update data at ${route}\n- **DELETE**: Remove data at ${route}\n\n`;
    });

    fs.writeFileSync(path.join(process.cwd(), 'API_DOCS.md'), docContent);
    console.log('API_DOCS.md generated successfully.');
}

if (process.argv[2] === 'export-routes') {
    const apiDir = path.join(process.cwd(), 'api');
    const routes = scanRoutes(apiDir);
    const outputPath = path.join(process.cwd(), 'apiClient.js');
    const baseURL = process.argv[3] || 'http://localhost:3000';
    generateAPIClient(routes, outputPath, baseURL);
} else if (process.argv[2] === 'generate-docs') {
    generateDocs();
} else {
    createProject();
}

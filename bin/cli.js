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

createProject();
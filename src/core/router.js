const express = require('express');
const fs = require('fs');
const path = require('path');

class APIRouter {
    constructor(apiDir) {
        this.apiDir = apiDir;
    }

    registerRoutes(app) {
        this._loadRoutes(app, this.apiDir, '');
    }

    _loadRoutes(app, directory, baseRoute) {
        fs.readdirSync(directory).forEach(file => {
            const fullPath = path.join(directory, file);
            const routePath = `${baseRoute}/${file.replace('.js', '')}`;
            
            if (fs.statSync(fullPath).isDirectory()) {
                this._loadRoutes(app, fullPath, routePath);
            } else if (file.endsWith('.js')) {
                const route = require(fullPath);
                const router = express.Router();
                
                if (typeof route === 'function') {
                    route(router);
                    app.use(routePath, router);
                } else {
                    app.use(routePath, route);
                }
            }
        });
    }
}

module.exports = APIRouter;